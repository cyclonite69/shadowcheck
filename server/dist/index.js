import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import pg from "pg";
import { setupVite, log } from "./vite.js";
import { registerShutdownHandlers } from "./utils/shutdown";
import healthRouter from "./routes/health";
const { Pool } = pg;
const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());
// Metrics endpoint
app.get("/api/v1/metrics", async (_req, res) => {
    try {
        const count = await pool.query("SELECT COUNT(*) as count FROM app.networks");
        res.json({
            ok: true,
            timestamp: new Date().toISOString(),
            counts: { networks: parseInt(count.rows[0]?.count || "0") }
        });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
    }
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const toInt = (v, d) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : d;
};
const hasBBox = (q) => ["minLat", "minLon", "maxLat", "maxLon"].every((k) => k in q && q[k] !== "");
// Mount enhanced health check endpoints (with /ready, /detailed, /metrics)
app.use("/api/v1/health", healthRouter);
// Legacy health endpoint for backward compatibility
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
            const params = [];
            const where = [];
            if (hasBBox(req.query)) {
                params.push(Number(req.query.minLat), Number(req.query.maxLat), Number(req.query.minLon), Number(req.query.maxLon));
                where.push(`d.lat BETWEEN $${params.length - 3} AND $${params.length - 2}
           AND d.lon BETWEEN $${params.length - 1} AND $${params.length}`);
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
        const params = [];
        const where = [];
        if (hasBBox(req.query)) {
            params.push(Number(req.query.minLat), Number(req.query.maxLat), Number(req.query.minLon), Number(req.query.maxLon));
            where.push(`nls.last_latitude BETWEEN $${params.length - 3} AND $${params.length - 2}
         AND nls.last_longitude BETWEEN $${params.length - 1} AND $${params.length}`);
        }
        params.push(limit, offset);
        const sql = `
      SELECT
        n.bssid,
        n.current_ssid,
        'W' as type,
        n.current_frequency,
        n.current_capabilities,
        EXTRACT(epoch FROM no.observed_at) * 1000 as lasttime,
        l.latitude as lastlat,
        l.longitude as lastlon,
        '' as service,
        COUNT(*) OVER() AS total_count
      FROM app.network_observations no
      JOIN app.networks n ON n.id = no.network_id
      JOIN app.locations l ON l.id = no.location_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY no.observed_at DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
        const { rows } = await pool.query(sql, params);
        const total_count = rows.length ? Number(rows[0].total_count) : 0;
        return res.json({
            mode: "raw",
            count: rows.length,
            total_count,
            rows: rows.map(row => {
                const { total_count, ...data } = row;
                return data;
            })
        });
    }
    catch (err) {
        console.error("[/api/v1/networks] error:", err);
        return res
            .status(500)
            .json({ error: "networks query failed", detail: String(err?.message || err) });
    }
});
// Status endpoint (separate from health checks)
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
    }
    catch (err) {
        res.status(500).json({
            ok: false,
            database: { connected: false, postgisEnabled: false },
            memory: { used: 0, total: 0 },
            error: String(err)
        });
    }
});
// Radio type statistics endpoint
app.get("/api/v1/radio-stats", async (_req, res) => {
    try {
        // Enhanced classification based on real-world patterns:
        // - Cellular: BSSID format "310260_42748_5895425" (MCC_MNC_CID) or LTE encryption
        // - WiFi: Standard WiFi frequencies (2400-2500, 5000-6000 MHz) with WiFi-like SSIDs
        // - Bluetooth: Classic BT devices, often with device names, frequency 2402-2480 MHz
        // - BLE: Low energy devices, often "Misc" encryption, lower power, specific naming patterns
        const radioStats = await pool.query(`
      WITH radio_classification AS (
        SELECT
          n.bssid,
          n.current_ssid as ssid,
          n.current_frequency as frequency,
          n.current_capabilities as encryption,
          CASE
            -- Cellular towers: MCC_MNC_CID format or LTE encryption
            WHEN n.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$' OR n.current_capabilities LIKE 'LTE;%' THEN 'cellular'

            -- Bluetooth Classic: Device names suggesting BT, specific frequency ranges, or BT-like patterns
            WHEN (n.current_ssid ILIKE '%bluetooth%' OR n.current_ssid ILIKE '%bt%' OR
                  n.current_ssid ILIKE '%headphone%' OR n.current_ssid ILIKE '%speaker%' OR
                  n.current_ssid ILIKE '%mouse%' OR n.current_ssid ILIKE '%keyboard%' OR
                  n.current_capabilities LIKE '%BT%' OR n.current_capabilities LIKE '%Bluetooth%') THEN 'bluetooth'

            -- BLE devices: Enhanced detection with capability patterns and UUIDs
            WHEN (n.current_capabilities = 'Misc') OR
                 (n.current_capabilities = 'Uncategorized') OR
                 (n.current_capabilities LIKE '%Uncategorized;%') OR
                 (n.current_capabilities LIKE '%Laptop;%') OR
                 (n.current_capabilities LIKE '%Smartphone;%') OR
                 (n.current_capabilities LIKE '%Headphones;%') OR
                 (n.current_capabilities LIKE '%Display/Speaker;%') OR
                 (n.current_capabilities LIKE '%Handsfree;%') OR
                 (n.current_capabilities ~ '.*;[0-9]+$') OR  -- Pattern like "Type;10"
                 (n.current_ssid ILIKE '%ble%' OR n.current_ssid ILIKE '%fitbit%' OR
                  n.current_ssid ILIKE '%tile%' OR n.current_ssid ILIKE '%beacon%' OR
                  n.current_ssid ILIKE '%echo%' OR n.current_ssid ILIKE '%dot%' OR
                  n.current_ssid ILIKE '%dell%' OR n.current_ssid ILIKE '%laptop%' OR
                  n.current_ssid ILIKE '%jlab%' OR n.current_ssid ILIKE '%airpods%' OR
                  n.current_ssid ILIKE '%microsoft%') OR
                 (n.current_frequency = 0 OR n.current_frequency BETWEEN 1 AND 500) THEN 'ble'

            -- WiFi: Standard WiFi frequencies and patterns
            WHEN (n.current_frequency BETWEEN 2400 AND 2500 OR n.current_frequency BETWEEN 5000 AND 6000) AND
                 (n.current_capabilities LIKE '%WPA%' OR n.current_capabilities LIKE '%WEP%' OR
                  n.current_capabilities LIKE '%ESS%') THEN 'wifi'

            -- Default WiFi for MAC addresses with typical WiFi indicators
            WHEN n.bssid ~ '^[0-9a-fA-F:]+$' AND n.current_capabilities NOT LIKE 'Misc' THEN 'wifi'

            -- Anything else with very low/zero frequency likely BLE
            WHEN n.current_frequency <= 500 THEN 'ble'

            -- Default to wifi for unclassified MAC addresses
            ELSE 'wifi'
          END as radio_type
        FROM app.networks n
      ),
      all_radio_types AS (
        SELECT 'wifi' as radio_type
        UNION ALL SELECT 'cellular'
        UNION ALL SELECT 'bluetooth'
        UNION ALL SELECT 'ble'
      ),
      location_counts AS (
        SELECT
          rc.radio_type,
          COUNT(DISTINCT rc.bssid) as total_observations,
          COUNT(DISTINCT rc.bssid) as distinct_networks
        FROM radio_classification rc
        WHERE rc.bssid IS NOT NULL
        GROUP BY rc.radio_type
      )
      SELECT
        art.radio_type,
        COALESCE(lc.total_observations, 0) as total_observations,
        COALESCE(lc.distinct_networks, 0) as distinct_networks
      FROM all_radio_types art
      LEFT JOIN location_counts lc ON art.radio_type = lc.radio_type
      ORDER BY art.radio_type
    `);
        res.json({
            ok: true,
            data: radioStats.rows
        });
    }
    catch (err) {
        console.error("[/api/v1/radio-stats] error:", err);
        res.status(500).json({
            ok: false,
            error: "Failed to fetch radio statistics",
            detail: String(err)
        });
    }
});
const port = Number(process.env.PORT || 5000);
// Setup Vite development server for frontend and start server
(async () => {
    if (process.env.NODE_ENV !== "production") {
        await setupVite(app, server);
    }
    else {
        // For production, serve the built frontend
        const { serveStatic } = await import("./vite.js");
        serveStatic(app);
    }
    server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
        log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        log(`Health endpoints available at:`);
        log(`  - GET /api/v1/health (liveness)`);
        log(`  - GET /api/v1/health/ready (readiness)`);
        log(`  - GET /api/v1/health/detailed (full diagnostics)`);
        log(`  - GET /api/v1/health/metrics (prometheus metrics)`);
    });
    // Register graceful shutdown handlers after server is listening
    // This ensures clean shutdown with zero data loss
    registerShutdownHandlers(server, {
        timeout: 10000, // 10 seconds for graceful shutdown
        signals: ['SIGTERM', 'SIGINT'],
    });
})();
