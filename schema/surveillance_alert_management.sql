-- =====================================================
-- ShadowCheck Enhanced Surveillance Alert Management System
-- Professional-grade alerting with user-friendly operational interface
-- Real-time threat assessment with false positive reduction
-- =====================================================

-- =====================================================
-- ENHANCED ALERT CONFIGURATION AND USER PREFERENCES
-- =====================================================

-- User alert configuration for personalized surveillance detection
CREATE TABLE app.surveillance_alert_config (
    config_id SERIAL PRIMARY KEY,
    user_identifier TEXT NOT NULL DEFAULT 'default_user', -- Support for multiple users

    -- Sensitivity configuration
    paranoid_mode BOOLEAN DEFAULT FALSE, -- Maximum sensitivity for active surveillance
    stealth_mode BOOLEAN DEFAULT TRUE,  -- Silent alerts without external notifications

    -- Detection thresholds (lower = more sensitive)
    impossible_distance_threshold NUMERIC(3,2) DEFAULT 0.7,
    coordinated_movement_threshold NUMERIC(3,2) DEFAULT 0.6,
    aerial_surveillance_threshold NUMERIC(3,2) DEFAULT 0.5,
    government_infrastructure_threshold NUMERIC(3,2) DEFAULT 0.8,
    route_correlation_threshold NUMERIC(3,2) DEFAULT 0.7,

    -- Alert delivery preferences
    immediate_alert_threshold NUMERIC(3,2) DEFAULT 0.9, -- Emergency alerts
    batch_alert_interval_minutes INTEGER DEFAULT 60, -- Non-critical alert batching
    suppress_low_confidence_alerts BOOLEAN DEFAULT TRUE,

    -- Safe zone integration
    safe_zone_suppression_enabled BOOLEAN DEFAULT TRUE,
    home_zone_radius_meters INTEGER DEFAULT 500,
    work_zone_radius_meters INTEGER DEFAULT 200,

    -- False positive learning
    enable_ml_false_positive_reduction BOOLEAN DEFAULT TRUE,
    user_feedback_weight NUMERIC(3,2) DEFAULT 0.3,

    -- Evidence and export settings
    auto_create_evidence_packages BOOLEAN DEFAULT TRUE,
    evidence_retention_days INTEGER DEFAULT 365,
    chain_of_custody_required BOOLEAN DEFAULT TRUE,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_config UNIQUE (user_identifier)
);

-- Insert default configuration
INSERT INTO app.surveillance_alert_config (user_identifier) VALUES ('default_user')
ON CONFLICT (user_identifier) DO NOTHING;

-- =====================================================
-- ENHANCED ALERT PROCESSING AND INTELLIGENCE
-- =====================================================

-- Alert intelligence enhancement with context awareness
CREATE OR REPLACE FUNCTION app.enhance_surveillance_alert_intelligence(
    p_anomaly_id BIGINT
)
RETURNS TABLE(
    alert_intelligence JSONB,
    threat_assessment TEXT,
    recommended_actions TEXT[],
    urgency_score NUMERIC
) AS $$
DECLARE
    anomaly_record RECORD;
    device_history RECORD;
    similar_patterns INTEGER := 0;
    escalation_factors NUMERIC := 0.0;
    context_factors JSONB;
