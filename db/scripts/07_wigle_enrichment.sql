-- ShadowCheck Database Refactor - Phase 7: WiGLE Triangulation and Enrichment
-- Complete field mapping for all 43+ WiGLE API fields and RSS² weighted triangulation
-- Mark triangulated positions as DERIVED data

-- WiGLE API Enrichments (complete field preservation)
CREATE TABLE app.wigle_api_enrichments (
    enrichment_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),

    -- Core WiGLE identification
    wigle_netid TEXT UNIQUE,               -- WiGLE's network ID (BSSID)
    wigle_ssid TEXT,                       -- Network name from WiGLE
    wigle_type TEXT,                       -- Single char: W=WiFi, B=Bluetooth, G=GSM, etc.
    wigle_comment TEXT,                    -- User-submitted comments
    wigle_encryption TEXT,                 -- WPA2/WPA3/WEP/Open
    wigle_qos INTEGER CHECK (wigle_qos BETWEEN 0 AND 7),  -- QoS level

    -- Triangulated coordinates (DERIVED - computed by WiGLE)
    wigle_trilat NUMERIC(12,9),            -- DERIVED: RSS² weighted latitude
    wigle_trilong NUMERIC(12,9),           -- DERIVED: RSS² weighted longitude
    is_derived_triangulation BOOLEAN DEFAULT TRUE,

    -- Geographic context
    wigle_country TEXT,
    wigle_region TEXT,                     -- State/province
    wigle_city TEXT,
    wigle_postal_code TEXT,

    -- Temporal data (WiGLE's view of network lifecycle)
    wigle_first_time TIMESTAMPTZ,          -- First seen by WiGLE (may not be actual first)
    wigle_last_time TIMESTAMPTZ,           -- Last seen by WiGLE
    wigle_lastupdt TIMESTAMPTZ,            -- Last database update (compact format: YYYYMMDDHHMMSS)
    wigle_transid TEXT,                    -- Transaction ID

    -- Network metadata
    wigle_friendly_name TEXT,              -- User-assigned friendly name
    wigle_channel SMALLINT,                -- WiFi channel
    wigle_beacon_interval_ms SMALLINT,     -- Beacon interval in milliseconds
    wigle_freenet TEXT,                    -- Free network indicator
    wigle_dhcp TEXT,                       -- DHCP availability
    wigle_paynet TEXT,                     -- Pay network indicator
    wigle_user_found BOOLEAN,              -- User discovery flag
    wigle_wep_status TEXT,                 -- WEP status: 0/2/N

    -- Detailed observations (LocationData array from API)
    wigle_location_observations JSONB,     -- Array of {ssid, snr, accuracy, alt, noise, signal, time}

    -- Additional WiGLE fields (comprehensive mapping)
    wigle_housenumber TEXT,
    wigle_road TEXT,
    wigle_postalcode TEXT,
    wigle_name TEXT,
    wigle_bcninterval INTEGER,
    wigle_wps TEXT,                        -- WPS status
    wigle_privacy TEXT,                    -- Privacy settings

    -- API call metadata
    api_query_timestamp TIMESTAMPTZ NOT NULL,
    api_response_status TEXT,
    api_response_code INTEGER,
    match_confidence_score NUMERIC(3,2) DEFAULT 0.8 CHECK (match_confidence_score BETWEEN 0 AND 1),

    -- Data quality flags
    has_triangulation_data BOOLEAN GENERATED ALWAYS AS (wigle_trilat IS NOT NULL AND wigle_trilong IS NOT NULL) STORED,
    has_location_observations BOOLEAN GENERATED ALWAYS AS (jsonb_array_length(wigle_location_observations) > 0) STORED,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_triangulation_coords CHECK (
        (wigle_trilat IS NULL AND wigle_trilong IS NULL) OR
        (wigle_trilat BETWEEN -90 AND 90 AND wigle_trilong BETWEEN -180 AND 180)
    )
);

