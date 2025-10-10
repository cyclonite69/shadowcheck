-- =====================================================
-- ShadowCheck Advanced Surveillance Detection System
-- Counter-surveillance platform for detecting professional surveillance operations
-- Integrates with existing ShadowCheck 3NF normalized schema
-- =====================================================

-- =====================================================
-- SURVEILLANCE-SPECIFIC ENUMERATIONS
-- =====================================================

-- Advanced surveillance anomaly types based on real-world patterns
CREATE TYPE app.surveillance_anomaly_type AS ENUM (
    'impossible_distance',           -- Device 90km away when user wasn't there
    'coordinated_movement',          -- Multiple BSSIDs moving together
    'surveillance_route',            -- Devices following user to restaurants, etc.
    'aerial_pattern',               -- Linear movement with altitude gain (aircraft)
    'sequential_mac_pattern',       -- Adjacent MAC addresses with suspicious ownership
    'geospatial_clustering',        -- Too many "coincidental" device groupings
    'temporal_correlation',         -- Devices appearing at suspicious times
    'infrastructure_signature',     -- Government/agency network patterns
    'impossible_speed',             -- Required speed >300kph for position changes
    'synchronized_appearance',      -- Multiple devices appearing simultaneously
    'stalking_correlation',         -- Device following known user movement patterns
    'signal_fingerprinting'         -- Identical signal characteristics across devices
);

-- Evidence strength classification for forensic purposes
CREATE TYPE app.evidence_strength AS ENUM (
    'weak',             -- Single observation, low confidence
    'moderate',         -- Multiple correlated observations
    'strong',           -- High-confidence pattern with supporting data
    'overwhelming',     -- Multiple independent confirmation sources
    'forensic_grade'    -- Court-admissible evidence with chain of custody
);

-- Surveillance operation classifications
CREATE TYPE app.surveillance_type AS ENUM (
    'mobile_surveillance',      -- Moving surveillance teams
    'fixed_surveillance',       -- Static observation points
    'aerial_surveillance',      -- Aircraft/drone surveillance
    'signals_intelligence',     -- Electronic surveillance/SIGINT
    'infrastructure_based',     -- Government/agency infrastructure
    'coordinated_team',        -- Multiple coordinated assets
    'unknown_professional'      -- Professional but unclassified
);

-- Threat actor assessment levels
CREATE TYPE app.threat_actor_level AS ENUM (
    'amateur',                  -- Personal stalker, low sophistication
    'criminal',                 -- Organized crime, moderate sophistication
    'corporate',                -- Corporate espionage, high sophistication
    'state_actor',             -- Government/intelligence, highest sophistication
    'law_enforcement',         -- Legal surveillance (warrants may exist)
    'unknown_professional'      -- Professional but origin unclear
);

-- =====================================================
-- CORE SURVEILLANCE DETECTION TABLES
-- =====================================================

-- Advanced surveillance anomalies (extends existing security_incidents)
CREATE TABLE app.surveillance_anomalies (
    anomaly_id BIGSERIAL PRIMARY KEY,

    -- Link to existing incident system
    security_incident_id BIGINT REFERENCES app.security_incidents(incident_id),

    -- Core anomaly classification
    anomaly_type app.surveillance_anomaly_type NOT NULL,
    primary_device_id BIGINT REFERENCES app.wireless_access_points(access_point_id),
    related_device_ids BIGINT[], -- Array of related devices involved in anomaly

    -- Spatial evidence
    anomaly_locations GEOMETRY(MultiPoint, 4326),
    suspicious_distance_km NUMERIC(10,3),
    movement_vector JSONB, -- {heading, speed, altitude_change, acceleration}
    geographic_span_km NUMERIC(8,2),

    -- Temporal evidence
    detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    anomaly_timespan_start TIMESTAMPTZ,
    anomaly_timespan_end TIMESTAMPTZ,
    pattern_duration_hours NUMERIC(8,2),

    -- Evidence assessment
    confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
    evidence_strength app.evidence_strength NOT NULL DEFAULT 'moderate',
    investigation_priority INTEGER NOT NULL DEFAULT 5 CHECK (investigation_priority BETWEEN 1 AND 10),
    operational_significance TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- Supporting measurements and correlations
    supporting_measurements BIGINT[], -- Array of measurement IDs from signal/position tables
    wigle_api_correlations JSONB, -- WiGLE search results revealing government patterns
    signal_analysis_data JSONB, -- Technical signal fingerprinting data

    -- Surveillance assessment
    likely_surveillance_type app.surveillance_type,
    threat_actor_assessment app.threat_actor_level,
    surveillance_sophistication_score NUMERIC(3,2) CHECK (surveillance_sophistication_score BETWEEN 0 AND 1),

    -- Investigation workflow
    investigation_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'investigating', 'confirmed', 'dismissed'
    analyst_assigned TEXT,
    investigation_notes TEXT,
    escalation_required BOOLEAN DEFAULT FALSE,

    -- Legal evidence preservation
    evidence_hash TEXT, -- Cryptographic hash of evidence for court admissibility
    chain_of_custody_log JSONB, -- Track all access to this evidence
    legal_hold_status BOOLEAN DEFAULT FALSE,

    -- Audit trail (forensic integrity)
    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_system TEXT DEFAULT 'surveillance_detection_engine',
    last_modified_by TEXT
);

