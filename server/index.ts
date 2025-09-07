import express from "express";
import cors from "cors";
import { createServer } from "http";
import pg from "pg";
import { setupVite, log } from "./vite.js";

const { Pool } = pg;

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const toInt = (v: unknown, d: number) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : d;
};

const hasBBox = (q: Record<string, any>) =>
  ["minLat", "minLon", "maxLat", "maxLon"].every((k) => k in q && q[k] !== "");

// health
app.get("/healthz", (_req, res) => res.json({ ok: true }));

/**
 * GET /api/v1/networks
 * - ?distinct_latest=1  -> use app.latest_location_per_bssid (latest per BSSID)
 * - otherwise           -> use app.networks (raw)
 * Optional bbox: minLat,maxLat,minLon,maxLon
 * Optional paging: limit, offset
 */
app.get("/api/v1/networks", async (req, res) => {
  const distinctLatest = String(req.query.distinct_latest || "") === "1";
  const limit = toInt(req.query.limit, 100);
  const offset = toInt(req.query.offset, 0);

  try {
    if (distinctLatest) {
      // latest-per-bssid path (matches visualize_latest)
      const params: any[] = [];
      const where: string[] = [];

      if (hasBBox(req.query as any)) {
        params.push(
          Number(req.query.minLat),
          Number(req.query.maxLat),
          Number(req.query.minLon),
          Number(req.query.maxLon)
        );
        where.push(
          `d.lat BETWEEN $${params.length - 3} AND $${params.length - 2}
           AND d.lon BETWEEN $${params.length - 1} AND $${params.length}`
        );
      }

      params.push(limit, offset);

      const sql = `
        SELECT
          d.bssid,
          d.ssid_at_time      AS ssid,
          d.radio_short       AS radio,
          d.frequency_mhz,    -- Wi-Fi only; NULL for BT/Cell/etc.
          d.channel,          -- Wi-Fi only
          d.band,             -- Wi-Fi only
          d.lat, d.lon,
          d."time"
        FROM app.latest_location_per_bssid d
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY d."time" DESC
        LIMIT $${params.length - 1} OFFSET $${params.length};
      `;
      const { rows } = await pool.query(sql, params);
      return res.json({ mode: "distinct_latest", count: rows.length, rows });
    }

    // raw path (updated for new normalized schema)
    const params: any[] = [];
    const where: string[] = [];

    if (hasBBox(req.query as any)) {
      params.push(
        Number(req.query.minLat),
        Number(req.query.maxLat),
        Number(req.query.minLon),
        Number(req.query.maxLon)
      );
      where.push(
        `nls.last_latitude BETWEEN $${params.length - 3} AND $${params.length - 2}
         AND nls.last_longitude BETWEEN $${params.length - 1} AND $${params.length}`
      );
    }

    params.push(limit, offset);

    const sql = `
      SELECT
        n.bssid,
        n.current_ssid,
        'W' as type,                                               -- Default to WiFi type
        n.current_frequency,
        n.current_capabilities,
        EXTRACT(epoch FROM n.last_seen_at) * 1000 as lasttime,    -- Convert to milliseconds
        nls.last_latitude as lastlat,                              -- From networks_latest_state
        nls.last_longitude as lastlon,                             -- From networks_latest_state
        '' as service                                              -- Empty placeholder
      FROM app.networks n
      JOIN app.networks_latest_state nls ON nls.id = n.id         -- Join for location data
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY n.last_seen_at DESC NULLS LAST                     -- Use new timestamp column
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
    const { rows } = await pool.query(sql, params);
    return res.json({ mode: "raw", count: rows.length, rows });
  } catch (err: any) {
    console.error("[/api/v1/networks] error:", err);
    return res
      .status(500)
      .json({ error: "networks query failed", detail: String(err?.message || err) });
  }
});

// Add missing API endpoints
app.get("/api/v1/health", (_req, res) => res.json({ ok: true, service: "shadowcheck-api", version: "1.0.0" }));

app.get("/api/v1/status", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1 as test");
    const postgisResult = await pool.query("SELECT PostGIS_Version() as version");
    res.json({
      ok: true,
      database: {
        connected: true,
        postgisEnabled: !!postgisResult.rows[0]?.version
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      database: { connected: false, postgisEnabled: false },
      memory: { used: 0, total: 0 },
      error: String(err)
    });
  }
});

app.get("/api/v1/g63/networks", async (req, res) => {
  const limit = toInt(req.query.limit, 100);
  try {
    const result = await pool.query(`
      SELECT 
        n.bssid,
        n.current_ssid as ssid,
        n.current_capabilities as capabilities,
        COALESCE(n.current_frequency, 0) as frequency,
        COALESCE(nls.best_signal_strength, -100) as bestlevel,
        EXTRACT(epoch FROM n.last_seen_at) * 1000 as lasttime
      FROM app.networks n
      LEFT JOIN app.networks_latest_state nls ON nls.id = n.id
      ORDER BY n.last_seen_at DESC NULLS LAST
      LIMIT $1
    `, [limit]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error("[/api/v1/g63/networks] error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch networks",
      detail: String(err)
    });
  }
});

app.get("/api/v1/g63/analytics", async (_req, res) => {
  try {
    const networksCount = await pool.query("SELECT COUNT(*) as count FROM app.networks");
    res.json({
      success: true,
      data: {
        overview: {
          total_networks: parseInt(networksCount.rows[0]?.count || "0"),
          last_updated: new Date().toISOString()
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get("/api/v1/g63/security-analysis", async (_req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get("/api/v1/g63/signal-strength", async (_req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

const port = Number(process.env.PORT || 5000);

// Setup Vite development server for frontend and start server
(async () => {
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    // For production, serve the built frontend
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
