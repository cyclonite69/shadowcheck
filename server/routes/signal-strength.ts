import { Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/v1/signal-strength
 * Returns signal strength distribution analysis
 */
router.get('/', async (req, res) => {
  try {
    // Query signal strength distribution from the database
    const signalStrengthSql = `
      WITH signal_ranges AS (
        SELECT
          CASE
            WHEN d.level >= -30 THEN 'Excellent (-30 to 0 dBm)'
            WHEN d.level >= -50 THEN 'Good (-50 to -30 dBm)'
            WHEN d.level >= -70 THEN 'Fair (-70 to -50 dBm)'
            WHEN d.level >= -90 THEN 'Weak (-90 to -70 dBm)'
            ELSE 'Very Weak (< -90 dBm)'
          END as signal_range,
          CASE
            WHEN d.level >= -30 THEN 1
            WHEN d.level >= -50 THEN 2
            WHEN d.level >= -70 THEN 3
            WHEN d.level >= -90 THEN 4
            ELSE 5
          END as range_order,
          COUNT(*) as observation_count
        FROM app.locations_details_enriched d
        WHERE d.level IS NOT NULL
        GROUP BY CASE
          WHEN d.level >= -30 THEN 'Excellent (-30 to 0 dBm)'
          WHEN d.level >= -50 THEN 'Good (-50 to -30 dBm)'
          WHEN d.level >= -70 THEN 'Fair (-70 to -50 dBm)'
          WHEN d.level >= -90 THEN 'Weak (-90 to -70 dBm)'
          ELSE 'Very Weak (< -90 dBm)'
        END,
        CASE
          WHEN d.level >= -30 THEN 1
          WHEN d.level >= -50 THEN 2
          WHEN d.level >= -70 THEN 3
          WHEN d.level >= -90 THEN 4
          ELSE 5
        END
      ),
      total_observations AS (
        SELECT SUM(observation_count) as total_count FROM signal_ranges
      )
      SELECT
        s.signal_range,
        s.observation_count,
        ROUND((s.observation_count * 100.0 / t.total_count), 1) as percentage
      FROM signal_ranges s
      CROSS JOIN total_observations t
      ORDER BY s.range_order
    `;

    const result = await query(signalStrengthSql);

    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Signal strength analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
