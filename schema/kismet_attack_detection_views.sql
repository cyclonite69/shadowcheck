-- Kismet Attack Detection & Forensic Analysis Views
-- Created: November 2, 2025
-- Purpose: Real-time attack detection and forensic evidence queries

-- =================================================================
-- VIEW 1: Rogue AP Detection
-- Identifies potential Evil Twin / Rogue APs by analyzing SSIDs
-- with multiple BSSIDs and signal characteristics
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_rogue_ap_detection AS
SELECT 
    device_json::jsonb->'kismet.device.base.name' as ssid,
    device_json::jsonb->'kismet.device.base.commonname' as common_name,
    COUNT(DISTINCT devmac) as unique_bssids,
    array_agg(DISTINCT devmac ORDER BY devmac) as bssid_list,
    array_agg(DISTINCT manuf ORDER BY manuf) as manufacturers,
    MAX(strongest_signal) as max_signal,
    MIN(strongest_signal) as min_signal,
    COUNT(DISTINCT kismet_filename) as capture_sessions,
    MIN(first_time) as first_seen,
    MAX(last_time) as last_seen,
    -- Flag suspicious patterns
    CASE 
        WHEN COUNT(DISTINCT devmac) > 1 THEN 'MULTIPLE_BSSIDS_SAME_SSID'
        ELSE 'NORMAL'
    END as threat_indicator
FROM app.kismet_devices_staging
WHERE type_string = 'Wi-Fi AP'
  AND device_json::jsonb->'kismet.device.base.name' IS NOT NULL
  AND device_json::jsonb->'kismet.device.base.name'::text != '""'
GROUP BY 
    device_json::jsonb->'kismet.device.base.name',
    device_json::jsonb->'kismet.device.base.commonname'
HAVING COUNT(DISTINCT devmac) >= 1
ORDER BY COUNT(DISTINCT devmac) DESC, MAX(strongest_signal) DESC;

COMMENT ON VIEW app.kismet_rogue_ap_detection IS 
'Detects potential rogue/Evil Twin APs by identifying SSIDs with multiple BSSIDs';

-- =================================================================
-- VIEW 2: Attack Timeline
-- Chronological view of all security alerts with context
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_attack_timeline AS
SELECT 
    to_timestamp(ts_sec) AT TIME ZONE 'UTC' as attack_time,
    header as alert_type,
    json_data::jsonb->>'kismet.alert.class' as attack_class,
    json_data::jsonb->>'kismet.alert.severity' as severity,
    devmac as attacker_bssid,
    json_data::jsonb->>'kismet.alert.source_mac' as victim_client,
    json_data::jsonb->>'kismet.alert.dest_mac' as target_bssid,
    json_data::jsonb->>'kismet.alert.text' as description,
    lat,
    lon,
    kismet_filename as evidence_file,
    CASE 
        WHEN header IN ('DEAUTHCODEINVALID', 'DEAUTHFLOOD', 'DISCONCODEINVALID') THEN 'DEAUTH_ATTACK'
        WHEN header IN ('CRYPTODROP', 'NOCLIENTMFP', 'WEPNETWORK') THEN 'CRYPTO_WEAKNESS'
        WHEN header LIKE '%SPOOF%' OR json_data::jsonb->>'kismet.alert.class' = 'SPOOF' THEN 'SPOOFING'
        WHEN json_data::jsonb->>'kismet.alert.class' = 'EXPLOIT' THEN 'ACTIVE_EXPLOIT'
        ELSE 'OTHER'
    END as attack_category
FROM app.kismet_alerts_staging
ORDER BY ts_sec DESC;

COMMENT ON VIEW app.kismet_attack_timeline IS 
'Chronological timeline of all security alerts with attack classification';

-- =================================================================
-- VIEW 3: Device Relationship Map
-- Maps clients to APs they communicate with
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_client_ap_relationships AS
SELECT 
    d.devmac as client_mac,
    d.type_string as client_type,
    d.manuf as client_manufacturer,
    d.strongest_signal as client_signal,
    d.device_json::jsonb->'kismet.device.base.name' as client_name,
    d.avg_lat as lat,
    d.avg_lon as lon,
    d.kismet_filename,
    d.first_time,
    d.last_time
FROM app.kismet_devices_staging d
WHERE d.type_string IN ('Wi-Fi Client', 'Wi-Fi Ad-Hoc')
ORDER BY d.strongest_signal DESC;

COMMENT ON VIEW app.kismet_client_ap_relationships IS 
'Identifies all WiFi clients detected, useful for victim identification';

-- =================================================================
-- VIEW 4: Persistent Threats
-- Devices seen across multiple capture sessions (surveillance indicators)
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_persistent_threats AS
SELECT 
    devmac,
    type_string,
    manuf,
    device_json::jsonb->'kismet.device.base.name' as device_name,
    COUNT(DISTINCT kismet_filename) as capture_sessions,
    array_agg(DISTINCT kismet_filename ORDER BY kismet_filename) as files,
    MAX(strongest_signal) as peak_signal,
    MIN(strongest_signal) as weakest_signal,
    MIN(first_time) as first_detected,
    MAX(last_time) as last_detected,
    -- Calculate persistence duration in seconds
    CASE 
        WHEN MAX(last_time) IS NOT NULL AND MIN(first_time) IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (to_timestamp(MAX(last_time)) - to_timestamp(MIN(first_time))))
        ELSE 0
    END as persistence_duration_seconds,
    -- Threat score based on persistence
    CASE
        WHEN COUNT(DISTINCT kismet_filename) >= 5 THEN 'CRITICAL'
        WHEN COUNT(DISTINCT kismet_filename) >= 3 THEN 'HIGH'
        WHEN COUNT(DISTINCT kismet_filename) >= 2 THEN 'MEDIUM'
        ELSE 'LOW'
    END as threat_level
