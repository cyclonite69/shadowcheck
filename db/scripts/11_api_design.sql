-- ShadowCheck Database Refactor - Phase 11: API Endpoint Design
-- Database views and functions optimized for REST API consumption
-- Designed for minimal API logic - database does the heavy lifting

-- Core API Views (read-optimized for common endpoints)

-- Networks API view - comprehensive network information
CREATE OR REPLACE VIEW app.api_networks AS
SELECT
    ap.access_point_id,
    ap.mac_address,
    ap.current_network_name,
    ap.is_hidden_network,
    ap.radio_technology,
    ap.primary_frequency_hz,
    ap.max_signal_observed_dbm,
    ap.is_mobile_device,
    ap.mobility_confidence_score,

    -- Spatial data (GeoJSON format for API consumption)
    CASE
        WHEN ap.primary_location_point IS NOT NULL
        THEN ST_AsGeoJSON(ap.primary_location_point)::jsonb
        ELSE NULL
    END as location_geojson,

    -- Aggregated statistics
    ap.total_observations,
    ap.unique_data_sources,

    -- Manufacturer information
    oui.organization_name as manufacturer,
    oui.oui_prefix_hex,

    -- Temporal information
    (SELECT MIN(measurement_timestamp) FROM app.signal_measurements sm
     WHERE sm.access_point_id = ap.access_point_id) as first_seen,
    (SELECT MAX(measurement_timestamp) FROM app.signal_measurements sm
     WHERE sm.access_point_id = ap.access_point_id) as last_seen,

    -- Quality indicators
    CASE
        WHEN ap.total_observations >= 50 THEN 'high'
        WHEN ap.total_observations >= 10 THEN 'medium'
        ELSE 'low'
    END as data_quality,

    ap.record_created_at,
    ap.record_updated_at

FROM app.wireless_access_points ap
LEFT JOIN app.oui_manufacturers oui ON oui.manufacturer_id = ap.manufacturer_id;

-- Observations API view - signal and position data
CREATE OR REPLACE VIEW app.api_observations AS
SELECT
    sm.measurement_id,
    sm.access_point_id,
    ap.mac_address,
    ap.current_network_name,

    -- Signal data
    sm.signal_strength_dbm,
    sm.noise_floor_dbm,
    sm.snr_db,
    sm.encryption_type,
    sm.channel_number,

    -- Position data (if available)
    pm.latitude_degrees,
    pm.longitude_degrees,
    pm.altitude_meters,
    pm.position_accuracy_meters,
    CASE
        WHEN pm.position_point IS NOT NULL
        THEN ST_AsGeoJSON(pm.position_point)::jsonb
        ELSE NULL
    END as location_geojson,

    -- Temporal data
    sm.measurement_timestamp,
    EXTRACT(EPOCH FROM sm.measurement_timestamp)::bigint as timestamp_unix,

    -- Data source and quality
    ds.source_name,
    ds.source_type,
    ds.pipeline_priority,
    sm.data_confidence_score,
    sm.is_canonical_observation,

    -- Movement data (if available)
    pm.speed_mps,
    pm.heading_degrees

FROM app.signal_measurements sm
JOIN app.wireless_access_points ap ON ap.access_point_id = sm.access_point_id
JOIN app.data_sources ds ON ds.data_source_id = sm.data_source_id
LEFT JOIN app.position_measurements pm ON pm.access_point_id = sm.access_point_id
    AND ABS(EXTRACT(EPOCH FROM (sm.measurement_timestamp - pm.measurement_timestamp))) < 300;

