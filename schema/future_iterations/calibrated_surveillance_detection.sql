-- =====================================================
-- Calibrated Surveillance Detection System
-- Clean data analysis excluding GPS artifacts
-- =====================================================

-- Update the surveillance detection function with data quality filters
CREATE OR REPLACE FUNCTION app.detect_calibrated_stalking_networks(
    p_analysis_days INTEGER DEFAULT 30,
    p_home_radius_km NUMERIC DEFAULT 1.0,
    p_suspicious_distance_km NUMERIC DEFAULT 20.0
)
RETURNS TABLE (
    bssid TEXT,
    ssid TEXT,
    total_sightings BIGINT,
    home_area_sightings BIGINT,
    distant_sightings BIGINT,
    min_distance_km NUMERIC,
    max_distance_km NUMERIC,
    mobility_range_km NUMERIC,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    stalking_risk_score NUMERIC,
    threat_assessment TEXT,
    data_quality_flags TEXT[]
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

    -- Convert analysis window to timestamp
    analysis_start_time := EXTRACT(EPOCH FROM (NOW() - (p_analysis_days || ' days')::INTERVAL)) * 1000;

    RETURN QUERY
    WITH clean_sightings AS (
        SELECT
            n.bssid,
            n.ssid,
            ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326) as location,
            ST_Distance(
                ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
                home_location::geography
            ) / 1000.0 as distance_km,
            n.lasttime,
            TO_TIMESTAMP(n.lasttime / 1000) as timestamp,
            n.source_id,
            ARRAY[]::TEXT[] as quality_flags
        FROM app.networks_legacy n
        WHERE n.lastlat IS NOT NULL
            AND n.lastlon IS NOT NULL
            AND n.bssid IS NOT NULL
            AND NOT (n.lastlat = 0 AND n.lastlon = 0)  -- Exclude GPS artifacts
            AND n.lasttime >= analysis_start_time
            AND n.lasttime > 946684800000  -- After year 2000
            AND ABS(n.lastlat) <= 90
            AND ABS(n.lastlon) <= 180
            AND ST_Distance(
                ST_SetSRID(ST_MakePoint(n.lastlon, n.lastlat), 4326)::geography,
                home_location::geography
            ) / 1000.0 <= 500  -- Maximum realistic range for surveillance
    ),
    mobility_analysis AS (
        SELECT
            cs.bssid,
            cs.ssid,
            COUNT(*) as total_sightings,
            MIN(cs.distance_km) as min_distance_km,
            MAX(cs.distance_km) as max_distance_km,
            COUNT(*) FILTER (WHERE cs.distance_km <= p_home_radius_km) as home_area_sightings,
            COUNT(*) FILTER (WHERE cs.distance_km >= p_suspicious_distance_km) as distant_sightings,
            (MAX(cs.distance_km) - MIN(cs.distance_km)) as mobility_range_km,
            MIN(cs.timestamp) as first_seen,
            MAX(cs.timestamp) as last_seen,
            ARRAY_AGG(DISTINCT cs.source_id::TEXT) as sources,
            -- Quality flags
            ARRAY_REMOVE(ARRAY[
                CASE WHEN COUNT(DISTINCT cs.source_id) > 1 THEN 'multiple_sources' END,
                CASE WHEN MAX(cs.distance_km) > 200 THEN 'extreme_distance' END,
                CASE WHEN COUNT(*) = 1 THEN 'single_sighting' END
            ], NULL) as data_quality_flags
        FROM clean_sightings cs
        GROUP BY cs.bssid, cs.ssid
        HAVING COUNT(*) >= 1  -- Include single sightings for analysis
    )
    SELECT
        ma.bssid,
        COALESCE(ma.ssid, '') as ssid,
        ma.total_sightings,
        ma.home_area_sightings,
        ma.distant_sightings,
        ROUND(ma.min_distance_km::numeric, 2) as min_distance_km,
        ROUND(ma.max_distance_km::numeric, 2) as max_distance_km,
        ROUND(ma.mobility_range_km::numeric, 2) as mobility_range_km,
        ma.first_seen,
        ma.last_seen,
        -- Risk scoring based on realistic surveillance patterns
        CASE
            -- Critical: Device at home and 50+ km away (professional surveillance)
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 50 THEN 0.95
            -- High: Device at home and 20+ km away
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 20 THEN 0.85
            -- Medium: High mobility range (possible surveillance equipment)
            WHEN ma.mobility_range_km > 50 THEN 0.75
            -- Low-Medium: Home area + distant sightings
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 THEN 0.65
            -- Low: Multiple sightings across moderate distance
            WHEN ma.total_sightings > 2 AND ma.mobility_range_km > 10 THEN 0.45
            -- Very Low: Single or local sightings only
            ELSE 0.2
        END as stalking_risk_score,
        -- Threat assessment
        CASE
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 50
                THEN 'CRITICAL - Same device at home and 50+ km away (impossible for normal WiFi)'
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 20
                THEN 'HIGH - Device appears at home and 20+ km away (surveillance concern)'
            WHEN ma.mobility_range_km > 50
                THEN 'MEDIUM - High mobility device (potential surveillance equipment)'
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0
                THEN 'LOW - Device mobility around local area'
            WHEN ma.total_sightings > 2 AND ma.mobility_range_km > 10
                THEN 'INFORMATIONAL - Mobile device pattern'
            ELSE 'NORMAL - Standard local device'
        END as threat_assessment,
        ma.data_quality_flags
    FROM mobility_analysis ma
    ORDER BY
        CASE
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 50 THEN 0.95
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 AND ma.max_distance_km > 20 THEN 0.85
            WHEN ma.mobility_range_km > 50 THEN 0.75
            WHEN ma.home_area_sightings > 0 AND ma.distant_sightings > 0 THEN 0.65
            WHEN ma.total_sightings > 2 AND ma.mobility_range_km > 10 THEN 0.45
            ELSE 0.2
        END DESC,
        ma.max_distance_km DESC;
