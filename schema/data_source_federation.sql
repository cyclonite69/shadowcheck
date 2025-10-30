-- ============================================================================
-- DATA SOURCE FEDERATION SYSTEM
-- Virtual unified layer for multi-source observations without physical merging
-- ============================================================================

-- ============================================================================
-- PART 1: DATA SOURCE REGISTRY
-- Central registry tracking all observation sources and their characteristics
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.data_source_registry (
    source_id SERIAL PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL CHECK (source_type IN (
        'production',      -- Main production data (locations_legacy)
        'staging',         -- Import staging areas (KML, WiGLE API)
        'enrichment',      -- API-enriched data
        'archive',         -- Historical backups
        'experimental'     -- Test/development data
    )),
    table_name TEXT NOT NULL,
    description TEXT,
    import_pipeline TEXT,     -- Which pipeline feeds this source
    is_active BOOLEAN DEFAULT TRUE,
    is_trusted BOOLEAN DEFAULT TRUE,
    data_quality_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_quality_score BETWEEN 0 AND 1),
    record_count BIGINT DEFAULT 0,
    first_observation_time TIMESTAMPTZ,
    last_observation_time TIMESTAMPTZ,
    last_refresh_time TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,           -- Source-specific metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert known data sources
INSERT INTO app.data_source_registry (
    source_name, source_type, table_name, description, import_pipeline,
    is_active, is_trusted, data_quality_score
) VALUES
    ('locations_legacy', 'production', 'app.locations_legacy',
     'Primary production observation data from WiGLE SQLite imports',
     'wigle_sqlite_parser', TRUE, TRUE, 1.0),

    ('kml_staging', 'staging', 'app.kml_locations_staging',
     'Observations from WiGLE KML export files (includes orphaned networks)',
     'kml_parser', TRUE, TRUE, 0.9),

    ('wigle_api', 'enrichment', 'app.wigle_api_locations_staging',
     'Observations enriched via WiGLE REST API (never merged to production)',
     'wigle_api_enrichment', TRUE, TRUE, 0.95),

    ('kismet_staging', 'staging', 'app.kismet_packets_staging',
     'Packet-level observations from Kismet wardriving captures',
     'kismet_parser', FALSE, TRUE, 0.85)  -- Not active yet
ON CONFLICT (source_name) DO NOTHING;

CREATE INDEX idx_data_source_registry_active ON app.data_source_registry(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_data_source_registry_type ON app.data_source_registry(source_type);

COMMENT ON TABLE app.data_source_registry IS
'Central registry of all observation data sources with quality metrics and metadata';

-- ============================================================================
-- PART 2: UNIFIED OBSERVATION VIEW
-- Virtual layer combining all sources with source tracking
-- ============================================================================

CREATE OR REPLACE VIEW app.observations_federated AS
-- Source 1: Production Legacy Data (436,622 records)
SELECT
    'locations_legacy' AS source_name,
    'production' AS source_type,
    l.unified_id AS observation_id,
    l.bssid,
    l.level AS signal_strength,
    l.lat AS latitude,
    l.lon AS longitude,
    l.altitude,
    l.accuracy,
    l.time AS time_ms,
    to_timestamp(l.time / 1000.0) AS observed_at,

    -- Network metadata (via join)
    n.ssid,
    n.type AS radio_type,
    n.frequency,
    n.capabilities,
    n.service,

    -- Source-specific metadata
    l.source_id AS legacy_source_id,
    NULL::TEXT AS kml_filename,
    NULL::JSONB AS api_query_params,

    -- Geospatial
    ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326) AS location_point,

    -- Data quality
    1.0 AS source_quality_score,
    TRUE AS is_trusted

FROM app.locations_legacy l
LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
WHERE l.lat IS NOT NULL
  AND l.lon IS NOT NULL
  AND l.lat BETWEEN -90 AND 90
  AND l.lon BETWEEN -180 AND 180
  AND NOT (l.lat = 0 AND l.lon = 0)

UNION ALL

