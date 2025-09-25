-- =====================================================
-- ShadowCheck Government Infrastructure Correlation System
-- Enhanced WiGLE API integration for detecting government/agency networks
-- Correlates sequential MAC patterns with government infrastructure databases
-- =====================================================

-- =====================================================
-- GOVERNMENT CONTRACTOR DATABASE
-- Known manufacturers with government contracts
-- =====================================================

CREATE TABLE app.government_contractors (
    contractor_id SERIAL PRIMARY KEY,
    organization_name TEXT NOT NULL UNIQUE,
    contractor_type TEXT NOT NULL, -- 'direct_government', 'defense_contractor', 'law_enforcement', 'intelligence'

    -- Government relationship assessment
    government_relationship_score NUMERIC(3,2) NOT NULL CHECK (government_relationship_score BETWEEN 0 AND 1),
    security_clearance_level TEXT, -- 'unclassified', 'confidential', 'secret', 'top_secret'

    -- Known contracts and capabilities
    known_contracts TEXT[], -- Array of known government contracts
    surveillance_capabilities BOOLEAN DEFAULT FALSE,
    signals_intelligence_capabilities BOOLEAN DEFAULT FALSE,
    tactical_communications BOOLEAN DEFAULT FALSE,

    -- Detection signatures
    typical_mac_patterns TEXT[], -- Known MAC address patterns
    frequency_signatures JSONB, -- Known frequency usage patterns
    deployment_signatures JSONB, -- Typical geographic deployment patterns

    -- Evidence and sources
    classification_confidence NUMERIC(3,2) DEFAULT 0.5,
    information_sources TEXT[], -- Where this classification came from
    last_verified TIMESTAMPTZ,

    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with known government contractors
INSERT INTO app.government_contractors (
    organization_name, contractor_type, government_relationship_score,
    surveillance_capabilities, signals_intelligence_capabilities, tactical_communications,
    classification_confidence, information_sources
) VALUES
    ('Harris Corporation', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'fcc_filings']),
    ('Motorola Solutions', 'law_enforcement', 0.9, TRUE, FALSE, TRUE, 0.85, ARRAY['public_contracts', 'leo_equipment']),
    ('General Dynamics', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'defense_spending']),
    ('Raytheon Technologies', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'defense_spending']),
    ('Lockheed Martin', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'defense_spending']),
    ('Boeing Defense', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'defense_spending']),
    ('Northrop Grumman', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'defense_spending']),
    ('L3Harris Technologies', 'defense_contractor', 0.95, TRUE, TRUE, TRUE, 0.9, ARRAY['public_contracts', 'tactical_comms']),
    ('CACI International', 'intelligence', 0.85, TRUE, TRUE, FALSE, 0.8, ARRAY['intelligence_contracts', 'security_clearances']),
    ('SAIC', 'intelligence', 0.85, TRUE, TRUE, FALSE, 0.8, ARRAY['intelligence_contracts', 'security_clearances']),
    ('Booz Allen Hamilton', 'intelligence', 0.8, TRUE, TRUE, FALSE, 0.75, ARRAY['intelligence_contracts', 'snowden_revelations']),
    ('ManTech International', 'intelligence', 0.8, TRUE, TRUE, FALSE, 0.75, ARRAY['intelligence_contracts', 'security_clearances']),

    -- Law enforcement specific
    ('Axon Enterprise', 'law_enforcement', 0.7, TRUE, FALSE, FALSE, 0.8, ARRAY['leo_equipment', 'public_contracts']),
    ('Vigilant Solutions', 'law_enforcement', 0.8, TRUE, FALSE, FALSE, 0.75, ARRAY['alpr_systems', 'surveillance_tech']),
    ('Cellebrite', 'law_enforcement', 0.7, TRUE, FALSE, FALSE, 0.8, ARRAY['mobile_forensics', 'leo_sales']),

    -- Network infrastructure that might be used by government
    ('Cisco Systems', 'defense_contractor', 0.6, FALSE, FALSE, TRUE, 0.6, ARRAY['government_sales', 'security_features']),
    ('Juniper Networks', 'defense_contractor', 0.6, FALSE, FALSE, TRUE, 0.6, ARRAY['government_sales', 'security_focus']),
    ('Palo Alto Networks', 'defense_contractor', 0.6, FALSE, FALSE, TRUE, 0.6, ARRAY['government_sales', 'security_focus'])
