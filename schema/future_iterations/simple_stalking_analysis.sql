-- =====================================================
-- Simple Network Stalking Analysis
-- Focus on networks appearing at home AND distant locations
-- =====================================================

-- Simple query to find networks appearing at both home and distant locations
WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
),
network_analysis AS (
    SELECT
        n.bssid,
        n.ssid,
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326) as network_location,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 as distance_from_home_km,
        n.lasttime
    FROM app.networks_legacy n
    CROSS JOIN home_location h
    WHERE n.lastlat IS NOT NULL
        AND n.lastlon IS NOT NULL
        AND n.bssid IS NOT NULL
        AND n.lastlat BETWEEN -90 AND 90
        AND n.lastlon BETWEEN -180 AND 180
),
stalking_candidates AS (
    SELECT
        bssid,
        ssid,
        COUNT(*) as total_sightings,
        MIN(distance_from_home_km) as min_distance_km,
        MAX(distance_from_home_km) as max_distance_km,
        COUNT(*) FILTER (WHERE distance_from_home_km <= 0.5) as home_sightings,
        COUNT(*) FILTER (WHERE distance_from_home_km > 2.0) as distant_sightings,
        ARRAY_AGG(DISTINCT ROUND(distance_from_home_km::numeric, 1) ORDER BY ROUND(distance_from_home_km::numeric, 1) DESC) as distances
    FROM network_analysis
    GROUP BY bssid, ssid
    HAVING COUNT(*) > 1  -- Multiple sightings
)
SELECT
    '=== INDIVIDUAL NETWORK SIGHTINGS - STALKING ANALYSIS ===' as header;

-- Show critical threats: Networks at home AND distant locations
SELECT
    'CRITICAL STALKING THREATS' as threat_level,
    bssid,
    COALESCE(ssid, '<hidden>') as ssid,
    total_sightings,
    home_sightings,
    distant_sightings,
    max_distance_km,
    CASE
        WHEN home_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 50 THEN 'SAME NETWORK AT HOME AND 50+ KM AWAY'
        WHEN home_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 20 THEN 'SAME NETWORK AT HOME AND 20+ KM AWAY'
        WHEN home_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 10 THEN 'SAME NETWORK AT HOME AND 10+ KM AWAY'
        WHEN home_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 5 THEN 'SAME NETWORK AT HOME AND LOCAL AREA'
        ELSE 'OTHER PATTERN'
    END as threat_description,
    distances as distance_list_km
FROM stalking_candidates
WHERE home_sightings > 0  -- Must be seen at home
    AND distant_sightings > 0  -- And also seen away from home
    AND max_distance_km >= 5.0  -- At least 5km away
ORDER BY max_distance_km DESC, distant_sightings DESC
LIMIT 20;

-- Summary by distance ranges
SELECT
    'SUMMARY BY DISTANCE RANGE' as summary_header,
    CASE
        WHEN max_distance_km >= 100 THEN '100+ km from home'
        WHEN max_distance_km >= 50 THEN '50-100 km from home'
        WHEN max_distance_km >= 20 THEN '20-50 km from home'
        WHEN max_distance_km >= 10 THEN '10-20 km from home'
        WHEN max_distance_km >= 5 THEN '5-10 km from home'
        ELSE 'Under 5 km from home'
    END as distance_range,
    COUNT(*) as networks_in_range,
    AVG(total_sightings)::INTEGER as avg_sightings_per_network
FROM stalking_candidates
WHERE home_sightings > 0 AND distant_sightings > 0
GROUP BY 1
ORDER BY MIN(max_distance_km) DESC;

-- Show a few examples of BSSID sequences (potential BSSID walking)
SELECT
    'POTENTIAL BSSID WALKING PATTERNS' as bssid_walking_header,
    LEFT(bssid, 15) as bssid_prefix,
    COUNT(*) as networks_with_prefix,
    STRING_AGG(RIGHT(bssid, 2), ', ' ORDER BY RIGHT(bssid, 2)) as last_two_digits,
    MAX(max_distance_km) as furthest_distance_km
FROM stalking_candidates
WHERE home_sightings > 0 AND distant_sightings > 0
GROUP BY LEFT(bssid, 15)
HAVING COUNT(*) >= 2  -- Multiple networks with same prefix
ORDER BY COUNT(*) DESC, MAX(max_distance_km) DESC
LIMIT 10;

-- Networks appearing at multiple distant locations (mobile surveillance)
SELECT
    'HIGHLY MOBILE NETWORKS (SURVEILLANCE EQUIPMENT)' as mobile_header,
    bssid,
    COALESCE(ssid, '<hidden>') as ssid,
    total_sightings,
    max_distance_km,
    (max_distance_km - min_distance_km) as mobility_range_km,
    distances as all_distances_km
FROM stalking_candidates
WHERE total_sightings >= 3  -- Multiple sightings
    AND (max_distance_km - min_distance_km) >= 10  -- Travels at least 10km
ORDER BY (max_distance_km - min_distance_km) DESC, max_distance_km DESC
LIMIT 15;