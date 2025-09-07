-- Update all views to use new normalized schema

-- Drop old views
DROP VIEW IF EXISTS app.location_details_enriched CASCADE;
DROP VIEW IF EXISTS app.location_details_enriched_v2 CASCADE;
DROP VIEW IF EXISTS app.location_details_enriched_cell CASCADE;
DROP VIEW IF EXISTS app.location_details_enriched_v5 CASCADE;
DROP VIEW IF EXISTS app.location_details_asof CASCADE;

-- Recreate location_details_enriched using new schema
CREATE VIEW app.location_details_enriched AS
SELECT 
    no.id,
    n.bssid,
    no.signal_strength as level,
    l.latitude::double precision as lat,
    l.longitude::double precision as lon,
    l.altitude::double precision,
    l.accuracy::double precision,
    EXTRACT(epoch FROM no.observed_at) * 1000 as time,
    0 as external,  -- Add if needed
    0 as mfgrid,    -- Add if needed
    
    -- Network state at observation time
    no.ssid_at_time,
    no.frequency_at_time,
    no.capabilities_at_time,
    EXTRACT(epoch FROM n.last_seen_at) * 1000 as ssid_lasttime,
    
    -- Radio classification
    CASE 
        WHEN no.frequency_at_time BETWEEN 2400 AND 2500 THEN 'WiFi'
        WHEN no.frequency_at_time BETWEEN 5000 AND 6000 THEN 'WiFi'
        WHEN no.frequency_at_time BETWEEN 6000 AND 7000 THEN 'WiFi'
        ELSE 'Other'
    END as radio_short,
    
    -- Security classification  
    CASE 
        WHEN no.capabilities_at_time ILIKE '%WPA3%' THEN 'WPA3-P'
        WHEN no.capabilities_at_time ILIKE '%WPA2%' THEN 'WPA2-P'
        WHEN no.capabilities_at_time ILIKE '%WPA%' THEN 'WPA-P'
        WHEN no.capabilities_at_time ILIKE '%WEP%' THEN 'WEP'
        WHEN no.capabilities_at_time ILIKE '%[ESS]%' THEN 'Open'
        ELSE 'Unknown'
    END as security_short,
    
    -- Cipher info
    CASE 
        WHEN no.capabilities_at_time ILIKE '%CCMP%' THEN 'C'
        WHEN no.capabilities_at_time ILIKE '%TKIP%' THEN 'T'
        ELSE ''
    END as cipher_short,
    
    -- Flags
    CASE 
        WHEN no.capabilities_at_time ILIKE '%WPS%' THEN 'WPS'
        ELSE ''
    END as flags_short,
    
    -- WiFi specific fields
    no.frequency_at_time as frequency_mhz,
    CASE 
        WHEN no.frequency_at_time BETWEEN 2412 AND 2484 THEN 
            ((no.frequency_at_time - 2412) / 5) + 1
        WHEN no.frequency_at_time BETWEEN 5170 AND 5825 THEN
            ((no.frequency_at_time - 5000) / 5)
        ELSE NULL
    END as channel,
    
    CASE 
        WHEN no.frequency_at_time BETWEEN 2400 AND 2500 THEN '2.4GHz'
        WHEN no.frequency_at_time BETWEEN 5000 AND 6000 THEN '5GHz'  
        WHEN no.frequency_at_time BETWEEN 6000 AND 7000 THEN '6GHz'
        ELSE NULL
    END as band,
    
    -- Cell fields (null for now, add if needed)
    NULL::integer as cell_mcc,
    NULL::integer as cell_mnc, 
    NULL::bigint as cell_cid

FROM app.network_observations no
JOIN app.networks n ON n.id = no.network_id
JOIN app.locations l ON l.id = no.location_id;

-- Create _v2 version for compatibility
CREATE VIEW app.location_details_enriched_v2 AS 
SELECT * FROM app.location_details_enriched;

-- Update latest location views to use new schema
DROP VIEW IF EXISTS app.latest_location_per_bssid CASCADE;
DROP TABLE IF EXISTS app.latest_location_per_bssid CASCADE;
DROP TABLE IF EXISTS app.latest_location_per_bssid_cell CASCADE;

-- Create as proper view using new schema
CREATE VIEW app.latest_location_per_bssid AS
SELECT 
    n.bssid,
    nls.last_latitude as lat,
    nls.last_longitude as lon,
    EXTRACT(epoch FROM n.last_seen_at) * 1000 as time
FROM app.networks n
JOIN app.networks_latest_state nls ON nls.id = n.id;

