// server/routes/visualize_v2.ts
import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/visualize_v2?limit=500
 * GeoJSON of recent observations (enriched) + safe cellular parsing.
 * - Keeps exact frequency (frequency_at_time) AND derived (frequency_mhz/channel/band)
 * - Adds looks_like_mac boolean
 * - For cellular rows in underscore form MCC_MNC_CID, extracts cell_mcc/mnc/cell (CID/ECI)
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 500) || 500, 5000);

  const sql = `
    SELECT
      id, bssid, lat, lon, level,
      time::text  AS time,
      time        AS time_epoch_ms,
      to_char( to_timestamp(time/1000.0) AT TIME ZONE 'UTC',
               'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
      radio_short, security_short,
      frequency_at_time, frequency_mhz, channel, band,
      (bssid ~* '^[0-9a-f]{2}(:[0-9a-f]{2}){5}$') AS looks_like_mac,
      CASE
        WHEN radio_short LIKE 'Cell%' AND bssid ~ '^[0-9]+(_[0-9]+){2,4}$'
          THEN split_part(bssid, '_', 1)::int
        ELSE NULL
      END AS cell_mcc,
      CASE
        WHEN radio_short LIKE 'Cell%' AND bssid ~ '^[0-9]+(_[0-9]+){2,4}$'
          THEN split_part(bssid, '_', 2)::int
        ELSE NULL
      END AS cell_mnc,
      CASE
        WHEN radio_short LIKE 'Cell%' AND bssid ~ '^[0-9]+(_[0-9]+){2,4}$'
          THEN split_part(bssid, '_', 3)::bigint
        ELSE NULL
      END AS cell_cell
    FROM app.location_details_enriched
    WHERE lat IS NOT NULL AND lon IS NOT NULL
    ORDER BY time DESC
    LIMIT $1
  `;

  try {
    const { rows } = await query(sql, [limit]);
    const fc = {
      type: "FeatureCollection",
      features: rows.map((r: any) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lon, r.lat] },
        properties: {
          id: r.id,
          bssid: r.bssid,
          level: r.level,
          radio: r.radio_short,
          security: r.security_short,
          time: r.time,
          time_epoch_ms: Number(r.time_epoch_ms),
          time_iso: r.time_iso,
          frequency_at_time: r.frequency_at_time,
          frequency_mhz: r.frequency_mhz,
          channel: r.channel,
          band: r.band,
          looks_like_mac: r.looks_like_mac,
          cell_mcc: r.cell_mcc,
          cell_mnc: r.cell_mnc,
          cell_cell: r.cell_cell
        }
      }))
    };
    res.json(fc);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