-- Coverage API view - network coverage areas
CREATE OR REPLACE VIEW app.api_coverage AS
SELECT
    nc.access_point_id,
    nc.mac_address,
    nc.current_network_name,
    nc.observation_count,

    -- Coverage geometries (GeoJSON format)
    ST_AsGeoJSON(nc.coverage_polygon_concave)::jsonb as coverage_area_geojson,
    ST_AsGeoJSON(nc.signal_weighted_center)::jsonb as center_point_geojson,
    ST_AsGeoJSON(nc.estimated_coverage_circle)::jsonb as estimated_coverage_geojson,

    -- Coverage metrics
    nc.coverage_area_concave_sqm,
    nc.estimated_coverage_area_sqm,
    nc.max_estimated_range,
    nc.avg_estimated_range,
    nc.coverage_quality_score,

    -- Signal characteristics
    nc.strongest_signal,
    nc.weakest_signal

FROM app.mv_network_coverage nc;

-- Routes API view - movement tracking
CREATE OR REPLACE VIEW app.api_routes AS
SELECT
    mr.route_id,
    mr.data_source_id,
    mr.route_date,

    -- Route geometry (GeoJSON format)
    ST_AsGeoJSON(mr.route_geometry)::jsonb as route_geojson,
    ST_AsGeoJSON(mr.start_point)::jsonb as start_point_geojson,
    ST_AsGeoJSON(mr.end_point)::jsonb as end_point_geojson,

    -- Route metrics
    mr.point_count,
    mr.total_distance_meters,
    mr.duration_hours,
    mr.movement_type,
    mr.route_efficiency,

    -- Temporal data
    mr.start_time,
    mr.end_time,
    EXTRACT(EPOCH FROM mr.start_time)::bigint as start_timestamp_unix,
    EXTRACT(EPOCH FROM mr.end_time)::bigint as end_timestamp_unix,

    -- Movement characteristics
    mr.avg_speed_mps,
    mr.max_speed_mps,
    mr.significant_stops

FROM app.mv_movement_routes mr;

-- Security analysis API view - stalking and suspicious activity
CREATE OR REPLACE VIEW app.api_security_analysis AS
SELECT
    'colocation' as analysis_type,
    cp.device_1_id,
    cp.device_2_id,
    ap1.mac_address as device_1_mac,
    ap2.mac_address as device_2_mac,
    cp.colocation_count,
    cp.avg_distance_meters,
    cp.stalking_risk_score,
    cp.risk_classification,
    cp.first_colocation,
    cp.last_colocation,
    NULL::bigint as change_event_id,
    NULL::text as change_type

FROM app.mv_colocation_patterns cp
JOIN app.wireless_access_points ap1 ON ap1.access_point_id = cp.device_1_id
JOIN app.wireless_access_points ap2 ON ap2.access_point_id = cp.device_2_id
WHERE cp.stalking_risk_score > 0.3

UNION ALL

SELECT
    'network_change' as analysis_type,
    nce.primary_access_point_id as device_1_id,
    nce.related_access_point_id as device_2_id,
    ap1.mac_address as device_1_mac,
    ap2.mac_address as device_2_mac,
    NULL::bigint as colocation_count,
    nce.spatial_distance_meters as avg_distance_meters,
    nce.behavioral_anomaly_score as stalking_risk_score,
    nce.event_type as risk_classification,
    nce.detection_timestamp as first_colocation,
    nce.detection_timestamp as last_colocation,
    nce.event_id as change_event_id,
    nce.event_type as change_type

FROM app.network_change_events nce
JOIN app.wireless_access_points ap1 ON ap1.access_point_id = nce.primary_access_point_id
LEFT JOIN app.wireless_access_points ap2 ON ap2.access_point_id = nce.related_access_point_id
WHERE nce.behavioral_anomaly_score > 0.3;

-- API Functions for common operations

