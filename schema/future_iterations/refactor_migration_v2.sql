-- =====================================================
-- ShadowCheck Database Refactoring Migration v2
-- Surgical approach: Legacy preservation + Smart cleanup
-- =====================================================

BEGIN;

-- Create backup schema for truly deprecated tables
CREATE SCHEMA IF NOT EXISTS backup;

-- =====================================================
-- PHASE 1: Move CRUFT tables to backup (broken/deprecated)
-- =====================================================

-- These tables are either broken design or truly obsolete
ALTER TABLE app.data_access_log SET SCHEMA backup;
ALTER TABLE app.data_custody_log SET SCHEMA backup;
ALTER TABLE app.device_colocation_events SET SCHEMA backup;
ALTER TABLE app.device_relationships SET SCHEMA backup;
ALTER TABLE app.government_infrastructure_correlations SET SCHEMA backup;
ALTER TABLE app.network_change_events SET SCHEMA backup;
ALTER TABLE app.wigle_enrichment_metadata SET SCHEMA backup;
ALTER TABLE app.wigle_network_observations SET SCHEMA backup;

-- =====================================================
-- PHASE 2: Rename LEGACY tables (immutable WiGLE source data)
-- =====================================================

-- Core WiGLE import tables - these are immutable source data
ALTER TABLE app.networks RENAME TO networks_legacy;
ALTER TABLE app.locations RENAME TO locations_legacy;
ALTER TABLE app.routes RENAME TO routes_legacy;
ALTER TABLE app.provenance RENAME TO provenance_legacy;
ALTER TABLE app.ieee_ouis RENAME TO ieee_ouis_legacy;
ALTER TABLE app.ieee_ouis_clean RENAME TO ieee_ouis_clean_legacy;
ALTER TABLE app.ieee_ouis_corrupt RENAME TO ieee_ouis_corrupt_legacy;

-- =====================================================
-- PHASE 3: Rename current tables to better semantic names
-- =====================================================

-- Better naming for existing normalized tables
ALTER TABLE app.network_observations RENAME TO signal_measurements_old;
ALTER TABLE app.radio_access_points RENAME TO wireless_access_points_old;
ALTER TABLE app.location_measurements RENAME TO position_measurements_old;
ALTER TABLE app.oui_manufacturers RENAME TO manufacturer_registry;
ALTER TABLE app.data_sources RENAME TO data_import_sources;

-- =====================================================
-- PHASE 4: Keep and enhance IMPLEMENTATION tables (0 rows but needed)
-- =====================================================

-- These tables have 0 rows but represent important functionality to implement:
-- - stalking_incidents (surveillance detection core feature)
-- - location_visits (location clustering/analysis)
-- - network_identity_history (temporal SSID tracking)
-- - user_devices (device management)
-- - radio_manufacturers (OUI enrichment - should be populated)

-- Add missing constraints and improvements to implementation tables

