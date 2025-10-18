-- =====================================================
-- Activate ShadowCheck Surveillance Detection System
-- Populate reference tables and run detection engine
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Populate radio_manufacturers from IEEE OUI data
-- =====================================================

INSERT INTO app.radio_manufacturers (manufacturer_name, oui_prefix, website)
SELECT DISTINCT
    organization_name as manufacturer_name,
    LEFT(oui, 6) as oui_prefix,
    NULL as website
FROM app.ieee_ouis_clean_legacy
WHERE organization_name IS NOT NULL
    AND organization_name != ''
    AND oui IS NOT NULL
    AND LENGTH(oui) >= 6
ON CONFLICT (oui_prefix) DO UPDATE SET
    manufacturer_name = EXCLUDED.manufacturer_name;

-- =====================================================
-- STEP 2: Verify manufacturer enrichment is working
-- =====================================================

-- Test the manufacturer lookup function
SELECT 'Testing manufacturer lookup for sample MAC...' as status;

-- Check a few sample wireless access points to see if manufacturer_id gets populated
UPDATE app.wireless_access_points
SET manufacturer_id = app.get_manufacturer_id(mac_address)
WHERE manufacturer_id IS NULL
LIMIT 100;

-- =====================================================
-- STEP 3: Run comprehensive surveillance detection
-- =====================================================

SELECT 'Running surveillance detection engine...' as status;

-- Run the master detection function
-- This will populate surveillance_anomalies table
SELECT * FROM app.run_comprehensive_surveillance_detection(
    p_target_device_id := NULL,        -- Analyze all devices
    p_analysis_hours := 72,            -- Look back 72 hours
    p_create_anomaly_records := TRUE   -- Create anomaly records
);

-- =====================================================
-- STEP 4: Check government correlation system
-- =====================================================

SELECT 'Checking government correlations...' as status;

-- Force check government correlations for existing access points
-- This trigger should have run automatically, but let's verify
SELECT COUNT(*) as correlations_found
FROM app.government_infrastructure_correlations;

-- =====================================================
-- STEP 5: Create surveillance incidents from high-confidence anomalies
-- =====================================================

SELECT 'Creating surveillance incidents from anomalies...' as status;

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
    1 as target_user_device_id, -- Default user device
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
    'government_correlations found',
    COUNT(*)
FROM app.government_infrastructure_correlations;

-- Show breakdown of anomaly types
SELECT
    anomaly_type,
    COUNT(*) as count,
    AVG(confidence_score) as avg_confidence,
    MAX(confidence_score) as max_confidence
FROM app.surveillance_anomalies
GROUP BY anomaly_type
ORDER BY count DESC;