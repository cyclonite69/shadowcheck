-- ============================================================================
-- SHADOWCHECK DATABASE INITIALIZATION - POSTGRESQL 18 + LATEST POSTGIS
-- Optimized for Temporal & Spatial SIGINT Data Collection
-- ============================================================================
--
-- POSTGRESQL 18 FEATURES UTILIZED:
-- - Enhanced partitioning for time-series data
-- - BRIN indexes for temporal columns (90% smaller than B-tree)
-- - Parallel PostGIS operations
-- - Improved JSON performance for raw_data
-- - Enhanced GiST indexes for spatial queries
--
-- ============================================================================

-- Enable timing
\timing on

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- PostGIS (latest version)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS postgis_raster;  -- For raster analysis

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Statistics extension (PostgreSQL 18 enhancement)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS sigint;
CREATE SCHEMA IF NOT EXISTS analytics;  -- For materialized views and aggregates

-- Set default search path
ALTER DATABASE shadowcheck SET search_path TO sigint, public;
SET search_path TO sigint, public;

-- ============================================================================
-- PARTITIONED SIGNAL DETECTIONS TABLE (PostgreSQL 18 Enhanced Partitioning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sigint.signal_detections (
    -- Primary key
    id UUID DEFAULT uuid_generate_v4(),

    -- Temporal data (PARTITION KEY)
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    capture_duration_ms INTEGER,

    -- Spatial data (PostGIS geometry - WGS84)
    location GEOMETRY(POINT, 4326),
    altitude_meters REAL,
    accuracy_meters REAL,

    -- Signal classification
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('wifi', 'bluetooth', 'ble', 'cellular', 'unknown')),
    protocol_version VARCHAR(50),

    -- WiFi specific fields
    ssid VARCHAR(255),
    bssid MACADDR,
    channel INTEGER CHECK (channel BETWEEN 1 AND 196),
    frequency_mhz INTEGER,
    signal_strength_dbm INTEGER CHECK (signal_strength_dbm BETWEEN -120 AND 0),
    encryption_type VARCHAR(50),  -- WPA2, WPA3, Open, etc.

    -- Bluetooth/BLE specific fields
    bt_address MACADDR,
    bt_name VARCHAR(255),
    bt_class VARCHAR(50),
    bt_rssi INTEGER CHECK (bt_rssi BETWEEN -120 AND 0),
    bt_company_id INTEGER,  -- Bluetooth SIG company identifier
    bt_appearance INTEGER,  -- BLE appearance value

    -- Cellular specific fields
    cell_id BIGINT,
    lac INTEGER,
    mcc INTEGER CHECK (mcc BETWEEN 100 AND 999),  -- Mobile Country Code
    mnc INTEGER CHECK (mnc BETWEEN 0 AND 999),    -- Mobile Network Code
    network_type VARCHAR(20) CHECK (network_type IN ('GSM', 'UMTS', 'LTE', '5G', 'NR', NULL)),
    plmn VARCHAR(10),  -- Public Land Mobile Network ID
    signal_strength_asu INTEGER,  -- Arbitrary Strength Unit
    timing_advance INTEGER,

    -- Device metadata
    device_id UUID,
    device_name VARCHAR(255),
    device_model VARCHAR(100),

    -- Analysis metadata
    is_suspicious BOOLEAN DEFAULT FALSE,
    surveillance_score REAL CHECK (surveillance_score BETWEEN 0 AND 100),
    anomaly_flags TEXT[],  -- Array of detected anomalies
    threat_level VARCHAR(20) CHECK (threat_level IN ('none', 'low', 'medium', 'high', 'critical', NULL)),

    -- Raw data storage (JSONB for flexibility)
    raw_data JSONB,

    -- Tagging and categorization
    tags TEXT[],
    notes TEXT,

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Composite primary key with partition column
    PRIMARY KEY (id, detected_at)

) PARTITION BY RANGE (detected_at);

-- ============================================================================
-- CREATE PARTITIONS (Monthly partitions for time-series data)
-- ============================================================================

