import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/'., async (req, res) => {
  try {
    const radioStatsSql = `
      SELECT COUNT(DISTINCT bssid) as wifi_count
      FROM app.networks_legacy
      WHERE type = 'W'
    `;

    const result = await query(radioStatsSql);

    res.json({
      ok: true,
      wifi_count: result.rows[0]?.wifi_count || 0,
    });
  } catch (err: any) {
    console.error('Radio stats error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
