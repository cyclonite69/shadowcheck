-- =====================================================
-- Individual Network Sightings Analysis (Corrected)
-- Focus on temporal observations at specific locations
-- =====================================================

-- Corrected network sightings analysis using proper column names
CREATE OR REPLACE FUNCTION app.analyze_individual_network_sightings(
    p_analysis_days INTEGER DEFAULT 30,
    p_home_radius_meters NUMERIC DEFAULT 500
)
RETURNS TABLE (
    bssid TEXT,
    ssid TEXT,
    total_sightings BIGINT,
    unique_locations BIGINT,
    first_seen_timestamp BIGINT,
    last_seen_timestamp BIGINT,
    home_sightings BIGINT,
    away_sightings BIGINT,
    max_distance_from_home_km NUMERIC,
    sighting_pattern TEXT,
    stalking_risk_score NUMERIC,
    location_details TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    home_location GEOMETRY;
    analysis_start_time BIGINT;
BEGIN
    -- Get home location
    SELECT location_point INTO home_location
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1;

    -- Convert analysis window to Unix timestamp (milliseconds)
    analysis_start_time := EXTRACT(EPOCH FROM (NOW() - (p_analysis_days || ' days')::INTERVAL)) * 1000;

    RETURN QUERY
    WITH sightings_with_location AS (
        SELECT
            n.bssid,
            n.ssid,
            n.lasttime as observation_time,
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326) as observation_point,
            ST_Distance(
                ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
                home_location::geography
            ) as distance_from_home_meters
        FROM app.networks_legacy n
        WHERE n.lasttime >= analysis_start_time
            AND n.lastlat IS NOT NULL
            AND n.lastlon IS NOT NULL
            AND n.bssid IS NOT NULL
            AND n.lastlat BETWEEN -90 AND 90  -- Valid latitude
            AND n.lastlon BETWEEN -180 AND 180  -- Valid longitude
    ),
    sighting_analysis AS (
        SELECT
            swl.bssid,
            swl.ssid,
            COUNT(*) as total_sightings,
            COUNT(DISTINCT ST_SnapToGrid(swl.observation_point, 0.001)) as unique_locations,  -- ~100m grid
            MIN(swl.observation_time) as first_seen,
            MAX(swl.observation_time) as last_seen,
            COUNT(*) FILTER (WHERE swl.distance_from_home_meters <= p_home_radius_meters) as home_sightings,
            COUNT(*) FILTER (WHERE swl.distance_from_home_meters > 2000) as away_sightings,  -- >2km from home
            MAX(swl.distance_from_home_meters / 1000.0) as max_distance_km,
            STRING_AGG(
                DISTINCT
                ROUND(ST_Y(swl.observation_point)::numeric, 4) || ',' ||
                ROUND(ST_X(swl.observation_point)::numeric, 4) ||
                ' (' || ROUND((swl.distance_from_home_meters/1000.0)::numeric, 1) || 'km)',
                ' | '
                ORDER BY swl.distance_from_home_meters DESC
            ) as location_summary
        FROM sightings_with_location swl
        GROUP BY swl.bssid, swl.ssid
    )
    SELECT
        sa.bssid,
        COALESCE(sa.ssid, '') as ssid,
        sa.total_sightings,
        sa.unique_locations,
        sa.first_seen,
        sa.last_seen,
        sa.home_sightings,
        sa.away_sightings,
        ROUND(sa.max_distance_km::numeric, 2) as max_distance_from_home_km,
        CASE
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 AND sa.max_distance_km > 50
                THEN 'CRITICAL_HOME_AND_DISTANT'
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 AND sa.max_distance_km > 10
                THEN 'HIGH_HOME_AND_DISTANT'
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 AND sa.max_distance_km > 2
                THEN 'MEDIUM_HOME_AND_LOCAL'
            WHEN sa.unique_locations > 5 AND sa.max_distance_km > 20
                THEN 'MOBILE_SURVEILLANCE'
            WHEN sa.home_sightings > 0 AND sa.away_sightings = 0
                THEN 'HOME_ONLY'
            WHEN sa.away_sightings > 0 AND sa.home_sightings = 0
                THEN 'AWAY_ONLY'
            ELSE 'OTHER'
        END as sighting_pattern,
        CASE
            -- Critical: Same network at home and 50+ km away
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 50 THEN 1.0
            -- High: Same network at home and 10+ km away, multiple away sightings
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 2 AND sa.max_distance_km > 10 THEN 0.95
            -- High: Same network at home and distant, single away sighting
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 10 THEN 0.9
            -- Medium: Home and local area sightings
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 5 THEN 0.8
            -- Medium: Highly mobile network (potential surveillance equipment)
            WHEN sa.unique_locations > 8 AND sa.max_distance_km > 30 THEN 0.75
            -- Low-Medium: Home and nearby sightings
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 THEN 0.6
            -- Low: Multiple locations but reasonable for legitimate mobile device
            WHEN sa.unique_locations > 3 THEN 0.4
            ELSE 0.2
        END as stalking_risk_score,
        LEFT(sa.location_summary, 200) as location_details  -- Truncate for readability
    FROM sighting_analysis sa
    WHERE sa.total_sightings >= 1  -- Show all sightings
    ORDER BY
        CASE
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 50 THEN 1.0
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 2 AND sa.max_distance_km > 10 THEN 0.95
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 10 THEN 0.9
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 5 THEN 0.8
            WHEN sa.unique_locations > 8 AND sa.max_distance_km > 30 THEN 0.75
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 THEN 0.6
            WHEN sa.unique_locations > 3 THEN 0.4
            ELSE 0.2
        END DESC,
        sa.max_distance_km DESC;
