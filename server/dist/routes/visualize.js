import { Router } from "express";
import { query } from "../db";
const router = Router();
/**
 * GET /api/v1/visualize?limit=500
 * GeoJSON of recent observations (enriched).
 */
router.get("/", async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 500) || 500, 5000);
    try {
        const sql = `
      SELECT
        id, bssid, lat, lon, level,
        time::text  AS time,
        time::bigint AS time_epoch_ms,
        to_char( to_timestamp(time/1000.0) AT TIME ZONE 'UTC',
                 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
        radio_short, security_short,
        frequency_at_time, frequency_mhz, channel, band
      FROM app.location_details_enriched
      WHERE lat IS NOT NULL AND lon IS NOT NULL
      ORDER BY time DESC
      LIMIT $1
    `;
        const { rows } = await query(sql, [limit]);
        res.json({
            type: "FeatureCollection",
            features: rows.map(r => ({
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
                    band: r.band
                }
            }))
        });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err?.message ?? String(err) });
    }
});
export default router;
