/**
 * Network Timeline API - Show when networks appear throughout the day/week
 */

import { Router, Request, Response } from "express";
import { query } from "../db/connection.js";

const router = Router();

/**
 * GET /api/v1/network-timeline/hourly
 *
 * Returns network observations grouped by hour of day (0-23)
 * Useful for seeing which networks appear at different times
 *
 * Query params:
 *   - days: number of days to look back (default: 7)
 *   - bssids: comma-separated list of BSSIDs to filter (optional)
 *   - lat: center latitude for radius filter (optional, requires lon & radius)
 *   - lon: center longitude for radius filter (optional, requires lat & radius)
 *   - radius: radius in meters (optional, requires lat & lon, max 50000)
 *   - limit: max number of networks to return (default: 20)
 */
router.get("/hourly", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const bssids = req.query.bssids ? (req.query.bssids as string).split(',').map(b => b.trim()) : undefined;

    // Radius filter params
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? Math.min(parseFloat(req.query.radius as string), 50000) : undefined;

    const hasRadiusFilter = lat !== undefined && lon !== undefined && radius !== undefined;

    const params: any[] = [];
    let paramIndex = 1;

    let sql = `
      WITH filtered_markers AS (
        SELECT
          bssid,
          to_timestamp(time/1000) as observed_at,
          level as signal_strength,
          ST_SetSRID(ST_MakePoint(lon, lat), 4326) as location
        FROM app.locations_legacy
        WHERE to_timestamp(time/1000) >= NOW() - INTERVAL '${days} days'
          AND lat IS NOT NULL AND lon IS NOT NULL
    `;

    // Add radius filter if provided
    if (hasRadiusFilter) {
      sql += `
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      params.push(lon, lat, radius);
      paramIndex += 3;
    }

    // Add BSSID filter if provided
    if (bssids && bssids.length > 0) {
      sql += ` AND bssid = ANY($${paramIndex}::text[])`;
      params.push(bssids);
      paramIndex++;
    }

    sql += `
      ),
      top_networks AS (
        SELECT bssid
        FROM filtered_markers
        GROUP BY bssid
        ORDER BY COUNT(*) DESC
        LIMIT ${limit}
      )
      SELECT
        EXTRACT(HOUR FROM fm.observed_at) AS hour_of_day,
        fm.bssid,
        COUNT(*) AS observation_count,
        AVG(fm.signal_strength) AS avg_signal,
        MIN(fm.observed_at) AS first_seen,
        MAX(fm.observed_at) AS last_seen,
        COUNT(DISTINCT DATE(fm.observed_at)) AS days_seen
      FROM filtered_markers fm
      INNER JOIN top_networks tn ON fm.bssid = tn.bssid
      GROUP BY EXTRACT(HOUR FROM fm.observed_at), fm.bssid
      ORDER BY hour_of_day, observation_count DESC
    `;

    const rows = await query(sql, params);

    return res.json({
      ok: true,
      data: {
        days_analyzed: days,
        bssid_filter: bssids || null,
        radius_filter: hasRadiusFilter ? { lat, lon, radius } : null,
        hourly_observations: rows.map((row: any) => ({
          hour: parseInt(row.hour_of_day),
          bssid: row.bssid,
          observation_count: parseInt(row.observation_count),
          avg_signal: parseFloat(row.avg_signal),
          first_seen: row.first_seen,
          last_seen: row.last_seen,
          days_seen: parseInt(row.days_seen)
        }))
      }
    });
  } catch (error) {
    console.error('[/api/v1/network-timeline/hourly] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch hourly timeline",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/network-timeline/heatmap
 *
 * Returns a heatmap of network activity by hour and day of week
 *
 * Query params:
 *   - weeks: number of weeks to look back (default: 4)
 *   - limit: max number of networks to return (default: 20)
 *   - bssids: comma-separated list of BSSIDs to filter (optional)
 *   - lat: center latitude for radius filter (optional, requires lon & radius)
 *   - lon: center longitude for radius filter (optional, requires lat & radius)
 *   - radius: radius in meters (optional, requires lat & lon, max 50000)
 */
router.get("/heatmap", async (req: Request, res: Response) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 4;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const bssids = req.query.bssids ? (req.query.bssids as string).split(',').map(b => b.trim()) : undefined;

    // Radius filter params
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? Math.min(parseFloat(req.query.radius as string), 50000) : undefined;

    const hasRadiusFilter = lat !== undefined && lon !== undefined && radius !== undefined;

    const params: any[] = [];
    let paramIndex = 1;

    let sql = `
      WITH filtered_markers AS (
        SELECT
          bssid,
          to_timestamp(time/1000) as observed_at,
          level as signal_strength,
          ST_SetSRID(ST_MakePoint(lon, lat), 4326) as location
        FROM app.locations_legacy
        WHERE to_timestamp(time/1000) >= NOW() - INTERVAL '${weeks} weeks'
          AND lat IS NOT NULL AND lon IS NOT NULL
    `;

    if (hasRadiusFilter) {
      sql += `
        AND ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      params.push(lon, lat, radius);
      paramIndex += 3;
    }

    if (bssids && bssids.length > 0) {
      sql += ` AND bssid = ANY($${paramIndex}::text[])`;
      params.push(bssids);
      paramIndex++;
    }

    sql += `
      ),
      network_activity AS (
        SELECT
          bssid,
          EXTRACT(DOW FROM observed_at) AS day_of_week,
          EXTRACT(HOUR FROM observed_at) AS hour_of_day,
          COUNT(*) AS observation_count,
          AVG(signal_strength) AS avg_signal
        FROM filtered_markers
        GROUP BY bssid, day_of_week, hour_of_day
      ),
      top_networks AS (
        SELECT bssid
        FROM network_activity
        GROUP BY bssid
        ORDER BY SUM(observation_count) DESC
        LIMIT ${limit}
      )
      SELECT
        na.bssid,
        COALESCE(n.ssid, '(hidden)') as ssid,
        na.day_of_week,
        na.hour_of_day,
        na.observation_count,
        na.avg_signal
      FROM network_activity na
      INNER JOIN top_networks tn ON na.bssid = tn.bssid
      LEFT JOIN app.networks_legacy n ON na.bssid = n.bssid
      ORDER BY na.bssid, na.day_of_week, na.hour_of_day
    `;

    const rows = await query(sql, params);

    // Group by BSSID for easier client-side rendering
    const heatmapData: Record<string, any> = {};

    for (const row of rows) {
      const bssid = row.bssid;
      if (!heatmapData[bssid]) {
        heatmapData[bssid] = {
          bssid,
          ssid: row.ssid || '(hidden)',
          activity: Array(7).fill(null).map(() => Array(24).fill(0))
        };
      }

      const dow = parseInt(row.day_of_week);
      const hour = parseInt(row.hour_of_day);
      heatmapData[bssid].activity[dow][hour] = parseInt(row.observation_count);
    }

    return res.json({
      ok: true,
      data: {
        weeks_analyzed: weeks,
        radius_filter: hasRadiusFilter ? { lat, lon, radius } : null,
        networks: Object.values(heatmapData)
      }
    });
  } catch (error) {
    console.error('[/api/v1/network-timeline/heatmap] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch heatmap data",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/network-timeline/summary
 *
 * Returns summary statistics about network appearances over time
 *
 * Query params:
 *   - lat: center latitude for radius filter (optional, requires lon & radius)
 *   - lon: center longitude for radius filter (optional, requires lat & radius)
 *   - radius: radius in meters (optional, requires lat & lon, max 50000)
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? Math.min(parseFloat(req.query.radius as string), 50000) : undefined;

    const hasRadiusFilter = lat !== undefined && lon !== undefined && radius !== undefined;

    const params: any[] = [];
    let paramIndex = 1;

    let sql = `
      SELECT
        COUNT(DISTINCT bssid) AS total_networks,
        COUNT(*) AS total_observations,
        MIN(to_timestamp(time/1000)) AS earliest_observation,
        MAX(to_timestamp(time/1000)) AS latest_observation,
        COUNT(DISTINCT DATE(to_timestamp(time/1000))) AS days_with_data
      FROM app.locations_legacy
      WHERE lat IS NOT NULL AND lon IS NOT NULL
    `;

    if (hasRadiusFilter) {
      sql += `
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      params.push(lon, lat, radius);
    }

    const rows = await query(sql, params);
    const row = rows[0];

    return res.json({
      ok: true,
      data: {
        total_networks: parseInt(row.total_networks),
        total_observations: parseInt(row.total_observations),
        earliest_observation: row.earliest_observation,
        latest_observation: row.latest_observation,
        days_with_data: parseInt(row.days_with_data),
        radius_filter: hasRadiusFilter ? { lat, lon, radius } : null
      }
    });
  } catch (error) {
    console.error('[/api/v1/network-timeline/summary] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch timeline summary",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/network-timeline/available-networks
 *
 * Returns list of available networks for selection
 *
 * Query params:
 *   - days: number of days to look back (default: 7)
 *   - lat: center latitude for radius filter (optional, requires lon & radius)
 *   - lon: center longitude for radius filter (optional, requires lat & radius)
 *   - radius: radius in meters (optional, requires lat & lon, max 50000)
 *   - limit: max number of networks to return (default: 50)
 */
router.get("/available-networks", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? Math.min(parseFloat(req.query.radius as string), 50000) : undefined;

    const hasRadiusFilter = lat !== undefined && lon !== undefined && radius !== undefined;

    const params: any[] = [];
    let paramIndex = 1;

    let sql = `
      SELECT
        lm.bssid,
        COALESCE(n.ssid, '(hidden)') as ssid,
        COUNT(*) as observation_count,
        AVG(lm.level) as avg_signal,
        MAX(to_timestamp(lm.time/1000)) as last_seen
      FROM app.locations_legacy lm
      LEFT JOIN app.networks_legacy n ON lm.bssid = n.bssid
      WHERE to_timestamp(lm.time/1000) >= NOW() - INTERVAL '${days} days'
        AND lm.lat IS NOT NULL AND lm.lon IS NOT NULL
    `;

    if (hasRadiusFilter) {
      sql += `
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(lm.lon, lm.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      params.push(lon, lat, radius);
    }

    sql += `
      GROUP BY lm.bssid, n.ssid
      ORDER BY observation_count DESC
      LIMIT ${limit}
    `;

    const rows = await query(sql, params);

    return res.json({
      ok: true,
      data: {
        days_analyzed: days,
        radius_filter: hasRadiusFilter ? { lat, lon, radius } : null,
        networks: rows.map((row: any) => ({
          bssid: row.bssid,
          ssid: row.ssid || '(hidden)',
          observation_count: parseInt(row.observation_count),
          avg_signal: parseFloat(row.avg_signal),
          last_seen: row.last_seen
        }))
      }
    });
  } catch (error) {
    console.error('[/api/v1/network-timeline/available-networks] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to fetch available networks",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
