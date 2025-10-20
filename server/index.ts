import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import pg from "pg";
import { setupVite, log } from "./vite.js";
import { registerShutdownHandlers } from "./utils/shutdown";
import healthRouter from "./routes/health";
import visualizeRouter from "./routes/visualize";
import surveillanceRouter from "./routes/surveillance";
import { db as dbConnection } from "./db/connection";

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
app.use("/api/v1/visualize", visualizeRouter);
app.use("/api/v1/surveillance", surveillanceRouter);

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
  const groupByBssid = String(req.query.group_by_bssid || "") === "1";
  const limit = toInt(req.query.limit, 100);
  const offset = toInt(req.query.offset, 0);

  // Filter parameters
  const search = String(req.query.search || "").toLowerCase();
  const radioTypes = req.query.radio_types ? String(req.query.radio_types).split(',').map(t => t.trim().toUpperCase()) : [];
  const minSignal = req.query.min_signal ? Number(req.query.min_signal) : null;
  const maxSignal = req.query.max_signal ? Number(req.query.max_signal) : null;
  const minFreq = req.query.min_freq ? Number(req.query.min_freq) : null;
  const maxFreq = req.query.max_freq ? Number(req.query.max_freq) : null;
  const dateStart = req.query.date_start ? String(req.query.date_start) : null;
  const dateEnd = req.query.date_end ? String(req.query.date_end) : null;
  const securityTypes = req.query.security_types ? String(req.query.security_types).split(',').map(t => t.trim()) : [];
  const radiusLat = req.query.radius_lat ? Number(req.query.radius_lat) : null;
  const radiusLng = req.query.radius_lng ? Number(req.query.radius_lng) : null;
  const radiusMeters = req.query.radius_meters ? Number(req.query.radius_meters) : null;

  try {
    if (groupByBssid) {
      // Group by BSSID mode: one row per unique network with observation counts
      const params: any[] = [];
      const where: string[] = [];

      // Search filter
      if (search) {
        params.push(`%${search}%`);
        where.push(`(LOWER(n.bssid) LIKE $${params.length} OR LOWER(n.ssid) LIKE $${params.length})`);
      }

      // Radio type filter (using single-letter codes: W, E, B, L, G)
      if (radioTypes.length > 0) {
        params.push(radioTypes);
        where.push(`n.type = ANY($${params.length})`);
      }

      params.push(limit, offset);

      const sql = `
        WITH latest_networks AS (
          SELECT DISTINCT ON (bssid)
            bssid, ssid, type, frequency, capabilities, service
          FROM app.networks_legacy
          ORDER BY bssid, lasttime DESC NULLS LAST
        ),
        latest_observations AS (
          SELECT DISTINCT ON (bssid)
            bssid, lat, lon, altitude, accuracy, level, time
          FROM app.locations_legacy
          ORDER BY bssid, time DESC NULLS LAST
        ),
        grouped_observations AS (
          SELECT
            l.bssid,
            COUNT(*) as observation_count
          FROM app.locations_legacy l
          GROUP BY l.bssid
        )
        SELECT
          g.bssid,
          n.ssid,
          n.type,
          n.frequency,
          n.capabilities,
          lo.level as signal_strength,
          lo.lat as latitude,
          lo.lon as longitude,
          lo.altitude,
          lo.accuracy,
          lo.time,
          g.observation_count,
          TO_TIMESTAMP(lo.time::bigint / 1000) as observed_at,
          COUNT(*) OVER() AS total_count
        FROM grouped_observations g
        LEFT JOIN latest_networks n ON g.bssid = n.bssid
        LEFT JOIN latest_observations lo ON g.bssid = lo.bssid
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY lo.time DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length};
      `;
      const { rows } = await pool.query(sql, params);
      const total_count = rows.length ? Number(rows[0].total_count) : 0;

      return res.json({
        ok: true,
        mode: "grouped",
        count: rows.length,
        total_count,
        data: rows.map(row => {
          const { total_count, ...networkData } = row;
          const frequency = networkData.frequency;
          const calculatedChannel = calculateChannel(frequency);

          return {
            id: networkData.bssid,
            bssid: networkData.bssid,
            ssid: networkData.ssid,
            frequency: frequency,
            channel: calculatedChannel,
            encryption: networkData.capabilities,
            latitude: networkData.latitude ? String(networkData.latitude) : undefined,
            longitude: networkData.longitude ? String(networkData.longitude) : undefined,
            altitude: networkData.altitude,
            accuracy: networkData.accuracy,
            observed_at: networkData.observed_at?.toISOString() || networkData.time,
            signal_strength: networkData.signal_strength,
            observation_count: Number(networkData.observation_count) || 0,
            type: networkData.type
          };
        })
      });
    }

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

    // Radio type filter (using single-letter codes: W, E, B, L, G)
    if (radioTypes.length > 0) {
      params.push(radioTypes);
      where.push(`n.type = ANY($${params.length})`);
    }

    // Signal strength filter
    if (minSignal !== null) {
      params.push(minSignal);
      where.push(`l.level >= $${params.length}`);
    }
    if (maxSignal !== null) {
      params.push(maxSignal);
      where.push(`l.level <= $${params.length}`);
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

    // Date range filter (time is in milliseconds since epoch)
    if (dateStart) {
      const startMs = new Date(dateStart).getTime();
      params.push(startMs);
      where.push(`l.time >= $${params.length}`);
    }
    if (dateEnd) {
      const endMs = new Date(dateEnd).getTime() + (24 * 60 * 60 * 1000); // End of day
      params.push(endMs);
      where.push(`l.time <= $${params.length}`);
    }

    // Security type filter (WiFi only - matches capabilities field)
    if (securityTypes.length > 0) {
      const securityConditions: string[] = [];
      securityTypes.forEach(type => {
        if (type === 'Open') {
          securityConditions.push(`(n.capabilities = '[ESS]' OR n.capabilities IS NULL OR n.capabilities = '')`);
        } else if (type === 'WEP') {
          securityConditions.push(`n.capabilities ILIKE '%WEP%'`);
        } else if (type === 'WPA') {
          securityConditions.push(`(n.capabilities ILIKE '%WPA%' AND n.capabilities NOT ILIKE '%WPA2%' AND n.capabilities NOT ILIKE '%WPA3%')`);
        } else if (type === 'WPA2') {
          securityConditions.push(`n.capabilities ILIKE '%WPA2%'`);
        } else if (type === 'WPA3') {
          securityConditions.push(`n.capabilities ILIKE '%WPA3%'`);
        }
      });
      if (securityConditions.length > 0) {
        where.push(`(${securityConditions.join(' OR ')})`);
      }
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
        `l.lat BETWEEN $${params.length - 3} AND $${params.length - 2}
         AND l.lon BETWEEN $${params.length - 1} AND $${params.length}`
      );
    }

    // Radius search filter (Haversine formula for geodesic distance)
    if (radiusLat !== null && radiusLng !== null && radiusMeters !== null) {
      params.push(radiusLat, radiusLng, radiusMeters);
      where.push(`
        (6371000 * acos(
          cos(radians($${params.length - 2})) *
          cos(radians(l.lat)) *
          cos(radians(l.lon) - radians($${params.length - 1})) +
          sin(radians($${params.length - 2})) *
          sin(radians(l.lat))
        )) <= $${params.length}
      `);
    }

    params.push(limit, offset);

    const sql = `
      WITH latest_networks AS (
        SELECT DISTINCT ON (bssid)
          bssid, ssid, type, frequency, capabilities, service
        FROM app.networks_legacy
        ORDER BY bssid, lasttime DESC NULLS LAST
      )
      SELECT
        l.unified_id,
        l.bssid,
        n.ssid,
        n.type,
        n.frequency,
        n.capabilities,
        l.level as signal_strength,
        l.lat as latitude,
        l.lon as longitude,
        l.altitude,
        l.accuracy,
        l.time,
        n.service,
        -- Convert timestamp to ISO format
        TO_TIMESTAMP(l.time::bigint / 1000) as observed_at,
        COUNT(*) OVER() AS total_count
      FROM app.locations_legacy l
      LEFT JOIN latest_networks n ON l.bssid = n.bssid
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY l.time DESC NULLS LAST
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
        const frequency = networkData.frequency;
        const calculatedChannel = calculateChannel(frequency);

        return {
          id: String(networkData.unified_id),
          bssid: networkData.bssid,
          ssid: networkData.ssid,
          frequency: frequency,
          channel: calculatedChannel,
          encryption: networkData.capabilities,
          latitude: networkData.latitude ? String(networkData.latitude) : undefined,
          longitude: networkData.longitude ? String(networkData.longitude) : undefined,
          altitude: networkData.altitude,
          accuracy: networkData.accuracy,
          observed_at: networkData.observed_at?.toISOString() || networkData.time,
          signal_strength: networkData.signal_strength,
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
        (SELECT COUNT(*) FROM app.locations_legacy) as total_observations,
        (SELECT COUNT(DISTINCT bssid) FROM app.locations_legacy WHERE bssid IS NOT NULL) as distinct_networks,
        (SELECT MIN(time) FROM app.locations_legacy WHERE time IS NOT NULL AND time > 0) as earliest_observation,
        (SELECT MAX(time) FROM app.locations_legacy WHERE time IS NOT NULL) as latest_observation,
        (SELECT COUNT(*) FROM app.locations_legacy WHERE lat IS NOT NULL AND lon IS NOT NULL) as geolocated_observations
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

// Version endpoint - API version information
app.get("/api/v1/version", async (_req, res) => {
  res.json({
    name: "shadowcheck",
    version: "1.0.0",
    description: "SIGINT Forensics API with PostGIS spatial capabilities"
  });
});

// Config endpoint - frontend configuration
app.get("/api/v1/config", async (_req, res) => {
  res.json({
    ok: true,
    mapboxToken: process.env.MAPBOX_TOKEN || null
  });
});

// Spatial query endpoint - networks within radius
app.get("/api/v1/within", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 as test");
    const isConnected = result.rows.length > 0;

    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected",
        code: "DB_NOT_CONNECTED"
      });
    }
  } catch {
    return res.status(501).json({
      ok: false,
      error: "Database not connected",
      code: "DB_NOT_CONNECTED"
    });
  }

  const { lat, lon, radius, limit } = req.query;

  if (!lat || !lon || !radius) {
    return res.status(400).json({
      ok: false,
      error: "Missing required parameters: lat, lon, radius"
    });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lon as string);
  const radiusMeters = parseFloat(radius as string);
  const maxResults = Math.min(parseInt(limit as string) || 50, 100);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({
      ok: false,
      error: "Invalid latitude. Must be between -90 and 90."
    });
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      ok: false,
      error: "Invalid longitude. Must be between -180 and 180."
    });
  }

  if (isNaN(radiusMeters) || radiusMeters <= 0 || radiusMeters > 50000) {
    return res.status(400).json({
      ok: false,
      error: "Invalid radius. Must be between 1 and 50000 meters."
    });
  }

  try {
    const result = await pool.query(`
      SELECT
        bssid,
        ssid,
        frequency,
        capabilities as encryption,
        lat as latitude,
        lon as longitude,
        observed_at,
        NULL::integer as observation_count,
        'W' as type
      FROM app.networks_latest_by_bssid
      WHERE geog IS NOT NULL
        AND ST_DWithin(
          geog,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY ST_Distance(
        geog,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) ASC
      LIMIT $4
    `, [longitude, latitude, radiusMeters, maxResults]);

    res.json({
      ok: true,
      data: result.rows,
      count: result.rows.length,
      query: {
        latitude,
        longitude,
        radius: radiusMeters,
        limit: maxResults
      }
    });
  } catch (error) {
    console.error("Error executing spatial query:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to execute spatial query. Ensure PostGIS extension is installed."
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
          COUNT(*) as total_observations,
          COUNT(DISTINCT rc.bssid) as distinct_networks
        FROM radio_classification rc
        INNER JOIN app.locations_legacy l ON rc.bssid = l.bssid
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
  // Initialize database connection with retry logic
  try {
    log('Initializing database connection...');
    await dbConnection.connect();
    log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    process.exit(1);
  }

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