BEGIN
    -- Get anomaly details
    SELECT * INTO anomaly_record
    FROM app.surveillance_anomalies sa
    WHERE sa.anomaly_id = p_anomaly_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Analyze device history for pattern recognition
    SELECT COUNT(*) INTO similar_patterns
    FROM app.surveillance_anomalies sa2
    WHERE (sa2.primary_device_id = anomaly_record.primary_device_id
           OR sa2.related_device_ids && ARRAY[anomaly_record.primary_device_id])
      AND sa2.anomaly_type = anomaly_record.anomaly_type
      AND sa2.detection_timestamp >= NOW() - INTERVAL '30 days'
      AND sa2.anomaly_id != p_anomaly_id;

    -- Calculate escalation factors
    escalation_factors :=
        CASE WHEN similar_patterns >= 3 THEN 0.3 ELSE 0.0 END + -- Repeat offender
        CASE WHEN anomaly_record.operational_significance = 'critical' THEN 0.4 ELSE 0.0 END + -- Critical significance
        CASE WHEN EXISTS (
            SELECT 1 FROM app.government_infrastructure_correlations gic
            WHERE gic.access_point_id = anomaly_record.primary_device_id
              AND gic.correlation_confidence >= 0.8
        ) THEN 0.3 ELSE 0.0 END; -- Government correlation

    -- Build context factors
    context_factors := jsonb_build_object(
        'repeat_pattern_count', similar_patterns,
        'government_correlation', EXISTS (
            SELECT 1 FROM app.government_infrastructure_correlations gic
            WHERE gic.access_point_id = anomaly_record.primary_device_id
        ),
        'device_mobility_score', COALESCE((
            SELECT wap.mobility_confidence_score
            FROM app.wireless_access_points wap
            WHERE wap.access_point_id = anomaly_record.primary_device_id
        ), 0.0),
        'recent_activity_spike', (
            SELECT COUNT(*) FROM app.surveillance_anomalies sa3
            WHERE sa3.detection_timestamp >= NOW() - INTERVAL '24 hours'
              AND sa3.confidence_score >= 0.7
        ) > 5
    );

    RETURN QUERY
    SELECT
        jsonb_build_object(
            'anomaly_details', to_jsonb(anomaly_record),
            'context_factors', context_factors,
            'similar_pattern_history', similar_patterns,
            'escalation_score', escalation_factors + anomaly_record.confidence_score,
            'professional_assessment', CASE
                WHEN escalation_factors + anomaly_record.confidence_score >= 1.2 THEN 'state_actor_likely'
                WHEN escalation_factors + anomaly_record.confidence_score >= 1.0 THEN 'professional_surveillance'
                WHEN escalation_factors + anomaly_record.confidence_score >= 0.8 THEN 'organized_surveillance'
                WHEN escalation_factors + anomaly_record.confidence_score >= 0.6 THEN 'possible_surveillance'
                ELSE 'monitoring_recommended'
            END
        ) as intelligence,

        -- Threat assessment
        CASE
            WHEN anomaly_record.anomaly_type IN ('impossible_distance', 'aerial_pattern')
                 AND anomaly_record.confidence_score >= 0.8 THEN 'immediate_threat'
            WHEN escalation_factors >= 0.5 THEN 'elevated_threat'
            WHEN anomaly_record.confidence_score >= 0.7 THEN 'moderate_threat'
            ELSE 'low_threat'
        END as threat_level,

        -- Recommended actions based on threat type and confidence
        CASE anomaly_record.anomaly_type
            WHEN 'impossible_distance' THEN ARRAY[
                'Verify device location immediately',
                'Check for device cloning/MAC spoofing',
                'Review travel patterns for anomalies',
                'Consider device replacement if high confidence'
            ]
            WHEN 'coordinated_movement' THEN ARRAY[
                'Monitor group movement patterns',
                'Identify potential surveillance team size',
                'Document locations and timing',
                'Consider route changes and evasion'
            ]
            WHEN 'aerial_pattern' THEN ARRAY[
                'Look for aircraft/drone surveillance',
                'Document flight patterns and timing',
                'Check for correlation with personal activities',
                'Consider reporting to aviation authorities'
            ]
            WHEN 'sequential_mac_pattern' THEN ARRAY[
                'Investigate government infrastructure correlation',
                'Document infrastructure deployment patterns',
                'Cross-reference with known agency operations',
                'Consult legal counsel if high confidence'
            ]
            WHEN 'surveillance_route' THEN ARRAY[
                'Vary travel routes and timing',
                'Monitor device following patterns',
                'Document evidence of route correlation',
                'Consider counter-surveillance measures'
            ]
            ELSE ARRAY['Monitor situation', 'Gather additional evidence', 'Review security protocols']
        END as actions,

        -- Urgency score (0-1, higher = more urgent)
        LEAST(1.0, anomaly_record.confidence_score + escalation_factors) as urgency
    ;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SMART ALERT GENERATION WITH FALSE POSITIVE REDUCTION