-- Source 2: KML Staging Data (461,881 records)
SELECT
    'kml_staging' AS source_name,
    'staging' AS source_type,
    k.kml_obs_id AS observation_id,
    k.bssid,
    k.level AS signal_strength,
    k.lat AS latitude,
    k.lon AS longitude,
    k.altitude,
    k.accuracy,
    k.time AS time_ms,
    to_timestamp(k.time / 1000.0) AS observed_at,

    -- Network metadata (inline in KML)
    k.ssid,
    k.network_type AS radio_type,
    NULL::INTEGER AS frequency,  -- KML doesn't have frequency in observations
    k.encryption_type AS capabilities,
    NULL::TEXT AS service,

    -- Source-specific metadata
    k.source_id AS legacy_source_id,
    k.kml_filename,
    NULL::JSONB AS api_query_params,

    -- Geospatial
    ST_SetSRID(ST_MakePoint(k.lon, k.lat), 4326) AS location_point,

    -- Data quality
    0.9 AS source_quality_score,
    TRUE AS is_trusted

FROM app.kml_locations_staging k
WHERE k.lat IS NOT NULL
  AND k.lon IS NOT NULL
  AND k.lat BETWEEN -90 AND 90
  AND k.lon BETWEEN -180 AND 180
  AND NOT (k.lat = 0 AND k.lon = 0)

UNION ALL

-- Source 3: WiGLE API Enrichment Data (16,517 records)
SELECT
    'wigle_api' AS source_name,
    'enrichment' AS source_type,
    w.wigle_api_loc_id AS observation_id,
    w.bssid,
    w.signal_level AS signal_strength,
    w.lat AS latitude,
    w.lon AS longitude,
    w.altitude,
    w.accuracy,
    EXTRACT(EPOCH FROM w.time)::BIGINT * 1000 AS time_ms,  -- Convert timestamp to ms
    w.time AS observed_at,

    -- Network metadata (must join with wigle_api_networks_staging)
    wn.ssid,
    wn.type AS radio_type,
    wn.frequency,
    wn.capabilities,
    NULL::TEXT AS service,

    -- Source-specific metadata
    NULL::INTEGER AS legacy_source_id,
    NULL::TEXT AS kml_filename,
    w.query_params AS api_query_params,

    -- Geospatial
    ST_SetSRID(ST_MakePoint(w.lon, w.lat), 4326) AS location_point,

    -- Data quality
    0.95 AS source_quality_score,
    TRUE AS is_trusted

FROM app.wigle_api_locations_staging w
LEFT JOIN app.wigle_api_networks_staging wn ON w.bssid = wn.bssid
WHERE w.lat IS NOT NULL
  AND w.lon IS NOT NULL
  AND w.lat BETWEEN -90 AND 90
  AND w.lon BETWEEN -180 AND 180
  AND NOT (w.lat = 0 AND w.lon = 0);

