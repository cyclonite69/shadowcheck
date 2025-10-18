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
        bssid,
        lat,
        lon,
        level,
        time,
        altitude,
        accuracy
      FROM app.locations_legacy
      WHERE lat IS NOT NULL AND lon IS NOT NULL
      ORDER BY time DESC
      LIMIT $1
    `;
    const { rows } = await query(sql, [limit]);

    res.json({
      ok: true,
      data: {
        type: "FeatureCollection",
        features: rows.map(r => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(r.lon), Number(r.lat)] },
          properties: {
            bssid: r.bssid,
            signal: r.level,
            seen: r.time,
            lat: Number(r.lat),
            lon: Number(r.lon),
            alt: r.altitude,
            accuracy: r.accuracy
          }
        }))
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
