import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/networks?limit=100&before_time_ms=...
 * Cursor pagination on time (epoch ms).
 * Reads from app.location_details_enriched to include frequency_mhz, channel, band.
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
  const before = Number(req.query.before_time_ms);
  const hasBefore = Number.isFinite(before);

  const where = hasBefore ? "WHERE d.time < $1" : "";
  const limPos = hasBefore ? 2 : 1;

  const sql = `
    SELECT
      d.id, d.bssid, d.level, d.lat, d.lon, d.altitude, d.accuracy,
      d.time::text  AS time,
      d.time        AS time_epoch_ms,
      to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
               'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
      d.ssid_at_time,
      d.frequency_at_time,
      d.frequency_mhz,
      d.channel,
      d.band,
      d.radio_short,
      d.security_short,
      d.cipher_short,
      d.flags_short
    FROM app.location_details_enriched d
    ${where}
    ORDER BY d.time DESC
    LIMIT $${limPos}
  `;

  try {
    const params: any[] = hasBefore ? [before, limit] : [limit];
    const { rows } = await query(sql, params);
    res.json({
      ok: true,
      count: rows.length,
      cursor: {
        next_before_time_ms: rows.length ? rows[rows.length - 1].time_epoch_ms : null
      },
      rows
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
