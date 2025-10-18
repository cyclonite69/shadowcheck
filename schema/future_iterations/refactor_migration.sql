-- =====================================================
-- ShadowCheck Database Refactoring Migration
-- Phase 1: Backup and Reorganization
-- =====================================================

BEGIN;

-- Create backup schema for deprecated tables
CREATE SCHEMA IF NOT EXISTS backup;

-- =====================================================
-- PHASE 1: Move cruft tables (0 rows) to backup schema
-- =====================================================

-- Tables with 0 rows that are deprecated/incomplete
ALTER TABLE app.data_access_log SET SCHEMA backup;
ALTER TABLE app.data_custody_log SET SCHEMA backup;
ALTER TABLE app.device_colocation_events SET SCHEMA backup;
ALTER TABLE app.device_relationships SET SCHEMA backup;
ALTER TABLE app.government_infrastructure_correlations SET SCHEMA backup;
ALTER TABLE app.location_visits SET SCHEMA backup;
ALTER TABLE app.network_change_events SET SCHEMA backup;
ALTER TABLE app.network_identity_history SET SCHEMA backup;
ALTER TABLE app.radio_manufacturers SET SCHEMA backup;
ALTER TABLE app.stalking_incidents SET SCHEMA backup;
ALTER TABLE app.user_devices SET SCHEMA backup;
ALTER TABLE app.wigle_enrichment_metadata SET SCHEMA backup;
ALTER TABLE app.wigle_network_observations SET SCHEMA backup;

-- =====================================================
-- PHASE 2: Rename legacy tables (immutable source data)
-- =====================================================

-- These are the WiGLE import tables that must be preserved as-is
ALTER TABLE app.networks RENAME TO networks_legacy;
ALTER TABLE app.locations RENAME TO locations_legacy;
ALTER TABLE app.routes RENAME TO routes_legacy;
ALTER TABLE app.provenance RENAME TO provenance_legacy;
ALTER TABLE app.ieee_ouis RENAME TO ieee_ouis_legacy;
ALTER TABLE app.ieee_ouis_clean RENAME TO ieee_ouis_clean_legacy;
ALTER TABLE app.ieee_ouis_corrupt RENAME TO ieee_ouis_corrupt_legacy;

-- =====================================================
-- PHASE 3: Rename current tables to better names
-- =====================================================

-- Better semantic naming for existing normalized tables
ALTER TABLE app.network_observations RENAME TO signal_measurements;
ALTER TABLE app.radio_access_points RENAME TO wireless_access_points;
ALTER TABLE app.location_measurements RENAME TO position_measurements;

-- Tables that are useful but need better organization
ALTER TABLE app.oui_manufacturers RENAME TO manufacturer_registry;
ALTER TABLE app.data_sources RENAME TO data_import_sources;

-- =====================================================
-- PHASE 4: Create new properly designed tables
-- =====================================================

-- Create enhanced wireless access points table with proper constraints
CREATE TABLE app.access_points (
    access_point_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL,
    manufacturer_id INTEGER,

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

    -- Metadata
    total_observations INTEGER DEFAULT 0,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_mac_format CHECK (mac_address ~ '^[0-9A-Fa-f:.-]{12,17}$'),
    CONSTRAINT unique_mac_address UNIQUE (mac_address)
);

-- Create signal measurements table with proper relationships
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
    observer_location GEOMETRY(Point, 4326),
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

-- Create location visits table (derived data)
CREATE TABLE app.location_clusters (
    cluster_id BIGSERIAL PRIMARY KEY,

    -- Spatial definition
    center_point GEOMETRY(Point, 4326) NOT NULL,
    bounding_box GEOMETRY(Polygon, 4326),
    radius_meters NUMERIC(8,2),

    -- Temporal characteristics
    first_visit_at TIMESTAMPTZ,
    last_visit_at TIMESTAMPTZ,
    total_visit_duration INTERVAL,
    visit_count INTEGER DEFAULT 0,

    -- Classification
    location_type TEXT, -- 'home', 'work', 'frequent', 'transit', 'unknown'
    confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),

    -- Privacy
    is_sensitive_location BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create surveillance detection table
