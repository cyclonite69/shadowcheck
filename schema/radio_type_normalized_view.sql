-- ============================================================================
-- NORMALIZED RADIO TYPE VIEW
-- Non-destructive view that correctly interprets Kismet type codes
-- ============================================================================
--
-- PROBLEM: Kismet uses different type codes than WiGLE standard
-- SOLUTION: Create a view that translates on-the-fly without mutating legacy data
--
-- Kismet Type Codes (in networks_legacy):
-- - W = WiFi (correct)
-- - B = Bluetooth (correct)
-- - E = "Ethernet" but actually means:
--       * Bluetooth if frequency = 7936 (Kismet convention)
--       * WiFi if frequency is 2.4/5/6 GHz range
--       * Bluetooth if frequency is 0 or NULL (no freq data)
-- - L = LTE (should be interpreted as Cellular)
-- - G = GPRS/GSM (should be interpreted as Cellular)
-- - N = Unknown/NFC (very rare, high frequencies)
--
-- WiGLE Standard Type Codes (what we should use):
-- - W = WiFi (802.11)
-- - B = Bluetooth
-- - C = Cellular (LTE/GSM/GPRS combined)
-- ============================================================================

DROP VIEW IF EXISTS app.networks_normalized CASCADE;

CREATE VIEW app.networks_normalized AS
SELECT
    unified_id,
    source_id,
    bssid,
    ssid,
    frequency,
    capabilities,
    lasttime,
    lastlat,
    lastlon,
    
    -- Normalized radio type using WiGLE standard
    CASE
        -- Direct mappings
        WHEN type = 'W' THEN 'W'  -- WiFi
        WHEN type = 'B' THEN 'B'  -- Bluetooth
        WHEN type = 'C' THEN 'C'  -- Cellular (already correct)
        
        -- Kismet type 'E' requires frequency analysis
        WHEN type = 'E' AND frequency = 7936 THEN 'B'  -- Bluetooth (Kismet stores as E with freq 7936)
        WHEN type = 'E' AND (frequency BETWEEN 2412 AND 2484 OR 
                             frequency BETWEEN 5000 AND 5900 OR 
                             frequency BETWEEN 5925 AND 7125) THEN 'W'  -- WiFi
        WHEN type = 'E' AND (frequency = 0 OR frequency IS NULL) THEN 'B'  -- Bluetooth with no freq
        WHEN type = 'E' THEN '?'  -- Unknown E type
        
        -- Cellular variants → C
        WHEN type = 'L' THEN 'C'  -- LTE
        WHEN type = 'G' THEN 'C'  -- GPRS/GSM
        
        -- Unknown types
        WHEN type = 'N' THEN '?'  -- Unknown/NFC
        
        ELSE COALESCE(type, '?')
    END AS type_normalized,
    
    -- Keep original type for reference
    type AS type_original,
    
    -- Other fields
    bestlevel,
    bestlat,
    bestlon,
    rcois,
    mfgrid,
    service
FROM app.networks_legacy;

COMMENT ON VIEW app.networks_normalized IS 
'Non-destructive view that translates Kismet type codes to WiGLE standard (W/B/C). Does not mutate legacy source data.';

-- Create index helper function
CREATE OR REPLACE FUNCTION app.get_normalized_type_stats()
RETURNS TABLE(
    type_normalized TEXT,
    type_label TEXT,
    count BIGINT,
    unique_networks BIGINT,
    frequency_range TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.type_normalized,
        CASE n.type_normalized
            WHEN 'W' THEN 'WiFi'
            WHEN 'B' THEN 'Bluetooth'
            WHEN 'C' THEN 'Cellular'
            WHEN '?' THEN 'Unknown'
            ELSE n.type_normalized
        END as type_label,
        COUNT(*)::BIGINT as count,
        COUNT(DISTINCT n.bssid)::BIGINT as unique_networks,
        CASE 
            WHEN MIN(n.frequency) = 0 AND MAX(n.frequency) = 0 THEN 'No frequency data'
            WHEN MIN(n.frequency) = MAX(n.frequency) THEN MIN(n.frequency)::TEXT || ' MHz'
            ELSE MIN(n.frequency)::TEXT || ' - ' || MAX(n.frequency)::TEXT || ' MHz'
        END as frequency_range
    FROM app.networks_normalized n
    GROUP BY n.type_normalized
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.get_normalized_type_stats IS
'Get statistics showing before/after type normalization counts';
