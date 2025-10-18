-- =====================================================
-- SIMPLE PRECISE SURVEILLANCE DETECTION
-- Focus: >200m range impossible for single WiFi device
-- =====================================================

WITH home_location AS (
    SELECT location_point as home_point FROM app.location_markers WHERE marker_type = 'home' LIMIT 1
),
device_locations AS (
    SELECT
        n.bssid,
        COALESCE(n.ssid, '<hidden>') as ssid,
        COUNT(DISTINCT l.lat || ',' || l.lon) as location_count,

        -- Distance from each other (key metric for WiFi impossibility)
        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(l2.lon, l2.lat), 4326)::geography
        )) as max_separation_meters,

        -- Distance from home
        MIN(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        )) / 1000.0 as closest_to_home_km,

        MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            h.home_point::geography
        )) / 1000.0 as furthest_from_home_km

    FROM app.networks_legacy n
    INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
    INNER JOIN app.locations_legacy l2 ON EXISTS (
        SELECT 1 FROM app.networks_legacy n2
        INNER JOIN app.locations_legacy l3 ON n2.unified_id = l3.unified_id
        WHERE n2.bssid = n.bssid AND l3.unified_id != l.unified_id
    )
    CROSS JOIN home_location h
    WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL AND l.lat != 0 AND l.lon != 0
    AND l2.lat IS NOT NULL AND l2.lon IS NOT NULL AND l2.lat != 0 AND l2.lon != 0
    GROUP BY n.bssid, n.ssid
    HAVING COUNT(DISTINCT l.lat || ',' || l.lon) >= 2
)
SELECT
    bssid,
    ssid,
    location_count,
    ROUND(max_separation_meters::numeric / 1000.0, 2) as device_range_km,
    ROUND(closest_to_home_km::numeric, 3) as closest_km,
    ROUND(furthest_from_home_km::numeric, 3) as furthest_km,

    -- Classification based on your 200m threshold
    CASE
        WHEN max_separation_meters > 80000 THEN 'IMPOSSIBLE_SURVEILLANCE' -- >80km = definitely surveillance
        WHEN max_separation_meters > 50000 THEN 'EXTREME_SURVEILLANCE'    -- >50km = very suspicious
        WHEN max_separation_meters > 10000 THEN 'VERY_SUSPICIOUS'         -- >10km = suspicious
        WHEN max_separation_meters > 1000 THEN 'SUSPICIOUS'               -- >1km = possible surveillance
        WHEN max_separation_meters > 200 THEN 'INVESTIGATE'               -- >200m = your threshold
        ELSE 'NORMAL_WIFI_RANGE'
    END as threat_level,

    -- Network type
    CASE
        WHEN ssid ~* '(MSUnet|eduroam|university)' THEN 'University'
        WHEN ssid ~* '(fbi|cia|dea|doj|dod)' THEN 'Federal_Agency'
        WHEN ssid ~* '(porsche|bmw|ford|chevy)' THEN 'Vehicle'
        WHEN ssid = '<hidden>' THEN 'Hidden'
        ELSE 'Unknown'
    END as network_type

FROM device_locations
WHERE max_separation_meters > 200  -- Your 200m threshold
ORDER BY max_separation_meters DESC
LIMIT 50;