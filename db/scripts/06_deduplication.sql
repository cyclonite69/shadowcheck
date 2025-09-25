-- ShadowCheck Database Refactor - Phase 6: Deduplication Framework
-- Multi-level deduplication with fingerprinting for cross-pipeline data matching
-- Handles datetime discrepancy between WiGLE app backup vs API responses

-- Observation Fingerprints (fuzzy temporal matching across pipelines)
CREATE TABLE app.observation_fingerprints (
    fingerprint_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),

    -- Deduplication fingerprint (deterministic hash)
    fingerprint_hash TEXT NOT NULL UNIQUE,  -- SHA256(bssid || round(timestamp/10) || round(signal/5))

    -- Fuzzy matching windows
    timestamp_window_start TIMESTAMPTZ NOT NULL,
    timestamp_window_end TIMESTAMPTZ NOT NULL,   -- ±10 seconds for datetime discrepancy
    signal_range_low SMALLINT,
    signal_range_high SMALLINT,                  -- ±5 dBm for signal variance

    -- Canonical observation (highest priority pipeline)
    canonical_observation_id BIGINT,  -- Points to "best" observation
    duplicate_observation_ids BIGINT[], -- Array of duplicate measurement IDs

    -- Pipeline priority (1=app_backup > 2=wigle_api > 3=kismet)
    canonical_data_source_id INTEGER REFERENCES app.data_sources(data_source_id),
    provenance_priority INTEGER NOT NULL,

    -- Quality metrics
    observation_count INTEGER DEFAULT 1,
    confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1),

    -- Spatial clustering (for BSSID collision detection)
    spatial_cluster_id INTEGER,

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BSSID Collision Detection (same MAC at different locations)
CREATE TABLE app.bssid_collision_analysis (
    collision_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL,

    -- Spatial clustering results
    location_cluster_count INTEGER NOT NULL,
    max_distance_between_clusters_meters NUMERIC(10,2),

    -- Statistical analysis
    observation_count INTEGER NOT NULL,
    cluster_confidence_score NUMERIC(3,2) CHECK (cluster_confidence_score BETWEEN 0 AND 1),

    -- Classification
    is_likely_collision BOOLEAN DEFAULT FALSE,  -- Same BSSID, different physical devices
    is_mobile_device BOOLEAN DEFAULT FALSE,     -- Single device moving around
    collision_type TEXT,  -- 'vendor_reuse', 'randomization', 'spoofing', 'mobile_device'

    -- Evidence
    cluster_details JSONB,  -- Array of {cluster_id, center_point, observation_count, time_range}
    analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Investigation
    verification_status app.verification_status_enum DEFAULT 'pending',
    analyst_notes TEXT,

    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate Detection Rules (configurable thresholds)
CREATE TABLE app.deduplication_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name TEXT NOT NULL UNIQUE,

    -- Matching criteria
    temporal_window_seconds INTEGER NOT NULL DEFAULT 10,  -- ±10 seconds
    signal_variance_dbm INTEGER NOT NULL DEFAULT 5,       -- ±5 dBm
    spatial_distance_meters NUMERIC(8,2) DEFAULT 50,      -- 50m radius

    -- Pipeline priorities
    pipeline_preferences JSONB DEFAULT '{"wigle_app_backup": 1, "wigle_api": 2, "kismet": 3}'::jsonb,

    -- Quality thresholds
    min_confidence_score NUMERIC(3,2) DEFAULT 0.7,

    -- Flags
    is_active BOOLEAN DEFAULT TRUE,
    auto_merge_duplicates BOOLEAN DEFAULT FALSE,

    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default deduplication rule
INSERT INTO app.deduplication_rules (rule_name, temporal_window_seconds, signal_variance_dbm)
VALUES ('default_cross_pipeline', 10, 5);

-- Functions for deduplication

-- Generate fingerprint hash for observation
CREATE OR REPLACE FUNCTION app.generate_fingerprint_hash(
    p_mac_address TEXT,
    p_timestamp TIMESTAMPTZ,
    p_signal_dbm SMALLINT
)
RETURNS TEXT AS $$
DECLARE
    normalized_timestamp BIGINT;
    normalized_signal SMALLINT;
    hash_input TEXT;
BEGIN
    -- Normalize timestamp to 10-second buckets
    normalized_timestamp := EXTRACT(EPOCH FROM p_timestamp)::BIGINT / 10;

    -- Normalize signal to 5 dBm buckets
    normalized_signal := (p_signal_dbm / 5) * 5;

    -- Create hash input
    hash_input := p_mac_address || '|' || normalized_timestamp::TEXT || '|' || normalized_signal::TEXT;

    -- Return SHA256 hash
    RETURN encode(digest(hash_input, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Find potential duplicates for new observation
CREATE OR REPLACE FUNCTION app.find_potential_duplicates(
    p_access_point_id BIGINT,
    p_timestamp TIMESTAMPTZ,
    p_signal_dbm SMALLINT,
    p_data_source_id INTEGER
)
RETURNS TABLE(
    existing_fingerprint_id BIGINT,
    existing_canonical_id BIGINT,
    temporal_distance_seconds INTEGER,
    signal_difference_dbm INTEGER,
    confidence_score NUMERIC
) AS $$
DECLARE
    rule RECORD;
BEGIN
    -- Get active deduplication rule
    SELECT * INTO rule FROM app.deduplication_rules WHERE is_active = TRUE LIMIT 1;

    RETURN QUERY
    SELECT
        of.fingerprint_id,
        of.canonical_observation_id,
        ABS(EXTRACT(EPOCH FROM (p_timestamp - of.timestamp_window_start))::INTEGER) as temporal_distance_seconds,
        ABS(p_signal_dbm - of.signal_range_low) as signal_difference_dbm,
        -- Confidence decreases with temporal and signal distance
        GREATEST(0.0,
            1.0 - (ABS(EXTRACT(EPOCH FROM (p_timestamp - of.timestamp_window_start))::NUMERIC) / rule.temporal_window_seconds) * 0.5
                - (ABS(p_signal_dbm - of.signal_range_low)::NUMERIC / rule.signal_variance_dbm) * 0.3
        )::NUMERIC(3,2) as confidence_score
    FROM app.observation_fingerprints of
    WHERE of.access_point_id = p_access_point_id
      AND p_timestamp BETWEEN
          of.timestamp_window_start - INTERVAL '1 second' * rule.temporal_window_seconds AND
          of.timestamp_window_end + INTERVAL '1 second' * rule.temporal_window_seconds
      AND ABS(p_signal_dbm - of.signal_range_low) <= rule.signal_variance_dbm * 2
    ORDER BY confidence_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Process new signal measurement for deduplication
CREATE OR REPLACE FUNCTION app.process_measurement_deduplication(
    p_measurement_id BIGINT,
    p_access_point_id BIGINT,
    p_timestamp TIMESTAMPTZ,
    p_signal_dbm SMALLINT,
    p_data_source_id INTEGER
)
RETURNS VOID AS $$
DECLARE
    fingerprint_hash TEXT;
    existing_fingerprint RECORD;
    potential_dup RECORD;
    canonical_priority INTEGER;
    existing_priority INTEGER;
    rule RECORD;
BEGIN
    -- Get active rule
    SELECT * INTO rule FROM app.deduplication_rules WHERE is_active = TRUE LIMIT 1;

    -- Generate fingerprint hash
    fingerprint_hash := app.generate_fingerprint_hash(
        (SELECT mac_address FROM app.wireless_access_points WHERE access_point_id = p_access_point_id),
        p_timestamp,
        p_signal_dbm
    );

    -- Check for exact fingerprint match
    SELECT * INTO existing_fingerprint
    FROM app.observation_fingerprints
    WHERE fingerprint_hash = fingerprint_hash;

    IF existing_fingerprint.fingerprint_id IS NOT NULL THEN
        -- Exact match found - add to duplicates
        UPDATE app.observation_fingerprints
        SET duplicate_observation_ids = array_append(duplicate_observation_ids, p_measurement_id),
            observation_count = observation_count + 1
        WHERE fingerprint_id = existing_fingerprint.fingerprint_id;

        -- Mark signal measurement as duplicate
        UPDATE app.signal_measurements
        SET is_canonical_observation = FALSE,
            duplicate_of_measurement_id = existing_fingerprint.canonical_observation_id,
            fingerprint_hash = fingerprint_hash
        WHERE measurement_id = p_measurement_id;

        RETURN;
    END IF;

    -- Look for fuzzy matches
    SELECT * INTO potential_dup
    FROM app.find_potential_duplicates(p_access_point_id, p_timestamp, p_signal_dbm, p_data_source_id)
    WHERE confidence_score >= rule.min_confidence_score
    LIMIT 1;

    IF potential_dup.existing_fingerprint_id IS NOT NULL THEN
        -- Fuzzy match found
        SELECT pipeline_priority INTO canonical_priority
        FROM app.data_sources WHERE data_source_id = p_data_source_id;

        SELECT pipeline_priority INTO existing_priority
        FROM app.observation_fingerprints of
        JOIN app.data_sources ds ON ds.data_source_id = of.canonical_data_source_id
        WHERE of.fingerprint_id = potential_dup.existing_fingerprint_id;

        IF canonical_priority < existing_priority THEN
            -- New observation has higher priority - replace canonical
            UPDATE app.observation_fingerprints
            SET canonical_observation_id = p_measurement_id,
                canonical_data_source_id = p_data_source_id,
                duplicate_observation_ids = array_append(duplicate_observation_ids, canonical_observation_id),
                observation_count = observation_count + 1
            WHERE fingerprint_id = potential_dup.existing_fingerprint_id;

            -- Update old canonical as duplicate
            UPDATE app.signal_measurements
            SET is_canonical_observation = FALSE,
                duplicate_of_measurement_id = p_measurement_id
            WHERE measurement_id = potential_dup.existing_canonical_id;
        ELSE
            -- Existing observation has higher priority - mark new as duplicate
            UPDATE app.observation_fingerprints
            SET duplicate_observation_ids = array_append(duplicate_observation_ids, p_measurement_id),
                observation_count = observation_count + 1
            WHERE fingerprint_id = potential_dup.existing_fingerprint_id;

            UPDATE app.signal_measurements
            SET is_canonical_observation = FALSE,
                duplicate_of_measurement_id = potential_dup.existing_canonical_id,
                fingerprint_hash = fingerprint_hash
            WHERE measurement_id = p_measurement_id;
        END IF;

        RETURN;
    END IF;

    -- No duplicates found - create new fingerprint
    INSERT INTO app.observation_fingerprints (
        access_point_id, fingerprint_hash,
        timestamp_window_start, timestamp_window_end,
        signal_range_low, signal_range_high,
        canonical_observation_id, canonical_data_source_id,
        provenance_priority
    ) VALUES (
        p_access_point_id, fingerprint_hash,
        p_timestamp - INTERVAL '1 second' * rule.temporal_window_seconds,
        p_timestamp + INTERVAL '1 second' * rule.temporal_window_seconds,
        p_signal_dbm - rule.signal_variance_dbm,
        p_signal_dbm + rule.signal_variance_dbm,
        p_measurement_id, p_data_source_id,
        (SELECT pipeline_priority FROM app.data_sources WHERE data_source_id = p_data_source_id)
    );

    -- Update signal measurement with fingerprint
    UPDATE app.signal_measurements
    SET fingerprint_hash = fingerprint_hash
    WHERE measurement_id = p_measurement_id;

END;
$$ LANGUAGE plpgsql;

-- Analyze BSSID collisions using spatial clustering
CREATE OR REPLACE FUNCTION app.analyze_bssid_collisions(p_mac_address TEXT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    ap_record RECORD;
    cluster_results RECORD;
BEGIN
    -- Process specific MAC or all MACs
    FOR ap_record IN
        SELECT mac_address, array_agg(access_point_id) as ap_ids
        FROM app.wireless_access_points
        WHERE (p_mac_address IS NULL OR mac_address = p_mac_address)
        GROUP BY mac_address
        HAVING count(*) > 1  -- Only MACs with multiple access points
    LOOP
        -- Spatial clustering analysis
        WITH position_clusters AS (
            SELECT
                pm.access_point_id,
                ST_ClusterDBSCAN(pm.position_point, eps := 100, minpoints := 3) OVER () as cluster_id,
                pm.position_point
            FROM app.position_measurements pm
            WHERE pm.access_point_id = ANY(ap_record.ap_ids)
        ),
        cluster_summary AS (
            SELECT
                cluster_id,
                count(*) as observation_count,
                ST_Centroid(ST_Collect(position_point)) as cluster_center,
                ST_Area(ST_ConvexHull(ST_Collect(position_point))::geography) as cluster_area
            FROM position_clusters
            WHERE cluster_id IS NOT NULL
            GROUP BY cluster_id
        )
        SELECT
            count(DISTINCT cluster_id) as cluster_count,
            max(ST_Distance(c1.cluster_center::geography, c2.cluster_center::geography)) as max_distance
        INTO cluster_results
        FROM cluster_summary c1
        CROSS JOIN cluster_summary c2;

        -- Insert or update collision analysis
        INSERT INTO app.bssid_collision_analysis (
            mac_address, location_cluster_count, max_distance_between_clusters_meters,
            observation_count, is_likely_collision, collision_type
        ) VALUES (
            ap_record.mac_address,
            cluster_results.cluster_count,
            cluster_results.max_distance,
            array_length(ap_record.ap_ids, 1),
            cluster_results.cluster_count > 1 AND cluster_results.max_distance > 1000,  -- >1km apart
            CASE
                WHEN cluster_results.max_distance > 10000 THEN 'vendor_reuse'      -- >10km = different devices
                WHEN cluster_results.max_distance > 1000 THEN 'possible_collision' -- >1km = suspicious
                ELSE 'mobile_device'                                               -- <1km = likely mobile
            END
        )
        ON CONFLICT (mac_address) DO UPDATE SET
            location_cluster_count = EXCLUDED.location_cluster_count,
            max_distance_between_clusters_meters = EXCLUDED.max_distance_between_clusters_meters,
            observation_count = EXCLUDED.observation_count,
            is_likely_collision = EXCLUDED.is_likely_collision,
            collision_type = EXCLUDED.collision_type,
            analysis_timestamp = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic deduplication on signal measurement insert
CREATE OR REPLACE FUNCTION app.auto_deduplication_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Process deduplication for new measurement
    PERFORM app.process_measurement_deduplication(
        NEW.measurement_id,
        NEW.access_point_id,
        NEW.measurement_timestamp,
        NEW.signal_strength_dbm,
        NEW.data_source_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_deduplication
    AFTER INSERT ON app.signal_measurements
    FOR EACH ROW
    EXECUTE FUNCTION app.auto_deduplication_trigger();

-- Indexes for deduplication performance
CREATE INDEX idx_fingerprints_hash ON app.observation_fingerprints (fingerprint_hash);
CREATE INDEX idx_fingerprints_ap_temporal ON app.observation_fingerprints (access_point_id, timestamp_window_start, timestamp_window_end);
CREATE INDEX idx_fingerprints_canonical ON app.observation_fingerprints (canonical_observation_id);
CREATE INDEX idx_collision_analysis_mac ON app.bssid_collision_analysis (mac_address);
CREATE INDEX idx_collision_analysis_likely ON app.bssid_collision_analysis (is_likely_collision) WHERE is_likely_collision = TRUE;

-- Comments
COMMENT ON TABLE app.observation_fingerprints IS 'Fuzzy temporal matching for cross-pipeline deduplication';
COMMENT ON TABLE app.bssid_collision_analysis IS 'Detect same BSSID at different locations - vendor reuse vs mobile device';
COMMENT ON FUNCTION app.generate_fingerprint_hash(TEXT, TIMESTAMPTZ, SMALLINT) IS 'Create deterministic hash for observation deduplication';
COMMENT ON FUNCTION app.find_potential_duplicates(BIGINT, TIMESTAMPTZ, SMALLINT, INTEGER) IS 'Find fuzzy matches within temporal and signal windows';
COMMENT ON FUNCTION app.process_measurement_deduplication(BIGINT, BIGINT, TIMESTAMPTZ, SMALLINT, INTEGER) IS 'Full deduplication processing for new signal measurement';
COMMENT ON FUNCTION app.analyze_bssid_collisions(TEXT) IS 'Spatial clustering analysis to detect BSSID collisions vs mobile devices';