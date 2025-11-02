-- ============================================================================
-- Migration: WiGLE Alpha v3 API Cache Schema (SIMPLIFIED)
-- Description: Store raw observations like locations_legacy, cluster at query time
-- Author: ShadowCheck SIGINT Platform
-- Date: 2025-11-01
-- ============================================================================

BEGIN;

-- Drop the overly complex clustered schema
DROP TABLE IF EXISTS app.wigle_observations CASCADE;
DROP TABLE IF EXISTS app.wigle_location_clusters CASCADE;
DROP TABLE IF EXISTS app.wigle_alpha_v3_networks CASCADE;
DROP TABLE IF EXISTS app.wigle_networks_archive CASCADE;
DROP TABLE IF EXISTS app.wigle_query_snapshots CASCADE;

-- ============================================================================
-- Simple schema matching legacy pattern
-- ============================================================================

-- Network metadata (like networks_legacy)
CREATE TABLE IF NOT EXISTS app.wigle_alpha_v3_networks (
    wigle_network_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,

    -- Network metadata from Alpha v3
    ssid TEXT,
    name TEXT,
    type TEXT,
    encryption TEXT,
    channel INTEGER,
    frequency INTEGER,
    bcninterval INTEGER,

    -- Trilaterated position (from Alpha v3 root)
    trilaterated_lat DOUBLE PRECISION,
    trilaterated_lon DOUBLE PRECISION,
    best_cluster_qos INTEGER,

    -- Temporal bounds (from Alpha v3 root)
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    last_update TIMESTAMP,

    -- Street address (from Alpha v3 root)
    street_address JSONB,

    -- Flags
    freenet TEXT,
    dhcp TEXT,
    paynet TEXT,
    comment TEXT,

    -- Query metadata
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint: one entry per BSSID per query
    CONSTRAINT unique_bssid_query UNIQUE(bssid, query_timestamp)
);

CREATE INDEX idx_alpha_v3_networks_bssid ON app.wigle_alpha_v3_networks(bssid);
CREATE INDEX idx_alpha_v3_networks_query_time ON app.wigle_alpha_v3_networks(query_timestamp);
CREATE INDEX idx_alpha_v3_networks_location ON app.wigle_alpha_v3_networks USING GIST(
    ST_SetSRID(ST_MakePoint(trilaterated_lon, trilaterated_lat), 4326)
) WHERE trilaterated_lat IS NOT NULL AND trilaterated_lon IS NOT NULL;

COMMENT ON TABLE app.wigle_alpha_v3_networks IS
'WiGLE Alpha v3 network metadata - stores top-level network info from Alpha v3 API.
 This is like networks_legacy but from Alpha v3 queries.';

-- Individual observations (like locations_legacy)
CREATE TABLE IF NOT EXISTS app.wigle_alpha_v3_observations (
    observation_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,

    -- Location data
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,

    -- Temporal data
    observation_time TIMESTAMP,
    last_update TIMESTAMP,
    month_bucket TEXT,

    -- Network state at observation (THIS IS KEY - SSID can change!)
    ssid TEXT,
    name TEXT,

    -- Signal data
    signal_dbm INTEGER,
    noise INTEGER,
    snr INTEGER,

    -- Radio data
    channel INTEGER,
    frequency INTEGER,
    encryption_value TEXT,
    wep TEXT,

    -- WiGLE metadata
    wigle_net_id TEXT,

    -- Query metadata
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Validation
    CONSTRAINT valid_observation_coords CHECK (
        lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_signal CHECK (signal_dbm IS NULL OR signal_dbm BETWEEN -120 AND 0)
);

CREATE INDEX idx_alpha_v3_obs_bssid ON app.wigle_alpha_v3_observations(bssid);
CREATE INDEX idx_alpha_v3_obs_location ON app.wigle_alpha_v3_observations USING GIST(
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)
);
CREATE INDEX idx_alpha_v3_obs_time ON app.wigle_alpha_v3_observations(observation_time) WHERE observation_time IS NOT NULL;
CREATE INDEX idx_alpha_v3_obs_ssid ON app.wigle_alpha_v3_observations(ssid) WHERE ssid IS NOT NULL;
CREATE INDEX idx_alpha_v3_obs_month ON app.wigle_alpha_v3_observations(month_bucket) WHERE month_bucket IS NOT NULL;

