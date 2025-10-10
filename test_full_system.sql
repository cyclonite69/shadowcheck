-- =====================================================
-- Test Complete Surveillance System Functionality
-- =====================================================

-- Test manufacturer auto-enrichment on a sample
UPDATE app.wireless_access_points
SET manufacturer_id = app.get_manufacturer_id(mac_address)
WHERE manufacturer_id IS NULL
  AND access_point_id <= 1000; -- Test on first 1000 records

-- Add a user device if none exists
INSERT INTO app.user_devices (device_name, device_type, is_primary_device)
SELECT 'Primary User Device', 'mobile_phone', TRUE
WHERE NOT EXISTS (SELECT 1 FROM app.user_devices);

-- Run comprehensive surveillance detection
SELECT 'Running full surveillance detection...' as status;

SELECT
    anomaly_type,
    anomaly_count,
    max_confidence,
    avg_confidence,
    critical_count
FROM app.run_comprehensive_surveillance_detection(
    p_target_device_id := NULL,        -- Analyze all devices
    p_analysis_hours := 168,           -- Look back 1 week
    p_create_anomaly_records := TRUE   -- Create anomaly records
);

-- Create incidents from high-confidence anomalies
INSERT INTO app.stalking_incidents (
    stalker_access_point_id,
    target_user_device_id,
    incident_type,
    detection_method,
    confidence_score,
    evidence_package,
    risk_level,
    incident_start_time,
    incident_end_time,
    geographic_scope,
    operational_notes
)
SELECT
    sa.primary_device_id,
    (SELECT user_device_id FROM app.user_devices LIMIT 1),
    sa.anomaly_type::text,
    'automated_pattern_detection',
    sa.confidence_score,
    jsonb_build_object(
        'anomaly_id', sa.anomaly_id,
        'evidence_strength', sa.evidence_strength,
        'investigation_priority', sa.investigation_priority
    ),
    CASE
        WHEN sa.confidence_score >= 0.9 THEN 'critical'
        WHEN sa.confidence_score >= 0.7 THEN 'high'
        WHEN sa.confidence_score >= 0.5 THEN 'medium'
        ELSE 'low'
    END,
    sa.anomaly_timespan_start,
    COALESCE(sa.anomaly_timespan_end, sa.anomaly_timespan_start + INTERVAL '1 hour'),
    sa.anomaly_locations,
    'Automated surveillance detection - ' || sa.anomaly_type::text
FROM app.surveillance_anomalies sa
WHERE sa.confidence_score >= 0.7  -- High confidence only
    AND NOT EXISTS (
        SELECT 1 FROM app.stalking_incidents si
        WHERE si.evidence_package->>'anomaly_id' = sa.anomaly_id::text
    );

-- Final system status
SELECT '=== SHADOWCHECK SURVEILLANCE SYSTEM STATUS ===' as system_status;

SELECT
    'radio_manufacturers' as component,
    COUNT(*) as count,
    'populated from IEEE OUI registry' as status
FROM app.radio_manufacturers

UNION ALL

SELECT
    'surveillance_anomalies',
    COUNT(*),
    'automated detection active'
FROM app.surveillance_anomalies

UNION ALL

SELECT
    'stalking_incidents',
    COUNT(*),
    'high-confidence threats identified'
FROM app.stalking_incidents

UNION ALL

SELECT
    'government_contractors',
    COUNT(*),
    'reference database loaded'
FROM app.government_contractors

UNION ALL

SELECT
    'wireless_access_points',
    COUNT(*),
    'devices under surveillance monitoring'
FROM app.wireless_access_points

UNION ALL

SELECT
    'position_measurements',
    COUNT(*),
    'GPS tracking points analyzed'
FROM app.position_measurements

UNION ALL

SELECT
    'signal_measurements',
    COUNT(*),
    'signal strength observations'
FROM app.signal_measurements;

-- Show anomaly breakdown
SELECT '=== DETECTED SURVEILLANCE PATTERNS ===' as patterns;

SELECT
    anomaly_type,
    COUNT(*) as detections,
    ROUND(AVG(confidence_score), 3) as avg_confidence,
    ROUND(MAX(confidence_score), 3) as max_confidence,
    COUNT(*) FILTER (WHERE confidence_score >= 0.8) as high_confidence,
    COUNT(*) FILTER (WHERE operational_significance = 'critical') as critical_threats
FROM app.surveillance_anomalies
GROUP BY anomaly_type
ORDER BY detections DESC;