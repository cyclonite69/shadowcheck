-- =====================================================
-- Comprehensive Surveillance Analysis with Device Fingerprinting
-- Advanced threat detection using pattern analysis
-- =====================================================

-- 1. DEVICE FINGERPRINTING ANALYSIS
SELECT '=== DEVICE FINGERPRINTING ANALYSIS ===' as header;

-- Manufacturer clustering - identify suspicious patterns
WITH manufacturer_analysis AS (
    SELECT
        rm.organization_name,
        rm.ieee_registry_type,
        COUNT(DISTINCT n.bssid) as unique_devices,
        COUNT(*) as total_sightings,
        MIN(TO_TIMESTAMP(l.time/1000)) as first_seen,
        MAX(TO_TIMESTAMP(l.time/1000)) as last_seen,
        AVG(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as avg_distance_from_home_km,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_from_home_km,
        STRING_AGG(DISTINCT n.bssid, ', ' ORDER BY n.bssid) as device_list
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    GROUP BY rm.organization_name, rm.ieee_registry_type
    HAVING COUNT(DISTINCT n.bssid) >= 3  -- Manufacturers with 3+ devices
        AND MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) > 5  -- At least one device >5km from home
),
suspicious_manufacturers AS (
    SELECT
        *,
        CASE
            WHEN max_distance_from_home_km > 50 AND unique_devices >= 5 THEN 'HIGH - Multiple devices at extreme distance'
            WHEN max_distance_from_home_km > 20 AND unique_devices >= 3 THEN 'MEDIUM - Device cluster with significant range'
            WHEN avg_distance_from_home_km > 10 THEN 'LOW - Elevated average distance'
            ELSE 'INFORMATIONAL'
        END as threat_assessment
    FROM manufacturer_analysis
)
SELECT
    organization_name,
    ieee_registry_type,
    unique_devices,
    total_sightings,
    ROUND(avg_distance_from_home_km::numeric, 2) as avg_distance_km,
    ROUND(max_distance_from_home_km::numeric, 2) as max_distance_km,
    first_seen::date as first_observed,
    last_seen::date as last_observed,
    threat_assessment,
    LEFT(device_list, 100) as sample_devices
FROM suspicious_manufacturers
WHERE threat_assessment != 'INFORMATIONAL'
ORDER BY max_distance_from_home_km DESC, unique_devices DESC
LIMIT 20;

-- 2. BSSID WALKING PATTERN ANALYSIS
SELECT '=== BSSID WALKING PATTERN ANALYSIS ===' as bssid_walking_header;

