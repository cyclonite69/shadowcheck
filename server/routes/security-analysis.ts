import { Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/v1/security-analysis
 * Returns security analysis of detected networks (WPA, WEP, Open, etc.)
 */
router.get('/', async (req, res) => {
  try {
    // Query security analysis from the database
    const securityAnalysisSql = `
      WITH security_stats AS (
        SELECT
          COALESCE(d.security_short, '[Open]') as security,
          CASE
            WHEN d.security_short ILIKE '%WPA3%' THEN 'WPA3 Secure'
            WHEN d.security_short ILIKE '%WPA2%' THEN 'WPA2 Protected'
            WHEN d.security_short ILIKE '%WPA%' THEN 'WPA Protected'
            WHEN d.security_short ILIKE '%WEP%' THEN 'WEP Vulnerable'
            WHEN d.security_short IS NULL OR d.security_short = '' OR d.security_short = '[ESS]' THEN 'Open Networks'
            ELSE 'Other Security'
          END as security_level,
          COUNT(DISTINCT d.bssid) as network_count
        FROM app.locations_details_enriched d
        WHERE d.radio_short = 'wifi'
        GROUP BY d.security_short
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
      ORDER BY s.network_count DESC
    `;

    const result = await query(securityAnalysisSql);

    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Security analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
