-- Create materialized view for tests (using actual new schema)
DROP MATERIALIZED VIEW IF EXISTS app.latest_by_bssid_mv;
CREATE MATERIALIZED VIEW app.latest_by_bssid_mv AS
SELECT 
    n.bssid,
    n.current_ssid as ssid,
    n.last_seen_at as observed_at,
    nls.last_latitude as lat, 
    nls.last_longitude as lon
FROM app.networks n  
JOIN app.networks_latest_state nls ON nls.id = n.id;

-- Test the new structure
SELECT COUNT(*) as networks_count FROM app.networks;
SELECT COUNT(*) as observations_count FROM app.network_observations;
SELECT COUNT(*) as mv_count FROM app.latest_by_bssid_mv;
