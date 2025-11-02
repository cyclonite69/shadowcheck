/**
 * WiGLE SQLite Backup Staging Routes
 *
 * Provides API access to WiGLE Android app backup data that's been imported
 * into staging tables for review before merging into main network observations.
 *
 * These staging tables are populated by the wigle_sqlite_parser.py script.
 */

import { Router, Request, Response } from 'express';
import { getPool } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v1/wigle/staging/networks
 *
 * List networks from WiGLE SQLite backup staging table
 */
router.get('/staging/networks', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { limit = 100, offset = 0, source_id, bssid } = req.query;

    let query = `
      SELECT
        unified_id,
        source_id,
        bssid,
        ssid,
        frequency,
        capabilities,
        lasttime,
        lastlat,
        lastlon,
        type,
        bestlevel,
        bestlat,
        bestlon,
        sqlite_filename,
        imported_at
      FROM app.wigle_sqlite_networks_staging
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (source_id) {
      paramCount++;
      query += ` AND source_id = $${paramCount}`;
      params.push(source_id);
    }

    if (bssid) {
      paramCount++;
      query += ` AND bssid = $${paramCount}`;
      params.push(bssid);
    }

    query += ` ORDER BY imported_at DESC, unified_id DESC`;

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM app.wigle_sqlite_networks_staging WHERE 1=1`;
    const countParams: any[] = [];
    let countParamNum = 0;

    if (source_id) {
      countParamNum++;
      countQuery += ` AND source_id = $${countParamNum}`;
      countParams.push(source_id);
    }

    if (bssid) {
      countParamNum++;
      countQuery += ` AND bssid = $${countParamNum}`;
      countParams.push(bssid);
    }

    const countResult = await pool.query(countQuery, countParams);

    return res.json({
      ok: true,
      networks: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: parseInt(countResult.rows[0].total)
      }
    });

  } catch (error) {
    console.error('[/api/v1/wigle/staging/networks] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch staging networks',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/wigle/staging/locations
 *
 * List location observations from WiGLE SQLite backup staging table
 */
router.get('/staging/locations', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { limit = 100, offset = 0, source_id, bssid } = req.query;

    let query = `
      SELECT
        unified_id,
        source_id,
        _id,
        bssid,
        level,
        lat,
        lon,
        altitude,
        accuracy,
        time,
        external,
        mfgrid,
        sqlite_filename,
        imported_at
      FROM app.wigle_sqlite_locations_staging
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (source_id) {
      paramCount++;
      query += ` AND source_id = $${paramCount}`;
      params.push(source_id);
    }

    if (bssid) {
      paramCount++;
      query += ` AND bssid = $${paramCount}`;
      params.push(bssid);
    }

    query += ` ORDER BY imported_at DESC, time DESC, unified_id DESC`;

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM app.wigle_sqlite_locations_staging WHERE 1=1`;
    const countParams: any[] = [];
    let countParamNum = 0;

    if (source_id) {
      countParamNum++;
      countQuery += ` AND source_id = $${countParamNum}`;
      countParams.push(source_id);
    }

    if (bssid) {
      countParamNum++;
      countQuery += ` AND bssid = $${countParamNum}`;
      countParams.push(bssid);
    }

    const countResult = await pool.query(countQuery, countParams);

    return res.json({
      ok: true,
      locations: result.rows,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: parseInt(countResult.rows[0].total)
      }
    });

  } catch (error) {
    console.error('[/api/v1/wigle/staging/locations] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch staging locations',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/wigle/staging/summary
 *
 * Summary statistics for staging data
 */
router.get('/staging/summary', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const summaryResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM app.wigle_sqlite_networks_staging) as total_networks_staged,
        (SELECT COUNT(DISTINCT bssid) FROM app.wigle_sqlite_networks_staging) as unique_bssids_networks,
        (SELECT COUNT(*) FROM app.wigle_sqlite_locations_staging) as total_locations_staged,
        (SELECT COUNT(DISTINCT bssid) FROM app.wigle_sqlite_locations_staging) as unique_bssids_locations,
        (SELECT COUNT(DISTINCT source_id) FROM app.wigle_sqlite_networks_staging) as unique_sources,
        (SELECT MIN(imported_at) FROM app.wigle_sqlite_networks_staging) as oldest_import,
        (SELECT MAX(imported_at) FROM app.wigle_sqlite_networks_staging) as newest_import
    `);

    return res.json({
      ok: true,
      summary: summaryResult.rows[0]
    });

  } catch (error) {
    console.error('[/api/v1/wigle/staging/summary] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch staging summary',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/v1/wigle/staging/clear
 *
 * Clear all staging data (use after merging to main tables)
 */
router.delete('/staging/clear', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const { source_id } = req.query;

    if (source_id) {
      // Clear specific source
      const networksResult = await pool.query(
        'DELETE FROM app.wigle_sqlite_networks_staging WHERE source_id = $1',
        [source_id]
      );
      const locationsResult = await pool.query(
        'DELETE FROM app.wigle_sqlite_locations_staging WHERE source_id = $1',
        [source_id]
      );

      return res.json({
        ok: true,
        deleted: {
          networks: networksResult.rowCount,
          locations: locationsResult.rowCount
        }
      });
    } else {
      // Clear all staging data
      const networksResult = await pool.query('TRUNCATE TABLE app.wigle_sqlite_networks_staging CASCADE');
      const locationsResult = await pool.query('TRUNCATE TABLE app.wigle_sqlite_locations_staging CASCADE');

      return res.json({
        ok: true,
        message: 'All staging data cleared'
      });
    }

  } catch (error) {
    console.error('[/api/v1/wigle/staging/clear] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to clear staging data',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
