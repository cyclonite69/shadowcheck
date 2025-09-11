-- Suggested Database Views for API Optimization
-- Run these as the database owner (postgres user) to create optimized views

-- 1. Unified Networks View for API Consistency
-- This view bridges the gap between the normalized schema and API expectations
CREATE OR REPLACE VIEW app.api_networks_unified AS
WITH network_with_latest AS (
  SELECT 
    n.id as network_id,
    n.bssid,
    n.first_seen_at,
    n.last_seen_at,
    n.current_ssid,
    n.current_frequency,
    n.current_capabilities,
    -- Get latest observation details
    no.signal_strength,
    no.observed_at,
    no.frequency_at_time,
    no.capabilities_at_time,
    -- Get latest location
    l.latitude,
    l.longitude,
    l.altitude,
    l.accuracy,
    -- Enrichment
    CASE 
      WHEN n.current_frequency BETWEEN 2400 AND 2500 THEN '2.4GHz'
      WHEN n.current_frequency BETWEEN 5000 AND 6000 THEN '5GHz'  
      WHEN n.current_frequency BETWEEN 6000 AND 7125 THEN '6GHz'
      ELSE 'Unknown'
    END as band,
    -- Calculate channel from frequency
    CASE 
      WHEN n.current_frequency BETWEEN 2412 AND 2484 THEN 
        CASE 
          WHEN n.current_frequency = 2412 THEN 1
          WHEN n.current_frequency = 2417 THEN 2
          WHEN n.current_frequency = 2422 THEN 3
          WHEN n.current_frequency = 2427 THEN 4
          WHEN n.current_frequency = 2432 THEN 5
          WHEN n.current_frequency = 2437 THEN 6
          WHEN n.current_frequency = 2442 THEN 7
          WHEN n.current_frequency = 2447 THEN 8
          WHEN n.current_frequency = 2452 THEN 9
          WHEN n.current_frequency = 2457 THEN 10
          WHEN n.current_frequency = 2462 THEN 11
          WHEN n.current_frequency = 2467 THEN 12
          WHEN n.current_frequency = 2472 THEN 13
          WHEN n.current_frequency = 2484 THEN 14
          ELSE NULL
        END
      WHEN n.current_frequency BETWEEN 5000 AND 6000 THEN 
        ((n.current_frequency - 5000) / 5)
      ELSE NULL
    END as channel,
    ROW_NUMBER() OVER (PARTITION BY n.id ORDER BY no.observed_at DESC) as rn
  FROM app.networks n
  LEFT JOIN app.network_observations no ON n.id = no.network_id
  LEFT JOIN app.locations l ON no.location_id = l.id
)
SELECT 
  network_id as id,
  bssid,
  current_ssid as ssid,
  signal_strength,
  current_frequency as frequency,
  frequency_at_time,
  current_capabilities as encryption,
  capabilities_at_time,
  latitude,
  longitude,
  altitude,
  accuracy,
  observed_at,
  last_seen_at,
  first_seen_at,
  band,
  channel
FROM network_with_latest 
WHERE rn = 1;

-- Grant access to application user
GRANT SELECT ON app.api_networks_unified TO shadowcheck_app;

