-- ============================================================================
-- SMART DATA MERGE - Best-of-Breed Multi-Source Data Fusion
-- Takes the most complete and accurate data from each source
-- ============================================================================

-- ============================================================================
-- FIELD-LEVEL QUALITY SCORING
-- Assigns quality scores to individual fields based on source characteristics
-- ============================================================================

CREATE OR REPLACE FUNCTION app.score_field_quality(
    field_value ANYELEMENT,
    source_name TEXT,
    field_name TEXT
)
RETURNS NUMERIC AS $$
DECLARE
    base_score NUMERIC := 0;
    completeness_bonus NUMERIC := 0;
    source_bonus NUMERIC := 0;
BEGIN
    -- Base score: is field populated?
    IF field_value IS NOT NULL AND field_value::TEXT != '' THEN
        base_score := 0.5;
    ELSE
        RETURN 0.0;  -- NULL fields get zero score
    END IF;

    -- Completeness bonus for detailed values
    completeness_bonus := CASE
        WHEN LENGTH(field_value::TEXT) > 10 THEN 0.2  -- Detailed value
        WHEN LENGTH(field_value::TEXT) > 3 THEN 0.1   -- Basic value
        ELSE 0.05  -- Minimal value
    END;

    -- Source-specific bonuses based on which source is best for which field
    source_bonus := CASE
        -- GPS coordinates: locations_legacy is most accurate (from WiGLE app with GPS)
        WHEN field_name IN ('latitude', 'longitude', 'altitude', 'accuracy') THEN
            CASE source_name
                WHEN 'locations_legacy' THEN 0.3
                WHEN 'kml_staging' THEN 0.2
                WHEN 'wigle_api' THEN 0.15
                ELSE 0.1
            END

        -- SSID: KML has it inline, others via join
        WHEN field_name = 'ssid' THEN
            CASE source_name
                WHEN 'kml_staging' THEN 0.3    -- Has SSID inline
                WHEN 'wigle_api' THEN 0.25     -- API enriched
                WHEN 'locations_legacy' THEN 0.15  -- Via join (may be stale)
                ELSE 0.1
            END

        -- Radio type: KML and API have explicit type, legacy may be inferred
        WHEN field_name = 'radio_type' THEN
            CASE source_name
                WHEN 'wigle_api' THEN 0.3      -- API validated
                WHEN 'kml_staging' THEN 0.25   -- From export
                WHEN 'locations_legacy' THEN 0.2   -- From network join
                ELSE 0.1
            END

        -- Frequency: legacy data is most reliable (from radio chipset)
        WHEN field_name = 'frequency' THEN
            CASE source_name
                WHEN 'locations_legacy' THEN 0.3
                WHEN 'wigle_api' THEN 0.2
                WHEN 'kml_staging' THEN 0.1    -- KML often doesn't have frequency
                ELSE 0.05
            END

        -- Capabilities: legacy has raw data from radio
        WHEN field_name = 'capabilities' THEN
            CASE source_name
                WHEN 'locations_legacy' THEN 0.3
                WHEN 'kml_staging' THEN 0.2
                WHEN 'wigle_api' THEN 0.15
                ELSE 0.1
            END

        -- Signal strength: all sources equally valid (measurement at time/place)
        WHEN field_name = 'signal_strength' THEN 0.2

        -- Timestamp: all sources valid
        WHEN field_name IN ('time_ms', 'observed_at') THEN 0.2

        ELSE 0.1  -- Default
    END;

    RETURN LEAST(base_score + completeness_bonus + source_bonus, 1.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION app.score_field_quality IS
'Scores the quality of a field value (0-1) based on completeness and source characteristics';

-- ============================================================================
-- SMART MERGED OBSERVATIONS VIEW
-- For each unique observation, selects the best field value from all sources
-- ============================================================================

CREATE OR REPLACE VIEW app.observations_smart_merged AS
WITH observation_groups AS (
    -- Group observations by BSSID + time + approximate location
    SELECT
        bssid,
        time_ms,
        ROUND(latitude::NUMERIC, 5) AS lat_rounded,
        ROUND(longitude::NUMERIC, 5) AS lon_rounded,
        -- Collect all observations for this group
        jsonb_agg(
            jsonb_build_object(
                'source_name', source_name,
                'source_type', source_type,
                'observation_id', observation_id,
                'signal_strength', signal_strength,
                'latitude', latitude,
                'longitude', longitude,
                'altitude', altitude,
                'accuracy', accuracy,
                'time_ms', time_ms,
                'observed_at', observed_at,
                'ssid', ssid,
                'radio_type', radio_type,
                'frequency', frequency,
                'capabilities', capabilities,
                'service', service,
                'source_quality_score', source_quality_score,
                'kml_filename', kml_filename,
                'api_query_params', api_query_params
            ) ORDER BY source_quality_score DESC  -- Pre-sort by quality
        ) AS all_observations
    FROM app.observations_federated
    GROUP BY bssid, time_ms, lat_rounded, lon_rounded
),
best_values AS (
    SELECT
        bssid,
        time_ms,
        lat_rounded,
        lon_rounded,
        all_observations,

        -- For each field, select the value from the source with highest quality score
        -- GPS coordinates: prefer locations_legacy
        (SELECT (obs->>'latitude')::DOUBLE PRECISION
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'source_name' = 'locations_legacy'
         LIMIT 1) AS best_latitude,

        (SELECT (obs->>'longitude')::DOUBLE PRECISION
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'source_name' = 'locations_legacy'
         LIMIT 1) AS best_longitude,

        (SELECT (obs->>'altitude')::DOUBLE PRECISION
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'altitude' IS NOT NULL
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'locations_legacy' THEN 1
                 WHEN 'kml_staging' THEN 2
                 ELSE 3
             END
         LIMIT 1) AS best_altitude,

        (SELECT (obs->>'accuracy')::DOUBLE PRECISION
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'accuracy' IS NOT NULL
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'locations_legacy' THEN 1
                 WHEN 'wigle_api' THEN 2
                 ELSE 3
             END
         LIMIT 1) AS best_accuracy,

        -- Signal strength: take strongest signal OR most recent measurement
        (SELECT (obs->>'signal_strength')::INTEGER
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'signal_strength' IS NOT NULL
         ORDER BY (obs->>'signal_strength')::INTEGER DESC
         LIMIT 1) AS best_signal_strength,

        -- SSID: prefer sources that have it inline (KML, API)
        (SELECT obs->>'ssid'
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'ssid' IS NOT NULL AND obs->>'ssid' != ''
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'kml_staging' THEN 1
                 WHEN 'wigle_api' THEN 2
                 WHEN 'locations_legacy' THEN 3
                 ELSE 4
             END,
             LENGTH(obs->>'ssid') DESC  -- Prefer longer/more complete SSIDs
         LIMIT 1) AS best_ssid,

        -- Radio type: prefer validated sources
        (SELECT obs->>'radio_type'
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'radio_type' IS NOT NULL AND obs->>'radio_type' != ''
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'wigle_api' THEN 1
                 WHEN 'kml_staging' THEN 2
                 WHEN 'locations_legacy' THEN 3
                 ELSE 4
             END
         LIMIT 1) AS best_radio_type,

        -- Frequency: prefer legacy (direct from radio chipset)
        (SELECT (obs->>'frequency')::INTEGER
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'frequency' IS NOT NULL AND (obs->>'frequency')::INTEGER > 0
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'locations_legacy' THEN 1
                 WHEN 'wigle_api' THEN 2
                 ELSE 3
             END
         LIMIT 1) AS best_frequency,

        -- Capabilities: prefer legacy (raw from radio)
        (SELECT obs->>'capabilities'
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'capabilities' IS NOT NULL AND obs->>'capabilities' != ''
         ORDER BY
             CASE obs->>'source_name'
                 WHEN 'locations_legacy' THEN 1
                 WHEN 'kml_staging' THEN 2
                 ELSE 3
             END,
             LENGTH(obs->>'capabilities') DESC  -- Prefer more detailed
         LIMIT 1) AS best_capabilities,

        -- Service: currently only in legacy
        (SELECT obs->>'service'
         FROM jsonb_array_elements(all_observations) AS obs
         WHERE obs->>'service' IS NOT NULL AND obs->>'service' != ''
         LIMIT 1) AS best_service,

        -- Metadata: collect all source names and quality scores
        (SELECT array_agg(DISTINCT obs->>'source_name')
         FROM jsonb_array_elements(all_observations) AS obs) AS contributing_sources,
        (SELECT COUNT(DISTINCT obs->>'source_name')
         FROM jsonb_array_elements(all_observations) AS obs) AS source_count,
        (SELECT AVG((obs->>'source_quality_score')::NUMERIC)
         FROM jsonb_array_elements(all_observations) AS obs) AS avg_source_quality,
        (SELECT MAX((obs->>'source_quality_score')::NUMERIC)
         FROM jsonb_array_elements(all_observations) AS obs) AS max_source_quality

    FROM observation_groups
    GROUP BY bssid, time_ms, lat_rounded, lon_rounded, all_observations
)
SELECT
    -- Identifiers
    bssid,
    time_ms,
    to_timestamp(time_ms / 1000.0) AS observed_at,

    -- Best values from all sources
    best_latitude AS latitude,
    best_longitude AS longitude,
    best_altitude AS altitude,
    best_accuracy AS accuracy,
    best_signal_strength AS signal_strength,
    best_ssid AS ssid,
    best_radio_type AS radio_type,
    best_frequency AS frequency,
    best_capabilities AS capabilities,
    best_service AS service,

    -- Geospatial (using best coordinates)
    ST_SetSRID(ST_MakePoint(best_longitude, best_latitude), 4326) AS location_point,

    -- Data provenance
    contributing_sources,
    source_count,
    avg_source_quality,
    max_source_quality,

    -- Data completeness score (how many fields are populated?)
    (
        (CASE WHEN best_latitude IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN best_longitude IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN best_signal_strength IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN best_ssid IS NOT NULL AND best_ssid != '' THEN 1 ELSE 0 END) +
        (CASE WHEN best_radio_type IS NOT NULL AND best_radio_type != '' THEN 1 ELSE 0 END) +
        (CASE WHEN best_frequency IS NOT NULL AND best_frequency > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN best_capabilities IS NOT NULL AND best_capabilities != '' THEN 1 ELSE 0 END) +
        (CASE WHEN best_altitude IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN best_accuracy IS NOT NULL THEN 1 ELSE 0 END)
    )::NUMERIC / 9.0 AS completeness_score

FROM best_values
WHERE best_latitude IS NOT NULL AND best_longitude IS NOT NULL;  -- Must have location

CREATE INDEX IF NOT EXISTS idx_smart_merged_bssid ON app.observations_smart_merged USING HASH(bssid);
CREATE INDEX IF NOT EXISTS idx_smart_merged_time ON app.observations_smart_merged(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_smart_merged_location ON app.observations_smart_merged USING GIST(location_point);

COMMENT ON VIEW app.observations_smart_merged IS
'Intelligently merged observations: for each unique observation, selects the best field value from all available sources based on source quality and field-specific prioritization. Creates the most complete and accurate picture possible.';

-- ============================================================================
-- SMART MERGED NETWORKS VIEW
-- For each network, combines metadata from all sources
-- ============================================================================

CREATE OR REPLACE VIEW app.networks_smart_merged AS
WITH network_sources AS (
    SELECT
        bssid,
        array_agg(
            jsonb_build_object(
                'source_name', source_name,
                'ssid', ssid,
                'radio_type', radio_type,
                'frequency', frequency,
                'capabilities', capabilities,
                'service', service,
                'last_seen_at', last_seen_at,
                'observation_count', observation_count,
                'source_quality_score', source_quality_score
            ) ORDER BY source_quality_score DESC
        ) AS all_sources
    FROM app.networks_federated
    GROUP BY bssid
)
SELECT
    bssid,

    -- Best SSID (prefer non-null, longer values, from trusted sources)
    (SELECT src->>'ssid'
     FROM unnest(all_sources) AS src
     WHERE src->>'ssid' IS NOT NULL AND src->>'ssid' != ''
     ORDER BY
         CASE src->>'source_name'
             WHEN 'wigle_api' THEN 1      -- API most likely to have correct SSID
             WHEN 'kml_staging' THEN 2    -- KML has inline SSID
             WHEN 'networks_legacy' THEN 3
             ELSE 4
         END,
         LENGTH(src->>'ssid') DESC
     LIMIT 1) AS ssid,

    -- Best radio type
    (SELECT src->>'radio_type'
     FROM unnest(all_sources) AS src
     WHERE src->>'radio_type' IS NOT NULL
     ORDER BY
         CASE src->>'source_name'
             WHEN 'wigle_api' THEN 1
             WHEN 'kml_staging' THEN 2
             ELSE 3
         END
     LIMIT 1) AS radio_type,

    -- Best frequency
    (SELECT (src->>'frequency')::INTEGER
     FROM unnest(all_sources) AS src
     WHERE src->>'frequency' IS NOT NULL AND (src->>'frequency')::INTEGER > 0
     ORDER BY
         CASE src->>'source_name'
             WHEN 'networks_legacy' THEN 1
             WHEN 'wigle_api' THEN 2
             ELSE 3
         END
     LIMIT 1) AS frequency,

    -- Best capabilities (prefer longer/more detailed)
    (SELECT src->>'capabilities'
     FROM unnest(all_sources) AS src
     WHERE src->>'capabilities' IS NOT NULL AND src->>'capabilities' != ''
     ORDER BY
         LENGTH(src->>'capabilities') DESC,
         CASE src->>'source_name'
             WHEN 'networks_legacy' THEN 1
             WHEN 'kml_staging' THEN 2
             ELSE 3
         END
     LIMIT 1) AS capabilities,

    -- Best service
    (SELECT src->>'service'
     FROM unnest(all_sources) AS src
     WHERE src->>'service' IS NOT NULL
     LIMIT 1) AS service,

    -- Most recent observation
    (SELECT (src->>'last_seen_at')::TIMESTAMPTZ
     FROM unnest(all_sources) AS src
     WHERE src->>'last_seen_at' IS NOT NULL
     ORDER BY (src->>'last_seen_at')::TIMESTAMPTZ DESC
     LIMIT 1) AS last_seen_at,

    -- Total observations across all sources
    (SELECT SUM((src->>'observation_count')::BIGINT)
     FROM unnest(all_sources) AS src
     WHERE src->>'observation_count' IS NOT NULL) AS total_observations,

    -- Metadata
    (SELECT array_agg(DISTINCT src->>'source_name')
     FROM unnest(all_sources) AS src) AS contributing_sources,

    (SELECT COUNT(DISTINCT src->>'source_name')
     FROM unnest(all_sources) AS src) AS source_count,

    (SELECT MAX((src->>'source_quality_score')::NUMERIC)
     FROM unnest(all_sources) AS src) AS max_source_quality,

    -- Completeness score
    (
        (CASE WHEN (SELECT src->>'ssid' FROM unnest(all_sources) AS src WHERE src->>'ssid' IS NOT NULL LIMIT 1) IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT src->>'radio_type' FROM unnest(all_sources) AS src WHERE src->>'radio_type' IS NOT NULL LIMIT 1) IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT (src->>'frequency')::INTEGER FROM unnest(all_sources) AS src WHERE (src->>'frequency')::INTEGER > 0 LIMIT 1) IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN (SELECT src->>'capabilities' FROM unnest(all_sources) AS src WHERE src->>'capabilities' IS NOT NULL LIMIT 1) IS NOT NULL THEN 1 ELSE 0 END)
    )::NUMERIC / 4.0 AS completeness_score

