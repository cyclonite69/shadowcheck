-- =====================================================
-- ShadowCheck Surveillance Detection Compatibility Bridge
-- Creates necessary tables and compatibility mappings for surveillance system
-- =====================================================

-- Create required enums if they don't exist
DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app.threat_level AS ENUM (
        'low',
        'medium',
        'high',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app.investigation_status AS ENUM (
        'open',
        'investigating',
        'resolved',
        'false_positive',
        'dismissed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create oui_manufacturers table compatible with existing ieee_ouis
CREATE TABLE IF NOT EXISTS app.oui_manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    oui_prefix_hex CHAR(6) NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    organization_address TEXT,
    registry_type TEXT DEFAULT 'MA-L',
    assignment_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate oui_manufacturers from existing ieee_ouis data
INSERT INTO app.oui_manufacturers (oui_prefix_hex, organization_name, organization_address)
SELECT DISTINCT
    UPPER(SUBSTR(REPLACE(oui, ':', ''), 1, 6)) as oui_prefix_hex,
    COALESCE(organization_name, company_name, 'Unknown') as organization_name,
    address as organization_address
FROM app.ieee_ouis
WHERE oui IS NOT NULL
  AND (organization_name IS NOT NULL OR company_name IS NOT NULL)
ON CONFLICT (oui_prefix_hex) DO NOTHING;

-- Create wireless_access_points table compatible with existing radio_access_points
CREATE TABLE IF NOT EXISTS app.wireless_access_points (
    access_point_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL UNIQUE,
    manufacturer_id INTEGER REFERENCES app.oui_manufacturers(manufacturer_id),
    radio_technology app.radio_technology NOT NULL DEFAULT 'wifi_2_4_ghz',

    -- Network identification
    current_network_name TEXT,
    is_hidden_network BOOLEAN DEFAULT FALSE,

    -- Technical specifications
    primary_frequency_hz INTEGER,
    max_signal_observed_dbm SMALLINT CHECK (max_signal_observed_dbm BETWEEN -120 AND 30),

    -- Spatial data (PostGIS)
    primary_location_point GEOMETRY(Point, 4326),
    bounding_box GEOMETRY(Polygon, 4326),

    -- Mobility classification
    is_mobile_device BOOLEAN DEFAULT FALSE,
    mobility_confidence_score NUMERIC(3,2) DEFAULT 0.5 CHECK (mobility_confidence_score BETWEEN 0 AND 1),

    -- Statistics
    total_observations INTEGER DEFAULT 0,
    unique_data_sources INTEGER DEFAULT 0,
    first_observed_at TIMESTAMPTZ,
    last_observed_at TIMESTAMPTZ,

    -- Data quality
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score BETWEEN 0 AND 1),
    quality_flags TEXT[],

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate wireless_access_points from existing radio_access_points
INSERT INTO app.wireless_access_points (
    mac_address, current_network_name, primary_location_point,
    first_observed_at, last_observed_at, total_observations
)
SELECT DISTINCT
    rap.bssid as mac_address,
    rap.ssid as current_network_name,
    ST_SetSRID(ST_MakePoint(rap.longitude, rap.latitude), 4326) as primary_location_point,
    MIN(rap.first_seen_at) as first_observed_at,
    MAX(rap.last_seen_at) as last_observed_at,
    COUNT(*) as total_observations
FROM app.radio_access_points rap
WHERE rap.bssid IS NOT NULL
GROUP BY rap.bssid, rap.ssid, rap.longitude, rap.latitude
ON CONFLICT (mac_address) DO NOTHING;

-- Update manufacturer_id in wireless_access_points
UPDATE app.wireless_access_points wap
SET manufacturer_id = om.manufacturer_id
FROM app.oui_manufacturers om
WHERE UPPER(LEFT(REPLACE(wap.mac_address, ':', ''), 6)) = om.oui_prefix_hex;

-- Create position_measurements table compatible with location_measurements
CREATE TABLE IF NOT EXISTS app.position_measurements (
    position_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Coordinates (FULL PRECISION)
    latitude_degrees NUMERIC(12,9) NOT NULL,
    longitude_degrees NUMERIC(12,9) NOT NULL,
    altitude_meters NUMERIC(8,3),
    position_accuracy_meters NUMERIC(8,3),

    -- PostGIS computed point
    position_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS
        (ST_SetSRID(ST_MakePoint(longitude_degrees::DOUBLE PRECISION,
                                 latitude_degrees::DOUBLE PRECISION), 4326)) STORED,

    -- Temporal
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_timestamp_ms BIGINT,
    measurement_timestamp_us BIGINT,

    -- Quality and metadata
    position_source TEXT DEFAULT 'gps',
    satellite_count SMALLINT,
    hdop NUMERIC(4,2),
    gps_fix_quality INTEGER,
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score BETWEEN 0 AND 1),

    -- Movement metadata
    speed_mps NUMERIC(6,2),
    heading_degrees NUMERIC(5,2) CHECK (heading_degrees BETWEEN 0 AND 360),

    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_coordinates CHECK (
        latitude_degrees BETWEEN -90 AND 90 AND
        longitude_degrees BETWEEN -180 AND 180
    )
);

-- Populate position_measurements from location_measurements
INSERT INTO app.position_measurements (
    access_point_id, latitude_degrees, longitude_degrees, altitude_meters,
    measurement_timestamp, position_source
)
SELECT
    wap.access_point_id,
    lm.latitude,
    lm.longitude,
    lm.altitude,
    lm.measurement_timestamp,
    'gps'
FROM app.location_measurements lm
JOIN app.wireless_access_points wap ON wap.mac_address = lm.bssid
WHERE lm.latitude IS NOT NULL AND lm.longitude IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create signal_measurements table
CREATE TABLE IF NOT EXISTS app.signal_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Signal characteristics
    signal_strength_dbm SMALLINT CHECK (signal_strength_dbm BETWEEN -120 AND 30),
    noise_floor_dbm SMALLINT CHECK (noise_floor_dbm BETWEEN -120 AND 0),
    snr_db SMALLINT,

    -- Network properties
    encryption_type TEXT,
    channel_number SMALLINT,
    channel_width_mhz SMALLINT,
    beacon_interval_ms SMALLINT,
    capabilities_string TEXT,

    -- Temporal
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_timestamp_ms BIGINT,
    measurement_timestamp_us BIGINT,

    -- Quality and deduplication
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score BETWEEN 0 AND 1),
    quality_flags TEXT[],

    -- Deduplication tracking
    fingerprint_hash TEXT,
    is_canonical_observation BOOLEAN DEFAULT TRUE,
    duplicate_of_measurement_id BIGINT REFERENCES app.signal_measurements(measurement_id),

    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT no_self_reference CHECK (measurement_id != duplicate_of_measurement_id)
);