-- Government infrastructure correlation table (extends WiGLE API integration)
CREATE TABLE app.government_infrastructure_correlations (
    correlation_id BIGSERIAL PRIMARY KEY,
    access_point_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),
    anomaly_id BIGINT REFERENCES app.surveillance_anomalies(anomaly_id),

    -- Infrastructure identification
    sequential_mac_pattern BOOLEAN DEFAULT FALSE,
    mac_sequence_start TEXT,
    mac_sequence_count INTEGER,
    manufacturer_government_score NUMERIC(3,2), -- Likelihood manufacturer is gov contractor

    -- WiGLE API correlation results
    wigle_api_response JSONB, -- Full API response for forensic preservation
    wigle_query_timestamp TIMESTAMPTZ,
    government_agency_matches TEXT[], -- Array of potential agency identifications

    -- Infrastructure analysis
    deployment_pattern_signature TEXT, -- Known government deployment patterns
    technology_fingerprint JSONB, -- Technical signatures (freq, capabilities, etc.)
    geographic_clustering_score NUMERIC(3,2), -- How clustered with other gov infrastructure

    -- Confidence assessment
    correlation_confidence NUMERIC(3,2) NOT NULL CHECK (correlation_confidence BETWEEN 0 AND 1),
    requires_human_verification BOOLEAN DEFAULT TRUE,

    -- Evidence metadata
    evidence_classification TEXT DEFAULT 'unclassified', -- Evidence sensitivity
    source_protection_required BOOLEAN DEFAULT TRUE,

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Device relationship tracking (friend/foe identification)
CREATE TABLE app.device_relationships (
    relationship_id BIGSERIAL PRIMARY KEY,
    primary_device_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),
    related_device_id BIGINT NOT NULL REFERENCES app.wireless_access_points(access_point_id),

    -- Relationship classification
    relationship_type TEXT NOT NULL, -- 'friendly', 'hostile', 'suspicious', 'unknown'
    relationship_confidence NUMERIC(3,2) CHECK (relationship_confidence BETWEEN 0 AND 1),

    -- User-defined relationships (whitelist/blacklist)
    user_classification TEXT, -- 'family', 'friend', 'work', 'neighbor', 'threat'
    auto_ignore_in_detection BOOLEAN DEFAULT FALSE,

    -- Movement correlation data
    colocation_frequency NUMERIC(3,2),
    synchronized_movement_events INTEGER DEFAULT 0,
    average_proximity_meters NUMERIC(8,2),

    -- Temporal patterns
    first_observed_together TIMESTAMPTZ,
    last_observed_together TIMESTAMPTZ,
    total_observations INTEGER DEFAULT 0,

    -- Notes and evidence
    relationship_notes TEXT,
    supporting_evidence JSONB,

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_device_pair UNIQUE (primary_device_id, related_device_id)
);