END;
$$;

-- Quick analysis function for immediate threats
CREATE OR REPLACE FUNCTION app.get_stalking_threat_summary()
RETURNS TABLE (
    threat_level TEXT,
    network_count BIGINT,
    max_distance_km NUMERIC,
    description TEXT
) LANGUAGE sql AS $$
    SELECT
        'CRITICAL - Same network at home and 50+ km away' as threat_level,
        COUNT(*) as network_count,
        MAX(max_distance_from_home_km) as max_distance_km,
        'Networks appearing at residence and very distant locations - possible surveillance' as description
    FROM app.analyze_individual_network_sightings(30, 500)
    WHERE stalking_risk_score >= 1.0

    UNION ALL

    SELECT
        'HIGH - Same network at home and 10+ km away',
        COUNT(*),
        MAX(max_distance_from_home_km),
        'Networks at residence and distant locations - surveillance concern'
    FROM app.analyze_individual_network_sightings(30, 500)
    WHERE stalking_risk_score BETWEEN 0.9 AND 0.99

    UNION ALL

    SELECT
        'MEDIUM - Local area correlation',
        COUNT(*),
        MAX(max_distance_from_home_km),
        'Networks appearing at home and nearby locations'
    FROM app.analyze_individual_network_sightings(30, 500)
    WHERE stalking_risk_score BETWEEN 0.6 AND 0.89;
$$;

-- Execute the analysis
SELECT '=== DOMICILE-BASED NETWORK SIGHTINGS ANALYSIS ===' as header;

-- Show threat summary first
SELECT * FROM app.get_stalking_threat_summary()
WHERE network_count > 0
ORDER BY
    CASE threat_level
        WHEN 'CRITICAL - Same network at home and 50+ km away' THEN 1
        WHEN 'HIGH - Same network at home and 10+ km away' THEN 2
        WHEN 'MEDIUM - Local area correlation' THEN 3
    END;

SELECT '=== TOP INDIVIDUAL NETWORK STALKING THREATS ===' as threats_header;

-- Show top individual network threats
SELECT
    bssid,
    ssid,
    total_sightings,
    home_sightings,
    away_sightings,
    max_distance_from_home_km,
    sighting_pattern,
    ROUND(stalking_risk_score::numeric, 3) as risk_score,
    location_details
FROM app.analyze_individual_network_sightings(30, 500)
WHERE stalking_risk_score >= 0.6
ORDER BY stalking_risk_score DESC, max_distance_from_home_km DESC
LIMIT 20;

SELECT '=== DISTANCE-BASED THREAT ANALYSIS ===' as distance_header;

-- Show networks by distance from home
SELECT
    CASE
        WHEN max_distance_from_home_km >= 100 THEN '100+ km'
        WHEN max_distance_from_home_km >= 50 THEN '50-100 km'
        WHEN max_distance_from_home_km >= 20 THEN '20-50 km'
        WHEN max_distance_from_home_km >= 10 THEN '10-20 km'
        WHEN max_distance_from_home_km >= 5 THEN '5-10 km'
        ELSE '0-5 km'
    END as distance_range,
    COUNT(*) as network_count,
    COUNT(*) FILTER (WHERE home_sightings > 0) as networks_also_at_home
FROM app.analyze_individual_network_sightings(30, 500)
GROUP BY 1
ORDER BY MIN(max_distance_from_home_km) DESC;

COMMENT ON FUNCTION app.analyze_individual_network_sightings IS 'Analyzes individual network sightings/observations relative to user domicile for stalking detection';
COMMENT ON FUNCTION app.get_stalking_threat_summary IS 'Provides summary of stalking threats categorized by risk level';