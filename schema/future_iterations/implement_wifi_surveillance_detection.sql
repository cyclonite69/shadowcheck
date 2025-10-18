-- =====================================================
-- Implement Missing WiFi Surveillance Detection
-- Functions to detect WiFi-based stalking and surveillance
-- =====================================================

-- 1. WiFi Evil Twin / Pineapple Detection
CREATE OR REPLACE FUNCTION app.detect_wifi_evil_twins(
    p_analysis_hours INTEGER DEFAULT 24,
    p_min_signal_difference INTEGER DEFAULT 10
)
RETURNS TABLE (
    suspicious_ssid TEXT,
    legitimate_bssid TEXT,
    suspicious_bssid TEXT,
    signal_strength_difference INTEGER,
    confidence_score NUMERIC,
    threat_assessment TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH ssid_groups AS (
        SELECT
            wap.current_network_name as ssid,
            wap.mac_address as bssid,
            MAX(sm.signal_strength_dbm) as max_signal,
            COUNT(sm.measurement_id) as measurement_count,
            MIN(sm.measurement_timestamp) as first_seen,
            MAX(sm.measurement_timestamp) as last_seen
        FROM app.wireless_access_points wap
        JOIN app.signal_measurements sm ON wap.access_point_id = sm.access_point_id
        WHERE wap.current_network_name IS NOT NULL
            AND wap.current_network_name != ''
            AND sm.measurement_timestamp >= NOW() - (p_analysis_hours || ' hours')::INTERVAL
        GROUP BY wap.current_network_name, wap.mac_address
    ),
    duplicate_ssids AS (
        SELECT
            sg1.ssid,
            sg1.bssid as bssid1,
            sg1.max_signal as signal1,
            sg1.measurement_count as count1,
            sg2.bssid as bssid2,
            sg2.max_signal as signal2,
            sg2.measurement_count as count2,
            ABS(sg1.max_signal - sg2.max_signal) as signal_diff
        FROM ssid_groups sg1
        JOIN ssid_groups sg2 ON sg1.ssid = sg2.ssid
        WHERE sg1.bssid < sg2.bssid  -- Avoid duplicates
            AND ABS(sg1.max_signal - sg2.max_signal) >= p_min_signal_difference
    )
    SELECT
        ds.ssid,
        CASE WHEN ds.signal1 < ds.signal2 THEN ds.bssid1 ELSE ds.bssid2 END as legitimate_bssid,
        CASE WHEN ds.signal1 > ds.signal2 THEN ds.bssid1 ELSE ds.bssid2 END as suspicious_bssid,
        ds.signal_diff::INTEGER,
        CASE
            WHEN ds.signal_diff > 30 THEN 0.9
            WHEN ds.signal_diff > 20 THEN 0.7
            WHEN ds.signal_diff > 10 THEN 0.5
            ELSE 0.3
        END as confidence_score,
        CASE
            WHEN ds.signal_diff > 30 THEN 'HIGH - Likely Evil Twin Attack'
            WHEN ds.signal_diff > 20 THEN 'MEDIUM - Possible Rogue AP'
            ELSE 'LOW - Signal Variance'
        END as threat_assessment
    FROM duplicate_ssids ds
    ORDER BY ds.signal_diff DESC;
END;
$$;

-- 2. WiFi Signal Strength Anomaly Detection (Surveillance Equipment)
CREATE OR REPLACE FUNCTION app.detect_wifi_signal_anomalies(
    p_analysis_hours INTEGER DEFAULT 48,
    p_min_variance NUMERIC DEFAULT 15.0
)
RETURNS TABLE (
    device_mac TEXT,
    network_name TEXT,
    signal_variance NUMERIC,
    measurement_count BIGINT,
    avg_signal NUMERIC,
    anomaly_type TEXT,
    confidence_score NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        wap.mac_address,
        wap.current_network_name,
        ROUND(STDDEV(sm.signal_strength_dbm), 2) as signal_variance,
        COUNT(sm.measurement_id) as measurement_count,
        ROUND(AVG(sm.signal_strength_dbm), 2) as avg_signal,
        CASE
            WHEN STDDEV(sm.signal_strength_dbm) > 25 THEN 'High Signal Variance (Possible Jamming)'
            WHEN STDDEV(sm.signal_strength_dbm) > 20 THEN 'Moderate Signal Variance (Mobile Surveillance)'
            WHEN AVG(sm.signal_strength_dbm) > -30 AND STDDEV(sm.signal_strength_dbm) > p_min_variance
                THEN 'Strong Signal with Variance (Close Surveillance)'
            ELSE 'Signal Pattern Anomaly'
        END as anomaly_type,
        CASE
            WHEN STDDEV(sm.signal_strength_dbm) > 25 THEN 0.8
            WHEN STDDEV(sm.signal_strength_dbm) > 20 THEN 0.6
            WHEN AVG(sm.signal_strength_dbm) > -30 AND STDDEV(sm.signal_strength_dbm) > p_min_variance THEN 0.7
            ELSE 0.4
        END as confidence_score
    FROM app.wireless_access_points wap
    JOIN app.signal_measurements sm ON wap.access_point_id = sm.access_point_id
    WHERE sm.measurement_timestamp >= NOW() - (p_analysis_hours || ' hours')::INTERVAL
        AND sm.signal_strength_dbm IS NOT NULL
    GROUP BY wap.mac_address, wap.current_network_name
    HAVING STDDEV(sm.signal_strength_dbm) >= p_min_variance
        AND COUNT(sm.measurement_id) > 10
    ORDER BY STDDEV(sm.signal_strength_dbm) DESC;
END;
$$;

-- 3. WiFi Network Impersonation Detection (Networks in wrong locations)
CREATE OR REPLACE FUNCTION app.detect_wifi_network_impersonation(
    p_analysis_hours INTEGER DEFAULT 72,
    p_distance_threshold_km NUMERIC DEFAULT 50.0
)
RETURNS TABLE (
    network_name TEXT,
    legitimate_location GEOMETRY,
    suspicious_location GEOMETRY,
    distance_km NUMERIC,
    legitimate_bssid TEXT,
    suspicious_bssid TEXT,
    confidence_score NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH network_locations AS (
        SELECT
            wap.current_network_name as ssid,
            wap.mac_address as bssid,
            pm.position_point as location,
            COUNT(pm.position_id) as position_count,
            AVG(ST_X(pm.position_point)) as avg_lon,
            AVG(ST_Y(pm.position_point)) as avg_lat
        FROM app.wireless_access_points wap
        JOIN app.position_measurements pm ON wap.access_point_id = pm.access_point_id
        WHERE wap.current_network_name IS NOT NULL
            AND pm.measurement_timestamp >= NOW() - (p_analysis_hours || ' hours')::INTERVAL
        GROUP BY wap.current_network_name, wap.mac_address, pm.position_point
        HAVING COUNT(pm.position_id) > 5
    ),
    network_distances AS (
        SELECT
            nl1.ssid,
            nl1.bssid as bssid1,
            nl1.location as loc1,
            nl1.position_count as count1,
            nl2.bssid as bssid2,
            nl2.location as loc2,
            nl2.position_count as count2,
            ST_Distance(nl1.location::geography, nl2.location::geography) / 1000.0 as distance_km
        FROM network_locations nl1
        JOIN network_locations nl2 ON nl1.ssid = nl2.ssid
        WHERE nl1.bssid < nl2.bssid
            AND ST_Distance(nl1.location::geography, nl2.location::geography) / 1000.0 > p_distance_threshold_km
    )
    SELECT
        nd.ssid,
        CASE WHEN nd.count1 > nd.count2 THEN nd.loc1 ELSE nd.loc2 END as legitimate_location,
        CASE WHEN nd.count1 <= nd.count2 THEN nd.loc1 ELSE nd.loc2 END as suspicious_location,
        nd.distance_km,
        CASE WHEN nd.count1 > nd.count2 THEN nd.bssid1 ELSE nd.bssid2 END as legitimate_bssid,
        CASE WHEN nd.count1 <= nd.count2 THEN nd.bssid1 ELSE nd.bssid2 END as suspicious_bssid,
        CASE
            WHEN nd.distance_km > 500 THEN 0.9
            WHEN nd.distance_km > 200 THEN 0.7
            WHEN nd.distance_km > 100 THEN 0.6
            ELSE 0.4
        END as confidence_score
    FROM network_distances nd
    ORDER BY nd.distance_km DESC;
END;
$$;

-- 4. Enhanced surveillance detection that includes WiFi patterns
CREATE OR REPLACE FUNCTION app.run_wifi_surveillance_detection(
    p_analysis_hours INTEGER DEFAULT 48
)
RETURNS TABLE (
    detection_type TEXT,
    threat_count INTEGER,
    max_confidence NUMERIC,
    avg_confidence NUMERIC,
    high_confidence_count INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    detection_count INTEGER;
BEGIN
    -- Create temporary results table
    CREATE TEMP TABLE wifi_detection_results (
        det_type TEXT,
        threat_cnt INTEGER,
        max_conf NUMERIC,
        avg_conf NUMERIC,
        high_conf_cnt INTEGER
    );

    -- 1. Evil Twin Detection
    INSERT INTO wifi_detection_results
    SELECT
        'WiFi Evil Twin/Pineapple',
        COUNT(*)::INTEGER,
        MAX(confidence_score),
        AVG(confidence_score),
        COUNT(*) FILTER (WHERE confidence_score >= 0.7)::INTEGER
    FROM app.detect_wifi_evil_twins(p_analysis_hours, 10);

    -- 2. Signal Anomaly Detection
    INSERT INTO wifi_detection_results
    SELECT
        'WiFi Signal Anomalies',
        COUNT(*)::INTEGER,
        MAX(confidence_score),
        AVG(confidence_score),
        COUNT(*) FILTER (WHERE confidence_score >= 0.7)::INTEGER
    FROM app.detect_wifi_signal_anomalies(p_analysis_hours, 15.0);

    -- 3. Network Impersonation Detection
    INSERT INTO wifi_detection_results
    SELECT
        'WiFi Network Impersonation',
        COUNT(*)::INTEGER,
        MAX(confidence_score),
        AVG(confidence_score),
        COUNT(*) FILTER (WHERE confidence_score >= 0.7)::INTEGER
    FROM app.detect_wifi_network_impersonation(p_analysis_hours, 50.0);

    -- Return results
    RETURN QUERY
    SELECT det_type, threat_cnt, max_conf, ROUND(avg_conf, 3), high_conf_cnt
    FROM wifi_detection_results
    WHERE threat_cnt > 0
    ORDER BY threat_cnt DESC;

    DROP TABLE wifi_detection_results;
END;
$$;

-- 5. Insert WiFi anomalies into surveillance_anomalies table
INSERT INTO app.surveillance_anomalies (
    anomaly_type,
    primary_device_id,
    confidence_score,
    operational_significance,
    likely_surveillance_type,
    anomaly_detected_at
)
SELECT
    'wifi_evil_twin'::app.surveillance_anomaly_type,
    (SELECT access_point_id FROM app.wireless_access_points WHERE mac_address = det.suspicious_bssid LIMIT 1),
    det.confidence_score,
    CASE
        WHEN det.confidence_score >= 0.7 THEN 'high'
        WHEN det.confidence_score >= 0.5 THEN 'medium'
        ELSE 'low'
    END,
    'wifi_attack',
    NOW()
FROM app.detect_wifi_evil_twins(48, 10) det
WHERE det.confidence_score >= 0.5
ON CONFLICT DO NOTHING;

-- Run the new WiFi detection functions
SELECT '=== WIFI SURVEILLANCE DETECTION RESULTS ===' as detection_results;

SELECT * FROM app.run_wifi_surveillance_detection(48);

-- Show specific WiFi threats detected
SELECT '=== SPECIFIC WIFI THREATS DETECTED ===' as specific_threats;

SELECT
    'Evil Twin Networks' as threat_category,
    COUNT(*) as threats_detected,
    MAX(confidence_score) as max_confidence
FROM app.detect_wifi_evil_twins(48, 10)
WHERE confidence_score >= 0.5

UNION ALL

SELECT
    'Signal Anomalies',
    COUNT(*),
    MAX(confidence_score)
FROM app.detect_wifi_signal_anomalies(48, 15.0)
WHERE confidence_score >= 0.5

UNION ALL

SELECT
    'Network Impersonation',
    COUNT(*),
    MAX(confidence_score)
FROM app.detect_wifi_network_impersonation(72, 50.0)
WHERE confidence_score >= 0.5;

COMMENT ON FUNCTION app.detect_wifi_evil_twins IS 'Detects WiFi Pineapple and Evil Twin attacks by analyzing duplicate SSIDs with different BSSIDs';
COMMENT ON FUNCTION app.detect_wifi_signal_anomalies IS 'Identifies abnormal WiFi signal patterns indicating surveillance equipment or jamming';
COMMENT ON FUNCTION app.detect_wifi_network_impersonation IS 'Detects legitimate networks appearing in impossible locations (network impersonation)';
COMMENT ON FUNCTION app.run_wifi_surveillance_detection IS 'Comprehensive WiFi surveillance detection combining all WiFi-specific detection algorithms';