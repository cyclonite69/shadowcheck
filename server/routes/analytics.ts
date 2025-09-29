import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

/**
 * GET /api/v1/analytics
 * Returns comprehensive analytics including network counts by type
 */
router.get('/', async (req, res) => {
  try {
    // Use docker exec for fast, reliable connection - get comprehensive stats
    const analyticsQuery = `
      docker exec shadowcheck_postgres psql -U postgres -d shadowcheck -t -c "
        WITH stats AS (
          SELECT
            COUNT(*) as total_observations,
            COUNT(DISTINCT bssid) as distinct_networks,
            COUNT(DISTINCT CASE WHEN type = 'W' THEN bssid END) as wifi_networks,
            COUNT(DISTINCT CASE WHEN type = 'E' THEN bssid END) as ble_devices,
            COUNT(DISTINCT CASE WHEN type = 'B' THEN bssid END) as bluetooth_classic,
            COUNT(DISTINCT CASE WHEN type IN ('G', 'L', 'N', 'C') THEN bssid END) as cellular_towers
          FROM app.networks_legacy
        ),
        location_stats AS (
          SELECT COUNT(*) as location_data_points
          FROM app.locations_legacy
        )
        SELECT
          s.total_observations,
          s.distinct_networks,
          s.wifi_networks,
          s.ble_devices,
          s.bluetooth_classic,
          s.cellular_towers,
          l.location_data_points
        FROM stats s
        CROSS JOIN location_stats l;"
    `;

    const result = await execAsync(analyticsQuery);

    // Parse the PostgreSQL output
    const lines = result.stdout.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data returned from analytics query');
    }

    const parts = lines[0].split('|').map(part => part.trim());
    const data = {
      overview: {
        total_observations: parseInt(parts[0]) || 0,
        distinct_networks: parseInt(parts[1]) || 0,
        wifi_networks: parseInt(parts[2]) || 0,
        ble_devices: parseInt(parts[3]) || 0,
        bluetooth_classic: parseInt(parts[4]) || 0,
        cellular_towers: parseInt(parts[5]) || 0,
        location_data_points: parseInt(parts[6]) || 0,
      }
    };

    res.json({
      ok: true,
      data: data,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