-- Network Triangulated Positions (DERIVED via signal strength weighting)
CREATE TABLE app.network_triangulated_positions (
    triangulation_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),

    -- Triangulated coordinates (DERIVED via RSS² weighted centroid)
    computed_latitude NUMERIC(12,9) NOT NULL,
    computed_longitude NUMERIC(12,9) NOT NULL,
    computation_method TEXT DEFAULT 'rss_squared_weighted_centroid',

    -- PostGIS computed point
    triangulated_point GEOMETRY(Point, 4326) GENERATED ALWAYS AS
        (ST_SetSRID(ST_MakePoint(computed_longitude::DOUBLE PRECISION,
                                 computed_latitude::DOUBLE PRECISION), 4326)) STORED,

    -- Computation metadata
    observation_count INTEGER NOT NULL,
    signal_strength_variance NUMERIC(8,4),
    position_confidence_score NUMERIC(3,2) CHECK (position_confidence_score BETWEEN 0 AND 1),
    computation_timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Computation parameters
    min_signal_dbm SMALLINT,
    max_signal_dbm SMALLINT,
    temporal_range_hours NUMERIC(8,2),

    -- Source data tracking
    source_measurement_ids BIGINT[],       -- Array of signal_measurement IDs used
    excluded_outlier_ids BIGINT[],         -- Measurements excluded as outliers

    -- Mark as derived
    is_derived_value BOOLEAN DEFAULT TRUE,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_triangulated_coords CHECK (
        computed_latitude BETWEEN -90 AND 90 AND
        computed_longitude BETWEEN -180 AND 180
    )
);

-- Triangulation computation view (real-time calculation)
CREATE OR REPLACE VIEW app.vw_realtime_triangulation AS
SELECT
    ap.access_point_id,
    ap.mac_address,
    ap.current_network_name,

    -- RSS² weighted centroid formula: Σ(lat × RSS²) / Σ(RSS²)
    SUM(pm.latitude_degrees::NUMERIC * POWER(sm.signal_strength_dbm::NUMERIC, 2)) /
        NULLIF(SUM(POWER(sm.signal_strength_dbm::NUMERIC, 2)), 0) as computed_trilat,

    SUM(pm.longitude_degrees::NUMERIC * POWER(sm.signal_strength_dbm::NUMERIC, 2)) /
        NULLIF(SUM(POWER(sm.signal_strength_dbm::NUMERIC, 2)), 0) as computed_trilong,

    -- Metadata
    COUNT(*) as observation_count,
    MIN(sm.signal_strength_dbm) as min_signal_dbm,
    MAX(sm.signal_strength_dbm) as max_signal_dbm,
    STDDEV(sm.signal_strength_dbm::NUMERIC) as signal_variance,

    -- Quality assessment
    CASE
        WHEN COUNT(*) >= 10 AND STDDEV(sm.signal_strength_dbm::NUMERIC) < 10 THEN 0.9
        WHEN COUNT(*) >= 5 AND STDDEV(sm.signal_strength_dbm::NUMERIC) < 15 THEN 0.7
        WHEN COUNT(*) >= 3 THEN 0.5
        ELSE 0.3
    END as confidence_score,

    array_agg(sm.measurement_id) as source_measurement_ids,
    MIN(sm.measurement_timestamp) as earliest_observation,
    MAX(sm.measurement_timestamp) as latest_observation

FROM app.wireless_access_points ap
JOIN app.signal_measurements sm ON sm.access_point_id = ap.access_point_id
JOIN app.position_measurements pm ON pm.access_point_id = ap.access_point_id
    AND ABS(EXTRACT(EPOCH FROM (sm.measurement_timestamp - pm.measurement_timestamp))) < 300  -- Within 5 minutes

WHERE sm.signal_strength_dbm IS NOT NULL
  AND sm.is_canonical_observation = TRUE  -- Only use canonical observations
  AND ap.is_mobile_device = FALSE         -- Exclude mobile devices

GROUP BY ap.access_point_id, ap.mac_address, ap.current_network_name
HAVING COUNT(*) >= 3;  -- Minimum 3 observations for triangulation

-- Functions for triangulation and enrichment

-- Compute triangulated position for access point
CREATE OR REPLACE FUNCTION app.compute_triangulated_position(p_access_point_id BIGINT)
RETURNS BIGINT AS $$  -- Returns triangulation_id
DECLARE
    triangulation_result RECORD;
    new_triangulation_id BIGINT;
