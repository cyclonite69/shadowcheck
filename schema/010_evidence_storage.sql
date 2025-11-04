-- ==============================================================================
-- EVIDENCE STORAGE SCHEMA
-- Stores forensic evidence (video, documents, images) in database
-- ==============================================================================

-- Evidence attachments table
CREATE TABLE IF NOT EXISTS app.evidence_attachments (
    id SERIAL PRIMARY KEY,

    -- Evidence metadata
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('video', 'image', 'document', 'audio', 'log')),
    filename VARCHAR(255) NOT NULL,
    description TEXT,

    -- Binary data
    file_data BYTEA NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,

    -- Integrity verification
    sha256_hash VARCHAR(64) NOT NULL,
    md5_hash VARCHAR(32),

    -- Chain of custody
    collected_at TIMESTAMP NOT NULL DEFAULT NOW(),
    collected_by VARCHAR(100),
    collection_location VARCHAR(255),
    collection_method TEXT,

    -- Tags and categorization
    tags TEXT[],
    case_number VARCHAR(100),
    incident_date TIMESTAMP,

    -- Related data linkage
    related_bssids TEXT[],
    related_ssids TEXT[],
    geographic_relevance GEOMETRY(Point, 4326),

    -- Audit trail
    imported_at TIMESTAMP NOT NULL DEFAULT NOW(),
    imported_by VARCHAR(100),
    last_accessed_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,

    -- Metadata JSON for flexible attributes
    metadata JSONB,

    -- Notes and observations
    notes TEXT,

    CONSTRAINT unique_evidence_hash UNIQUE (sha256_hash)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_evidence_type ON app.evidence_attachments(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_collected_at ON app.evidence_attachments(collected_at);
CREATE INDEX IF NOT EXISTS idx_evidence_case_number ON app.evidence_attachments(case_number);
CREATE INDEX IF NOT EXISTS idx_evidence_filename ON app.evidence_attachments(filename);
CREATE INDEX IF NOT EXISTS idx_evidence_hash ON app.evidence_attachments(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_bssids ON app.evidence_attachments USING GIN(related_bssids);
CREATE INDEX IF NOT EXISTS idx_evidence_tags ON app.evidence_attachments USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_evidence_location ON app.evidence_attachments USING GIST(geographic_relevance);

-- Evidence access log for chain of custody
CREATE TABLE IF NOT EXISTS app.evidence_access_log (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES app.evidence_attachments(id) ON DELETE CASCADE,
    accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accessed_by VARCHAR(100),
    access_type VARCHAR(50) CHECK (access_type IN ('view', 'download', 'export', 'verify', 'update')),
    access_details JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_evidence_access_evidence_id ON app.evidence_access_log(evidence_id);
CREATE INDEX IF NOT EXISTS idx_evidence_access_timestamp ON app.evidence_access_log(accessed_at);

-- View for evidence summary without binary data (fast queries)
CREATE OR REPLACE VIEW app.evidence_summary AS
SELECT
    id,
    evidence_type,
    filename,
    description,
    file_size_bytes,
    mime_type,
    sha256_hash,
    collected_at,
    collected_by,
    collection_location,
    tags,
    case_number,
    incident_date,
    related_bssids,
    related_ssids,
    ST_AsGeoJSON(geographic_relevance)::json as location_geojson,
    imported_at,
    last_accessed_at,
    access_count,
    notes,
    -- File size formatted
    CASE
        WHEN file_size_bytes < 1024 THEN file_size_bytes || ' B'
        WHEN file_size_bytes < 1048576 THEN ROUND(file_size_bytes::numeric / 1024, 2) || ' KB'
        WHEN file_size_bytes < 1073741824 THEN ROUND(file_size_bytes::numeric / 1048576, 2) || ' MB'
        ELSE ROUND(file_size_bytes::numeric / 1073741824, 2) || ' GB'
    END as file_size_formatted
FROM app.evidence_attachments;

-- Function to record evidence access
CREATE OR REPLACE FUNCTION app.record_evidence_access(
    p_evidence_id INTEGER,
    p_accessed_by VARCHAR(100),
    p_access_type VARCHAR(50),
    p_access_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Insert access log
    INSERT INTO app.evidence_access_log (
        evidence_id, accessed_by, access_type, access_details, ip_address
    ) VALUES (
        p_evidence_id, p_accessed_by, p_access_type, p_access_details, p_ip_address
    );

    -- Update evidence record
    UPDATE app.evidence_attachments
    SET
        last_accessed_at = NOW(),
        access_count = access_count + 1
    WHERE id = p_evidence_id;
END;
$$ LANGUAGE plpgsql;

-- Function to verify evidence integrity
CREATE OR REPLACE FUNCTION app.verify_evidence_integrity(
    p_evidence_id INTEGER
) RETURNS TABLE(
    evidence_id INTEGER,
    filename VARCHAR,
    stored_hash VARCHAR,
    computed_hash VARCHAR,
    integrity_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.filename,
        e.sha256_hash,
        encode(digest(e.file_data, 'sha256'), 'hex') as computed,
        e.sha256_hash = encode(digest(e.file_data, 'sha256'), 'hex') as valid
    FROM app.evidence_attachments e
    WHERE e.id = p_evidence_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE app.evidence_attachments IS 'Forensic evidence storage with chain of custody tracking';
COMMENT ON TABLE app.evidence_access_log IS 'Audit log for all evidence access (chain of custody)';
COMMENT ON VIEW app.evidence_summary IS 'Evidence metadata without binary data for fast queries';
