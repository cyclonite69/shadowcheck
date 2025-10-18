-- =====================================================
-- Surveillance GeoJSON Export Queries
-- Generate comprehensive intel on 90km surveillance threats
-- =====================================================

-- Query 1: Core surveillance networks with full spatial data
SELECT '=== CORE SURVEILLANCE NETWORKS - GEOJSON READY ===' as header;

WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
),
surveillance_networks AS (
    SELECT DISTINCT n.bssid
    FROM app.networks_legacy n
    CROSS JOIN home_location h
    WHERE n.bssid IN (
        'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
        'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
        'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
    )
)
SELECT
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    n.lastlat as latitude,
    n.lastlon as longitude,
    n.lasttime,
    TO_TIMESTAMP(n.lasttime/1000) as observation_timestamp,
    n.source_id,
    n.unified_id,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0 as distance_from_home_km,
    ST_Azimuth(
        h.home_point,
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)
    ) * 180 / PI() as bearing_from_home_degrees,
    'surveillance_threat' as marker_type,
    CASE
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 <= 1.0 THEN 'home_proximity'
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 >= 80.0 THEN 'distant_surveillance_post'
        ELSE 'intermediate_position'
    END as threat_classification
FROM app.networks_legacy n
CROSS JOIN home_location h
INNER JOIN surveillance_networks s ON n.bssid = s.bssid
WHERE n.lastlat IS NOT NULL AND n.lastlon IS NOT NULL
ORDER BY n.bssid, n.lasttime;

-- Query 2: All related networks in proximity to surveillance locations
SELECT '=== RELATED NETWORKS AT SURVEILLANCE LOCATIONS ===' as related_header;

WITH surveillance_locations AS (
    SELECT DISTINCT
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326) as surveillance_point,
        n.lastlat,
        n.lastlon
    FROM app.networks_legacy n
    WHERE n.bssid IN (
        'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
        'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
        'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
    )
    AND n.lastlat IS NOT NULL AND n.lastlon IS NOT NULL
)
SELECT
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    n.lastlat as latitude,
    n.lastlon as longitude,
    n.lasttime,
    TO_TIMESTAMP(n.lasttime/1000) as observation_timestamp,
    n.source_id,
    n.unified_id,
    CASE
        WHEN n.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        ) THEN 'primary_surveillance_threat'
        ELSE 'co_located_network'
    END as network_classification,
    MIN(ST_Distance(
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
        sl.surveillance_point::geography
    )) / 1000.0 as distance_to_nearest_surveillance_km
FROM app.networks_legacy n
CROSS JOIN surveillance_locations sl
WHERE ST_Distance(
    ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
    sl.surveillance_point::geography
) <= 5000  -- Within 5km of any surveillance location
AND n.lastlat IS NOT NULL AND n.lastlon IS NOT NULL
GROUP BY n.bssid, n.ssid, n.lastlat, n.lastlon, n.lasttime, n.source_id, n.unified_id
ORDER BY network_classification, distance_to_nearest_surveillance_km;

-- Query 3: Temporal analysis - when were these networks observed?
SELECT '=== TEMPORAL INTELLIGENCE - SURVEILLANCE TIMELINE ===' as temporal_header;

WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
)
SELECT
    n.bssid,
    n.lasttime,
    TO_TIMESTAMP(n.lasttime/1000) as observation_timestamp,
    DATE_TRUNC('day', TO_TIMESTAMP(n.lasttime/1000)) as observation_date,
    EXTRACT(hour FROM TO_TIMESTAMP(n.lasttime/1000)) as observation_hour,
    n.lastlat as latitude,
    n.lastlon as longitude,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0 as distance_from_home_km,
    n.source_id,
    CASE
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 <= 1.0 THEN 'near_target_residence'
        ELSE 'distant_surveillance_position'
    END as position_type
FROM app.networks_legacy n
CROSS JOIN home_location h
WHERE n.bssid IN (
    'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
    'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
    'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
)
AND n.lastlat IS NOT NULL AND n.lastlon IS NOT NULL
ORDER BY n.bssid, n.lasttime;

