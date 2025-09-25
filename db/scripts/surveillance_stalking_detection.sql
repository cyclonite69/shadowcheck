-- =====================================================
-- Advanced Surveillance & Stalking Detection
-- Networks appearing at residence AND distant locations
-- BSSID walking, SSID changes, temporal patterns
-- =====================================================

-- First, let's identify the primary residence (most frequent location cluster)
CREATE OR REPLACE FUNCTION app.get_primary_residence_location()
RETURNS GEOMETRY(Point, 4326) LANGUAGE sql AS $$
    SELECT
        ST_Centroid(
            ST_Collect(location_point)
        ) as residence_center
    FROM (
        SELECT
            location_point,
            COUNT(*) as visit_count
        FROM app.position_measurements
        GROUP BY ST_SnapToGrid(location_point, 0.001) -- ~100m grid
        ORDER BY visit_count DESC
        LIMIT 50 -- Top 50 most visited grid cells
    ) frequent_locations;
$$;

-- 1. Detect networks appearing at BOTH residence and distant locations
CREATE OR REPLACE FUNCTION app.detect_residence_stalking_networks(
    p_residence_radius_meters NUMERIC DEFAULT 500,
    p_min_distance_km NUMERIC DEFAULT 2.0,
    p_analysis_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    network_identifier TEXT,
    identification_method TEXT,
    bssid_list TEXT[],
    ssid_list TEXT[],
    residence_locations INTEGER,
    distant_locations INTEGER,
    max_distance_km NUMERIC,
    first_seen_residence TIMESTAMPTZ,
    first_seen_distant TIMESTAMPTZ,
    stalking_confidence NUMERIC,
    threat_assessment TEXT
) LANGUAGE plpgsql AS $$
DECLARE
    residence_point GEOMETRY;
