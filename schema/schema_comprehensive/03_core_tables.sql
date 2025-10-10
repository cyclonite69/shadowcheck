-- ShadowCheck Database Refactor - Phase 3: Core Tables
-- Wireless Access Points and Position/Signal Measurements
-- CRITICAL: NEVER mutate source data, preserve ALL precision

-- Wireless Access Points (deduplicated networks)
CREATE TABLE app.wireless_access_points (
    access_point_id BIGSERIAL PRIMARY KEY,
    mac_address TEXT NOT NULL UNIQUE,  -- NEVER mutate, NEVER hash, store EXACTLY as received
    manufacturer_id INTEGER REFERENCES app.oui_manufacturers(manufacturer_id),
    radio_technology app.radio_technology_enum NOT NULL DEFAULT 'wifi',

    -- Current identity (temporal tracking in separate table)
    current_network_name TEXT,
    is_hidden_network BOOLEAN DEFAULT FALSE,
    is_wifi_direct BOOLEAN DEFAULT FALSE,

    -- Technical specifications
    primary_frequency_hz INTEGER,
    max_signal_observed_dbm SMALLINT CHECK (max_signal_observed_dbm BETWEEN -120 AND 30),

    -- Spatial data (PostGIS)
    primary_location_point GEOMETRY(Point, 4326),
    bounding_box GEOMETRY(Polygon, 4326),

    -- Mobility classification
    is_mobile_device BOOLEAN DEFAULT FALSE,
    mobility_confidence_score NUMERIC(3,2) DEFAULT 0.5 CHECK (mobility_confidence_score BETWEEN 0 AND 1),

    -- Aggregated metadata (NOT stored, computed via views)
    total_observations INTEGER DEFAULT 0,
    unique_data_sources INTEGER DEFAULT 0,

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_mac_format CHECK (mac_address ~ '^[0-9A-Fa-f:.-]{12,17}$')
);

-- Trigger to auto-populate manufacturer
CREATE OR REPLACE FUNCTION app.set_manufacturer_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.manufacturer_id := app.get_manufacturer_id(NEW.mac_address);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_manufacturer_on_insert
    BEFORE INSERT ON app.wireless_access_points
    FOR EACH ROW
    EXECUTE FUNCTION app.set_manufacturer_trigger();

-- Position Measurements (GPS observations with FULL precision)
CREATE TABLE app.position_measurements (
    position_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Coordinates (FULL PRECISION - NEVER round)
    latitude_degrees NUMERIC(12,9) NOT NULL,   -- 9 decimal places = ~1cm precision
    longitude_degrees NUMERIC(12,9) NOT NULL,  -- 9 decimal places = ~1cm precision
    altitude_meters NUMERIC(8,3),              -- Millimeter precision
    position_accuracy_meters NUMERIC(8,3),

    -- PostGIS computed point (automatic from coordinates)
    position_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS
        (ST_SetSRID(ST_MakePoint(longitude_degrees::DOUBLE PRECISION,
                                 latitude_degrees::DOUBLE PRECISION), 4326)) STORED,

    -- Temporal (multiple format support for different pipelines)
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_timestamp_ms BIGINT,    -- WiGLE millisecond epoch
    measurement_timestamp_us BIGINT,    -- Kismet microsecond epoch

    -- Quality and metadata
    position_source TEXT DEFAULT 'gps',  -- 'gps', 'network', 'estimated'
    satellite_count SMALLINT,
    hdop NUMERIC(4,2),                   -- Horizontal Dilution of Precision
    gps_fix_quality INTEGER,             -- Kismet fix type (0-3)
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score BETWEEN 0 AND 1),

    -- Movement metadata (from Kismet)
    speed_mps NUMERIC(6,2),              -- Meters per second
    heading_degrees NUMERIC(5,2) CHECK (heading_degrees BETWEEN 0 AND 360),

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_coordinates CHECK (
        latitude_degrees BETWEEN -90 AND 90 AND
        longitude_degrees BETWEEN -180 AND 180
    )
);

-- Signal Measurements (individual readings with exact values)
CREATE TABLE app.signal_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),
    data_source_id INTEGER NOT NULL REFERENCES app.data_sources(data_source_id),

    -- Signal characteristics (NEVER round - preserve exact dBm values)
    signal_strength_dbm SMALLINT CHECK (signal_strength_dbm BETWEEN -120 AND 30),
    noise_floor_dbm SMALLINT CHECK (noise_floor_dbm BETWEEN -120 AND 0),
    snr_db SMALLINT,

    -- Network properties
    encryption_type TEXT,
    channel_number SMALLINT,
    channel_width_mhz SMALLINT,
    beacon_interval_ms SMALLINT,
    capabilities_string TEXT,

    -- Temporal (PRESERVE PRECISION across all pipelines)
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    measurement_timestamp_ms BIGINT,     -- WiGLE format
    measurement_timestamp_us BIGINT,     -- Kismet format

    -- Quality and deduplication
    data_confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (data_confidence_score BETWEEN 0 AND 1),
    quality_flags TEXT[],

    -- Deduplication tracking
    fingerprint_hash TEXT,              -- SHA256 for dedup identification
    is_canonical_observation BOOLEAN DEFAULT TRUE,
    duplicate_of_measurement_id BIGINT REFERENCES app.signal_measurements(measurement_id),

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT no_self_reference CHECK (measurement_id != duplicate_of_measurement_id)
);

-- Indexes for performance
CREATE INDEX idx_wireless_ap_mac ON app.wireless_access_points (mac_address);
CREATE INDEX idx_wireless_ap_location ON app.wireless_access_points USING GIST (primary_location_point);
CREATE INDEX idx_position_measurements_point ON app.position_measurements USING GIST (position_point);
CREATE INDEX idx_position_measurements_timestamp ON app.position_measurements (measurement_timestamp);
CREATE INDEX idx_position_measurements_ap ON app.position_measurements (access_point_id);
CREATE INDEX idx_signal_measurements_timestamp ON app.signal_measurements (measurement_timestamp);
CREATE INDEX idx_signal_measurements_ap ON app.signal_measurements (access_point_id);
CREATE INDEX idx_signal_measurements_fingerprint ON app.signal_measurements (fingerprint_hash) WHERE fingerprint_hash IS NOT NULL;

-- Comments documenting data integrity rules
COMMENT ON TABLE app.wireless_access_points IS 'Core network identities - NEVER mutate MAC addresses';
COMMENT ON COLUMN app.wireless_access_points.mac_address IS 'NEVER mutate, NEVER hash - store exactly as received from source';
COMMENT ON TABLE app.position_measurements IS 'GPS observations with FULL precision - NEVER round coordinates';
COMMENT ON COLUMN app.position_measurements.latitude_degrees IS 'FULL PRECISION - 9 decimal places for centimeter accuracy';
COMMENT ON COLUMN app.position_measurements.longitude_degrees IS 'FULL PRECISION - 9 decimal places for centimeter accuracy';
COMMENT ON TABLE app.signal_measurements IS 'Individual signal readings - preserve exact dBm values';
COMMENT ON COLUMN app.signal_measurements.signal_strength_dbm IS 'EXACT dBm values - NO approximation or rounding';