-- ============================================================================
-- INGESTION-TIME DEDUPLICATION
-- Prevents duplicate observations within each individual pipeline/source
-- while preserving cross-source duplicates for data enrichment
-- ============================================================================

-- ============================================================================
-- PART 1: UNIQUE CONSTRAINTS ON STAGING TABLES
-- Each source gets its own deduplication key to prevent re-importing same data
-- ============================================================================

-- KML Staging: Dedupe on BSSID + timestamp + location + filename
-- (same BSSID at same time/location in same KML file = duplicate)
CREATE UNIQUE INDEX IF NOT EXISTS idx_kml_locations_dedupe
ON app.kml_locations_staging (
    bssid,
    time,
    ROUND(lat::NUMERIC, 6),
    ROUND(lon::NUMERIC, 6),
    kml_filename
);

COMMENT ON INDEX app.idx_kml_locations_dedupe IS
'Prevents duplicate observations within KML pipeline - same BSSID/time/location/file';

-- WiGLE API Staging: Dedupe on BSSID + timestamp + location
-- (same BSSID at same time/location from API = duplicate)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wigle_api_locations_dedupe
ON app.wigle_api_locations_staging (
    bssid,
    EXTRACT(EPOCH FROM time)::BIGINT,  -- Convert to epoch for consistency
    ROUND(lat::NUMERIC, 6),
    ROUND(lon::NUMERIC, 6)
);

COMMENT ON INDEX app.idx_wigle_api_locations_dedupe IS
'Prevents duplicate observations within WiGLE API pipeline - same BSSID/time/location';

-- Legacy Production: Dedupe on BSSID + timestamp + location + source_id
-- (protects against re-importing same SQLite database)
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_legacy_dedupe
ON app.locations_legacy (
    bssid,
    time,
    ROUND(lat::NUMERIC, 6),
    ROUND(lon::NUMERIC, 6),
    COALESCE(source_id, 0)  -- Handle NULL source_id
);

COMMENT ON INDEX app.idx_locations_legacy_dedupe IS
'Prevents duplicate observations within legacy pipeline - same BSSID/time/location/source';

-- ============================================================================
-- PART 2: SAFE INSERT FUNCTIONS
-- Functions that handle INSERT conflicts gracefully (ON CONFLICT DO NOTHING)
-- ============================================================================

/**
 * Safe insert for KML observations
 * Returns: number of rows inserted (0 if duplicate)
 */
