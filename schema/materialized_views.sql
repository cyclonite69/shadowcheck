-- Materialized View: Unified Network Observations
-- Purpose: Combine legacy and KML location data to cover orphaned networks
-- This view provides a complete picture of all network observations across both data sources

-- Drop existing materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS app.mv_unified_network_observations CASCADE;

-- Create unified network observations view
CREATE MATERIALIZED VIEW app.mv_unified_network_observations AS
-- Legacy locations (primary source)
SELECT
    'legacy' as data_source,
    l.unified_id as observation_id,
    l.bssid,
    NULL::text as ssid,  -- Legacy locations don't have SSID
    l.lat,
    l.lon,
    l.altitude,
    l.accuracy,
    l.level as signal_level,
    l.time as timestamp_ms,
    to_timestamp(l.time / 1000.0) as timestamp_dt,
    l.source_id,
    ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326) as location_point,
    NULL::text as kml_filename
FROM app.locations_legacy l
WHERE l.lat IS NOT NULL
  AND l.lon IS NOT NULL
  AND l.lat BETWEEN -90 AND 90
  AND l.lon BETWEEN -180 AND 180
  AND NOT (l.lat = 0 AND l.lon = 0)  -- Exclude Null Island

UNION ALL

-- KML locations (fills gaps for orphaned networks)
SELECT
    'kml' as data_source,
    k.kml_obs_id as observation_id,
    k.bssid,
    k.ssid,
    k.lat,
    k.lon,
    k.altitude,
    k.accuracy,
    k.level as signal_level,
    k.time as timestamp_ms,
    to_timestamp(k.time / 1000.0) as timestamp_dt,
    k.source_id,
    ST_SetSRID(ST_MakePoint(k.lon, k.lat), 4326) as location_point,
    k.kml_filename
FROM app.kml_locations_staging k
WHERE k.lat IS NOT NULL
  AND k.lon IS NOT NULL
  AND k.lat BETWEEN -90 AND 90
  AND k.lon BETWEEN -180 AND 180
  AND NOT (k.lat = 0 AND k.lon = 0);  -- Exclude Null Island

-- Create indexes for performance
CREATE INDEX idx_mv_unified_obs_bssid ON app.mv_unified_network_observations(bssid);
CREATE INDEX idx_mv_unified_obs_source ON app.mv_unified_network_observations(data_source);
CREATE INDEX idx_mv_unified_obs_location ON app.mv_unified_network_observations USING GIST(location_point);
CREATE INDEX idx_mv_unified_obs_timestamp ON app.mv_unified_network_observations(timestamp_dt);
CREATE INDEX idx_mv_unified_obs_bssid_timestamp ON app.mv_unified_network_observations(bssid, timestamp_dt);

COMMENT ON MATERIALIZED VIEW app.mv_unified_network_observations IS
'Unified view of all network observations from legacy and KML sources.
Provides location coverage for networks that may be orphaned in legacy tables.';

-- Create a companion view for network-level aggregation
DROP MATERIALIZED VIEW IF EXISTS app.mv_unified_networks CASCADE;

CREATE MATERIALIZED VIEW app.mv_unified_networks AS
WITH network_observations AS (
    SELECT
        bssid,
        ssid,
        data_source,
        lat,
        lon,
        signal_level,
        timestamp_dt,
        location_point
    FROM app.mv_unified_network_observations
),
legacy_networks AS (
    SELECT
        n.bssid,
        n.ssid,
        n.frequency,
        n.capabilities,
        n.type as network_type,
        n.lasttime,
        n.lastlat,
        n.lastlon,
        n.bestlevel,
        'legacy' as primary_source
    FROM app.networks_legacy n
),
kml_networks AS (
    SELECT
        k.bssid,
        k.ssid,
        k.frequency,
        k.capabilities,
        k.network_type,
        k.last_seen as lasttime,
        NULL::double precision as lastlat,
        NULL::double precision as lastlon,
        NULL::integer as bestlevel,
        'kml' as primary_source
    FROM app.kml_networks_staging k
)
SELECT
    COALESCE(ln.bssid, kn.bssid) as bssid,
    COALESCE(ln.ssid, kn.ssid) as ssid,
    COALESCE(ln.frequency, kn.frequency) as frequency,
    COALESCE(ln.capabilities, kn.capabilities) as capabilities,
    COALESCE(ln.network_type, kn.network_type) as network_type,
    COALESCE(ln.primary_source, kn.primary_source) as primary_source,
    CASE
        WHEN ln.bssid IS NOT NULL AND kn.bssid IS NOT NULL THEN 'both'
        WHEN ln.bssid IS NOT NULL THEN 'legacy'
        ELSE 'kml_only'
    END as source_coverage,
    ln.lasttime,
    ln.lastlat,
    ln.lastlon,
    ln.bestlevel,
    (SELECT COUNT(*) FROM network_observations no WHERE no.bssid = COALESCE(ln.bssid, kn.bssid)) as total_observations,
    (SELECT COUNT(*) FROM network_observations no WHERE no.bssid = COALESCE(ln.bssid, kn.bssid) AND no.data_source = 'legacy') as legacy_observations,
    (SELECT COUNT(*) FROM network_observations no WHERE no.bssid = COALESCE(ln.bssid, kn.bssid) AND no.data_source = 'kml') as kml_observations,
    (SELECT MIN(timestamp_dt) FROM network_observations no WHERE no.bssid = COALESCE(ln.bssid, kn.bssid)) as first_seen_dt,
    (SELECT MAX(timestamp_dt) FROM network_observations no WHERE no.bssid = COALESCE(ln.bssid, kn.bssid)) as last_seen_dt
FROM legacy_networks ln
FULL OUTER JOIN kml_networks kn ON ln.bssid = kn.bssid;

-- Create indexes
CREATE INDEX idx_mv_unified_networks_bssid ON app.mv_unified_networks(bssid);
CREATE INDEX idx_mv_unified_networks_source ON app.mv_unified_networks(source_coverage);
CREATE INDEX idx_mv_unified_networks_type ON app.mv_unified_networks(network_type);

COMMENT ON MATERIALIZED VIEW app.mv_unified_networks IS
'Network-level view combining legacy and KML network metadata with observation counts.
Shows which networks have observations in which data sources.';

-- Refresh function for convenience
CREATE OR REPLACE FUNCTION app.refresh_unified_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_unified_network_observations;
    REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_unified_networks;
    RAISE NOTICE 'Materialized views refreshed successfully';
END;
$$;

COMMENT ON FUNCTION app.refresh_unified_views() IS
'Refreshes all unified materialized views. Call after importing new KML data or legacy updates.';