FROM app.kismet_devices_staging
GROUP BY devmac, type_string, manuf, device_json::jsonb->'kismet.device.base.name'
HAVING COUNT(DISTINCT kismet_filename) > 1
ORDER BY COUNT(DISTINCT kismet_filename) DESC, MAX(strongest_signal) DESC;

COMMENT ON VIEW app.kismet_persistent_threats IS 
'Identifies devices appearing in multiple captures - persistence = surveillance indicator';

-- =================================================================
-- VIEW 5: Ericwifi Forensic Summary
-- Specific analysis of the Ericwifi attack evidence
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_ericwifi_evidence AS
SELECT 
    devmac as bssid,
    type_string,
    manuf,
    device_json::jsonb->'kismet.device.base.name' as ssid,
    strongest_signal,
    avg_lat as capture_lat,
    avg_lon as capture_lon,
    kismet_filename,
    first_time,
    last_time,
    CASE 
        WHEN devmac = '72:13:01:7E:41:72' THEN 'ROGUE_AP'
        WHEN devmac = '72:13:01:77:41:71' THEN 'LEGITIMATE_AP'
        ELSE 'CLIENT'
    END as device_role,
    -- Calculate signal strength categories
    CASE 
        WHEN strongest_signal >= -50 THEN 'VERY_CLOSE (<20m)'
        WHEN strongest_signal >= -60 THEN 'CLOSE (20-50m)'
        WHEN strongest_signal >= -70 THEN 'MEDIUM (50-100m)'
        ELSE 'FAR (>100m)'
    END as proximity_estimate
FROM app.kismet_devices_staging
WHERE LOWER(device_json::text) LIKE '%eric%'
   OR devmac IN ('72:13:01:7E:41:72', '72:13:01:77:41:71')
ORDER BY 
    CASE 
        WHEN devmac = '72:13:01:7E:41:72' THEN 1
        WHEN devmac = '72:13:01:77:41:71' THEN 2
        ELSE 3
    END,
    strongest_signal DESC;

COMMENT ON VIEW app.kismet_ericwifi_evidence IS 
'Forensic summary of Ericwifi network attack evidence with proximity analysis';

-- =================================================================
-- VIEW 6: Signal Strength Analysis
-- Tracks signal variations to identify movement or multiple devices
-- =================================================================
CREATE OR REPLACE VIEW app.kismet_signal_analysis AS
SELECT 
    devmac,
    type_string,
    device_json::jsonb->'kismet.device.base.name' as device_name,
    manuf,
    COUNT(DISTINCT kismet_filename) as sessions,
    AVG(strongest_signal) as avg_signal,
    STDDEV(strongest_signal) as signal_stddev,
    MAX(strongest_signal) as peak_signal,
    MIN(strongest_signal) as min_signal,
    MAX(strongest_signal) - MIN(strongest_signal) as signal_variation,
    -- Flag suspicious signal patterns
    CASE 
        WHEN STDDEV(strongest_signal) > 10 THEN 'HIGH_VARIATION'
        WHEN STDDEV(strongest_signal) > 5 THEN 'MODERATE_VARIATION'
        ELSE 'STABLE'
    END as movement_indicator
FROM app.kismet_devices_staging
WHERE strongest_signal IS NOT NULL
GROUP BY devmac, type_string, device_json::jsonb->'kismet.device.base.name', manuf
HAVING COUNT(DISTINCT kismet_filename) > 1
ORDER BY STDDEV(strongest_signal) DESC NULLS LAST;

COMMENT ON VIEW app.kismet_signal_analysis IS 
'Analyzes signal strength variations to detect device movement or multiple units';

-- =================================================================
-- Create indexes for performance
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_kismet_devices_devmac_upper 
    ON app.kismet_devices_staging(UPPER(devmac));

CREATE INDEX IF NOT EXISTS idx_kismet_alerts_header 
    ON app.kismet_alerts_staging(header);

CREATE INDEX IF NOT EXISTS idx_kismet_alerts_class 
    ON app.kismet_alerts_staging((json_data::jsonb->>'kismet.alert.class'));

-- =================================================================
-- Grant permissions
-- =================================================================
GRANT SELECT ON app.kismet_rogue_ap_detection TO PUBLIC;
GRANT SELECT ON app.kismet_attack_timeline TO PUBLIC;
GRANT SELECT ON app.kismet_client_ap_relationships TO PUBLIC;
GRANT SELECT ON app.kismet_persistent_threats TO PUBLIC;
GRANT SELECT ON app.kismet_ericwifi_evidence TO PUBLIC;
GRANT SELECT ON app.kismet_signal_analysis TO PUBLIC;
