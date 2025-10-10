-- =====================================================
-- Data Quality Audit for Surveillance Detection
-- Debug the 13K networks at 9497km issue
-- =====================================================

SELECT '=== DATA QUALITY AUDIT ===' as audit_header;

-- 1. Check coordinate ranges and obvious GPS errors
SELECT
    'GPS COORDINATE ANALYSIS' as check_type,
    COUNT(*) as total_networks,
    MIN(lastlat) as min_latitude,
    MAX(lastlat) as max_latitude,
    MIN(lastlon) as min_longitude,
    MAX(lastlon) as max_longitude,
    COUNT(*) FILTER (WHERE lastlat = 0 AND lastlon = 0) as zero_coordinates,
    COUNT(*) FILTER (WHERE ABS(lastlat) > 90 OR ABS(lastlon) > 180) as invalid_coordinates
FROM app.networks_legacy;

-- 2. Check the exact coordinates that are 9497km away
SELECT
    'DISTANT COORDINATES ANALYSIS' as check_type,
    ROUND(lastlat::numeric, 6) as latitude,
    ROUND(lastlon::numeric, 6) as longitude,
    COUNT(*) as networks_at_location,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
        (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
    ) / 1000.0 as distance_km
FROM app.networks_legacy
WHERE ST_Distance(
    ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
    (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
) / 1000.0 > 1000  -- More than 1000km away
GROUP BY lastlat, lastlon
ORDER BY distance_km DESC
LIMIT 10;

-- 3. Check realistic distance distribution
SELECT
    'DISTANCE DISTRIBUTION' as analysis_type,
    CASE
        WHEN distance_km < 1 THEN 'Under 1km (Local)'
        WHEN distance_km < 5 THEN '1-5km (Neighborhood)'
        WHEN distance_km < 20 THEN '5-20km (City/Suburban)'
        WHEN distance_km < 100 THEN '20-100km (Regional)'
        WHEN distance_km < 500 THEN '100-500km (State/Province)'
        WHEN distance_km < 2000 THEN '500-2000km (Multi-State)'
        ELSE '2000+ km (Impossible WiFi)'
    END as distance_range,
    COUNT(*) as network_count,
    ROUND(AVG(distance_km)::numeric, 1) as avg_distance_km
FROM (
    SELECT
        ST_Distance(
            ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0 as distance_km
    FROM app.networks_legacy
    WHERE lastlat IS NOT NULL AND lastlon IS NOT NULL
) distances
GROUP BY 1
ORDER BY MIN(distance_km);

-- 4. Check timestamp distribution for data import patterns
SELECT
    'TIMESTAMP ANALYSIS' as check_type,
    CASE
        WHEN lasttime = 0 THEN 'Zero timestamp'
        WHEN lasttime < 946684800000 THEN 'Before 2000 (Invalid)'
        WHEN lasttime < 1577836800000 THEN '2000-2020'
        WHEN lasttime < 1640995200000 THEN '2020-2022'
        WHEN lasttime < 1672531200000 THEN '2022-2023'
        WHEN lasttime < 1704067200000 THEN '2023-2024'
        ELSE '2024+'
    END as time_period,
    COUNT(*) as network_count,
    TO_TIMESTAMP(MIN(lasttime)/1000) as earliest_in_period,
    TO_TIMESTAMP(MAX(lasttime)/1000) as latest_in_period
FROM app.networks_legacy
GROUP BY 1
ORDER BY MIN(lasttime);

-- 5. Check for data source patterns
SELECT
    'DATA SOURCE ANALYSIS' as check_type,
    source_id,
    COUNT(*) as networks_from_source,
    COUNT(DISTINCT lastlat || ',' || lastlon) as unique_locations,
    MIN(TO_TIMESTAMP(lasttime/1000)) as earliest_timestamp,
    MAX(TO_TIMESTAMP(lasttime/1000)) as latest_timestamp,
    AVG(ST_Distance(
        ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
        (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
    ) / 1000.0) as avg_distance_from_home_km
FROM app.networks_legacy
WHERE lastlat IS NOT NULL AND lastlon IS NOT NULL
GROUP BY source_id
ORDER BY networks_from_source DESC
LIMIT 10;

-- 6. Sample the actual distant networks for manual inspection
SELECT
    'SAMPLE DISTANT NETWORKS' as sample_type,
    bssid,
    ssid,
    ROUND(lastlat::numeric, 6) as lat,
    ROUND(lastlon::numeric, 6) as lon,
    TO_TIMESTAMP(lasttime/1000) as timestamp,
    source_id,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
        (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
    ) / 1000.0 as distance_km
FROM app.networks_legacy
WHERE ST_Distance(
    ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
    (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
) / 1000.0 > 1000
ORDER BY RANDOM()
LIMIT 15;

-- 7. Refined realistic stalking analysis (reasonable distances only)
SELECT '=== REFINED STALKING ANALYSIS (REALISTIC DISTANCES) ===' as refined_header;

WITH realistic_networks AS (
    SELECT
        bssid,
        ssid,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0 as distance_km,
        TO_TIMESTAMP(lasttime/1000) as observation_time
    FROM app.networks_legacy
    WHERE lastlat IS NOT NULL
        AND lastlon IS NOT NULL
        AND bssid IS NOT NULL
        AND ST_Distance(
            ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
            (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home')
        ) / 1000.0 <= 200  -- Realistic maximum distance for mobile surveillance
),
stalking_analysis AS (
    SELECT
        bssid,
        ssid,
        COUNT(*) as total_sightings,
        MIN(distance_km) as min_distance_km,
        MAX(distance_km) as max_distance_km,
        COUNT(*) FILTER (WHERE distance_km <= 1.0) as very_close_sightings,
        COUNT(*) FILTER (WHERE distance_km <= 5.0) as local_sightings,
        COUNT(*) FILTER (WHERE distance_km > 20.0) as distant_sightings,
        MIN(observation_time) as first_seen,
        MAX(observation_time) as last_seen
    FROM realistic_networks
    GROUP BY bssid, ssid
    HAVING COUNT(*) >= 2  -- Multiple sightings required
)
SELECT
    bssid,
    COALESCE(ssid, '<hidden>') as network_name,
    total_sightings,
    very_close_sightings as home_area,
    local_sightings as local_area,
    distant_sightings,
    ROUND(min_distance_km::numeric, 2) as min_dist_km,
    ROUND(max_distance_km::numeric, 2) as max_dist_km,
    CASE
        WHEN very_close_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 50
            THEN 'HIGH - Home + 50km+'
        WHEN very_close_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 20
            THEN 'MEDIUM - Home + 20km+'
        WHEN local_sightings > 0 AND distant_sightings > 0 AND max_distance_km > 10
            THEN 'LOW - Local + 10km+'
        ELSE 'NORMAL - Limited mobility'
    END as threat_level
FROM stalking_analysis
WHERE (very_close_sightings > 0 AND distant_sightings > 0)  -- Must be seen both close to home AND far away
    OR (max_distance_km - min_distance_km > 30)  -- Or travels more than 30km
ORDER BY max_distance_km DESC, total_sightings DESC
LIMIT 20;