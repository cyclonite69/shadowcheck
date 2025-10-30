/**
 * Network Classification API Routes
 *
 * Provides access to the wireless network classification system
 * including technology detection, security analysis, and network correlation
 */

import { Router, Request, Response } from 'express';
import { getPool } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v1/classification/summary
 * Get classification statistics and summary
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        COUNT(*) as total_networks,

        -- Technology distribution
        COUNT(*) FILTER (WHERE technology_resolved = 'Wi-Fi') as wifi_count,
        COUNT(*) FILTER (WHERE technology_resolved = 'Bluetooth-LE') as ble_count,
        COUNT(*) FILTER (WHERE technology_resolved = 'Bluetooth-Classic') as bt_classic_count,
        COUNT(*) FILTER (WHERE technology_resolved LIKE 'Cellular%') as cellular_count,
        COUNT(*) FILTER (WHERE technology_resolved = 'Undetermined') as undetermined_count,

        -- Security distribution
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Insecure%') as insecure_count,
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Vulnerable%') as vulnerable_count,
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Robust%') as robust_count,
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Unsecured%') as unsecured_count,
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Ambiguous%') as ambiguous_count,

        -- Infrastructure types
        COUNT(*) FILTER (WHERE infrastructure_type = 'Corporate/Commercial') as corporate_count,
        COUNT(*) FILTER (WHERE infrastructure_type = 'Personal/Consumer') as personal_count,
        COUNT(*) FILTER (WHERE infrastructure_type LIKE 'Specialized%') as specialized_count,
        COUNT(*) FILTER (WHERE infrastructure_type LIKE 'Unknown%') as unknown_infra_count,

        -- Freshness
        COUNT(*) FILTER (WHERE is_stale = true) as stale_count,
        COUNT(*) FILTER (WHERE is_stale = false) as active_count,

        -- Location confidence
        COUNT(*) FILTER (WHERE location_confidence = 'High Confidence') as high_confidence_count,
        COUNT(*) FILTER (WHERE location_confidence = 'Medium Confidence') as medium_confidence_count,
        COUNT(*) FILTER (WHERE location_confidence = 'Low Confidence') as low_confidence_count,
        COUNT(*) FILTER (WHERE location_confidence = 'No Location Data') as no_location_count,

        -- Observations
        SUM(total_observations) as total_observations,
        AVG(total_observations) FILTER (WHERE total_observations > 0) as avg_observations_per_network,
        MAX(total_observations) as max_observations_for_network

      FROM app.mv_network_classifications
    `);

    return res.json({
      ok: true,
      summary: result.rows[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[/classification/summary] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch classification summary',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/networks
 * Get classified networks with filters
 *
 * Query params:
 *   - technology: Filter by technology type
 *   - security: Filter by security risk level
 *   - infrastructure: Filter by infrastructure type
 *   - stale: Filter by staleness (true/false)
 *   - location_confidence: Filter by location confidence
 *   - limit: Max results (default 100, max 1000)
 *   - offset: Pagination offset
 */
router.get('/networks', async (req: Request, res: Response) => {
  try {
    const {
      technology,
      security,
      infrastructure,
      stale,
      location_confidence,
      limit = 100,
      offset = 0,
      sortBy = 'total_observations',
      sortOrder = 'desc'
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 100, 1000);
    const offsetNum = parseInt(offset as string) || 0;
    const sortByStr = sortBy as string;
    const sortOrderStr = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
      'bssid', 'ssid', 'total_observations', 'local_observations', 'wigle_observations',
      'first_observed', 'last_observed', 'avg_gps_accuracy_m', 'max_spread_m',
      'security_risk_level', 'infrastructure_type', 'frequency_band'
    ];

    const sortColumn = allowedSortColumns.includes(sortByStr) ? sortByStr : 'total_observations';

    const pool = getPool();
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCounter = 1;

    if (technology) {
      conditions.push(`technology_resolved = $${paramCounter++}`);
      params.push(technology);
    }

    if (security) {
      conditions.push(`security_risk_level = $${paramCounter++}`);
      params.push(security);
    }

    if (infrastructure) {
      conditions.push(`infrastructure_type = $${paramCounter++}`);
      params.push(infrastructure);
    }

    if (stale !== undefined) {
      conditions.push(`is_stale = $${paramCounter++}`);
      params.push(stale === 'true');
    }

    if (location_confidence) {
      conditions.push(`location_confidence = $${paramCounter++}`);
      params.push(location_confidence);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Use subquery to get distinct networks first, then join for enrichment
    const query = `
      WITH ranked_networks AS (
        SELECT DISTINCT ON (c.bssid)
          c.bssid,
          c.ssid,
          c.technology_resolved,
          c.frequency_band,
          c.security_risk_level,
          c.infrastructure_type,
          c.is_stale,
          c.location_confidence,
          c.local_observations,
          c.wigle_observations,
          c.total_observations,
          c.avg_gps_accuracy_m,
          c.max_spread_m,
          c.first_observed,
          c.last_observed,
          c.centroid
        FROM app.mv_network_classifications c
        ${whereClause}
        ORDER BY c.bssid, c.last_observed DESC
      )
      SELECT
        r.*,
        n.frequency,
        n.capabilities,
        n.bestlevel as signal_strength,
        ST_AsGeoJSON(r.centroid)::json as centroid_geojson
      FROM ranked_networks r
      LEFT JOIN app.networks_legacy n ON r.bssid = n.bssid
      ORDER BY ${sortColumn} ${sortOrderStr}, r.last_observed DESC NULLS LAST
      LIMIT $${paramCounter++} OFFSET $${paramCounter}
    `;

    params.push(limitNum, offsetNum);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM app.mv_network_classifications
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    return res.json({
      ok: true,
      data: result.rows,
      metadata: {
        total: parseInt(countResult.rows[0].total),
        limit: limitNum,
        offset: offsetNum,
        returned: result.rows.length
      },
      filters: {
        technology,
        security,
        infrastructure,
        stale,
        location_confidence
      }
    });

  } catch (error) {
    console.error('[/classification/networks] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch classified networks',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/network/:bssid
 * Get classification details for a specific network
 */
router.get('/network/:bssid', async (req: Request, res: Response) => {
  try {
    const { bssid } = req.params;
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        *,
        ST_AsGeoJSON(centroid)::json as centroid_geojson
      FROM app.mv_network_classifications
      WHERE bssid = $1
    `, [bssid.toUpperCase()]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Network not found in classification system'
      });
    }

    return res.json({
      ok: true,
      network: result.rows[0]
    });

  } catch (error) {
    console.error('[/classification/network/:bssid] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch network classification',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/technology-breakdown
 * Get detailed technology type breakdown
 */
router.get('/technology-breakdown', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        technology_resolved,
        frequency_band,
        COUNT(*) as count,
        AVG(total_observations)::NUMERIC(10,2) as avg_observations,
        COUNT(*) FILTER (WHERE is_stale = false) as active_count,
        COUNT(*) FILTER (WHERE is_stale = true) as stale_count
      FROM app.mv_network_classifications
      GROUP BY technology_resolved, frequency_band
      ORDER BY count DESC
    `);

    return res.json({
      ok: true,
      breakdown: result.rows
    });

  } catch (error) {
    console.error('[/classification/technology-breakdown] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch technology breakdown',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/security-breakdown
 * Get detailed security risk breakdown
 */
router.get('/security-breakdown', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        security_risk_level,
        infrastructure_type,
        COUNT(*) as count,
        AVG(total_observations)::NUMERIC(10,2) as avg_observations
      FROM app.mv_network_classifications
      GROUP BY security_risk_level, infrastructure_type
      ORDER BY count DESC
    `);

    return res.json({
      ok: true,
      breakdown: result.rows
    });

  } catch (error) {
    console.error('[/classification/security-breakdown] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch security breakdown',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/high-risk-networks
 * Get networks with high security risks
 */
router.get('/high-risk-networks', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        bssid,
        ssid,
        technology_resolved,
        security_risk_level,
        infrastructure_type,
        total_observations,
        last_observed,
        ST_AsGeoJSON(centroid)::json as centroid_geojson
      FROM app.mv_network_classifications
      WHERE security_risk_level IN (
        'Insecure (Deprecated - WEP)',
        'Vulnerable (WPA/WPS)',
        'Unsecured (Open)'
      )
      AND is_stale = false
      ORDER BY
        CASE security_risk_level
          WHEN 'Insecure (Deprecated - WEP)' THEN 1
          WHEN 'Unsecured (Open)' THEN 2
          WHEN 'Vulnerable (WPA/WPS)' THEN 3
        END,
        total_observations DESC
      LIMIT $1
    `, [limit]);

    return res.json({
      ok: true,
      high_risk_networks: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('[/classification/high-risk-networks] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch high-risk networks',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/mobile-assets
 * Get networks classified as mobile assets
 */
router.get('/mobile-assets', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        bssid,
        ssid,
        technology_resolved,
        infrastructure_type,
        max_spread_m,
        total_observations,
        first_observed,
        last_observed,
        ST_AsGeoJSON(centroid)::json as centroid_geojson
      FROM app.mv_network_classifications
      WHERE infrastructure_type = 'Specialized/Mobile Asset'
      AND is_stale = false
      ORDER BY max_spread_m DESC NULLS LAST
      LIMIT $1
    `, [limit]);

    return res.json({
      ok: true,
      mobile_assets: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('[/classification/mobile-assets] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch mobile assets',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/classification/refresh
 * Refresh the classification materialized view
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const startTime = Date.now();

    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_network_classifications');

    const duration = Date.now() - startTime;

    // Get updated count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM app.mv_network_classifications');

    return res.json({
      ok: true,
      message: 'Classification view refreshed successfully',
      duration_ms: duration,
      total_networks: parseInt(countResult.rows[0].total),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[/classification/refresh] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to refresh classifications',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/search
 * Search networks by SSID or BSSID
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = 50 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'Query parameter "q" is required'
      });
    }

    const limitNum = Math.min(parseInt(limit as string) || 50, 500);
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        bssid,
        ssid,
        technology_resolved,
        frequency_band,
        security_risk_level,
        infrastructure_type,
        total_observations,
        last_observed,
        ST_AsGeoJSON(centroid)::json as centroid_geojson
      FROM app.mv_network_classifications
      WHERE
        UPPER(ssid) LIKE UPPER($1)
        OR UPPER(bssid) LIKE UPPER($1)
      ORDER BY last_observed DESC NULLS LAST
      LIMIT $2
    `, [`%${q}%`, limitNum]);

    return res.json({
      ok: true,
      query: q,
      results: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('[/classification/search] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to search networks',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/networks-near-home
 * Get networks within a specified radius of home location with full enriched data
 *
 * Query params:
 *   - radius_m: Radius in meters (default 100)
 *   - limit: Max results (default 100, max 1000)
 *   - sortBy: Sort column (default 'total_observations')
 *   - sortOrder: 'asc' or 'desc' (default 'desc')
 */
router.get('/networks-near-home', async (req: Request, res: Response) => {
  try {
    const {
      radius_m = 100,
      limit = 100,
      sortBy = 'total_observations',
      sortOrder = 'desc'
    } = req.query;

    const radiusMeters = parseFloat(radius_m as string) || 100;
    const limitNum = Math.min(parseInt(limit as string) || 100, 1000);
    const sortByStr = sortBy as string;
    const sortOrderStr = (sortOrder as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = [
      'bssid', 'ssid', 'total_observations', 'local_observations', 'wigle_observations',
      'first_observed', 'last_observed', 'avg_gps_accuracy_m', 'max_spread_m',
      'security_risk_level', 'infrastructure_type', 'frequency_band', 'distance_from_home',
      'frequency', 'signal_strength'
    ];

    const sortColumn = allowedSortColumns.includes(sortByStr) ? sortByStr : 'total_observations';

    const pool = getPool();

    const query = `
      WITH home_location AS (
        SELECT location_point AS home_point
        FROM app.location_markers
        WHERE marker_type = 'home'
        LIMIT 1
      )
      SELECT DISTINCT ON (c.bssid)
        c.bssid,
        c.ssid,
        c.technology_resolved,
        c.frequency_band,
        n.frequency,
        n.capabilities,
        n.bestlevel as signal_strength,
        n.type as device_type,
        n.mfgrid as manufacturer_id,
        c.security_risk_level,
        c.infrastructure_type,
        c.is_stale,
        c.location_confidence,
        c.local_observations,
        c.wigle_observations,
        c.total_observations,
        c.avg_gps_accuracy_m,
        c.max_spread_m,
        c.first_observed,
        c.last_observed,
        ROUND(ST_Distance(c.centroid::geography, h.home_point::geography)::NUMERIC, 2) as distance_from_home,
        ST_AsGeoJSON(c.centroid)::json as centroid_geojson
      FROM app.mv_network_classifications c
      CROSS JOIN home_location h
      LEFT JOIN app.networks_legacy n ON c.bssid = n.bssid
      WHERE ST_Distance(c.centroid::geography, h.home_point::geography) <= $1
        AND c.technology_resolved = 'Wi-Fi'
      ORDER BY c.bssid, ${sortColumn} ${sortOrderStr}, c.total_observations DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [radiusMeters, limitNum]);

    return res.json({
      ok: true,
      data: result.rows,
      metadata: {
        radius_meters: radiusMeters,
        limit: limitNum,
        returned: result.rows.length
      }
    });

  } catch (error) {
    console.error('[/classification/networks-near-home] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch networks near home',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/classification/stats-by-location
 * Get classification statistics by location confidence
 */
router.get('/stats-by-location', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const result = await pool.query(`
      SELECT
        location_confidence,
        COUNT(*) as total_networks,
        AVG(avg_gps_accuracy_m)::NUMERIC(10,2) as avg_gps_accuracy,
        AVG(max_spread_m)::NUMERIC(10,2) as avg_spread,
        AVG(total_observations)::NUMERIC(10,2) as avg_observations,
        COUNT(*) FILTER (WHERE security_risk_level LIKE 'Robust%') as secure_networks,
        COUNT(*) FILTER (WHERE security_risk_level IN ('Insecure (Deprecated - WEP)', 'Unsecured (Open)')) as insecure_networks
      FROM app.mv_network_classifications
      GROUP BY location_confidence
      ORDER BY
        CASE location_confidence
          WHEN 'High Confidence' THEN 1
          WHEN 'Medium Confidence' THEN 2
          WHEN 'Low Confidence' THEN 3
          WHEN 'No Location Data' THEN 4
        END
    `);

    return res.json({
      ok: true,
      stats: result.rows
    });

  } catch (error) {
    console.error('[/classification/stats-by-location] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch location statistics',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
