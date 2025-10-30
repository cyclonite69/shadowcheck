-- ============================================================================
-- HYBRID MERGE STRATEGY
-- Uses multiple merge modalities in tandem for optimal results
-- ============================================================================

/**
 * Hybrid merge view - Uses BEST strategy for each field type
 *
 * Strategy per field:
 * - GPS coordinates: PRECISION merge (lowest accuracy value)
 * - Signal strength: SMART merge (strongest from best source)
 * - SSID: SMART merge (longest, non-hidden from enrichment sources)
 * - Frequency: SMART merge (direct measurement from production)
 * - Timestamps: Keep ALL (unified for timeline analysis)
 * - Capabilities: SMART merge (most detailed)
 *
 * This is "Option A" - one merged result using optimal strategy per field
 */
CREATE OR REPLACE VIEW app.observations_hybrid_merged AS
WITH observation_groups AS (
    -- Group observations by BSSID + time + location
    SELECT
        bssid,
        time_ms,
        ROUND(latitude::NUMERIC, 6) as lat_key,
        ROUND(longitude::NUMERIC, 6) as lon_key,

        -- Collect all source observations
        jsonb_agg(
            jsonb_build_object(
                'source_name', source_name,
                'source_type', source_type,
                'observation_id', observation_id,
                'latitude', latitude,
                'longitude', longitude,
                'accuracy', accuracy,
                'altitude', altitude,
                'signal_strength', signal_strength,
                'ssid', ssid,
                'radio_type', radio_type,
                'frequency', frequency,
                'capabilities', capabilities,
                'service', service,
                'observed_at', observed_at,
                'source_quality_score', source_quality_score,
                'location_point', ST_AsGeoJSON(location_point)::jsonb
            )
            ORDER BY source_quality_score DESC, observed_at DESC NULLS LAST
        ) as all_observations,

        COUNT(*) as source_count,
        array_agg(DISTINCT source_name ORDER BY source_name) as contributing_sources

    FROM app.observations_federated
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180
      AND NOT (latitude = 0 AND longitude = 0)
    GROUP BY bssid, time_ms, ROUND(latitude::NUMERIC, 6), ROUND(longitude::NUMERIC, 6)
),
hybrid_values AS (
    SELECT
        bssid,
        time_ms,
        lat_key,
        lon_key,
        all_observations,
        source_count,
        contributing_sources,

        -- ===================================================================
        -- PRECISION MERGE for GPS: Select observation with LOWEST accuracy
        -- ===================================================================
        (
            SELECT (obs->>'latitude')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'latitude' IS NOT NULL
              AND obs->>'accuracy' IS NOT NULL
              AND (obs->>'accuracy')::DOUBLE PRECISION > 0
            ORDER BY
                (obs->>'accuracy')::DOUBLE PRECISION ASC,  -- PRECISION: lowest accuracy = best
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS gps_latitude,

        (
            SELECT (obs->>'longitude')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'longitude' IS NOT NULL
              AND obs->>'accuracy' IS NOT NULL
              AND (obs->>'accuracy')::DOUBLE PRECISION > 0
            ORDER BY
                (obs->>'accuracy')::DOUBLE PRECISION ASC,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS gps_longitude,

        (
            SELECT (obs->>'accuracy')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'accuracy' IS NOT NULL
              AND (obs->>'accuracy')::DOUBLE PRECISION > 0
            ORDER BY (obs->>'accuracy')::DOUBLE PRECISION ASC
            LIMIT 1
        ) AS gps_accuracy,

        -- ===================================================================
        -- SMART MERGE for Signal: Strongest reading from best source
        -- ===================================================================
        (
            SELECT (obs->>'signal_strength')::INTEGER
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'signal_strength' IS NOT NULL
            ORDER BY
                (obs->>'signal_strength')::INTEGER DESC,  -- SMART: strongest signal
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_signal_strength,

        -- ===================================================================
        -- SMART MERGE for SSID: Prefer enrichment sources, longest name
        -- ===================================================================
        (
            SELECT obs->>'ssid'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'ssid' IS NOT NULL
              AND obs->>'ssid' != ''
              AND obs->>'ssid' NOT ILIKE '%hidden%'
            ORDER BY
                CASE obs->>'source_type'
                    WHEN 'enrichment' THEN 1
                    WHEN 'staging' THEN 2
                    ELSE 3
                END,
                LENGTH(obs->>'ssid') DESC
            LIMIT 1
        ) AS best_ssid,

        -- ===================================================================
        -- SMART MERGE for Frequency: Production sources preferred
        -- ===================================================================
        (
            SELECT (obs->>'frequency')::INTEGER
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'frequency' IS NOT NULL
              AND (obs->>'frequency')::INTEGER > 0
              AND (obs->>'frequency')::INTEGER != 7936
            ORDER BY
                CASE obs->>'source_type'
                    WHEN 'production' THEN 1
                    ELSE 2
                END,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_frequency,

        -- ===================================================================
        -- SMART MERGE for Capabilities: Longest/most detailed
        -- ===================================================================
        (
            SELECT obs->>'capabilities'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'capabilities' IS NOT NULL
              AND obs->>'capabilities' != ''
            ORDER BY
                LENGTH(obs->>'capabilities') DESC
            LIMIT 1
        ) AS best_capabilities,

        -- ===================================================================
        -- UNIFIED for Radio Type: Keep most common type across sources
        -- (In case of type determination issues, use consensus)
        -- ===================================================================
        (
            SELECT obs->>'radio_type'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'radio_type' IS NOT NULL
            GROUP BY obs->>'radio_type'
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) AS consensus_radio_type,

        -- ===================================================================
        -- UNIFIED for Timestamps: Keep array of ALL observation times
        -- (For timeline analysis - don't merge, preserve all)
        -- ===================================================================
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'observed_at', obs->>'observed_at',
                    'source', obs->>'source_name',
                    'signal', obs->>'signal_strength'
                )
                ORDER BY obs->>'observed_at' DESC
            )
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'observed_at' IS NOT NULL
        ) AS all_observation_times,

        -- Quality metrics
        (SELECT AVG((obs->>'source_quality_score')::NUMERIC) FROM jsonb_array_elements(all_observations) AS obs) AS avg_source_quality,
        (SELECT MAX((obs->>'source_quality_score')::NUMERIC) FROM jsonb_array_elements(all_observations) AS obs) AS max_source_quality

    FROM observation_groups
)
SELECT
    bssid,

    -- GPS from PRECISION merge
    gps_latitude AS latitude,
    gps_longitude AS longitude,
    gps_accuracy AS accuracy,

    -- Signal from SMART merge
    best_signal_strength AS signal_strength,

    -- Metadata from SMART merge
    best_ssid AS ssid,
    best_frequency AS frequency,
    best_capabilities AS capabilities,
    consensus_radio_type AS radio_type,

    -- Timestamps in UNIFIED format (all preserved)
    time_ms,
    all_observation_times,

    -- Provenance
    contributing_sources,
    source_count,
    avg_source_quality,
    max_source_quality,

    -- Merge strategy indicators
    'HYBRID' AS merge_strategy,
    jsonb_build_object(
        'gps_strategy', 'precision',
        'signal_strategy', 'smart',
        'metadata_strategy', 'smart',
        'timeline_strategy', 'unified'
    ) AS strategy_details,

    -- Reconstructed location
    ST_SetSRID(ST_MakePoint(gps_longitude, gps_latitude), 4326) AS location_point

FROM hybrid_values
WHERE gps_latitude IS NOT NULL
  AND gps_longitude IS NOT NULL;

COMMENT ON VIEW app.observations_hybrid_merged IS
'Hybrid merge strategy - Uses optimal merge modality for each field type in tandem';

-- ============================================================================
-- MULTI-VIEW COMPARISON FUNCTION
-- For "Option B" - Side-by-side comparison of all merge strategies
-- ============================================================================

/**
 * Get observation in ALL merge modes for comparison
 * Returns same observation processed through all 4 strategies
 */
CREATE OR REPLACE FUNCTION app.compare_merge_strategies(
    p_bssid TEXT,
    p_time_ms BIGINT,
    p_latitude NUMERIC,
    p_longitude NUMERIC
)
RETURNS TABLE(
    merge_mode TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    signal_strength INTEGER,
    ssid TEXT,
    frequency INTEGER,
    capabilities TEXT,
    contributing_sources TEXT[],
    source_count INTEGER,
    quality_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY

    -- Unified mode
    SELECT
        'unified'::TEXT,
        AVG(o.latitude)::DOUBLE PRECISION,
        AVG(o.longitude)::DOUBLE PRECISION,
        AVG(o.accuracy)::DOUBLE PRECISION,
        CAST(AVG(o.signal_strength) AS INTEGER),
        MAX(o.ssid),
        MAX(o.frequency),
        MAX(o.capabilities),
        array_agg(DISTINCT o.source_name ORDER BY o.source_name),
        COUNT(DISTINCT o.source_name)::INTEGER,
        AVG(o.source_quality_score)::NUMERIC
    FROM app.observations_federated o
    WHERE o.bssid = p_bssid
      AND o.time_ms = p_time_ms
      AND ROUND(o.latitude::NUMERIC, 6) = p_latitude
      AND ROUND(o.longitude::NUMERIC, 6) = p_longitude

    UNION ALL

    -- Deduplicated mode
    SELECT
        'deduplicated'::TEXT,
        d.latitude,
        d.longitude,
        d.accuracy,
        d.signal_strength,
        d.ssid,
        d.frequency,
        d.capabilities,
        ARRAY[d.source_name],
        1::INTEGER,
        d.source_quality_score
    FROM app.observations_deduplicated d
    WHERE d.bssid = p_bssid
      AND d.time_ms = p_time_ms
      AND ROUND(d.latitude::NUMERIC, 6) = p_latitude
      AND ROUND(d.longitude::NUMERIC, 6) = p_longitude
    LIMIT 1

    UNION ALL

    -- Smart merged mode
    SELECT
        'smart_merged'::TEXT,
        s.latitude,
        s.longitude,
        s.accuracy,
        s.signal_strength,
        s.ssid,
        s.frequency,
        s.capabilities,
        s.contributing_sources,
        s.source_count,
        s.max_source_quality
    FROM app.observations_smart_merged_v2 s
    WHERE s.bssid = p_bssid
      AND s.time_ms = p_time_ms
    LIMIT 1

    UNION ALL

    -- Hybrid mode
    SELECT
        'hybrid'::TEXT,
        h.latitude,
        h.longitude,
        h.accuracy,
        h.signal_strength,
        h.ssid,
        h.frequency,
        h.capabilities,
        h.contributing_sources,
        h.source_count,
        h.max_source_quality
    FROM app.observations_hybrid_merged h
    WHERE h.bssid = p_bssid
      AND h.time_ms = p_time_ms
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.compare_merge_strategies IS
'Returns same observation processed through all merge strategies for side-by-side comparison';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Query hybrid merged observations
SELECT
    bssid,
    ssid,
    latitude,
    longitude,
    accuracy,
    signal_strength,
    merge_strategy,
    strategy_details
FROM app.observations_hybrid_merged
ORDER BY accuracy ASC  -- Highest precision first
LIMIT 10;

-- Example 2: Compare merge strategies for specific observation
SELECT * FROM app.compare_merge_strategies(
    'AA:BB:CC:DD:EE:FF',
    1640000000000,
    37.774900,
    -122.419400
);

-- Example output shows how each strategy handles same observation:
-- merge_mode      | latitude   | longitude    | accuracy | signal | ssid          | sources
-- ----------------+------------+--------------+----------+--------+---------------+------------------
-- unified         | 37.774902  | -122.419398  | 22.5     | -66    | Starbucks     | {legacy,kml,api}
-- deduplicated    | 37.774900  | -122.419400  | 5.0      | -62    | NULL          | {legacy}
-- smart_merged    | 37.774900  | -122.419400  | 5.0      | -62    | Starbucks     | {legacy,kml,api}
-- hybrid          | 37.774900  | -122.419400  | 5.0      | -62    | Starbucks     | {legacy,kml,api}

-- Example 3: Find observations where hybrid gives best results
SELECT
    h.bssid,
    h.ssid,
    h.accuracy as hybrid_accuracy,
    h.source_count,
    h.strategy_details
FROM app.observations_hybrid_merged h
WHERE h.source_count >= 2  -- Multiple sources
  AND h.accuracy < 10      -- Very high GPS precision
ORDER BY h.source_count DESC, h.accuracy ASC
LIMIT 20;
*/
