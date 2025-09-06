// server/routes/visualize_latest.ts
import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/visualize_latest?limit=500
 * Most-recent sighting per BSSID (enriched), as GeoJSON.
 * Includes bbox so the client can fit the map.
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 500) || 500, 5000);

  const sql = `
    WITH latest AS (
      SELECT bssid, MAX(time) AS max_time
      FROM app.location_details_enriched
      GROUP BY bssid
    ),
    rows AS (
      SELECT d.*
      FROM app.location_details_enriched d
      JOIN latest x ON x.bssid = d.bssid AND x.max_time = d.time
      WHERE d.lat IS NOT NULL AND d.lon IS NOT NULL
      ORDER BY d.time DESC
      LIMIT $1
    ),
    extent AS (
      SELECT
        MIN(lat) AS min_lat,  MAX(lat) AS max_lat,
        MIN(lon) AS min_lon,  MAX(lon) AS max_lon
      FROM rows
    )
    SELECT
      json_build_object(
        'type','FeatureCollection',
        'bbox',
          CASE
            WHEN e.min_lon IS NULL THEN NULL
            ELSE json_build_array(e.min_lon, e.min_lat, e.max_lon, e.max_lat)
          END,
        'features',
          COALESCE(
            json_agg(
              json_build_object(
                'type','Feature',
                'geometry', json_build_object(
                  'type','Point',
                  'coordinates', json_build_array(r.lon, r.lat)
                ),
                'properties', json_build_object(
                  'id', r.id,
                  'bssid', r.bssid,
                  'level', r.level,
                  'radio', r.radio_short,
                  'security', r.security_short,
                  'time', r.time::text,
                  'time_epoch_ms', r.time,
                  'time_iso', to_char(
                    to_timestamp(r.time/1000.0) AT TIME ZONE 'UTC',
                    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                  ),
                  'frequency_at_time', r.frequency_at_time,
                  'frequency_mhz', r.frequency_mhz,
                  'channel', r.channel,
                  'band', r.band
                )
              )
              ORDER BY r.time DESC
            ),
            '[]'::json
          )
      ) AS fc
    FROM rows r
    CROSS JOIN extent e;
  `;

  try {
    const { rows } = await query(sql, [limit]);
    const fc = rows?.[0]?.fc ?? { type: "FeatureCollection", features: [] };
    res.json(fc);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