-- Query 4: Manufacturer intelligence via OUI lookup
SELECT '=== MANUFACTURER INTELLIGENCE - DEVICE IDENTIFICATION ===' as manufacturer_header;

SELECT
    n.bssid,
    UPPER(LEFT(n.bssid, 8)) as oui,
    rm.manufacturer_name,
    rm.manufacturer_type,
    COUNT(*) as observation_count,
    MIN(n.lastlat) as min_lat,
    MAX(n.lastlat) as max_lat,
    MIN(n.lastlon) as min_lon,
    MAX(n.lastlon) as max_lon,
    MIN(TO_TIMESTAMP(n.lasttime/1000)) as first_observed,
    MAX(TO_TIMESTAMP(n.lasttime/1000)) as last_observed
FROM app.networks_legacy n
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui
WHERE n.bssid IN (
    'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
    'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
    'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
)
GROUP BY n.bssid, rm.manufacturer_name, rm.manufacturer_type
ORDER BY n.bssid;

-- Query 5: Home location reference point
SELECT '=== HOME REFERENCE POINT ===' as home_header;

SELECT
    'home_location' as marker_type,
    ST_Y(location_point) as latitude,
    ST_X(location_point) as longitude,
    marker_name,
    radius_meters,
    'target_residence' as classification
FROM app.location_markers
WHERE marker_type = 'home';

-- Query 6: All data unified for maximum join potential
SELECT '=== UNIFIED SURVEILLANCE INTELLIGENCE DATASET ===' as unified_header;

WITH home_location AS (
    SELECT location_point as home_point
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1
)
SELECT
    -- Network identifiers
    n.bssid,
    COALESCE(n.ssid, '') as ssid,
    UPPER(LEFT(n.bssid, 8)) as oui,

    -- Spatial data
    n.lastlat as latitude,
    n.lastlon as longitude,
    ST_Distance(
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
        h.home_point::geography
    ) / 1000.0 as distance_from_home_km,
    ST_Azimuth(
        h.home_point,
        ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)
    ) * 180 / PI() as bearing_from_home_degrees,

    -- Temporal data
    n.lasttime as unix_timestamp_ms,
    TO_TIMESTAMP(n.lasttime/1000) as observation_timestamp,
    DATE_TRUNC('day', TO_TIMESTAMP(n.lasttime/1000)) as observation_date,
    EXTRACT(hour FROM TO_TIMESTAMP(n.lasttime/1000)) as observation_hour,
    EXTRACT(dow FROM TO_TIMESTAMP(n.lasttime/1000)) as day_of_week,

    -- Data source
    n.source_id,
    n.unified_id,

    -- Manufacturer intelligence
    rm.manufacturer_name,
    rm.manufacturer_type,

    -- Threat classification
    CASE
        WHEN n.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        ) THEN 'confirmed_surveillance_threat'
        ELSE 'related_network'
    END as threat_status,

    CASE
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 <= 1.0 THEN 'target_proximity'
        WHEN ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            h.home_point::geography
        ) / 1000.0 >= 80.0 THEN 'surveillance_post'
        ELSE 'intermediate_zone'
    END as operational_zone

FROM app.networks_legacy n
CROSS JOIN home_location h
LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui
WHERE (
    -- Include all surveillance networks
    n.bssid IN (
        'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
        'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
        'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
    )
    OR
    -- Include networks within 2km of surveillance locations
    EXISTS (
        SELECT 1 FROM app.networks_legacy surveillance
        WHERE surveillance.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        )
        AND ST_Distance(
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(surveillance.lastlon, surveillance.lastlat), 4326)::geography
        ) <= 2000
        AND surveillance.lastlat IS NOT NULL AND surveillance.lastlon IS NOT NULL
    )
)
AND n.lastlat IS NOT NULL AND n.lastlon IS NOT NULL
ORDER BY threat_status DESC, distance_from_home_km DESC, n.bssid, n.lasttime;