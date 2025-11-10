/**
 * Network Timeline API - Show when networks appear throughout the day/week
 */

import { Router, Request, Response } from "express";
import { query } from "../db.js";

const router = Router();

/**
 * GET /api/v1/network-timeline/hourly
 *
 * Returns network observations grouped by hour of day (0-23)
 * Useful for seeing which networks appear at different times
 *
 * Query params:
 *   - days: number of days to look back (default: 7)
 *   - bssid: optional filter by specific BSSID
 */
router.get("/hourly", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const bssid = req.query.bssid as string | undefined;

    const sql = `
      SELECT
        EXTRACT(HOUR FROM TO_TIMESTAMP(time/1000)) AS hour_of_day,
        bssid,
        COUNT(*) AS observation_count,
        AVG(level) AS avg_signal,
        MIN(TO_TIMESTAMP(time/1000)) AS first_seen,
        MAX(TO_TIMESTAMP(time/1000)) AS last_seen,
        COUNT(DISTINCT DATE(TO_TIMESTAMP(time/1000))) AS days_seen
      FROM app.locations_legacy
      WHERE time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${days} days'))::bigint * 1000
        ${bssid ? `AND bssid = $1` : ''}
      GROUP BY EXTRACT(HOUR FROM TO_TIMESTAMP(time/1000)), bssid
      ORDER BY hour_of_day, observation_count DESC
    `;

    const result = bssid
      ? await query(sql, [bssid])
      : await query(sql);

    return res.json({
      ok: true,
      data: {
        days_analyzed: days,
        bssid_filter: bssid || null,
        hourly_observations: result.rows.map(row => ({
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
 *   - limit: max number of networks to return (default: 50)
 */
router.get("/heatmap", async (req: Request, res: Response) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 4;
    const limit = parseInt(req.query.limit as string) || 50;

    const sql = `
      WITH network_activity AS (
        SELECT
          bssid,
          EXTRACT(DOW FROM TO_TIMESTAMP(time/1000)) AS day_of_week,
          EXTRACT(HOUR FROM TO_TIMESTAMP(time/1000)) AS hour_of_day,
          COUNT(*) AS observation_count,
          AVG(level) AS avg_signal
        FROM app.locations_legacy
        WHERE time >= EXTRACT(EPOCH FROM (NOW() - INTERVAL '${weeks} weeks'))::bigint * 1000
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
        n.ssid,
        na.day_of_week,
        na.hour_of_day,
        na.observation_count,
        na.avg_signal
      FROM network_activity na
      INNER JOIN top_networks tn ON na.bssid = tn.bssid
      LEFT JOIN app.networks_legacy n ON na.bssid = n.bssid
      ORDER BY na.bssid, na.day_of_week, na.hour_of_day
    `;

    const result = await query(sql);

    // Group by BSSID for easier client-side rendering
    const heatmapData: Record<string, any> = {};

    for (const row of result.rows) {
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
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT
        COUNT(DISTINCT bssid) AS total_networks,
        COUNT(*) AS total_observations,
        MIN(TO_TIMESTAMP(time/1000)) AS earliest_observation,
        MAX(TO_TIMESTAMP(time/1000)) AS latest_observation,
        COUNT(DISTINCT DATE(TO_TIMESTAMP(time/1000))) AS days_with_data
      FROM app.locations_legacy
    `;

    const result = await query(sql);
    const row = result.rows[0];

    return res.json({
      ok: true,
      data: {
        total_networks: parseInt(row.total_networks),
        total_observations: parseInt(row.total_observations),
        earliest_observation: row.earliest_observation,
        latest_observation: row.latest_observation,
        days_with_data: parseInt(row.days_with_data)
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

export default router;