FROM network_sources;

COMMENT ON VIEW app.networks_smart_merged IS
'Intelligently merged network metadata from all sources, selecting the best value for each field';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Query smart merged observations (best of all sources)
SELECT
    bssid,
    ssid,
    radio_type,
    frequency,
    signal_strength,
    contributing_sources,
    completeness_score
FROM app.observations_smart_merged
ORDER BY observed_at DESC
LIMIT 100;

-- Example 2: Find observations with data from multiple sources
SELECT
    bssid,
    ssid,
    source_count,
    contributing_sources,
    completeness_score
FROM app.observations_smart_merged
WHERE source_count > 1
ORDER BY source_count DESC, completeness_score DESC
LIMIT 50;

-- Example 3: Compare completeness scores
SELECT
    'federated_raw' AS view_type,
    AVG(CASE WHEN ssid IS NOT NULL THEN 1.0 ELSE 0.0 END) AS ssid_coverage,
    AVG(CASE WHEN frequency IS NOT NULL AND frequency > 0 THEN 1.0 ELSE 0.0 END) AS freq_coverage
FROM app.observations_federated

UNION ALL

SELECT
    'smart_merged' AS view_type,
    AVG(CASE WHEN ssid IS NOT NULL THEN 1.0 ELSE 0.0 END) AS ssid_coverage,
    AVG(CASE WHEN frequency IS NOT NULL AND frequency > 0 THEN 1.0 ELSE 0.0 END) AS freq_coverage
FROM app.observations_smart_merged;

-- Example 4: Networks with enriched data from multiple sources
SELECT
    bssid,
    ssid,
    radio_type,
    frequency,
    contributing_sources,
    completeness_score
FROM app.networks_smart_merged
WHERE source_count >= 2
  AND completeness_score > 0.75
ORDER BY completeness_score DESC, total_observations DESC
LIMIT 100;
*/
