import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/within?lat=..&lon=..&radius_m=200&limit=200
 * Haversine (no PostGIS). Reads from enriched view.
 */
router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const radius = Number(req.query.radius_m ?? 200); // meters
  const limit  = Math.min(Number(req.query.limit ?? 200) || 200, 2000);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ ok: false, error: "lat and lon are required numbers" });
  }

  const sql = `
    WITH params AS (
      SELECT $1::float8 AS lat, $2::float8 AS lon, $3::float8 AS radius_m
    )
    SELECT
      d.id, d.bssid, d.lat, d.lon, d.level,
      d.time::text  AS time,
      d.time        AS time_epoch_ms,
      to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
               'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
      d.radio_short, d.security_short,
      d.frequency_at_time, d.frequency_mhz, d.channel, d.band,
      2 * 6371000 * asin(
        sqrt(
          sin(radians((d.lat - p.lat) / 2))^2 +
          cos(radians(p.lat)) * cos(radians(d.lat)) *
          sin(radians((d.lon - p.lon) / 2))^2
        )
      ) AS distance_m
    FROM app.location_details_enriched d
    CROSS JOIN params p
    WHERE d.lat IS NOT NULL AND d.lon IS NOT NULL
    HAVING 2 * 6371000 * asin(
      sqrt(
        sin(radians((d.lat - p.lat) / 2))^2 +
        cos(radians(p.lat)) * cos(radians(d.lat)) *
        sin(radians((d.lon - p.lon) / 2))^2
      )
    ) <= p.radius_m
    ORDER BY distance_m ASC
    LIMIT $4
  `;

  try {
    const { rows } = await query(sql, [lat, lon, radius, limit]);
    res.json({ ok: true, count: rows.length, rows });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
