#!/usr/bin/env bash
# Create enhanced views with security classification and radio type detection
# Based on recreate_location_details_asof.sh

set -euo pipefail

PG_DB="${1:-sigint}"

echo "[*] Creating enhanced views in database: $PG_DB"

psql -v ON_ERROR_STOP=1 -d "$PG_DB" <<'SQL'
-- Enhanced location details with security classification
DROP VIEW IF EXISTS app.location_details_asof CASCADE;

CREATE VIEW app.location_details_asof AS
WITH location_base AS (
  -- Get location observations with network metadata
  SELECT 
    obs.id,
    obs.bssid,
    obs.level,
    obs.lat, obs.lon,
    COALESCE(obs.extra_json->>'altitude', '0')::double precision AS altitude,
    COALESCE(obs.extra_json->>'accuracy', '0')::double precision AS accuracy,
    obs.time_ms as time,
    COALESCE((obs.extra_json->>'external')::integer, 0) AS external,
    COALESCE((obs.extra_json->>'mfgrid')::integer, 0) AS mfgrid,
    -- Get network details at time of observation
    net.ssid AS ssid_at_time,
    net.frequency AS frequency_at_time,
    obs.capabilities AS capabilities_at_time,
    net.last_seen_ms AS ssid_lasttime
  FROM app.observation_history obs
  LEFT JOIN app.network_unified_raw net ON net.bssid = obs.bssid
  WHERE obs.origin = 'location'
),
radio_classified AS (
  SELECT lb.*,
    -- Radio type classification
    CASE
      WHEN lb.capabilities_at_time ILIKE 'NR;%' THEN 'Cell/NR'
      WHEN lb.capabilities_at_time ILIKE 'LTE;%' THEN 'Cell/LTE'
      WHEN lb.capabilities_at_time ILIKE 'WCDMA;%' THEN 'Cell/WCDMA'
      WHEN lb.capabilities_at_time ILIKE 'GSM;%' THEN 'Cell/GSM'
      WHEN lb.capabilities_at_time ILIKE 'CDMA;%' THEN 'Cell/CDMA'
      WHEN lb.capabilities_at_time ILIKE 'IWLAN;%' THEN 'Cell/IWLAN'
      WHEN lb.capabilities_at_time ILIKE 'LoRa;%' THEN 'LoRa'
      WHEN lb.capabilities_at_time ILIKE '802.15.4;%' OR lb.capabilities_at_time ILIKE 'Zigbee;%' THEN 'Zigbee'
      WHEN lb.capabilities_at_time ILIKE 'GPS;%' OR lb.capabilities_at_time ILIKE 'GNSS;%' THEN 'GNSS'
      -- WiFi frequency detection
      WHEN lb.frequency_at_time BETWEEN 2400 AND 2500 THEN 'WiFi'
      WHEN lb.frequency_at_time BETWEEN 4900 AND 5900 THEN 'WiFi'
      WHEN lb.frequency_at_time BETWEEN 5925 AND 7125 THEN 'WiFi'
      ELSE 'Other'
    END AS radio_short
  FROM location_base lb
),
security_classified AS (
  SELECT rc.*,
    -- Security classification (WiFi only)
    CASE
      WHEN rc.radio_short <> 'WiFi' THEN '—'
      WHEN rc.capabilities_at_time ILIKE '%SAE%' THEN 'WPA3-P'
      WHEN rc.capabilities_at_time ILIKE '%WPA3%' AND rc.capabilities_at_time ILIKE '%EAP%' THEN 'WPA3-E'
      WHEN rc.capabilities_at_time ILIKE '%WPA2-%PSK%' OR rc.capabilities_at_time ILIKE '%RSN-%PSK%' THEN 'WPA2-P'
      WHEN rc.capabilities_at_time ILIKE '%WPA2%' AND rc.capabilities_at_time ILIKE '%EAP%' THEN 'WPA2-E'
      WHEN rc.capabilities_at_time ILIKE '%WPA-%PSK%' THEN 'WPA-P'
      WHEN rc.capabilities_at_time ILIKE '%OWE%' THEN 'OWE'
      WHEN rc.capabilities_at_time ILIKE '%WEP%' THEN 'WEP'
      WHEN (rc.capabilities_at_time ILIKE '%[ESS]%' AND
            rc.capabilities_at_time NOT ILIKE '%RSN%' AND
            rc.capabilities_at_time NOT ILIKE '%WPA%' AND
            rc.capabilities_at_time NOT ILIKE '%OWE%' AND
            rc.capabilities_at_time NOT ILIKE '%WEP%')
        OR (rc.capabilities_at_time IS NULL OR rc.capabilities_at_time = '')
        THEN 'Open'
      ELSE 'Unknown'
    END AS security_short,
    
    -- Cipher detection (WiFi only)
    CASE
      WHEN rc.radio_short <> 'WiFi' THEN ''
      ELSE TRIM(BOTH '+' FROM CONCAT_WS('+',
        CASE WHEN rc.capabilities_at_time ILIKE '%CCMP%' THEN 'C' END,
        CASE WHEN rc.capabilities_at_time ILIKE '%TKIP%' THEN 'T' END,
        CASE WHEN rc.capabilities_at_time ILIKE '%GCMP%' THEN 'G' END
      ))
    END AS cipher_short,
    
    -- Additional flags (WiFi only)
    CASE
      WHEN rc.radio_short <> 'WiFi' THEN ''
      ELSE TRIM(BOTH ', ' FROM CONCAT_WS(', ',
        CASE WHEN rc.capabilities_at_time ILIKE '%MFPR%' THEN 'M+' END,
        CASE WHEN rc.capabilities_at_time ILIKE '%MFPC%' THEN 'M' END,
        CASE WHEN rc.capabilities_at_time ILIKE '%OWE_TRANSITION%' THEN 'Tr' END,
        CASE WHEN rc.capabilities_at_time ILIKE '%WPS%' THEN 'WPS' END
      ))
    END AS flags_short
  FROM radio_classified rc
)
SELECT 
  id, bssid, level, lat, lon, altitude, accuracy, time, external, mfgrid,
  ssid_at_time, frequency_at_time, capabilities_at_time, ssid_lasttime,
  radio_short, security_short, cipher_short, flags_short
