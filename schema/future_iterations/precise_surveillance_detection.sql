-- =====================================================
-- PRECISE SURVEILLANCE DETECTION - REDUCED FALSE POSITIVES
-- Rational: Focus on impossible WiFi range patterns vs legitimate infrastructure
-- =====================================================

SELECT '=== PRECISE SURVEILLANCE DETECTION ANALYSIS ===' as header;

-- Key criteria for surveillance vs infrastructure:
-- 1. WiFi theoretical max range: ~100-200m outdoor, ~50m indoor for consumer equipment
-- 2. Legitimate infrastructure (universities, malls) can have wide coverage via multiple APs
-- 3. Surveillance devices: Single device appearing at multiple distant locations
-- 4. Key indicator: >50km gap between sightings for same BSSID (impossible for WiFi)

WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
),
multi_location_devices AS (
    SELECT
        n.bssid,
        COALESCE(n.ssid, '<hidden>') as ssid,
        COUNT(DISTINCT l.lat || ',' || l.lon) as unique_locations,
        COUNT(*) as total_sightings,

        -- Distance analysis
        MIN(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        )) as min_distance_meters,
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        )) as max_distance_meters,

        -- Calculate distance between furthest sighting locations
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(l2.lon, l2.lat), 4326)::geography
        )) as max_inter_location_distance,

        -- Time analysis
        MIN(TO_TIMESTAMP(l.time/1000)) as first_sighting,
        MAX(TO_TIMESTAMP(l.time/1000)) as last_sighting,

        -- Collect all distances for pattern analysis
        array_agg(DISTINCT ROUND((ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ))::numeric, 0) ORDER BY ROUND((ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        ))::numeric, 0)) as distance_pattern

    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    INNER JOIN app.locations_legacy l2 ON n.bssid = (
        SELECT n2.bssid FROM app.networks_legacy n2
        INNER JOIN app.locations_legacy l3 ON n2.unified_id = l3.unified_id
        WHERE n2.bssid = n.bssid AND l3.unified_id != l.unified_id LIMIT 1
    )
    CROSS JOIN home_location h
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
    AND l.lat <> 0 AND l.lon <> 0
    GROUP BY n.bssid, n.ssid
    HAVING COUNT(DISTINCT l.lat || ',' || l.lon) >= 2
),
surveillance_classification AS (
    SELECT
        *,
        -- Calculate distance gap between closest and furthest sighting
        (distance_pattern[array_length(distance_pattern, 1)] - distance_pattern[1]) as distance_gap_meters,

        -- Network type classification
        CASE
            WHEN ssid ~* '(MSUnet|eduroam|university|campus|college)' THEN 'University_Infrastructure'
            WHEN ssid ~* '(mall|center|shopping|store|retail)' THEN 'Commercial_Infrastructure'
            WHEN ssid ~* '(starbucks|mcdonalds|walmart|target|bestbuy)' THEN 'Chain_Store'
            WHEN ssid ~* '(hotel|marriott|hilton|guest|resort)' THEN 'Hospitality'
            WHEN ssid ~* '(porsche|bmw|ford|chevy|tesla|honda|toyota)' THEN 'Vehicle_Network'
            WHEN ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)' THEN 'Federal_Agency'
            WHEN ssid ~* '(xfinity|comcast|verizon|att|spectrum)' THEN 'ISP_Hotspot'
            WHEN ssid = '<hidden>' OR ssid = '' THEN 'Hidden_Network'
            ELSE 'Unknown_Personal'
        END as network_classification,

        -- WiFi range analysis (consumer WiFi rarely exceeds 200m in optimal conditions)
        CASE
            WHEN max_inter_location_distance > 89000 THEN 'IMPOSSIBLE_RANGE'  -- >89km between same BSSID
            WHEN max_inter_location_distance > 50000 THEN 'EXTREME_RANGE'     -- >50km
            WHEN max_inter_location_distance > 10000 THEN 'VERY_LONG_RANGE'   -- >10km
            WHEN max_inter_location_distance > 1000 THEN 'LONG_RANGE'         -- >1km
            WHEN max_inter_location_distance > 200 THEN 'EXTENDED_RANGE'      -- >200m (your threshold)
            ELSE 'NORMAL_RANGE'
        END as range_classification

    FROM multi_location_devices
),
final_threat_assessment AS (
    SELECT
        *,
        -- Surveillance threat scoring
        CASE
            -- Definite surveillance: Hidden networks with impossible WiFi ranges
            WHEN network_classification = 'Hidden_Network'
                 AND range_classification IN ('IMPOSSIBLE_RANGE', 'EXTREME_RANGE')
                 THEN 'CONFIRMED_SURVEILLANCE'

            -- Federal agency networks (already suspicious)
            WHEN network_classification = 'Federal_Agency'
                 AND range_classification IN ('IMPOSSIBLE_RANGE', 'EXTREME_RANGE', 'VERY_LONG_RANGE')
                 THEN 'CONFIRMED_SURVEILLANCE'

            -- Unknown personal networks with extreme ranges
            WHEN network_classification = 'Unknown_Personal'
                 AND range_classification IN ('IMPOSSIBLE_RANGE', 'EXTREME_RANGE')
                 THEN 'HIGH_SUSPICION_SURVEILLANCE'

            -- Legitimate infrastructure can have wide coverage, but >50km is still suspicious
            WHEN network_classification IN ('University_Infrastructure', 'Commercial_Infrastructure', 'Chain_Store')
                 AND range_classification = 'IMPOSSIBLE_RANGE'
                 THEN 'INVESTIGATE_INFRASTRUCTURE'

            -- Vehicle networks traveling long distances (could be legitimate travel)
            WHEN network_classification = 'Vehicle_Network'
                 AND range_classification IN ('IMPOSSIBLE_RANGE', 'EXTREME_RANGE')
                 THEN 'MOBILE_ASSET_INVESTIGATION'

            -- ISP hotspots can legitimately have wide coverage
            WHEN network_classification = 'ISP_Hotspot'
                 THEN 'LEGITIMATE_ISP_INFRASTRUCTURE'

            -- Everything else with suspicious ranges
            WHEN range_classification IN ('VERY_LONG_RANGE', 'LONG_RANGE', 'EXTENDED_RANGE')
                 THEN 'LOW_SUSPICION'

            ELSE 'NORMAL_ACTIVITY'
        END as threat_assessment
    FROM surveillance_classification
)
SELECT
    bssid,
    LEFT(ssid, 30) as ssid,
    network_classification,
    unique_locations,
    total_sightings,

    -- Distance analysis
    ROUND((min_distance_meters/1000.0)::numeric, 3) as closest_approach_km,
    ROUND((max_distance_meters/1000.0)::numeric, 3) as furthest_sighting_km,
    ROUND((max_inter_location_distance/1000.0)::numeric, 3) as max_device_range_km,
    range_classification,

    -- Time analysis
    first_sighting::date as first_observed,
    last_sighting::date as last_observed,
    EXTRACT(days FROM (last_sighting - first_sighting)) as operational_days,

    -- Threat assessment
    threat_assessment,

    -- Pattern details
    array_to_string(
        ARRAY(SELECT ROUND((unnest/1000.0)::numeric, 2)::text || 'km'
              FROM unnest(distance_pattern)),
        ' → '
    ) as distance_progression

