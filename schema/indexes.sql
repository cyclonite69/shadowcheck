-- =====================================================
-- ShadowCheck Performance Optimization Indexes
-- Advanced indexing strategy for time-series and spatial queries
-- =====================================================

-- =====================================================
-- ANALYZE EXISTING DATA FOR INDEX OPTIMIZATION
-- =====================================================

-- Update table statistics for query planner
ANALYZE app.wireless_access_points;
ANALYZE app.signal_measurements;
ANALYZE app.position_measurements;
ANALYZE app.oui_manufacturers;
ANALYZE app.data_sources;
ANALYZE app.user_devices;

-- =====================================================
-- SPATIAL INDEXES (CRITICAL FOR GIS PERFORMANCE)
-- =====================================================

-- Primary spatial indexes for geography queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_location_gist
    ON app.wireless_access_points USING GIST (primary_location_point);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_coverage_gist
    ON app.wireless_access_points USING GIST (coverage_area_polygon);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_point_gist
    ON app.position_measurements USING GIST (position_point);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_visits_center_gist
    ON app.location_visits USING GIST (visit_center_point);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tracking_routes_geometry_gist
    ON app.tracking_routes USING GIST (route_geometry);

-- Spatial bounding box indexes for fast range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_lat_lon
    ON app.position_measurements (latitude_degrees, longitude_degrees);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_location_bbox
    ON app.wireless_access_points (
        ST_X(primary_location_point),
        ST_Y(primary_location_point)
    )
    WHERE primary_location_point IS NOT NULL;

-- =====================================================
-- TEMPORAL INDEXES (CRITICAL FOR TIME-SERIES QUERIES)
-- =====================================================