FROM security_classified;

-- Create summary statistics view
CREATE OR REPLACE VIEW app.network_summary_v AS
SELECT 
  count(*) as total_networks,
  count(DISTINCT bssid) as unique_bssids,
  count(*) FILTER (WHERE ssid IS NOT NULL AND ssid <> '') as networks_with_ssid,
  count(*) FILTER (WHERE lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180) as networks_with_location,
  array_agg(DISTINCT unnest(sources)) as all_sources,
  min(first_seen_ms) as earliest_observation_ms,
  max(last_seen_ms) as latest_observation_ms
FROM app.network_unified_raw;

-- Create spatial analysis helpers
CREATE OR REPLACE FUNCTION app.networks_within_radius(
  center_lat double precision,
  center_lon double precision, 
  radius_meters double precision
) RETURNS TABLE (
  bssid text,
  ssid text,
  distance_meters double precision,
  lat double precision,
  lon double precision
) AS $$
SELECT 
  n.bssid,
  n.ssid,
  ST_Distance(
    ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(n.lon, n.lat), 4326)::geography
  ) as distance_meters,
  n.lat,
  n.lon
FROM app.network_unified_raw n
WHERE n.lat BETWEEN -90 AND 90 
  AND n.lon BETWEEN -180 AND 180
  AND ST_DWithin(
    ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(n.lon, n.lat), 4326)::geography,
    radius_meters
  )
ORDER BY distance_meters;
$$ LANGUAGE sql;

SQL

echo "✅ Enhanced views created successfully!"
echo "   Test with: psql -d $PG_DB -c 'SELECT radio_short, security_short, count(*) FROM app.location_details_asof GROUP BY 1,2 ORDER BY 3 DESC LIMIT 10;'"
