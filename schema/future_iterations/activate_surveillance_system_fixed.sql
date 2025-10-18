-- =====================================================
-- Activate ShadowCheck Surveillance Detection System (Fixed)
-- Populate reference tables and run detection engine
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Populate radio_manufacturers from IEEE OUI data
-- =====================================================

INSERT INTO app.radio_manufacturers (
    ieee_registry_type,
    oui_assignment_hex,
    organization_name,
    organization_address
)
SELECT DISTINCT
    'MA-L' as ieee_registry_type,
    UPPER(REPLACE(oui, ':', '')) as oui_assignment_hex,
    organization_name,
    COALESCE(organization_address, '') as organization_address
FROM app.ieee_ouis_clean_legacy
WHERE organization_name IS NOT NULL
    AND organization_name != ''
    AND oui IS NOT NULL
    AND LENGTH(REPLACE(oui, ':', '')) >= 6
ON CONFLICT (ieee_registry_type, oui_assignment_hex) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    organization_address = EXCLUDED.organization_address;

-- =====================================================
-- STEP 2: Verify manufacturer enrichment is working
-- =====================================================

-- Test the manufacturer lookup function
SELECT 'Testing manufacturer lookup for sample MAC...' as status;

-- Check a few sample wireless access points to see if manufacturer_id gets populated
DO $$
DECLARE
    rec RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR rec IN
        SELECT access_point_id, mac_address
        FROM app.wireless_access_points
        WHERE manufacturer_id IS NULL
        LIMIT 100
    LOOP
        UPDATE app.wireless_access_points
        SET manufacturer_id = app.get_manufacturer_id(rec.mac_address)
        WHERE access_point_id = rec.access_point_id;

        updated_count := updated_count + 1;
    END LOOP;

    RAISE NOTICE 'Updated manufacturer_id for % access points', updated_count;
END $$;

-- =====================================================
-- STEP 3: Run comprehensive surveillance detection
-- =====================================================

SELECT 'Running surveillance detection engine...' as status;

-- Run the master detection function
-- This will populate surveillance_anomalies table
SELECT
    anomaly_type,
    anomaly_count,
    max_confidence,
    avg_confidence,
    critical_count
FROM app.run_comprehensive_surveillance_detection(
    p_target_device_id := NULL,        -- Analyze all devices
    p_analysis_hours := 72,            -- Look back 72 hours
    p_create_anomaly_records := TRUE   -- Create anomaly records
);

-- =====================================================
-- STEP 4: Check government correlation system
-- =====================================================

SELECT 'Checking government correlations...' as status;

-- Check if government_infrastructure_correlations table exists
-- If it was moved to backup, we need to handle this differently
SELECT COUNT(*) as government_contractors_available
FROM app.government_contractors;

-- =====================================================
-- STEP 5: Create surveillance incidents from high-confidence anomalies
-- =====================================================

SELECT 'Creating surveillance incidents from anomalies...' as status;

-- First check if we have user_devices
INSERT INTO app.user_devices (device_name, device_type, is_primary_device)
SELECT 'Primary User Device', 'mobile_phone', TRUE
WHERE NOT EXISTS (SELECT 1 FROM app.user_devices);

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
    sa.primary_device_id as stalker_access_point_id,
    (SELECT user_device_id FROM app.user_devices LIMIT 1) as target_user_device_id,
    sa.anomaly_type::text as incident_type,
    'automated_pattern_detection' as detection_method,
    sa.confidence_score,
    jsonb_build_object(
        'anomaly_id', sa.anomaly_id,
        'evidence_strength', sa.evidence_strength,
        'investigation_priority', sa.investigation_priority,
        'movement_vector', sa.movement_vector
    ) as evidence_package,
    CASE
        WHEN sa.confidence_score >= 0.9 THEN 'critical'
        WHEN sa.confidence_score >= 0.7 THEN 'high'
        WHEN sa.confidence_score >= 0.5 THEN 'medium'
        ELSE 'low'
    END as risk_level,
    sa.anomaly_timespan_start as incident_start_time,
    COALESCE(sa.anomaly_timespan_end, sa.anomaly_timespan_start + INTERVAL '1 hour') as incident_end_time,
    sa.anomaly_locations as geographic_scope,
    CASE
        WHEN sa.anomaly_type = 'impossible_distance' THEN 'Device exhibited impossible movement patterns suggesting surveillance equipment'
        WHEN sa.anomaly_type = 'coordinated_movement' THEN 'Multiple devices moving in coordination suggesting surveillance team'
        WHEN sa.anomaly_type = 'sequential_mac_pattern' THEN 'Sequential MAC addresses detected suggesting government/professional equipment'
        ELSE 'Automated surveillance pattern detected'
    END as operational_notes
FROM app.surveillance_anomalies sa
WHERE sa.confidence_score >= 0.5  -- Only create incidents for medium+ confidence
    AND sa.operational_significance IN ('high', 'critical')
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show results
SELECT
    'radio_manufacturers populated' as table_name,
    COUNT(*) as row_count
FROM app.radio_manufacturers

UNION ALL

SELECT
    'surveillance_anomalies detected',
    COUNT(*)
FROM app.surveillance_anomalies

UNION ALL

SELECT
    'stalking_incidents created',
    COUNT(*)
FROM app.stalking_incidents

UNION ALL

SELECT
    'government_contractors available',
    COUNT(*)
FROM app.government_contractors

UNION ALL

SELECT
    'user_devices configured',
    COUNT(*)
FROM app.user_devices;

-- Show breakdown of anomaly types detected
SELECT
    'ANOMALY DETECTION RESULTS:' as summary,
    '' as spacer,
    '' as spacer2;

SELECT
    anomaly_type,
    COUNT(*) as count,
    ROUND(AVG(confidence_score), 3) as avg_confidence,
    ROUND(MAX(confidence_score), 3) as max_confidence,
    COUNT(*) FILTER (WHERE confidence_score >= 0.7) as high_confidence_count
FROM app.surveillance_anomalies
GROUP BY anomaly_type
ORDER BY count DESC;