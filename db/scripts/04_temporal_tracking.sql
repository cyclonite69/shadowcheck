-- ShadowCheck Database Refactor - Phase 4: Temporal Network Identity Tracking
-- Track SSID changes, BSSID walking, MAC spoofing, and network evolution over time

-- Network Identity History (track SSID changes over time for same BSSID)
CREATE TABLE app.network_identity_history (
    identity_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),

    -- Network identification
    ssid_value TEXT,  -- NULL for hidden networks
    is_hidden_network BOOLEAN DEFAULT FALSE,
    is_wifi_direct BOOLEAN DEFAULT FALSE,
    is_probe_response BOOLEAN DEFAULT FALSE,  -- vs beacon frame

    -- Temporal bounds (observation-based, NOT computed)
    valid_from_timestamp TIMESTAMPTZ NOT NULL,
    valid_to_timestamp TIMESTAMPTZ,  -- NULL = current/ongoing

    -- Metadata
    observation_count INTEGER DEFAULT 1,
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),
    change_detection_method TEXT,  -- 'beacon_analysis', 'deauth_probe', 'api_update', 'manual'

    -- Confidence and flags
    is_current_identity BOOLEAN DEFAULT TRUE,
    confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1),

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: Only one current identity per access point
    EXCLUDE (access_point_id WITH =) WHERE (is_current_identity = TRUE)
);

-- Network Change Events (flag suspicious activity)
CREATE TABLE app.network_change_events (
    event_id BIGSERIAL PRIMARY KEY,

    -- Affected networks
    primary_access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),
    related_access_point_id BIGINT REFERENCES app.wireless_access_points(access_point_id),

    -- Event classification
    event_type app.change_event_type_enum NOT NULL,
    detection_method TEXT,  -- 'rss_fingerprint', 'temporal_analysis', 'spatial_clustering'

    -- Detection metrics
    spatial_distance_meters NUMERIC(10,2),
    temporal_distance_seconds INTEGER,
    signal_deviation_score NUMERIC(5,4),
    behavioral_anomaly_score NUMERIC(3,2) CHECK (behavioral_anomaly_score BETWEEN 0 AND 1),

    -- Evidence and context
    detection_timestamp TIMESTAMPTZ NOT NULL,
    supporting_observation_ids BIGINT[],  -- Array of measurement IDs
    evidence_summary JSONB,

    -- Investigation tracking
    verification_status app.verification_status_enum DEFAULT 'pending',
    analyst_notes TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Colocation Tracking (potential stalking detection)
CREATE TABLE app.device_colocation_events (
    colocation_id BIGSERIAL PRIMARY KEY,

    -- Devices involved
    device_1_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),
    device_2_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),

    -- Spatial-temporal correlation
    colocation_timestamp TIMESTAMPTZ NOT NULL,
    distance_meters NUMERIC(8,2),
    duration_seconds INTEGER,

    -- Pattern analysis
    colocation_frequency_score NUMERIC(3,2),  -- How often they appear together
    temporal_correlation_score NUMERIC(3,2),  -- How synchronized their appearances are
    spatial_correlation_score NUMERIC(3,2),   -- How close they typically are

    -- Classification
    stalking_risk_score NUMERIC(3,2) CHECK (stalking_risk_score BETWEEN 0 AND 1),
    is_suspicious BOOLEAN DEFAULT FALSE,

    -- Metadata
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),

    -- Audit fields
    record_created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT no_self_colocation CHECK (device_1_id != device_2_id),
    CONSTRAINT ordered_device_ids CHECK (device_1_id < device_2_id)  -- Avoid duplicates
);

-- Functions for temporal tracking

-- Function to update network identity when SSID changes
CREATE OR REPLACE FUNCTION app.update_network_identity(
    p_access_point_id BIGINT,
    p_new_ssid TEXT,
    p_is_hidden BOOLEAN,
    p_observed_at TIMESTAMPTZ,
    p_data_source_id INTEGER,
    p_detection_method TEXT DEFAULT 'beacon_analysis'
)
RETURNS VOID AS $$
DECLARE
    current_identity RECORD;