-- 2. Network Observations with Enrichment
-- Optimized view for the /api/v1/networks endpoints
CREATE OR REPLACE VIEW app.api_network_observations_enriched AS
WITH enriched_obs AS (
  SELECT 
    no.id,
    n.bssid,
    no.signal_strength as level,
    l.latitude as lat,
    l.longitude as lon,
    l.altitude,
    l.accuracy,
    EXTRACT(EPOCH FROM no.observed_at) * 1000 as time,
    EXTRACT(EPOCH FROM no.observed_at) * 1000 as time_epoch_ms,
    to_char(no.observed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as time_iso,
    COALESCE(no.ssid_at_time, n.current_ssid) as ssid_at_time,
    COALESCE(no.frequency_at_time, n.current_frequency) as frequency_at_time,
    no.frequency_at_time as frequency_mhz,
    COALESCE(no.capabilities_at_time, n.current_capabilities) as capabilities_at_time,
    -- Channel calculation
    CASE 
      WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 2412 AND 2484 THEN 
        CASE 
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2412 THEN 1
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2417 THEN 2
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2422 THEN 3
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2427 THEN 4
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2432 THEN 5
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2437 THEN 6
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2442 THEN 7
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2447 THEN 8
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2452 THEN 9
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2457 THEN 10
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2462 THEN 11
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2467 THEN 12
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2472 THEN 13
          WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2484 THEN 14
          ELSE NULL
        END
      WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 5000 AND 6000 THEN 
        ((COALESCE(no.frequency_at_time, n.current_frequency) - 5000) / 5)
      ELSE NULL
    END as channel,
    -- Band calculation
    CASE 
      WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 2400 AND 2500 THEN '2.4GHz'
      WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 5000 AND 6000 THEN '5GHz'  
      WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 6000 AND 7125 THEN '6GHz'
      ELSE NULL
    END as band,
    -- Radio type detection
    'WiFi' as radio_short,
    -- Security analysis
    CASE 
      WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA3%' THEN 'WPA3'
      WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA2%' THEN 'WPA2'
      WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA%' THEN 'WPA'
      WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WEP%' THEN 'WEP'
      WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) = '' OR COALESCE(no.capabilities_at_time, n.current_capabilities) IS NULL THEN 'Open'
      ELSE 'Unknown'
    END as security_short,
    -- Additional fields for compatibility
    NULL::text as cipher_short,
    NULL::text as flags_short
  FROM app.network_observations no
  JOIN app.networks n ON no.network_id = n.id
  JOIN app.locations l ON no.location_id = l.id
)
SELECT * FROM enriched_obs
ORDER BY time DESC;

-- Grant access to application user
GRANT SELECT ON app.api_network_observations_enriched TO shadowcheck_app;

-- 3. Spatial Networks View for PostGIS queries
-- Optimized for /api/v1/within endpoint
CREATE OR REPLACE VIEW app.api_networks_spatial AS
WITH spatial_networks AS (
  SELECT 
    n.id,
    n.bssid,
    n.current_ssid as ssid,
    no.signal_strength,
    n.current_frequency as frequency,
    n.current_capabilities as encryption,
    no.observed_at,
    l.latitude,
    l.longitude,
    l.altitude,
    l.accuracy,
    -- Create PostGIS point geometry for spatial queries
    ST_SetSRID(ST_MakePoint(l.longitude::double precision, l.latitude::double precision), 4326) as geom,
    ROW_NUMBER() OVER (PARTITION BY n.id ORDER BY no.observed_at DESC) as rn
  FROM app.networks n
  JOIN app.network_observations no ON n.id = no.network_id
  JOIN app.locations l ON no.location_id = l.id
  WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
)
SELECT 
  id,
  bssid,
  ssid,
  signal_strength,
  frequency,
  encryption,
  observed_at,
  latitude,
  longitude,
  altitude,
  accuracy,
  geom
FROM spatial_networks 
WHERE rn = 1;

-- Grant access to application user
GRANT SELECT ON app.api_networks_spatial TO shadowcheck_app;

-- 4. Analytics View for Dashboard APIs
CREATE OR REPLACE VIEW app.api_network_analytics AS
SELECT 
  COUNT(DISTINCT n.bssid) as total_networks,
  COUNT(DISTINCT n.current_ssid) as unique_ssids,
  COUNT(DISTINCT l.device_id) as unique_devices,
  AVG(no.signal_strength) as avg_signal_strength,
  MIN(no.signal_strength) as min_signal_strength,
  MAX(no.signal_strength) as max_signal_strength,
  COUNT(*) as total_observations,
  MIN(no.observed_at) as first_observation,
  MAX(no.observed_at) as last_observation,
  -- Security breakdown
  SUM(CASE WHEN n.current_capabilities ILIKE '%WPA3%' THEN 1 ELSE 0 END) as wpa3_networks,
  SUM(CASE WHEN n.current_capabilities ILIKE '%WPA2%' THEN 1 ELSE 0 END) as wpa2_networks,
  SUM(CASE WHEN n.current_capabilities ILIKE '%WPA%' AND n.current_capabilities NOT ILIKE '%WPA2%' THEN 1 ELSE 0 END) as wpa_networks,
  SUM(CASE WHEN n.current_capabilities ILIKE '%WEP%' THEN 1 ELSE 0 END) as wep_networks,
  SUM(CASE WHEN n.current_capabilities = '' OR n.current_capabilities IS NULL THEN 1 ELSE 0 END) as open_networks,
  -- Band breakdown
  SUM(CASE WHEN n.current_frequency BETWEEN 2400 AND 2500 THEN 1 ELSE 0 END) as band_2_4ghz,
  SUM(CASE WHEN n.current_frequency BETWEEN 5000 AND 6000 THEN 1 ELSE 0 END) as band_5ghz,
  SUM(CASE WHEN n.current_frequency BETWEEN 6000 AND 7125 THEN 1 ELSE 0 END) as band_6ghz
