import { Router } from "express";
import { query } from "../db.js";

const router = Router();

/**
 * GET /api/v1/analytics?recent_limit=20&before_time_ms=...
 * Counts + recent list (cursor pagination). Uses enriched view.
 */
router.get("/", async (req, res) => {
  const recentLimit = Math.min(Number(req.query.recent_limit ?? 20) || 20, 200);
  const before = Number(req.query.before_time_ms);
  const hasBefore = Number.isFinite(before);

  try {
    const countsSql = `
      SELECT
        (SELECT COUNT(*) FROM app.locations) AS location_rows,
        (SELECT COUNT(*) FROM app.networks)  AS network_rows
    `;
    const counts = await query(countsSql);

    const where = hasBefore
      ? "WHERE d.lat IS NOT NULL AND d.lon IS NOT NULL AND d.time < $1"
      : "WHERE d.lat IS NOT NULL AND d.lon IS NOT NULL";
    const limPos = hasBefore ? 2 : 1;

    const recentSql = `
      SELECT
        d.id, d.bssid, d.lat, d.lon, d.level,
        d.time::text  AS time,
        d.time        AS time_epoch_ms,
        to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
                 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
        d.radio_short, d.security_short,
        d.frequency_at_time, d.frequency_mhz, d.channel, d.band
      FROM app.locations_details_enriched d
      ${where}
      ORDER BY d.time DESC
      LIMIT $${limPos}
    `;
    const recent = await query(recentSql, hasBefore ? [before, recentLimit] : [recentLimit]);

    res.json({
      ok: true,
      counts: counts.rows[0] ?? {},
      cursor: {
        next_before_time_ms: recent.rows.length ? recent.rows[recent.rows.length - 1].time_epoch_ms : null
      },
      recent: recent.rows
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