COMMENT ON TABLE app.wigle_alpha_v3_observations IS
'WiGLE Alpha v3 raw observations - stores ALL individual GPS+signal measurements.
 This is like locations_legacy but with SSID preserved per observation.
 Clustering happens at QUERY TIME, not import time.';

-- ============================================================================
-- Import function (simplified - just flatten and insert)
-- ============================================================================

CREATE OR REPLACE FUNCTION app.import_wigle_alpha_v3_response(
    p_bssid TEXT,
    p_alpha_v3_json JSONB
)
RETURNS TABLE(networks_imported INTEGER, observations_imported INTEGER) AS $$
DECLARE
    v_network_id BIGINT;
    v_networks_imported INTEGER := 0;
    v_observations_imported INTEGER := 0;
    v_cluster JSONB;
    v_location JSONB;
BEGIN
    -- Insert network metadata (root level from Alpha v3)
    INSERT INTO app.wigle_alpha_v3_networks (
        bssid,
        ssid,
        name,
        type,
        encryption,
        channel,
        frequency,
        bcninterval,
        trilaterated_lat,
        trilaterated_lon,
        best_cluster_qos,
        first_seen,
        last_seen,
        last_update,
        street_address,
        freenet,
        dhcp,
        paynet,
        comment,
        query_timestamp
    ) VALUES (
        p_bssid,
        p_alpha_v3_json->>'name',
        p_alpha_v3_json->>'name',
        p_alpha_v3_json->>'type',
        p_alpha_v3_json->>'encryption',
        (p_alpha_v3_json->>'channel')::INTEGER,
        (p_alpha_v3_json->>'frequency')::INTEGER,
        (p_alpha_v3_json->>'bcninterval')::INTEGER,
        (p_alpha_v3_json->>'trilateratedLatitude')::DOUBLE PRECISION,
        (p_alpha_v3_json->>'trilateratedLongitude')::DOUBLE PRECISION,
        (p_alpha_v3_json->>'bestClusterWiGLEQoS')::INTEGER,
        (p_alpha_v3_json->>'firstSeen')::TIMESTAMP,
        (p_alpha_v3_json->>'lastSeen')::TIMESTAMP,
        (p_alpha_v3_json->>'lastUpdate')::TIMESTAMP,
        p_alpha_v3_json->'streetAddress',
        p_alpha_v3_json->>'freenet',
        p_alpha_v3_json->>'dhcp',
        p_alpha_v3_json->>'paynet',
        p_alpha_v3_json->>'comment',
        NOW()
    ) RETURNING wigle_network_id INTO v_network_id;

    v_networks_imported := 1;

    -- Flatten ALL observations from ALL clusters into individual rows
    FOR v_cluster IN SELECT * FROM jsonb_array_elements(p_alpha_v3_json->'locationClusters')
    LOOP
        FOR v_location IN SELECT * FROM jsonb_array_elements(v_cluster->'locations')
        LOOP
            INSERT INTO app.wigle_alpha_v3_observations (
                bssid,
                lat,
                lon,
                altitude,
                accuracy,
                observation_time,
                last_update,
                month_bucket,
                ssid,
                name,
                signal_dbm,
                noise,
                snr,
                channel,
                frequency,
                encryption_value,
                wep,
                wigle_net_id,
                query_timestamp
            ) VALUES (
                p_bssid,
                (v_location->>'latitude')::DOUBLE PRECISION,
                (v_location->>'longitude')::DOUBLE PRECISION,
                (v_location->>'alt')::DOUBLE PRECISION,
                (v_location->>'accuracy')::DOUBLE PRECISION,
                (v_location->>'time')::TIMESTAMP,
                (v_location->>'lastupdt')::TIMESTAMP,
                v_location->>'month',
                v_location->>'ssid',  -- THIS IS KEY - SSID per observation!
                v_location->>'name',
                (v_location->>'signal')::INTEGER,
                (v_location->>'noise')::INTEGER,
                (v_location->>'snr')::INTEGER,
                (v_location->>'channel')::INTEGER,
                (v_location->>'frequency')::INTEGER,
                v_location->>'encryptionValue',
                v_location->>'wep',
                v_location->>'netId',
                NOW()
            );

            v_observations_imported := v_observations_imported + 1;
        END LOOP;
    END LOOP;

    -- Update enrichment queue
    UPDATE app.bssid_enrichment_queue
    SET status = 'completed',
        processed_at = NOW(),
        wigle_records_found = v_networks_imported,
        wigle_locations_found = v_observations_imported
    WHERE bssid = p_bssid
      AND status IN ('pending', 'processing');

    RETURN QUERY SELECT v_networks_imported, v_observations_imported;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.import_wigle_alpha_v3_response IS
