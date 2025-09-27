-- =====================================================
-- NETWORK TAGGING SYSTEM FOR SURVEILLANCE ANALYSIS
-- Allows manual tagging of networks as 'legit' or 'threat'
-- =====================================================

-- Create network tags table
CREATE TABLE IF NOT EXISTS app.network_tags (
    id SERIAL PRIMARY KEY,
    bssid VARCHAR(17) NOT NULL,
    ssid TEXT,
    tag_type VARCHAR(20) NOT NULL CHECK (tag_type IN ('LEGIT', 'THREAT', 'INVESTIGATE', 'FALSE_POSITIVE')),
    confidence INTEGER DEFAULT 50 CHECK (confidence BETWEEN 0 AND 100),
    notes TEXT,
    tagged_by VARCHAR(50) DEFAULT CURRENT_USER,
    tagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bssid, tag_type)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_network_tags_bssid ON app.network_tags(bssid);
CREATE INDEX IF NOT EXISTS idx_network_tags_type ON app.network_tags(tag_type);

-- Helper function to tag a network
CREATE OR REPLACE FUNCTION app.tag_network(
    p_bssid VARCHAR(17),
    p_ssid TEXT,
    p_tag_type VARCHAR(20),
    p_confidence INTEGER DEFAULT 50,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO app.network_tags (bssid, ssid, tag_type, confidence, notes)
    VALUES (p_bssid, p_ssid, p_tag_type, p_confidence, p_notes)
    ON CONFLICT (bssid, tag_type)
    DO UPDATE SET
        ssid = p_ssid,
        confidence = p_confidence,
        notes = p_notes,
        tagged_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get network tag
CREATE OR REPLACE FUNCTION app.get_network_tag(p_bssid VARCHAR(17))
RETURNS TABLE(tag_type VARCHAR(20), confidence INTEGER, notes TEXT, tagged_at TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    SELECT nt.tag_type, nt.confidence, nt.notes, nt.tagged_at
    FROM app.network_tags nt
    WHERE nt.bssid = p_bssid
    ORDER BY nt.tagged_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Usage examples (commented out):
-- SELECT app.tag_network('AA:BB:CC:DD:EE:FF', 'FBI Van', 'THREAT', 95, 'User validated as legitimate FBI operation');
-- SELECT app.tag_network('11:22:33:44:55:66', 'definitely NOT an fbi van', 'FALSE_POSITIVE', 90, 'User validated deception tactic');
-- SELECT * FROM app.get_network_tag('AA:BB:CC:DD:EE:FF');

-- View current tags
SELECT '=== CURRENT NETWORK TAGS ===' as system_info;
SELECT
    bssid,
    LEFT(ssid, 30) as ssid_truncated,
    tag_type,
    confidence,
    LEFT(notes, 50) as notes_truncated,
    tagged_at::date as tagged_date
FROM app.network_tags
ORDER BY tagged_at DESC;

COMMENT ON TABLE app.network_tags IS 'Manual classification of networks for surveillance analysis';
COMMENT ON FUNCTION app.tag_network IS 'Tag a network with classification (LEGIT/THREAT/INVESTIGATE/FALSE_POSITIVE)';