BEGIN
    -- Get triangulation data from view
    SELECT * INTO triangulation_result
    FROM app.vw_realtime_triangulation
    WHERE access_point_id = p_access_point_id;

    IF triangulation_result.access_point_id IS NULL THEN
        RAISE NOTICE 'Insufficient data for triangulation of access point %', p_access_point_id;
        RETURN NULL;
    END IF;

    -- Insert or update triangulated position
    INSERT INTO app.network_triangulated_positions (
        access_point_id, computed_latitude, computed_longitude,
        observation_count, signal_strength_variance, position_confidence_score,
        min_signal_dbm, max_signal_dbm,
        temporal_range_hours, source_measurement_ids
    ) VALUES (
        p_access_point_id,
        triangulation_result.computed_trilat,
        triangulation_result.computed_trilong,
        triangulation_result.observation_count,
        triangulation_result.signal_variance,
        triangulation_result.confidence_score,
        triangulation_result.min_signal_dbm,
        triangulation_result.max_signal_dbm,
        EXTRACT(EPOCH FROM (triangulation_result.latest_observation - triangulation_result.earliest_observation)) / 3600,
        triangulation_result.source_measurement_ids
    )
    ON CONFLICT (access_point_id) DO UPDATE SET
        computed_latitude = EXCLUDED.computed_latitude,
        computed_longitude = EXCLUDED.computed_longitude,
        observation_count = EXCLUDED.observation_count,
        signal_strength_variance = EXCLUDED.signal_strength_variance,
        position_confidence_score = EXCLUDED.position_confidence_score,
        min_signal_dbm = EXCLUDED.min_signal_dbm,
        max_signal_dbm = EXCLUDED.max_signal_dbm,
        temporal_range_hours = EXCLUDED.temporal_range_hours,
        source_measurement_ids = EXCLUDED.source_measurement_ids,
        computation_timestamp = NOW()
    RETURNING triangulation_id INTO new_triangulation_id;

    RETURN new_triangulation_id;
END;
$$ LANGUAGE plpgsql;

-- Process WiGLE API response and store enrichment data
CREATE OR REPLACE FUNCTION app.process_wigle_enrichment(
    p_mac_address TEXT,
    p_wigle_data JSONB
)
RETURNS BIGINT AS $$  -- Returns enrichment_id
DECLARE
    ap_id BIGINT;
    enrichment_id BIGINT;
BEGIN
    -- Find access point by MAC address
    SELECT access_point_id INTO ap_id
    FROM app.wireless_access_points
    WHERE mac_address = p_mac_address;

    IF ap_id IS NULL THEN
        RAISE EXCEPTION 'Access point not found for MAC address: %', p_mac_address;
    END IF;

    -- Insert WiGLE enrichment data
    INSERT INTO app.wigle_api_enrichments (
        access_point_id, wigle_netid, wigle_ssid, wigle_type,
        wigle_comment, wigle_encryption, wigle_qos,
        wigle_trilat, wigle_trilong,
        wigle_country, wigle_region, wigle_city, wigle_postal_code,
        wigle_first_time, wigle_last_time, wigle_lastupdt, wigle_transid,
        wigle_friendly_name, wigle_channel, wigle_beacon_interval_ms,
        wigle_freenet, wigle_dhcp, wigle_paynet,
        wigle_user_found, wigle_wep_status,
        wigle_location_observations,
        api_query_timestamp, api_response_status
    ) VALUES (
        ap_id,
        p_wigle_data->>'netid',
        p_wigle_data->>'ssid',
        p_wigle_data->>'type',
        p_wigle_data->>'comment',
        p_wigle_data->>'encryption',
        (p_wigle_data->>'qos')::INTEGER,
        (p_wigle_data->>'trilat')::NUMERIC,
        (p_wigle_data->>'trilong')::NUMERIC,
        p_wigle_data->>'country',
        p_wigle_data->>'region',
        p_wigle_data->>'city',
        p_wigle_data->>'postalcode',
        (p_wigle_data->>'firsttime')::TIMESTAMPTZ,
        (p_wigle_data->>'lasttime')::TIMESTAMPTZ,
        (p_wigle_data->>'lastupdt')::TIMESTAMPTZ,
        p_wigle_data->>'transid',
        p_wigle_data->>'name',
        (p_wigle_data->>'channel')::SMALLINT,
        (p_wigle_data->>'bcninterval')::SMALLINT,
        p_wigle_data->>'freenet',
        p_wigle_data->>'dhcp',
        p_wigle_data->>'paynet',
        (p_wigle_data->>'userfound')::BOOLEAN,
        p_wigle_data->>'wep',
        p_wigle_data->'locationData',
        NOW(),
        'success'
    )
    ON CONFLICT (wigle_netid) DO UPDATE SET
        wigle_ssid = EXCLUDED.wigle_ssid,
        wigle_encryption = EXCLUDED.wigle_encryption,
        wigle_trilat = EXCLUDED.wigle_trilat,
        wigle_trilong = EXCLUDED.wigle_trilong,
        wigle_last_time = EXCLUDED.wigle_last_time,
        wigle_lastupdt = EXCLUDED.wigle_lastupdt,
        wigle_location_observations = EXCLUDED.wigle_location_observations,
        api_query_timestamp = EXCLUDED.api_query_timestamp
    RETURNING enrichment_id;

    RETURN enrichment_id;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for triangulation performance
