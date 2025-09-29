// Simple networks route that works with existing schema
import { Router } from 'express';
import pg from 'pg';

const { Pool } = pg;

// Use environment variables and remove SSL/timeout issues
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 2,
  ssl: false
});

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 1000);

    const result = await pool.query(`
      SELECT
        unified_id as id,
        bssid,
        ssid,
        frequency,
        capabilities,
        lasttime,
        lastlat as latitude,
        lastlon as longitude,
        type,
        bestlevel,
        bestlat,
        bestlon,
        rcois,
        mfgrid,
        service,
        CURRENT_TIMESTAMP as created_at,
        to_timestamp(lasttime/1000.0) as observed_at
      FROM app.networks_legacy
      ORDER BY lasttime DESC NULLS LAST
      LIMIT $1
    `, [limit]);

    res.json({
      ok: true,
      data: result.rows.map(row => ({
        id: row.id?.toString() || '',
        bssid: row.bssid || '',
        ssid: row.ssid,
        frequency: row.frequency,
        capabilities: row.capabilities,
        bestlevel: row.bestlevel,
        lasttime: row.lasttime?.toString(),
        latitude: row.latitude?.toString(),
        longitude: row.longitude?.toString(),
        observed_at: row.observed_at?.toISOString(),
        created_at: row.created_at?.toISOString(),
        signal_strength: row.bestlevel,
        encryption: row.capabilities,
        network_count: 1, // Default value for compatibility
        radio_type: row.type // Use the type field from database
      })),
      count: result.rows.length,
      limit
    });
  } catch (error) {
    console.error('Error fetching networks:', error);
    res.status(500).json({
      ok: false,
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;