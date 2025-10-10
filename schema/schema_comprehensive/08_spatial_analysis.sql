-- ShadowCheck Database Refactor - Phase 8: PostGIS Spatial Analysis Capabilities
-- Advanced geospatial analysis for SIGINT operations: clustering, coverage, routes, stalking detection

-- Location Visit Clustering (automatic detection of significant locations)
CREATE MATERIALIZED VIEW app.mv_location_clusters AS
WITH position_clusters AS (
    SELECT
        pm.position_id,
        pm.data_source_id,
        pm.measurement_timestamp,
        pm.position_point,
        ST_ClusterKMeans(pm.position_point, 20) OVER (PARTITION BY pm.data_source_id) as cluster_id
    FROM app.position_measurements pm
    WHERE pm.position_accuracy_meters < 100  -- Only use accurate positions
),
cluster_analysis AS (
    SELECT
        data_source_id,
        cluster_id,
        ST_Centroid(ST_Collect(position_point)) as cluster_center,
        COUNT(*) as visit_count,
        MIN(measurement_timestamp) as first_visit,
        MAX(measurement_timestamp) as last_visit,
        EXTRACT(EPOCH FROM (MAX(measurement_timestamp) - MIN(measurement_timestamp))) / 3600 as duration_hours,
        ST_ConvexHull(ST_Collect(position_point)) as visit_area,
        STDDEV(ST_Distance(position_point::geography, ST_Centroid(ST_Collect(position_point))::geography)) as position_variance
    FROM position_clusters
    GROUP BY data_source_id, cluster_id
    HAVING COUNT(*) >= 3  -- At least 3 observations
)
SELECT
    row_number() OVER (ORDER BY data_source_id, cluster_id) as cluster_location_id,
    data_source_id,
    cluster_id,
    cluster_center,
    visit_count,
    first_visit,
    last_visit,
    duration_hours,
    visit_area,
    ST_Area(visit_area::geography) as area_sqm,
    position_variance,

    -- Classification based on visit patterns
    CASE
        WHEN visit_count >= 50 AND duration_hours > 168 THEN 'home'        -- 50+ visits, >1 week
        WHEN visit_count >= 20 AND duration_hours > 40 THEN 'work'         -- 20+ visits, >40 hours
        WHEN visit_count >= 10 AND duration_hours > 8 THEN 'frequent'      -- 10+ visits, >8 hours
        WHEN duration_hours > 4 THEN 'extended_stay'                       -- >4 hours continuous
        ELSE 'visit'
    END as location_type,

    -- Significance score (0-1)
    LEAST(1.0,
        (visit_count::NUMERIC / 100) * 0.4 +                               -- Visit frequency
        (LEAST(duration_hours, 168) / 168) * 0.4 +                         -- Duration (capped at 1 week)
        (1.0 / (1.0 + position_variance / 50)) * 0.2                       -- Position stability
    ) as significance_score

FROM cluster_analysis;

