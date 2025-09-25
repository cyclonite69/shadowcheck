-- =====================================================
-- ShadowCheck Advanced Surveillance Detection Functions
-- Spatial-temporal analysis functions for detecting professional surveillance
-- Implements real-world patterns: impossible distance, coordinated movement, aerial, sequential MAC
-- =====================================================

-- =====================================================
-- PATTERN 1: IMPOSSIBLE DISTANCE ANOMALIES
-- Detects devices appearing 90km away impossible for normal movement
-- =====================================================

CREATE OR REPLACE FUNCTION app.detect_impossible_distance_anomalies(
    p_device_id BIGINT DEFAULT NULL,
    p_analysis_window_hours INTEGER DEFAULT 24,
    p_min_suspicious_distance_km NUMERIC DEFAULT 50.0,
    p_max_reasonable_speed_kph NUMERIC DEFAULT 120.0
)
RETURNS TABLE(
    device_id BIGINT,
    impossible_distance_km NUMERIC,
    time_difference_minutes NUMERIC,
    required_speed_kph NUMERIC,
    anomaly_confidence NUMERIC,
    start_location GEOMETRY,
    end_location GEOMETRY,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH position_pairs AS (
        SELECT
            pm1.access_point_id,
            pm1.position_point as pos1,
            pm1.measurement_timestamp as time1,
            pm2.position_point as pos2,
            pm2.measurement_timestamp as time2,
            ST_Distance(pm1.position_point::geography, pm2.position_point::geography) / 1000.0 as distance_km,
            EXTRACT(EPOCH FROM (pm2.measurement_timestamp - pm1.measurement_timestamp)) / 60.0 as time_diff_minutes
        FROM app.position_measurements pm1
        JOIN app.position_measurements pm2 ON pm1.access_point_id = pm2.access_point_id
        WHERE (p_device_id IS NULL OR pm1.access_point_id = p_device_id)
          AND pm1.measurement_timestamp >= NOW() - (p_analysis_window_hours || ' hours')::INTERVAL
          AND pm2.measurement_timestamp > pm1.measurement_timestamp
          AND pm2.measurement_timestamp <= pm1.measurement_timestamp + INTERVAL '4 hours'
          -- Exclude rapid-fire readings from same general location
          AND ST_Distance(pm1.position_point::geography, pm2.position_point::geography) > 1000
    ),
    impossible_movements AS (
        SELECT
            pp.access_point_id,
            pp.distance_km,
            pp.time_diff_minutes,
            (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) as required_speed_kph,
            pp.pos1,
            pp.pos2,
            pp.time1,
            pp.time2,
            -- Confidence based on impossibility of required speed
            CASE
                WHEN (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) > 800 THEN 1.0  -- Faster than commercial aircraft
                WHEN (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) > 300 THEN 0.95 -- Faster than high-speed rail
                WHEN (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) > 200 THEN 0.85 -- Faster than fastest car
                WHEN (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) > p_max_reasonable_speed_kph THEN 0.75 -- Faster than highway speed
                ELSE 0.3
            END as anomaly_confidence
        FROM position_pairs pp
        WHERE pp.distance_km >= p_min_suspicious_distance_km  -- Flag movements > threshold
          AND pp.time_diff_minutes > 5  -- Ignore rapid-fire readings
          AND (pp.distance_km / GREATEST(pp.time_diff_minutes / 60.0, 0.1)) > p_max_reasonable_speed_kph
    )
    SELECT
        im.access_point_id,
        im.distance_km,
        im.time_diff_minutes,
        im.required_speed_kph,
        im.anomaly_confidence,
        im.pos1,
        im.pos2,
        im.time1,
        im.time2
    FROM impossible_movements im
    ORDER BY im.distance_km DESC, im.anomaly_confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PATTERN 2: COORDINATED MOVEMENT DETECTION
-- Detects multiple BSSIDs moving together (surveillance teams)
-- =====================================================

CREATE OR REPLACE FUNCTION app.detect_coordinated_movement(
    p_time_window_minutes INTEGER DEFAULT 60,
    p_min_devices INTEGER DEFAULT 3,
    p_max_start_distance_meters NUMERIC DEFAULT 1000,
    p_max_end_distance_meters NUMERIC DEFAULT 500,
    p_min_movement_distance_km NUMERIC DEFAULT 5.0
)
RETURNS TABLE(
    movement_group_id UUID,
    device_ids BIGINT[],
    group_size INTEGER,
    start_location GEOMETRY,
    end_location GEOMETRY,
    distance_traveled_km NUMERIC,
    coordination_score NUMERIC,
    movement_timestamp TIMESTAMPTZ,
    time_synchronization_quality NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH device_movements AS (
        SELECT
            pm.access_point_id,
            pm.measurement_timestamp,
            pm.position_point,
            LAG(pm.position_point) OVER (PARTITION BY pm.access_point_id ORDER BY pm.measurement_timestamp) as prev_position,
            LAG(pm.measurement_timestamp) OVER (PARTITION BY pm.access_point_id ORDER BY pm.measurement_timestamp) as prev_time
        FROM app.position_measurements pm
        WHERE pm.measurement_timestamp >= NOW() - INTERVAL '24 hours'
    ),
    significant_movements AS (
        SELECT
            dm.access_point_id,
            dm.measurement_timestamp,
            dm.position_point,
            dm.prev_position,
            ST_Distance(dm.position_point::geography, dm.prev_position::geography) / 1000.0 as movement_distance_km
        FROM device_movements dm
        WHERE dm.prev_position IS NOT NULL
          AND ST_Distance(dm.position_point::geography, dm.prev_position::geography) >= p_min_movement_distance_km * 1000
          AND EXTRACT(EPOCH FROM (dm.measurement_timestamp - dm.prev_time)) / 60 <= p_time_window_minutes * 2
    ),
    movement_groups AS (
        SELECT
            sm1.access_point_id as primary_device,
            sm1.measurement_timestamp,
            sm1.position_point,
            sm1.prev_position,
            sm1.movement_distance_km,
            -- Find other devices that made similar movements at similar times
            array_agg(DISTINCT sm2.access_point_id) FILTER (WHERE sm2.access_point_id != sm1.access_point_id) as coordinated_devices,
            -- Calculate time synchronization quality
            AVG(ABS(EXTRACT(EPOCH FROM (sm1.measurement_timestamp - sm2.measurement_timestamp)))) as avg_time_diff_seconds
        FROM significant_movements sm1
        JOIN significant_movements sm2 ON
            -- Similar timing (within window)
            ABS(EXTRACT(EPOCH FROM (sm1.measurement_timestamp - sm2.measurement_timestamp))) <= p_time_window_minutes * 60
            -- Started near each other
            AND ST_Distance(sm1.prev_position::geography, sm2.prev_position::geography) <= p_max_start_distance_meters
            -- Ended up near each other
            AND ST_Distance(sm1.position_point::geography, sm2.position_point::geography) <= p_max_end_distance_meters
            -- Exclude self-matches
            AND sm1.access_point_id != sm2.access_point_id
        GROUP BY sm1.access_point_id, sm1.measurement_timestamp, sm1.position_point, sm1.prev_position, sm1.movement_distance_km
        HAVING array_length(array_agg(DISTINCT sm2.access_point_id), 1) >= p_min_devices - 1
    ),
    coordinated_groups AS (
        SELECT
            gen_random_uuid() as group_id,
            array_prepend(mg.primary_device, mg.coordinated_devices) as all_devices,
            array_length(array_prepend(mg.primary_device, mg.coordinated_devices), 1) as group_size,
            mg.prev_position as start_pos,
            mg.position_point as end_pos,
            mg.movement_distance_km,
            mg.measurement_timestamp,
            -- Coordination score based on group size, timing precision, and distance consistency
            LEAST(1.0,
                (array_length(mg.coordinated_devices, 1)::NUMERIC / 10.0) * 0.4 +  -- More devices = higher score
                GREATEST(0.0, (1.0 - (mg.avg_time_diff_seconds / 600.0))) * 0.4 +  -- Better timing = higher score
                (mg.movement_distance_km / 50.0) * 0.2  -- Longer coordinated movement = higher score
            ) as coordination_score,
            -- Time synchronization quality (0-1, higher = better synchronized)
            GREATEST(0.0, 1.0 - (mg.avg_time_diff_seconds / (p_time_window_minutes * 60.0))) as time_sync_quality
        FROM movement_groups mg
        WHERE mg.movement_distance_km >= p_min_movement_distance_km
    )
    SELECT
        cg.group_id,
        cg.all_devices,
        cg.group_size,
        cg.start_pos,
        cg.end_pos,
        cg.movement_distance_km,
        cg.coordination_score,
        cg.measurement_timestamp,
        cg.time_sync_quality
    FROM coordinated_groups cg
    WHERE cg.coordination_score >= 0.3  -- Minimum threshold for reporting
    ORDER BY cg.coordination_score DESC, cg.group_size DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PATTERN 3: SEQUENTIAL MAC PATTERN DETECTION
-- Detects government infrastructure via sequential MAC addresses
-- =====================================================

CREATE OR REPLACE FUNCTION app.detect_sequential_mac_patterns(
    p_min_sequence_length INTEGER DEFAULT 3,
    p_mac_proximity_range INTEGER DEFAULT 50
)
RETURNS TABLE(
    mac_sequence_start TEXT,
    sequential_count INTEGER,
    device_ids BIGINT[],
    manufacturer_names TEXT[],
    suspicious_score NUMERIC,
    government_manufacturer_score NUMERIC,
    requires_wigle_lookup BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH mac_analysis AS (
        SELECT
            wap.access_point_id,
            wap.mac_address,
            -- Extract numeric portion of MAC (handle various formats)
            CASE
                WHEN wap.mac_address ~ '^[0-9A-Fa-f:]{17}$' THEN
                    ('x' || RIGHT(REPLACE(wap.mac_address, ':', ''), 6))::bit(24)::INTEGER
                WHEN wap.mac_address ~ '^[0-9A-Fa-f-]{17}$' THEN
                    ('x' || RIGHT(REPLACE(wap.mac_address, '-', ''), 6))::bit(24)::INTEGER
                ELSE NULL
            END as mac_numeric,
            oui.organization_name,
            -- Score manufacturer based on government/agency indicators
            CASE
                WHEN oui.organization_name ~* 'government|federal|military|agency|department|dod|nsa|fbi|cia|homeland|defense' THEN 1.0
                WHEN oui.organization_name ~* 'police|sheriff|enforcement|public safety|emergency|911' THEN 0.9
                WHEN oui.organization_name ~* 'cisco|motorola|harris|general dynamics|raytheon|lockheed|boeing|northrop' THEN 0.8
                WHEN oui.organization_name ~* 'surveillance|security|monitoring|intelligence|tactical' THEN 0.7
                WHEN oui.organization_name ~* 'communications|radio|wireless|network|infrastructure' THEN 0.4
                ELSE 0.1
            END as gov_score
        FROM app.wireless_access_points wap
        LEFT JOIN app.oui_manufacturers oui ON oui.manufacturer_id = wap.manufacturer_id
        WHERE wap.mac_address ~ '^[0-9A-Fa-f:.-]{12,17}$' -- Valid MAC format
    ),
    sequential_groups AS (
        SELECT
            m1.mac_address as start_mac,
            m1.mac_numeric as start_numeric,
            array_agg(m2.access_point_id ORDER BY m2.mac_numeric) as device_sequence,
            array_agg(m2.organization_name ORDER BY m2.mac_numeric) as manufacturer_sequence,
            array_agg(m2.mac_address ORDER BY m2.mac_numeric) as mac_sequence,
            COUNT(*) as sequence_length,
            AVG(m2.gov_score) as avg_gov_score,
            MAX(m2.gov_score) as max_gov_score
        FROM mac_analysis m1
        JOIN mac_analysis m2 ON
            -- MACs within proximity range
            ABS(m1.mac_numeric - m2.mac_numeric) <= p_mac_proximity_range
            AND m1.mac_numeric <= m2.mac_numeric
            -- Both have valid numeric MACs
            AND m1.mac_numeric IS NOT NULL
            AND m2.mac_numeric IS NOT NULL
        GROUP BY m1.mac_address, m1.mac_numeric
        HAVING COUNT(*) >= p_min_sequence_length
    ),
    suspicious_sequences AS (
        SELECT
            sg.start_mac,
            sg.sequence_length,
            sg.device_sequence,
            sg.manufacturer_sequence,
            sg.mac_sequence,
            -- Suspicious score based on sequence length, manufacturer indicators, and proximity
            LEAST(1.0,
                (sg.sequence_length::NUMERIC / 20.0) * 0.3 +        -- Longer sequence = more suspicious
                sg.avg_gov_score * 0.5 +                            -- Government manufacturer = more suspicious
                CASE WHEN sg.max_gov_score > 0.8 THEN 0.2 ELSE 0.0 END  -- Any high-confidence gov manufacturer
            ) as suspicious_score,
            sg.avg_gov_score as gov_manufacturer_score,
            -- Require WiGLE lookup for high-suspicion or government sequences
            (sg.avg_gov_score > 0.5 OR sg.sequence_length > 10 OR sg.max_gov_score > 0.7) as needs_wigle_lookup
        FROM sequential_groups sg
    )
    SELECT
        ss.start_mac,
        ss.sequence_length,
        ss.device_sequence,
        ss.manufacturer_sequence,
        ss.suspicious_score,
        ss.gov_manufacturer_score,
        ss.needs_wigle_lookup
    FROM suspicious_sequences ss
    WHERE ss.suspicious_score > 0.3  -- Only return suspicious sequences
    ORDER BY ss.suspicious_score DESC, ss.sequence_length DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PATTERN 4: AERIAL SURVEILLANCE DETECTION
-- Detects aircraft/drone surveillance patterns (SSE vector with altitude)
-- =====================================================

CREATE OR REPLACE FUNCTION app.detect_aerial_surveillance_patterns(
    p_min_altitude_gain NUMERIC DEFAULT 100,  -- meters
    p_min_distance_km NUMERIC DEFAULT 5,
    p_analysis_window_hours INTEGER DEFAULT 24,
    p_max_ground_speed_kph NUMERIC DEFAULT 50, -- Typical ground vehicle max speed
    p_min_air_speed_kph NUMERIC DEFAULT 100    -- Minimum aircraft speed
)
RETURNS TABLE(
    device_id BIGINT,
    flight_path GEOMETRY,
    total_altitude_gain_meters NUMERIC,
    average_heading_degrees NUMERIC,
    average_speed_kph NUMERIC,
    max_speed_kph NUMERIC,
    pattern_confidence NUMERIC,
    aerial_signature_score NUMERIC,
    flight_start_time TIMESTAMPTZ,
    flight_end_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH altitude_movements AS (
        SELECT
            pm.access_point_id,
            pm.measurement_timestamp,
            pm.position_point,
            pm.altitude_meters,
            LAG(pm.position_point) OVER w as prev_position,
            LAG(pm.altitude_meters) OVER w as prev_altitude,
            LAG(pm.measurement_timestamp) OVER w as prev_time
        FROM app.position_measurements pm
        WHERE pm.altitude_meters IS NOT NULL
          AND pm.measurement_timestamp >= NOW() - (p_analysis_window_hours || ' hours')::INTERVAL
          -- Filter out obviously bad altitude data
          AND pm.altitude_meters BETWEEN -100 AND 15000
        WINDOW w AS (PARTITION BY pm.access_point_id ORDER BY pm.measurement_timestamp)
    ),
    flight_segments AS (
        SELECT
            am.access_point_id,
            am.measurement_timestamp,
            am.prev_time,
            ST_MakeLine(am.prev_position, am.position_point) as segment,
            am.altitude_meters - COALESCE(am.prev_altitude, am.altitude_meters) as altitude_change,
            ST_Distance(am.prev_position::geography, am.position_point::geography) / 1000.0 as distance_km,
            EXTRACT(EPOCH FROM (am.measurement_timestamp - am.prev_time)) / 3600.0 as time_hours,
            -- Calculate heading (bearing)
            CASE
                WHEN am.prev_position IS NOT NULL THEN
                    degrees(ST_Azimuth(am.prev_position, am.position_point))
                ELSE NULL
            END as heading_degrees
        FROM altitude_movements am
        WHERE am.prev_position IS NOT NULL
          AND am.prev_altitude IS NOT NULL
          AND am.altitude_meters - am.prev_altitude > 10  -- Some altitude change
    ),
    flight_analysis AS (
        SELECT
            fs.access_point_id,
            MIN(fs.prev_time) as flight_start,
            MAX(fs.measurement_timestamp) as flight_end,
            ST_Collect(fs.segment) as full_path,
            SUM(GREATEST(fs.altitude_change, 0)) as total_altitude_gain,
            AVG(fs.heading_degrees) as avg_heading,
            STDDEV(fs.heading_degrees) as heading_stability,
            SUM(fs.distance_km) as total_distance,
            SUM(fs.time_hours) as total_time,
            MAX(CASE WHEN fs.time_hours > 0 THEN fs.distance_km / fs.time_hours ELSE 0 END) as max_speed,
            -- Calculate linearity (straight flight paths are more suspicious)
            CASE
                WHEN ST_Length(ST_Collect(fs.segment)::geography) > 0 THEN
                    ST_Distance(ST_StartPoint(ST_Collect(fs.segment))::geography,
                               ST_EndPoint(ST_Collect(fs.segment))::geography) /
                    ST_Length(ST_Collect(fs.segment)::geography)
                ELSE 0
            END as linearity_score
        FROM flight_segments fs
        GROUP BY fs.access_point_id
        HAVING SUM(GREATEST(fs.altitude_change, 0)) >= p_min_altitude_gain
           AND SUM(fs.distance_km) >= p_min_distance_km
           AND SUM(fs.time_hours) > 0
    ),
    aerial_candidates AS (
        SELECT
            fa.access_point_id,
            fa.flight_start,
            fa.flight_end,
            fa.full_path,
            fa.total_altitude_gain,
            fa.avg_heading,
            fa.total_distance,
            fa.total_time,
            fa.max_speed,
            CASE WHEN fa.total_time > 0 THEN fa.total_distance / fa.total_time ELSE 0 END as avg_speed,
            fa.linearity_score,
            fa.heading_stability,
            -- Aerial signature scoring
            LEAST(1.0,
                -- Altitude gain score (higher = more suspicious)
                GREATEST(0.0, (fa.total_altitude_gain - p_min_altitude_gain) / 1000.0) * 0.3 +
                -- Speed score (aircraft-like speeds)
                CASE
                    WHEN fa.max_speed BETWEEN p_min_air_speed_kph AND 1000 THEN 0.3
                    WHEN fa.max_speed > p_max_ground_speed_kph THEN 0.2
                    ELSE 0.0
                END +
                -- Linearity score (straight paths typical of surveillance)
                COALESCE(fa.linearity_score, 0.0) * 0.2 +
                -- Heading stability (consistent direction)
                CASE
                    WHEN fa.heading_stability IS NOT NULL AND fa.heading_stability < 45 THEN 0.2
                    ELSE 0.0
                END
            ) as aerial_signature_score
        FROM flight_analysis fa
    )
    SELECT
        ac.access_point_id,
        ac.full_path,
        ac.total_altitude_gain,
        ac.avg_heading,
        ac.avg_speed,
        ac.max_speed,
        -- Overall pattern confidence
        LEAST(1.0,
            ac.aerial_signature_score * 0.7 +
            CASE
                WHEN ac.avg_speed BETWEEN p_min_air_speed_kph AND 800 AND ac.total_altitude_gain > 200 THEN 0.3
                WHEN ac.max_speed > p_max_ground_speed_kph * 2 AND ac.total_altitude_gain > p_min_altitude_gain THEN 0.2
                ELSE 0.1
            END
        ) as pattern_confidence,
        ac.aerial_signature_score,
        ac.flight_start,
        ac.flight_end
    FROM aerial_candidates ac
    WHERE ac.aerial_signature_score >= 0.3  -- Minimum threshold for reporting
    ORDER BY ac.aerial_signature_score DESC, ac.total_altitude_gain DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PATTERN 5: SURVEILLANCE ROUTE CORRELATION
-- Detects devices following user to restaurants and other locations
-- =====================================================

CREATE OR REPLACE FUNCTION app.detect_surveillance_route_correlation(
    p_user_device_id BIGINT,
    p_analysis_window_days INTEGER DEFAULT 30,
    p_min_colocation_events INTEGER DEFAULT 3,
    p_max_arrival_time_diff_minutes INTEGER DEFAULT 60,
    p_proximity_threshold_meters NUMERIC DEFAULT 1000
)
RETURNS TABLE(
    suspicious_device_id BIGINT,
    colocation_count INTEGER,
    surveillance_confidence NUMERIC,
    following_pattern_score NUMERIC,
    locations_in_common GEOMETRY[],
    temporal_correlation_score NUMERIC,
    average_arrival_delay_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_visits AS (
        SELECT
            pm.measurement_timestamp,
            pm.position_point,
            pm.access_point_id as user_ap_id
        FROM app.position_measurements pm
        WHERE pm.access_point_id = p_user_device_id
          AND pm.measurement_timestamp >= NOW() - (p_analysis_window_days || ' days')::INTERVAL
    ),
    other_device_visits AS (
        SELECT
            pm.access_point_id,
            pm.measurement_timestamp,
            pm.position_point
        FROM app.position_measurements pm
        WHERE pm.access_point_id != p_user_device_id
          AND pm.measurement_timestamp >= NOW() - (p_analysis_window_days || ' days')::INTERVAL
    ),
    colocation_events AS (
        SELECT
            odv.access_point_id as other_device_id,
            uv.measurement_timestamp as user_arrival_time,
            odv.measurement_timestamp as other_arrival_time,
            uv.position_point as location,
            ST_Distance(uv.position_point::geography, odv.position_point::geography) as distance_meters,
            EXTRACT(EPOCH FROM (odv.measurement_timestamp - uv.measurement_timestamp)) / 60.0 as arrival_delay_minutes
        FROM user_visits uv
        JOIN other_device_visits odv ON
            -- Devices were at similar locations
            ST_Distance(uv.position_point::geography, odv.position_point::geography) <= p_proximity_threshold_meters
            -- Within reasonable time window
            AND ABS(EXTRACT(EPOCH FROM (uv.measurement_timestamp - odv.measurement_timestamp))) <= p_max_arrival_time_diff_minutes * 60
    ),
    surveillance_patterns AS (
        SELECT
            ce.other_device_id,
            COUNT(*) as total_colocations,
            AVG(ce.arrival_delay_minutes) as avg_arrival_delay,
            STDDEV(ce.arrival_delay_minutes) as arrival_delay_stddev,
            array_agg(DISTINCT ce.location) as common_locations,

            -- Following pattern: other device consistently arrives after user
            COUNT(*) FILTER (WHERE ce.arrival_delay_minutes BETWEEN 5 AND 45) as following_arrivals,
            COUNT(*) FILTER (WHERE ce.arrival_delay_minutes BETWEEN -45 AND -5) as preceding_arrivals,

            -- Temporal correlation: how consistent are the timing patterns
            CASE
                WHEN STDDEV(ce.arrival_delay_minutes) IS NOT NULL AND STDDEV(ce.arrival_delay_minutes) > 0 THEN
                    1.0 / (1.0 + STDDEV(ce.arrival_delay_minutes) / 30.0)  -- Lower stddev = higher correlation
                ELSE 1.0
            END as temporal_correlation

        FROM colocation_events ce
        GROUP BY ce.other_device_id
        HAVING COUNT(*) >= p_min_colocation_events
    ),
    surveillance_assessment AS (
        SELECT
            sp.other_device_id,
            sp.total_colocations,
            sp.avg_arrival_delay,
            sp.common_locations,
            sp.temporal_correlation,

            -- Following pattern score (higher when device consistently arrives after user)
            CASE
                WHEN sp.total_colocations > 0 THEN
                    (sp.following_arrivals::NUMERIC / sp.total_colocations) *
                    -- Bonus for consistent delays suggesting active following
                    CASE
                        WHEN sp.avg_arrival_delay BETWEEN 10 AND 40 THEN 1.2
                        WHEN sp.avg_arrival_delay BETWEEN 5 AND 60 THEN 1.0
                        ELSE 0.8
                    END
                ELSE 0.0
            END as following_pattern_score,

            -- Overall surveillance confidence
            LEAST(1.0,
                -- More colocations = higher confidence
                LEAST(1.0, sp.total_colocations::NUMERIC / 10.0) * 0.4 +
                -- Following pattern strength
                CASE
                    WHEN sp.total_colocations > 0 THEN
                        (sp.following_arrivals::NUMERIC / sp.total_colocations) * 0.3
                    ELSE 0.0
                END +
                -- Temporal consistency
                sp.temporal_correlation * 0.3
            ) as surveillance_confidence

        FROM surveillance_patterns sp
    )
    SELECT
        sa.other_device_id,
        sa.total_colocations,
        sa.surveillance_confidence,
        sa.following_pattern_score,
        sa.common_locations,
        sa.temporal_correlation,
        sa.avg_arrival_delay
    FROM surveillance_assessment sa
    WHERE sa.surveillance_confidence >= 0.3  -- Minimum threshold for reporting
    ORDER BY sa.surveillance_confidence DESC, sa.total_colocations DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MASTER SURVEILLANCE DETECTION FUNCTION
-- Runs all detection algorithms and creates anomaly records
-- =====================================================

CREATE OR REPLACE FUNCTION app.run_comprehensive_surveillance_detection(
    p_target_device_id BIGINT DEFAULT NULL,
    p_analysis_hours INTEGER DEFAULT 24,
    p_create_anomaly_records BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    anomaly_type app.surveillance_anomaly_type,
    anomaly_count INTEGER,
    max_confidence NUMERIC,
    avg_confidence NUMERIC,
    critical_count INTEGER
) AS $$
DECLARE
    detection_record RECORD;
    total_anomalies INTEGER := 0;
    anomaly_id BIGINT;
BEGIN
    -- Initialize results table
    CREATE TEMP TABLE detection_results (
        anom_type app.surveillance_anomaly_type,
        anom_count INTEGER,
        max_conf NUMERIC,
        avg_conf NUMERIC,
        crit_count INTEGER
    );

    -- 1. IMPOSSIBLE DISTANCE DETECTION
    BEGIN
        FOR detection_record IN
            SELECT * FROM app.detect_impossible_distance_anomalies(
                p_target_device_id, p_analysis_hours, 50.0, 120.0
            )
        LOOP
            total_anomalies := total_anomalies + 1;

            IF p_create_anomaly_records THEN
                INSERT INTO app.surveillance_anomalies (
                    anomaly_type,
                    primary_device_id,
                    anomaly_locations,
                    suspicious_distance_km,
                    confidence_score,
                    evidence_strength,
                    investigation_priority,
                    operational_significance,
                    movement_vector,
                    anomaly_timespan_start,
                    anomaly_timespan_end
                ) VALUES (
                    'impossible_distance',
                    detection_record.device_id,
                    ST_Collect(ARRAY[detection_record.start_location, detection_record.end_location]),
                    detection_record.impossible_distance_km,
                    detection_record.anomaly_confidence,
                    CASE
                        WHEN detection_record.anomaly_confidence >= 0.9 THEN 'overwhelming'
                        WHEN detection_record.anomaly_confidence >= 0.7 THEN 'strong'
                        ELSE 'moderate'
                    END,
                    CASE
                        WHEN detection_record.anomaly_confidence >= 0.9 THEN 9
                        WHEN detection_record.anomaly_confidence >= 0.7 THEN 7
                        ELSE 5
                    END,
                    CASE
                        WHEN detection_record.anomaly_confidence >= 0.9 THEN 'critical'
                        WHEN detection_record.anomaly_confidence >= 0.7 THEN 'high'
                        ELSE 'medium'
                    END,
                    jsonb_build_object(
                        'required_speed_kph', detection_record.required_speed_kph,
                        'time_difference_minutes', detection_record.time_difference_minutes,
                        'impossibility_factor', detection_record.required_speed_kph / 120.0
                    ),
                    detection_record.start_time,
                    detection_record.end_time
                ) RETURNING anomaly_id;
            END IF;
        END LOOP;

        INSERT INTO detection_results SELECT 'impossible_distance', COUNT(*), MAX(anomaly_confidence), AVG(anomaly_confidence), COUNT(*) FILTER (WHERE anomaly_confidence >= 0.9)
        FROM app.detect_impossible_distance_anomalies(p_target_device_id, p_analysis_hours);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in impossible distance detection: %', SQLERRM;
    END;

    -- 2. COORDINATED MOVEMENT DETECTION
    BEGIN
        FOR detection_record IN
            SELECT * FROM app.detect_coordinated_movement(60, 3, 1000, 500, 5.0)
        LOOP
            total_anomalies := total_anomalies + 1;

            IF p_create_anomaly_records THEN
                INSERT INTO app.surveillance_anomalies (
                    anomaly_type,
                    related_device_ids,
                    anomaly_locations,
                    confidence_score,
                    evidence_strength,
                    investigation_priority,
                    operational_significance,
                    likely_surveillance_type,
                    movement_vector,
                    anomaly_timespan_start
                ) VALUES (
                    'coordinated_movement',
                    detection_record.device_ids,
                    ST_Collect(ARRAY[detection_record.start_location, detection_record.end_location]),
                    detection_record.coordination_score,
                    CASE
                        WHEN detection_record.coordination_score >= 0.8 THEN 'strong'
                        WHEN detection_record.coordination_score >= 0.6 THEN 'moderate'
                        ELSE 'weak'
                    END,
                    CASE
                        WHEN detection_record.coordination_score >= 0.8 THEN 8
                        WHEN detection_record.coordination_score >= 0.6 THEN 6
                        ELSE 4
                    END,
                    CASE
                        WHEN detection_record.coordination_score >= 0.8 THEN 'high'
                        WHEN detection_record.coordination_score >= 0.6 THEN 'medium'
                        ELSE 'low'
                    END,
                    'coordinated_team',
                    jsonb_build_object(
                        'group_size', detection_record.group_size,
                        'distance_traveled_km', detection_record.distance_traveled_km,
                        'time_synchronization_quality', detection_record.time_synchronization_quality
                    ),
                    detection_record.movement_timestamp
                );
            END IF;
        END LOOP;

        INSERT INTO detection_results SELECT 'coordinated_movement', COUNT(*), MAX(coordination_score), AVG(coordination_score), COUNT(*) FILTER (WHERE coordination_score >= 0.8)
        FROM app.detect_coordinated_movement(60, 3, 1000, 500, 5.0);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in coordinated movement detection: %', SQLERRM;
    END;

    -- 3. SEQUENTIAL MAC PATTERN DETECTION
    BEGIN
        FOR detection_record IN
            SELECT * FROM app.detect_sequential_mac_patterns(3, 50)
        LOOP
            total_anomalies := total_anomalies + 1;

            IF p_create_anomaly_records THEN
                INSERT INTO app.surveillance_anomalies (
                    anomaly_type,
                    related_device_ids,
                    confidence_score,
                    evidence_strength,
                    investigation_priority,
                    operational_significance,
                    likely_surveillance_type,
                    wigle_api_correlations
                ) VALUES (
                    'sequential_mac_pattern',
                    detection_record.device_ids,
                    detection_record.suspicious_score,
                    CASE
                        WHEN detection_record.suspicious_score >= 0.8 THEN 'strong'
                        WHEN detection_record.suspicious_score >= 0.6 THEN 'moderate'
                        ELSE 'weak'
                    END,
                    CASE
                        WHEN detection_record.suspicious_score >= 0.8 THEN 8
                        WHEN detection_record.suspicious_score >= 0.6 THEN 6
                        ELSE 4
                    END,
                    CASE
                        WHEN detection_record.government_manufacturer_score >= 0.7 THEN 'critical'
                        WHEN detection_record.suspicious_score >= 0.8 THEN 'high'
                        ELSE 'medium'
                    END,
                    'infrastructure_based',
                    jsonb_build_object(
                        'sequential_count', detection_record.sequential_count,
                        'government_manufacturer_score', detection_record.government_manufacturer_score,
                        'requires_wigle_lookup', detection_record.requires_wigle_lookup,
                        'manufacturer_names', detection_record.manufacturer_names
                    )
                );
            END IF;
        END LOOP;

        INSERT INTO detection_results SELECT 'sequential_mac_pattern', COUNT(*), MAX(suspicious_score), AVG(suspicious_score), COUNT(*) FILTER (WHERE suspicious_score >= 0.8)
        FROM app.detect_sequential_mac_patterns(3, 50);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in sequential MAC detection: %', SQLERRM;
    END;

    -- 4. AERIAL SURVEILLANCE DETECTION
    BEGIN
        FOR detection_record IN
            SELECT * FROM app.detect_aerial_surveillance_patterns(100, 5, p_analysis_hours, 50, 100)
        LOOP
            total_anomalies := total_anomalies + 1;

            IF p_create_anomaly_records THEN
                INSERT INTO app.surveillance_anomalies (
                    anomaly_type,
                    primary_device_id,
                    anomaly_locations,
                    confidence_score,
                    evidence_strength,
                    investigation_priority,
                    operational_significance,
                    likely_surveillance_type,
                    movement_vector,
                    anomaly_timespan_start,
                    anomaly_timespan_end
                ) VALUES (
                    'aerial_pattern',
                    detection_record.device_id,
                    ST_Multi(detection_record.flight_path),
                    detection_record.pattern_confidence,
                    CASE
                        WHEN detection_record.pattern_confidence >= 0.8 THEN 'strong'
                        WHEN detection_record.pattern_confidence >= 0.6 THEN 'moderate'
                        ELSE 'weak'
                    END,
                    CASE
                        WHEN detection_record.pattern_confidence >= 0.8 THEN 8
                        WHEN detection_record.pattern_confidence >= 0.6 THEN 6
                        ELSE 4
                    END,
                    CASE
                        WHEN detection_record.pattern_confidence >= 0.8 THEN 'high'
                        WHEN detection_record.pattern_confidence >= 0.6 THEN 'medium'
                        ELSE 'low'
                    END,
                    'aerial_surveillance',
                    jsonb_build_object(
                        'altitude_gain_meters', detection_record.total_altitude_gain_meters,
                        'average_speed_kph', detection_record.average_speed_kph,
                        'max_speed_kph', detection_record.max_speed_kph,
                        'average_heading_degrees', detection_record.average_heading_degrees,
                        'aerial_signature_score', detection_record.aerial_signature_score
                    ),
                    detection_record.flight_start_time,
                    detection_record.flight_end_time
                );
            END IF;
        END LOOP;

        INSERT INTO detection_results SELECT 'aerial_pattern', COUNT(*), MAX(pattern_confidence), AVG(pattern_confidence), COUNT(*) FILTER (WHERE pattern_confidence >= 0.8)
        FROM app.detect_aerial_surveillance_patterns(100, 5, p_analysis_hours, 50, 100);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in aerial surveillance detection: %', SQLERRM;
    END;

    -- 5. SURVEILLANCE ROUTE CORRELATION (if target device specified)
    IF p_target_device_id IS NOT NULL THEN
        BEGIN
            FOR detection_record IN
                SELECT * FROM app.detect_surveillance_route_correlation(p_target_device_id, 30, 3, 60, 1000)
            LOOP
                total_anomalies := total_anomalies + 1;

                IF p_create_anomaly_records THEN
                    INSERT INTO app.surveillance_anomalies (
                        anomaly_type,
                        primary_device_id,
                        related_device_ids,
                        confidence_score,
                        evidence_strength,
                        investigation_priority,
                        operational_significance,
                        likely_surveillance_type,
                        movement_vector
                    ) VALUES (
                        'surveillance_route',
                        p_target_device_id,
                        ARRAY[detection_record.suspicious_device_id],
                        detection_record.surveillance_confidence,
                        CASE
                            WHEN detection_record.surveillance_confidence >= 0.8 THEN 'strong'
                            WHEN detection_record.surveillance_confidence >= 0.6 THEN 'moderate'
                            ELSE 'weak'
                        END,
                        CASE
                            WHEN detection_record.surveillance_confidence >= 0.8 THEN 9
                            WHEN detection_record.surveillance_confidence >= 0.6 THEN 7
                            ELSE 5
                        END,
                        CASE
                            WHEN detection_record.surveillance_confidence >= 0.8 THEN 'critical'
                            WHEN detection_record.surveillance_confidence >= 0.6 THEN 'high'
                            ELSE 'medium'
                        END,
                        'mobile_surveillance',
                        jsonb_build_object(
                            'colocation_count', detection_record.colocation_count,
                            'following_pattern_score', detection_record.following_pattern_score,
                            'temporal_correlation_score', detection_record.temporal_correlation_score,
                            'average_arrival_delay_minutes', detection_record.average_arrival_delay_minutes
                        )
                    );
                END IF;
            END LOOP;

            INSERT INTO detection_results SELECT 'surveillance_route', COUNT(*), MAX(surveillance_confidence), AVG(surveillance_confidence), COUNT(*) FILTER (WHERE surveillance_confidence >= 0.8)
            FROM app.detect_surveillance_route_correlation(p_target_device_id, 30, 3, 60, 1000);
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error in surveillance route detection: %', SQLERRM;
        END;
    END IF;

    -- Return summary results
    RETURN QUERY SELECT anom_type, anom_count, max_conf, avg_conf, crit_count FROM detection_results;

    DROP TABLE detection_results;

    RAISE NOTICE 'Surveillance detection completed. Total anomalies processed: %', total_anomalies;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION app.detect_impossible_distance_anomalies IS 'Detects devices appearing at impossible distances (e.g., 90km away) requiring superhuman travel speeds';
COMMENT ON FUNCTION app.detect_coordinated_movement IS 'Identifies groups of devices moving together in coordinated patterns (surveillance teams)';
COMMENT ON FUNCTION app.detect_sequential_mac_patterns IS 'Finds sequential MAC address patterns indicating government/agency infrastructure deployment';
COMMENT ON FUNCTION app.detect_aerial_surveillance_patterns IS 'Detects aircraft/drone surveillance signatures via altitude gain and linear movement';
COMMENT ON FUNCTION app.detect_surveillance_route_correlation IS 'Identifies devices consistently following user routes (restaurants, etc.)';
COMMENT ON FUNCTION app.run_comprehensive_surveillance_detection IS 'Master function running all surveillance detection algorithms with anomaly record creation';