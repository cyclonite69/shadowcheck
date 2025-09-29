import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

/**
 * GET /api/v1/signal-strength
 * Returns signal strength distribution analysis
 */
router.get('/', async (req, res) => {
  try {
    // Use docker exec for fast, reliable connection - analyze signal strength distribution
    const signalStrengthQuery = `
      docker exec shadowcheck_postgres psql -U postgres -d shadowcheck -t -c "
        WITH signal_ranges AS (
          SELECT
            CASE
              WHEN bestlevel >= -50 THEN 'Excellent (-50 to 0 dBm)'
              WHEN bestlevel >= -60 THEN 'Good (-60 to -50 dBm)'
              WHEN bestlevel >= -70 THEN 'Fair (-70 to -60 dBm)'
              WHEN bestlevel >= -80 THEN 'Weak (-80 to -70 dBm)'
              ELSE 'Very Weak (< -80 dBm)'
            END as signal_range,
            CASE
              WHEN bestlevel >= -50 THEN 1
              WHEN bestlevel >= -60 THEN 2
              WHEN bestlevel >= -70 THEN 3
              WHEN bestlevel >= -80 THEN 4
              ELSE 5
            END as range_order,
            COUNT(*) as observation_count
          FROM app.networks_legacy
          WHERE bestlevel IS NOT NULL
            AND bestlevel BETWEEN -149 AND 127
          GROUP BY CASE
            WHEN bestlevel >= -50 THEN 'Excellent (-50 to 0 dBm)'
            WHEN bestlevel >= -60 THEN 'Good (-60 to -50 dBm)'
            WHEN bestlevel >= -70 THEN 'Fair (-70 to -60 dBm)'
            WHEN bestlevel >= -80 THEN 'Weak (-80 to -70 dBm)'
            ELSE 'Very Weak (< -80 dBm)'
          END,
          CASE
            WHEN bestlevel >= -50 THEN 1
            WHEN bestlevel >= -60 THEN 2
            WHEN bestlevel >= -70 THEN 3
            WHEN bestlevel >= -80 THEN 4
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
        ORDER BY s.range_order;"
    `;

    const result = await execAsync(signalStrengthQuery);

    // Parse the PostgreSQL output
    const lines = result.stdout.trim().split('\n').filter(line => line.trim());
    const data = lines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        signal_range: parts[0] || '',
        observation_count: parseInt(parts[1]) || 0,
        percentage: parseFloat(parts[2]) || 0
      };
    });

    res.json({
      ok: true,
      data: data,
    });
  } catch (err: any) {
    console.error('Signal strength analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;