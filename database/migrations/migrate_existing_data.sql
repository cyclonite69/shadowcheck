-- Migration Script: Preserve All Historical Data
BEGIN;

-- Step 1: Migrate Networks (unique BSSIDs from both tables)
INSERT INTO app.networks (bssid, first_seen_at, last_seen_at, current_ssid, current_frequency, current_capabilities)
SELECT 
    COALESCE(n.bssid, l.bssid) as bssid,
    MIN(to_timestamp(COALESCE(l.time, n.lasttime) / 1000.0)) as first_seen_at,
    MAX(to_timestamp(COALESCE(l.time, n.lasttime) / 1000.0)) as last_seen_at,
    MAX(n.ssid) as current_ssid,
    MAX(n.frequency) as current_frequency,
    MAX(n.capabilities) as current_capabilities
FROM app.network n
FULL OUTER JOIN app.location l ON n.bssid = l.bssid
WHERE COALESCE(n.bssid, l.bssid) IS NOT NULL
GROUP BY COALESCE(n.bssid, l.bssid);

-- Step 2: Migrate Locations (each GPS observation)
INSERT INTO app.locations (latitude, longitude, altitude, accuracy, observed_at)
SELECT DISTINCT
    lat::decimal(10,8) as latitude,
    lon::decimal(11,8) as longitude,
    COALESCE(altitude, 0)::decimal(8,2) as altitude,
    COALESCE(accuracy, 0)::decimal(6,2) as accuracy,
    to_timestamp(time / 1000.0) as observed_at
FROM app.location
WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- Step 3: Create Network Observations (link everything together)
INSERT INTO app.network_observations (
    network_id, location_id, signal_strength, observed_at,
    ssid_at_time, frequency_at_time, capabilities_at_time
)
SELECT 
    new_n.id as network_id,
    new_l.id as location_id,
    old_l.level as signal_strength,
    to_timestamp(old_l.time / 1000.0) as observed_at,
    old_n.ssid as ssid_at_time,
    old_n.frequency as frequency_at_time,
    old_n.capabilities as capabilities_at_time
FROM app.location old_l
JOIN app.networks new_n ON new_n.bssid = old_l.bssid
JOIN app.locations new_l ON (
    new_l.latitude = old_l.lat::decimal(10,8) AND 
    new_l.longitude = old_l.lon::decimal(11,8) AND
    new_l.observed_at = to_timestamp(old_l.time / 1000.0)
)
LEFT JOIN app.network old_n ON old_n.bssid = old_l.bssid;

-- Step 4: Create initial state change records
INSERT INTO app.network_state_changes (network_id, ssid, frequency, capabilities, changed_at, change_type)
SELECT 
    new_n.id as network_id,
    old_n.ssid,
    old_n.frequency,
    old_n.capabilities,
    new_n.first_seen_at as changed_at,
    'create' as change_type
FROM app.networks new_n
JOIN app.network old_n ON old_n.bssid = new_n.bssid
WHERE old_n.ssid IS NOT NULL;

-- Step 5: Refresh materialized view
REFRESH MATERIALIZED VIEW app.networks_latest_state;

-- Step 6: Validation
SELECT 
    'Migration Results:' as summary,
    (SELECT COUNT(*) FROM app.networks) as new_networks,
    (SELECT COUNT(DISTINCT bssid) FROM app.network) as old_networks,
    (SELECT COUNT(*) FROM app.locations) as new_locations,
    (SELECT COUNT(*) FROM app.location) as old_locations,
    (SELECT COUNT(*) FROM app.network_observations) as new_observations;

COMMIT;