FROM app.networks n
LEFT JOIN app.network_observations no ON n.id = no.network_id
LEFT JOIN app.locations l ON no.location_id = l.id;

-- Grant access to application user
GRANT SELECT ON app.api_network_analytics TO shadowcheck_app;

-- 5. Create location_details_enriched_normalized that matches the new schema
CREATE OR REPLACE VIEW app.location_details_enriched_normalized AS
SELECT 
  no.id,
  n.bssid,
  no.signal_strength as level,
  l.latitude::double precision as lat,
  l.longitude::double precision as lon,
  l.altitude::double precision,
  l.accuracy::double precision,
  EXTRACT(EPOCH FROM no.observed_at) * 1000 as time,
  EXTRACT(EPOCH FROM no.observed_at) * 1000 as time_epoch_ms,
  to_char(no.observed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as time_iso,
  0 as external,
  0 as mfgrid,
  COALESCE(no.ssid_at_time, n.current_ssid) as ssid_at_time,
  COALESCE(no.frequency_at_time, n.current_frequency) as frequency_at_time,
  no.frequency_at_time as frequency_mhz,
  -- Channel calculation
  CASE 
    WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 2412 AND 2484 THEN 
      CASE 
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2412 THEN 1
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2417 THEN 2
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2422 THEN 3
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2427 THEN 4
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2432 THEN 5
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2437 THEN 6
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2442 THEN 7
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2447 THEN 8
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2452 THEN 9
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2457 THEN 10
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2462 THEN 11
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2467 THEN 12
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2472 THEN 13
        WHEN COALESCE(no.frequency_at_time, n.current_frequency) = 2484 THEN 14
        ELSE NULL
      END
    WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 5000 AND 6000 THEN 
      ((COALESCE(no.frequency_at_time, n.current_frequency) - 5000) / 5)
    ELSE NULL
  END as channel,
  -- Band calculation
  CASE 
    WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 2400 AND 2500 THEN '2.4GHz'
    WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 5000 AND 6000 THEN '5GHz'  
    WHEN COALESCE(no.frequency_at_time, n.current_frequency) BETWEEN 6000 AND 7125 THEN '6GHz'
    ELSE NULL
  END as band,
  'WiFi' as radio_short,
  -- Security analysis
  CASE 
    WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA3%' THEN 'WPA3'
    WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA2%' THEN 'WPA2'
    WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WPA%' THEN 'WPA'
    WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) ILIKE '%WEP%' THEN 'WEP'
    WHEN COALESCE(no.capabilities_at_time, n.current_capabilities) = '' OR COALESCE(no.capabilities_at_time, n.current_capabilities) IS NULL THEN 'Open'
    ELSE 'Unknown'
  END as security_short,
  NULL::text as cipher_short,
  NULL::text as flags_short,
  COALESCE(no.capabilities_at_time, n.current_capabilities) as capabilities_at_time,
  EXTRACT(EPOCH FROM n.last_seen_at) * 1000 as ssid_lasttime,
  -- Cellular analysis (for future expansion)
  NULL::integer as cell_mcc,
  NULL::integer as cell_mnc,
  NULL::bigint as cell_cid,
  -- BLE service UUIDs (for future expansion) 
  NULL::text[] as ble_services
FROM app.network_observations no
JOIN app.networks n ON no.network_id = n.id
JOIN app.locations l ON no.location_id = l.id;

-- Grant access to application user
GRANT SELECT ON app.location_details_enriched_normalized TO shadowcheck_app;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_network_observations_time ON app.network_observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_networks_frequency ON app.networks(current_frequency);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON app.locations(latitude, longitude);

-- Analysis: These views solve several key issues:
-- 1. api_networks_unified: Provides consistent API response matching current expectations
-- 2. api_network_observations_enriched: Optimized for pagination and filtering
-- 3. api_networks_spatial: PostGIS-enabled spatial queries 
-- 4. api_network_analytics: Pre-aggregated analytics for dashboard performance
-- 5. location_details_enriched_normalized: Bridge between old view structure and new normalized schema