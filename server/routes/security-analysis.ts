import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

/**
 * GET /api/v1/security-analysis
 * Returns security analysis of detected WiFi networks (WPA, WEP, Open, etc.)
 */
router.get('/', async (req, res) => {
  try {
    // Use docker exec for fast, reliable connection - only analyze WiFi networks
    const securityAnalysisQuery = `
      docker exec shadowcheck_postgres psql -U postgres -d shadowcheck -t -c "
        WITH security_stats AS (
          SELECT
            COALESCE(capabilities, '[Open]') as security,
            CASE
              WHEN capabilities LIKE '%WPA3%' OR capabilities LIKE '%SAE%' THEN 'WPA3 Secure'
              WHEN capabilities LIKE '%WPA2%' AND capabilities LIKE '%EAP%' THEN 'WPA2 Enterprise'
              WHEN capabilities LIKE '%WPA2%' THEN 'WPA2 Protected'
              WHEN capabilities LIKE '%WPA%' THEN 'WPA Protected'
              WHEN capabilities LIKE '%WEP%' THEN 'WEP Vulnerable'
              WHEN capabilities = '[ESS]' OR capabilities = '' OR capabilities IS NULL THEN 'Open Networks'
              ELSE 'Other Security'
            END as security_level,
            COUNT(DISTINCT bssid) as network_count
          FROM app.networks_legacy
          WHERE type = 'W'
          GROUP BY capabilities
        ),
        total_networks AS (
          SELECT SUM(network_count) as total_count FROM security_stats
        )
        SELECT
          s.security,
          s.security_level,
          s.network_count,
          ROUND((s.network_count * 100.0 / t.total_count), 1) as percentage
        FROM security_stats s
        CROSS JOIN total_networks t
        ORDER BY s.network_count DESC;"
    `;

    const result = await execAsync(securityAnalysisQuery);

    // Parse the PostgreSQL output
    const lines = result.stdout.trim().split('\n').filter(line => line.trim());
    const data = lines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        security: parts[0] || '',
        security_level: parts[1] || '',
        network_count: parseInt(parts[2]) || 0,
        percentage: parseFloat(parts[3]) || 0
      };
    });

    res.json({
      ok: true,
      data: data,
    });
  } catch (err: any) {
    console.error('Security analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;