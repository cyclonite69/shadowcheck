-- ============================================================================
-- FUZZY DEDUPLICATION FOR CROSS-SOURCE OBSERVATIONS
-- Handles WiGLE batch processing temporal shifts and coordinate rounding
-- Always defers to precision (lowest accuracy value)
-- ============================================================================

/**
 * Problem: WiGLE API processes uploads in batches, causing:
 * 1. Temporal shifts: timestamps may differ by seconds/minutes
 * 2. Coordinate rounding: GPS coords may be rounded differently
 * 3. Signal normalization: signal levels may be adjusted
 *
 * Solution: Fuzzy matching with precision-based selection
 */

-- ============================================================================
-- PART 1: FUZZY DEDUPLICATION VIEW
-- Matches observations within tolerance windows
-- ============================================================================

CREATE OR REPLACE VIEW app.observations_deduplicated_fuzzy AS
WITH fuzzy_groups AS (
    -- Group observations using fuzzy matching criteria
    SELECT
        bssid,
        -- Temporal tolerance: ±5 minutes (300,000 ms)
        FLOOR(time_ms / 300000.0) * 300000 as time_bucket,
        -- Spatial tolerance: ~100 meters (0.001 degrees ≈ 111 meters)
        ROUND(latitude::NUMERIC, 3) as lat_bucket,
        ROUND(longitude::NUMERIC, 3) as lon_bucket,

        -- Collect all matching observations
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
                'time_ms', time_ms,
                'observed_at', observed_at,
                'source_quality_score', source_quality_score,
                'location_point', ST_AsGeoJSON(location_point)::jsonb
            )
            ORDER BY
                -- PRIMARY SORT: Precision (lowest accuracy = highest precision)
                CASE
                    WHEN accuracy IS NOT NULL AND accuracy > 0 THEN accuracy
                    ELSE 999999  -- Put nulls at end
                END ASC,
                -- SECONDARY SORT: Source quality
                source_quality_score DESC,
                -- TERTIARY SORT: Source type priority
                CASE source_type
                    WHEN 'production' THEN 1
                    WHEN 'enrichment' THEN 2
                    WHEN 'staging' THEN 3
                    ELSE 4
                END
        ) as all_observations,

        COUNT(*) as observation_count

    FROM app.observations_federated
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND latitude BETWEEN -90 AND 90
      AND longitude BETWEEN -180 AND 180
      AND NOT (latitude = 0 AND longitude = 0)
    GROUP BY
        bssid,
        FLOOR(time_ms / 300000.0) * 300000,
        ROUND(latitude::NUMERIC, 3),
        ROUND(longitude::NUMERIC, 3)
),
best_observations AS (
    -- Select best observation from each fuzzy group
    SELECT
        bssid,
        time_bucket,
        lat_bucket,
        lon_bucket,
        observation_count,

        -- Always select observation with HIGHEST PRECISION (lowest accuracy)
        (all_observations->0) as best_observation

    FROM fuzzy_groups
)
SELECT
    (best_observation->>'source_name')::TEXT as source_name,
    (best_observation->>'source_type')::TEXT as source_type,
    (best_observation->>'observation_id')::TEXT as observation_id,
    (best_observation->>'bssid')::TEXT as bssid,
    (best_observation->>'signal_strength')::INTEGER as signal_strength,
    (best_observation->>'latitude')::DOUBLE PRECISION as latitude,
    (best_observation->>'longitude')::DOUBLE PRECISION as longitude,
    (best_observation->>'altitude')::DOUBLE PRECISION as altitude,
    (best_observation->>'accuracy')::DOUBLE PRECISION as accuracy,
    (best_observation->>'time_ms')::BIGINT as time_ms,
    (best_observation->>'observed_at')::TIMESTAMPTZ as observed_at,
    (best_observation->>'ssid')::TEXT as ssid,
    (best_observation->>'radio_type')::TEXT as radio_type,
    (best_observation->>'frequency')::INTEGER as frequency,
    (best_observation->>'capabilities')::TEXT as capabilities,
    (best_observation->>'service')::TEXT as service,
    (best_observation->>'source_quality_score')::NUMERIC as source_quality_score,

    -- Metadata about deduplication
    observation_count as fuzzy_match_count,
    CASE
        WHEN observation_count > 1 THEN true
        ELSE false
    END as was_deduplicated,

    ST_SetSRID(
        ST_MakePoint(
            (best_observation->>'longitude')::DOUBLE PRECISION,
            (best_observation->>'latitude')::DOUBLE PRECISION
        ),
        4326
    ) as location_point

FROM best_observations;

COMMENT ON VIEW app.observations_deduplicated_fuzzy IS
'Fuzzy deduplication with ±5min temporal tolerance and ~100m spatial tolerance. Always selects highest precision (lowest accuracy).';