BEGIN
    -- Get primary residence location
    residence_point := app.get_primary_residence_location();

    RETURN QUERY
    WITH network_locations AS (
        SELECT
            n.bssid,
            n.ssid,
            l.location_point,
            l.measurement_time,
            ST_Distance(l.location_point::geography, residence_point::geography) as distance_from_residence
        FROM app.networks_legacy n
        JOIN app.locations_legacy l ON l.id = n.source_id
        WHERE l.measurement_time >= NOW() - (p_analysis_days || ' days')::INTERVAL
            AND l.location_point IS NOT NULL
            AND n.bssid IS NOT NULL
    ),
    residence_networks AS (
        SELECT DISTINCT
            bssid,
            ssid,
            MIN(measurement_time) as first_seen_at_residence
        FROM network_locations
        WHERE distance_from_residence <= p_residence_radius_meters
        GROUP BY bssid, ssid
    ),
    distant_networks AS (
        SELECT
            bssid,
            ssid,
            COUNT(DISTINCT location_point) as distant_location_count,
            MAX(distance_from_residence / 1000.0) as max_distance_km,
            MIN(measurement_time) as first_seen_distant,
            ARRAY_AGG(DISTINCT location_point) as distant_points
        FROM network_locations
        WHERE distance_from_residence > (p_min_distance_km * 1000)
        GROUP BY bssid, ssid
        HAVING COUNT(DISTINCT location_point) >= 1
    ),
    stalking_candidates AS (
        -- Same BSSID at residence and distant locations
        SELECT
            rn.bssid as network_id,
            'IDENTICAL_BSSID' as method,
            ARRAY[rn.bssid] as bssids,
            ARRAY[COALESCE(rn.ssid, '')] as ssids,
            1 as res_locations,
            dn.distant_location_count,
            dn.max_distance_km,
            rn.first_seen_at_residence,
            dn.first_seen_distant
        FROM residence_networks rn
        JOIN distant_networks dn ON rn.bssid = dn.bssid

        UNION ALL

        -- Same SSID with different BSSIDs (network impersonation)
        SELECT
            rn.ssid as network_id,
            'SAME_SSID_DIFFERENT_BSSID' as method,
            ARRAY[rn.bssid, dn.bssid] as bssids,
            ARRAY[rn.ssid] as ssids,
            1 as res_locations,
            dn.distant_location_count,
            dn.max_distance_km,
            rn.first_seen_at_residence,
            dn.first_seen_distant
        FROM residence_networks rn
        JOIN distant_networks dn ON rn.ssid = dn.ssid AND rn.bssid != dn.bssid
        WHERE rn.ssid IS NOT NULL AND rn.ssid != ''

        UNION ALL

        -- BSSID Walking Detection (sequential MAC addresses)
        SELECT
            'BSSID_WALKING_' || LEFT(rn.bssid, 12) as network_id,
            'BSSID_WALKING' as method,
            ARRAY[rn.bssid, dn.bssid] as bssids,
            ARRAY[COALESCE(rn.ssid, ''), COALESCE(dn.ssid, '')] as ssids,
            1 as res_locations,
            dn.distant_location_count,
            dn.max_distance_km,
            rn.first_seen_at_residence,
            dn.first_seen_distant
        FROM residence_networks rn
        JOIN distant_networks dn ON
            LEFT(rn.bssid, 15) = LEFT(dn.bssid, 15)  -- Same prefix (manufacturer + most of MAC)
            AND rn.bssid != dn.bssid  -- But different last digits
            AND ABS(
                ('x' || RIGHT(rn.bssid, 2))::bit(8)::int -
                ('x' || RIGHT(dn.bssid, 2))::bit(8)::int
            ) <= 10  -- Sequential within range
    )
    SELECT
        sc.network_id,
        sc.method,
        sc.bssids,
        sc.ssids,
        sc.res_locations::INTEGER,
        sc.distant_location_count::INTEGER,
        ROUND(sc.max_distance_km, 2),
        sc.first_seen_at_residence,
        sc.first_seen_distant,
        CASE
            WHEN sc.method = 'IDENTICAL_BSSID' AND sc.max_distance_km > 10 THEN 0.9
            WHEN sc.method = 'BSSID_WALKING' AND sc.max_distance_km > 5 THEN 0.85
            WHEN sc.method = 'SAME_SSID_DIFFERENT_BSSID' AND sc.max_distance_km > 20 THEN 0.7
            WHEN sc.max_distance_km > 50 THEN 0.8
            ELSE 0.5
        END as stalking_confidence,
        CASE
            WHEN sc.max_distance_km > 50 AND sc.method = 'IDENTICAL_BSSID'
                THEN 'CRITICAL - Same device at residence and 50km+ away'
            WHEN sc.method = 'BSSID_WALKING'
                THEN 'HIGH - BSSID walking pattern detected (surveillance technique)'
            WHEN sc.max_distance_km > 20 AND sc.method = 'SAME_SSID_DIFFERENT_BSSID'
                THEN 'HIGH - Network impersonation across locations'
            WHEN sc.max_distance_km > 10
                THEN 'MEDIUM - Suspicious network mobility pattern'
            ELSE 'LOW - Local network mobility'
        END as threat_assessment
    FROM stalking_candidates sc
    ORDER BY sc.max_distance_km DESC;
END;
$$;