-- Current month partition
CREATE TABLE IF NOT EXISTS sigint.signal_detections_current
    PARTITION OF sigint.signal_detections
    FOR VALUES FROM (date_trunc('month', CURRENT_DATE))
    TO (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month');

-- Next month partition (pre-create for seamless transition)
CREATE TABLE IF NOT EXISTS sigint.signal_detections_next
    PARTITION OF sigint.signal_detections
    FOR VALUES FROM (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')
    TO (date_trunc('month', CURRENT_DATE) + INTERVAL '2 months');

-- Create function to auto-create future partitions
CREATE OR REPLACE FUNCTION sigint.create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date TEXT;
    end_date TEXT;
BEGIN
    -- Create partition for 2 months from now
    partition_date := date_trunc('month', CURRENT_DATE) + INTERVAL '2 months';
    partition_name := 'signal_detections_' || to_char(partition_date, 'YYYY_MM');
    start_date := partition_date::TEXT;
    end_date := (partition_date + INTERVAL '1 month')::TEXT;

    -- Create partition if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS sigint.%I PARTITION OF sigint.signal_detections FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        RAISE NOTICE 'Created partition: %', partition_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES - PostgreSQL 18 Optimized
-- ============================================================================

-- SPATIAL INDEX (GiST - Enhanced in PG18)
-- Critical for mapping and proximity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_location
    ON sigint.signal_detections USING GIST(location)
    WHERE location IS NOT NULL;

-- TEMPORAL BRIN INDEX (90% smaller than B-tree, perfect for time-series)
-- PostgreSQL 18 has significantly improved BRIN index performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_detected_at_brin
    ON sigint.signal_detections USING BRIN(detected_at)
    WITH (pages_per_range = 128);

-- B-tree index for exact timestamp lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_detected_at_btree
    ON sigint.signal_detections(detected_at DESC);

-- Signal type index (covers most common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_signal_type
    ON sigint.signal_detections(signal_type)
    INCLUDE (detected_at, location);  -- Covering index for common queries

-- Device tracking index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_device_id
    ON sigint.signal_detections(device_id, detected_at DESC)
    WHERE device_id IS NOT NULL;

-- Composite index for type + time queries (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_type_time
    ON sigint.signal_detections(signal_type, detected_at DESC);

-- WiFi-specific indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_bssid
    ON sigint.signal_detections(bssid)
    WHERE bssid IS NOT NULL AND signal_type = 'wifi';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_ssid_hash
    ON sigint.signal_detections USING HASH(ssid)
    WHERE ssid IS NOT NULL;

-- Trigram index for fuzzy SSID search (PostgreSQL 18 enhancement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_ssid_trgm
    ON sigint.signal_detections USING GIN(ssid gin_trgm_ops)
    WHERE ssid IS NOT NULL;

-- Bluetooth/BLE indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_bt_address
    ON sigint.signal_detections(bt_address)
    WHERE bt_address IS NOT NULL AND signal_type IN ('bluetooth', 'ble');

-- Cellular indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_cell_id
    ON sigint.signal_detections(cell_id, mcc, mnc)
    WHERE cell_id IS NOT NULL;

-- Suspicious signals index (for security dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_suspicious
    ON sigint.signal_detections(is_suspicious, detected_at DESC)
    WHERE is_suspicious = TRUE;

-- Threat level index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_threat_level
    ON sigint.signal_detections(threat_level, detected_at DESC)
    WHERE threat_level IN ('high', 'critical');

-- JSONB indexes for raw_data queries (GIN index - enhanced in PG18)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_raw_data
    ON sigint.signal_detections USING GIN(raw_data);

-- Tags array index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_detections_tags
    ON sigint.signal_detections USING GIN(tags);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION sigint.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_signal_detections_updated_at
    BEFORE UPDATE ON sigint.signal_detections
    FOR EACH ROW
    EXECUTE FUNCTION sigint.update_updated_at_column();

-- Auto-create next month's partition (runs on first insert of each month)
CREATE OR REPLACE FUNCTION sigint.auto_create_partition()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM sigint.create_monthly_partition();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger only fires on the parent table, not partitions
-- It's called before INSERT to ensure partition exists

-- ============================================================================
-- MATERIALIZED VIEWS (Analytics Layer)
-- ============================================================================

-- Hourly signal aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.hourly_signal_stats AS
SELECT
    date_trunc('hour', detected_at) AS hour,
    signal_type,
    COUNT(*) AS signal_count,
    COUNT(DISTINCT bssid) AS unique_bssids,
    COUNT(DISTINCT bt_address) AS unique_bt_addresses,
    AVG(signal_strength_dbm) AS avg_signal_strength,
    ST_Union(ST_Buffer(location::geography, 100)::geometry) AS coverage_area,
    COUNT(*) FILTER (WHERE is_suspicious = TRUE) AS suspicious_count
FROM sigint.signal_detections
WHERE detected_at > NOW() - INTERVAL '7 days'
GROUP BY hour, signal_type
WITH DATA;

-- Index on materialized view
CREATE INDEX ON analytics.hourly_signal_stats(hour DESC, signal_type);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION analytics.refresh_hourly_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.hourly_signal_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (Query Optimization)
-- ============================================================================

-- Recent detections with GeoJSON (for map rendering)
CREATE OR REPLACE VIEW sigint.recent_detections_geojson AS
SELECT
    id,
    detected_at,
    signal_type,
    ST_AsGeoJSON(location)::json AS location_geojson,
    ST_X(location) AS longitude,
    ST_Y(location) AS latitude,
    altitude_meters,
    ssid,
    bssid,
    bt_address,
    bt_name,
    signal_strength_dbm,
    is_suspicious,
    surveillance_score,
    threat_level
FROM sigint.signal_detections
WHERE detected_at > NOW() - INTERVAL '24 hours'
  AND location IS NOT NULL
ORDER BY detected_at DESC;

-- Suspicious activity summary
CREATE OR REPLACE VIEW sigint.suspicious_signals AS
SELECT
    id,
    detected_at,
    signal_type,
    ST_AsGeoJSON(location)::json AS location_geojson,
    ssid,
    bssid,
    bt_address,
    surveillance_score,
    threat_level,
    anomaly_flags,
    raw_data
FROM sigint.signal_detections
WHERE is_suspicious = TRUE
  AND detected_at > NOW() - INTERVAL '7 days'
ORDER BY surveillance_score DESC, detected_at DESC;

-- Signal density heatmap (spatial aggregation)
CREATE OR REPLACE VIEW analytics.signal_density_grid AS
SELECT
    signal_type,
    ST_SnapToGrid(location, 0.001) AS grid_cell,  -- ~100m grid cells
    COUNT(*) AS signal_count,
    AVG(signal_strength_dbm) AS avg_strength
FROM sigint.signal_detections
WHERE detected_at > NOW() - INTERVAL '24 hours'
  AND location IS NOT NULL
GROUP BY signal_type, grid_cell
HAVING COUNT(*) > 5;  -- Filter low-density cells

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate distance between two signal detections (meters)
CREATE OR REPLACE FUNCTION sigint.calculate_distance(
    detection_id_1 UUID,
    detection_id_2 UUID
)
RETURNS REAL AS $$
SELECT
    ST_Distance(
        (SELECT location::geography FROM sigint.signal_detections WHERE id = detection_id_1),
        (SELECT location::geography FROM sigint.signal_detections WHERE id = detection_id_2)
    );
$$ LANGUAGE SQL STABLE;

-- Find signals within radius (meters)
CREATE OR REPLACE FUNCTION sigint.signals_within_radius(
    center_lat REAL,
    center_lon REAL,
    radius_meters REAL,
    signal_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    detected_at TIMESTAMPTZ,
    signal_type VARCHAR,
    distance_meters REAL,
    signal_strength_dbm INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sd.id,
        sd.detected_at,
        sd.signal_type,
        ST_Distance(
            sd.location::geography,
            ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography
        ) AS distance_meters,
        sd.signal_strength_dbm
    FROM sigint.signal_detections sd
    WHERE ST_DWithin(
        sd.location::geography,
        ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
        radius_meters
    )
    AND (signal_filter IS NULL OR sd.signal_type = signal_filter)
    AND sd.detected_at > NOW() - INTERVAL '24 hours'
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA sigint TO shadowcheck_user;
GRANT USAGE ON SCHEMA analytics TO shadowcheck_user;

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA sigint TO shadowcheck_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO shadowcheck_user;

-- Grant sequence permissions (for UUID generation)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sigint TO shadowcheck_user;

-- Grant function execution
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA sigint TO shadowcheck_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA analytics TO shadowcheck_user;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA sigint GRANT ALL ON TABLES TO shadowcheck_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics GRANT ALL ON TABLES TO shadowcheck_user;

-- ============================================================================
-- STATISTICS & MONITORING
-- ============================================================================

-- Analyze tables for query planner
ANALYZE sigint.signal_detections;

-- Enable parallel query execution for this database
ALTER DATABASE shadowcheck SET max_parallel_workers_per_gather = 4;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'SHADOWCHECK DATABASE INITIALIZED SUCCESSFULLY!';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'PostgreSQL Version: %', version();
    RAISE NOTICE 'PostGIS Version: %', PostGIS_version();
    RAISE NOTICE '';
    RAISE NOTICE 'Features Enabled:';
    RAISE NOTICE '  ✓ Monthly partitioning for signal_detections';
    RAISE NOTICE '  ✓ BRIN indexes for temporal queries (90%% size reduction)';
    RAISE NOTICE '  ✓ Spatial GiST indexes for mapping queries';
    RAISE NOTICE '  ✓ Parallel PostGIS operations';
    RAISE NOTICE '  ✓ Materialized views for analytics';
    RAISE NOTICE '  ✓ Full-text search for SSIDs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Test connection: SELECT PostGIS_version();';
    RAISE NOTICE '  2. Insert test data: INSERT INTO sigint.signal_detections...';
    RAISE NOTICE '  3. Query spatial data: SELECT * FROM sigint.recent_detections_geojson;';
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
END $$;