-- ============================================================================
-- PART 2: FUZZY MATCH DETECTION FUNCTION
-- Identifies observations that are likely the same across sources
-- ============================================================================

/**
 * Detect fuzzy matches for a specific BSSID
 * Returns groups of observations that match within tolerance
 */
CREATE OR REPLACE FUNCTION app.find_fuzzy_matches(
    p_bssid TEXT,
    p_temporal_tolerance_ms BIGINT DEFAULT 300000,  -- 5 minutes
    p_spatial_tolerance_deg NUMERIC DEFAULT 0.001   -- ~100 meters
)
RETURNS TABLE(
    match_group_id INTEGER,
    observations JSONB,
    match_count INTEGER,
    precision_winner TEXT,
    precision_winner_accuracy NUMERIC,
    temporal_spread_ms BIGINT,
    spatial_spread_m NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH observations_for_bssid AS (
        SELECT
            o.*,
            FLOOR(o.time_ms / p_temporal_tolerance_ms) * p_temporal_tolerance_ms as time_bucket,
            ROUND(o.latitude::NUMERIC, LOG(1.0 / p_spatial_tolerance_deg)::INTEGER) as lat_bucket,
            ROUND(o.longitude::NUMERIC, LOG(1.0 / p_spatial_tolerance_deg)::INTEGER) as lon_bucket
        FROM app.observations_federated o
        WHERE o.bssid = p_bssid
    ),
    fuzzy_groups AS (
        SELECT
            ROW_NUMBER() OVER (ORDER BY time_bucket, lat_bucket, lon_bucket) as group_id,
            time_bucket,
            lat_bucket,
            lon_bucket,
            jsonb_agg(
                jsonb_build_object(
                    'source_name', source_name,
                    'observation_id', observation_id,
                    'latitude', latitude,
                    'longitude', longitude,
                    'accuracy', accuracy,
                    'time_ms', time_ms,
                    'observed_at', observed_at,
                    'signal_strength', signal_strength
                )
                ORDER BY
                    COALESCE(accuracy, 999999) ASC,
                    source_quality_score DESC
            ) as obs_array,
            COUNT(*) as cnt,

            -- Find precision winner (lowest accuracy)
            (
                SELECT source_name
                FROM observations_for_bssid o2
                WHERE o2.time_bucket = observations_for_bssid.time_bucket
                  AND o2.lat_bucket = observations_for_bssid.lat_bucket
                  AND o2.lon_bucket = observations_for_bssid.lon_bucket
                ORDER BY COALESCE(o2.accuracy, 999999) ASC
                LIMIT 1
            ) as winner,

            (
                SELECT accuracy
                FROM observations_for_bssid o2
                WHERE o2.time_bucket = observations_for_bssid.time_bucket
                  AND o2.lat_bucket = observations_for_bssid.lat_bucket
                  AND o2.lon_bucket = observations_for_bssid.lon_bucket
                ORDER BY COALESCE(o2.accuracy, 999999) ASC
                LIMIT 1
            ) as winner_accuracy,

            -- Temporal spread within group
            MAX(time_ms) - MIN(time_ms) as time_spread,

            -- Spatial spread within group (approximate)
            ST_Distance(
                ST_SetSRID(ST_MakePoint(MIN(longitude), MIN(latitude)), 4326)::geography,
                ST_SetSRID(ST_MakePoint(MAX(longitude), MAX(latitude)), 4326)::geography
            ) as spatial_spread

        FROM observations_for_bssid
        GROUP BY time_bucket, lat_bucket, lon_bucket
        HAVING COUNT(*) > 1  -- Only return groups with multiple observations
    )
    SELECT
        group_id::INTEGER,
        obs_array,
        cnt::INTEGER,
        winner,
        winner_accuracy,
        time_spread,
        spatial_spread
    FROM fuzzy_groups
    ORDER BY group_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.find_fuzzy_matches IS
'Finds fuzzy matches for a BSSID, showing which observations are likely duplicates across sources';

-- ============================================================================
-- PART 3: PRECISION-BASED DEDUPLICATION STATISTICS
-- Show how many observations were deduplicated and precision improvements
-- ============================================================================

CREATE OR REPLACE FUNCTION app.get_fuzzy_dedup_stats()
RETURNS TABLE(
    total_observations BIGINT,
    unique_after_fuzzy_dedup BIGINT,
    duplicates_removed BIGINT,
    dedup_rate NUMERIC,
    avg_matches_per_group NUMERIC,
    precision_improvement_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH federated_stats AS (
        SELECT
            COUNT(*) as total,
            AVG(COALESCE(accuracy, 100)) as avg_accuracy_before
        FROM app.observations_federated
        WHERE accuracy IS NOT NULL AND accuracy > 0
    ),
    deduped_stats AS (
        SELECT
            COUNT(*) as unique_count,
            AVG(fuzzy_match_count) as avg_group_size,
            AVG(COALESCE(accuracy, 100)) as avg_accuracy_after
        FROM app.observations_deduplicated_fuzzy
        WHERE accuracy IS NOT NULL AND accuracy > 0
    )
    SELECT
        f.total,
        d.unique_count,
        f.total - d.unique_count,
        ROUND((f.total - d.unique_count)::NUMERIC / f.total * 100, 2),
        ROUND(d.avg_group_size::NUMERIC, 2),
        ROUND(((f.avg_accuracy_before - d.avg_accuracy_after) / f.avg_accuracy_before * 100)::NUMERIC, 2)
    FROM federated_stats f, deduped_stats d;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.get_fuzzy_dedup_stats IS
'Statistics showing impact of fuzzy deduplication on data volume and precision';

-- ============================================================================
-- PART 4: WIGLE BATCH PROCESSING DETECTION
-- Identify observations that were likely modified by WiGLE processing
-- ============================================================================

CREATE OR REPLACE FUNCTION app.detect_wigle_batch_processing(
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    bssid TEXT,
    legacy_time TIMESTAMPTZ,
    wigle_time TIMESTAMPTZ,
    time_diff_seconds NUMERIC,
    legacy_coords TEXT,
    wigle_coords TEXT,
    coord_distance_m NUMERIC,
    legacy_accuracy NUMERIC,
    wigle_accuracy NUMERIC,
    precision_winner TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.bssid,
        l.observed_at as legacy_time,
        w.observed_at as wigle_time,
        ABS(EXTRACT(EPOCH FROM (w.observed_at - l.observed_at))) as time_diff,
        CONCAT(l.latitude, ', ', l.longitude) as legacy_coords,
        CONCAT(w.latitude, ', ', w.longitude) as wigle_coords,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)::geography
        ) as distance,
        l.accuracy as legacy_acc,
        w.accuracy as wigle_acc,
        CASE
            WHEN COALESCE(l.accuracy, 999999) < COALESCE(w.accuracy, 999999) THEN 'legacy'
            ELSE 'wigle_api'
        END as winner
    FROM app.observations_federated l
    INNER JOIN app.observations_federated w
        ON l.bssid = w.bssid
        AND l.source_name = 'locations_legacy'
        AND w.source_name = 'wigle_api'
        -- Fuzzy temporal match (within 10 minutes)
        AND ABS(l.time_ms - w.time_ms) <= 600000
        -- Fuzzy spatial match (within 200 meters)
        AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)::geography,
            200
        )
    WHERE l.latitude IS NOT NULL
      AND w.latitude IS NOT NULL
    ORDER BY ABS(EXTRACT(EPOCH FROM (w.observed_at - l.observed_at))) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.detect_wigle_batch_processing IS
