-- ============================================================================
-- Migration: WiGLE Alpha v3 API Cache Schema
-- Description: Replace append-only staging tables with structured Alpha v3 cache
--              that supports SSID temporal tracking and location clustering
-- Author: ShadowCheck SIGINT Platform
-- Date: 2025-11-01
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Truncate and rename old staging tables
-- ============================================================================

-- Truncate old staging tables (no valuable data to preserve)
TRUNCATE TABLE app.wigle_api_networks_staging CASCADE;
TRUNCATE TABLE app.wigle_api_locations_staging CASCADE;

-- Rename to deprecated (keep structure for reference, will drop later)
ALTER TABLE app.wigle_api_networks_staging RENAME TO wigle_api_networks_staging_deprecated;
ALTER TABLE app.wigle_api_locations_staging RENAME TO wigle_api_locations_staging_deprecated;

-- ============================================================================
-- STEP 2: Create Alpha v3 cache tables
-- ============================================================================

-- Query snapshot tracking (for auditing and history)
CREATE TABLE IF NOT EXISTS app.wigle_query_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    query_type TEXT NOT NULL,  -- 'network_detail', 'search', 'bulk_refresh'
    bssids_updated TEXT[] NOT NULL,
    networks_updated INTEGER DEFAULT 0,
    locations_added INTEGER DEFAULT 0,
    clusters_added INTEGER DEFAULT 0,
    api_credits_used INTEGER DEFAULT 0,
    initiated_by TEXT,  -- 'pipeline', 'user:admin', 'cron', 'manual'
    notes TEXT,

    CONSTRAINT valid_query_type CHECK (query_type IN ('network_detail', 'search', 'bulk_refresh', 'manual'))
);

CREATE INDEX idx_wigle_snapshots_timestamp ON app.wigle_query_snapshots(snapshot_timestamp);
CREATE INDEX idx_wigle_snapshots_bssids ON app.wigle_query_snapshots USING GIN(bssids_updated);

COMMENT ON TABLE app.wigle_query_snapshots IS
'Tracks WiGLE API query history for auditing and rollback capability';

-- Main network cache (always has LATEST WiGLE Alpha v3 data for each BSSID)
CREATE TABLE IF NOT EXISTS app.wigle_alpha_v3_networks (
    wigle_network_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL UNIQUE,

    -- Network metadata (from Alpha v3 root level)
    ssid TEXT,
    name TEXT,  -- WiGLE 'name' field (usually null)
    network_type TEXT,  -- 'infra', 'adhoc', 'mesh', etc
    encryption TEXT,  -- 'wpa2', 'wpa3', 'wep', 'open'
    channel INTEGER,
    frequency INTEGER,  -- MHz
    bcninterval INTEGER,  -- Beacon interval

    -- Boolean flags from Alpha v3
    freenet TEXT,  -- '?', 'Y', 'N'
    dhcp TEXT,     -- '?', 'Y', 'N'
    paynet TEXT,   -- '?', 'Y', 'N'

    -- Trilaterated position (weighted centroid of all observations)
    trilaterated_lat DOUBLE PRECISION,
    trilaterated_lon DOUBLE PRECISION,
    best_cluster_qos INTEGER,  -- WiGLE Quality of Service score (0-7)

    -- Temporal bounds (across ALL observations)
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    last_update TIMESTAMP,

    -- Reverse geocoding (from Alpha v3 streetAddress)
    street_address JSONB,  -- {road, housenumber, city, region, country, postalcode}

    -- User comment (from Alpha v3)
    comment TEXT,

    -- Raw API response for complete data preservation
    raw_api_response JSONB,

    -- ShadowCheck metadata
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    query_snapshot_id BIGINT REFERENCES app.wigle_query_snapshots(snapshot_id) ON DELETE SET NULL,
    record_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Validation constraints
    CONSTRAINT valid_trilaterated_coords CHECK (
        (trilaterated_lat IS NULL AND trilaterated_lon IS NULL) OR
        (trilaterated_lat BETWEEN -90 AND 90 AND trilaterated_lon BETWEEN -180 AND 180)
    ),
    CONSTRAINT valid_qos CHECK (best_cluster_qos IS NULL OR best_cluster_qos BETWEEN 0 AND 7),
    CONSTRAINT valid_mac_format CHECK (bssid ~ '^[0-9A-Fa-f:]{17}$')
);

