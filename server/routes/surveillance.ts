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
import { getPool } from '../db/connection';

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

    // Parse query parameters with defaults
    const minDistanceKm = parseFloat(String(req.query.min_distance_km || '0.5'));
    const homeRadiusM = parseFloat(String(req.query.home_radius_m || '500'));
    const minHomeSightings = parseInt(String(req.query.min_home_sightings || '1'));
    const limit = Math.min(parseInt(String(req.query.limit || '100')), 500);

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

    // Call the WiFi-specific surveillance detection function
    const threatsResult = await pool.query(`
      SELECT * FROM app.get_wifi_surveillance_threats(
        $1::NUMERIC,  -- min_distance_km
        $2::NUMERIC,  -- home_radius_m
        $3::INTEGER,  -- min_home_sightings
        $4::INTEGER   -- limit
      )
    `, [minDistanceKm, homeRadiusM, minHomeSightings, limit]);

    // For each threat, get ALL observation details
    const threatsWithObservations = await Promise.all(
      threatsResult.rows.map(async (threat) => {
        // First try to get observations from locations_legacy (detailed GPS tracks)
        let observationsResult = await pool.query(`
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
        if (observationsResult.rows.length === 0) {
          observationsResult = await pool.query(`
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

          // ALL observation details
          observations: observationsResult.rows.map(obs => ({
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
      responseTime: `${responseTime}ms`,
      parameters: {
        min_distance_km: minDistanceKm,
        home_radius_m: homeRadiusM,
        min_home_sightings: minHomeSightings,
        limit
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

    const minDistanceKm = parseFloat(String(req.query.min_distance_km || '0.5'));

    // Get summary stats by threat level
    const result = await pool.query(`
      WITH wifi_threats AS (
        SELECT * FROM app.get_wifi_surveillance_threats($1::NUMERIC, 500, 1, 10000)
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
      FROM wifi_threats
    `, [minDistanceKm]);

    const stats = result.rows[0];

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
 * GET /api/v1/surveillance/settings
 *
 * Get current detection settings for all radio types
 */
router.get("/settings", async (_req: Request, res: Response) => {
  try {
    const pool = getPool();

    const result = await pool.query(`
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
      data: result.rows.map(row => ({
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
    const result = await pool.query(`
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

    const settingId = result.rows[0]?.setting_id;

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
    const result = await pool.query(`
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

    const feedbackId = result.rows[0]?.feedback_id;

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

    // Call the adaptive learning function
    const result = await pool.query(`
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
      adjustments: result.rows.map(row => ({
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

    const result = await pool.query(`
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

    const stats = result.rows[0];

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