WITH bssid_sequences AS (
    SELECT
        LEFT(n.bssid, 15) as bssid_prefix,
        RIGHT(n.bssid, 2) as last_octet,
        COUNT(DISTINCT n.bssid) as sequence_length,
        COUNT(*) as total_sightings,
        MIN(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as min_distance_km,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_km,
        STRING_AGG(DISTINCT RIGHT(n.bssid, 2), ',' ORDER BY RIGHT(n.bssid, 2)) as octet_sequence,
        STRING_AGG(DISTINCT n.bssid, ', ') as full_bssid_list
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    GROUP BY LEFT(n.bssid, 15)
    HAVING COUNT(DISTINCT n.bssid) >= 3  -- Sequences with 3+ devices
),
suspicious_sequences AS (
    SELECT
        *,
        CASE
            WHEN sequence_length >= 10 AND max_distance_km > 20 THEN 'CRITICAL - Extensive BSSID walking with long range'
            WHEN sequence_length >= 5 AND max_distance_km > 10 THEN 'HIGH - BSSID walking pattern detected'
            WHEN sequence_length >= 3 AND max_distance_km > 5 THEN 'MEDIUM - Possible BSSID manipulation'
            ELSE 'LOW'
        END as walking_threat_level
    FROM bssid_sequences
)
SELECT
    bssid_prefix || ':xx' as bssid_pattern,
    sequence_length,
    total_sightings,
    ROUND(min_distance_km::numeric, 2) as closest_sighting_km,
    ROUND(max_distance_km::numeric, 2) as furthest_sighting_km,
    walking_threat_level,
    octet_sequence as last_octets_observed,
    LEFT(full_bssid_list, 200) as sample_devices
FROM suspicious_sequences
WHERE walking_threat_level != 'LOW'
ORDER BY sequence_length DESC, max_distance_km DESC
LIMIT 15;

-- 3. TEMPORAL CORRELATION ANALYSIS
SELECT '=== TEMPORAL CORRELATION ANALYSIS ===' as temporal_header;

WITH temporal_clusters AS (
    SELECT
        DATE_TRUNC('hour', TO_TIMESTAMP(l.time/1000)) as time_window,
        COUNT(DISTINCT n.bssid) as unique_devices,
        COUNT(*) as total_sightings,
        AVG(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as avg_distance_km,
        STRING_AGG(DISTINCT n.bssid, ', ' ORDER BY n.bssid) as devices_in_window
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        AND l.time > 0
    GROUP BY DATE_TRUNC('hour', TO_TIMESTAMP(l.time/1000))
    HAVING COUNT(DISTINCT n.bssid) >= 10  -- Time windows with 10+ devices
),
suspicious_time_windows AS (
    SELECT
        *,
        CASE
            WHEN unique_devices >= 50 AND avg_distance_km > 10 THEN 'CRITICAL - Mass surveillance event'
            WHEN unique_devices >= 20 AND avg_distance_km > 5 THEN 'HIGH - Coordinated activity'
            WHEN unique_devices >= 10 AND avg_distance_km > 2 THEN 'MEDIUM - Elevated surveillance'
            ELSE 'INFORMATIONAL'
        END as temporal_threat_level
    FROM temporal_clusters
)
SELECT
    time_window,
    unique_devices,
    total_sightings,
    ROUND(avg_distance_km::numeric, 2) as avg_distance_km,
    temporal_threat_level,
    LEFT(devices_in_window, 150) as sample_devices
FROM suspicious_time_windows
WHERE temporal_threat_level != 'INFORMATIONAL'
ORDER BY unique_devices DESC, time_window DESC
LIMIT 15;

-- 4. SIGNAL STRENGTH ANALYSIS
SELECT '=== SIGNAL STRENGTH FINGERPRINTING ===' as signal_header;

WITH signal_analysis AS (
    SELECT
        n.bssid,
        n.ssid,
        COUNT(*) as observation_count,
        AVG(n.bestlevel) as avg_signal_dbm,
        STDDEV(n.bestlevel) as signal_variance,
        MIN(n.bestlevel) as min_signal_dbm,
        MAX(n.bestlevel) as max_signal_dbm,
        COUNT(DISTINCT l.lat || ',' || l.lon) as unique_locations,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_km
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE n.bestlevel IS NOT NULL
        AND n.bestlevel != 0
        AND l.lat IS NOT NULL AND l.lon IS NOT NULL
    GROUP BY n.bssid, n.ssid
    HAVING COUNT(*) >= 2
),
signal_anomalies AS (
    SELECT
        *,
        CASE
            WHEN signal_variance > 20 AND max_distance_km > 10 THEN 'HIGH - Variable power with long range (possible mobile surveillance)'
            WHEN avg_signal_dbm > -40 AND max_distance_km > 5 THEN 'MEDIUM - Unusually strong signal at distance'
            WHEN (max_signal_dbm - min_signal_dbm) > 40 THEN 'MEDIUM - Extreme signal variation'
            ELSE 'LOW'
        END as signal_threat_level
    FROM signal_analysis
)
SELECT
    bssid,
    COALESCE(ssid, '<hidden>') as ssid,
    observation_count,
    unique_locations,
    ROUND(avg_signal_dbm::numeric, 1) as avg_signal_dbm,
    ROUND(signal_variance::numeric, 1) as signal_variance,
    min_signal_dbm,
    max_signal_dbm,
    ROUND(max_distance_km::numeric, 2) as max_distance_km,
    signal_threat_level
FROM signal_anomalies
WHERE signal_threat_level != 'LOW'
ORDER BY signal_variance DESC, max_distance_km DESC
LIMIT 15;

-- 5. FREQUENCY ANALYSIS
SELECT '=== FREQUENCY FINGERPRINTING ===' as frequency_header;

WITH frequency_analysis AS (
    SELECT
        n.frequency,
        COUNT(DISTINCT n.bssid) as unique_devices,
        COUNT(*) as total_observations,
        AVG(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as avg_distance_km,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_km,
        CASE
            WHEN n.frequency = 0 THEN 'Unknown/Hidden'
            WHEN n.frequency < 2400 THEN 'Sub-2.4GHz (Unusual)'
            WHEN n.frequency BETWEEN 2400 AND 2500 THEN '2.4GHz Band'
            WHEN n.frequency BETWEEN 5000 AND 6000 THEN '5GHz Band'
            WHEN n.frequency > 6000 THEN 'Above 6GHz (Advanced)'
            ELSE 'Other'
        END as frequency_classification
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    GROUP BY n.frequency
),
suspicious_frequencies AS (
    SELECT
        *,
        CASE
            WHEN frequency_classification = 'Sub-2.4GHz (Unusual)' AND max_distance_km > 10 THEN 'HIGH - Unusual frequency with long range'
            WHEN frequency_classification = 'Above 6GHz (Advanced)' AND unique_devices >= 3 THEN 'MEDIUM - Advanced frequency usage'
            WHEN frequency_classification = 'Unknown/Hidden' AND max_distance_km > 20 THEN 'MEDIUM - Hidden frequency at distance'
            ELSE 'INFORMATIONAL'
        END as frequency_threat_level
    FROM frequency_analysis
)
SELECT
    frequency,
    frequency_classification,
    unique_devices,
    total_observations,
    ROUND(avg_distance_km::numeric, 2) as avg_distance_km,
    ROUND(max_distance_km::numeric, 2) as max_distance_km,
    frequency_threat_level
FROM suspicious_frequencies
WHERE frequency_threat_level != 'INFORMATIONAL'
ORDER BY
    CASE frequency_classification
        WHEN 'Sub-2.4GHz (Unusual)' THEN 1
        WHEN 'Above 6GHz (Advanced)' THEN 2
        WHEN 'Unknown/Hidden' THEN 3
        ELSE 4
    END,
    max_distance_km DESC;

-- 6. COMPREHENSIVE THREAT SUMMARY
SELECT '=== COMPREHENSIVE SURVEILLANCE THREAT SUMMARY ===' as summary_header;

WITH all_threats AS (
    -- High-mobility single devices
    SELECT
        n.bssid,
        'High Mobility Device' as threat_type,
        COUNT(*) as evidence_count,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_km,
        CASE
            WHEN MAX(ST_Distance(
                ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
                (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
            ) / 1000.0) > 100 THEN 'CRITICAL'
            WHEN MAX(ST_Distance(
                ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
                (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
            ) / 1000.0) > 50 THEN 'HIGH'
            WHEN MAX(ST_Distance(
                ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
                (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
            ) / 1000.0) > 20 THEN 'MEDIUM'
            ELSE 'LOW'
        END as severity_level
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        AND COUNT(*) FILTER (WHERE ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) <= 500) > 0  -- Must appear near home
    GROUP BY n.bssid
    HAVING MAX(ST_Distance(
        ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
        (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
    ) / 1000.0) > 10

    UNION ALL

    -- BSSID walking patterns
    SELECT
        LEFT(n.bssid, 15) || ':xx' as bssid,
        'BSSID Walking Pattern' as threat_type,
        COUNT(DISTINCT n.bssid) as evidence_count,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0) as max_distance_km,
        CASE
            WHEN COUNT(DISTINCT n.bssid) >= 10 THEN 'HIGH'
            WHEN COUNT(DISTINCT n.bssid) >= 5 THEN 'MEDIUM'
            ELSE 'LOW'
        END as severity_level
    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    GROUP BY LEFT(n.bssid, 15)
    HAVING COUNT(DISTINCT n.bssid) >= 3
)
SELECT
    threat_type,
    severity_level,
    COUNT(*) as threat_instances,
    AVG(evidence_count) as avg_evidence_per_threat,
    MAX(max_distance_km) as maximum_range_km
FROM all_threats
GROUP BY threat_type, severity_level
ORDER BY
    CASE severity_level
        WHEN 'CRITICAL' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    COUNT(*) DESC;