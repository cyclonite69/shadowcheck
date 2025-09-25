-- =====================================================
-- Location Marking System for ShadowCheck
-- Mark home, work, and other significant locations
-- =====================================================

-- Create location markers table
CREATE TABLE IF NOT EXISTS app.location_markers (
    marker_id SERIAL PRIMARY KEY,
    marker_name TEXT NOT NULL,
    marker_type TEXT CHECK (marker_type IN ('home', 'work', 'frequent', 'sensitive', 'safe_zone', 'custom')),
    location_point GEOMETRY(Point, 4326) NOT NULL,
    radius_meters NUMERIC DEFAULT 100,
    privacy_level TEXT DEFAULT 'normal' CHECK (privacy_level IN ('public', 'normal', 'private', 'classified')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_location_markers_point ON app.location_markers USING GIST (location_point);

-- Insert your domicile
INSERT INTO app.location_markers (
    marker_name,
    marker_type,
    location_point,
    radius_meters,
    privacy_level,
    notes
) VALUES (
    'Primary Residence',
    'home',
    ST_SetSRID(ST_MakePoint(-83.6968461, 43.02342188), 4326),
    500,  -- 500m radius around home
    'classified',
    'User domicile - primary surveillance detection reference point'
);

-- Function to check if a point is near a marked location
CREATE OR REPLACE FUNCTION app.get_location_context(
    p_lat NUMERIC,
    p_lon NUMERIC,
    p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    marker_name TEXT,
    marker_type TEXT,
    distance_meters NUMERIC,
    is_within_radius BOOLEAN
) LANGUAGE sql AS $$
    SELECT
        lm.marker_name,
        lm.marker_type,
        ROUND(ST_Distance(
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
            lm.location_point::geography
        ), 2) as distance_meters,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
            lm.location_point::geography
        ) <= lm.radius_meters as is_within_radius
    FROM app.location_markers lm
    WHERE lm.is_active = TRUE
    ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
        lm.location_point::geography
    );
$$;

-- Individual Network Sightings Analysis (focused on observations)
CREATE OR REPLACE FUNCTION app.analyze_network_sightings(
    p_analysis_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    bssid TEXT,
    ssid TEXT,
    total_sightings INTEGER,
    unique_locations INTEGER,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    home_sightings INTEGER,
    away_sightings INTEGER,
    max_distance_from_home_km NUMERIC,
    sighting_pattern TEXT,
    stalking_risk_score NUMERIC
) LANGUAGE plpgsql AS $$
DECLARE
    home_location GEOMETRY;
BEGIN
    -- Get home location
    SELECT location_point INTO home_location
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1;

    RETURN QUERY
    WITH network_sightings AS (
        SELECT
            n.bssid,
            n.ssid,
            l.measurement_time as sighting_time,
            l.location_point as sighting_location,
            ST_Distance(l.location_point::geography, home_location::geography) as distance_from_home_meters
        FROM app.networks_legacy n
        JOIN app.locations_legacy l ON l.id = n.source_id
        WHERE l.measurement_time >= NOW() - (p_analysis_days || ' days')::INTERVAL
            AND l.location_point IS NOT NULL
            AND n.bssid IS NOT NULL
    ),
    sighting_analysis AS (
        SELECT
            ns.bssid,
            ns.ssid,
            COUNT(*) as total_sightings,
            COUNT(DISTINCT ST_SnapToGrid(ns.sighting_location, 0.001)) as unique_locations,
            MIN(ns.sighting_time) as first_seen,
            MAX(ns.sighting_time) as last_seen,
            COUNT(*) FILTER (WHERE ns.distance_from_home_meters <= 500) as home_sightings,
            COUNT(*) FILTER (WHERE ns.distance_from_home_meters > 2000) as away_sightings,
            MAX(ns.distance_from_home_meters / 1000.0) as max_distance_km
        FROM network_sightings ns
        GROUP BY ns.bssid, ns.ssid
    )
    SELECT
        sa.bssid,
        COALESCE(sa.ssid, '') as ssid,
        sa.total_sightings::INTEGER,
        sa.unique_locations::INTEGER,
        sa.first_seen,
        sa.last_seen,
        sa.home_sightings::INTEGER,
        sa.away_sightings::INTEGER,
        ROUND(sa.max_distance_km, 2) as max_distance_from_home_km,
        CASE
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 AND sa.max_distance_km > 10
                THEN 'HOME_AND_DISTANT'
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 AND sa.max_distance_km > 2
                THEN 'HOME_AND_LOCAL'
            WHEN sa.away_sightings > sa.home_sightings AND sa.unique_locations > 3
                THEN 'MOBILE_FREQUENT'
            WHEN sa.home_sightings > 0 AND sa.away_sightings = 0
                THEN 'HOME_ONLY'
            WHEN sa.away_sightings > 0 AND sa.home_sightings = 0
                THEN 'AWAY_ONLY'
            ELSE 'OTHER'
        END as sighting_pattern,
        CASE
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 3 AND sa.max_distance_km > 50 THEN 1.0
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 2 AND sa.max_distance_km > 10 THEN 0.9
            WHEN sa.home_sightings > 0 AND sa.away_sightings >= 1 AND sa.max_distance_km > 5 THEN 0.8
            WHEN sa.unique_locations > 5 AND sa.max_distance_km > 20 THEN 0.7
            WHEN sa.home_sightings > 0 AND sa.away_sightings > 0 THEN 0.6
            ELSE 0.3
        END as stalking_risk_score
    FROM sighting_analysis sa
    WHERE sa.total_sightings >= 2  -- At least 2 sightings to be meaningful
    ORDER BY stalking_risk_score DESC, sa.max_distance_km DESC;
