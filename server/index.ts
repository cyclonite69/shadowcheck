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
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const toInt = (v: unknown, d: number) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : d;
};

const hasBBox = (q: Record<string, any>) =>
  ["minLat", "minLon", "maxLat", "maxLon"].every((k) => k in q && q[k] !== "");

/**
 * Calculate WiFi channel number from frequency in MHz
 * Supports 2.4 GHz, 5 GHz, and 6 GHz (WiFi 6E) bands
 */
const calculateChannel = (frequency: number | null | undefined): number | null => {
  if (!frequency || frequency === 0) return null;

  // 2.4 GHz band (2412-2484 MHz): Channels 1-14
  if (frequency >= 2412 && frequency <= 2484) {
    if (frequency === 2484) return 14; // Special case for channel 14
    return Math.floor((frequency - 2407) / 5);
  }

  // 5 GHz band (5170-5825 MHz): Channels 32-177
  if (frequency >= 5170 && frequency <= 5825) {
    return Math.floor((frequency - 5000) / 5);
  }

  // 6 GHz band / WiFi 6E (5925-7125 MHz): Channels 1-233
  if (frequency >= 5925 && frequency <= 7125) {
    return Math.floor((frequency - 5950) / 5);
  }

  // Not a standard WiFi frequency
  return null;
};

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

  // Filter parameters
  const search = String(req.query.search || "").toLowerCase();
  const radioTypes = req.query.radio_types ? String(req.query.radio_types).split(',') : [];
  const minSignal = req.query.min_signal ? Number(req.query.min_signal) : null;
  const maxSignal = req.query.max_signal ? Number(req.query.max_signal) : null;
  const minFreq = req.query.min_freq ? Number(req.query.min_freq) : null;
  const maxFreq = req.query.max_freq ? Number(req.query.max_freq) : null;

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

    // raw path (using legacy tables) with server-side filtering
    const params: any[] = [];
    const where: string[] = [];

    // Search filter (BSSID, SSID, or capabilities)
    if (search) {
      params.push(`%${search}%`);
      where.push(`(LOWER(n.bssid) LIKE $${params.length} OR LOWER(n.ssid) LIKE $${params.length} OR LOWER(n.capabilities) LIKE $${params.length})`);
    }

    // Radio type filter
    if (radioTypes.length > 0) {
      const radioConditions: string[] = [];
      radioTypes.forEach(type => {
        if (type === 'cell') {
          radioConditions.push(`n.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'`);
        } else if (type === 'bluetooth') {
          radioConditions.push(`(n.ssid ILIKE '%bluetooth%' OR n.ssid ILIKE '%bt%' OR n.capabilities LIKE '%BT%')`);
        } else if (type === 'ble') {
          radioConditions.push(`(n.capabilities = 'Misc' OR n.capabilities = 'Uncategorized' OR n.frequency = 0 OR n.frequency BETWEEN 1 AND 500)`);
        } else if (type === 'wifi') {
          radioConditions.push(`(n.frequency BETWEEN 2400 AND 6000 AND n.capabilities NOT LIKE '%Misc%')`);
        }
      });
      if (radioConditions.length > 0) {
        where.push(`(${radioConditions.join(' OR ')})`);
      }
    }

    // Signal strength filter
    if (minSignal !== null) {
      params.push(minSignal);
      where.push(`n.bestlevel >= $${params.length}`);
    }
    if (maxSignal !== null) {
      params.push(maxSignal);
      where.push(`n.bestlevel <= $${params.length}`);
    }

    // Frequency filter
    if (minFreq !== null) {
      params.push(minFreq);
      where.push(`n.frequency >= $${params.length}`);
    }
    if (maxFreq !== null) {
      params.push(maxFreq);
      where.push(`n.frequency <= $${params.length}`);
    }

    // Bounding box filter
    if (hasBBox(req.query as any)) {
      params.push(
        Number(req.query.minLat),
        Number(req.query.maxLat),
        Number(req.query.minLon),
        Number(req.query.maxLon)
      );
      where.push(
        `n.lastlat BETWEEN $${params.length - 3} AND $${params.length - 2}
         AND n.lastlon BETWEEN $${params.length - 1} AND $${params.length}`
      );
    }

    params.push(limit, offset);

    const sql = `
      SELECT
        n.bssid,
        n.ssid as current_ssid,
        n.type,
        n.frequency as current_frequency,
        n.capabilities as current_capabilities,
        n.lasttime,
        n.lastlat,
        n.lastlon,
        n.service,
        n.bestlevel,
        -- Get observation count from locations_legacy
        COALESCE((
          SELECT COUNT(*)
          FROM app.locations_legacy l
          WHERE l.bssid = n.bssid
        ), 0) as observation_count,
        -- Convert timestamp to ISO format
        TO_TIMESTAMP(n.lasttime::bigint / 1000) as lasttime_iso,
        COUNT(*) OVER() AS total_count
      FROM app.networks_legacy n
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY n.lasttime DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
    const { rows } = await pool.query(sql, params);
    const total_count = rows.length ? Number(rows[0].total_count) : 0;

    return res.json({
      ok: true,
      mode: "raw",
      count: rows.length,
      total_count,
      data: rows.map(row => {
        const { total_count, ...networkData } = row;
        const frequency = networkData.current_frequency;
        const calculatedChannel = calculateChannel(frequency);

        return {
          id: networkData.bssid,
          bssid: networkData.bssid,
          ssid: networkData.current_ssid,
          frequency: frequency,
          channel: calculatedChannel,
          encryption: networkData.current_capabilities,
          latitude: networkData.lastlat ? String(networkData.lastlat) : undefined,
          longitude: networkData.lastlon ? String(networkData.lastlon) : undefined,
          observed_at: networkData.lasttime_iso?.toISOString() || networkData.lasttime,
          signal_strength: networkData.bestlevel,
          observation_count: Number(networkData.observation_count) || 0,
          type: networkData.type
        };
      })
    });
  } catch (err: any) {
    console.error("[/api/v1/networks] error:", err);
    return res
      .status(500)
      .json({ error: "networks query failed", detail: String(err?.message || err) });
  }
});

/**
 * GET /api/v1/analytics
 * Dashboard overview metrics from locations_legacy and networks_legacy
 */
app.get("/api/v1/analytics", async (_req, res) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(DISTINCT bssid) FROM app.locations_legacy WHERE bssid IS NOT NULL) as total_observations,
        (SELECT COUNT(DISTINCT bssid) FROM app.networks_legacy WHERE bssid IS NOT NULL) as distinct_networks,
        (SELECT MIN(time) FROM app.locations_legacy WHERE time IS NOT NULL AND time > 0) as earliest_observation,
        (SELECT MAX(time) FROM app.locations_legacy WHERE time IS NOT NULL) as latest_observation,
        (SELECT COUNT(DISTINCT bssid) FROM app.locations_legacy WHERE lat IS NOT NULL AND lon IS NOT NULL AND bssid IS NOT NULL) as geolocated_observations
    `;

    const result = await pool.query(query);
    const overview = result.rows[0];

    res.json({
      ok: true,
      data: {
        overview: {
          total_observations: Number(overview.total_observations) || 0,
          distinct_networks: Number(overview.distinct_networks) || 0,
          geolocated_observations: Number(overview.geolocated_observations) || 0,
          earliest_observation: overview.earliest_observation,
          latest_observation: overview.latest_observation
        }
      }
    });
  } catch (err) {
    console.error('[/api/v1/analytics] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/signal-strength
 * Signal strength distribution from locations_legacy
 */
app.get("/api/v1/signal-strength", async (_req, res) => {
  try {
    const query = `
      WITH signal_categorized AS (
        SELECT
          CASE
            WHEN level >= -50 THEN 'Excellent (-50 to 0 dBm)'
            WHEN level >= -60 THEN 'Good (-60 to -50 dBm)'
            WHEN level >= -70 THEN 'Fair (-70 to -60 dBm)'
            WHEN level >= -80 THEN 'Weak (-80 to -70 dBm)'
            ELSE 'Very Weak (< -80 dBm)'
          END as signal_range,
          CASE
            WHEN level >= -50 THEN 1
            WHEN level >= -60 THEN 2
            WHEN level >= -70 THEN 3
            WHEN level >= -80 THEN 4
            ELSE 5
          END as sort_order
        FROM app.locations_legacy
        WHERE level IS NOT NULL
      )
      SELECT
        signal_range,
        COUNT(*) as count
      FROM signal_categorized
      GROUP BY signal_range, sort_order
      ORDER BY sort_order
    `;

    const result = await pool.query(query);
    res.json({
      ok: true,
      data: result.rows.map(row => ({
        signal_range: row.signal_range,
        count: Number(row.count) || 0
      }))
    });
  } catch (err) {
    console.error('[/api/v1/signal-strength] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/security-analysis
 * Network security breakdown based on capabilities
 */
app.get("/api/v1/security-analysis", async (_req, res) => {
  try {
    const query = `
      WITH security_categorized AS (
        SELECT
          CASE
            WHEN capabilities LIKE '%WPA3%' THEN 'WPA3 (Most Secure)'
            WHEN capabilities LIKE '%WPA2%' THEN 'WPA2 (Secure)'
            WHEN capabilities LIKE '%WPA%' AND capabilities NOT LIKE '%WPA2%' AND capabilities NOT LIKE '%WPA3%' THEN 'WPA (Moderate)'
            WHEN capabilities LIKE '%WEP%' THEN 'WEP (Insecure - Deprecated)'
            WHEN capabilities = '[ESS]' OR capabilities IS NULL OR capabilities = '' THEN 'Open Network (No Encryption)'
            ELSE 'Other/Unknown'
          END as security_level,
          capabilities as security
        FROM app.networks_legacy
        WHERE type = 'W'
      ),
      security_counts AS (
        SELECT
          security_level,
          security,
          COUNT(*) as network_count
        FROM security_categorized
        GROUP BY security_level, security
      ),
      total_count AS (
        SELECT SUM(network_count) as total FROM security_counts
      )
      SELECT
        sc.security_level,
        sc.security,
        sc.network_count,
        ROUND((sc.network_count::numeric / NULLIF(tc.total, 0)::numeric) * 100, 2) as percentage
      FROM security_counts sc
      CROSS JOIN total_count tc
      ORDER BY sc.network_count DESC
    `;

    const result = await pool.query(query);
    res.json({
      ok: true,
      data: result.rows.map(row => ({
        security_level: row.security_level,
        security: row.security,
        network_count: Number(row.network_count) || 0,
        percentage: Number(row.percentage) || 0
      }))
    });
  } catch (err) {
    console.error('[/api/v1/security-analysis] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/timeline
 * Hourly detection counts for last 24 hours (using DISTINCT BSSIDs to avoid duplicates)
 */
app.get("/api/v1/timeline", async (_req, res) => {
  try {
    const query = `
      WITH time_bounds AS (
        SELECT
          MAX(time) as max_time,
          MAX(time) - (24 * 60 * 60 * 1000) as min_time
        FROM app.locations_legacy
        WHERE time IS NOT NULL
      ),
      hourly_data AS (
        SELECT
          DATE_TRUNC('hour', TO_TIMESTAMP(l.time / 1000)) as hour,
          CASE
            WHEN n.type = 'C' OR n.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$' THEN 'cellular'
            WHEN n.type = 'B' THEN 'bluetooth'
            WHEN n.frequency = 0 OR n.frequency BETWEEN 1 AND 500 THEN 'ble'
            ELSE 'wifi'
          END as radio_type,
          COUNT(DISTINCT l.bssid) as detection_count
        FROM app.locations_legacy l
        LEFT JOIN app.networks_legacy n ON l.bssid = n.bssid
        CROSS JOIN time_bounds tb
        WHERE l.time >= tb.min_time AND l.time <= tb.max_time
        GROUP BY hour, radio_type
      )
      SELECT
        hour,
        radio_type,
        SUM(detection_count) as detection_count
      FROM hourly_data
      GROUP BY hour, radio_type
      ORDER BY hour ASC
    `;

    const result = await pool.query(query);
    res.json({
      ok: true,
      data: result.rows.map(row => ({
        hour: row.hour,
        radio_type: row.radio_type,
        detection_count: Number(row.detection_count) || 0
      }))
    });
  } catch (err) {
    console.error('[/api/v1/timeline] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
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
  } catch (err) {
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
          n.ssid,
          n.frequency,
          n.capabilities as encryption,
          CASE
            -- Cellular towers: MCC_MNC_CID format or LTE encryption
            WHEN n.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$' OR n.capabilities LIKE 'LTE;%' THEN 'cellular'

            -- Bluetooth Classic: Device names suggesting BT, specific frequency ranges, or BT-like patterns
            WHEN (n.ssid ILIKE '%bluetooth%' OR n.ssid ILIKE '%bt%' OR
                  n.ssid ILIKE '%headphone%' OR n.ssid ILIKE '%speaker%' OR
                  n.ssid ILIKE '%mouse%' OR n.ssid ILIKE '%keyboard%' OR
                  n.capabilities LIKE '%BT%' OR n.capabilities LIKE '%Bluetooth%') THEN 'bluetooth'

            -- BLE devices: Enhanced detection with capability patterns and UUIDs
            WHEN (n.capabilities = 'Misc') OR
                 (n.capabilities = 'Uncategorized') OR
                 (n.capabilities LIKE '%Uncategorized;%') OR
                 (n.capabilities LIKE '%Laptop;%') OR
                 (n.capabilities LIKE '%Smartphone;%') OR
                 (n.capabilities LIKE '%Headphones;%') OR
                 (n.capabilities LIKE '%Display/Speaker;%') OR
                 (n.capabilities LIKE '%Handsfree;%') OR
                 (n.capabilities ~ '.*;[0-9]+$') OR  -- Pattern like "Type;10"
                 (n.ssid ILIKE '%ble%' OR n.ssid ILIKE '%fitbit%' OR
                  n.ssid ILIKE '%tile%' OR n.ssid ILIKE '%beacon%' OR
                  n.ssid ILIKE '%echo%' OR n.ssid ILIKE '%dot%' OR
                  n.ssid ILIKE '%dell%' OR n.ssid ILIKE '%laptop%' OR
                  n.ssid ILIKE '%jlab%' OR n.ssid ILIKE '%airpods%' OR
                  n.ssid ILIKE '%microsoft%') OR
                 (n.frequency = 0 OR n.frequency BETWEEN 1 AND 500) THEN 'ble'

            -- WiFi: Standard WiFi frequencies and patterns
            WHEN (n.frequency BETWEEN 2400 AND 2500 OR n.frequency BETWEEN 5000 AND 6000) AND
                 (n.capabilities LIKE '%WPA%' OR n.capabilities LIKE '%WEP%' OR
                  n.capabilities LIKE '%ESS%') THEN 'wifi'

            -- Default WiFi for MAC addresses with typical WiFi indicators
            WHEN n.bssid ~ '^[0-9a-fA-F:]+$' AND n.capabilities NOT LIKE 'Misc' THEN 'wifi'

            -- Anything else with very low/zero frequency likely BLE
            WHEN n.frequency <= 500 THEN 'ble'

            -- Default to wifi for unclassified MAC addresses
            ELSE 'wifi'
          END as radio_type
        FROM app.networks_legacy n
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
      data: radioStats.rows.map(row => ({
        radio_type: row.radio_type,
        total_observations: Number(row.total_observations) || 0,
        distinct_networks: Number(row.distinct_networks) || 0
      }))
    });
  } catch (err) {
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
  // IMPORTANT: Vite middleware must be set up LAST (after all API routes)
  // Otherwise, the catch-all route will intercept API requests
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
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
