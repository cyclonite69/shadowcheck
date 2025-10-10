// server/routes/visualize_v2.ts
import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/visualize_v2?limit=500
 * Recent observations (enriched) as GeoJSON, with:
 * - Wi-Fi fields (frequency_mhz/channel/band) only when meaningful
 * - Cell normalization (cell_mcc/mnc/cid when bssid is MCC_MNC_CID)
 * - BLE service UUIDs (ble_services[]) parsed from capabilities for BT rows
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 500) || 500, 5000);
  try {
    const sql = `
      WITH rows AS (
        SELECT
          id, bssid, lat, lon, level,
          time::text  AS time,
          time        AS time_epoch_ms,
          to_char( to_timestamp(time/1000.0) AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
          radio_short, security_short,
          frequency_at_time, frequency_mhz, channel, band,
          -- cell fields (only when radio is Cell* and bssid = MCC_MNC_CID)
          CASE WHEN radio_short LIKE 'Cell%'
                 AND bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(bssid, '_', 1)::int
               ELSE NULL END AS cell_mcc,
          CASE WHEN radio_short LIKE 'Cell%'
                 AND bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(bssid, '_', 2)::int
               ELSE NULL END AS cell_mnc,
          CASE WHEN radio_short LIKE 'Cell%'
                 AND bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(bssid, '_', 3)::bigint
               ELSE NULL END AS cell_cid,
          -- quick MAC-looking flag (for your sanity / debugging)
          (bssid ~* '^[0-9a-f]{2}(:[0-9a-f]{2}){5}$') AS looks_like_mac,
          -- BLE service UUIDs (only for BT)
          CASE WHEN radio_short = 'BT' THEN (
            SELECT array_agg(DISTINCT m[1])::text[]
            FROM regexp_matches(coalesce(capabilities_at_time,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
          ) ELSE NULL END AS ble_services
        FROM app.location_details_enriched
        WHERE lat IS NOT NULL AND lon IS NOT NULL
        ORDER BY time DESC
        LIMIT $1
      )
      SELECT json_build_object(
        'type','FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type','Feature',
            'geometry', json_build_object('type','Point','coordinates', json_build_array(r.lon,r.lat)),
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
              'looks_like_mac', r.looks_like_mac,
              'cell_mcc', r.cell_mcc,
              'cell_mnc', r.cell_mnc,
              'cell_cid', r.cell_cid,
              'ble_services', r.ble_services
            )
          )
        )
      ) AS fc
      FROM rows r;
    `;
    const { rows } = await query(sql, [limit]);
    const fc = rows?.[0]?.fc ?? { type: "FeatureCollection", features: [] };
    res.json(fc);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
