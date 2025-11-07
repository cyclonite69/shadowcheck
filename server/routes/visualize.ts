import { Router } from "express";
import { db, query } from "../db.js";

const router = Router();

/**
 * GET /api/v1/visualize?limit=500
 * GeoJSON of recent observations (enriched).
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 500) || 500, 5000);
  try {
    if (!db) {
      return res.status(500).json({
        ok: false,
        status: "error",
        error: "Database connection not initialized",
        timestamp: new Date().toISOString(),
      });
    }
    const sql = `
      SELECT
        l.bssid,
        l.lat,
        l.lon,
        l.level,
        l.time,
        l.altitude,
        l.accuracy,
        n.ssid,
        n.type as radio_type
      FROM app.locations_legacy l
      LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
      WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
      ORDER BY l.time DESC
      LIMIT $1
    `;
    const rows = await query(sql, [limit]);

    res.json({
      ok: true,
      data: {
        type: "FeatureCollection",
        features: rows.rows.map((r: any) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(r.lon), Number(r.lat)] },
          properties: {
            bssid: r.bssid,
            ssid: r.ssid,
            signal: r.level,
            seen: r.time ? new Date(Number(r.time)).toISOString() : null,
            lat: Number(r.lat),
            lon: Number(r.lon),
            alt: r.altitude,
            accuracy: r.accuracy,
            radio_type: r.radio_type || 'wifi'
          }
        }))
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