CREATE TABLE app.surveillance_detections (
    detection_id BIGSERIAL PRIMARY KEY,

    -- Detection metadata
    detection_type TEXT NOT NULL, -- 'impossible_speed', 'coordinated_movement', 'route_following', 'aerial_pattern', 'sequential_mac'
    threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),

    -- Involved entities
    suspect_access_point_ids BIGINT[],
    related_location_cluster_ids BIGINT[],

    -- Spatial context
    detection_area GEOMETRY(Polygon, 4326),

    -- Temporal context
    detection_start_time TIMESTAMPTZ,
    detection_end_time TIMESTAMPTZ,

    -- Evidence details
    evidence_data JSONB,
    analysis_notes TEXT,

    -- Status tracking
    is_confirmed BOOLEAN DEFAULT FALSE,
    is_false_positive BOOLEAN DEFAULT FALSE,
    investigated_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create network identity history table (temporal tracking)
CREATE TABLE app.network_identity_changes (
    change_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.access_points(access_point_id) ON DELETE CASCADE,

    -- Identity change details
    previous_network_name TEXT,
    new_network_name TEXT,
    previous_encryption_type TEXT,
    new_encryption_type TEXT,

    -- Context
    change_detected_at TIMESTAMPTZ NOT NULL,
    location_of_change GEOMETRY(Point, 4326),

    -- Analysis
    change_type TEXT, -- 'ssid_change', 'encryption_change', 'capability_change'
    is_suspicious_change BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHASE 5: Migrate data from old to new tables
-- =====================================================

-- Migrate wireless access points data
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
FROM app.wireless_access_points;

-- =====================================================
-- PHASE 6: Create proper indexes
-- =====================================================

-- Spatial indexes
CREATE INDEX idx_access_points_location ON app.access_points USING GIST (primary_location);
CREATE INDEX idx_access_points_coverage ON app.access_points USING GIST (coverage_area);
CREATE INDEX idx_signal_observations_location ON app.signal_observations USING GIST (observer_location);
CREATE INDEX idx_location_clusters_center ON app.location_clusters USING GIST (center_point);
CREATE INDEX idx_location_clusters_bbox ON app.location_clusters USING GIST (bounding_box);
CREATE INDEX idx_surveillance_detections_area ON app.surveillance_detections USING GIST (detection_area);

-- Temporal indexes
CREATE INDEX idx_signal_observations_time ON app.signal_observations (observed_at);
CREATE INDEX idx_access_points_last_seen ON app.access_points (last_observed_at);
CREATE INDEX idx_surveillance_detections_time ON app.surveillance_detections (detection_start_time, detection_end_time);
CREATE INDEX idx_network_changes_time ON app.network_identity_changes (change_detected_at);

-- Lookup indexes
CREATE INDEX idx_access_points_mac ON app.access_points (mac_address);
CREATE INDEX idx_signal_observations_ap_id ON app.signal_observations (access_point_id);
CREATE INDEX idx_signal_observations_strength ON app.signal_observations (signal_strength_dbm);
CREATE INDEX idx_surveillance_detections_type ON app.surveillance_detections (detection_type);
CREATE INDEX idx_surveillance_detections_threat ON app.surveillance_detections (threat_level);

-- =====================================================
-- PHASE 7: Add comments for documentation
-- =====================================================

COMMENT ON TABLE app.access_points IS 'Deduplicated wireless access points with spatial and temporal metadata';
COMMENT ON TABLE app.signal_observations IS 'Individual signal strength measurements with full context';
COMMENT ON TABLE app.location_clusters IS 'Derived location patterns from position measurements';
COMMENT ON TABLE app.surveillance_detections IS 'Automated detection of surveillance patterns and anomalies';
COMMENT ON TABLE app.network_identity_changes IS 'Temporal tracking of network identity changes (SSID, encryption, etc.)';

COMMENT ON SCHEMA backup IS 'Deprecated tables moved out of active schema - preserved for reference';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check table counts after migration
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname IN ('app', 'backup')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;