-- Enhance stalking_incidents table
ALTER TABLE app.stalking_incidents
ADD COLUMN IF NOT EXISTS evidence_data JSONB,
ADD COLUMN IF NOT EXISTS analysis_confidence NUMERIC(3,2) CHECK (analysis_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS auto_detected BOOLEAN DEFAULT FALSE;

-- Enhance location_visits table
ALTER TABLE app.location_visits
ADD COLUMN IF NOT EXISTS visit_classification TEXT CHECK (visit_classification IN ('home', 'work', 'frequent', 'transit', 'unknown')),
ADD COLUMN IF NOT EXISTS privacy_sensitive BOOLEAN DEFAULT FALSE;

-- Enhance network_identity_history table
ALTER TABLE app.network_identity_history
ADD COLUMN IF NOT EXISTS change_type TEXT CHECK (change_type IN ('ssid_change', 'encryption_change', 'capability_change', 'first_observed')),
ADD COLUMN IF NOT EXISTS suspicious_change BOOLEAN DEFAULT FALSE;

-- =====================================================
-- PHASE 5: Create improved core tables
-- =====================================================

-- Create enhanced wireless access points table
CREATE TABLE app.access_points (
    access_point_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL,
    manufacturer_id INTEGER REFERENCES app.manufacturer_registry(manufacturer_id),

    -- Current network identity
    current_network_name TEXT,
    is_hidden_network BOOLEAN DEFAULT FALSE,

    -- Technical specifications
    primary_frequency_hz INTEGER,
    max_signal_observed_dbm SMALLINT CHECK (max_signal_observed_dbm BETWEEN -120 AND 30),

    -- Spatial data (PostGIS)
    primary_location GEOMETRY(Point, 4326),
    coverage_area GEOMETRY(Polygon, 4326),

    -- Mobility analysis
    is_mobile_device BOOLEAN DEFAULT FALSE,
    mobility_confidence NUMERIC(3,2) DEFAULT 0.5 CHECK (mobility_confidence BETWEEN 0 AND 1),

    -- Aggregated metadata
    total_observations INTEGER DEFAULT 0,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_mac_format CHECK (mac_address ~ '^[0-9A-Fa-f:.-]{12,17}$'),
    CONSTRAINT unique_mac_address UNIQUE (mac_address)
);

-- Create enhanced signal measurements table
CREATE TABLE app.signal_observations (
    observation_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.access_points(access_point_id) ON DELETE CASCADE,
    data_source_id INTEGER REFERENCES app.data_import_sources(data_source_id),

    -- Signal characteristics
    signal_strength_dbm SMALLINT CHECK (signal_strength_dbm BETWEEN -120 AND 30),
    frequency_hz INTEGER,
    channel_number SMALLINT,

    -- Network information at time of observation
    network_name TEXT,
    encryption_type TEXT,
    capabilities TEXT[],

    -- Spatial context
    observer_location GEOMETRY(Point, 4326) NOT NULL,
    distance_meters NUMERIC(8,2),

    -- Temporal context
    observed_at TIMESTAMPTZ NOT NULL,
    observation_duration_seconds INTEGER DEFAULT 1,

    -- Quality metrics
    location_accuracy_meters NUMERIC(6,2),
    signal_quality_percent SMALLINT CHECK (signal_quality_percent BETWEEN 0 AND 100),

    -- Audit
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create position measurements table (clean GPS data)
CREATE TABLE app.position_records (
    position_id BIGSERIAL PRIMARY KEY,
    data_source_id INTEGER REFERENCES app.data_import_sources(data_source_id),

    -- Spatial data
    location_point GEOMETRY(Point, 4326) NOT NULL,
    altitude_meters NUMERIC(8,2),

    -- Temporal data
    recorded_at TIMESTAMPTZ NOT NULL,

    -- Quality metrics
    accuracy_meters NUMERIC(6,2),
    speed_mps NUMERIC(6,2), -- meters per second
    bearing_degrees NUMERIC(5,2) CHECK (bearing_degrees BETWEEN 0 AND 359.99),

    -- Context
    activity_type TEXT, -- 'stationary', 'walking', 'driving', 'unknown'

    -- Audit
    imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHASE 6: Migrate data from old tables to new
-- =====================================================

-- Migrate wireless access points
INSERT INTO app.access_points (
    mac_address,
    manufacturer_id,
    current_network_name,
    is_hidden_network,
    primary_frequency_hz,
    max_signal_observed_dbm,
    primary_location,
    is_mobile_device,
    total_observations,
    first_observed_at,
    last_observed_at,
    created_at,
    updated_at
)
SELECT
    mac_address,
    manufacturer_id,
    current_network_name,
    is_hidden_network,
    primary_frequency_hz,
    max_signal_observed_dbm,
    primary_location_point,
    is_mobile_device,
    total_observations,
    first_observed_at,
    last_observed_at,
    record_created_at,
    record_updated_at
FROM app.wireless_access_points_old;

-- Migrate signal measurements with proper foreign key relationships
INSERT INTO app.signal_observations (
    access_point_id,
    data_source_id,
    signal_strength_dbm,
    frequency_hz,
    network_name,
    observer_location,
    observed_at,
    imported_at
)
SELECT
    ap.access_point_id,
    sm.data_source_id,
    sm.signal_strength_dbm,
    sm.frequency_hz,
    sm.network_name,
    sm.observation_location,
    sm.observation_time,
    sm.imported_at
FROM app.signal_measurements_old sm
JOIN app.access_points ap ON ap.mac_address = (
    SELECT mac_address FROM app.wireless_access_points_old wap
    WHERE wap.access_point_id = sm.access_point_id
);

-- Migrate position measurements
INSERT INTO app.position_records (
    data_source_id,
    location_point,
    altitude_meters,
    recorded_at,
    accuracy_meters,
    imported_at
)
SELECT
    data_source_id,
    location_point,
    altitude_meters,
    measurement_time,
    accuracy_meters,
    imported_at
FROM app.position_measurements_old;

-- =====================================================
-- PHASE 7: Populate radio_manufacturers from IEEE OUI data
-- =====================================================

-- This was empty but should be populated from ieee_ouis_legacy
INSERT INTO app.radio_manufacturers (manufacturer_name, oui_prefix)
SELECT DISTINCT
    organization_name,
    LEFT(oui, 6) as oui_prefix
FROM app.ieee_ouis_clean_legacy
WHERE organization_name IS NOT NULL
ON CONFLICT DO NOTHING;

-- =====================================================
-- PHASE 8: Create proper indexes for performance
-- =====================================================

-- Spatial indexes
CREATE INDEX idx_access_points_location ON app.access_points USING GIST (primary_location);
CREATE INDEX idx_access_points_coverage ON app.access_points USING GIST (coverage_area);
CREATE INDEX idx_signal_observations_location ON app.signal_observations USING GIST (observer_location);
CREATE INDEX idx_position_records_location ON app.position_records USING GIST (location_point);

-- Temporal indexes
CREATE INDEX idx_signal_observations_time ON app.signal_observations (observed_at);
CREATE INDEX idx_position_records_time ON app.position_records (recorded_at);
CREATE INDEX idx_access_points_last_seen ON app.access_points (last_observed_at);

-- Lookup indexes
CREATE INDEX idx_access_points_mac ON app.access_points (mac_address);
CREATE INDEX idx_signal_observations_ap_id ON app.signal_observations (access_point_id);
CREATE INDEX idx_signal_observations_strength ON app.signal_observations (signal_strength_dbm);

-- =====================================================
-- PHASE 9: Add table documentation
-- =====================================================

COMMENT ON TABLE app.access_points IS 'Enhanced wireless access points with spatial and temporal metadata';
COMMENT ON TABLE app.signal_observations IS 'Individual signal strength measurements with full spatial/temporal context';
COMMENT ON TABLE app.position_records IS 'Clean GPS position measurements from all data sources';

COMMENT ON TABLE app.stalking_incidents IS 'Surveillance detection events - TO BE IMPLEMENTED';
COMMENT ON TABLE app.location_visits IS 'Location clustering and visit analysis - TO BE IMPLEMENTED';
COMMENT ON TABLE app.network_identity_history IS 'Temporal tracking of network identity changes - TO BE IMPLEMENTED';
COMMENT ON TABLE app.user_devices IS 'User device management and tracking - TO BE IMPLEMENTED';

COMMENT ON SCHEMA backup IS 'Deprecated/broken tables removed from active schema';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show new table structure and sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname IN ('app', 'backup')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Show row counts for key tables
SELECT
    'access_points' as table_name, COUNT(*) as rows FROM app.access_points
UNION ALL
SELECT 'signal_observations', COUNT(*) FROM app.signal_observations
UNION ALL
SELECT 'position_records', COUNT(*) FROM app.position_records
UNION ALL
SELECT 'stalking_incidents', COUNT(*) FROM app.stalking_incidents
UNION ALL
SELECT 'location_visits', COUNT(*) FROM app.location_visits
UNION ALL
SELECT 'radio_manufacturers', COUNT(*) FROM app.radio_manufacturers;