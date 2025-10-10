-- =====================================================
-- ShadowCheck Refactored Database Schema (3NF)
-- Fully normalized schema with clear naming conventions
-- =====================================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create app schema
CREATE SCHEMA IF NOT EXISTS app;

-- =====================================================
-- CUSTOM TYPES AND DOMAINS
-- =====================================================

-- Radio technology enumeration
CREATE TYPE app.radio_technology AS ENUM (
    'wifi_2_4_ghz',
    'wifi_5_ghz',
    'wifi_6_ghz',
    'bluetooth_classic',
    'bluetooth_le',
    'cellular_2g',
    'cellular_3g',
    'cellular_4g_lte',
    'cellular_5g_nr',
    'zigbee',
    'thread',
    'unknown'
);

-- Encryption type enumeration
CREATE TYPE app.encryption_type AS ENUM (
    'none',
    'wep',
    'wpa',
    'wpa2_psk',
    'wpa2_enterprise',
    'wpa3_sae',
    'wpa3_enterprise',
    'wpa3_owe',
    'unknown'
);

-- Threat level enumeration
CREATE TYPE app.threat_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Investigation status enumeration
CREATE TYPE app.investigation_status AS ENUM (
    'open',
    'investigating',
    'resolved',
    'false_positive',
    'dismissed'
);

-- Data source type enumeration
CREATE TYPE app.data_source_type AS ENUM (
    'wigle_import',
    'manual_scan',
    'kismet_import',
    'wardriving_session',
    'api_enrichment'
);

-- Geographic coordinate domains with constraints
CREATE DOMAIN app.latitude_degrees AS NUMERIC(10,7)
    CHECK (VALUE >= -90.0 AND VALUE <= 90.0);

CREATE DOMAIN app.longitude_degrees AS NUMERIC(11,7)
    CHECK (VALUE >= -180.0 AND VALUE <= 180.0);

CREATE DOMAIN app.altitude_meters AS NUMERIC(8,2)
    CHECK (VALUE >= -1000.0 AND VALUE <= 20000.0);

CREATE DOMAIN app.accuracy_meters AS NUMERIC(8,2)
    CHECK (VALUE >= 0.0 AND VALUE <= 50000.0);

-- Signal strength domain
CREATE DOMAIN app.signal_strength_dbm AS SMALLINT
    CHECK (VALUE >= -120 AND VALUE <= 30);

-- Frequency domain
CREATE DOMAIN app.frequency_hz AS INTEGER
    CHECK (VALUE >= 1000000 AND VALUE <= 100000000000);

-- =====================================================
-- REFERENCE/LOOKUP TABLES
-- =====================================================

-- IEEE OUI registry for manufacturer identification
CREATE TABLE app.oui_manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    oui_prefix_hex CHAR(6) NOT NULL UNIQUE, -- First 6 hex chars of MAC
    organization_name TEXT NOT NULL,
    organization_address TEXT,
    registry_type TEXT DEFAULT 'MA-L', -- MA-L, MA-M, MA-S
    assignment_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data sources for provenance tracking