CREATE INDEX idx_alpha_v3_networks_bssid ON app.wigle_alpha_v3_networks(bssid);
CREATE INDEX idx_alpha_v3_networks_query_time ON app.wigle_alpha_v3_networks(query_timestamp);
CREATE INDEX idx_alpha_v3_networks_location ON app.wigle_alpha_v3_networks USING GIST(
    ST_SetSRID(ST_MakePoint(trilaterated_lon, trilaterated_lat), 4326)
) WHERE trilaterated_lat IS NOT NULL AND trilaterated_lon IS NOT NULL;
CREATE INDEX idx_alpha_v3_networks_ssid ON app.wigle_alpha_v3_networks(ssid) WHERE ssid IS NOT NULL;

COMMENT ON TABLE app.wigle_alpha_v3_networks IS
'WiGLE Alpha v3 network cache - always contains LATEST data for each BSSID.
 Replaces old data on refresh. This is the single source of truth for WiGLE data.';

-- Location clusters table (SSID temporal tracking - INTEL GOLD!)
CREATE TABLE IF NOT EXISTS app.wigle_location_clusters (
    cluster_id BIGSERIAL PRIMARY KEY,
    wigle_network_id BIGINT NOT NULL REFERENCES app.wigle_alpha_v3_networks(wigle_network_id) ON DELETE CASCADE,

    -- Cluster metadata
    cluster_ssid TEXT,  -- SSID observed at this cluster (KEY for temporal tracking)
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    cluster_score INTEGER,  -- WiGLE cluster quality score
    days_observed_count INTEGER,  -- Number of unique days this SSID was seen

    -- Temporal bounds for this SSID at this location cluster
    min_last_update TIMESTAMP,
    max_last_update TIMESTAMP,

    -- Observation count
    location_count INTEGER DEFAULT 0,

    -- Validation constraints
    CONSTRAINT valid_cluster_coords CHECK (
        centroid_lat BETWEEN -90 AND 90 AND centroid_lon BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_days_observed CHECK (days_observed_count IS NULL OR days_observed_count >= 0)
);

CREATE INDEX idx_wigle_clusters_network ON app.wigle_location_clusters(wigle_network_id);
CREATE INDEX idx_wigle_clusters_ssid ON app.wigle_location_clusters(cluster_ssid) WHERE cluster_ssid IS NOT NULL;
CREATE INDEX idx_wigle_clusters_location ON app.wigle_location_clusters USING GIST(
    ST_SetSRID(ST_MakePoint(centroid_lon, centroid_lat), 4326)
);
CREATE INDEX idx_wigle_clusters_score ON app.wigle_location_clusters(cluster_score DESC) WHERE cluster_score IS NOT NULL;

COMMENT ON TABLE app.wigle_location_clusters IS
'Location clusters grouped by SSID and geography. CRITICAL for SSID temporal tracking.
 Example: MAC CA:99:B2:1E:55:13 has 2 SSIDs (Delta3G in Flint, Whitman1968 mobile across MI).
 This table makes that pattern detectable and queryable.';

-- Individual observations table (all location data points from Alpha v3)
CREATE TABLE IF NOT EXISTS app.wigle_observations (
    observation_id BIGSERIAL PRIMARY KEY,
    cluster_id BIGINT NOT NULL REFERENCES app.wigle_location_clusters(cluster_id) ON DELETE CASCADE,
    wigle_network_id BIGINT NOT NULL REFERENCES app.wigle_alpha_v3_networks(wigle_network_id) ON DELETE CASCADE,

    -- Location data (from Alpha v3 locations array)
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,  -- meters (Alpha v3: 'alt')
    accuracy DOUBLE PRECISION,  -- meters

    -- Temporal data
    observation_time TIMESTAMP,  -- Alpha v3: 'time'
    last_update TIMESTAMP,       -- Alpha v3: 'lastupdt'
    month_bucket TEXT,           -- Alpha v3: 'month' (e.g., '202406')

    -- Network state at this observation
    ssid TEXT,
    signal_dbm INTEGER,
    noise INTEGER,
    snr INTEGER,  -- Signal-to-Noise Ratio
    channel INTEGER,
    frequency INTEGER,
    encryption_value TEXT,  -- Alpha v3: 'encryptionValue'

    -- WiGLE metadata
    wigle_net_id TEXT,  -- Alpha v3: 'netId' (WiGLE's internal observation ID)
    name TEXT,          -- Alpha v3: 'name' (usually null)
    wep TEXT,           -- Alpha v3: 'wep' (encryption type code)

    -- Validation constraints
    CONSTRAINT valid_observation_coords CHECK (
        lat BETWEEN -90 AND 90 AND lon BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_signal CHECK (signal_dbm IS NULL OR signal_dbm BETWEEN -120 AND 0)
);

CREATE INDEX idx_wigle_obs_cluster ON app.wigle_observations(cluster_id);
CREATE INDEX idx_wigle_obs_network ON app.wigle_observations(wigle_network_id);
CREATE INDEX idx_wigle_obs_location ON app.wigle_observations USING GIST(
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)
);
CREATE INDEX idx_wigle_obs_time ON app.wigle_observations(observation_time) WHERE observation_time IS NOT NULL;
CREATE INDEX idx_wigle_obs_ssid ON app.wigle_observations(ssid) WHERE ssid IS NOT NULL;
CREATE INDEX idx_wigle_obs_month ON app.wigle_observations(month_bucket) WHERE month_bucket IS NOT NULL;

COMMENT ON TABLE app.wigle_observations IS
'Individual WiGLE observation points. Each row is one GPS+signal measurement.
 For CA:99:B2:1E:55:13, this contains 937 observations across 2 SSIDs and 17 location clusters.
 This is the raw data that feeds threat detection and SSID timeline analysis.';

-- Historical archive (snapshots older than retention period)
CREATE TABLE IF NOT EXISTS app.wigle_networks_archive (
    LIKE app.wigle_alpha_v3_networks INCLUDING ALL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archive_reason TEXT
);

CREATE INDEX idx_wigle_archive_bssid ON app.wigle_networks_archive(bssid);
CREATE INDEX idx_wigle_archive_archived_at ON app.wigle_networks_archive(archived_at);

COMMENT ON TABLE app.wigle_networks_archive IS
'Historical archive of replaced WiGLE data. Kept for forensic analysis.
 Automatic archival happens before replacement to preserve history.';

-- ============================================================================
-- STEP 3: Create helper functions
-- ============================================================================

-- Function to replace WiGLE network data (called by import pipeline)
CREATE OR REPLACE FUNCTION app.replace_wigle_network_data(
    p_bssid TEXT,
    p_alpha_v3_response JSONB,
    p_initiated_by TEXT DEFAULT 'pipeline'
)
RETURNS BIGINT AS $$
DECLARE
    v_snapshot_id BIGINT;
    v_network_id BIGINT;
    v_old_network_id BIGINT;
    v_cluster_data JSONB;
    v_cluster_id BIGINT;
    v_location_data JSONB;
    v_clusters_added INTEGER := 0;
    v_locations_added INTEGER := 0;
BEGIN
    -- Create snapshot record
    INSERT INTO app.wigle_query_snapshots (
        query_type,
        bssids_updated,
        initiated_by,
        notes
    ) VALUES (
        'network_detail',
        ARRAY[p_bssid],
        p_initiated_by,
        'Alpha v3 network detail import'
    ) RETURNING snapshot_id INTO v_snapshot_id;

    -- Check if network already exists (for archival)
    SELECT wigle_network_id INTO v_old_network_id
    FROM app.wigle_alpha_v3_networks
    WHERE bssid = p_bssid;

    -- Archive old data if exists
    IF v_old_network_id IS NOT NULL THEN
        INSERT INTO app.wigle_networks_archive
        SELECT n.*, NOW(), 'Replaced with newer WiGLE data'
        FROM app.wigle_alpha_v3_networks n
        WHERE wigle_network_id = v_old_network_id;

        -- Delete old network (CASCADE will delete clusters and observations)
        DELETE FROM app.wigle_alpha_v3_networks WHERE wigle_network_id = v_old_network_id;
    END IF;

    -- Insert new network metadata
    INSERT INTO app.wigle_alpha_v3_networks (
        bssid,
        ssid,
        name,
        network_type,
        encryption,
        channel,
        frequency,
        bcninterval,
        freenet,
        dhcp,
        paynet,
        trilaterated_lat,
        trilaterated_lon,
        best_cluster_qos,
        first_seen,
        last_seen,
        last_update,
        street_address,
        comment,
        raw_api_response,
        query_snapshot_id
    ) VALUES (
        p_bssid,
        p_alpha_v3_response->>'name',  -- Note: Alpha v3 'name' is SSID
        p_alpha_v3_response->>'name',
        p_alpha_v3_response->>'type',
        p_alpha_v3_response->>'encryption',
        (p_alpha_v3_response->>'channel')::INTEGER,
        (p_alpha_v3_response->>'frequency')::INTEGER,
        (p_alpha_v3_response->>'bcninterval')::INTEGER,
        p_alpha_v3_response->>'freenet',
        p_alpha_v3_response->>'dhcp',
        p_alpha_v3_response->>'paynet',
        (p_alpha_v3_response->>'trilateratedLatitude')::DOUBLE PRECISION,
        (p_alpha_v3_response->>'trilateratedLongitude')::DOUBLE PRECISION,
        (p_alpha_v3_response->>'bestClusterWiGLEQoS')::INTEGER,
        (p_alpha_v3_response->>'firstSeen')::TIMESTAMP,
        (p_alpha_v3_response->>'lastSeen')::TIMESTAMP,
        (p_alpha_v3_response->>'lastUpdate')::TIMESTAMP,
        p_alpha_v3_response->'streetAddress',
        p_alpha_v3_response->>'comment',
        p_alpha_v3_response,
        v_snapshot_id
    ) RETURNING wigle_network_id INTO v_network_id;

    -- Process location clusters
    FOR v_cluster_data IN SELECT * FROM jsonb_array_elements(p_alpha_v3_response->'locationClusters')
    LOOP
        -- Insert cluster
        INSERT INTO app.wigle_location_clusters (
            wigle_network_id,
            cluster_ssid,
            centroid_lat,
            centroid_lon,
            cluster_score,
            days_observed_count,
            min_last_update,
            max_last_update,
            location_count
        ) VALUES (
            v_network_id,
            v_cluster_data->>'clusterSsid',
            (v_cluster_data->>'centroidLatitude')::DOUBLE PRECISION,
            (v_cluster_data->>'centroidLongitude')::DOUBLE PRECISION,
            (v_cluster_data->>'score')::INTEGER,
            (v_cluster_data->>'daysObservedCount')::INTEGER,
            (v_cluster_data->>'minLastUpdate')::TIMESTAMP,
            (v_cluster_data->>'maxLastUpdate')::TIMESTAMP,
            jsonb_array_length(v_cluster_data->'locations')
        ) RETURNING cluster_id INTO v_cluster_id;

        v_clusters_added := v_clusters_added + 1;

        -- Process individual observations in this cluster
        FOR v_location_data IN SELECT * FROM jsonb_array_elements(v_cluster_data->'locations')
        LOOP
            INSERT INTO app.wigle_observations (
                cluster_id,
                wigle_network_id,
                lat,
                lon,
                altitude,
                accuracy,
                observation_time,
                last_update,
                month_bucket,
                ssid,
                signal_dbm,
                noise,
                snr,
                channel,
                frequency,
                encryption_value,
                wigle_net_id,
                name,
                wep
            ) VALUES (
                v_cluster_id,
                v_network_id,
                (v_location_data->>'latitude')::DOUBLE PRECISION,
                (v_location_data->>'longitude')::DOUBLE PRECISION,
                (v_location_data->>'alt')::DOUBLE PRECISION,
                (v_location_data->>'accuracy')::DOUBLE PRECISION,
                (v_location_data->>'time')::TIMESTAMP,
                (v_location_data->>'lastupdt')::TIMESTAMP,
                v_location_data->>'month',
                v_location_data->>'ssid',
                (v_location_data->>'signal')::INTEGER,
                (v_location_data->>'noise')::INTEGER,
                (v_location_data->>'snr')::INTEGER,
                (v_location_data->>'channel')::INTEGER,
                (v_location_data->>'frequency')::INTEGER,
                v_location_data->>'encryptionValue',
                v_location_data->>'netId',
                v_location_data->>'name',
                v_location_data->>'wep'
            );

            v_locations_added := v_locations_added + 1;
        END LOOP;
    END LOOP;

    -- Update snapshot with counts
    UPDATE app.wigle_query_snapshots
    SET networks_updated = 1,
        clusters_added = v_clusters_added,
        locations_added = v_locations_added
    WHERE snapshot_id = v_snapshot_id;

    -- Update enrichment queue if this was a tagged BSSID
    UPDATE app.bssid_enrichment_queue
    SET status = 'completed',
        enriched_at = NOW(),
        notes = 'Enriched with WiGLE Alpha v3 data'
    WHERE bssid = p_bssid
      AND status IN ('pending', 'processing');

    RETURN v_network_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.replace_wigle_network_data IS
'Replaces existing WiGLE network data with fresh Alpha v3 API response.
 Archives old data before deletion. Call this from import pipeline.';

-- Function to archive old WiGLE data (cron job)
CREATE OR REPLACE FUNCTION app.archive_old_wigle_data(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(networks_archived INTEGER, clusters_archived INTEGER, observations_archived INTEGER) AS $$
DECLARE
    cutoff_date TIMESTAMP WITH TIME ZONE;
    nets_archived INTEGER := 0;
    clusts_archived INTEGER := 0;
    obs_archived INTEGER := 0;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;

    -- Count clusters and observations before deletion (CASCADE will delete them)
    SELECT COUNT(DISTINCT wlc.cluster_id)
    INTO clusts_archived
    FROM app.wigle_location_clusters wlc
    JOIN app.wigle_alpha_v3_networks wan ON wlc.wigle_network_id = wan.wigle_network_id
    WHERE wan.query_timestamp < cutoff_date;

    SELECT COUNT(*)
    INTO obs_archived
    FROM app.wigle_observations wo
    JOIN app.wigle_alpha_v3_networks wan ON wo.wigle_network_id = wan.wigle_network_id
    WHERE wan.query_timestamp < cutoff_date;

    -- Archive old networks (already done during replace, but catch any missed)
    WITH archived AS (
        INSERT INTO app.wigle_networks_archive
        SELECT n.*, NOW(), 'Automatic archive (data older than ' || days_to_keep || ' days)'
        FROM app.wigle_alpha_v3_networks n
        WHERE n.query_timestamp < cutoff_date
        RETURNING wigle_network_id
    )
    SELECT COUNT(*) INTO nets_archived FROM archived;

    -- Delete old networks (CASCADE deletes clusters and observations)
    DELETE FROM app.wigle_alpha_v3_networks
    WHERE query_timestamp < cutoff_date;

    RETURN QUERY SELECT nets_archived, clusts_archived, obs_archived;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.archive_old_wigle_data IS
'Archives and deletes WiGLE data older than specified days (default 30).
 Run this as a cron job to prevent unbounded growth.';

-- ============================================================================
-- STEP 4: Create views for backward compatibility
-- ============================================================================

-- View that mimics old wigle_api_networks_staging for compatibility
CREATE OR REPLACE VIEW app.wigle_api_networks_staging AS
SELECT
    wigle_network_id::BIGINT as wigle_api_net_id,
    bssid,
    ssid,
    frequency,
    encryption as capabilities,
    network_type as type,
    last_seen as lasttime,
    trilaterated_lat as lastlat,
    trilaterated_lon as lastlon,
    trilaterated_lat as trilat,
    trilaterated_lon as trilong,
    channel,
    best_cluster_qos as qos,
    NULL::TEXT as transid,
    first_seen as firsttime,
    street_address->>'country' as country,
    street_address->>'region' as region,
    street_address->>'city' as city,
    query_timestamp,
    raw_api_response as query_params,
    last_update as lastupdt,
    street_address->>'road' as road,
    street_address->>'housenumber' as housenumber,
    street_address->>'postalcode' as postalcode,
    NULL::BOOLEAN as userfound,
    NULL::INTEGER as device,
    NULL::TEXT as mfgr_id,
    name
FROM app.wigle_alpha_v3_networks;

COMMENT ON VIEW app.wigle_api_networks_staging IS
'Backward compatibility view - maps new Alpha v3 schema to old staging table structure';

-- View for basic location observations (without cluster context)
CREATE OR REPLACE VIEW app.wigle_api_locations_staging AS
SELECT
    observation_id::BIGINT as wigle_api_loc_id,
    wan.bssid,
    wo.lat,
    wo.lon,
    wo.altitude,
    wo.accuracy,
    wo.observation_time as time,
    wo.signal_dbm as signal_level,
    wan.query_timestamp,
    wan.raw_api_response as query_params
FROM app.wigle_observations wo
JOIN app.wigle_alpha_v3_networks wan ON wo.wigle_network_id = wan.wigle_network_id;

COMMENT ON VIEW app.wigle_api_locations_staging IS
'Backward compatibility view - maps new observations table to old staging structure';

-- ============================================================================
-- STEP 5: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_alpha_v3_networks TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_location_clusters TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_observations TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_query_snapshots TO shadowcheck_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE app.wigle_networks_archive TO shadowcheck_user;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO shadowcheck_user;

GRANT SELECT ON app.wigle_api_networks_staging TO shadowcheck_user;
GRANT SELECT ON app.wigle_api_locations_staging TO shadowcheck_user;

COMMIT;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Test with: SELECT * FROM app.replace_wigle_network_data('CA:99:B2:1E:55:13',
--                   (SELECT content FROM json_import WHERE file = 'response_1762039938542.json'))
-- 2. Verify: SELECT * FROM app.wigle_alpha_v3_networks WHERE bssid = 'CA:99:B2:1E:55:13'
-- 3. Check clusters: SELECT cluster_ssid, location_count FROM app.wigle_location_clusters
--                     WHERE wigle_network_id = (SELECT wigle_network_id FROM app.wigle_alpha_v3_networks
--                                                WHERE bssid = 'CA:99:B2:1E:55:13')
-- ============================================================================