-- Populate signal_measurements from network_observations
INSERT INTO app.signal_measurements (
    access_point_id, signal_strength_dbm, encryption_type, channel_number,
    measurement_timestamp
)
SELECT
    wap.access_point_id,
    no.signal_strength_dbm,
    no.encryption_type,
    no.channel,
    no.measurement_timestamp
FROM app.network_observations no
JOIN app.wireless_access_points wap ON wap.mac_address = no.bssid
WHERE no.signal_strength_dbm IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create security_incidents table compatible with stalking_incidents
CREATE TABLE IF NOT EXISTS app.security_incidents (
    incident_id BIGSERIAL PRIMARY KEY,
    target_device_id INTEGER REFERENCES app.user_devices(device_id),
    suspicious_access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),

    -- Incident classification
    incident_type TEXT NOT NULL DEFAULT 'stalking',
    threat_level app.threat_level NOT NULL DEFAULT 'medium',
    investigation_status app.investigation_status DEFAULT 'open',

    -- Detection metrics
    correlation_coefficient NUMERIC(5,4),
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
    detection_confidence_score NUMERIC(3,2) NOT NULL CHECK (detection_confidence_score BETWEEN 0 AND 1),
    manual_verification_status TEXT,
    analyst_notes TEXT,

    -- Follow-up
    escalation_required BOOLEAN DEFAULT FALSE,
    law_enforcement_notified BOOLEAN DEFAULT FALSE,
    resolution_summary TEXT,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data from stalking_incidents
INSERT INTO app.security_incidents (
    suspicious_access_point_id, incident_type, detection_confidence_score,
    first_incident_timestamp, analyst_notes
)
SELECT
    wap.access_point_id,
    'stalking',
    0.7, -- Default confidence
    si.first_detected_at,
    si.analysis_notes
FROM app.stalking_incidents si
JOIN app.wireless_access_points wap ON wap.mac_address = si.suspicious_bssid
WHERE si.suspicious_bssid IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_wireless_ap_mac ON app.wireless_access_points (mac_address);
CREATE INDEX IF NOT EXISTS idx_wireless_ap_location ON app.wireless_access_points USING GIST (primary_location_point);
CREATE INDEX IF NOT EXISTS idx_position_measurements_point ON app.position_measurements USING GIST (position_point);
CREATE INDEX IF NOT EXISTS idx_position_measurements_timestamp ON app.position_measurements (measurement_timestamp);
CREATE INDEX IF NOT EXISTS idx_position_measurements_ap ON app.position_measurements (access_point_id);
CREATE INDEX IF NOT EXISTS idx_signal_measurements_timestamp ON app.signal_measurements (measurement_timestamp);
CREATE INDEX IF NOT EXISTS idx_signal_measurements_ap ON app.signal_measurements (access_point_id);

-- Success message
SELECT 'Surveillance detection compatibility bridge completed successfully' as result;