CREATE TABLE app.data_sources (
    data_source_id SERIAL PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    source_type app.data_source_type NOT NULL,
    source_description TEXT,
    import_configuration JSONB, -- Store import parameters
    data_quality_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_quality_score >= 0.0 AND data_quality_score <= 1.0),
    is_active BOOLEAN DEFAULT TRUE,
    first_import_at TIMESTAMPTZ,
    last_import_at TIMESTAMPTZ,
    total_records_imported BIGINT DEFAULT 0,
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User devices for tracking personal equipment
CREATE TABLE app.user_devices (
    device_id SERIAL PRIMARY KEY,
    device_name TEXT NOT NULL,
    device_type TEXT, -- 'smartphone', 'laptop', 'tablet', etc.
    mac_address_hash TEXT UNIQUE, -- Hashed for privacy
    is_owned_by_user BOOLEAN DEFAULT TRUE,
    device_description TEXT,
    privacy_enabled BOOLEAN DEFAULT TRUE,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,
    observation_count INTEGER DEFAULT 0,
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Radio access points (WiFi APs, Bluetooth devices, etc.)
CREATE TABLE app.wireless_access_points (
    access_point_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL UNIQUE, -- Full MAC address (BSSID)
    manufacturer_id INTEGER REFERENCES app.oui_manufacturers(manufacturer_id),
    radio_technology app.radio_technology NOT NULL,

    -- Network identification
    network_name TEXT, -- SSID for WiFi, device name for Bluetooth
    is_hidden_network BOOLEAN DEFAULT FALSE,

    -- Technical specifications
    primary_frequency_hz app.frequency_hz,
    supported_channels INTEGER[],
    max_data_rate_mbps INTEGER,

    -- Mobility detection
    is_mobile_device BOOLEAN DEFAULT FALSE,
    mobility_confidence_score NUMERIC(3,2) DEFAULT 0.5,

    -- Spatial aggregation
    primary_location_point GEOMETRY(Point, 4326),
    coverage_area_polygon GEOMETRY(Polygon, 4326),
    location_uncertainty_meters app.accuracy_meters,

    -- Statistics
    total_signal_readings INTEGER DEFAULT 0,
    unique_observation_locations INTEGER DEFAULT 0,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,

    -- Data quality
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score >= 0.0 AND data_confidence_score <= 1.0),
    quality_flags TEXT[],

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal strength measurements and network properties
CREATE TABLE app.signal_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id) ON DELETE CASCADE,
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Signal characteristics
    signal_strength_dbm app.signal_strength_dbm,
    noise_floor_dbm app.signal_strength_dbm,
    signal_to_noise_ratio_db SMALLINT,

    -- Network properties (for WiFi)
    encryption_type app.encryption_type,
    channel_number SMALLINT,
    channel_width_mhz SMALLINT,
    capabilities_string TEXT,
    beacon_interval_ms SMALLINT,

    -- Temporal data
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_duration_ms INTEGER DEFAULT 0,

    -- Quality metrics
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score >= 0.0 AND data_confidence_score <= 1.0),
    measurement_quality_flags TEXT[],

    -- Legacy reference
    original_record_id INTEGER,
    original_source_type CHAR(1), -- 's', 'j', 'g' for legacy device types

    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geographic position measurements
CREATE TABLE app.position_measurements (
    position_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Coordinates
    latitude_degrees app.latitude_degrees NOT NULL,
    longitude_degrees app.longitude_degrees NOT NULL,
    altitude_meters app.altitude_meters,
    position_accuracy_meters app.accuracy_meters,

    -- Computed spatial point (auto-generated)
    position_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS
        (ST_SetSRID(ST_MakePoint(longitude_degrees::DOUBLE PRECISION, latitude_degrees::DOUBLE PRECISION), 4326)) STORED,

    -- Temporal data
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_duration_ms INTEGER DEFAULT 0,

    -- Quality metrics
    position_source TEXT, -- 'gps', 'network', 'manual', 'estimated'
    satellite_count SMALLINT,
    hdop NUMERIC(4,2), -- Horizontal Dilution of Precision
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score >= 0.0 AND data_confidence_score <= 1.0),
    anomaly_flags TEXT[],

    -- Legacy reference
    original_record_id INTEGER,

    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geographic routes and paths
CREATE TABLE app.tracking_routes (
    route_id BIGSERIAL PRIMARY KEY,
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),
    user_device_id INTEGER REFERENCES app.user_devices(device_id),

    route_name TEXT,
    route_description TEXT,
    route_geometry GEOMETRY(LineString, 4326),

    -- Temporal bounds
    route_start_time TIMESTAMPTZ,
    route_end_time TIMESTAMPTZ,
    total_duration_minutes NUMERIC(8,2),

    -- Metrics
    total_distance_meters NUMERIC(10,2),
    average_speed_mps NUMERIC(6,2),
    waypoint_count INTEGER DEFAULT 0,

    -- Quality
    route_completeness_score NUMERIC(3,2) DEFAULT 1.0,
    data_gaps_count INTEGER DEFAULT 0,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND DERIVED DATA
-- =====================================================