END;
$$;

-- Time-based sighting correlation (when networks appear relative to your movements)
CREATE OR REPLACE FUNCTION app.analyze_temporal_sighting_patterns(
    p_time_window_minutes INTEGER DEFAULT 60,
    p_analysis_days INTEGER DEFAULT 14
)
RETURNS TABLE (
    bssid TEXT,
    ssid TEXT,
    correlation_type TEXT,
    occurrences INTEGER,
    avg_time_offset_minutes NUMERIC,
    locations_involved INTEGER,
    pattern_confidence NUMERIC
) LANGUAGE plpgsql AS $$
DECLARE
    home_location GEOMETRY;
BEGIN
    -- Get home location
    SELECT location_point INTO home_location
    FROM app.location_markers
    WHERE marker_type = 'home'
    LIMIT 1;

    RETURN QUERY
    WITH user_location_changes AS (
        -- Detect when user moves away from or returns to home
        SELECT
            measurement_time,
            location_point,
            CASE
                WHEN ST_Distance(location_point::geography, home_location::geography) <= 500 THEN 'AT_HOME'
                ELSE 'AWAY_FROM_HOME'
            END as location_context,
            LAG(CASE
                WHEN ST_Distance(location_point::geography, home_location::geography) <= 500 THEN 'AT_HOME'
                ELSE 'AWAY_FROM_HOME'
            END) OVER (ORDER BY measurement_time) as previous_context
        FROM app.locations_legacy
        WHERE measurement_time >= NOW() - (p_analysis_days || ' days')::INTERVAL
            AND location_point IS NOT NULL
    ),
    context_changes AS (
        SELECT
            measurement_time as change_time,
            location_point as change_location,
            CASE
                WHEN location_context = 'AT_HOME' AND previous_context = 'AWAY_FROM_HOME' THEN 'ARRIVING_HOME'
                WHEN location_context = 'AWAY_FROM_HOME' AND previous_context = 'AT_HOME' THEN 'LEAVING_HOME'
                ELSE NULL
            END as change_type
        FROM user_location_changes
        WHERE location_context != previous_context
    ),
    network_sightings_near_changes AS (
        SELECT
            n.bssid,
            n.ssid,
            l.measurement_time as sighting_time,
            cc.change_time,
            cc.change_type,
            EXTRACT(EPOCH FROM (l.measurement_time - cc.change_time)) / 60 as time_offset_minutes
        FROM context_changes cc
        JOIN app.locations_legacy l ON
            l.measurement_time BETWEEN cc.change_time - (p_time_window_minutes || ' minutes')::INTERVAL
                                  AND cc.change_time + (p_time_window_minutes || ' minutes')::INTERVAL
        JOIN app.networks_legacy n ON l.id = n.source_id
        WHERE cc.change_type IS NOT NULL
            AND ST_Distance(l.location_point::geography, cc.change_location::geography) <= 2000 -- Within 2km
            AND n.bssid IS NOT NULL
    )
    SELECT
        nsnc.bssid,
        COALESCE(nsnc.ssid, '') as ssid,
        CASE
            WHEN nsnc.change_type = 'ARRIVING_HOME' AND AVG(nsnc.time_offset_minutes) < 0 THEN 'APPEARS_BEFORE_ARRIVING_HOME'
            WHEN nsnc.change_type = 'ARRIVING_HOME' AND AVG(nsnc.time_offset_minutes) > 0 THEN 'APPEARS_AFTER_ARRIVING_HOME'
            WHEN nsnc.change_type = 'LEAVING_HOME' AND AVG(nsnc.time_offset_minutes) < 0 THEN 'APPEARS_BEFORE_LEAVING_HOME'
            WHEN nsnc.change_type = 'LEAVING_HOME' AND AVG(nsnc.time_offset_minutes) > 0 THEN 'APPEARS_AFTER_LEAVING_HOME'
            ELSE 'UNCLEAR_PATTERN'
        END as correlation_type,
        COUNT(*)::INTEGER as occurrences,
        ROUND(AVG(ABS(nsnc.time_offset_minutes)), 2) as avg_time_offset_minutes,
        COUNT(DISTINCT nsnc.change_time)::INTEGER as locations_involved,
        CASE
            WHEN COUNT(*) >= 5 AND nsnc.change_type = 'ARRIVING_HOME' AND AVG(nsnc.time_offset_minutes) < -10 THEN 0.95
            WHEN COUNT(*) >= 3 AND ABS(AVG(nsnc.time_offset_minutes)) <= 15 THEN 0.85
            WHEN COUNT(*) >= 3 THEN 0.7
            WHEN COUNT(*) >= 2 THEN 0.6
            ELSE 0.4
        END as pattern_confidence
    FROM network_sightings_near_changes nsnc
    GROUP BY nsnc.bssid, nsnc.ssid, nsnc.change_type
    HAVING COUNT(*) >= 2  -- At least 2 correlated sightings
    ORDER BY pattern_confidence DESC, occurrences DESC;
