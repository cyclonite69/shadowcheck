import { Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/v1/radio-stats
 * Returns statistics for different radio types (WiFi, Cellular, Bluetooth, BLE)
 */
router.get('/', async (req, res) => {
  try {
    // Query radio type statistics from the database
    const radioStatsSql = `
      WITH radio_counts AS (
        SELECT
          CASE
            WHEN d.radio_short = 'wifi' THEN 'wifi'
            WHEN d.radio_short = 'cellular' THEN 'cellular'
            WHEN d.radio_short = 'bluetooth' THEN 'bluetooth'
            WHEN d.radio_short = 'ble' THEN 'ble'
            ELSE 'unknown'
          END as radio_type,
          COUNT(*) as total_observations,
          COUNT(DISTINCT d.bssid) as distinct_networks
        FROM app.locations_details_enriched d
        WHERE d.radio_short IS NOT NULL
        GROUP BY CASE
          WHEN d.radio_short = 'wifi' THEN 'wifi'
          WHEN d.radio_short = 'cellular' THEN 'cellular'
          WHEN d.radio_short = 'bluetooth' THEN 'bluetooth'
          WHEN d.radio_short = 'ble' THEN 'ble'
          ELSE 'unknown'
        END
      )
      SELECT
        radio_type,
        total_observations,
        distinct_networks
      FROM radio_counts
      WHERE radio_type != 'unknown'
      ORDER BY total_observations DESC
    `;

    const result = await query(radioStatsSql);

    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Radio stats error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