-- =====================================================

-- Smart alert generator with context awareness and false positive reduction
CREATE OR REPLACE FUNCTION app.generate_smart_surveillance_alert(
    p_anomaly_id BIGINT,
    p_user_identifier TEXT DEFAULT 'default_user'
)
RETURNS BIGINT AS $$
DECLARE
    alert_id BIGINT;
    anomaly_record RECORD;
    alert_config RECORD;
    intelligence_data RECORD;
    safe_zone_suppression BOOLEAN := FALSE;
    should_create_alert BOOLEAN := TRUE;
    alert_level TEXT;
    alert_title TEXT;
    alert_description TEXT;
BEGIN
    -- Get anomaly and configuration
    SELECT * INTO anomaly_record FROM app.surveillance_anomalies WHERE anomaly_id = p_anomaly_id;
    SELECT * INTO alert_config FROM app.surveillance_alert_config WHERE user_identifier = p_user_identifier;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Get enhanced intelligence
    SELECT * INTO intelligence_data FROM app.enhance_surveillance_alert_intelligence(p_anomaly_id);

    -- Check safe zone suppression
    IF alert_config.safe_zone_suppression_enabled THEN
        SELECT TRUE INTO safe_zone_suppression
        FROM app.surveillance_safe_zones ssz
        WHERE ST_Contains(ssz.zone_polygon, (
            SELECT ST_Centroid(sa.anomaly_locations)
            FROM app.surveillance_anomalies sa
            WHERE sa.anomaly_id = p_anomaly_id
        ))
        AND ssz.is_active = TRUE
        AND (
            (anomaly_record.anomaly_type = 'impossible_distance' AND ssz.suppress_impossible_distance_alerts) OR
            (anomaly_record.anomaly_type = 'coordinated_movement' AND ssz.suppress_coordinated_movement_alerts)
        );
    END IF;

    -- Apply thresholds and suppression logic
    should_create_alert := CASE
        WHEN safe_zone_suppression THEN FALSE
        WHEN alert_config.suppress_low_confidence_alerts AND anomaly_record.confidence_score < 0.5 THEN FALSE
        WHEN anomaly_record.anomaly_type = 'impossible_distance' AND
             anomaly_record.confidence_score < alert_config.impossible_distance_threshold THEN FALSE
        WHEN anomaly_record.anomaly_type = 'coordinated_movement' AND
             anomaly_record.confidence_score < alert_config.coordinated_movement_threshold THEN FALSE
        WHEN anomaly_record.anomaly_type = 'aerial_pattern' AND
             anomaly_record.confidence_score < alert_config.aerial_surveillance_threshold THEN FALSE
        WHEN anomaly_record.anomaly_type = 'sequential_mac_pattern' AND
             anomaly_record.confidence_score < alert_config.government_infrastructure_threshold THEN FALSE
        WHEN anomaly_record.anomaly_type = 'surveillance_route' AND
             anomaly_record.confidence_score < alert_config.route_correlation_threshold THEN FALSE
        ELSE TRUE
    END;

    IF NOT should_create_alert THEN
        RETURN NULL;
    END IF;

    -- Determine alert level
    alert_level := CASE
        WHEN intelligence_data.urgency_score >= 0.9 THEN 'emergency'
        WHEN intelligence_data.urgency_score >= 0.7 THEN 'critical'
        WHEN intelligence_data.urgency_score >= 0.5 THEN 'warning'
        ELSE 'info'
    END;

    -- Generate human-readable alert content
    alert_title := CASE anomaly_record.anomaly_type
        WHEN 'impossible_distance' THEN
            format('SURVEILLANCE ALERT: Device detected %s km away (impossible travel speed)',
                   ROUND(anomaly_record.suspicious_distance_km::NUMERIC, 1))
        WHEN 'coordinated_movement' THEN
            format('SURVEILLANCE ALERT: %s devices moving in coordination',
                   array_length(anomaly_record.related_device_ids, 1))
        WHEN 'aerial_pattern' THEN
            'SURVEILLANCE ALERT: Aircraft/drone surveillance pattern detected'
        WHEN 'sequential_mac_pattern' THEN
            'SURVEILLANCE ALERT: Government infrastructure pattern detected'
        WHEN 'surveillance_route' THEN
            'SURVEILLANCE ALERT: Device following your routes detected'
        ELSE 'SURVEILLANCE ALERT: Suspicious pattern detected'
    END;

    alert_description := format(
        'Confidence: %s%% | Threat: %s | Priority: %s/10 | Detection: %s',
        ROUND(anomaly_record.confidence_score * 100),
        intelligence_data.threat_assessment,
        anomaly_record.investigation_priority,
        to_char(anomaly_record.detection_timestamp, 'YYYY-MM-DD HH24:MI')
    );

    -- Create the alert
    INSERT INTO app.surveillance_alerts (
        anomaly_id,
        alert_level,
        alert_type,
        requires_immediate_attention,
        alert_title,
        alert_description,
        recommended_actions,
        evidence_summary,
        exportable_evidence
    ) VALUES (
        p_anomaly_id,
        alert_level,
        anomaly_record.anomaly_type,
        intelligence_data.urgency_score >= alert_config.immediate_alert_threshold,
        alert_title,
        alert_description,
        intelligence_data.recommended_actions,
        intelligence_data.alert_intelligence,
        app.export_government_infrastructure_evidence(
            CASE WHEN anomaly_record.primary_device_id IS NOT NULL
                 THEN ARRAY[anomaly_record.primary_device_id]
                 ELSE ARRAY[]::BIGINT[] END ||
            COALESCE(anomaly_record.related_device_ids, ARRAY[]::BIGINT[]),
            format('AUTO_ALERT_%s', p_anomaly_id)
        )
    ) RETURNING alert_id;

    -- Create chain of custody record
    INSERT INTO app.evidence_chain_of_custody (
        anomaly_id,
        custody_event_type,
        event_user,
        event_system,
        access_purpose,
        event_description
    ) VALUES (
        p_anomaly_id,
        'created',
        p_user_identifier,
        'surveillance_alert_system',
        'automated_detection',
        format('Alert created for %s anomaly with %s confidence',
               anomaly_record.anomaly_type,
               ROUND(anomaly_record.confidence_score * 100) || '%')
    );

    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- OPERATIONAL SURVEILLANCE DASHBOARD VIEWS