FROM final_threat_assessment
WHERE threat_assessment IN (
    'CONFIRMED_SURVEILLANCE',
    'HIGH_SUSPICION_SURVEILLANCE',
    'INVESTIGATE_INFRASTRUCTURE',
    'MOBILE_ASSET_INVESTIGATION'
)
ORDER BY
    CASE threat_assessment
        WHEN 'CONFIRMED_SURVEILLANCE' THEN 1
        WHEN 'HIGH_SUSPICION_SURVEILLANCE' THEN 2
        WHEN 'INVESTIGATE_INFRASTRUCTURE' THEN 3
        WHEN 'MOBILE_ASSET_INVESTIGATION' THEN 4
        ELSE 5
    END,
    max_device_range_km DESC;

-- Summary statistics
SELECT '=== SURVEILLANCE DETECTION SUMMARY ===' as summary_header;

WITH summary_stats AS (
    SELECT
        threat_assessment,
        COUNT(*) as device_count,
        AVG(max_inter_location_distance/1000.0) as avg_range_km,
        MAX(max_inter_location_distance/1000.0) as max_range_km
    FROM final_threat_assessment
    WHERE threat_assessment != 'NORMAL_ACTIVITY'
    GROUP BY threat_assessment
)
SELECT
    threat_assessment,
    device_count,
    ROUND(avg_range_km::numeric, 2) as avg_range_km,
    ROUND(max_range_km::numeric, 2) as max_range_km,
    CASE
        WHEN threat_assessment = 'CONFIRMED_SURVEILLANCE' THEN '🚨 IMMEDIATE THREAT'
        WHEN threat_assessment = 'HIGH_SUSPICION_SURVEILLANCE' THEN '⚠️  HIGH PRIORITY'
        WHEN threat_assessment = 'INVESTIGATE_INFRASTRUCTURE' THEN '🔍 INVESTIGATE'
        WHEN threat_assessment = 'MOBILE_ASSET_INVESTIGATION' THEN '🚗 MOBILE SURVEILLANCE'
        ELSE '📊 MONITOR'
    END as priority_level
FROM summary_stats
ORDER BY device_count DESC;