END;
$$;

-- Execute analysis
SELECT '=== LOCATION MARKING SYSTEM INITIALIZED ===' as status;

SELECT 'Domicile marked at coordinates: ' || ST_AsText(location_point) as home_location
FROM app.location_markers
WHERE marker_type = 'home';

SELECT '=== NETWORK SIGHTINGS ANALYSIS (Individual Observations) ===' as sightings_header;

-- Show high-risk sightings
SELECT
    bssid,
    ssid,
    total_sightings,
    home_sightings,
    away_sightings,
    max_distance_from_home_km,
    sighting_pattern,
    ROUND(stalking_risk_score, 3) as risk_score
FROM app.analyze_network_sightings(30)
WHERE stalking_risk_score >= 0.7
ORDER BY stalking_risk_score DESC, max_distance_from_home_km DESC
LIMIT 15;

SELECT '=== TEMPORAL SIGHTING PATTERNS (Timing Analysis) ===' as temporal_header;

-- Show temporal correlations
SELECT
    bssid,
    ssid,
    correlation_type,
    occurrences,
    avg_time_offset_minutes,
    ROUND(pattern_confidence, 3) as confidence
FROM app.analyze_temporal_sighting_patterns(60, 14)
WHERE pattern_confidence >= 0.7
ORDER BY pattern_confidence DESC, occurrences DESC
LIMIT 10;

COMMENT ON TABLE app.location_markers IS 'User-defined significant locations (home, work, etc.) for surveillance detection reference';
COMMENT ON FUNCTION app.analyze_network_sightings IS 'Analyzes individual network sightings/observations for stalking patterns based on home location';
COMMENT ON FUNCTION app.analyze_temporal_sighting_patterns IS 'Detects networks that appear in correlation with user movement patterns (arriving/leaving home)';