-- 2. Detect network clusters that follow user movements
CREATE OR REPLACE FUNCTION app.detect_coordinated_network_stalking(
    p_time_window_hours INTEGER DEFAULT 6,
    p_location_radius_meters NUMERIC DEFAULT 1000,
    p_min_networks INTEGER DEFAULT 3
)
RETURNS TABLE (
    cluster_time TIMESTAMPTZ,
    cluster_location GEOMETRY(Point, 4326),
    network_count INTEGER,
    bssid_list TEXT[],
    ssid_list TEXT[],
    coordination_confidence NUMERIC,
    stalking_pattern TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH time_location_clusters AS (
        SELECT
            DATE_TRUNC('hour', l.measurement_time) +
            INTERVAL '1 hour' * FLOOR(EXTRACT(HOUR FROM l.measurement_time) / p_time_window_hours) as time_cluster,
            ST_SnapToGrid(l.location_point, 0.01) as location_cluster, -- ~1km grid
            l.measurement_time,
            l.location_point,
            n.bssid,
            n.ssid
        FROM app.locations_legacy l
        JOIN app.networks_legacy n ON l.id = n.source_id
        WHERE l.location_point IS NOT NULL
            AND n.bssid IS NOT NULL
    ),
    cluster_analysis AS (
        SELECT
            time_cluster,
            ST_Centroid(ST_Collect(location_point)) as cluster_center,
            COUNT(DISTINCT bssid) as unique_networks,
            ARRAY_AGG(DISTINCT bssid) as all_bssids,
            ARRAY_AGG(DISTINCT ssid) FILTER (WHERE ssid IS NOT NULL AND ssid != '') as all_ssids,
            COUNT(*) as total_observations
        FROM time_location_clusters
        GROUP BY time_cluster, location_cluster
        HAVING COUNT(DISTINCT bssid) >= p_min_networks
    ),
    frequent_networks AS (
        SELECT
            bssid,
            COUNT(DISTINCT time_cluster) as appearances,
            COUNT(DISTINCT location_cluster) as location_diversity
        FROM time_location_clusters
        GROUP BY bssid
        HAVING COUNT(DISTINCT time_cluster) >= 3  -- Appears in multiple time periods
    )
    SELECT
        ca.time_cluster,
        ca.cluster_center,
        ca.unique_networks,
        ca.all_bssids,
        ca.all_ssids,
        CASE
            WHEN COUNT(fn.bssid) >= 5 THEN 0.9  -- 5+ networks appearing together frequently
            WHEN COUNT(fn.bssid) >= 3 THEN 0.7  -- 3+ networks
            ELSE 0.5
        END as coordination_confidence,
        CASE
            WHEN COUNT(fn.bssid) >= 5 THEN 'CRITICAL - Large coordinated network cluster'
            WHEN COUNT(fn.bssid) >= 3 THEN 'HIGH - Coordinated network movement'
            ELSE 'MEDIUM - Potential network coordination'
        END as stalking_pattern
    FROM cluster_analysis ca
    LEFT JOIN frequent_networks fn ON fn.bssid = ANY(ca.all_bssids)
    GROUP BY ca.time_cluster, ca.cluster_center, ca.unique_networks, ca.all_bssids, ca.all_ssids
    ORDER BY coordination_confidence DESC, ca.time_cluster DESC;
END;
$$;

-- 3. Temporal pattern analysis - networks appearing before/after visits to locations
CREATE OR REPLACE FUNCTION app.detect_temporal_surveillance_patterns(
    p_time_window_minutes INTEGER DEFAULT 30,
    p_analysis_days INTEGER DEFAULT 14
)
RETURNS TABLE (
    suspicious_bssid TEXT,
    suspicious_ssid TEXT,
    pattern_type TEXT,
    occurrences INTEGER,
    avg_time_offset_minutes NUMERIC,
    confidence_score NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH user_visits AS (
        -- Identify distinct location visits
        SELECT DISTINCT
            DATE_TRUNC('minute', measurement_time) as visit_time,
            ST_SnapToGrid(location_point, 0.001) as visit_location
        FROM app.locations_legacy
        WHERE measurement_time >= NOW() - (p_analysis_days || ' days')::INTERVAL
            AND location_point IS NOT NULL
    ),
    network_appearances AS (
        SELECT
            n.bssid,
            n.ssid,
            l.measurement_time as network_time,
            l.location_point as network_location
        FROM app.networks_legacy n
        JOIN app.locations_legacy l ON l.id = n.source_id
        WHERE l.measurement_time >= NOW() - (p_analysis_days || ' days')::INTERVAL
            AND l.location_point IS NOT NULL
            AND n.bssid IS NOT NULL
    ),
    temporal_correlations AS (
        SELECT
            na.bssid,
            na.ssid,
            EXTRACT(EPOCH FROM (na.network_time - uv.visit_time)) / 60 as time_offset_minutes,
            CASE
                WHEN na.network_time BETWEEN uv.visit_time - (p_time_window_minutes || ' minutes')::INTERVAL
                                        AND uv.visit_time THEN 'APPEARS_BEFORE_ARRIVAL'
                WHEN na.network_time BETWEEN uv.visit_time
                                        AND uv.visit_time + (p_time_window_minutes || ' minutes')::INTERVAL THEN 'APPEARS_AFTER_ARRIVAL'
                ELSE NULL
            END as pattern_type
        FROM user_visits uv
        JOIN network_appearances na ON
            ST_Distance(uv.visit_location::geography, na.network_location::geography) <= 1000 -- Within 1km
        WHERE ABS(EXTRACT(EPOCH FROM (na.network_time - uv.visit_time)) / 60) <= p_time_window_minutes
    )
    SELECT
        tc.bssid,
        tc.ssid,
        tc.pattern_type,
        COUNT(*)::INTEGER as occurrences,
        ROUND(AVG(ABS(tc.time_offset_minutes)), 2) as avg_time_offset_minutes,
        CASE
            WHEN COUNT(*) >= 5 AND tc.pattern_type = 'APPEARS_BEFORE_ARRIVAL' THEN 0.9
            WHEN COUNT(*) >= 3 AND tc.pattern_type = 'APPEARS_AFTER_ARRIVAL' THEN 0.8
            WHEN COUNT(*) >= 3 THEN 0.7
            ELSE 0.5
        END as confidence_score
    FROM temporal_correlations tc
    WHERE tc.pattern_type IS NOT NULL
    GROUP BY tc.bssid, tc.ssid, tc.pattern_type
    HAVING COUNT(*) >= 2  -- At least 2 occurrences to be suspicious
    ORDER BY COUNT(*) DESC, confidence_score DESC;
END;
$$;

-- 4. Run comprehensive stalking detection
CREATE OR REPLACE FUNCTION app.run_comprehensive_stalking_detection()
RETURNS TABLE (
    detection_category TEXT,
    threat_count INTEGER,
    max_confidence NUMERIC,
    critical_threats INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        'Residence Stalking Networks' as detection_category,
        COUNT(*)::INTEGER as threat_count,
        MAX(stalking_confidence) as max_confidence,
        COUNT(*) FILTER (WHERE stalking_confidence >= 0.8)::INTEGER as critical_threats
    FROM app.detect_residence_stalking_networks(500, 2.0, 30)

    UNION ALL

    SELECT
        'Coordinated Network Clusters',
        COUNT(*)::INTEGER,
        MAX(coordination_confidence),
        COUNT(*) FILTER (WHERE coordination_confidence >= 0.8)::INTEGER
    FROM app.detect_coordinated_network_stalking(6, 1000, 3)

    UNION ALL

    SELECT
        'Temporal Surveillance Patterns',
        COUNT(*)::INTEGER,
        MAX(confidence_score),
        COUNT(*) FILTER (WHERE confidence_score >= 0.8)::INTEGER
    FROM app.detect_temporal_surveillance_patterns(30, 14);
END;
$$;

-- Execute the stalking detection analysis
SELECT '=== COMPREHENSIVE STALKING & SURVEILLANCE DETECTION ===' as analysis_header;

-- Run the detection
SELECT * FROM app.run_comprehensive_stalking_detection();

-- Show specific residence stalking threats
SELECT '=== NETWORKS APPEARING AT RESIDENCE AND DISTANT LOCATIONS ===' as residence_threats;

SELECT
    network_identifier,
    identification_method,
    max_distance_km,
    stalking_confidence,
    threat_assessment
FROM app.detect_residence_stalking_networks(500, 2.0, 30)
WHERE stalking_confidence >= 0.6
ORDER BY stalking_confidence DESC, max_distance_km DESC
LIMIT 10;

COMMENT ON FUNCTION app.detect_residence_stalking_networks IS 'Detects networks appearing at both residence and distant locations - key stalking indicator';
COMMENT ON FUNCTION app.detect_coordinated_network_stalking IS 'Identifies clusters of networks moving together - surveillance team detection';
COMMENT ON FUNCTION app.detect_temporal_surveillance_patterns IS 'Finds networks that appear just before/after user arrives at locations';
COMMENT ON FUNCTION app.run_comprehensive_stalking_detection IS 'Comprehensive stalking detection combining all residence-based surveillance patterns';