'Imports WiGLE Alpha v3 JSON response by flattening ALL observations into individual rows.
 No clustering is done at import time - that happens at query time.
 This matches the pattern of locations_legacy: one row per GPS observation.';

-- ============================================================================
-- Query-time clustering view (dynamic SSID clustering)
-- ============================================================================

CREATE OR REPLACE VIEW app.wigle_alpha_v3_ssid_clusters AS
WITH home_location AS (
    SELECT location_point AS home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
),
ssid_observation_stats AS (
    SELECT
        o.bssid,
        o.ssid,
        COUNT(*) as observation_count,
        MIN(o.observation_time) as first_seen,
        MAX(o.observation_time) as last_seen,
        COUNT(DISTINCT DATE(o.observation_time)) as days_observed,
        AVG(o.lat) as centroid_lat,
        AVG(o.lon) as centroid_lon,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(o.lon, o.lat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0) as max_distance_from_home_km,
        AVG(o.signal_dbm) as avg_signal
    FROM app.wigle_alpha_v3_observations o
    CROSS JOIN home_location h
    GROUP BY o.bssid, o.ssid
)
SELECT
    bssid,
    ssid,
    observation_count,
    first_seen,
    last_seen,
    days_observed,
    centroid_lat,
    centroid_lon,
    max_distance_from_home_km,
    avg_signal,
    CASE
        WHEN observation_count = 1 THEN 'single_observation'
        WHEN max_distance_from_home_km > 50 THEN 'mobile_hotspot'
        WHEN max_distance_from_home_km > 5 THEN 'mobile'
        WHEN max_distance_from_home_km < 1 THEN 'stationary'
        ELSE 'local'
    END as mobility_pattern,
    CASE
        WHEN max_distance_from_home_km >= 50 THEN 'EXTREME'
        WHEN max_distance_from_home_km >= 10 THEN 'CRITICAL'
        WHEN max_distance_from_home_km >= 5 THEN 'HIGH'
        WHEN max_distance_from_home_km >= 2 THEN 'MEDIUM'
        ELSE 'LOW'
    END as threat_level
FROM ssid_observation_stats;

COMMENT ON VIEW app.wigle_alpha_v3_ssid_clusters IS
'Dynamic SSID clustering computed at query time from raw observations.
 Groups observations by BSSID + SSID to detect SSID changes for same MAC.
 Calculates mobility patterns and threat levels on-the-fly.';

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_alpha_v3_networks TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_alpha_v3_observations TO shadowcheck_user;
GRANT SELECT ON app.wigle_alpha_v3_ssid_clusters TO shadowcheck_user;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_user;

COMMIT;

-- ============================================================================
-- Test import
-- ============================================================================
-- \set alpha_v3_json `cat /home/nunya/shadowcheck/response_1762039938542.json`
-- SELECT * FROM app.import_wigle_alpha_v3_response('CA:99:B2:1E:55:13', :'alpha_v3_json'::JSONB);
--
-- -- Verify import
-- SELECT * FROM app.wigle_alpha_v3_networks WHERE bssid = 'CA:99:B2:1E:55:13';
-- SELECT COUNT(*) FROM app.wigle_alpha_v3_observations WHERE bssid = 'CA:99:B2:1E:55:13';
--
-- -- Check SSID clustering (dynamic!)
-- SELECT * FROM app.wigle_alpha_v3_ssid_clusters WHERE bssid = 'CA:99:B2:1E:55:13';
