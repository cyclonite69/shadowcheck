import { Router } from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
  max: 2,
  statement_timeout: 2000,
  query_timeout: 2000,
  ssl: false
});

const router = Router();

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  
  try {
    const result = await pool.query(
      'SELECT bssid, ssid, type, bestlevel, lasttime FROM app.networks_legacy WHERE type = $1 ORDER BY lasttime DESC LIMIT $2',
      ['W', limit]
    );
    
    res.json({
      ok: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    res.json({ ok: false, error: 'Query failed', data: [] });
  }
});

export default router;
