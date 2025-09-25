-- =====================================================
-- WiFi and Bluetooth Surveillance Analysis
-- Identify missing detection capabilities
-- =====================================================

-- Check current radio technology coverage
SELECT '=== CURRENT RADIO TECHNOLOGY COVERAGE ===' as analysis_section;

SELECT
    'Radio Technology Distribution' as metric,
    radio_technology,
    COUNT(*) as device_count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM app.wireless_access_points) * 100, 2) as percentage
FROM app.wireless_access_points
GROUP BY radio_technology
ORDER BY device_count DESC;

-- WiFi-specific surveillance patterns we should detect
SELECT '=== WIFI SURVEILLANCE PATTERNS TO IMPLEMENT ===' as patterns;

-- 1. WiFi Pineapple/Evil Twin detection (same SSID, different BSSID, stronger signal)
WITH suspicious_ssids AS (
    SELECT
        wap.current_network_name as ssid,
        COUNT(DISTINCT wap.mac_address) as bssid_count,
        ARRAY_AGG(DISTINCT wap.mac_address) as bssids,
        MAX(sm.signal_strength_dbm) as max_signal,
        MIN(sm.signal_strength_dbm) as min_signal
    FROM app.wireless_access_points wap
    JOIN app.signal_measurements sm ON wap.access_point_id = sm.access_point_id
    WHERE wap.current_network_name IS NOT NULL
        AND wap.current_network_name != ''
        AND wap.radio_technology = 'wifi'
    GROUP BY wap.current_network_name
    HAVING COUNT(DISTINCT wap.mac_address) > 1  -- Same SSID, multiple BSSIDs
)
SELECT
    'Evil Twin / WiFi Pineapple Candidates' as threat_type,
    ssid,
    bssid_count as suspicious_bssid_count,
    max_signal - min_signal as signal_strength_variance
FROM suspicious_ssids
WHERE bssid_count >= 2
ORDER BY bssid_count DESC, signal_strength_variance DESC
LIMIT 10;

-- 2. WiFi Probe Request stalking (devices constantly probing for networks)
SELECT
    'High-Frequency WiFi Probing (Potential Tracking)' as threat_type,
    wap.mac_address,
    COUNT(sm.measurement_id) as probe_count,
    COUNT(DISTINCT DATE_TRUNC('hour', sm.measurement_timestamp)) as active_hours,
    ROUND(AVG(sm.signal_strength_dbm), 2) as avg_signal_strength
FROM app.wireless_access_points wap
JOIN app.signal_measurements sm ON wap.access_point_id = sm.access_point_id
WHERE wap.is_hidden_network = TRUE  -- Hidden networks often indicate probing
    OR wap.current_network_name IS NULL
GROUP BY wap.mac_address
HAVING COUNT(sm.measurement_id) > 1000  -- High probe frequency
ORDER BY probe_count DESC
LIMIT 10;

-- 3. WiFi Deauthentication attack patterns (signal interference)
SELECT
    'WiFi Signal Jamming/Interference Patterns' as threat_type,
    wap.mac_address,
    wap.current_network_name,
    COUNT(sm.measurement_id) as measurements,
    STDDEV(sm.signal_strength_dbm) as signal_variance,
    COUNT(DISTINCT DATE_TRUNC('minute', sm.measurement_timestamp)) as time_periods
FROM app.wireless_access_points wap
JOIN app.signal_measurements sm ON wap.access_point_id = sm.access_point_id
WHERE sm.signal_strength_dbm IS NOT NULL
GROUP BY wap.mac_address, wap.current_network_name
HAVING STDDEV(sm.signal_strength_dbm) > 15  -- High signal variance suggests interference
    AND COUNT(sm.measurement_id) > 100
ORDER BY signal_variance DESC
LIMIT 10;

-- Check for Bluetooth/BLE devices (currently missing)
SELECT '=== BLUETOOTH/BLE SURVEILLANCE GAPS ===' as gaps_section;

SELECT
    'Bluetooth/BLE Device Detection' as gap,
    'MISSING - Only WiFi devices detected' as status,
    'Need to implement BLE tracking for:' as note,
    '1. AirTags, Tiles (stalking devices)' as ble_threat_1,
    '2. Bluetooth beacons (location tracking)' as ble_threat_2,
    '3. BLE surveillance equipment' as ble_threat_3;

-- Check for missing surveillance patterns
SELECT '=== MISSING SURVEILLANCE DETECTION PATTERNS ===' as missing_patterns;

SELECT pattern_name, description, threat_level FROM (
    VALUES
        ('WiFi Pineapple Detection', 'Rogue access points mimicking legitimate networks', 'HIGH'),
        ('Evil Twin Networks', 'Duplicate SSIDs with different BSSIDs for credential harvesting', 'HIGH'),
        ('WiFi Deauth Attacks', 'Signal jamming and forced disconnections', 'MEDIUM'),
        ('Probe Request Tracking', 'Devices broadcasting previous network associations', 'MEDIUM'),
        ('BLE Tracking Devices', 'AirTags, Tiles, and similar stalking devices', 'CRITICAL'),
        ('Bluetooth Surveillance', 'Professional BLE surveillance equipment', 'HIGH'),
        ('WiFi Signal Strength Anomalies', 'Abnormal signal patterns indicating surveillance', 'MEDIUM'),
        ('Network Impersonation', 'Legitimate networks appearing in wrong locations', 'HIGH')
) patterns(pattern_name, description, threat_level)
ORDER BY
    CASE threat_level
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
    END;

-- Show what we CAN detect with current data
SELECT '=== CURRENT WIFI DETECTION CAPABILITIES ===' as current_capabilities;

SELECT
    'Current WiFi Surveillance Detection' as capability,
    'Coordinated Movement (6 anomalies detected)' as detection_1,
    'Impossible Distance Patterns' as detection_2,
    'Sequential MAC Patterns (Government Equipment)' as detection_3,
    'Government Contractor Correlation (18 orgs)' as detection_4;

-- Recommendations for implementation
SELECT '=== IMPLEMENTATION RECOMMENDATIONS ===' as recommendations;

SELECT
    priority,
    threat_pattern,
    implementation_difficulty,
    data_requirements
FROM (
    VALUES
        (1, 'BLE Device Tracking (AirTags, Tiles)', 'MEDIUM', 'Add BLE scan data to wireless_access_points'),
        (2, 'WiFi Evil Twin Detection', 'LOW', 'Use existing SSID/BSSID data with signal analysis'),
        (3, 'Signal Strength Anomaly Detection', 'LOW', 'Use existing signal_measurements data'),
        (4, 'Probe Request Analysis', 'MEDIUM', 'Enhance signal_measurements with probe data'),
        (5, 'Bluetooth Surveillance Detection', 'HIGH', 'Add Bluetooth scanning capabilities'),
        (6, 'WiFi Deauth Attack Detection', 'MEDIUM', 'Add packet capture analysis')
) recs(priority, threat_pattern, implementation_difficulty, data_requirements)
ORDER BY priority;