-- =====================================================

-- Real-time surveillance threat dashboard
CREATE OR REPLACE VIEW app.surveillance_dashboard_realtime AS
SELECT
    -- Alert summary
    COUNT(*) FILTER (WHERE sa.alert_status = 'active') as active_alerts,
    COUNT(*) FILTER (WHERE sa.alert_level = 'emergency') as emergency_alerts,
    COUNT(*) FILTER (WHERE sa.alert_level = 'critical') as critical_alerts,
    COUNT(*) FILTER (WHERE sa.requires_immediate_attention) as immediate_attention_alerts,

    -- Threat landscape overview
    COUNT(DISTINCT sa.alert_type) as unique_threat_types,
    MODE() WITHIN GROUP (ORDER BY sa.alert_type) as most_common_threat,

    -- Recent activity (last 24 hours)
    COUNT(*) FILTER (WHERE sa.record_created_at >= NOW() - INTERVAL '24 hours') as alerts_24h,
    COUNT(*) FILTER (WHERE sa.record_created_at >= NOW() - INTERVAL '1 hour') as alerts_1h,

    -- Response metrics
    AVG(EXTRACT(EPOCH FROM (sa.user_acknowledged_at - sa.record_created_at)) / 60.0)
        FILTER (WHERE sa.user_acknowledged_at IS NOT NULL) as avg_response_time_minutes,
    COUNT(*) FILTER (WHERE sa.is_false_positive = TRUE) as false_positive_count,

    -- System health
    MAX(sa.record_created_at) as last_alert_time,
    COUNT(*) FILTER (WHERE sa.record_created_at >= NOW() - INTERVAL '1 hour'
                     AND sa.alert_level IN ('critical', 'emergency')) > 0 as high_threat_active