-- Network Coverage Areas (realistic coverage polygons)
CREATE MATERIALIZED VIEW app.mv_network_coverage AS
WITH coverage_points AS (
    SELECT
        ap.access_point_id,
        ap.mac_address,
        ap.current_network_name,
        pm.position_point,
        sm.signal_strength_dbm,
        -- Estimated range based on signal strength
        CASE
            WHEN sm.signal_strength_dbm > -30 THEN 10    -- Very close
            WHEN sm.signal_strength_dbm > -50 THEN 50    -- Close
            WHEN sm.signal_strength_dbm > -70 THEN 100   -- Medium
            WHEN sm.signal_strength_dbm > -85 THEN 200   -- Far
            ELSE 300                                     -- Very far
        END as estimated_range_meters
    FROM app.wireless_access_points ap
    JOIN app.signal_measurements sm ON sm.access_point_id = ap.access_point_id
    JOIN app.position_measurements pm ON pm.access_point_id = ap.access_point_id
        AND ABS(EXTRACT(EPOCH FROM (sm.measurement_timestamp - pm.measurement_timestamp))) < 300
    WHERE ap.is_mobile_device = FALSE
      AND sm.signal_strength_dbm IS NOT NULL
      AND sm.is_canonical_observation = TRUE
),
coverage_geometry AS (
    SELECT
        access_point_id,
        mac_address,
        current_network_name,
        COUNT(*) as observation_count,

        -- Different approaches for coverage area
        ST_ConcaveHull(ST_Collect(position_point), 0.8) as coverage_polygon_concave,
        ST_ConvexHull(ST_Collect(position_point)) as coverage_polygon_convex,

        -- Signal-weighted centroid
        ST_SetSRID(ST_MakePoint(
            SUM(ST_X(position_point) * POWER(10, signal_strength_dbm::NUMERIC / 10)) /
                SUM(POWER(10, signal_strength_dbm::NUMERIC / 10)),
            SUM(ST_Y(position_point) * POWER(10, signal_strength_dbm::NUMERIC / 10)) /
                SUM(POWER(10, signal_strength_dbm::NUMERIC / 10))
        ), 4326) as signal_weighted_center,

        -- Coverage statistics
        MAX(estimated_range_meters) as max_estimated_range,
        AVG(estimated_range_meters) as avg_estimated_range,
        MIN(signal_strength_dbm) as weakest_signal,
        MAX(signal_strength_dbm) as strongest_signal

    FROM coverage_points
    GROUP BY access_point_id, mac_address, current_network_name
    HAVING COUNT(*) >= 3  -- At least 3 observations for meaningful coverage
)
SELECT
    access_point_id,
    mac_address,
    current_network_name,
    observation_count,

    -- Coverage polygons
    coverage_polygon_concave,
    coverage_polygon_convex,
    signal_weighted_center,

    -- Estimated coverage circle (simple model)
    ST_Buffer(signal_weighted_center::geography, avg_estimated_range)::geometry as estimated_coverage_circle,

    -- Area calculations
    ST_Area(coverage_polygon_concave::geography) as coverage_area_concave_sqm,
    ST_Area(coverage_polygon_convex::geography) as coverage_area_convex_sqm,
    ST_Area(ST_Buffer(signal_weighted_center::geography, avg_estimated_range)) as estimated_coverage_area_sqm,

    -- Coverage quality metrics
    max_estimated_range,
    avg_estimated_range,
    weakest_signal,
    strongest_signal,
    observation_count,

    -- Quality score
    LEAST(1.0,
        (observation_count::NUMERIC / 50) * 0.4 +                          -- More observations = better
        (1.0 / (1.0 + (strongest_signal - weakest_signal) / 20)) * 0.3 +   -- Consistent signal = better
        (LEAST(avg_estimated_range, 200) / 200) * 0.3                      -- Reasonable range = better
    ) as coverage_quality_score

FROM coverage_geometry;

-- Movement Routes (temporal route reconstruction)
CREATE MATERIALIZED VIEW app.mv_movement_routes AS
WITH temporal_positions AS (
    SELECT
        pm.data_source_id,
        DATE(pm.measurement_timestamp) as route_date,
        pm.measurement_timestamp,
        pm.position_point,
        pm.speed_mps,
        pm.heading_degrees,
        LAG(pm.position_point) OVER (
            PARTITION BY pm.data_source_id, DATE(pm.measurement_timestamp)
            ORDER BY pm.measurement_timestamp
        ) as prev_position,
        LAG(pm.measurement_timestamp) OVER (
            PARTITION BY pm.data_source_id, DATE(pm.measurement_timestamp)
            ORDER BY pm.measurement_timestamp
        ) as prev_timestamp
    FROM app.position_measurements pm
    WHERE pm.position_accuracy_meters < 50  -- Only accurate positions
),
route_segments AS (
    SELECT
        data_source_id,
        route_date,
        array_agg(position_point ORDER BY measurement_timestamp) as route_points,
        ST_MakeLine(array_agg(position_point ORDER BY measurement_timestamp)) as route_geometry,

        -- Route statistics
        COUNT(*) as point_count,
        MIN(measurement_timestamp) as start_time,
        MAX(measurement_timestamp) as end_time,
        EXTRACT(EPOCH FROM (MAX(measurement_timestamp) - MIN(measurement_timestamp))) / 3600 as duration_hours,

        -- Distance calculations
        SUM(
            CASE WHEN prev_position IS NOT NULL
            THEN ST_Distance(position_point::geography, prev_position::geography)
            ELSE 0 END
        ) as total_distance_meters,

        -- Speed analysis
        AVG(speed_mps) as avg_speed_mps,
        MAX(speed_mps) as max_speed_mps,

        -- Temporal gaps (detect stops)
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (measurement_timestamp - prev_timestamp)) > 300 THEN 1 END) as significant_stops

    FROM temporal_positions
    GROUP BY data_source_id, route_date
    HAVING COUNT(*) >= 3  -- At least 3 points for a route
)
SELECT
    row_number() OVER (ORDER BY data_source_id, route_date) as route_id,
    data_source_id,
    route_date,
    route_geometry,
    ST_StartPoint(route_geometry) as start_point,
    ST_EndPoint(route_geometry) as end_point,
    point_count,
    start_time,
    end_time,
    duration_hours,
    total_distance_meters,

    -- Movement classification
    CASE
        WHEN avg_speed_mps > 25 THEN 'highway'      -- >90 km/h
        WHEN avg_speed_mps > 15 THEN 'arterial'     -- >54 km/h
        WHEN avg_speed_mps > 5 THEN 'urban'         -- >18 km/h
        WHEN avg_speed_mps > 1 THEN 'pedestrian'    -- >3.6 km/h
        ELSE 'stationary'
    END as movement_type,

    avg_speed_mps,
    max_speed_mps,
    significant_stops,

    -- Route efficiency (straight line vs actual distance)
    CASE WHEN total_distance_meters > 0
    THEN ST_Distance(ST_StartPoint(route_geometry)::geography, ST_EndPoint(route_geometry)::geography) / total_distance_meters
    ELSE 0 END as route_efficiency