END;
$$;

-- Execute calibrated analysis
SELECT '=== CALIBRATED SURVEILLANCE DETECTION SYSTEM ===' as system_header;

-- Show threat summary
SELECT
    threat_level,
    network_count
FROM (
    SELECT
        CASE
            WHEN stalking_risk_score >= 0.8 THEN 'CRITICAL/HIGH THREAT'
            WHEN stalking_risk_score >= 0.6 THEN 'MEDIUM THREAT'
            WHEN stalking_risk_score >= 0.4 THEN 'LOW THREAT'
            ELSE 'NORMAL/INFORMATIONAL'
        END as threat_level,
        COUNT(*) as network_count
    FROM app.detect_calibrated_stalking_networks(30, 1.0, 20.0)
    GROUP BY 1
) threat_summary
WHERE network_count > 0
ORDER BY
    CASE threat_level
        WHEN 'CRITICAL/HIGH THREAT' THEN 1
        WHEN 'MEDIUM THREAT' THEN 2
        WHEN 'LOW THREAT' THEN 3
        ELSE 4
    END;

-- Show specific high-risk detections
SELECT '=== HIGH-RISK SURVEILLANCE DETECTIONS ===' as detections_header;

SELECT
    bssid,
    ssid,
    total_sightings,
    home_area_sightings,
    distant_sightings,
    max_distance_km,
    ROUND(stalking_risk_score::numeric, 3) as risk_score,
    threat_assessment,
    data_quality_flags
FROM app.detect_calibrated_stalking_networks(30, 1.0, 20.0)
WHERE stalking_risk_score >= 0.6
ORDER BY stalking_risk_score DESC, max_distance_km DESC
LIMIT 20;

-- Show distance distribution for context
SELECT '=== DISTANCE DISTRIBUTION ANALYSIS ===' as distance_header;

SELECT
    CASE
        WHEN max_distance_km < 1 THEN 'Under 1km (Very Local)'
        WHEN max_distance_km < 5 THEN '1-5km (Neighborhood)'
        WHEN max_distance_km < 20 THEN '5-20km (Local Area)'
        WHEN max_distance_km < 50 THEN '20-50km (Regional)'
        WHEN max_distance_km < 100 THEN '50-100km (Long Distance)'
        ELSE '100+ km (Surveillance Range)'
    END as distance_category,
    COUNT(*) as network_count,
    COUNT(*) FILTER (WHERE home_area_sightings > 0) as also_seen_at_home
FROM app.detect_calibrated_stalking_networks(30, 1.0, 20.0)
GROUP BY 1
ORDER BY MIN(max_distance_km);

COMMENT ON FUNCTION app.detect_calibrated_stalking_networks IS 'Calibrated surveillance detection with data quality filtering - excludes GPS artifacts and uses realistic distance thresholds';