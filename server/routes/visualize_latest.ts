// server/routes/visualize_latest.ts
import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/visualize_latest?limit=500
 * Most-recent sighting per BSSID (enriched), as GeoJSON.
 * Adds cell_mcc/mnc/cid for cellular IDs shaped like MCC_MNC_CID,
 * and ble_services[] for BT rows parsed from capabilities.
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
      SELECT
        d.id, d.bssid, d.level, d.lat, d.lon,
        d.time::text AS time,
        d.time       AS time_epoch_ms,
        to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
                 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
        d.radio_short, d.security_short,
        d.frequency_at_time, d.frequency_mhz, d.channel, d.band,
        -- cell fields (only when radio is Cell* and bssid = MCC_MNC_CID)
        CASE WHEN d.radio_short LIKE 'Cell%'
               AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
             THEN split_part(d.bssid, '_', 1)::int
             ELSE NULL END AS cell_mcc,
        CASE WHEN d.radio_short LIKE 'Cell%'
               AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
             THEN split_part(d.bssid, '_', 2)::int
             ELSE NULL END AS cell_mnc,
        CASE WHEN d.radio_short LIKE 'Cell%'
               AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
             THEN split_part(d.bssid, '_', 3)::bigint
             ELSE NULL END AS cell_cid,
        -- BLE service UUIDs (only for BT)
        CASE WHEN d.radio_short = 'BT' THEN (
          SELECT array_agg(DISTINCT m[1])::text[]
          FROM regexp_matches(coalesce(d.capabilities_at_time,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
        ) ELSE NULL END AS ble_services
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
    SELECT json_build_object(
      'type','FeatureCollection',
      'bbox', CASE
                WHEN e.min_lon IS NULL THEN NULL
                ELSE json_build_array(e.min_lon, e.min_lat, e.max_lon, e.max_lat)
              END,
      'features',
        COALESCE(
          json_agg(
            json_build_object(
              'type','Feature',
              'geometry', json_build_object('type','Point','coordinates', json_build_array(r.lon, r.lat)),
              'properties', json_build_object(
                'id', r.id,
                'bssid', r.bssid,
                'level', r.level,
                'radio', r.radio_short,
                'security', r.security_short,
                'time', r.time,
                'time_epoch_ms', r.time_epoch_ms,
                'time_iso', r.time_iso,
                'frequency_at_time', r.frequency_at_time,
                'frequency_mhz', r.frequency_mhz,
                'channel', r.channel,
                'band', r.band,
                'cell_mcc', r.cell_mcc,
                'cell_mnc', r.cell_mnc,
                'cell_cid', r.cell_cid,
                'ble_services', r.ble_services
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