FROM route_segments;

-- Device Colocation Analysis (enhanced stalking detection)
CREATE MATERIALIZED VIEW app.mv_colocation_patterns AS
WITH device_pairs AS (
    SELECT
        p1.access_point_id as device_1_id,
        p2.access_point_id as device_2_id,
        p1.measurement_timestamp,
        ST_Distance(p1.position_point::geography, p2.position_point::geography) as distance_meters,
        ABS(EXTRACT(EPOCH FROM (p1.measurement_timestamp - p2.measurement_timestamp))) as time_diff_seconds
    FROM app.position_measurements p1
    JOIN app.position_measurements p2 ON p1.access_point_id < p2.access_point_id  -- Avoid duplicates
    WHERE ST_DWithin(p1.position_point::geography, p2.position_point::geography, 100)  -- Within 100m
      AND ABS(EXTRACT(EPOCH FROM (p1.measurement_timestamp - p2.measurement_timestamp))) < 600  -- Within 10 minutes
      AND p1.measurement_timestamp >= NOW() - INTERVAL '90 days'  -- Recent data only
),
colocation_summary AS (
    SELECT
        device_1_id,
        device_2_id,
        COUNT(*) as colocation_count,
        AVG(distance_meters) as avg_distance_meters,
        MIN(distance_meters) as min_distance_meters,
        MAX(distance_meters) as max_distance_meters,
        MIN(measurement_timestamp) as first_colocation,
        MAX(measurement_timestamp) as last_colocation,
        EXTRACT(EPOCH FROM (MAX(measurement_timestamp) - MIN(measurement_timestamp))) / 86400 as colocation_span_days,

        -- Temporal analysis
        STDDEV(EXTRACT(EPOCH FROM measurement_timestamp)) as temporal_variance,

        -- Spatial analysis
        STDDEV(distance_meters) as spatial_variance
    FROM device_pairs
    GROUP BY device_1_id, device_2_id
    HAVING COUNT(*) >= 5  -- At least 5 colocations
)
SELECT
    device_1_id,
    device_2_id,
    colocation_count,
    avg_distance_meters,
    min_distance_meters,
    max_distance_meters,
    first_colocation,
    last_colocation,
    colocation_span_days,

    -- Colocation frequency (colocations per day)
    colocation_count / GREATEST(colocation_span_days, 1) as colocation_frequency_per_day,

    -- Stalking risk assessment
    LEAST(1.0,
        (colocation_count::NUMERIC / 50) * 0.4 +                           -- More colocations = higher risk
        (1.0 / (1.0 + avg_distance_meters / 20)) * 0.3 +                   -- Closer proximity = higher risk
        (colocation_count / GREATEST(colocation_span_days, 1) / 10) * 0.3   -- Higher frequency = higher risk
    ) as stalking_risk_score,

    -- Classification
    CASE
        WHEN colocation_count >= 20 AND avg_distance_meters < 30 THEN 'high_risk'
        WHEN colocation_count >= 10 AND avg_distance_meters < 50 THEN 'moderate_risk'
        WHEN colocation_count >= 5 THEN 'low_risk'
        ELSE 'minimal_risk'
    END as risk_classification,

    spatial_variance,
    temporal_variance

FROM colocation_summary;

-- Spatial Analysis Functions