-- Create indexes on underlying tables to speed up federated queries
CREATE INDEX IF NOT EXISTS idx_locations_legacy_coords ON app.locations_legacy(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kml_locations_coords ON app.kml_locations_staging(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wigle_api_locations_coords ON app.wigle_api_locations_staging(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_locations_legacy_bssid_time ON app.locations_legacy(bssid, time);
CREATE INDEX IF NOT EXISTS idx_kml_locations_bssid_time ON app.kml_locations_staging(bssid, time);

COMMENT ON VIEW app.observations_federated IS
'Virtual unified view of all observation sources with source tracking.
Combines production, staging, and enrichment data without physical merging.
Use source_name to filter by specific sources.';

-- ============================================================================
-- PART 3: NETWORK REGISTRY (Unified Network View)
-- Combines network metadata from all sources
-- ============================================================================

CREATE OR REPLACE VIEW app.networks_federated AS
-- Source 1: Production networks
SELECT
    'networks_legacy' AS source_name,
    n.bssid,
    n.ssid,
    n.type AS radio_type,
    n.frequency,
    n.capabilities,
    n.service,
    n.lasttime AS last_seen_ms,
    to_timestamp(n.lasttime / 1000.0) AS last_seen_at,
    n.lastlat AS last_latitude,
    n.lastlon AS last_longitude,
    n.bestlevel AS best_signal,

    -- Observation counts (computed)
    (SELECT COUNT(*) FROM app.locations_legacy l WHERE l.bssid = n.bssid) AS observation_count,

    -- Source metadata
    1.0 AS source_quality_score,
    NULL::TEXT AS kml_filename

FROM app.networks_legacy n

UNION ALL

-- Source 2: KML staging networks
SELECT
    'kml_staging' AS source_name,
    k.bssid,
    k.ssid,
    k.network_type AS radio_type,
    k.frequency,
    k.capabilities,
    NULL::TEXT AS service,
    k.last_seen AS last_seen_ms,
    to_timestamp(k.last_seen / 1000.0) AS last_seen_at,
    NULL::DOUBLE PRECISION AS last_latitude,
    NULL::DOUBLE PRECISION AS last_longitude,
    NULL::INTEGER AS best_signal,

    -- Observation counts
    (SELECT COUNT(*) FROM app.kml_locations_staging l WHERE l.bssid = k.bssid) AS observation_count,

    -- Source metadata
    0.9 AS source_quality_score,
    k.kml_filename

FROM app.kml_networks_staging k

UNION ALL

-- Source 3: WiGLE API networks
SELECT
    'wigle_api' AS source_name,
    w.bssid,
    w.ssid,
    w.type AS radio_type,
    w.frequency,
    w.capabilities,
    NULL::TEXT AS service,
    EXTRACT(EPOCH FROM w.lasttime)::BIGINT * 1000 AS last_seen_ms,
    w.lasttime AS last_seen_at,
    w.trilat AS last_latitude,
    w.trilong AS last_longitude,
    NULL::INTEGER AS best_signal,

    -- Observation counts
    (SELECT COUNT(*) FROM app.wigle_api_locations_staging l WHERE l.bssid = w.bssid) AS observation_count,

    -- Source metadata
    0.95 AS source_quality_score,
    NULL::TEXT AS kml_filename

FROM app.wigle_api_networks_staging w;

COMMENT ON VIEW app.networks_federated IS
'Unified view of network metadata from all sources. Use source_name to filter.';

-- ============================================================================
-- PART 4: SOURCE STATISTICS FUNCTION
-- Real-time statistics for each data source
-- ============================================================================

CREATE OR REPLACE FUNCTION app.get_source_statistics()
RETURNS TABLE(
    source_name TEXT,
    source_type TEXT,
    total_observations BIGINT,
    unique_networks BIGINT,
    date_range_start TIMESTAMPTZ,
    date_range_end TIMESTAMPTZ,
    avg_signal_strength NUMERIC,
    quality_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.source_name,
        o.source_type,
        COUNT(*) AS total_observations,
        COUNT(DISTINCT o.bssid) AS unique_networks,
        MIN(o.observed_at) AS date_range_start,
        MAX(o.observed_at) AS date_range_end,
        ROUND(AVG(o.signal_strength)::NUMERIC, 2) AS avg_signal_strength,
        AVG(o.source_quality_score)::NUMERIC AS quality_score
    FROM app.observations_federated o
    GROUP BY o.source_name, o.source_type
    ORDER BY total_observations DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION app.get_source_statistics IS
'Returns real-time statistics for each observation data source';

-- ============================================================================
-- PART 5: DEDUPLICATION VIEW
-- Identifies duplicate observations across sources
-- ============================================================================

CREATE OR REPLACE VIEW app.observations_deduplicated AS
WITH ranked_observations AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY bssid, time_ms, ROUND(latitude::NUMERIC, 6), ROUND(longitude::NUMERIC, 6)
            ORDER BY
                -- Prioritize by source quality and type
                CASE source_type
                    WHEN 'production' THEN 1
                    WHEN 'enrichment' THEN 2
                    WHEN 'staging' THEN 3
                    ELSE 4
                END,
                source_quality_score DESC
        ) AS rank
    FROM app.observations_federated
)
SELECT
    source_name,
    source_type,
    observation_id,
    bssid,
    signal_strength,
    latitude,
    longitude,
    altitude,
    accuracy,
    time_ms,
    observed_at,
    ssid,
    radio_type,
    frequency,
    capabilities,
    service,
    location_point,
    source_quality_score
FROM ranked_observations
WHERE rank = 1;  -- Keep only the highest priority observation per unique (bssid, time, location)

COMMENT ON VIEW app.observations_deduplicated IS
'Deduplicated observations - keeps highest quality source when same observation exists in multiple sources';

-- ============================================================================
-- PART 6: SOURCE TOGGLE HELPER FUNCTIONS
-- Functions to enable/disable sources and refresh statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION app.toggle_data_source(p_source_name TEXT, p_active BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE app.data_source_registry
    SET is_active = p_active,
        updated_at = NOW()
    WHERE source_name = p_source_name;

    IF FOUND THEN
        RAISE NOTICE 'Data source % set to active=%', p_source_name, p_active;
        RETURN TRUE;
    ELSE
        RAISE WARNING 'Data source % not found', p_source_name;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app.refresh_source_statistics()
RETURNS TABLE(
    source_name TEXT,
    updated_count BIGINT,
    record_count BIGINT
) AS $$
BEGIN
    -- Update registry with current statistics
    UPDATE app.data_source_registry r
    SET
        record_count = COALESCE(stats.total_observations, 0),
        first_observation_time = stats.date_range_start,
        last_observation_time = stats.date_range_end,
        last_refresh_time = NOW(),
        updated_at = NOW()
    FROM app.get_source_statistics() stats
    WHERE r.source_name = stats.source_name;

    -- Return updated statistics
    RETURN QUERY
    SELECT
        r.source_name,
        1::BIGINT AS updated_count,
        r.record_count
    FROM app.data_source_registry r
    WHERE r.is_active = TRUE
    ORDER BY r.record_count DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.toggle_data_source IS
'Enable or disable a data source in the registry';

COMMENT ON FUNCTION app.refresh_source_statistics IS
'Refresh record counts and timestamps for all data sources';

-- ============================================================================
-- PART 7: INITIAL STATISTICS REFRESH
-- ============================================================================

SELECT app.refresh_source_statistics();

-- ============================================================================
-- PART 8: GRANTS (if using role-based access)
-- ============================================================================

-- Grant read access to views
-- GRANT SELECT ON app.observations_federated TO shadowcheck_read_role;
-- GRANT SELECT ON app.networks_federated TO shadowcheck_read_role;
-- GRANT SELECT ON app.observations_deduplicated TO shadowcheck_read_role;
-- GRANT SELECT ON app.data_source_registry TO shadowcheck_read_role;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Query all observations from all sources
SELECT source_name, COUNT(*) as count
FROM app.observations_federated
GROUP BY source_name;

-- Example 2: Query only production data
SELECT * FROM app.observations_federated
WHERE source_name = 'locations_legacy'
LIMIT 100;

-- Example 3: Query deduplicated observations (no duplicates across sources)
SELECT * FROM app.observations_deduplicated
ORDER BY observed_at DESC
LIMIT 100;

-- Example 4: Get source statistics
SELECT * FROM app.get_source_statistics();

-- Example 5: Toggle a source off
SELECT app.toggle_data_source('kml_staging', FALSE);

-- Example 6: Find observations that exist in multiple sources
SELECT
    bssid,
    time_ms,
    COUNT(DISTINCT source_name) as source_count,
    array_agg(DISTINCT source_name) as sources
FROM app.observations_federated
GROUP BY bssid, time_ms
HAVING COUNT(DISTINCT source_name) > 1
LIMIT 20;

-- Example 7: Compare observation counts by radio type across sources
SELECT
    source_name,
    radio_type,
    COUNT(*) as observations,
    COUNT(DISTINCT bssid) as unique_networks
FROM app.observations_federated
WHERE radio_type IS NOT NULL
GROUP BY source_name, radio_type
ORDER BY source_name, observations DESC;
*/
