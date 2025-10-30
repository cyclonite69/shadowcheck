-- ============================================================================
-- PRECISION-AWARE DATA MELDING
-- Intelligently selects highest precision values when combining observations
-- from multiple sources
-- ============================================================================

/**
 * Enhanced smart merge with precision-based field selection
 *
 * Precision factors:
 * - GPS: Lower accuracy value = higher precision
 * - Signal: Higher source quality + more recent = higher precision
 * - Timestamp: Millisecond precision > second precision
 * - Frequency: Direct measurement > inferred value
 * - SSID: Longer, non-hidden > short or hidden
 */
CREATE OR REPLACE VIEW app.observations_smart_merged_v2 AS
WITH observation_groups AS (
    -- Group observations by BSSID + time + location
    SELECT
        bssid,
        time_ms,
        ROUND(latitude::NUMERIC, 6) as lat_key,
        ROUND(longitude::NUMERIC, 6) as lon_key,

        -- Collect all source observations for this group
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
            ORDER BY
                -- Prioritize by quality and recency
                source_quality_score DESC,
                observed_at DESC NULLS LAST
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
best_values AS (
    SELECT
        bssid,
        time_ms,
        lat_key,
        lon_key,
        all_observations,
        source_count,
        contributing_sources,

        -- ===================================================================
        -- GPS COORDINATES: Select highest precision (lowest accuracy value)
        -- ===================================================================
        (
            SELECT (obs->>'latitude')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'latitude' IS NOT NULL
              AND obs->>'accuracy' IS NOT NULL
              AND (obs->>'accuracy')::DOUBLE PRECISION > 0
            ORDER BY
                (obs->>'accuracy')::DOUBLE PRECISION ASC,  -- Lower accuracy = higher precision
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_latitude,

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
        ) AS best_longitude,

        -- Best accuracy value (for metadata)
        (
            SELECT (obs->>'accuracy')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'accuracy' IS NOT NULL
              AND (obs->>'accuracy')::DOUBLE PRECISION > 0
            ORDER BY (obs->>'accuracy')::DOUBLE PRECISION ASC
            LIMIT 1
        ) AS best_accuracy,

        -- ===================================================================
        -- ALTITUDE: Prefer sources with GPS altitude data
        -- ===================================================================
        (
            SELECT (obs->>'altitude')::DOUBLE PRECISION
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'altitude' IS NOT NULL
              AND (obs->>'altitude')::DOUBLE PRECISION != 0
            ORDER BY
                -- Prefer production sources for altitude
                CASE obs->>'source_type'
                    WHEN 'production' THEN 1
                    WHEN 'enrichment' THEN 2
                    ELSE 3
                END,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_altitude,

        -- ===================================================================
        -- SIGNAL STRENGTH: Take strongest reading from highest quality source
        -- ===================================================================
        (
            SELECT (obs->>'signal_strength')::INTEGER
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'signal_strength' IS NOT NULL
            ORDER BY
                (obs->>'signal_strength')::INTEGER DESC,  -- Stronger signal first
                (obs->>'source_quality_score')::NUMERIC DESC,
                obs->>'observed_at' DESC NULLS LAST  -- Most recent if tie
            LIMIT 1
        ) AS best_signal_strength,

        -- ===================================================================
        -- SSID: Prefer non-hidden, longer names from enrichment sources
        -- ===================================================================
        (
            SELECT obs->>'ssid'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'ssid' IS NOT NULL
              AND obs->>'ssid' != ''
              AND obs->>'ssid' NOT ILIKE '%hidden%'
              AND obs->>'ssid' != '<hidden>'
            ORDER BY
                -- Prefer enrichment sources for SSID (they often have better data)
                CASE obs->>'source_type'
                    WHEN 'enrichment' THEN 1
                    WHEN 'staging' THEN 2
                    WHEN 'production' THEN 3
                    ELSE 4
                END,
                LENGTH(obs->>'ssid') DESC,  -- Longer SSID = more complete
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_ssid,

        -- ===================================================================
        -- RADIO TYPE: Prefer production sources (most reliable)
        -- ===================================================================
        (
            SELECT obs->>'radio_type'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'radio_type' IS NOT NULL
            ORDER BY
                CASE obs->>'source_type'
                    WHEN 'production' THEN 1
                    WHEN 'staging' THEN 2
                    ELSE 3
                END,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_radio_type,

        -- ===================================================================
        -- FREQUENCY: Prefer production sources (direct from radio)
        -- ===================================================================
        (
            SELECT (obs->>'frequency')::INTEGER
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'frequency' IS NOT NULL
              AND (obs->>'frequency')::INTEGER > 0
              AND (obs->>'frequency')::INTEGER != 7936  -- Exclude invalid placeholder
            ORDER BY
                CASE obs->>'source_type'
                    WHEN 'production' THEN 1
                    WHEN 'staging' THEN 2
                    ELSE 3
                END,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_frequency,

        -- ===================================================================
        -- CAPABILITIES: Prefer longest/most detailed capability string
        -- ===================================================================
        (
            SELECT obs->>'capabilities'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'capabilities' IS NOT NULL
              AND obs->>'capabilities' != ''
            ORDER BY
                LENGTH(obs->>'capabilities') DESC,  -- More detailed = better
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_capabilities,

        -- ===================================================================
        -- SERVICE: Prefer enrichment sources
        -- ===================================================================
        (
            SELECT obs->>'service'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'service' IS NOT NULL
              AND obs->>'service' != ''
            ORDER BY
                CASE obs->>'source_type'
                    WHEN 'enrichment' THEN 1
                    WHEN 'production' THEN 2
                    ELSE 3
                END,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_service,

        -- ===================================================================
        -- TIMESTAMP: Use most precise/recent observation timestamp
        -- ===================================================================
        (
            SELECT obs->>'observed_at'
            FROM jsonb_array_elements(all_observations) AS obs
            WHERE obs->>'observed_at' IS NOT NULL
            ORDER BY
                obs->>'observed_at' DESC NULLS LAST,
                (obs->>'source_quality_score')::NUMERIC DESC
            LIMIT 1
        ) AS best_observed_at,

        -- ===================================================================
        -- METADATA: Quality metrics
        -- ===================================================================
        (
            SELECT AVG((obs->>'source_quality_score')::NUMERIC)
            FROM jsonb_array_elements(all_observations) AS obs
        ) AS avg_source_quality,

        (
            SELECT MAX((obs->>'source_quality_score')::NUMERIC)
            FROM jsonb_array_elements(all_observations) AS obs
        ) AS max_source_quality

    FROM observation_groups
),
completeness_scores AS (
    SELECT
        bssid,
        time_ms,
        best_latitude,
        best_longitude,
        best_accuracy,
        best_altitude,
        best_signal_strength,
        best_ssid,
        best_radio_type,
        best_frequency,
        best_capabilities,
        best_service,
        best_observed_at,
        contributing_sources,
        source_count,
        avg_source_quality,
        max_source_quality,

        -- Calculate completeness score (0-1)
        (
            (CASE WHEN best_latitude IS NOT NULL THEN 0.15 ELSE 0 END) +
            (CASE WHEN best_longitude IS NOT NULL THEN 0.15 ELSE 0 END) +
            (CASE WHEN best_accuracy IS NOT NULL AND best_accuracy <= 50 THEN 0.10 ELSE 0 END) +  -- Bonus for high precision
            (CASE WHEN best_signal_strength IS NOT NULL THEN 0.10 ELSE 0 END) +
            (CASE WHEN best_ssid IS NOT NULL AND best_ssid != '' THEN 0.15 ELSE 0 END) +
            (CASE WHEN best_radio_type IS NOT NULL THEN 0.10 ELSE 0 END) +
            (CASE WHEN best_frequency IS NOT NULL AND best_frequency > 0 THEN 0.10 ELSE 0 END) +
            (CASE WHEN best_capabilities IS NOT NULL THEN 0.10 ELSE 0 END) +
            (CASE WHEN best_service IS NOT NULL THEN 0.05 ELSE 0 END)
        ) AS completeness_score,

        -- Precision score (0-1) - higher = more precise
        (
            (CASE WHEN best_accuracy IS NOT NULL THEN
                LEAST(1.0, 100.0 / GREATEST(best_accuracy, 1.0))  -- Better accuracy = higher score
            ELSE 0.5 END) * 0.4 +

            (CASE WHEN source_count > 1 THEN 0.2 ELSE 0 END) +  -- Multiple sources = more confidence

            (max_source_quality::NUMERIC / 1.0) * 0.4  -- Source quality
        ) AS precision_score

    FROM best_values
)
SELECT
    bssid,
    best_signal_strength AS signal_strength,
    best_latitude AS latitude,
    best_longitude AS longitude,
    best_altitude AS altitude,
    best_accuracy AS accuracy,
    time_ms,
    best_observed_at::TIMESTAMPTZ AS observed_at,
    best_ssid AS ssid,
    best_radio_type AS radio_type,
    best_frequency AS frequency,
    best_capabilities AS capabilities,
    best_service AS service,
    contributing_sources,
    source_count,
    avg_source_quality,
    max_source_quality,
    completeness_score,
    precision_score,

    -- Overall quality = (completeness * precision)
    ROUND((completeness_score * precision_score)::NUMERIC, 3) AS overall_quality,

    -- Reconstruct PostGIS point from best coordinates
    ST_SetSRID(ST_MakePoint(best_longitude, best_latitude), 4326) AS location_point

FROM completeness_scores
WHERE best_latitude IS NOT NULL
  AND best_longitude IS NOT NULL;

COMMENT ON VIEW app.observations_smart_merged_v2 IS
'Precision-aware smart merge - selects highest precision value for each field based on accuracy, quality, and completeness';

-- ============================================================================
-- PRECISION STATISTICS FUNCTION
-- Analyze precision improvements from melding
-- ============================================================================

CREATE OR REPLACE FUNCTION app.get_precision_improvement_stats()
RETURNS TABLE(
    metric TEXT,
    before_melding NUMERIC,
    after_melding NUMERIC,
    improvement_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH source_stats AS (
        -- Stats from individual sources (before melding)
        SELECT
            AVG(CASE WHEN accuracy IS NOT NULL AND accuracy > 0 THEN accuracy ELSE 100 END) as avg_accuracy_before,
            AVG(source_quality_score) as avg_quality_before,
            AVG(
                (CASE WHEN ssid IS NOT NULL AND ssid != '' THEN 0.2 ELSE 0 END) +
                (CASE WHEN frequency IS NOT NULL THEN 0.2 ELSE 0 END) +
                (CASE WHEN capabilities IS NOT NULL THEN 0.2 ELSE 0 END) +
                (CASE WHEN signal_strength IS NOT NULL THEN 0.2 ELSE 0 END) +
                (CASE WHEN altitude IS NOT NULL THEN 0.2 ELSE 0 END)
            ) as avg_completeness_before
        FROM app.observations_federated
    ),
    merged_stats AS (
        -- Stats from merged observations (after melding)
        SELECT
            AVG(CASE WHEN accuracy IS NOT NULL AND accuracy > 0 THEN accuracy ELSE 100 END) as avg_accuracy_after,
            AVG(max_source_quality) as avg_quality_after,
            AVG(completeness_score) as avg_completeness_after
        FROM app.observations_smart_merged_v2
    )
    SELECT
        'GPS Accuracy (lower is better)'::TEXT,
        ROUND(s.avg_accuracy_before::NUMERIC, 2),
        ROUND(m.avg_accuracy_after::NUMERIC, 2),
        ROUND(((s.avg_accuracy_before - m.avg_accuracy_after) / s.avg_accuracy_before * 100)::NUMERIC, 2)
    FROM source_stats s, merged_stats m

    UNION ALL

    SELECT
        'Source Quality Score'::TEXT,
        ROUND(s.avg_quality_before::NUMERIC, 3),
        ROUND(m.avg_quality_after::NUMERIC, 3),
        ROUND(((m.avg_quality_after - s.avg_quality_before) / s.avg_quality_before * 100)::NUMERIC, 2)
    FROM source_stats s, merged_stats m

    UNION ALL

    SELECT
        'Data Completeness'::TEXT,
        ROUND(s.avg_completeness_before::NUMERIC, 3),
        ROUND(m.avg_completeness_after::NUMERIC, 3),
        ROUND(((m.avg_completeness_after - s.avg_completeness_before) / s.avg_completeness_before * 100)::NUMERIC, 2)
    FROM source_stats s, merged_stats m;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.get_precision_improvement_stats IS
'Shows precision and completeness improvements achieved by melding multiple sources';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Get precision improvement statistics
SELECT * FROM app.get_precision_improvement_stats();

-- Example 2: Find observations with highest precision
SELECT
    bssid,
    ssid,
    latitude,
    longitude,
    accuracy,
    precision_score,
    overall_quality,
    source_count,
    contributing_sources
FROM app.observations_smart_merged_v2
ORDER BY precision_score DESC, overall_quality DESC
LIMIT 20;

-- Example 3: Compare precision of single-source vs multi-source observations
SELECT
    CASE WHEN source_count = 1 THEN 'Single Source' ELSE 'Multi Source' END as source_type,
    COUNT(*) as observation_count,
    ROUND(AVG(accuracy)::NUMERIC, 2) as avg_accuracy,
    ROUND(AVG(precision_score)::NUMERIC, 3) as avg_precision_score,
    ROUND(AVG(completeness_score)::NUMERIC, 3) as avg_completeness_score,
    ROUND(AVG(overall_quality)::NUMERIC, 3) as avg_overall_quality
FROM app.observations_smart_merged_v2
GROUP BY CASE WHEN source_count = 1 THEN 'Single Source' ELSE 'Multi Source' END;

-- Example 4: Find observations where melding significantly improved precision
SELECT
    bssid,
    ssid,
    accuracy,
    source_count,
    contributing_sources,
    precision_score,
    overall_quality
FROM app.observations_smart_merged_v2
WHERE source_count > 1
  AND accuracy < 20  -- High precision GPS
  AND completeness_score > 0.8  -- Nearly complete data
ORDER BY overall_quality DESC
LIMIT 50;
*/