'Identifies observations that appear in both legacy and WiGLE API with slight differences due to batch processing';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Query fuzzy deduplicated observations
SELECT
    bssid,
    ssid,
    source_name,
    latitude,
    longitude,
    accuracy,
    fuzzy_match_count,
    was_deduplicated
FROM app.observations_deduplicated_fuzzy
WHERE was_deduplicated = true  -- Only show observations that had duplicates
ORDER BY fuzzy_match_count DESC
LIMIT 20;

-- Example 2: Find fuzzy matches for specific BSSID
SELECT * FROM app.find_fuzzy_matches('AA:BB:CC:DD:EE:FF');

-- Example 3: Get fuzzy deduplication statistics
SELECT * FROM app.get_fuzzy_dedup_stats();

-- Example output:
-- total_observations | unique_after_fuzzy_dedup | duplicates_removed | dedup_rate | avg_matches_per_group | precision_improvement
-- 915020            | 856234                    | 58786              | 6.42       | 1.07                  | 15.3

-- Example 4: Detect WiGLE batch processing modifications
SELECT * FROM app.detect_wigle_batch_processing(50);

-- Example output shows observations that were uploaded to WiGLE and came back modified:
-- bssid              | legacy_time          | wigle_time           | time_diff_seconds | coord_distance_m | precision_winner
-- AA:BB:CC:DD:EE:FF | 2024-01-15 10:30:00 | 2024-01-15 10:33:45 | 225               | 45.2             | legacy

-- Example 5: Compare exact vs fuzzy deduplication
SELECT
    'Exact Deduplication' as method,
    COUNT(*) as unique_observations
FROM app.observations_deduplicated

UNION ALL

SELECT
    'Fuzzy Deduplication' as method,
    COUNT(*) as unique_observations
FROM app.observations_deduplicated_fuzzy;

-- Shows difference between exact matching and fuzzy matching
*/