FROM app.surveillance_alerts sa
WHERE sa.record_created_at >= NOW() - INTERVAL '7 days';

-- Active surveillance threats requiring attention
CREATE OR REPLACE VIEW app.surveillance_active_threats AS
SELECT
    sa.alert_id,
    sa.anomaly_id,
    sa.alert_level,
    sa.alert_type,
    sa.alert_title,
    sa.alert_description,
    sa.requires_immediate_attention,
    sa.recommended_actions,
    sa.record_created_at as alert_time,

    -- Anomaly details
    sva.confidence_score,
    sva.investigation_priority,
    sva.operational_significance,
    sva.likely_surveillance_type,
    sva.threat_actor_assessment,

    -- Device information
    wap.mac_address as primary_device_mac,
    wap.current_network_name as primary_device_name,
    om.organization_name as manufacturer,

    -- Location context
    ST_AsText(sva.anomaly_locations) as locations_wkt,
    CASE WHEN sva.suspicious_distance_km IS NOT NULL
         THEN ROUND(sva.suspicious_distance_km, 2)
         ELSE NULL END as distance_km,

    -- Government correlation
    gic.correlation_confidence as gov_correlation_confidence,
    gic.government_agency_matches,

    -- Timeline
    EXTRACT(EPOCH FROM (NOW() - sa.record_created_at))/3600 as hours_since_detection,

    -- Evidence availability
    sa.exportable_evidence IS NOT NULL as evidence_package_ready

FROM app.surveillance_alerts sa
JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
LEFT JOIN app.wireless_access_points wap ON sva.primary_device_id = wap.access_point_id
LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
LEFT JOIN app.government_infrastructure_correlations gic ON sva.primary_device_id = gic.access_point_id

WHERE sa.alert_status = 'active'
  AND sa.record_created_at >= NOW() - INTERVAL '30 days'

ORDER BY
    CASE sa.alert_level
        WHEN 'emergency' THEN 1
        WHEN 'critical' THEN 2
        WHEN 'warning' THEN 3
        ELSE 4
    END,
    sa.requires_immediate_attention DESC,
    sva.confidence_score DESC,
    sa.record_created_at DESC;

-- Surveillance pattern trends analysis
CREATE OR REPLACE VIEW app.surveillance_pattern_trends AS
WITH daily_patterns AS (
    SELECT
        DATE_TRUNC('day', sa.record_created_at) as detection_date,
        sa.alert_type,
        COUNT(*) as daily_count,
        AVG(sva.confidence_score) as avg_confidence,
        COUNT(*) FILTER (WHERE sa.alert_level IN ('critical', 'emergency')) as high_severity_count
    FROM app.surveillance_alerts sa
    JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
    WHERE sa.record_created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', sa.record_created_at), sa.alert_type
)
SELECT
    dp.alert_type,
    COUNT(*) as days_active,
    SUM(dp.daily_count) as total_detections,
    AVG(dp.daily_count) as avg_daily_detections,
    MAX(dp.daily_count) as max_daily_detections,
    AVG(dp.avg_confidence) as overall_avg_confidence,
    SUM(dp.high_severity_count) as total_high_severity,

    -- Trend calculation (simple linear regression slope)
    CASE WHEN COUNT(*) > 1 THEN
        (COUNT(*) * SUM(EXTRACT(EPOCH FROM dp.detection_date) * dp.daily_count) -
         SUM(EXTRACT(EPOCH FROM dp.detection_date)) * SUM(dp.daily_count)) /
        (COUNT(*) * SUM(POWER(EXTRACT(EPOCH FROM dp.detection_date), 2)) -
         POWER(SUM(EXTRACT(EPOCH FROM dp.detection_date)), 2))
    ELSE 0 END as trend_slope,

    -- Risk assessment
    CASE
        WHEN AVG(dp.daily_count) > 5 AND AVG(dp.avg_confidence) > 0.7 THEN 'high_risk'
        WHEN AVG(dp.daily_count) > 2 AND AVG(dp.avg_confidence) > 0.6 THEN 'moderate_risk'
        WHEN SUM(dp.high_severity_count) > 0 THEN 'elevated_risk'
        ELSE 'normal_risk'
    END as risk_assessment

