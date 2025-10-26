-- BSSID Enrichment Tagging System
-- Tracks BSSIDs that need WiGLE API enrichment

CREATE TABLE IF NOT EXISTS app.bssid_enrichment_queue (
    tag_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,

    -- Tag metadata
    tagged_at TIMESTAMPTZ DEFAULT NOW(),
    tagged_by TEXT, -- User who tagged it
    tag_reason TEXT, -- Why it was tagged (e.g., "missing location data", "incomplete coverage")
    priority INTEGER DEFAULT 0, -- Higher = more important

    -- Enrichment status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,

    -- Results tracking
    wigle_records_found INTEGER DEFAULT 0,
    wigle_locations_found INTEGER DEFAULT 0
);

-- Track enrichment history
CREATE TABLE IF NOT EXISTS app.bssid_enrichment_history (
    history_id BIGSERIAL PRIMARY KEY,
    tag_id BIGINT REFERENCES app.bssid_enrichment_queue(tag_id) ON DELETE CASCADE,
    bssid TEXT NOT NULL,

    -- Enrichment details
    enrichment_timestamp TIMESTAMPTZ DEFAULT NOW(),
    wigle_query_params JSONB,
    wigle_response_summary JSONB,
    records_added INTEGER DEFAULT 0,

    -- Performance metrics
    query_duration_ms INTEGER,
    api_rate_limit_hit BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bssid_enrichment_queue_status ON app.bssid_enrichment_queue(status);
CREATE INDEX IF NOT EXISTS idx_bssid_enrichment_queue_priority ON app.bssid_enrichment_queue(priority DESC, tagged_at);
CREATE INDEX IF NOT EXISTS idx_bssid_enrichment_queue_bssid ON app.bssid_enrichment_queue(bssid);

-- Partial unique index: prevent duplicate pending/processing entries for same BSSID
CREATE UNIQUE INDEX IF NOT EXISTS idx_bssid_enrichment_queue_unique_pending
    ON app.bssid_enrichment_queue(bssid)
    WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_bssid_enrichment_history_tag_id ON app.bssid_enrichment_history(tag_id);
CREATE INDEX IF NOT EXISTS idx_bssid_enrichment_history_bssid ON app.bssid_enrichment_history(bssid);

-- View for pending enrichments
CREATE OR REPLACE VIEW app.pending_wigle_enrichments AS
SELECT
    tag_id,
    bssid,
    tagged_at,
    tagged_by,
    tag_reason,
    priority,
    -- Check if BSSID exists in our legacy data
    EXISTS(SELECT 1 FROM app.networks_legacy WHERE networks_legacy.bssid = bssid_enrichment_queue.bssid) as has_local_data,
    -- Check if already enriched from WiGLE
    EXISTS(SELECT 1 FROM app.wigle_api_networks_staging WHERE wigle_api_networks_staging.bssid = bssid_enrichment_queue.bssid) as has_wigle_data,
    -- Count of local observations
    (SELECT COUNT(*) FROM app.locations_legacy WHERE locations_legacy.bssid = bssid_enrichment_queue.bssid) as local_observation_count
FROM app.bssid_enrichment_queue
WHERE status = 'pending'
ORDER BY priority DESC, tagged_at ASC;

-- Comments
COMMENT ON TABLE app.bssid_enrichment_queue IS 'Queue of BSSIDs tagged for WiGLE API enrichment';
COMMENT ON TABLE app.bssid_enrichment_history IS 'History of WiGLE enrichment attempts';
COMMENT ON VIEW app.pending_wigle_enrichments IS 'View of BSSIDs pending WiGLE enrichment with context';
COMMENT ON COLUMN app.bssid_enrichment_queue.priority IS 'Higher priority BSSIDs are enriched first (0-100)';
COMMENT ON COLUMN app.bssid_enrichment_queue.tag_reason IS 'Human-readable reason for enrichment request';