-- Search networks by location (spatial query)
CREATE OR REPLACE FUNCTION app.api_search_networks_by_location(
    p_latitude NUMERIC,
    p_longitude NUMERIC,
    p_radius_meters NUMERIC DEFAULT 1000,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    access_point_id BIGINT,
    mac_address TEXT,
    network_name TEXT,
    distance_meters NUMERIC,
    signal_strength_dbm SMALLINT,
    last_seen TIMESTAMPTZ,
    data_quality TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        an.access_point_id,
        an.mac_address,
        an.current_network_name,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(
                (an.location_geojson->>'coordinates')::jsonb->>0,
                (an.location_geojson->>'coordinates')::jsonb->>1
            ), 4326)::geography
        ) as distance_meters,
        an.max_signal_observed_dbm,
        (SELECT MAX(sm.measurement_timestamp)
         FROM app.signal_measurements sm
         WHERE sm.access_point_id = an.access_point_id) as last_seen,
        an.data_quality
    FROM app.api_networks an
    WHERE an.location_geojson IS NOT NULL
      AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(
              (an.location_geojson->>'coordinates')::jsonb->>0,
              (an.location_geojson->>'coordinates')::jsonb->>1
          ), 4326)::geography,
          p_radius_meters
      )
    ORDER BY distance_meters
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Search networks by name/SSID (text search)
CREATE OR REPLACE FUNCTION app.api_search_networks_by_name(
    p_search_text TEXT,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    access_point_id BIGINT,
    mac_address TEXT,
    network_name TEXT,
    match_rank REAL,
    total_observations INTEGER,
    last_seen TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        an.access_point_id,
        an.mac_address,
        an.current_network_name,
        ts_rank(to_tsvector('english', an.current_network_name), plainto_tsquery('english', p_search_text)) as match_rank,
        an.total_observations,
        (SELECT MAX(sm.measurement_timestamp)
         FROM app.signal_measurements sm
         WHERE sm.access_point_id = an.access_point_id) as last_seen
    FROM app.api_networks an
    WHERE an.current_network_name IS NOT NULL
      AND to_tsvector('english', an.current_network_name) @@ plainto_tsquery('english', p_search_text)
    ORDER BY match_rank DESC, total_observations DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get network timeline (temporal analysis)
CREATE OR REPLACE FUNCTION app.api_network_timeline(
    p_access_point_id BIGINT,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
    measurement_timestamp TIMESTAMPTZ,
    signal_strength_dbm SMALLINT,
    latitude_degrees NUMERIC,
    longitude_degrees NUMERIC,
    data_source TEXT,
    event_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Signal measurements
    SELECT
        sm.measurement_timestamp,
        sm.signal_strength_dbm,
        pm.latitude_degrees,
        pm.longitude_degrees,
        ds.source_name as data_source,
        'signal_measurement'::TEXT as event_type
    FROM app.signal_measurements sm
    JOIN app.data_sources ds ON ds.data_source_id = sm.data_source_id
    LEFT JOIN app.position_measurements pm ON pm.access_point_id = sm.access_point_id
        AND ABS(EXTRACT(EPOCH FROM (sm.measurement_timestamp - pm.measurement_timestamp))) < 300
    WHERE sm.access_point_id = p_access_point_id
      AND sm.is_canonical_observation = TRUE
      AND (p_start_date IS NULL OR sm.measurement_timestamp >= p_start_date)
      AND (p_end_date IS NULL OR sm.measurement_timestamp <= p_end_date)

    UNION ALL

    -- Network identity changes
    SELECT
        nih.valid_from_timestamp as measurement_timestamp,
        NULL::SMALLINT as signal_strength_dbm,
        NULL::NUMERIC as latitude_degrees,
        NULL::NUMERIC as longitude_degrees,
        'identity_tracking'::TEXT as data_source,
        ('ssid_change:' || COALESCE(nih.ssid_value, '<hidden>'))::TEXT as event_type
    FROM app.network_identity_history nih
    WHERE nih.access_point_id = p_access_point_id
      AND (p_start_date IS NULL OR nih.valid_from_timestamp >= p_start_date)
      AND (p_end_date IS NULL OR nih.valid_from_timestamp <= p_end_date)

    ORDER BY measurement_timestamp;
END;
$$ LANGUAGE plpgsql;

-- API statistics and analytics
CREATE OR REPLACE FUNCTION app.api_database_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_networks', (SELECT COUNT(*) FROM app.wireless_access_points),
        'total_observations', (SELECT COUNT(*) FROM app.signal_measurements),
        'total_positions', (SELECT COUNT(*) FROM app.position_measurements),
        'unique_manufacturers', (SELECT COUNT(DISTINCT manufacturer_id) FROM app.wireless_access_points WHERE manufacturer_id IS NOT NULL),
        'data_sources', (SELECT jsonb_agg(jsonb_build_object('name', source_name, 'type', source_type, 'records',
            (SELECT COUNT(*) FROM app.signal_measurements sm WHERE sm.data_source_id = ds.data_source_id)))
            FROM app.data_sources ds),
        'date_range', jsonb_build_object(
            'earliest', (SELECT MIN(measurement_timestamp) FROM app.signal_measurements),
            'latest', (SELECT MAX(measurement_timestamp) FROM app.signal_measurements)
        ),
        'technology_breakdown', (SELECT jsonb_object_agg(radio_technology, cnt)
            FROM (SELECT radio_technology, COUNT(*) as cnt FROM app.wireless_access_points GROUP BY radio_technology) t),
        'last_updated', NOW()
    ) INTO stats;

    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- API rate limiting and access control (placeholder for application layer)
CREATE TABLE app.api_access_log (
    access_id BIGSERIAL PRIMARY KEY,
    api_key_hash TEXT,
    endpoint TEXT NOT NULL,
    request_method TEXT,
    request_params JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    access_timestamp TIMESTAMPTZ DEFAULT NOW(),
    client_ip INET,
    user_agent TEXT
);

-- API access control function
CREATE OR REPLACE FUNCTION app.log_api_access(
    p_api_key_hash TEXT,
    p_endpoint TEXT,
    p_method TEXT,
    p_params JSONB DEFAULT NULL,
    p_status INTEGER DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO app.api_access_log (
        api_key_hash, endpoint, request_method, request_params,
        response_status, response_time_ms
    ) VALUES (
        p_api_key_hash, p_endpoint, p_method, p_params,
        p_status, p_response_time_ms
    );
END;
$$ LANGUAGE plpgsql;

-- Indexes for API performance
CREATE INDEX CONCURRENTLY idx_api_networks_location ON app.wireless_access_points USING GIST (primary_location_point) WHERE primary_location_point IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_api_observations_timestamp ON app.signal_measurements (measurement_timestamp DESC) WHERE is_canonical_observation = TRUE;
CREATE INDEX CONCURRENTLY idx_api_access_log_timestamp ON app.api_access_log (access_timestamp);
CREATE INDEX CONCURRENTLY idx_api_access_log_endpoint ON app.api_access_log (endpoint, access_timestamp);

-- Row Level Security for API access (if needed)
ALTER TABLE app.api_access_log ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON VIEW app.api_networks IS 'API-optimized view of wireless networks with GeoJSON locations';
COMMENT ON VIEW app.api_observations IS 'API-optimized view of signal and position observations';
COMMENT ON VIEW app.api_coverage IS 'API-optimized view of network coverage areas in GeoJSON format';
COMMENT ON VIEW app.api_routes IS 'API-optimized view of movement routes with GeoJSON geometry';
COMMENT ON VIEW app.api_security_analysis IS 'Security analysis results for suspicious activity detection';

COMMENT ON FUNCTION app.api_search_networks_by_location(NUMERIC, NUMERIC, NUMERIC, INTEGER) IS 'Spatial search for networks within radius of coordinates';
COMMENT ON FUNCTION app.api_search_networks_by_name(TEXT, INTEGER) IS 'Full-text search for networks by SSID/name';
COMMENT ON FUNCTION app.api_network_timeline(BIGINT, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Get temporal timeline of network activity and changes';
COMMENT ON FUNCTION app.api_database_stats() IS 'Get comprehensive database statistics in JSON format';
COMMENT ON FUNCTION app.log_api_access(TEXT, TEXT, TEXT, JSONB, INTEGER, INTEGER) IS 'Log API access for rate limiting and monitoring';