BEGIN
    -- Get current identity
    SELECT * INTO current_identity
    FROM app.network_identity_history
    WHERE access_point_id = p_access_point_id
      AND is_current_identity = TRUE;

    -- Check if this is actually a change
    IF current_identity.ssid_value = p_new_ssid AND current_identity.is_hidden_network = p_is_hidden THEN
        -- No change, just update observation count
        UPDATE app.network_identity_history
        SET observation_count = observation_count + 1
        WHERE identity_id = current_identity.identity_id;
        RETURN;
    END IF;

    -- Mark current identity as ended
    UPDATE app.network_identity_history
    SET valid_to_timestamp = p_observed_at,
        is_current_identity = FALSE
    WHERE access_point_id = p_access_point_id
      AND is_current_identity = TRUE;

    -- Insert new identity
    INSERT INTO app.network_identity_history (
        access_point_id, ssid_value, is_hidden_network,
        valid_from_timestamp, data_source_id, change_detection_method
    ) VALUES (
        p_access_point_id, p_new_ssid, p_is_hidden,
        p_observed_at, p_data_source_id, p_detection_method
    );

    -- Log the change event
    INSERT INTO app.network_change_events (
        primary_access_point_id, event_type, detection_method,
        detection_timestamp, evidence_summary
    ) VALUES (
        p_access_point_id, 'ssid_change_same_bssid', p_detection_method,
        p_observed_at, jsonb_build_object(
            'old_ssid', current_identity.ssid_value,
            'new_ssid', p_new_ssid,
            'old_hidden', current_identity.is_hidden_network,
            'new_hidden', p_is_hidden
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to detect BSSID walking (same SSID, different BSSID in proximity)
CREATE OR REPLACE FUNCTION app.detect_bssid_walking()
RETURNS TABLE(
    old_bssid TEXT,
    new_bssid TEXT,
    network_name TEXT,
    distance_meters NUMERIC,
    time_gap_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap1.mac_address as old_bssid,
        ap2.mac_address as new_bssid,
        ap1.current_network_name as network_name,
        ST_Distance(ap1.primary_location_point::geography, ap2.primary_location_point::geography) as distance_meters,
        EXTRACT(EPOCH FROM (ap2.record_created_at - ap1.record_updated_at)) / 3600 as time_gap_hours
    FROM app.wireless_access_points ap1
    JOIN app.wireless_access_points ap2 ON ap1.current_network_name = ap2.current_network_name
    WHERE ap1.access_point_id != ap2.access_point_id
      AND ap1.current_network_name IS NOT NULL
      AND ST_DWithin(ap1.primary_location_point::geography, ap2.primary_location_point::geography, 500)  -- 500m radius
      AND ap2.record_created_at > ap1.record_updated_at
      AND ap2.record_created_at - ap1.record_updated_at < INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to detect potential MAC spoofing via RSS analysis
CREATE OR REPLACE FUNCTION app.detect_mac_spoofing(p_access_point_id BIGINT, p_z_score_threshold NUMERIC DEFAULT 3.0)
RETURNS TABLE(
    measurement_id BIGINT,
    signal_strength_dbm SMALLINT,
    expected_signal NUMERIC,
    deviation_score NUMERIC,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH rss_profile AS (
        SELECT
            AVG(signal_strength_dbm::NUMERIC) as mean_signal,
            STDDEV(signal_strength_dbm::NUMERIC) as stddev_signal
        FROM app.signal_measurements
        WHERE access_point_id = p_access_point_id
          AND measurement_timestamp >= NOW() - INTERVAL '7 days'
          AND signal_strength_dbm IS NOT NULL
    )
    SELECT
        sm.measurement_id,
        sm.signal_strength_dbm,
        rp.mean_signal as expected_signal,
        ABS(sm.signal_strength_dbm::NUMERIC - rp.mean_signal) / NULLIF(rp.stddev_signal, 0) as deviation_score,
        sm.measurement_timestamp as timestamp
    FROM app.signal_measurements sm
    CROSS JOIN rss_profile rp
    WHERE sm.access_point_id = p_access_point_id
      AND sm.measurement_timestamp >= NOW() - INTERVAL '1 hour'
      AND rp.stddev_signal > 0
      AND ABS(sm.signal_strength_dbm::NUMERIC - rp.mean_signal) / rp.stddev_signal > p_z_score_threshold;
END;
$$ LANGUAGE plpgsql;

-- Indexes for temporal queries
CREATE INDEX idx_identity_history_ap_current ON app.network_identity_history (access_point_id) WHERE is_current_identity = TRUE;
CREATE INDEX idx_identity_history_temporal ON app.network_identity_history (valid_from_timestamp, valid_to_timestamp);
CREATE INDEX idx_change_events_timestamp ON app.network_change_events (detection_timestamp);
CREATE INDEX idx_change_events_type ON app.network_change_events (event_type);
CREATE INDEX idx_colocation_devices ON app.device_colocation_events (device_1_id, device_2_id);
CREATE INDEX idx_colocation_timestamp ON app.device_colocation_events (colocation_timestamp);
CREATE INDEX idx_colocation_suspicious ON app.device_colocation_events (stalking_risk_score) WHERE stalking_risk_score > 0.7;

-- Comments
COMMENT ON TABLE app.network_identity_history IS 'Track SSID changes over time for same BSSID - enables temporal analysis';
COMMENT ON TABLE app.network_change_events IS 'Automated detection of BSSID walking, MAC spoofing, network reconfiguration';
COMMENT ON TABLE app.device_colocation_events IS 'Spatial-temporal correlation analysis for stalking detection';
COMMENT ON FUNCTION app.update_network_identity(BIGINT, TEXT, BOOLEAN, TIMESTAMPTZ, INTEGER, TEXT) IS 'Update network identity when SSID changes are detected';
COMMENT ON FUNCTION app.detect_bssid_walking() IS 'Find same SSID with different BSSID in proximity - potential AP replacement';
COMMENT ON FUNCTION app.detect_mac_spoofing(BIGINT, NUMERIC) IS 'Statistical RSS analysis to detect MAC address spoofing';