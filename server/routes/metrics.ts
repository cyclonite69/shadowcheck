// server/routes/metrics.ts
import { Router } from "express";
import { db } from "../db/connection";

const router = Router();

/**
 * GET /api/v1/metrics
 * Consolidated dashboard data - all cards + map bootstrap in one call
 * Eliminates "undefined/undefined" states and multiple fetches
 */
router.get("/", async (req, res) => {
  try {
    // Database connectivity checks
    const dbHealthResult = await db.query("SELECT true AS connected");
    const postgisResult = await db.query(
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='postgis') AS postgis"
    );
    
    const connected = dbHealthResult[0]?.connected ?? false;
    const postgis = postgisResult[0]?.postgis ?? false;

    // Get counts from your actual tables
    // Using location_details_enriched since that's your main enriched view
    const countsQueries = await Promise.allSettled([
      // Total networks (distinct BSSIDs)
      db.query("SELECT COUNT(DISTINCT bssid)::int AS networks FROM app.location_details_enriched"),
      
      // Total location observations
      db.query("SELECT COUNT(*)::int AS locations FROM app.location_details_enriched"),
      
      // WiFi networks (radio_short = 'WiFi' or similar)
      db.query("SELECT COUNT(DISTINCT bssid)::int AS wifi FROM app.location_details_enriched WHERE radio_short ILIKE '%wifi%' OR radio_short = 'W'"),
      
      // Bluetooth networks
      db.query("SELECT COUNT(DISTINCT bssid)::int AS bt FROM app.location_details_enriched WHERE radio_short = 'BT'"),
      
      // Cellular networks (radio_short LIKE 'Cell%')
      db.query("SELECT COUNT(DISTINCT bssid)::int AS cell FROM app.location_details_enriched WHERE radio_short LIKE 'Cell%'")
    ]);

    // Extract counts safely
    const networks = countsQueries[0].status === 'fulfilled' ? countsQueries[0].value[0]?.networks ?? 0 : 0;
    const locations = countsQueries[1].status === 'fulfilled' ? countsQueries[1].value[0]?.locations ?? 0 : 0;
    const wifi = countsQueries[2].status === 'fulfilled' ? countsQueries[2].value[0]?.wifi ?? 0 : 0;
    const bt = countsQueries[3].status === 'fulfilled' ? countsQueries[3].value[0]?.bt ?? 0 : 0;
    const cell = countsQueries[4].status === 'fulfilled' ? countsQueries[4].value[0]?.cell ?? 0 : 0;

    // Recent activity sample for the "Recent SIGINT Activity" list
    const recentResult = await db.query(`
      SELECT
        ssid_at_time AS ssid,
        bssid,
        frequency_mhz,
        to_char(to_timestamp(time/1000.0) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS observed_at,
        radio_short AS radio_type
      FROM app.location_details_enriched
      WHERE time IS NOT NULL
      ORDER BY time DESC
      LIMIT 8
    `);

    // Security breakdown (encrypted vs open)
    const securityResult = await db.query(`
      SELECT 
        CASE 
          WHEN security_short ILIKE '%wpa%' OR security_short ILIKE '%wep%' OR security_short != '' 
          THEN 'encrypted' 
          ELSE 'open' 
        END AS security_type,
        COUNT(DISTINCT bssid)::int AS count
      FROM app.location_details_enriched
      WHERE radio_short ILIKE '%wifi%' OR radio_short = 'W'
      GROUP BY security_type
    `);

    const securityCounts = securityResult.reduce((acc: any, row: any) => {
      acc[row.security_type] = row.count;
      return acc;
    }, { encrypted: 0, open: 0 });

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      db: { 
        connected, 
        postgis 
      },
      counts: { 
        networks, 
        locations, 
        wifi, 
        bt, 
        cell,
        encrypted: securityCounts.encrypted,
        open: securityCounts.open
      },
      sample: { 
        recent: recentResult.map((row: any) => ({
          ssid: row.ssid || null,
          bssid: row.bssid,
          freq_mhz: row.frequency_mhz || null,
          observed_at: row.observed_at,
          radio_type: row.radio_type
        }))
      }
    });

  } catch (err: any) {
    console.error('Metrics endpoint error:', err);
    res.status(500).json({ 
      ok: false,
      error: 'metrics_failed', 
      message: err?.message ?? String(err) 
    });
  }
});

export default router;