-- Location clustering and visit detection
CREATE TABLE app.location_visits (
    visit_id BIGSERIAL PRIMARY KEY,
    user_device_id INTEGER REFERENCES app.user_devices(device_id),

    -- Location identification
    visit_location_name TEXT,
    center_latitude_degrees app.latitude_degrees NOT NULL,
    center_longitude_degrees app.longitude_degrees NOT NULL,
    radius_meters app.accuracy_meters DEFAULT 100.0,

    -- Computed center point
    visit_center_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS
        (ST_SetSRID(ST_MakePoint(center_longitude_degrees::DOUBLE PRECISION, center_latitude_degrees::DOUBLE PRECISION), 4326)) STORED,

    -- Temporal data
    arrival_timestamp TIMESTAMPTZ NOT NULL,
    departure_timestamp TIMESTAMPTZ,
    visit_duration_minutes NUMERIC(8,2),

    -- Visit characteristics
    is_frequent_location BOOLEAN DEFAULT FALSE,
    visit_frequency_score NUMERIC(3,2) DEFAULT 0.0,
    privacy_sensitivity TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'sensitive'

    -- Aggregated data
    unique_access_points_observed INTEGER DEFAULT 0,
    total_signal_measurements INTEGER DEFAULT 0,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security threat detection and stalking incidents
CREATE TABLE app.security_incidents (
    incident_id BIGSERIAL PRIMARY KEY,
    target_device_id INTEGER REFERENCES app.user_devices(device_id),
    suspicious_access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),

    -- Incident classification
    incident_type TEXT NOT NULL, -- 'stalking', 'tracking', 'surveillance', 'anomaly'
    threat_level app.threat_level NOT NULL DEFAULT 'medium',
    investigation_status app.investigation_status DEFAULT 'open',

    -- Detection metrics
    correlation_coefficient NUMERIC(5,4), -- Statistical correlation
    shared_location_count INTEGER DEFAULT 0,
    temporal_overlap_percentage NUMERIC(5,2),
    spatial_proximity_score NUMERIC(5,4),

    -- Spatial analysis
    minimum_distance_meters NUMERIC(8,2),
    average_distance_meters NUMERIC(8,2),
    maximum_distance_meters NUMERIC(8,2),

    -- Temporal analysis
    first_incident_timestamp TIMESTAMPTZ NOT NULL,
    last_incident_timestamp TIMESTAMPTZ,
    incident_duration_hours NUMERIC(8,2),
    pattern_frequency_score NUMERIC(3,2),

    -- Confidence and validation
    detection_confidence_score NUMERIC(3,2) NOT NULL CHECK (detection_confidence_score >= 0.0 AND detection_confidence_score <= 1.0),
    manual_verification_status TEXT, -- 'pending', 'confirmed', 'false_positive'
    analyst_notes TEXT,

    -- Follow-up
    escalation_required BOOLEAN DEFAULT FALSE,
    law_enforcement_notified BOOLEAN DEFAULT FALSE,
    resolution_summary TEXT,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXTERNAL API INTEGRATION
-- =====================================================

-- WiGLE API enrichment data
CREATE TABLE app.wigle_api_enrichments (
    enrichment_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),

    -- WiGLE identifiers
    wigle_netid TEXT UNIQUE,
    wigle_trilat NUMERIC(10,7),
    wigle_trilong NUMERIC(11,7),
    wigle_ssid TEXT,
    wigle_encryption TEXT,
    wigle_country TEXT,
    wigle_region TEXT,
    wigle_city TEXT,
    wigle_postal_code TEXT,
    wigle_qos INTEGER,
    wigle_type TEXT,
    wigle_lastupdt TIMESTAMPTZ,
    wigle_comment TEXT,

    -- API metadata
    api_query_timestamp TIMESTAMPTZ NOT NULL,
    api_response_status TEXT,
    api_result_count INTEGER,
    api_query_parameters JSONB,

    -- Matching confidence
    match_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (match_confidence_score >= 0.0 AND match_confidence_score <= 1.0),
    geographic_accuracy_meters NUMERIC(8,2),

    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEGACY DATA PRESERVATION
-- (Keep existing tables for historical reference)
-- =====================================================

-- NOTE: The following legacy tables are preserved as-is:
-- - app.provenance (data source tracking)
-- - app.locations (raw WiGLE location data)
-- - app.networks (raw WiGLE network data)
-- - app.routes (raw WiGLE route data)
-- - app.ieee_ouis (IEEE OUI registry)

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Spatial indexes
CREATE INDEX idx_wireless_access_points_location ON app.wireless_access_points USING GIST (primary_location_point);
CREATE INDEX idx_wireless_access_points_coverage ON app.wireless_access_points USING GIST (coverage_area_polygon);
CREATE INDEX idx_position_measurements_point ON app.position_measurements USING GIST (position_point);
CREATE INDEX idx_location_visits_center ON app.location_visits USING GIST (visit_center_point);
CREATE INDEX idx_tracking_routes_geometry ON app.tracking_routes USING GIST (route_geometry);

-- Temporal indexes
CREATE INDEX idx_signal_measurements_timestamp ON app.signal_measurements (measurement_timestamp DESC);
CREATE INDEX idx_position_measurements_timestamp ON app.position_measurements (measurement_timestamp DESC);
CREATE INDEX idx_security_incidents_first_timestamp ON app.security_incidents (first_incident_timestamp DESC);
CREATE INDEX idx_location_visits_arrival ON app.location_visits (arrival_timestamp DESC);

-- Foreign key optimization
CREATE INDEX idx_signal_measurements_access_point ON app.signal_measurements (access_point_id);
CREATE INDEX idx_position_measurements_access_point ON app.position_measurements (access_point_id);
CREATE INDEX idx_wireless_access_points_manufacturer ON app.wireless_access_points (manufacturer_id);

-- Lookup optimization
CREATE INDEX idx_wireless_access_points_mac ON app.wireless_access_points (mac_address);
CREATE INDEX idx_wireless_access_points_technology ON app.wireless_access_points (radio_technology);
CREATE INDEX idx_signal_measurements_signal_strength ON app.signal_measurements (signal_strength_dbm);
CREATE INDEX idx_oui_manufacturers_prefix ON app.oui_manufacturers (oui_prefix_hex);

-- Security incident analysis
CREATE INDEX idx_security_incidents_status ON app.security_incidents (investigation_status, threat_level);
CREATE INDEX idx_security_incidents_target ON app.security_incidents (target_device_id);
CREATE INDEX idx_security_incidents_suspicious_ap ON app.security_incidents (suspicious_access_point_id);

-- Composite indexes for common queries
CREATE INDEX idx_signal_access_point_timestamp ON app.signal_measurements (access_point_id, measurement_timestamp DESC);
CREATE INDEX idx_position_access_point_timestamp ON app.position_measurements (access_point_id, measurement_timestamp DESC);

-- =====================================================
-- TRIGGERS FOR DATA MAINTENANCE
-- =====================================================

-- Update record_updated_at timestamps
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.record_updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at columns
CREATE TRIGGER update_wireless_access_points_updated_at
    BEFORE UPDATE ON app.wireless_access_points
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
    BEFORE UPDATE ON app.data_sources
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at
    BEFORE UPDATE ON app.user_devices
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_tracking_routes_updated_at
    BEFORE UPDATE ON app.tracking_routes
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_location_visits_updated_at
    BEFORE UPDATE ON app.location_visits
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
    BEFORE UPDATE ON app.security_incidents
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER update_oui_manufacturers_updated_at
    BEFORE UPDATE ON app.oui_manufacturers
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA app IS 'ShadowCheck SIGINT application schema with normalized tables for wireless network intelligence';

COMMENT ON TABLE app.wireless_access_points IS 'Deduplicated wireless access points (WiFi, Bluetooth, etc.) with spatial and technical aggregation';
COMMENT ON TABLE app.signal_measurements IS 'Individual signal strength readings and network property observations';
COMMENT ON TABLE app.position_measurements IS 'GPS coordinates and geographic position data for wireless observations';
COMMENT ON TABLE app.oui_manufacturers IS 'IEEE OUI registry for identifying device manufacturers from MAC addresses';
COMMENT ON TABLE app.data_sources IS 'Tracking of import sources and data provenance for quality control';
COMMENT ON TABLE app.user_devices IS 'Personal devices for privacy protection and stalking detection';
COMMENT ON TABLE app.location_visits IS 'Clustered location visits derived from position measurements';
COMMENT ON TABLE app.security_incidents IS 'Automated detection of potential stalking and surveillance threats';
COMMENT ON TABLE app.tracking_routes IS 'Movement paths and routes derived from position data';
COMMENT ON TABLE app.wigle_api_enrichments IS 'External enrichment data from WiGLE API integration';

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Create default data source entries
INSERT INTO app.data_sources (source_name, source_type, source_description) VALUES
('Legacy WiGLE Import', 'wigle_import', 'Historical data imported from WiGLE SQLite database'),
('Manual Scanning', 'manual_scan', 'Manual wardriving and network scanning sessions'),
('Kismet Integration', 'kismet_import', 'Data imported from Kismet wireless network detector'),
('WiGLE API', 'api_enrichment', 'Enrichment data retrieved from WiGLE web API');

-- Create default unknown manufacturer
INSERT INTO app.oui_manufacturers (oui_prefix_hex, organization_name, organization_address) VALUES
('000000', 'Unknown Manufacturer', 'Unknown'),
('FFFFFF', 'Locally Administered', 'Not IEEE Assigned');

COMMIT;