-- Primary temporal indexes with DESC for recent-first queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_timestamp_desc
    ON app.signal_measurements (measurement_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_timestamp_desc
    ON app.position_measurements (measurement_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_first_timestamp_desc
    ON app.security_incidents (first_incident_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_visits_arrival_desc
    ON app.location_visits (arrival_timestamp DESC);

-- Time range indexes for efficient windowing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_timestamp_range
    ON app.signal_measurements (measurement_timestamp)
    WHERE measurement_timestamp >= '2020-01-01'::timestamptz;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_timestamp_range
    ON app.position_measurements (measurement_timestamp)
    WHERE measurement_timestamp >= '2020-01-01'::timestamptz;

-- Hour-based partitioning support indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_hour
    ON app.signal_measurements (date_trunc('hour', measurement_timestamp));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_hour
    ON app.position_measurements (date_trunc('hour', measurement_timestamp));

-- =====================================================
-- FOREIGN KEY OPTIMIZATION INDEXES
-- =====================================================

-- Critical foreign key indexes for JOIN performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_access_point_id
    ON app.signal_measurements (access_point_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_access_point_id
    ON app.position_measurements (access_point_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_manufacturer_id
    ON app.wireless_access_points (manufacturer_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_data_source_id
    ON app.signal_measurements (data_source_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurements_data_source_id
    ON app.position_measurements (data_source_id);

-- Security incident indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_target_device_id
    ON app.security_incidents (target_device_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_suspicious_ap_id
    ON app.security_incidents (suspicious_access_point_id);

-- =====================================================
-- LOOKUP AND SEARCH INDEXES
-- =====================================================

-- MAC address lookups (critical for real-time queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_mac_address
    ON app.wireless_access_points (mac_address);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_mac_address_upper
    ON app.wireless_access_points (UPPER(mac_address));

-- OUI prefix lookups for manufacturer identification
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oui_manufacturers_prefix
    ON app.oui_manufacturers (oui_prefix_hex);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oui_manufacturers_name
    ON app.oui_manufacturers (organization_name);

-- Network name searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_network_name
    ON app.wireless_access_points (network_name)
    WHERE network_name IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_network_name_text
    ON app.wireless_access_points USING GIN (to_tsvector('english', network_name))
    WHERE network_name IS NOT NULL;

-- Technology and encryption filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_access_points_technology
    ON app.wireless_access_points (radio_technology);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurements_encryption
    ON app.signal_measurements (encryption_type);

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =====================================================

-- Access point + timestamp (most common pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_ap_timestamp_desc
    ON app.signal_measurements (access_point_id, measurement_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_ap_timestamp_desc
    ON app.position_measurements (access_point_id, measurement_timestamp DESC);

-- Signal strength analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_strength_timestamp
    ON app.signal_measurements (signal_strength_dbm, measurement_timestamp DESC)
    WHERE signal_strength_dbm IS NOT NULL;

-- Geographic area + time queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_lat_lon_timestamp
    ON app.position_measurements (latitude_degrees, longitude_degrees, measurement_timestamp DESC);

-- Security incident analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_status_level
    ON app.security_incidents (investigation_status, threat_level);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_target_timestamp
    ON app.security_incidents (target_device_id, first_incident_timestamp DESC);

-- Data source + timestamp for import analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_source_timestamp
    ON app.signal_measurements (data_source_id, measurement_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_source_timestamp
    ON app.position_measurements (data_source_id, measurement_timestamp DESC);

-- =====================================================
-- ANALYTICAL INDEXES FOR AGGREGATIONS
-- =====================================================

-- Technology distribution analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_tech_mobile
    ON app.wireless_access_points (radio_technology, is_mobile_device);

-- Signal quality analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_strength_confidence
    ON app.signal_measurements (signal_strength_dbm, data_confidence_score)
    WHERE signal_strength_dbm IS NOT NULL;

-- Position accuracy analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_accuracy_confidence
    ON app.position_measurements (position_accuracy_meters, data_confidence_score)
    WHERE position_accuracy_meters IS NOT NULL;

-- Frequency analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_frequency
    ON app.wireless_access_points (primary_frequency_hz)
    WHERE primary_frequency_hz IS NOT NULL;

-- Channel utilization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_channel_frequency
    ON app.signal_measurements (channel_number, measurement_timestamp DESC)
    WHERE channel_number IS NOT NULL;

-- =====================================================
-- PARTIAL INDEXES FOR SPECIFIC USE CASES
-- =====================================================

-- Active/recent data only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_recent_observations
    ON app.wireless_access_points (last_observed_at DESC)
    WHERE last_observed_at >= NOW() - INTERVAL '30 days';

-- High-confidence data only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_high_confidence
    ON app.signal_measurements (access_point_id, measurement_timestamp DESC)
    WHERE data_confidence_score >= 0.8;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_high_confidence
    ON app.position_measurements (access_point_id, measurement_timestamp DESC)
    WHERE data_confidence_score >= 0.8;

-- Mobile devices only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_mobile_devices
    ON app.wireless_access_points (access_point_id, last_observed_at DESC)
    WHERE is_mobile_device = true;

-- Strong signals only (for coverage analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_strong_signals
    ON app.signal_measurements (access_point_id, signal_strength_dbm DESC)
    WHERE signal_strength_dbm >= -70;

-- Hidden networks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_hidden_networks
    ON app.wireless_access_points (access_point_id, radio_technology)
    WHERE is_hidden_network = true;

-- Open networks (security analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_open_networks
    ON app.signal_measurements (access_point_id, measurement_timestamp DESC)
    WHERE encryption_type = 'none';

-- =====================================================
-- EXPRESSION INDEXES FOR COMPUTED QUERIES
-- =====================================================

-- Date-based queries (common for analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_measurement_date
    ON app.signal_measurements (DATE(measurement_timestamp));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_measurement_date
    ON app.position_measurements (DATE(measurement_timestamp));

-- Hour of day analysis (for pattern detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_hour_of_day
    ON app.signal_measurements (EXTRACT(hour FROM measurement_timestamp));

-- OUI extraction from MAC address
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_oui_prefix
    ON app.wireless_access_points (LEFT(REPLACE(mac_address, ':', ''), 6));

-- Signal quality categories
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_quality_category
    ON app.signal_measurements (
        CASE
            WHEN signal_strength_dbm >= -50 THEN 'excellent'
            WHEN signal_strength_dbm >= -60 THEN 'good'
            WHEN signal_strength_dbm >= -70 THEN 'fair'
            ELSE 'poor'
        END
    )
    WHERE signal_strength_dbm IS NOT NULL;

-- =====================================================
-- TEXT SEARCH INDEXES
-- =====================================================

-- Full-text search on network names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_network_name_fts
    ON app.wireless_access_points USING GIN (to_tsvector('english', COALESCE(network_name, '')))
    WHERE network_name IS NOT NULL;

-- Manufacturer name search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oui_manufacturers_name_fts
    ON app.oui_manufacturers USING GIN (to_tsvector('english', organization_name));

-- Security incident notes search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_notes_fts
    ON app.security_incidents USING GIN (to_tsvector('english', COALESCE(analyst_notes, '')))
    WHERE analyst_notes IS NOT NULL;

-- =====================================================
-- HASH INDEXES FOR EXACT MATCH QUERIES
-- =====================================================

-- Radio technology lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_technology_hash
    ON app.wireless_access_points USING HASH (radio_technology);

-- Encryption type lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_encryption_hash
    ON app.signal_measurements USING HASH (encryption_type);

-- Investigation status lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_incidents_status_hash
    ON app.security_incidents USING HASH (investigation_status);

-- =====================================================
-- COVERING INDEXES FOR INDEX-ONLY SCANS
-- =====================================================

-- Access point summary data (avoiding table lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wireless_ap_summary
    ON app.wireless_access_points (access_point_id)
    INCLUDE (mac_address, network_name, radio_technology, is_mobile_device, total_signal_readings);

-- Signal measurement summary
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_summary
    ON app.signal_measurements (measurement_id)
    INCLUDE (access_point_id, signal_strength_dbm, encryption_type, measurement_timestamp);

-- Position measurement summary
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_summary
    ON app.position_measurements (position_id)
    INCLUDE (access_point_id, latitude_degrees, longitude_degrees, measurement_timestamp);

-- =====================================================
-- STATISTICS COLLECTION OPTIMIZATION
-- =====================================================

-- Increase statistics target for frequently queried columns
ALTER TABLE app.wireless_access_points
    ALTER COLUMN mac_address SET STATISTICS 1000;

ALTER TABLE app.signal_measurements
    ALTER COLUMN signal_strength_dbm SET STATISTICS 1000;

ALTER TABLE app.position_measurements
    ALTER COLUMN latitude_degrees SET STATISTICS 1000,
    ALTER COLUMN longitude_degrees SET STATISTICS 1000;

-- =====================================================
-- INDEX MAINTENANCE CONFIGURATION
-- =====================================================

-- Set reasonable fill factors for high-update tables
ALTER INDEX idx_wireless_access_points_mac_address SET (fillfactor = 85);
ALTER INDEX idx_signal_measurements_timestamp_desc SET (fillfactor = 90);
ALTER INDEX idx_position_measurements_timestamp_desc SET (fillfactor = 90);

-- =====================================================
-- MONITORING AND MAINTENANCE VIEWS
-- =====================================================

-- Create view for index usage monitoring
CREATE OR REPLACE VIEW app.index_usage_stats AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE
        WHEN idx_scan = 0 THEN 0
        ELSE ROUND((idx_tup_read::numeric / idx_scan), 2)
    END AS avg_tuples_per_scan,
    CASE
        WHEN pg_relation_size(indexrelid) = 0 THEN 0
        ELSE ROUND(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2)
    END AS index_size_mb
FROM pg_stat_user_indexes
WHERE schemaname = 'app'
ORDER BY idx_scan DESC, index_size_mb DESC;

-- Create view for table statistics
CREATE OR REPLACE VIEW app.table_stats AS
SELECT
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    CASE
        WHEN n_live_tup = 0 THEN 0
        ELSE ROUND((n_dead_tup::numeric / n_live_tup) * 100, 2)
    END AS dead_tuple_percentage,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) AS total_size_mb
FROM pg_stat_user_tables
WHERE schemaname = 'app'
ORDER BY total_size_mb DESC;

-- =====================================================
-- PERFORMANCE TESTING QUERIES
-- =====================================================

/*
Test index effectiveness with these queries:

-- 1. Spatial range query (should use GIST index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*) FROM app.wireless_access_points
WHERE ST_DWithin(primary_location_point, ST_MakePoint(-122.4194, 37.7749), 1000);

-- 2. Recent measurements (should use timestamp index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM app.signal_measurements
WHERE measurement_timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY measurement_timestamp DESC LIMIT 100;

-- 3. Access point lookup (should use MAC index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM app.wireless_access_points
WHERE mac_address = '00:11:22:33:44:55';

-- 4. Signal strength analysis (should use composite index)
EXPLAIN (ANALYZE, BUFFERS)
SELECT access_point_id, AVG(signal_strength_dbm)
FROM app.signal_measurements
WHERE measurement_timestamp >= NOW() - INTERVAL '1 day'
  AND signal_strength_dbm IS NOT NULL
GROUP BY access_point_id;

-- 5. Join performance (should use FK indexes)
EXPLAIN (ANALYZE, BUFFERS)
SELECT ap.mac_address, ap.network_name, sm.signal_strength_dbm
FROM app.wireless_access_points ap
JOIN app.signal_measurements sm ON ap.access_point_id = sm.access_point_id
WHERE sm.measurement_timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY sm.measurement_timestamp DESC;
*/

-- Final statistics update
ANALYZE app.wireless_access_points;
ANALYZE app.signal_measurements;
ANALYZE app.position_measurements;
ANALYZE app.oui_manufacturers;
ANALYZE app.data_sources;
ANALYZE app.user_devices;
ANALYZE app.location_visits;
ANALYZE app.security_incidents;
ANALYZE app.tracking_routes;
ANALYZE app.wigle_api_enrichments;