FROM daily_patterns dp
GROUP BY dp.alert_type
ORDER BY total_detections DESC, overall_avg_confidence DESC;

-- =====================================================
-- ALERT MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to acknowledge and provide feedback on alerts
CREATE OR REPLACE FUNCTION app.acknowledge_surveillance_alert(
    p_alert_id BIGINT,
    p_user_identifier TEXT,
    p_is_false_positive BOOLEAN DEFAULT NULL,
    p_feedback_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    alert_exists BOOLEAN;
BEGIN
    -- Check if alert exists and is active
    SELECT EXISTS (
        SELECT 1 FROM app.surveillance_alerts
        WHERE alert_id = p_alert_id AND alert_status = 'active'
    ) INTO alert_exists;

    IF NOT alert_exists THEN
        RETURN FALSE;
    END IF;

    -- Update alert with acknowledgment
    UPDATE app.surveillance_alerts SET
        alert_status = CASE WHEN p_is_false_positive THEN 'dismissed' ELSE 'acknowledged' END,
        user_acknowledged_at = NOW(),
        is_false_positive = p_is_false_positive,
        false_positive_reason = CASE WHEN p_is_false_positive THEN p_feedback_notes ELSE NULL END,
        user_feedback = p_feedback_notes,
        record_updated_at = NOW()
    WHERE alert_id = p_alert_id;

    -- Log acknowledgment in chain of custody
    INSERT INTO app.evidence_chain_of_custody (
        anomaly_id,
        custody_event_type,
        event_user,
        access_purpose,
        event_description
    ) SELECT
        anomaly_id,
        CASE WHEN p_is_false_positive THEN 'dismissed' ELSE 'acknowledged' END,
        p_user_identifier,
        'user_response',
        format('Alert %s by user with feedback: %s',
               CASE WHEN p_is_false_positive THEN 'dismissed as false positive' ELSE 'acknowledged' END,
               COALESCE(p_feedback_notes, 'No feedback provided'))
    FROM app.surveillance_alerts
    WHERE alert_id = p_alert_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to export evidence package for legal/law enforcement use
CREATE OR REPLACE FUNCTION app.export_surveillance_evidence_package(
    p_alert_ids BIGINT[],
    p_export_purpose TEXT DEFAULT 'investigation',
    p_case_reference TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    evidence_package JSONB;
    package_hash TEXT;
BEGIN
    -- Create comprehensive evidence package
    SELECT jsonb_build_object(
        'export_metadata', jsonb_build_object(
            'export_timestamp', NOW(),
            'export_purpose', p_export_purpose,
            'case_reference', p_case_reference,
            'alert_count', array_length(p_alert_ids, 1),
            'evidence_classification', 'law_enforcement_sensitive',
            'generated_by_system', 'shadowcheck_surveillance_detection'
        ),

        'surveillance_alerts', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'alert_id', sa.alert_id,
                    'alert_level', sa.alert_level,
                    'alert_type', sa.alert_type,
                    'alert_title', sa.alert_title,
                    'alert_description', sa.alert_description,
                    'detection_timestamp', sa.record_created_at,
                    'confidence_score', sva.confidence_score,
                    'investigation_priority', sva.investigation_priority,
                    'operational_significance', sva.operational_significance,
                    'threat_assessment', sva.likely_surveillance_type,
                    'evidence_summary', sa.evidence_summary,
                    'recommended_actions', sa.recommended_actions
                )
            )
            FROM app.surveillance_alerts sa
            JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
            WHERE sa.alert_id = ANY(p_alert_ids)
        ),

        'technical_analysis', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'anomaly_type', sva.anomaly_type,
                    'primary_device_mac', wap.mac_address,
                    'device_manufacturer', om.organization_name,
                    'anomaly_locations', ST_AsGeoJSON(sva.anomaly_locations),
                    'detection_confidence', sva.confidence_score,
                    'movement_analysis', sva.movement_vector,
                    'government_correlation', gic.government_agency_matches,
                    'surveillance_sophistication', sva.surveillance_sophistication_score
                )
            )
            FROM app.surveillance_alerts sa
            JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
            LEFT JOIN app.wireless_access_points wap ON sva.primary_device_id = wap.access_point_id
            LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
            LEFT JOIN app.government_infrastructure_correlations gic ON sva.primary_device_id = gic.access_point_id
            WHERE sa.alert_id = ANY(p_alert_ids)
        ),

        'chain_of_custody', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'event_timestamp', ecc.event_timestamp,
                    'event_type', ecc.custody_event_type,
                    'event_user', ecc.event_user,
                    'event_description', ecc.event_description,
                    'integrity_verified', ecc.integrity_verified
                )
            )
            FROM app.evidence_chain_of_custody ecc
            WHERE ecc.anomaly_id IN (
                SELECT sva.anomaly_id FROM app.surveillance_alerts sa
                JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
                WHERE sa.alert_id = ANY(p_alert_ids)
            )
            ORDER BY ecc.event_timestamp
        )
    ) INTO evidence_package;

    -- Generate cryptographic hash for integrity
    package_hash := encode(sha256(evidence_package::TEXT::bytea), 'hex');

    -- Add hash to package
    evidence_package := evidence_package || jsonb_build_object(
        'integrity_hash', package_hash,
        'hash_algorithm', 'SHA-256'
    );

    -- Log evidence export
    INSERT INTO app.evidence_chain_of_custody (
        anomaly_id,
        custody_event_type,
        event_user,
        event_system,
        access_purpose,
        event_description,
        evidence_hash_after
    ) SELECT DISTINCT
        sva.anomaly_id,
        'exported',
        current_user,
        'evidence_export_system',
        p_export_purpose,
        format('Evidence package exported for %s with hash %s', p_export_purpose, LEFT(package_hash, 16)),
        package_hash
    FROM app.surveillance_alerts sa
    JOIN app.surveillance_anomalies sva ON sa.anomaly_id = sva.anomaly_id
    WHERE sa.alert_id = ANY(p_alert_ids);

    RETURN evidence_package;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE app.surveillance_alert_config IS 'User-configurable alert preferences for personalized surveillance detection';
COMMENT ON FUNCTION app.enhance_surveillance_alert_intelligence IS 'AI-enhanced alert intelligence with threat assessment and context analysis';
COMMENT ON FUNCTION app.generate_smart_surveillance_alert IS 'Smart alert generation with false positive reduction and context awareness';
COMMENT ON VIEW app.surveillance_dashboard_realtime IS 'Real-time surveillance threat dashboard metrics';
COMMENT ON VIEW app.surveillance_active_threats IS 'Active surveillance threats requiring immediate attention';
COMMENT ON VIEW app.surveillance_pattern_trends IS 'Surveillance pattern trend analysis with risk assessment';
COMMENT ON FUNCTION app.acknowledge_surveillance_alert IS 'User acknowledgment and feedback system for alert management';
COMMENT ON FUNCTION app.export_surveillance_evidence_package IS 'Export comprehensive evidence packages for legal proceedings';