/**
 * Surveillance Detection Endpoints for ShadowCheck
 *
 * WiFi surveillance detection endpoints that use the new detection functions:
 * - get_wifi_surveillance_threats() - WiFi-specific threat detection
 * - get_surveillance_threats_with_settings() - Configurable detection
 * - update_detection_settings() - Runtime configuration
 * - record_threat_feedback() - User feedback for learning
 * - adjust_thresholds_from_feedback() - Adaptive learning
 */

import { Router, Request, Response } from "express";
import { getPool, query } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v1/surveillance/wifi/threats
 *
 * Get WiFi surveillance threats using the new WiFi-specific detection function
 *
 * Query parameters:
 * - min_distance_km: Minimum distance threshold (default: 0.5km)
 * - home_radius_m: Home zone radius in meters (default: 500m)
 * - min_home_sightings: Minimum sightings at home (default: 1)
 * - limit: Maximum results to return (default: 100)
 */
router.get("/wifi/threats", async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    // Parse query parameters with defaults
    const minDistanceKm = parseFloat(String(req.query.min_distance_km || '0.5'));
    const homeRadiusM = parseFloat(String(req.query.home_radius_m || '500'));
    const minHomeSightings = parseInt(String(req.query.min_home_sightings || '1'));
    const limit = Math.min(parseInt(String(req.query.limit || '100')), 1000); // Increased max to 1000
    const offset = Math.max(parseInt(String(req.query.offset || '0')), 0);

    // Validate parameters
    if (isNaN(minDistanceKm) || minDistanceKm < 0 || minDistanceKm > 100) {
      return res.status(400).json({
        ok: false,
        error: "Invalid min_distance_km. Must be between 0 and 100."
      });
    }

    if (isNaN(homeRadiusM) || homeRadiusM < 0 || homeRadiusM > 5000) {
      return res.status(400).json({
        ok: false,
        error: "Invalid home_radius_m. Must be between 0 and 5000."
      });
    }

    // First, get total count (without LIMIT/OFFSET for accurate pagination)
    const countResult = await query(`
      WITH home_zone AS (
        SELECT ST_SetSRID(ST_MakePoint(-83.6968461, 43.02342188), 4326)::geography as home_point
      ),
      network_analysis AS (
        SELECT
          l.bssid
        FROM app.locations_legacy l
        WHERE l.lat IS NOT NULL
          AND l.lon IS NOT NULL
          AND l.lat BETWEEN -90 AND 90
          AND l.lon BETWEEN -180 AND 180
        GROUP BY l.bssid
        HAVING COUNT(*) FILTER (WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone),
          $2
        )) >= $3
        AND MAX(ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone)
        )) / 1000.0 >= $1
      )
      SELECT COUNT(*) as total_count FROM network_analysis
    `, [minDistanceKm, homeRadiusM, minHomeSightings]);

    const totalCount = parseInt(countResult[0]?.total_count || '0');

    // Direct query for WiFi surveillance threats using legacy tables
    const threatsResult = await query(`
      WITH home_zone AS (
        SELECT ST_SetSRID(ST_MakePoint(-83.6968461, 43.02342188), 4326)::geography as home_point
      ),
      network_analysis AS (
        SELECT
          l.bssid,
          n.ssid,
          n.frequency,
          COUNT(*) as total_sightings,
          COUNT(*) FILTER (WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone),
            $2
          )) as home_sightings,
          COUNT(*) FILTER (WHERE NOT ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone),
            $2
          )) as away_sightings,
          MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone)
          )) / 1000.0 as max_distance_km,
          -- Temporal spread: distinct dates seen
          COUNT(DISTINCT DATE(TO_TIMESTAMP(l.time / 1000))) as distinct_dates,
          -- Geographic spread: distinct locations (100m clustering)
          COUNT(DISTINCT ST_SnapToGrid(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geometry,
            0.001 -- ~100m grid
          )) as distinct_locations,
          -- Time span: days between first and last sighting
          EXTRACT(EPOCH FROM (
            MAX(TO_TIMESTAMP(l.time / 1000)) - MIN(TO_TIMESTAMP(l.time / 1000))
          )) / 86400.0 as time_span_days,
          -- Check if seen both at home AND away
          (COUNT(*) FILTER (WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone),
            $2
          )) > 0 AND COUNT(*) FILTER (WHERE NOT ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone),
            $2
          )) > 0) as seen_both_home_and_away,
          CASE
            WHEN n.frequency >= 2400 AND n.frequency < 2500 THEN '2.4GHz'
            WHEN n.frequency >= 5000 AND n.frequency < 6000 THEN '5GHz'
            WHEN n.frequency >= 6000 THEN '6GHz'
            ELSE 'Unknown'
          END as radio_band,
          CASE
            WHEN n.ssid IS NULL THEN false
            WHEN n.ssid ~* '(iPhone|Android|Galaxy|Pixel)' THEN true
            ELSE false
          END as is_mobile_hotspot
        FROM app.locations_legacy l
        LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
        WHERE l.lat IS NOT NULL
          AND l.lon IS NOT NULL
          AND l.lat BETWEEN -90 AND 90
          AND l.lon BETWEEN -180 AND 180
        GROUP BY l.bssid, n.ssid, n.frequency
        HAVING COUNT(*) FILTER (WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone),
          $2
        )) >= $3
        AND MAX(ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone)
        )) / 1000.0 >= $1
      )
      SELECT
        bssid,
        ssid,
        radio_band,
        total_sightings,
        home_sightings,
        away_sightings,
        max_distance_km,
        is_mobile_hotspot,
        distinct_dates,
        distinct_locations,
        time_span_days,
        seen_both_home_and_away,
        CASE
          WHEN max_distance_km > 20 THEN 'EXTREME'
          WHEN max_distance_km > 10 THEN 'CRITICAL'
          WHEN max_distance_km > 5 THEN 'HIGH'
          WHEN max_distance_km > 2 THEN 'MEDIUM'
          ELSE 'LOW'
        END as threat_level,
        CASE
          WHEN max_distance_km > 20 THEN 'Network detected at extreme distance from home (>20km) with home presence'
          WHEN max_distance_km > 10 THEN 'Network follows you far from home (>10km) - possible surveillance'
          WHEN max_distance_km > 5 THEN 'Network appears at significant distance from home (>5km)'
          WHEN max_distance_km > 2 THEN 'Network detected beyond typical home range (>2km)'
          ELSE 'Network detected beyond home zone but within normal range'
        END as threat_description,
        LEAST(max_distance_km / 10.0, 1.0) as confidence_score,
        -- RELEVANCE SCORE (0-100): Multi-factor analysis of how suspicious this network is
        LEAST(100, GREATEST(0,
          -- Factor 1: Temporal persistence (seen over many days) - max 25 points
          (CASE
            WHEN distinct_dates >= 10 THEN 25
            WHEN distinct_dates >= 5 THEN 20
            WHEN distinct_dates >= 3 THEN 15
            WHEN distinct_dates >= 2 THEN 10
            ELSE 5
          END) +
          -- Factor 2: Home AND away presence (following behavior) - max 30 points
          (CASE
            WHEN seen_both_home_and_away AND home_sightings >= 3 AND away_sightings >= 3 THEN 30
            WHEN seen_both_home_and_away AND home_sightings >= 2 AND away_sightings >= 2 THEN 25
            WHEN seen_both_home_and_away THEN 20
            ELSE 0
          END) +
          -- Factor 3: Geographic spread (multiple locations) - max 20 points
          (CASE
            WHEN distinct_locations >= 10 THEN 20
            WHEN distinct_locations >= 5 THEN 15
            WHEN distinct_locations >= 3 THEN 10
            ELSE 5
          END) +
          -- Factor 4: Distance tracking (far from home) - max 15 points
          (CASE
            WHEN max_distance_km > 20 THEN 15
            WHEN max_distance_km > 10 THEN 12
            WHEN max_distance_km > 5 THEN 9
            WHEN max_distance_km > 2 THEN 6
            ELSE 3
          END) +
          -- Factor 5: Frequency of sightings - max 10 points
          (CASE
            WHEN total_sightings >= 50 THEN 10
            WHEN total_sightings >= 20 THEN 8
            WHEN total_sightings >= 10 THEN 6
            WHEN total_sightings >= 5 THEN 4
            ELSE 2
          END)
        )) as relevance_score,
        -- RELEVANCE LABEL
        CASE
          WHEN LEAST(100, GREATEST(0,
            (CASE WHEN distinct_dates >= 10 THEN 25 WHEN distinct_dates >= 5 THEN 20 WHEN distinct_dates >= 3 THEN 15 WHEN distinct_dates >= 2 THEN 10 ELSE 5 END) +
            (CASE WHEN seen_both_home_and_away AND home_sightings >= 3 AND away_sightings >= 3 THEN 30 WHEN seen_both_home_and_away AND home_sightings >= 2 AND away_sightings >= 2 THEN 25 WHEN seen_both_home_and_away THEN 20 ELSE 0 END) +
            (CASE WHEN distinct_locations >= 10 THEN 20 WHEN distinct_locations >= 5 THEN 15 WHEN distinct_locations >= 3 THEN 10 ELSE 5 END) +
            (CASE WHEN max_distance_km > 20 THEN 15 WHEN max_distance_km > 10 THEN 12 WHEN max_distance_km > 5 THEN 9 WHEN max_distance_km > 2 THEN 6 ELSE 3 END) +
            (CASE WHEN total_sightings >= 50 THEN 10 WHEN total_sightings >= 20 THEN 8 WHEN total_sightings >= 10 THEN 6 WHEN total_sightings >= 5 THEN 4 ELSE 2 END)
          )) >= 80 THEN 'CRITICAL'
          WHEN LEAST(100, GREATEST(0,
            (CASE WHEN distinct_dates >= 10 THEN 25 WHEN distinct_dates >= 5 THEN 20 WHEN distinct_dates >= 3 THEN 15 WHEN distinct_dates >= 2 THEN 10 ELSE 5 END) +
            (CASE WHEN seen_both_home_and_away AND home_sightings >= 3 AND away_sightings >= 3 THEN 30 WHEN seen_both_home_and_away AND home_sightings >= 2 AND away_sightings >= 2 THEN 25 WHEN seen_both_home_and_away THEN 20 ELSE 0 END) +
            (CASE WHEN distinct_locations >= 10 THEN 20 WHEN distinct_locations >= 5 THEN 15 WHEN distinct_locations >= 3 THEN 10 ELSE 5 END) +
            (CASE WHEN max_distance_km > 20 THEN 15 WHEN max_distance_km > 10 THEN 12 WHEN max_distance_km > 5 THEN 9 WHEN max_distance_km > 2 THEN 6 ELSE 3 END) +
            (CASE WHEN total_sightings >= 50 THEN 10 WHEN total_sightings >= 20 THEN 8 WHEN total_sightings >= 10 THEN 6 WHEN total_sightings >= 5 THEN 4 ELSE 2 END)
          )) >= 60 THEN 'HIGH'
          WHEN LEAST(100, GREATEST(0,
            (CASE WHEN distinct_dates >= 10 THEN 25 WHEN distinct_dates >= 5 THEN 20 WHEN distinct_dates >= 3 THEN 15 WHEN distinct_dates >= 2 THEN 10 ELSE 5 END) +
            (CASE WHEN seen_both_home_and_away AND home_sightings >= 3 AND away_sightings >= 3 THEN 30 WHEN seen_both_home_and_away AND home_sightings >= 2 AND away_sightings >= 2 THEN 25 WHEN seen_both_home_and_away THEN 20 ELSE 0 END) +
            (CASE WHEN distinct_locations >= 10 THEN 20 WHEN distinct_locations >= 5 THEN 15 WHEN distinct_locations >= 3 THEN 10 ELSE 5 END) +
            (CASE WHEN max_distance_km > 20 THEN 15 WHEN max_distance_km > 10 THEN 12 WHEN max_distance_km > 5 THEN 9 WHEN max_distance_km > 2 THEN 6 ELSE 3 END) +
            (CASE WHEN total_sightings >= 50 THEN 10 WHEN total_sightings >= 20 THEN 8 WHEN total_sightings >= 10 THEN 6 WHEN total_sightings >= 5 THEN 4 ELSE 2 END)
          )) >= 40 THEN 'MEDIUM'
          ELSE 'LOW'
        END as relevance_label
      FROM network_analysis
      ORDER BY relevance_score DESC, max_distance_km DESC
      LIMIT $4 OFFSET $5
    `, [minDistanceKm, homeRadiusM, minHomeSightings, limit, offset]);

    // For each threat, get ALL observation details
    const threatsWithObservations = await Promise.all(
      threatsResult.map(async (threat: any) => {
        // First try to get observations from locations_legacy (detailed GPS tracks)
        let observationsResult = await query(`
          SELECT
            l.unified_id as id,
            l.bssid,
            l.lat,
            l.lon,
            l.altitude,
            l.accuracy,
            l.level as signal_strength,
            l.time as timestamp_ms,
            TO_TIMESTAMP(l.time / 1000) as observed_at,
            n.ssid,
            n.frequency,
            n.capabilities,
            n.type as radio_type,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home' LIMIT 1)
            ) / 1000.0 as distance_from_home_km
          FROM app.locations_legacy l
          LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
          WHERE l.bssid = $1
            AND l.lat IS NOT NULL
            AND l.lon IS NOT NULL
            AND l.lat BETWEEN -90 AND 90
            AND l.lon BETWEEN -180 AND 180
          ORDER BY l.time DESC
        `, [threat.bssid]);

        // If no observations in locations_legacy, fall back to networks_legacy
        // (which contains last-known position for each network record)
        if (!observationsResult || observationsResult.length === 0) {
          observationsResult = await query(`
            SELECT
              ROW_NUMBER() OVER (ORDER BY lasttime DESC) as id,
              bssid,
              lastlat as lat,
              lastlon as lon,
              0 as altitude,
              0 as accuracy,
              0 as signal_strength,
              lasttime as timestamp_ms,
              CASE
                WHEN lasttime > 0 THEN TO_TIMESTAMP(lasttime / 1000)
                ELSE NULL
              END as observed_at,
              ssid,
              frequency,
              capabilities,
              type as radio_type,
              ST_Distance(
                ST_SetSRID(ST_MakePoint(lastlon, lastlat), 4326)::geography,
                (SELECT location_point::geography FROM app.location_markers WHERE marker_type = 'home' LIMIT 1)
              ) / 1000.0 as distance_from_home_km
            FROM app.networks_legacy
            WHERE bssid = $1
              AND lastlat IS NOT NULL
              AND lastlon IS NOT NULL
              AND lastlat BETWEEN -90 AND 90
              AND lastlon BETWEEN -180 AND 180
            ORDER BY lasttime DESC
          `, [threat.bssid]);
        }

        return {
          // Threat summary
          bssid: threat.bssid,
          ssid: threat.ssid,
          radio_band: threat.radio_band,
          total_sightings: Number(threat.total_sightings),
          home_sightings: Number(threat.home_sightings),
          away_sightings: Number(threat.away_sightings),
          max_distance_km: Number(threat.max_distance_km),
          threat_level: threat.threat_level,
          threat_description: threat.threat_description,
          confidence_score: Number(threat.confidence_score),
          is_mobile_hotspot: threat.is_mobile_hotspot,

          // Relevance scoring fields
          distinct_dates: Number(threat.distinct_dates),
          distinct_locations: Number(threat.distinct_locations),
          time_span_days: Number(threat.time_span_days).toFixed(1),
          seen_both_home_and_away: threat.seen_both_home_and_away,
          relevance_score: Number(threat.relevance_score),
          relevance_label: threat.relevance_label,

          // ALL observation details
          observations: observationsResult.map((obs: any) => ({
            id: obs.unified_id,
            latitude: Number(obs.lat),
            longitude: Number(obs.lon),
            altitude: obs.altitude,
            accuracy: obs.accuracy,
            signal_strength: obs.signal_strength,
            timestamp_ms: obs.timestamp_ms,
            observed_at: obs.observed_at,
            ssid: obs.ssid,
            frequency: obs.frequency,
            capabilities: obs.capabilities,
            radio_type: obs.radio_type,
            distance_from_home_km: Number(obs.distance_from_home_km).toFixed(2)
          }))
        };
      })
    );

    const responseTime = Date.now() - startTime;

    return res.json({
      ok: true,
      count: threatsWithObservations.length,
      total_count: totalCount,
      offset,
      limit,
      responseTime: `${responseTime}ms`,
      parameters: {
        min_distance_km: minDistanceKm,
        home_radius_m: homeRadiusM,
        min_home_sightings: minHomeSightings,
        limit,
        offset
      },
      data: threatsWithObservations
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/wifi/threats] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve WiFi surveillance threats",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/surveillance/wifi/summary
 *
 * Get WiFi surveillance summary statistics
 */
router.get("/wifi/summary", async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    const minDistanceKm = parseFloat(String(req.query.min_distance_km || '0.5'));

    const result = await query(`
      WITH home_zone AS (
        SELECT ST_SetSRID(ST_MakePoint(-83.6968461, 43.02342188), 4326)::geography as home_point
      ),
      network_analysis AS (
        SELECT
          l.bssid,
          n.ssid,
          MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone)
          )) / 1000.0 as max_distance_km,
          COUNT(*) FILTER (WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone),
            500
          )) as home_sightings,
          CASE
            WHEN n.ssid ~* '(iPhone|Android|Galaxy|Pixel)' THEN true
            ELSE false
          END as is_mobile_hotspot,
          CASE
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT home_point FROM home_zone)
            )) / 1000.0 > 20 THEN 'EXTREME'
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT home_point FROM home_zone)
            )) / 1000.0 > 10 THEN 'CRITICAL'
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT home_point FROM home_zone)
            )) / 1000.0 > 5 THEN 'HIGH'
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT home_point FROM home_zone)
            )) / 1000.0 > 2 THEN 'MEDIUM'
            ELSE 'LOW'
          END as threat_level,
          LEAST(MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT home_point FROM home_zone)
          )) / 1000.0 / 10.0, 1.0) as confidence_score
        FROM app.locations_legacy l
        LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
        WHERE l.lat IS NOT NULL
          AND l.lon IS NOT NULL
          AND l.lat BETWEEN -90 AND 90
          AND l.lon BETWEEN -180 AND 180
        GROUP BY l.bssid, n.ssid
        HAVING COUNT(*) FILTER (WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone),
          500
        )) >= 1
        AND MAX(ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT home_point FROM home_zone)
        )) / 1000.0 >= $1
      )
      SELECT
        COUNT(*) as total_threats,
        COUNT(*) FILTER (WHERE threat_level = 'EXTREME') as extreme_threats,
        COUNT(*) FILTER (WHERE threat_level = 'CRITICAL') as critical_threats,
        COUNT(*) FILTER (WHERE threat_level = 'HIGH') as high_threats,
        COUNT(*) FILTER (WHERE threat_level = 'MEDIUM') as medium_threats,
        COUNT(*) FILTER (WHERE threat_level = 'LOW') as low_threats,
        COUNT(*) FILTER (WHERE is_mobile_hotspot = true) as mobile_hotspots,
        AVG(confidence_score) as avg_confidence,
        MAX(max_distance_km) as max_distance_detected,
        AVG(max_distance_km) as avg_threat_distance
      FROM network_analysis
    `, [minDistanceKm]);

    const stats = result[0];

    return res.json({
      ok: true,
      data: {
        total_threats: Number(stats.total_threats || 0),
        by_level: {
          extreme: Number(stats.extreme_threats || 0),
          critical: Number(stats.critical_threats || 0),
          high: Number(stats.high_threats || 0),
          medium: Number(stats.medium_threats || 0),
          low: Number(stats.low_threats || 0)
        },
        mobile_hotspots: Number(stats.mobile_hotspots || 0),
        avg_confidence: Number(stats.avg_confidence || 0).toFixed(3),
        max_distance_detected_km: Number(stats.max_distance_detected || 0).toFixed(2),
        avg_threat_distance_km: Number(stats.avg_threat_distance || 0).toFixed(2),
        detection_settings: {
          min_distance_km: minDistanceKm,
          home_radius_m: 500,
          min_home_sightings: 1
        }
      }
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/wifi/summary] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve WiFi surveillance summary",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/surveillance/location-clusters
 *
 * Clusters observations into distinct locations based on:
 * - Spatial proximity (within 100m radius)
 * - Temporal continuity (10+ minutes at location)
 *
 * Returns count of distinct locations visited
 */
router.get("/location-clusters", async (req: Request, res: Response) => {
  try {
    const radiusMeters = parseFloat(req.query.radius as string) || 100;
    const minDurationMinutes = parseFloat(req.query.min_duration as string) || 10;

    const sql = `
      WITH ordered_observations AS (
        SELECT
          observation_id,
          latitude,
          longitude,
          observation_time,
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography as location,
          LAG(observation_time) OVER (ORDER BY observation_time) as prev_time,
          LAG(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography) OVER (ORDER BY observation_time) as prev_location
        FROM app.wigle_alpha_v3_observations
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND observation_time IS NOT NULL
        ORDER BY observation_time
      ),
      location_groups AS (
        SELECT
          observation_id,
          latitude,
          longitude,
          observation_time,
          location,
          prev_time,
          prev_location,
          -- New cluster when distance > radius OR time gap > duration
          CASE
            WHEN prev_location IS NULL THEN 1
            WHEN ST_Distance(location, prev_location) > $1 THEN 1
            WHEN EXTRACT(EPOCH FROM (observation_time - prev_time)) / 60 > $2 THEN 1
            ELSE 0
          END as is_new_cluster
        FROM ordered_observations
      ),
      clusters AS (
        SELECT
          observation_id,
          latitude,
          longitude,
          observation_time,
          SUM(is_new_cluster) OVER (ORDER BY observation_time) as cluster_id
        FROM location_groups
      ),
      cluster_stats AS (
        SELECT
          cluster_id,
          AVG(latitude) as center_lat,
          AVG(longitude) as center_lon,
          MIN(observation_time) as first_seen,
          MAX(observation_time) as last_seen,
          COUNT(*) as observation_count,
          EXTRACT(EPOCH FROM (MAX(observation_time) - MIN(observation_time))) / 60 as duration_minutes
        FROM clusters
        GROUP BY cluster_id
        HAVING EXTRACT(EPOCH FROM (MAX(observation_time) - MIN(observation_time))) / 60 >= $2
      )
      SELECT
        COUNT(*) as total_clusters,
        SUM(observation_count) as total_observations,
        AVG(duration_minutes) as avg_duration_minutes,
        MIN(first_seen) as earliest_visit,
        MAX(last_seen) as latest_visit
      FROM cluster_stats
    `;

    const result = await query(sql, [radiusMeters, minDurationMinutes]);
    const stats = result[0];

    return res.json({
      ok: true,
      data: {
        total_clusters: parseInt(stats.total_clusters) || 0,
        total_observations: parseInt(stats.total_observations) || 0,
        avg_duration_minutes: parseFloat(stats.avg_duration_minutes) || 0,
        earliest_visit: stats.earliest_visit,
        latest_visit: stats.latest_visit,
        clustering_params: {
          radius_meters: radiusMeters,
          min_duration_minutes: minDurationMinutes
        }
      }
    });
  } catch (error) {
    console.error('[/api/v1/surveillance/location-clusters] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to compute location clusters",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/surveillance/settings
 *
 * Get current detection settings for all radio types
 */
router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await query(`
      SELECT
        setting_id,
        radio_type,
        min_distance_km,
        max_distance_km,
        home_radius_m,
        min_home_sightings,
        min_away_sightings,
        confidence_threshold,
        threat_level_enabled,
        enabled,
        description,
        created_at,
        updated_at
      FROM app.detection_settings
      WHERE enabled = true
      ORDER BY radio_type
    `);

    return res.json({
      ok: true,
      data: result.map((row: any) => ({
        setting_id: row.setting_id,
        radio_type: row.radio_type,
        min_distance_km: Number(row.min_distance_km),
        max_distance_km: row.max_distance_km ? Number(row.max_distance_km) : null,
        home_radius_m: Number(row.home_radius_m),
        min_home_sightings: row.min_home_sightings,
        min_away_sightings: row.min_away_sightings,
        confidence_threshold: Number(row.confidence_threshold),
        threat_level_enabled: row.threat_level_enabled,
        enabled: row.enabled,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at
      }))
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/settings] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve detection settings",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/surveillance/settings
 *
 * Update detection settings for a radio type
 *
 * Body:
 * {
 *   "radio_type": "wifi",
 *   "min_distance_km": 0.5,
 *   "max_distance_km": 100,
 *   "home_radius_m": 500,
 *   "min_home_sightings": 1,
 *   "min_away_sightings": 1,
 *   "confidence_threshold": 0.3,
 *   "threat_level_enabled": {"EXTREME": true, "CRITICAL": true, ...}
 * }
 */
router.post("/settings", async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }
    const {
      radio_type,
      min_distance_km,
      max_distance_km,
      home_radius_m,
      min_home_sightings,
      min_away_sightings,
      confidence_threshold,
      threat_level_enabled
    } = req.body;

    // Validate required fields
    if (!radio_type) {
      return res.status(400).json({
        ok: false,
        error: "Missing required field: radio_type"
      });
    }

    // Call the update function
    const result = await query(`
      SELECT app.update_detection_settings(
        $1::TEXT,    -- radio_type
        $2::NUMERIC, -- min_distance_km
        $3::NUMERIC, -- max_distance_km
        $4::NUMERIC, -- home_radius_m
        $5::INTEGER, -- min_home_sightings
        $6::INTEGER, -- min_away_sightings
        $7::NUMERIC, -- confidence_threshold
        $8::JSONB    -- threat_level_enabled
      ) as setting_id
    `, [
      radio_type,
      min_distance_km || null,
      max_distance_km || null,
      home_radius_m || null,
      min_home_sightings || null,
      min_away_sightings || null,
      confidence_threshold || null,
      threat_level_enabled ? JSON.stringify(threat_level_enabled) : null
    ]);

    const settingId = result[0]?.setting_id;

    return res.json({
      ok: true,
      message: "Detection settings updated successfully",
      setting_id: settingId
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/settings] POST error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to update detection settings",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/surveillance/feedback
 *
 * Record user feedback on a detected threat (for adaptive learning)
 *
 * Body:
 * {
 *   "bssid": "AA:BB:CC:DD:EE:FF",
 *   "ssid": "NetworkName",
 *   "threat_level": "HIGH",
 *   "detected_distance_km": 5.2,
 *   "user_rating": "false_positive" | "real_threat" | "uncertain",
 *   "user_notes": "This is my work network",
 *   "whitelist_network": true
 * }
 */
router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }
    const {
      bssid,
      ssid,
      threat_level,
      detected_distance_km,
      user_rating,
      user_notes,
      whitelist_network
    } = req.body;

    // Validate required fields
    if (!bssid || !threat_level || !detected_distance_km || !user_rating) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: bssid, threat_level, detected_distance_km, user_rating"
      });
    }

    // Validate user_rating enum
    const validRatings = ['false_positive', 'real_threat', 'uncertain'];
    if (!validRatings.includes(user_rating)) {
      return res.status(400).json({
        ok: false,
        error: `Invalid user_rating. Must be one of: ${validRatings.join(', ')}`
      });
    }

    // Call the feedback recording function
    const result = await query(`
      SELECT app.record_threat_feedback(
        $1::TEXT,    -- bssid
        $2::TEXT,    -- ssid
        $3::TEXT,    -- threat_level
        $4::NUMERIC, -- detected_distance_km
        $5::TEXT,    -- user_rating
        $6::TEXT,    -- user_notes
        $7::BOOLEAN  -- auto_whitelist
      ) as feedback_id
    `, [
      bssid,
      ssid || null,
      threat_level,
      detected_distance_km,
      user_rating,
      user_notes || null,
      whitelist_network || false
    ]);

    const feedbackId = result[0]?.feedback_id;

    return res.json({
      ok: true,
      message: "Feedback recorded successfully",
      feedback_id: feedbackId,
      whitelisted: whitelist_network || false
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/feedback] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to record feedback",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/surveillance/learning/adjust
 *
 * Trigger adaptive learning threshold adjustment based on recent feedback
 *
 * This analyzes the last 30 days of user feedback and automatically adjusts
 * detection thresholds to reduce false positives while maintaining sensitivity.
 */
router.post("/learning/adjust", async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    // Call the adaptive learning function
    const result = await query(`
      SELECT * FROM app.adjust_thresholds_from_feedback()
    `);

    if (result.rows.length === 0) {
      return res.json({
        ok: true,
        message: "No adjustments needed - insufficient feedback or thresholds are optimal",
        adjustments: []
      });
    }

    return res.json({
      ok: true,
      message: "Thresholds adjusted based on user feedback",
      adjustments: result.map((row: any) => ({
        radio_type: row.radio_type,
        old_threshold: Number(row.old_threshold),
        new_threshold: Number(row.new_threshold),
        adjustment_reason: row.adjustment_reason
      }))
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/learning/adjust] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to adjust thresholds",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/surveillance/feedback/stats
 *
 * Get feedback statistics for monitoring learning system health
 */
router.get("/feedback/stats", async (_req: Request, res: Response) => {
  try {
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }

    const result = await query(`
      WITH recent_feedback AS (
        SELECT * FROM app.threat_feedback
        WHERE feedback_timestamp > NOW() - INTERVAL '30 days'
      )
      SELECT
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE user_rating = 'false_positive') as false_positives,
        COUNT(*) FILTER (WHERE user_rating = 'real_threat') as real_threats,
        COUNT(*) FILTER (WHERE user_rating = 'uncertain') as uncertain,
        COUNT(*) FILTER (WHERE was_whitelisted = true) as whitelisted_count,
        COUNT(DISTINCT bssid) as unique_networks_rated,
        AVG(detected_distance_km) as avg_threat_distance
      FROM recent_feedback
    `);

    const stats = result[0];

    const total = Number(stats.total_feedback || 0);
    const falsePositives = Number(stats.false_positives || 0);
    const realThreats = Number(stats.real_threats || 0);

    return res.json({
      ok: true,
      data: {
        total_feedback: total,
        false_positives: falsePositives,
        real_threats: realThreats,
        uncertain: Number(stats.uncertain || 0),
        whitelisted_count: Number(stats.whitelisted_count || 0),
        unique_networks_rated: Number(stats.unique_networks_rated || 0),
        avg_threat_distance_km: Number(stats.avg_threat_distance || 0).toFixed(2),
        false_positive_rate: total > 0 ? (falsePositives / total * 100).toFixed(1) + '%' : '0%',
        real_threat_rate: total > 0 ? (realThreats / total * 100).toFixed(1) + '%' : '0%'
      }
    });

  } catch (error) {
    console.error('[/api/v1/surveillance/feedback/stats] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve feedback statistics",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
