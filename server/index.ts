import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import pg from 'pg';
import { setupVite } from './vite.js';
import { registerSurveillanceRoutes } from './routes/surveillance.js';
import analyticsRouter from './routes/analytics.js';
import networksRouter from './routes/networks-working.js';
import securityRouter from './routes/security-analysis.js';
import signalRouter from './routes/signal-strength.js';
import statsRouter from './routes/stats.js';
import alertsRouter from './routes/alerts.js';

const { Pool } = pg;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/networks", networksRouter);
app.use("/api/v1/security-analysis", securityRouter);
app.use("/api/v1/signal-strength", signalRouter);
app.use("/api/v1/stats", statsRouter);

// Metrics endpoint
app.get('/api/v1/metrics', async (_req, res) => {
  try {
    const count = await pool.query('SELECT COUNT(*) as count FROM app.networks');
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      counts: { networks: parseInt(count.rows[0]?.count || '0') },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const pool = new Pool({
    ssl: { rejectUnauthorized: false },
    ssl: { rejectUnauthorized: false },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  host: process.env.PGHOST || "127.0.0.1",
  port: parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE || "shadowcheck",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "admin"
});

const toInt = (v: unknown, d: number) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : d;
};

const hasBBox = (q: Record<string, any>) =>
  ['minLat', 'minLon', 'maxLat', 'maxLon'].every(k => k in q && q[k] !== '');

// health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/**
 * GET /api/v1/networks
 * - ?distinct_latest=1  -> use app.latest_location_per_bssid (latest per BSSID)
 * - otherwise           -> use app.networks (raw)
 * Optional bbox: minLat,maxLat,minLon,maxLon
 * Optional paging: limit, offset
 */
app.get('/api/v1/networks', async (req, res) => {
  const distinctLatest = String(req.query.distinct_latest || '') === '1';
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
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY d."time" DESC
        LIMIT $${params.length - 1} OFFSET $${params.length};
      `;
      const { rows } = await pool.query(sql, params);
      return res.json({ mode: 'distinct_latest', count: rows.length, rows });
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
        n.ssid,
        'W' as type,
        n.frequency,
        n.capabilities,
        EXTRACT(epoch FROM no.observed_at) * 1000 as lasttime,
        l.latitude as lastlat,
        l.longitude as lastlon,
        '' as service,
        COUNT(*) OVER() AS total_count
      FROM app.network_observations no
      JOIN app.networks n ON n.id = no.network_id
      JOIN app.locations l ON l.id = no.location_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY no.observed_at DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
    const { rows } = await pool.query(sql, params);
    const total_count = rows.length ? Number(rows[0].total_count) : 0;

    return res.json({
      mode: 'raw',
      count: rows.length,
      total_count,
      rows: rows.map(row => {
        const { total_count, ...data } = row;
        return data;
      }),
    });
  } catch (err: any) {
    console.error('[/api/v1/networks] error:', err);
    return res
      .status(500)
      .json({ error: 'networks query failed', detail: String(err?.message || err) });
  }
});

// Add missing API endpoints
app.get('/api/v1/health', (_req, res) =>
  res.json({ ok: true, service: 'shadowcheck-api', version: '1.0.0' })
);

app.get('/api/v1/status', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    const postgisResult = await pool.query('SELECT PostGIS_Version() as version');
    res.json({
      ok: true,
      database: {
        connected: true,
        postgisEnabled: !!postgisResult.rows[0]?.version,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      database: { connected: false, postgisEnabled: false },
      memory: { used: 0, total: 0 },
      error: String(err),
    });
  }
});



// New endpoint for radio type statistics
app.get('/api/v1/radio-stats', async (_req, res) => {
  try {
    // Enhanced classification based on real-world patterns:
    // - Cellular: BSSID format "310260_42748_5895425" (MCC_MNC_CID) or LTE encryption
    // - WiFi: Standard WiFi frequencies (2400-2500, 5000-6000 MHz) with WiFi-like SSIDs
    // - Bluetooth: Classic BT devices, often with device names, frequency 2402-2480 MHz
    // - BLE: Low energy devices, often "Misc" encryption, lower power, specific naming patterns

    const radioStats = await pool.query(`
      SELECT COUNT(DISTINCT bssid) as wifi_count 
      FROM app.networks_legacy 
      WHERE type = 'W'
    `);

    res.json({
      ok: true,
      data: radioStats.rows,
    });
  } catch (err) {
    console.error('[/api/v1/radio-stats] error:', err);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch radio statistics',
      detail: String(err),
    });
  }
});




// Visualization endpoint for Kepler.gl
app.get('/api/v1/visualize', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 500) || 500, 1000);

  // Return mock data for now to confirm endpoint is working
  res.json({
    type: 'FeatureCollection',
    features: Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-74.006 + i * 0.01, 40.7128 + i * 0.01]
      },
      properties: {
        id: `mock-${i}`,
        bssid: `00:11:22:33:44:5${i}`,
        level: -50 - i * 10,
        radio: 'wifi',
        security: 'WPA2',
        time: new Date().toISOString(),
        time_epoch_ms: Date.now(),
        time_iso: new Date().toISOString(),
        frequency_at_time: 2412,
        frequency_mhz: 2412,
        channel: 1,
        band: '2.4GHz',
      },
    })),
  });
});

// Register surveillance routes
registerSurveillanceRoutes(app);

const server = createServer(app);

const port = Number(process.env.PORT || 5000);

// Setup Vite development server for frontend and start server
(async () => {
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    // For production, serve the built frontend
    const { serveStatic } = await import('./vite.js');
    serveStatic(app);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`serving on port ${port}`);
  });
})();