CREATE OR REPLACE FUNCTION app.safe_insert_kml_location(
    p_bssid TEXT,
    p_ssid TEXT,
    p_network_type TEXT,
    p_encryption_type TEXT,
    p_level INTEGER,
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_altitude DOUBLE PRECISION,
    p_accuracy DOUBLE PRECISION,
    p_time BIGINT,
    p_kml_filename TEXT,
    p_source_id INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER;
BEGIN
    INSERT INTO app.kml_locations_staging (
        bssid, ssid, network_type, encryption_type,
        level, lat, lon, altitude, accuracy,
        time, kml_filename, source_id
    ) VALUES (
        p_bssid, p_ssid, p_network_type, p_encryption_type,
        p_level, p_lat, p_lon, p_altitude, p_accuracy,
        p_time, p_kml_filename, p_source_id
    )
    ON CONFLICT (bssid, time, ROUND(lat::NUMERIC, 6), ROUND(lon::NUMERIC, 6), kml_filename)
    DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.safe_insert_kml_location IS
'Safely insert KML observation, silently ignoring duplicates within same file';

/**
 * Safe insert for WiGLE API observations
 * Returns: number of rows inserted (0 if duplicate)
 */
CREATE OR REPLACE FUNCTION app.safe_insert_wigle_api_location(
    p_bssid TEXT,
    p_signal_level INTEGER,
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_altitude DOUBLE PRECISION,
    p_accuracy DOUBLE PRECISION,
    p_time TIMESTAMPTZ,
    p_query_params JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER;
BEGIN
    INSERT INTO app.wigle_api_locations_staging (
        bssid, signal_level, lat, lon,
        altitude, accuracy, time, query_params
    ) VALUES (
        p_bssid, p_signal_level, p_lat, p_lon,
        p_altitude, p_accuracy, p_time, p_query_params
    )
    ON CONFLICT (bssid, EXTRACT(EPOCH FROM time)::BIGINT, ROUND(lat::NUMERIC, 6), ROUND(lon::NUMERIC, 6))
    DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.safe_insert_wigle_api_location IS
'Safely insert WiGLE API observation, silently ignoring duplicates';

/**
 * Safe insert for legacy SQLite imports
 * Returns: number of rows inserted (0 if duplicate)
 */
CREATE OR REPLACE FUNCTION app.safe_insert_legacy_location(
    p_bssid TEXT,
    p_level INTEGER,
    p_lat DOUBLE PRECISION,
    p_lon DOUBLE PRECISION,
    p_altitude DOUBLE PRECISION,
    p_accuracy DOUBLE PRECISION,
    p_time BIGINT,
    p_source_id INTEGER DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER;
BEGIN
    INSERT INTO app.locations_legacy (
        bssid, level, lat, lon,
        altitude, accuracy, time, source_id
    ) VALUES (
        p_bssid, p_level, p_lat, p_lon,
        p_altitude, p_accuracy, p_time, p_source_id
    )
    ON CONFLICT (bssid, time, ROUND(lat::NUMERIC, 6), ROUND(lon::NUMERIC, 6), COALESCE(source_id, 0))
    DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.safe_insert_legacy_location IS
'Safely insert legacy observation, silently ignoring duplicates within same source';

-- ============================================================================
-- PART 3: BATCH INSERT WITH DEDUPLICATION STATS
-- Returns statistics about inserted vs skipped rows
-- ============================================================================

/**
 * Batch insert KML observations with deduplication tracking
 * Returns: JSON with stats {inserted: N, duplicates: N, total: N}
 */
CREATE OR REPLACE FUNCTION app.batch_insert_kml_locations(
    observations JSONB  -- Array of observation objects
)
RETURNS JSONB AS $$
DECLARE
    obs JSONB;
    total_count INTEGER := 0;
    inserted_count INTEGER := 0;
    duplicate_count INTEGER := 0;
    inserted INTEGER;
BEGIN
    FOR obs IN SELECT * FROM jsonb_array_elements(observations)
    LOOP
        total_count := total_count + 1;

        SELECT app.safe_insert_kml_location(
            obs->>'bssid',
            obs->>'ssid',
            obs->>'network_type',
            obs->>'encryption_type',
            (obs->>'level')::INTEGER,
            (obs->>'lat')::DOUBLE PRECISION,
            (obs->>'lon')::DOUBLE PRECISION,
            (obs->>'altitude')::DOUBLE PRECISION,
            (obs->>'accuracy')::DOUBLE PRECISION,
            (obs->>'time')::BIGINT,
            obs->>'kml_filename',
            (obs->>'source_id')::INTEGER
        ) INTO inserted;

        IF inserted > 0 THEN
            inserted_count := inserted_count + 1;
        ELSE
            duplicate_count := duplicate_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'total', total_count,
        'inserted', inserted_count,
        'duplicates', duplicate_count,
        'duplicate_rate', ROUND((duplicate_count::NUMERIC / NULLIF(total_count, 0) * 100), 2)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.batch_insert_kml_locations IS
'Batch insert KML observations with deduplication statistics';

-- ============================================================================
-- PART 4: CROSS-SOURCE ENRICHMENT ANALYSIS
-- Functions to analyze how duplicates across sources enrich data
-- ============================================================================

/**
 * Analyze enrichment potential from cross-source duplicates
 * Shows what additional data fields each source contributes
 */
CREATE OR REPLACE FUNCTION app.analyze_cross_source_enrichment(
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    bssid TEXT,
    time_ms BIGINT,
    latitude NUMERIC,
    longitude NUMERIC,
    source_count INTEGER,
    contributing_sources TEXT[],
    enrichment_fields JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH duplicates AS (
        -- Find observations that exist in multiple sources
        SELECT
            o.bssid,
            o.time_ms,
            ROUND(o.latitude::NUMERIC, 6) as lat,
            ROUND(o.longitude::NUMERIC, 6) as lon,
            COUNT(DISTINCT o.source_name) as src_count,
            array_agg(DISTINCT o.source_name ORDER BY o.source_name) as sources,

            -- Track which fields each source provides
            jsonb_object_agg(
                o.source_name,
                jsonb_build_object(
                    'ssid', o.ssid IS NOT NULL,
                    'frequency', o.frequency IS NOT NULL,
                    'capabilities', o.capabilities IS NOT NULL,
                    'signal_strength', o.signal_strength IS NOT NULL,
                    'altitude', o.altitude IS NOT NULL,
                    'accuracy', o.accuracy IS NOT NULL,
                    'quality_score', o.source_quality_score
                )
            ) as field_coverage
        FROM app.observations_federated o
        GROUP BY o.bssid, o.time_ms, ROUND(o.latitude::NUMERIC, 6), ROUND(o.longitude::NUMERIC, 6)
        HAVING COUNT(DISTINCT o.source_name) > 1
        ORDER BY src_count DESC, o.time_ms DESC
        LIMIT p_limit
    )
    SELECT
        d.bssid,
        d.time_ms,
        d.lat,
        d.lon,
        d.src_count::INTEGER,
        d.sources,
        d.field_coverage
    FROM duplicates d;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.analyze_cross_source_enrichment IS
'Analyzes how cross-source duplicates enrich data with complementary fields';

/**
 * Get enrichment statistics summary
 */
CREATE OR REPLACE FUNCTION app.get_enrichment_stats()
RETURNS TABLE(
    total_observations BIGINT,
    observations_in_multiple_sources BIGINT,
    enrichment_percentage NUMERIC,
    avg_sources_per_duplicate NUMERIC,
    top_enrichment_pairs TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH base_counts AS (
        SELECT COUNT(*) as total_obs
        FROM app.observations_federated
    ),
    duplicate_counts AS (
        SELECT
            o.bssid,
            o.time_ms,
            ROUND(o.latitude::NUMERIC, 6) as lat,
            ROUND(o.longitude::NUMERIC, 6) as lon,
            COUNT(DISTINCT o.source_name) as source_count,
            array_agg(DISTINCT o.source_name ORDER BY o.source_name) as source_combo
        FROM app.observations_federated o
        GROUP BY o.bssid, o.time_ms, ROUND(o.latitude::NUMERIC, 6), ROUND(o.longitude::NUMERIC, 6)
        HAVING COUNT(DISTINCT o.source_name) > 1
    )
    SELECT
        (SELECT total_obs FROM base_counts),
        COUNT(*)::BIGINT,
        ROUND(COUNT(*)::NUMERIC / (SELECT total_obs FROM base_counts) * 100, 2),
        ROUND(AVG(source_count), 2),
        (
            SELECT array_agg(source_combo_str ORDER BY combo_count DESC)
            FROM (
                SELECT
                    array_to_string(source_combo, ' + ') as source_combo_str,
                    COUNT(*) as combo_count
                FROM duplicate_counts
                GROUP BY source_combo
                ORDER BY combo_count DESC
                LIMIT 5
            ) top_combos
        )
    FROM duplicate_counts;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.get_enrichment_stats IS
'Summary statistics showing enrichment from cross-source duplicates';

-- ============================================================================
-- PART 5: GRANTS
-- ============================================================================

-- Grant execute on safe insert functions
-- GRANT EXECUTE ON FUNCTION app.safe_insert_kml_location TO shadowcheck_writer;
-- GRANT EXECUTE ON FUNCTION app.safe_insert_wigle_api_location TO shadowcheck_writer;
-- GRANT EXECUTE ON FUNCTION app.safe_insert_legacy_location TO shadowcheck_writer;
-- GRANT EXECUTE ON FUNCTION app.batch_insert_kml_locations TO shadowcheck_writer;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Insert single KML observation (returns 1 if inserted, 0 if duplicate)
SELECT app.safe_insert_kml_location(
    'AA:BB:CC:DD:EE:FF',           -- bssid
    'MyNetwork',                    -- ssid
    'W',                            -- network_type
    '[WPA2-PSK-CCMP][ESS]',        -- encryption_type
    -65,                            -- level
    37.7749,                        -- lat
    -122.4194,                      -- lon
    10.0,                           -- altitude
    15.0,                           -- accuracy
    1640000000000,                  -- time (ms)
    '20241007-01413.kml',          -- kml_filename
    NULL                            -- source_id
);

-- Example 2: Batch insert with statistics
SELECT app.batch_insert_kml_locations('[
    {
        "bssid": "AA:BB:CC:DD:EE:FF",
        "ssid": "Network1",
        "network_type": "W",
        "encryption_type": "[WPA2-PSK-CCMP][ESS]",
        "level": -65,
        "lat": 37.7749,
        "lon": -122.4194,
        "altitude": 10.0,
        "accuracy": 15.0,
        "time": 1640000000000,
        "kml_filename": "test.kml"
    },
    {
        "bssid": "AA:BB:CC:DD:EE:FF",
        "ssid": "Network1",
        "network_type": "W",
        "encryption_type": "[WPA2-PSK-CCMP][ESS]",
        "level": -65,
        "lat": 37.7749,
        "lon": -122.4194,
        "altitude": 10.0,
        "accuracy": 15.0,
        "time": 1640000000000,
        "kml_filename": "test.kml"
    }
]'::jsonb);
-- Returns: {"total": 2, "inserted": 1, "duplicates": 1, "duplicate_rate": 50.00}

-- Example 3: Analyze cross-source enrichment
SELECT * FROM app.analyze_cross_source_enrichment(20);

-- Example 4: Get enrichment statistics
SELECT * FROM app.get_enrichment_stats();

-- Example 5: Find observations where WiGLE API enriched KML data
SELECT
    bssid,
    time_ms,
    contributing_sources,
    enrichment_fields
FROM app.analyze_cross_source_enrichment(100)
WHERE 'kml_staging' = ANY(contributing_sources)
  AND 'wigle_api' = ANY(contributing_sources);
*/