-- Safe zones and context awareness (reduce false positives)
CREATE TABLE app.surveillance_safe_zones (
    safe_zone_id SERIAL PRIMARY KEY,
    zone_name TEXT NOT NULL,
    zone_polygon GEOMETRY(Polygon, 4326) NOT NULL,

    -- Zone classification
    zone_type TEXT NOT NULL, -- 'home', 'work', 'family', 'frequent_location'
    privacy_expectation TEXT NOT NULL DEFAULT 'high', -- 'low', 'medium', 'high'

    -- Detection behavior modifications
    suppress_impossible_distance_alerts BOOLEAN DEFAULT TRUE,
    suppress_coordinated_movement_alerts BOOLEAN DEFAULT FALSE,
    reduce_sensitivity_factor NUMERIC(3,2) DEFAULT 0.5,

    -- Activity context
    expected_device_types TEXT[], -- Expected friendly devices in this zone
    normal_activity_hours JSONB, -- Time periods when activity is expected

    -- User configuration
    is_active BOOLEAN DEFAULT TRUE,
    user_notes TEXT,

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Real-time surveillance alerts (operational interface)
CREATE TABLE app.surveillance_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    anomaly_id BIGINT NOT NULL REFERENCES app.surveillance_anomalies(anomaly_id),

    -- Alert classification
    alert_level TEXT NOT NULL, -- 'info', 'warning', 'critical', 'emergency'
    alert_type app.surveillance_anomaly_type NOT NULL,
    requires_immediate_attention BOOLEAN DEFAULT FALSE,

    -- Alert content
    alert_title TEXT NOT NULL,
    alert_description TEXT NOT NULL,
    recommended_actions TEXT[],

    -- User interaction
    alert_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'dismissed'
    user_acknowledged_at TIMESTAMPTZ,
    user_dismissed_at TIMESTAMPTZ,
    user_feedback TEXT,

    -- False positive learning
    is_false_positive BOOLEAN,
    false_positive_reason TEXT,
    improve_detection_notes TEXT,

    -- Evidence package for user
    evidence_summary JSONB, -- Formatted for user display
    exportable_evidence JSONB, -- Formatted for legal/LE export

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FORENSIC EVIDENCE PRESERVATION
-- =====================================================

-- Chain of custody tracking for legal admissibility
CREATE TABLE app.evidence_chain_of_custody (
    custody_id BIGSERIAL PRIMARY KEY,
    anomaly_id BIGINT NOT NULL REFERENCES app.surveillance_anomalies(anomaly_id),

    -- Custody event
    custody_event_type TEXT NOT NULL, -- 'created', 'accessed', 'analyzed', 'exported', 'transferred'
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_user TEXT NOT NULL,
    event_system TEXT,

    -- Evidence integrity
    evidence_hash_before TEXT,
    evidence_hash_after TEXT,
    integrity_verified BOOLEAN,

    -- Access context
    access_purpose TEXT, -- 'investigation', 'analysis', 'legal_export', 'audit'
    access_authorization TEXT,

    -- Event details
    event_description TEXT,
    modifications_made TEXT[],

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legal evidence packages (ready for court/law enforcement)
CREATE TABLE app.legal_evidence_packages (
    package_id BIGSERIAL PRIMARY KEY,
    anomaly_id BIGINT NOT NULL REFERENCES app.surveillance_anomalies(anomaly_id),

    -- Package metadata
    package_name TEXT NOT NULL,
    package_description TEXT,
    created_for_purpose TEXT, -- 'law_enforcement', 'court_proceeding', 'attorney'

    -- Evidence content
    evidence_data JSONB NOT NULL, -- Complete evidence package
    supporting_documents JSONB, -- Additional documentation
    technical_analysis JSONB, -- Expert analysis and interpretation

    -- Legal metadata
    jurisdiction TEXT,
    case_number TEXT,
    relevant_statutes TEXT[],
    chain_of_custody_complete BOOLEAN DEFAULT TRUE,

    -- Cryptographic verification
    package_hash TEXT NOT NULL,
    digital_signature TEXT,
    timestamp_authority TEXT,

    -- Access control
    authorized_recipients TEXT[],
    access_log JSONB,

    record_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE (REAL-TIME OPERATION)
-- =====================================================

-- Core surveillance anomaly indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_anomalies_type_confidence
    ON app.surveillance_anomalies (anomaly_type, confidence_score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_anomalies_detection_timestamp
    ON app.surveillance_anomalies (detection_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_anomalies_priority_status
    ON app.surveillance_anomalies (investigation_priority DESC, investigation_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_anomalies_device_ids
    ON app.surveillance_anomalies USING GIN (related_device_ids);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_anomalies_locations_gist
    ON app.surveillance_anomalies USING GIST (anomaly_locations);

-- Government infrastructure correlation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gov_infrastructure_mac_pattern
    ON app.government_infrastructure_correlations (sequential_mac_pattern, mac_sequence_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gov_infrastructure_confidence
    ON app.government_infrastructure_correlations (correlation_confidence DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gov_infrastructure_agencies
    ON app.government_infrastructure_correlations USING GIN (government_agency_matches);

-- Device relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_relationships_type_confidence
    ON app.device_relationships (relationship_type, relationship_confidence DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_device_relationships_colocation
    ON app.device_relationships (colocation_frequency DESC, synchronized_movement_events DESC);

-- Safe zones spatial index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safe_zones_polygon_gist
    ON app.surveillance_safe_zones USING GIST (zone_polygon);

-- Real-time alerts indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_alerts_active_priority
    ON app.surveillance_alerts (alert_status, alert_level, record_created_at DESC)
    WHERE alert_status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_surveillance_alerts_type_level
    ON app.surveillance_alerts (alert_type, alert_level, record_created_at DESC);

-- Chain of custody indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custody_anomaly_timestamp
    ON app.evidence_chain_of_custody (anomaly_id, event_timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custody_event_type
    ON app.evidence_chain_of_custody (custody_event_type, event_timestamp DESC);

-- =====================================================
-- AUDIT TRIGGERS (FORENSIC INTEGRITY)
-- =====================================================

-- Update timestamp trigger for surveillance_anomalies
CREATE OR REPLACE FUNCTION app.update_surveillance_anomaly_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.record_updated_at = NOW();
    NEW.last_modified_by = current_user;

    -- Log chain of custody event for any changes
    INSERT INTO app.evidence_chain_of_custody (
        anomaly_id, custody_event_type, event_user,
        evidence_hash_before, event_description
    ) VALUES (
        NEW.anomaly_id, 'modified', current_user,
        OLD.evidence_hash, 'Surveillance anomaly record updated'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_surveillance_anomaly_timestamp
    BEFORE UPDATE ON app.surveillance_anomalies
    FOR EACH ROW
    EXECUTE FUNCTION app.update_surveillance_anomaly_timestamp();

-- Chain of custody trigger for evidence access
CREATE OR REPLACE FUNCTION app.log_evidence_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log all SELECT operations on surveillance anomalies
    INSERT INTO app.evidence_chain_of_custody (
        anomaly_id, custody_event_type, event_user, event_description
    ) VALUES (
        NEW.anomaly_id, 'accessed', current_user, 'Evidence accessed for investigation'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR OPERATIONAL INTERFACE
-- =====================================================

-- Active surveillance threats requiring immediate attention
CREATE OR REPLACE VIEW app.active_surveillance_threats AS
SELECT
    sa.anomaly_id,
    sa.anomaly_type,
    sa.confidence_score,
    sa.investigation_priority,
    sa.operational_significance,
    sa.detection_timestamp,
    sa.likely_surveillance_type,
    sa.threat_actor_assessment,
    sa.surveillance_sophistication_score,

    -- Primary device information
    wap.mac_address as primary_mac,
    wap.current_network_name as primary_network,
    om.organization_name as manufacturer,

    -- Spatial context
    ST_AsText(sa.anomaly_locations) as locations_wkt,
    sa.suspicious_distance_km,
    sa.geographic_span_km,

    -- Related devices count
    array_length(sa.related_device_ids, 1) as related_device_count,

    -- Government correlation
    gic.government_agency_matches,
    gic.correlation_confidence as gov_correlation_confidence,

    -- Alert status
    sal.alert_level,
    sal.alert_status,
    sal.requires_immediate_attention

FROM app.surveillance_anomalies sa
LEFT JOIN app.wireless_access_points wap ON sa.primary_device_id = wap.access_point_id
LEFT JOIN app.oui_manufacturers om ON wap.manufacturer_id = om.manufacturer_id
LEFT JOIN app.government_infrastructure_correlations gic ON sa.anomaly_id = gic.anomaly_id
LEFT JOIN app.surveillance_alerts sal ON sa.anomaly_id = sal.anomaly_id

WHERE sa.investigation_status IN ('pending', 'investigating')
  AND sa.confidence_score >= 0.6
  AND sa.detection_timestamp >= NOW() - INTERVAL '30 days'

ORDER BY sa.investigation_priority DESC,
         sa.confidence_score DESC,
         sa.detection_timestamp DESC;

-- Surveillance pattern summary for analyst dashboard
CREATE OR REPLACE VIEW app.surveillance_pattern_summary AS
SELECT
    sa.anomaly_type,
    COUNT(*) as total_detections,
    AVG(sa.confidence_score) as average_confidence,
    MAX(sa.confidence_score) as max_confidence,
    COUNT(*) FILTER (WHERE sa.operational_significance = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE sa.investigation_status = 'confirmed') as confirmed_count,
    COUNT(*) FILTER (WHERE sa.investigation_status = 'dismissed') as false_positive_count,

    -- Time-based patterns
    MIN(sa.detection_timestamp) as first_detection,
    MAX(sa.detection_timestamp) as last_detection,

    -- Sophistication assessment
    AVG(sa.surveillance_sophistication_score) as avg_sophistication,

    -- Most common threat actor
    MODE() WITHIN GROUP (ORDER BY sa.threat_actor_assessment) as most_common_actor_type

FROM app.surveillance_anomalies sa
WHERE sa.detection_timestamp >= NOW() - INTERVAL '90 days'
GROUP BY sa.anomaly_type
ORDER BY total_detections DESC, average_confidence DESC;

-- Government infrastructure summary
CREATE OR REPLACE VIEW app.government_infrastructure_summary AS
SELECT
    gic.government_agency_matches[1] as primary_agency_match,
    COUNT(*) as infrastructure_count,
    AVG(gic.correlation_confidence) as avg_correlation_confidence,
    COUNT(*) FILTER (WHERE gic.sequential_mac_pattern = TRUE) as sequential_mac_count,

    -- Associated anomalies
    COUNT(DISTINCT sa.anomaly_id) as associated_anomalies,
    AVG(sa.confidence_score) as avg_anomaly_confidence,

    -- Geographic distribution
    COUNT(DISTINCT ST_X(ST_Centroid(sa.anomaly_locations))) as unique_locations

FROM app.government_infrastructure_correlations gic
LEFT JOIN app.surveillance_anomalies sa ON gic.anomaly_id = sa.anomaly_id
WHERE array_length(gic.government_agency_matches, 1) > 0
  AND gic.wigle_query_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY gic.government_agency_matches[1]
ORDER BY infrastructure_count DESC, avg_correlation_confidence DESC;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE app.surveillance_anomalies IS 'Advanced surveillance detection - identifies professional surveillance operations using spatial-temporal analysis';
COMMENT ON TABLE app.government_infrastructure_correlations IS 'Correlates detected infrastructure with government/agency databases via WiGLE API';
COMMENT ON TABLE app.device_relationships IS 'Tracks device relationships for false positive reduction and threat assessment';
COMMENT ON TABLE app.surveillance_safe_zones IS 'User-defined areas where surveillance detection sensitivity is reduced';
COMMENT ON TABLE app.surveillance_alerts IS 'Real-time alerting system for active surveillance threats';
COMMENT ON TABLE app.evidence_chain_of_custody IS 'Forensic chain of custody tracking for legal admissibility';
COMMENT ON TABLE app.legal_evidence_packages IS 'Complete evidence packages ready for law enforcement/court proceedings';

COMMENT ON VIEW app.active_surveillance_threats IS 'Real-time dashboard view of active surveillance threats requiring investigation';
COMMENT ON VIEW app.surveillance_pattern_summary IS 'Analyst dashboard showing surveillance pattern trends and detection statistics';
COMMENT ON VIEW app.government_infrastructure_summary IS 'Summary of government infrastructure correlations and associated threats';