CREATE MATERIALIZED VIEW app.mv_network_triangulation AS
SELECT
    ap.access_point_id,
    ap.mac_address,
    ap.current_network_name,
    ntp.computed_latitude as trilat,
    ntp.computed_longitude as trilong,
    ntp.observation_count,
    ntp.position_confidence_score,
    ntp.triangulated_point,
    ntp.computation_timestamp
FROM app.wireless_access_points ap
JOIN app.network_triangulated_positions ntp ON ntp.access_point_id = ap.access_point_id
WHERE ap.is_mobile_device = FALSE;

-- Unique index on materialized view
CREATE UNIQUE INDEX idx_mv_triangulation_ap ON app.mv_network_triangulation (access_point_id);
CREATE INDEX idx_mv_triangulation_point ON app.mv_network_triangulation USING GIST (triangulated_point);

-- Regular indexes
CREATE INDEX idx_wigle_enrichments_ap ON app.wigle_api_enrichments (access_point_id);
CREATE INDEX idx_wigle_enrichments_netid ON app.wigle_api_enrichments (wigle_netid);
CREATE INDEX idx_wigle_enrichments_triangulation ON app.wigle_api_enrichments (wigle_trilat, wigle_trilong) WHERE wigle_trilat IS NOT NULL;
CREATE UNIQUE INDEX idx_triangulated_positions_ap ON app.network_triangulated_positions (access_point_id);
CREATE INDEX idx_triangulated_positions_point ON app.network_triangulated_positions USING GIST (triangulated_point);
CREATE INDEX idx_triangulated_positions_confidence ON app.network_triangulated_positions (position_confidence_score) WHERE position_confidence_score > 0.7;

-- Comments documenting DERIVED data
COMMENT ON TABLE app.wigle_api_enrichments IS 'Complete WiGLE API field mapping - trilat/trilong marked as DERIVED';
COMMENT ON COLUMN app.wigle_api_enrichments.wigle_trilat IS 'DERIVED: WiGLE triangulated latitude using RSS² weighting';
COMMENT ON COLUMN app.wigle_api_enrichments.wigle_trilong IS 'DERIVED: WiGLE triangulated longitude using RSS² weighting';
COMMENT ON COLUMN app.wigle_api_enrichments.is_derived_triangulation IS 'Flag indicating triangulation is computed, not observed';

COMMENT ON TABLE app.network_triangulated_positions IS 'DERIVED: Computed triangulated positions using RSS² weighted centroid';
COMMENT ON COLUMN app.network_triangulated_positions.computed_latitude IS 'DERIVED: Σ(lat × RSS²) / Σ(RSS²)';
COMMENT ON COLUMN app.network_triangulated_positions.computed_longitude IS 'DERIVED: Σ(lon × RSS²) / Σ(RSS²)';
COMMENT ON COLUMN app.network_triangulated_positions.is_derived_value IS 'Always TRUE - this is computed data, not observed';

COMMENT ON VIEW app.vw_realtime_triangulation IS 'Real-time triangulation computation using RSS² weighted centroid formula';
COMMENT ON FUNCTION app.compute_triangulated_position(BIGINT) IS 'Compute and store triangulated position for access point';
COMMENT ON FUNCTION app.process_wigle_enrichment(TEXT, JSONB) IS 'Process and store complete WiGLE API response data';