ON CONFLICT (organization_name) DO NOTHING;

-- =====================================================
-- WIGLE API CORRELATION ENHANCEMENT
-- Enhanced functions for government infrastructure detection
-- =====================================================

-- Function to enrich OUI manufacturers with government contractor data
CREATE OR REPLACE FUNCTION app.enrich_manufacturer_government_score()
RETURNS INTEGER AS $$
DECLARE
    update_count INTEGER := 0;
    manufacturer_record RECORD;
BEGIN
    -- Update OUI manufacturers with government contractor scores
    FOR manufacturer_record IN
        SELECT om.manufacturer_id, om.organization_name, gc.government_relationship_score
        FROM app.oui_manufacturers om
        LEFT JOIN app.government_contractors gc ON
            -- Exact match
            LOWER(om.organization_name) = LOWER(gc.organization_name)
            -- Partial match for subsidiaries/divisions
            OR LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
            OR LOWER(gc.organization_name) LIKE '%' || LOWER(om.organization_name) || '%'
        WHERE gc.government_relationship_score IS NOT NULL
    LOOP
        -- Add government score to manufacturer record (custom column)
        EXECUTE format('
            UPDATE app.oui_manufacturers
            SET organization_name = organization_name || '' [GOV_SCORE: '' || %s || '']''
            WHERE manufacturer_id = %s
              AND organization_name NOT LIKE ''%%[GOV_SCORE:%%''',
            manufacturer_record.government_relationship_score,
            manufacturer_record.manufacturer_id
        );

        update_count := update_count + 1;
    END LOOP;

    RETURN update_count;
END;
$$ LANGUAGE plpgsql;

-- Enhanced WiGLE API correlation function with government detection
CREATE OR REPLACE FUNCTION app.correlate_government_infrastructure_wigle(
    p_access_point_id BIGINT,
    p_wigle_response JSONB,
    p_force_update BOOLEAN DEFAULT FALSE
)
RETURNS BIGINT AS $$
DECLARE
    correlation_id BIGINT;
    government_matches TEXT[] := '{}';
    manufacturer_gov_score NUMERIC := 0.0;
    correlation_confidence NUMERIC := 0.0;
    deployment_pattern TEXT;
    requires_verification BOOLEAN := TRUE;
BEGIN
    -- Check if correlation already exists
    IF NOT p_force_update AND EXISTS (
        SELECT 1 FROM app.government_infrastructure_correlations
        WHERE access_point_id = p_access_point_id
    ) THEN
        SELECT gic.correlation_id INTO correlation_id
        FROM app.government_infrastructure_correlations gic
        WHERE gic.access_point_id = p_access_point_id;
        RETURN correlation_id;
    END IF;

    -- Analyze WiGLE response for government indicators
    SELECT
        COALESCE(gc.government_relationship_score, 0.0),
        ARRAY[gc.organization_name] FILTER (WHERE gc.organization_name IS NOT NULL)
    INTO manufacturer_gov_score, government_matches
    FROM app.wireless_access_points wap
    LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
    LEFT JOIN app.government_contractors gc ON
        LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
    WHERE wap.access_point_id = p_access_point_id;

    -- Analyze WiGLE response content for additional government indicators
    IF p_wigle_response ? 'results' THEN
        -- Look for government-related keywords in WiGLE data
        IF p_wigle_response->'results'->0->>'comment' ~* 'government|federal|agency|military|police|sheriff|dhs|fbi|nsa|cia|dod' THEN
            government_matches := array_append(government_matches, 'wigle_comment_analysis');
            manufacturer_gov_score := GREATEST(manufacturer_gov_score, 0.7);
        END IF;

        -- Look for tactical/surveillance SSIDs
        IF p_wigle_response->'results'->0->>'ssid' ~* 'tactical|surveillance|mobile|unit|car|patrol|fed|gov|agency' THEN
            government_matches := array_append(government_matches, 'suspicious_ssid_pattern');
            manufacturer_gov_score := GREATEST(manufacturer_gov_score, 0.6);
        END IF;

        -- Analyze geographic clustering with other government sites
        IF p_wigle_response->'results'->0->>'city' ~* 'washington|quantico|langley|fort|base|federal' THEN
            government_matches := array_append(government_matches, 'government_geographic_area');
            manufacturer_gov_score := GREATEST(manufacturer_gov_score, 0.5);
        END IF;
    END IF;

    -- Determine deployment pattern signature
    deployment_pattern := CASE
        WHEN array_length(government_matches, 1) > 2 AND manufacturer_gov_score > 0.8 THEN 'high_confidence_government'
        WHEN manufacturer_gov_score > 0.7 THEN 'probable_government'
        WHEN manufacturer_gov_score > 0.5 THEN 'possible_government'
        ELSE 'unknown'
    END;

    -- Calculate overall correlation confidence
    correlation_confidence := LEAST(1.0,
        manufacturer_gov_score * 0.6 +  -- Manufacturer score
        CASE WHEN array_length(government_matches, 1) > 0 THEN
            LEAST(0.4, array_length(government_matches, 1)::NUMERIC / 10.0)
        ELSE 0.0 END
    );

    -- Determine if human verification is needed
    requires_verification := (correlation_confidence < 0.8 OR manufacturer_gov_score < 0.7);

    -- Insert or update correlation record
    INSERT INTO app.government_infrastructure_correlations (
        access_point_id,
        manufacturer_government_score,
        wigle_api_response,
        wigle_query_timestamp,
        government_agency_matches,
        deployment_pattern_signature,
        correlation_confidence,
        requires_human_verification
    ) VALUES (
        p_access_point_id,
        manufacturer_gov_score,
        p_wigle_response,
        NOW(),
        government_matches,
        deployment_pattern,
        correlation_confidence,
        requires_verification
    )
    ON CONFLICT (access_point_id) DO UPDATE SET
        manufacturer_government_score = EXCLUDED.manufacturer_government_score,
        wigle_api_response = EXCLUDED.wigle_api_response,
        wigle_query_timestamp = EXCLUDED.wigle_query_timestamp,
        government_agency_matches = EXCLUDED.government_agency_matches,
        deployment_pattern_signature = EXCLUDED.deployment_pattern_signature,
        correlation_confidence = EXCLUDED.correlation_confidence,
        requires_human_verification = EXCLUDED.requires_human_verification,
        record_updated_at = NOW()
    RETURNING correlation_id;

    RETURN correlation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to batch process sequential MAC patterns for government correlation
CREATE OR REPLACE FUNCTION app.process_sequential_mac_government_correlation()
RETURNS TABLE(
    pattern_group_id UUID,
    device_count INTEGER,
    government_confidence NUMERIC,
    agency_indicators TEXT[],
    requires_wigle_lookup BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH sequential_patterns AS (
        SELECT * FROM app.detect_sequential_mac_patterns(3, 20)
    ),
    government_analysis AS (
        SELECT
            gen_random_uuid() as group_id,
            sp.sequential_count,
            sp.government_manufacturer_score,
            sp.manufacturer_names,
            sp.device_ids,

            -- Enhanced government detection based on patterns
            CASE
                WHEN sp.government_manufacturer_score > 0.8 AND sp.sequential_count >= 5 THEN
                    ARRAY['high_confidence_sequential_government']
                WHEN sp.government_manufacturer_score > 0.6 AND sp.sequential_count >= 3 THEN
                    ARRAY['probable_government_infrastructure']
                WHEN sp.sequential_count >= 10 THEN
                    ARRAY['suspicious_sequential_pattern']
                ELSE ARRAY['unknown_sequential_pattern']
            END as agency_indicators,

            -- Overall government confidence
            LEAST(1.0,
                sp.government_manufacturer_score * 0.7 +
                LEAST(0.3, sp.sequential_count::NUMERIC / 20.0)
            ) as gov_confidence,

            -- Require WiGLE lookup for high-suspicion patterns
            (sp.government_manufacturer_score > 0.5 OR sp.sequential_count > 8) as needs_lookup

        FROM sequential_patterns sp
    )
    SELECT
        ga.group_id,
        ga.sequential_count,
        ga.gov_confidence,
        ga.agency_indicators,
        ga.needs_lookup
    FROM government_analysis ga
    WHERE ga.gov_confidence > 0.3
    ORDER BY ga.gov_confidence DESC, ga.sequential_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTOMATED WIGLE API INTEGRATION
-- Background processing for government infrastructure detection
-- =====================================================

-- Function to automatically query WiGLE API for suspicious patterns
CREATE OR REPLACE FUNCTION app.auto_wigle_lookup_suspicious_infrastructure(
    p_batch_size INTEGER DEFAULT 10,
    p_min_government_score NUMERIC DEFAULT 0.5
)
RETURNS TABLE(
    access_point_id BIGINT,
    mac_address TEXT,
    lookup_priority NUMERIC,
    government_score NUMERIC,
    wigle_query_needed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wap.access_point_id,
        wap.mac_address,
        -- Priority based on government likelihood and sequential patterns
        COALESCE(gc.government_relationship_score, 0.0) +
        CASE WHEN EXISTS (
            SELECT 1 FROM app.government_infrastructure_correlations gic
            WHERE gic.access_point_id = wap.access_point_id
              AND gic.sequential_mac_pattern = TRUE
        ) THEN 0.3 ELSE 0.0 END as lookup_priority,

        COALESCE(gc.government_relationship_score, 0.0) as gov_score,

        -- Need WiGLE lookup if not already done or government score high
        (gic.wigle_query_timestamp IS NULL OR
         gic.wigle_query_timestamp < NOW() - INTERVAL '30 days' OR
         COALESCE(gc.government_relationship_score, 0.0) >= p_min_government_score) as needs_lookup

    FROM app.wireless_access_points wap
    LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
    LEFT JOIN app.government_contractors gc ON
        LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
    LEFT JOIN app.government_infrastructure_correlations gic ON wap.access_point_id = gic.access_point_id

    WHERE (
        -- High government manufacturer score
        COALESCE(gc.government_relationship_score, 0.0) >= p_min_government_score OR
        -- Part of sequential MAC pattern
        EXISTS (
            SELECT 1 FROM app.government_infrastructure_correlations gic2
            WHERE gic2.access_point_id = wap.access_point_id
              AND gic2.sequential_mac_pattern = TRUE
        ) OR
        -- Recently detected in surveillance anomalies
        EXISTS (
            SELECT 1 FROM app.surveillance_anomalies sa
            WHERE sa.primary_device_id = wap.access_point_id
              AND sa.detection_timestamp >= NOW() - INTERVAL '7 days'
              AND sa.confidence_score >= 0.7
        )
    )
    AND (gic.wigle_query_timestamp IS NULL OR gic.wigle_query_timestamp < NOW() - INTERVAL '30 days')

    ORDER BY lookup_priority DESC, wap.last_observed_at DESC NULLS LAST
    LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GOVERNMENT INFRASTRUCTURE ANALYSIS VIEWS
-- =====================================================

-- View for high-confidence government infrastructure
CREATE OR REPLACE VIEW app.confirmed_government_infrastructure AS
SELECT
    wap.access_point_id,
    wap.mac_address,
    wap.current_network_name,
    om.organization_name as manufacturer,
    gc.contractor_type,
    gc.government_relationship_score,
    gic.correlation_confidence,
    gic.deployment_pattern_signature,
    gic.government_agency_matches,

    -- Location information
    ST_AsText(wap.primary_location_point) as location_wkt,

    -- Surveillance context
    sa.anomaly_type,
    sa.confidence_score as anomaly_confidence,
    sa.operational_significance,

    -- Evidence metadata
    gic.wigle_query_timestamp,
    gic.requires_human_verification

FROM app.wireless_access_points wap
LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
LEFT JOIN app.government_contractors gc ON
    LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
LEFT JOIN app.government_infrastructure_correlations gic ON wap.access_point_id = gic.access_point_id
LEFT JOIN app.surveillance_anomalies sa ON
    sa.primary_device_id = wap.access_point_id OR
    wap.access_point_id = ANY(sa.related_device_ids)

WHERE gic.correlation_confidence >= 0.7
   OR gc.government_relationship_score >= 0.8
   OR (sa.anomaly_type IN ('sequential_mac_pattern', 'infrastructure_signature')
       AND sa.confidence_score >= 0.7)

ORDER BY
    COALESCE(gic.correlation_confidence, gc.government_relationship_score) DESC,
    sa.confidence_score DESC NULLS LAST;

-- View for sequential MAC pattern analysis
CREATE OR REPLACE VIEW app.sequential_mac_government_analysis AS
WITH sequential_analysis AS (
    SELECT * FROM app.detect_sequential_mac_patterns(3, 50)
),
enriched_sequences AS (
    SELECT
        sa.*,
        array_agg(DISTINCT gc.contractor_type) FILTER (WHERE gc.contractor_type IS NOT NULL) as contractor_types,
        array_agg(DISTINCT gc.organization_name) FILTER (WHERE gc.organization_name IS NOT NULL) as known_contractors,
        MAX(gc.government_relationship_score) as max_gov_score,
        AVG(gc.government_relationship_score) as avg_gov_score,

        -- Count of devices with known surveillance capabilities
        COUNT(*) FILTER (WHERE gc.surveillance_capabilities = TRUE) as surveillance_capable_count,
        COUNT(*) FILTER (WHERE gc.signals_intelligence_capabilities = TRUE) as sigint_capable_count

    FROM sequential_analysis sa
    LEFT JOIN app.wireless_access_points wap ON wap.access_point_id = ANY(sa.device_ids)
    LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
    LEFT JOIN app.government_contractors gc ON
        LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
    GROUP BY
        sa.mac_sequence_start, sa.sequential_count, sa.device_ids,
        sa.manufacturer_names, sa.suspicious_score,
        sa.government_manufacturer_score, sa.requires_wigle_lookup
)
SELECT
    es.*,
    -- Enhanced threat assessment
    CASE
        WHEN es.max_gov_score >= 0.9 AND es.surveillance_capable_count >= 2 THEN 'critical_government_surveillance'
        WHEN es.max_gov_score >= 0.8 AND es.sequential_count >= 5 THEN 'high_confidence_government'
        WHEN es.avg_gov_score >= 0.6 AND es.sequential_count >= 3 THEN 'probable_government_infrastructure'
        WHEN es.sequential_count >= 10 THEN 'suspicious_infrastructure_pattern'
        ELSE 'unknown_infrastructure'
    END as threat_assessment,

    -- Investigation priority
    CASE
        WHEN es.max_gov_score >= 0.9 AND es.sigint_capable_count > 0 THEN 10
        WHEN es.max_gov_score >= 0.8 AND es.surveillance_capable_count > 0 THEN 9
        WHEN es.max_gov_score >= 0.7 THEN 7
        WHEN es.sequential_count >= 10 THEN 6
        ELSE 4
    END as investigation_priority

FROM enriched_sequences es
WHERE es.suspicious_score >= 0.3
ORDER BY investigation_priority DESC, es.max_gov_score DESC, es.sequential_count DESC;

-- =====================================================
-- AUTOMATED CORRELATION TRIGGERS
-- =====================================================

-- Trigger to automatically check for government correlation on new access points
CREATE OR REPLACE FUNCTION app.auto_check_government_correlation()
RETURNS TRIGGER AS $$
DECLARE
    manufacturer_gov_score NUMERIC;
    gov_contractor_name TEXT;
BEGIN
    -- Check if manufacturer has government relationship
    SELECT gc.government_relationship_score, gc.organization_name
    INTO manufacturer_gov_score, gov_contractor_name
    FROM app.oui_manufacturers om
    LEFT JOIN app.government_contractors gc ON
        LOWER(om.organization_name) LIKE '%' || LOWER(gc.organization_name) || '%'
    WHERE om.manufacturer_id = NEW.manufacturer_id;

    -- If government relationship found, create correlation record
    IF manufacturer_gov_score >= 0.5 THEN
        INSERT INTO app.government_infrastructure_correlations (
            access_point_id,
            manufacturer_government_score,
            government_agency_matches,
            deployment_pattern_signature,
            correlation_confidence,
            requires_human_verification
        ) VALUES (
            NEW.access_point_id,
            manufacturer_gov_score,
            ARRAY[gov_contractor_name],
            CASE
                WHEN manufacturer_gov_score >= 0.8 THEN 'high_confidence_government'
                WHEN manufacturer_gov_score >= 0.6 THEN 'probable_government'
                ELSE 'possible_government'
            END,
            manufacturer_gov_score,
            manufacturer_gov_score < 0.8
        ) ON CONFLICT (access_point_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_government_correlation_check
    AFTER INSERT ON app.wireless_access_points
    FOR EACH ROW
    EXECUTE FUNCTION app.auto_check_government_correlation();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to export government infrastructure evidence for legal proceedings
CREATE OR REPLACE FUNCTION app.export_government_infrastructure_evidence(
    p_access_point_ids BIGINT[],
    p_case_reference TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    evidence_package JSONB;
    export_timestamp TIMESTAMPTZ := NOW();
BEGIN
    SELECT jsonb_build_object(
        'export_metadata', jsonb_build_object(
            'case_reference', p_case_reference,
            'export_timestamp', export_timestamp,
            'export_type', 'government_infrastructure_evidence',
            'device_count', array_length(p_access_point_ids, 1),
            'evidence_classification', 'law_enforcement_sensitive'
        ),
        'infrastructure_analysis', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'access_point_id', cgi.access_point_id,
                    'mac_address', cgi.mac_address,
                    'network_name', cgi.current_network_name,
                    'manufacturer', cgi.manufacturer,
                    'government_contractor_type', cgi.contractor_type,
                    'government_relationship_score', cgi.government_relationship_score,
                    'correlation_confidence', cgi.correlation_confidence,
                    'deployment_pattern', cgi.deployment_pattern_signature,
                    'agency_matches', cgi.government_agency_matches,
                    'location', cgi.location_wkt,
                    'surveillance_anomalies', COALESCE(cgi.anomaly_type::TEXT, 'none'),
                    'evidence_timestamp', cgi.wigle_query_timestamp,
                    'verification_status', CASE WHEN cgi.requires_human_verification
                                                THEN 'requires_verification'
                                                ELSE 'machine_verified' END
                )
            )
            FROM app.confirmed_government_infrastructure cgi
            WHERE cgi.access_point_id = ANY(p_access_point_ids)
        ),
        'chain_of_custody', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'access_point_id', ecc.anomaly_id, -- Note: This links to surveillance anomalies
                    'custody_events', ecc.custody_event_type,
                    'event_timestamp', ecc.event_timestamp,
                    'event_user', ecc.event_user,
                    'integrity_verified', ecc.integrity_verified
                )
            )
            FROM app.evidence_chain_of_custody ecc
            WHERE ecc.anomaly_id IN (
                SELECT sa.anomaly_id
                FROM app.surveillance_anomalies sa
                WHERE sa.primary_device_id = ANY(p_access_point_ids)
                   OR sa.related_device_ids && p_access_point_ids
            )
        )
    ) INTO evidence_package;

    RETURN evidence_package;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE app.government_contractors IS 'Database of known government contractors and their surveillance capabilities';
COMMENT ON FUNCTION app.correlate_government_infrastructure_wigle IS 'Enhanced WiGLE API correlation with government infrastructure detection';
COMMENT ON FUNCTION app.process_sequential_mac_government_correlation IS 'Batch analysis of sequential MAC patterns for government correlation';
COMMENT ON FUNCTION app.auto_wigle_lookup_suspicious_infrastructure IS 'Automated prioritization of devices requiring WiGLE API lookup';
COMMENT ON VIEW app.confirmed_government_infrastructure IS 'High-confidence government infrastructure devices with evidence';
COMMENT ON VIEW app.sequential_mac_government_analysis IS 'Analysis of sequential MAC patterns with government contractor correlation';
COMMENT ON FUNCTION app.export_government_infrastructure_evidence IS 'Export government infrastructure evidence packages for legal proceedings';