-- Find networks within coverage area
CREATE OR REPLACE FUNCTION app.find_networks_in_coverage(p_access_point_id BIGINT, p_buffer_meters NUMERIC DEFAULT 0)
RETURNS TABLE(
    nearby_access_point_id BIGINT,
    nearby_mac_address TEXT,
    nearby_network_name TEXT,
    distance_meters NUMERIC,
    coverage_overlap_area_sqm NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        nc2.access_point_id,
        nc2.mac_address,
        nc2.current_network_name,
        ST_Distance(nc1.signal_weighted_center::geography, nc2.signal_weighted_center::geography) as distance_meters,
        ST_Area(ST_Intersection(
            ST_Buffer(nc1.coverage_polygon_concave::geography, p_buffer_meters),
            nc2.coverage_polygon_concave::geography
        )) as coverage_overlap_area_sqm
    FROM app.mv_network_coverage nc1
    JOIN app.mv_network_coverage nc2 ON nc1.access_point_id != nc2.access_point_id
    WHERE nc1.access_point_id = p_access_point_id
      AND ST_Intersects(
          ST_Buffer(nc1.coverage_polygon_concave::geography, p_buffer_meters),
          nc2.coverage_polygon_concave::geography
      )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Analyze route intersection with network coverage
CREATE OR REPLACE FUNCTION app.analyze_route_network_exposure(p_data_source_id INTEGER, p_route_date DATE)
RETURNS TABLE(
    access_point_id BIGINT,
    mac_address TEXT,
    network_name TEXT,
    intersection_length_meters NUMERIC,
    exposure_duration_estimate_minutes NUMERIC,
    signal_strength_estimate_dbm SMALLINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        nc.access_point_id,
        nc.mac_address,
        nc.current_network_name,
        ST_Length(ST_Intersection(mr.route_geometry::geography, nc.coverage_polygon_concave::geography)) as intersection_length_meters,

        -- Estimate exposure time based on speed and intersection length
        (ST_Length(ST_Intersection(mr.route_geometry::geography, nc.coverage_polygon_concave::geography)) /
         GREATEST(mr.avg_speed_mps, 1)) / 60 as exposure_duration_estimate_minutes,

        -- Estimate signal strength based on coverage area (rough approximation)
        CASE
            WHEN nc.avg_estimated_range < 50 THEN -30   -- Close range, strong signal
            WHEN nc.avg_estimated_range < 100 THEN -50  -- Medium range
            WHEN nc.avg_estimated_range < 200 THEN -70  -- Far range
            ELSE -85                                    -- Very far range
        END as signal_strength_estimate_dbm

    FROM app.mv_movement_routes mr
    JOIN app.mv_network_coverage nc ON ST_Intersects(mr.route_geometry, nc.coverage_polygon_concave)
    WHERE mr.data_source_id = p_data_source_id
      AND mr.route_date = p_route_date
      AND ST_Length(ST_Intersection(mr.route_geometry::geography, nc.coverage_polygon_concave::geography)) > 10  -- >10m intersection
    ORDER BY intersection_length_meters DESC;
END;
$$ LANGUAGE plpgsql;

-- Indexes for spatial performance
CREATE INDEX idx_location_clusters_center ON app.mv_location_clusters USING GIST (cluster_center);
CREATE INDEX idx_location_clusters_significance ON app.mv_location_clusters (significance_score) WHERE significance_score > 0.5;
CREATE INDEX idx_network_coverage_polygon ON app.mv_network_coverage USING GIST (coverage_polygon_concave);
CREATE INDEX idx_network_coverage_center ON app.mv_network_coverage USING GIST (signal_weighted_center);
CREATE INDEX idx_movement_routes_geometry ON app.mv_movement_routes USING GIST (route_geometry);
CREATE INDEX idx_movement_routes_date ON app.mv_movement_routes (data_source_id, route_date);
CREATE INDEX idx_colocation_patterns_risk ON app.mv_colocation_patterns (stalking_risk_score) WHERE stalking_risk_score > 0.5;

-- Comments
COMMENT ON MATERIALIZED VIEW app.mv_location_clusters IS 'Automatic K-means clustering of positions to identify significant locations';
COMMENT ON MATERIALIZED VIEW app.mv_network_coverage IS 'Network coverage areas using concave hull and signal-based estimation';
COMMENT ON MATERIALIZED VIEW app.mv_movement_routes IS 'Temporal route reconstruction with movement classification';
COMMENT ON MATERIALIZED VIEW app.mv_colocation_patterns IS 'Spatial-temporal colocation analysis for stalking detection';
COMMENT ON FUNCTION app.find_networks_in_coverage(BIGINT, NUMERIC) IS 'Find networks within or overlapping coverage area';
COMMENT ON FUNCTION app.analyze_route_network_exposure(INTEGER, DATE) IS 'Analyze which networks a route passes through and exposure time';