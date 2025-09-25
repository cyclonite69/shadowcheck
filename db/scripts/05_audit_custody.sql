-- ShadowCheck Database Refactor - Phase 5: Chain of Custody and Audit Logging
-- Forensic-grade audit trails for legal compliance and data integrity verification

-- Data Custody Log (5 W's: Who, What, When, Where, Why)
CREATE TABLE app.data_custody_log (
    custody_id BIGSERIAL PRIMARY KEY,

    -- The 5 W's of chain of custody
    who_collected TEXT NOT NULL,           -- Personnel/device identifier
    when_collected TIMESTAMPTZ NOT NULL,   -- Collection timestamp (preserved exactly)
    where_collected GEOMETRY(Point, 4326), -- GPS location of collection
    what_collected TEXT NOT NULL,          -- Description of data/evidence
    why_collected TEXT,                    -- Purpose/case number/investigation ID

    -- Digital evidence metadata
    data_source_id INTEGER REFERENCES app.data_sources(data_source_id),
    file_hash_sha256 TEXT,                 -- Cryptographic checksum of original file
    file_hash_md5 TEXT,                    -- Secondary checksum for verification
    file_size_bytes BIGINT,
    original_filename TEXT,
    original_file_path TEXT,

    -- Handling chain (immutable log of transfers)
    custody_transfer_log JSONB DEFAULT '[]'::jsonb,  -- Array of {from, to, timestamp, reason, hash_verified}

    -- Integrity verification
    integrity_verified BOOLEAN DEFAULT FALSE,
    verification_method TEXT,              -- 'hash_match', 'digital_signature', 'witness_verification'
    verification_timestamp TIMESTAMPTZ,
    verification_details JSONB,

    -- Legal compliance
    evidence_sealed BOOLEAN DEFAULT FALSE,
    seal_broken_timestamp TIMESTAMPTZ,
    seal_broken_by TEXT,
    legal_hold_status BOOLEAN DEFAULT FALSE,

    -- Audit trail (immutable)
    record_created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT current_user,

    CONSTRAINT valid_sha256 CHECK (file_hash_sha256 ~ '^[a-fA-F0-9]{64}$' OR file_hash_sha256 IS NULL),
    CONSTRAINT valid_md5 CHECK (file_hash_md5 ~ '^[a-fA-F0-9]{32}$' OR file_hash_md5 IS NULL)
);

-- Data Modification Audit (track ALL changes to core tables)
CREATE TABLE app.data_modification_audit (
    audit_id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id BIGINT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

    -- Change tracking
    changed_fields JSONB,     -- {field: {old_value, new_value}}
    change_summary TEXT,      -- Human-readable description

    -- Context
    changed_by TEXT NOT NULL DEFAULT current_user,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    session_id TEXT,
    client_ip INET,

    -- Immutable audit (NEVER allow updates to audit records)
    is_system_generated BOOLEAN DEFAULT FALSE
);

-- Access Log (track who accessed what data)
CREATE TABLE app.data_access_log (
    access_id BIGSERIAL PRIMARY KEY,

    -- What was accessed
    table_name TEXT NOT NULL,
    record_ids BIGINT[],      -- Array of accessed record IDs
    query_type TEXT,          -- 'SELECT', 'EXPORT', 'REPORT'
    query_hash TEXT,          -- Hash of actual SQL query

    -- Who accessed it
    accessed_by TEXT NOT NULL DEFAULT current_user,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT,
    client_ip INET,
    user_agent TEXT,

    -- Context
    access_reason TEXT,
    investigation_id TEXT,
    records_returned INTEGER,

    -- Privacy compliance
    contains_pii BOOLEAN DEFAULT FALSE,
    data_classification TEXT DEFAULT 'internal'  -- 'public', 'internal', 'confidential', 'restricted'
);

-- Generic audit trigger function for all core tables
CREATE OR REPLACE FUNCTION app.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    audit_table_name TEXT;
    record_primary_key BIGINT;
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB := '{}'::jsonb;
    field_name TEXT;
BEGIN
    audit_table_name := TG_TABLE_NAME;

    -- Determine primary key (assumes *_id pattern)
    CASE TG_TABLE_NAME
        WHEN 'wireless_access_points' THEN
            record_primary_key := COALESCE(NEW.access_point_id, OLD.access_point_id);
        WHEN 'position_measurements' THEN
            record_primary_key := COALESCE(NEW.position_id, OLD.position_id);
        WHEN 'signal_measurements' THEN
            record_primary_key := COALESCE(NEW.measurement_id, OLD.measurement_id);
        ELSE
            record_primary_key := COALESCE(NEW.id, OLD.id); -- fallback
    END CASE;

    -- Convert records to JSONB for comparison
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);

    -- For UPDATE operations, find changed fields
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN SELECT jsonb_object_keys(new_data)
        LOOP
            IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
                changed_fields := changed_fields || jsonb_build_object(
                    field_name,
                    jsonb_build_object(
                        'old_value', old_data->field_name,
                        'new_value', new_data->field_name
                    )
                );
            END IF;
        END LOOP;
    END IF;

    -- Insert audit record
    INSERT INTO app.data_modification_audit (
        table_name, record_id, operation, changed_fields,
        change_summary, is_system_generated
    ) VALUES (
        audit_table_name,
        record_primary_key,
        TG_OP,
        CASE WHEN TG_OP = 'UPDATE' THEN changed_fields ELSE NULL END,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'Record created'
            WHEN TG_OP = 'UPDATE' THEN format('Updated %s fields', jsonb_object_keys_count(changed_fields))
            WHEN TG_OP = 'DELETE' THEN 'Record deleted'
        END,
        TRUE  -- System generated
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to core tables
CREATE TRIGGER audit_wireless_access_points
    AFTER INSERT OR UPDATE OR DELETE ON app.wireless_access_points
    FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_func();

CREATE TRIGGER audit_position_measurements
    AFTER INSERT OR UPDATE OR DELETE ON app.position_measurements
    FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_func();

CREATE TRIGGER audit_signal_measurements
    AFTER INSERT OR UPDATE OR DELETE ON app.signal_measurements
    FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_func();

CREATE TRIGGER audit_network_identity_history
    AFTER INSERT OR UPDATE OR DELETE ON app.network_identity_history
    FOR EACH ROW EXECUTE FUNCTION app.audit_trigger_func();

-- Function to add custody transfer
CREATE OR REPLACE FUNCTION app.add_custody_transfer(
    p_custody_id BIGINT,
    p_from_person TEXT,
    p_to_person TEXT,
    p_transfer_reason TEXT,
    p_hash_verified BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
    transfer_record JSONB;
BEGIN
    -- Build transfer record
    transfer_record := jsonb_build_object(
        'from', p_from_person,
        'to', p_to_person,
        'timestamp', NOW(),
        'reason', p_transfer_reason,
        'hash_verified', p_hash_verified,
        'transfer_id', gen_random_uuid()
    );

    -- Append to custody log
    UPDATE app.data_custody_log
    SET custody_transfer_log = custody_transfer_log || transfer_record
    WHERE custody_id = p_custody_id;

    -- Log the transfer as an audit event
    INSERT INTO app.data_modification_audit (
        table_name, record_id, operation, change_summary, change_reason
    ) VALUES (
        'data_custody_log', p_custody_id, 'UPDATE',
        format('Custody transferred from %s to %s', p_from_person, p_to_person),
        p_transfer_reason
    );
END;
$$ LANGUAGE plpgsql;

-- Function to verify data integrity via hash checking
CREATE OR REPLACE FUNCTION app.verify_data_integrity(p_custody_id BIGINT, p_current_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
    is_valid BOOLEAN;
BEGIN
    SELECT file_hash_sha256 INTO stored_hash
    FROM app.data_custody_log
    WHERE custody_id = p_custody_id;

    is_valid := (stored_hash = p_current_hash);

    -- Update verification status
    UPDATE app.data_custody_log
    SET integrity_verified = is_valid,
        verification_method = 'hash_match',
        verification_timestamp = NOW(),
        verification_details = jsonb_build_object(
            'stored_hash', stored_hash,
            'provided_hash', p_current_hash,
            'match', is_valid
        )
    WHERE custody_id = p_custody_id;

    RETURN is_valid;
END;
$$ LANGUAGE plpgsql;

-- Function to log data access (call from application layer)
CREATE OR REPLACE FUNCTION app.log_data_access(
    p_table_name TEXT,
    p_record_ids BIGINT[],
    p_query_type TEXT,
    p_access_reason TEXT DEFAULT NULL,
    p_investigation_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO app.data_access_log (
        table_name, record_ids, query_type, access_reason, investigation_id, records_returned
    ) VALUES (
        p_table_name, p_record_ids, p_query_type, p_access_reason, p_investigation_id, array_length(p_record_ids, 1)
    );
END;
$$ LANGUAGE plpgsql;

-- Indexes for audit performance
CREATE INDEX idx_custody_log_collected_when ON app.data_custody_log (when_collected);
CREATE INDEX idx_custody_log_collected_by ON app.data_custody_log (who_collected);
CREATE INDEX idx_custody_log_verification ON app.data_custody_log (integrity_verified, verification_timestamp);
CREATE INDEX idx_modification_audit_table_record ON app.data_modification_audit (table_name, record_id);
CREATE INDEX idx_modification_audit_timestamp ON app.data_modification_audit (changed_at);
CREATE INDEX idx_modification_audit_user ON app.data_modification_audit (changed_by);
CREATE INDEX idx_access_log_timestamp ON app.data_access_log (accessed_at);
CREATE INDEX idx_access_log_user ON app.data_access_log (accessed_by);
CREATE INDEX idx_access_log_investigation ON app.data_access_log (investigation_id) WHERE investigation_id IS NOT NULL;

-- Make audit tables immutable (prevent updates/deletes)
CREATE OR REPLACE FUNCTION app.protect_audit_tables()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit records are immutable - no updates or deletes allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_modification_audit_updates
    BEFORE UPDATE OR DELETE ON app.data_modification_audit
    FOR EACH ROW EXECUTE FUNCTION app.protect_audit_tables();

CREATE TRIGGER protect_access_log_updates
    BEFORE UPDATE OR DELETE ON app.data_access_log
    FOR EACH ROW EXECUTE FUNCTION app.protect_audit_tables();

-- Row Level Security for audit tables
ALTER TABLE app.data_modification_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.data_access_log ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE app.data_custody_log IS 'Chain of custody tracking for forensic compliance - 5 Ws documented';
COMMENT ON TABLE app.data_modification_audit IS 'IMMUTABLE audit trail of ALL changes to core data tables';
COMMENT ON TABLE app.data_access_log IS 'Access logging for privacy compliance and security monitoring';
COMMENT ON FUNCTION app.add_custody_transfer(BIGINT, TEXT, TEXT, TEXT, BOOLEAN) IS 'Add custody transfer to chain - maintains legal continuity';
COMMENT ON FUNCTION app.verify_data_integrity(BIGINT, TEXT) IS 'Verify data integrity via cryptographic hash comparison';
COMMENT ON FUNCTION app.log_data_access(TEXT, BIGINT[], TEXT, TEXT, TEXT) IS 'Log data access for privacy compliance and audit trails';