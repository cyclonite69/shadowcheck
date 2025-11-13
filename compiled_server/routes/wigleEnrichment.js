/**
 * WiGLE Enrichment API Routes
 *
 * Endpoints for tagging BSSIDs and enriching them with WiGLE API data
 */
import { Router } from 'express';
import { getPool } from '../db/connection.js';
const router = Router();
/**
 * POST /api/v1/wigle/tag
 * Tag one or more BSSIDs for WiGLE enrichment
 *
 * Body:
 * {
 *   "bssids": ["AA:BB:CC:DD:EE:FF", "11:22:33:44:55:66"],
 *   "reason": "missing location data",
 *   "priority": 50,
 *   "tagged_by": "admin"
 * }
 */
router.post('/tag', async (req, res) => {
    try {
        const { bssids, reason = 'manual tag', priority = 0, tagged_by = 'api' } = req.body;
        if (!bssids || !Array.isArray(bssids) || bssids.length === 0) {
            return res.status(400).json({
                ok: false,
                error: 'Must provide bssids array with at least one BSSID'
            });
        }
        // Validate BSSID format (basic check)
        const bssidRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        const invalidBssids = bssids.filter(b => !bssidRegex.test(b));
        if (invalidBssids.length > 0) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid BSSID format',
                invalid_bssids: invalidBssids
            });
        }
        const pool = getPool();
        const results = [];
        const errors = [];
        for (const bssid of bssids) {
            try {
                const result = await pool.query(`
          INSERT INTO app.bssid_enrichment_queue (bssid, tag_reason, priority, tagged_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (bssid)
            WHERE status IN ('pending', 'processing')
            DO UPDATE SET
              priority = GREATEST(app.bssid_enrichment_queue.priority, EXCLUDED.priority),
              tagged_at = NOW()
          RETURNING tag_id, bssid, status
        `, [bssid.toUpperCase(), reason, priority, tagged_by]);
                results.push(result.rows[0]);
            }
            catch (err) {
                errors.push({
                    bssid,
                    error: err instanceof Error ? err.message : String(err)
                });
            }
        }
        return res.json({
            ok: true,
            tagged: results.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    }
    catch (error) {
        console.error('[/wigle/tag] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to tag BSSIDs',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * GET /api/v1/wigle/queue
 * Get pending enrichment queue
 */
router.get('/queue', async (req, res) => {
    try {
        const status = req.query.status || 'pending';
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const offset = parseInt(req.query.offset) || 0;
        const pool = getPool();
        // Use the view for pending items (includes has_local_data, has_wigle_data)
        // Use the base table for other statuses
        let result;
        if (status === 'pending') {
            result = await pool.query(`
        SELECT * FROM app.pending_wigle_enrichments
        ORDER BY priority DESC, tagged_at ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
        }
        else {
            result = await pool.query(`
        SELECT tag_id, bssid, tagged_at, tagged_by, tag_reason, priority, status,
               processed_at, error_message, wigle_records_found, wigle_locations_found
        FROM app.bssid_enrichment_queue
        WHERE status = $1
        ORDER BY priority DESC, tagged_at ASC
        LIMIT $2 OFFSET $3
      `, [status, limit, offset]);
        }
        const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM app.bssid_enrichment_queue
      WHERE status = $1
    `, [status]);
        return res.json({
            ok: true,
            data: result.rows,
            count: result.rows.length,
            total: parseInt(countResult.rows[0].total),
            offset,
            limit
        });
    }
    catch (error) {
        console.error('[/wigle/queue] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to fetch queue',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * POST /api/v1/wigle/enrich
 * Trigger WiGLE enrichment for tagged BSSIDs
 *
 * Body:
 * {
 *   "tag_ids": [1, 2, 3],  // Optional: specific tag IDs to enrich
 *   "limit": 10,           // Optional: max number to enrich (default 10)
 *   "async": false         // Optional: run async (default false for now)
 * }
 */
router.post('/enrich', async (req, res) => {
    try {
        const { tag_ids, limit = 10, async = false } = req.body;
        const { wigleService } = await import('../services/wigleApi.js');
        const pool = getPool();
        let query;
        let params;
        if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
            // Enrich specific tag IDs
            query = `
        SELECT tag_id, bssid, tag_reason, priority
        FROM app.bssid_enrichment_queue
        WHERE tag_id = ANY($1) AND status = 'pending'
        ORDER BY priority DESC
        LIMIT $2
      `;
            params = [tag_ids, limit];
        }
        else {
            // Enrich next pending items by priority
            query = `
        SELECT tag_id, bssid, tag_reason, priority
        FROM app.bssid_enrichment_queue
        WHERE status = 'pending'
        ORDER BY priority DESC, tagged_at ASC
        LIMIT $1
      `;
            params = [limit];
        }
        const queueItems = await pool.query(query, params);
        if (queueItems.rows.length === 0) {
            return res.json({
                ok: true,
                message: 'No pending items to enrich',
                enriched: 0
            });
        }
        // Mark as processing
        const tagIds = queueItems.rows.map(r => r.tag_id);
        await pool.query(`
      UPDATE app.bssid_enrichment_queue
      SET status = 'processing'
      WHERE tag_id = ANY($1)
    `, [tagIds]);
        if (async) {
            // Return immediately and process in background
            // Note: In production, use a proper job queue
            setImmediate(async () => {
                for (const item of queueItems.rows) {
                    try {
                        await wigleService.enrichBSSID(item.tag_id, item.bssid);
                        // Rate limit: 1 request per second
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    catch (err) {
                        console.error(`[WiGLE] Background enrichment failed for ${item.bssid}:`, err);
                    }
                }
            });
            return res.json({
                ok: true,
                message: 'Enrichment started in background',
                processing: queueItems.rows.length,
                items: queueItems.rows
            });
        }
        else {
            // Process synchronously and return results
            const results = [];
            for (const item of queueItems.rows) {
                const result = await wigleService.enrichBSSID(item.tag_id, item.bssid);
                results.push({
                    tag_id: item.tag_id,
                    bssid: item.bssid,
                    ...result
                });
                // Rate limit: 1 request per second
                if (queueItems.rows.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            return res.json({
                ok: true,
                message: 'Enrichment completed',
                processed: results.length,
                results
            });
        }
    }
    catch (error) {
        console.error('[/wigle/enrich] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to start enrichment',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * GET /api/v1/wigle/stats
 * Get enrichment statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const pool = getPool();
        const stats = await pool.query(`
      SELECT
        status,
        COUNT(*) as count,
        AVG(priority) as avg_priority
      FROM app.bssid_enrichment_queue
      GROUP BY status
      ORDER BY status
    `);
        const recentHistory = await pool.query(`
      SELECT
        COUNT(*) as total_enrichments,
        SUM(records_added) as total_records_added,
        AVG(query_duration_ms) as avg_duration_ms,
        COUNT(*) FILTER (WHERE api_rate_limit_hit) as rate_limit_hits
      FROM app.bssid_enrichment_history
      WHERE enrichment_timestamp > NOW() - INTERVAL '24 hours'
    `);
        return res.json({
            ok: true,
            queue_stats: stats.rows,
            last_24h: recentHistory.rows[0]
        });
    }
    catch (error) {
        console.error('[/wigle/stats] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to fetch stats',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * DELETE /api/v1/wigle/tag/:tag_id
 * Remove a BSSID from enrichment queue
 */
router.delete('/tag/:tag_id', async (req, res) => {
    try {
        const { tag_id } = req.params;
        const pool = getPool();
        const result = await pool.query(`
      UPDATE app.bssid_enrichment_queue
      SET status = 'skipped', processed_at = NOW()
      WHERE tag_id = $1 AND status IN ('pending', 'processing')
      RETURNING tag_id, bssid
    `, [tag_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Tag not found or already processed'
            });
        }
        return res.json({
            ok: true,
            removed: result.rows[0]
        });
    }
    catch (error) {
        console.error('[/wigle/tag/:tag_id] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to remove tag',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * GET /api/v1/wigle/orphaned-networks
 * Get networks from networks_legacy that have no location data
 *
 * Query Parameters:
 *   - limit: Max results (default: 100, max: 1000)
 *   - offset: Pagination offset (default: 0)
 */
router.get('/orphaned-networks', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const offset = parseInt(req.query.offset) || 0;
        const pool = getPool();
        // Get networks that don't have any location records (check all location sources)
        const result = await pool.query(`
      SELECT
        n.bssid,
        n.ssid,
        n.frequency,
        n.capabilities,
        n.type as radio_type,
        n.lasttime,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM app.bssid_enrichment_queue q
            WHERE q.bssid = n.bssid AND q.status IN ('pending', 'processing')
          ) THEN true
          ELSE false
        END as already_tagged
      FROM app.networks_legacy n
      WHERE NOT EXISTS (
        SELECT 1 FROM app.locations_legacy l
        WHERE l.bssid = n.bssid
      )
      AND NOT EXISTS (
        SELECT 1 FROM app.kml_locations_staging k
        WHERE k.bssid = n.bssid
      )
      ORDER BY n.lasttime DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
        // Get total count of orphaned networks (check all location sources)
        const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM app.networks_legacy n
      WHERE NOT EXISTS (
        SELECT 1 FROM app.locations_legacy l
        WHERE l.bssid = n.bssid
      )
      AND NOT EXISTS (
        SELECT 1 FROM app.kml_locations_staging k
        WHERE k.bssid = n.bssid
      )
    `);
        return res.json({
            ok: true,
            data: result.rows,
            metadata: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset,
                returned: result.rows.length
            }
        });
    }
    catch (error) {
        console.error('[/wigle/orphaned-networks] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to fetch orphaned networks',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * GET /api/v1/wigle/networks
 * Get all networks enriched from WiGLE API
 *
 * Query Parameters:
 *   - limit: Max results (default: 100, max: 1000)
 *   - offset: Pagination offset (default: 0)
 */
router.get('/networks', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const offset = parseInt(req.query.offset) || 0;
        const pool = getPool();
        const result = await pool.query(`
      SELECT DISTINCT ON (bssid)
        wigle_api_net_id,
        bssid,
        ssid,
        frequency,
        capabilities,
        type,
        lasttime,
        lastlat,
        lastlon,
        trilat,
        trilong,
        channel,
        qos,
        country,
        region,
        city,
        query_timestamp
      FROM app.wigle_api_networks_staging
      ORDER BY bssid, query_timestamp DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
        const countResult = await pool.query(`
      SELECT COUNT(DISTINCT bssid) as total
      FROM app.wigle_api_networks_staging
    `);
        return res.json({
            ok: true,
            data: result.rows,
            metadata: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset,
                returned: result.rows.length
            }
        });
    }
    catch (error) {
        console.error('[/wigle/networks] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to fetch WiGLE networks',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * GET /api/v1/wigle/network/:bssid
 * Get detailed network information including all location observations
 */
router.get('/network/:bssid', async (req, res) => {
    try {
        const { bssid } = req.params;
        const pool = getPool();
        // Get network metadata (most recent entry)
        const networkResult = await pool.query(`
      SELECT
        wigle_api_net_id,
        bssid,
        ssid,
        frequency,
        capabilities,
        type,
        lasttime,
        lastlat,
        lastlon,
        trilat,
        trilong,
        channel,
        qos,
        country,
        region,
        city,
        query_timestamp,
        query_params
      FROM app.wigle_api_networks_staging
      WHERE bssid = $1
      ORDER BY query_timestamp DESC
      LIMIT 1
    `, [bssid.toUpperCase()]);
        if (networkResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: 'Network not found in WiGLE data'
            });
        }
        // Get all location observations
        const locationsResult = await pool.query(`
      SELECT
        wigle_api_loc_id,
        bssid,
        lat,
        lon,
        altitude,
        accuracy,
        time,
        signal_level,
        query_timestamp
      FROM app.wigle_api_locations_staging
      WHERE bssid = $1
      ORDER BY time DESC
    `, [bssid.toUpperCase()]);
        const network = networkResult.rows[0];
        const locations = locationsResult.rows;
        return res.json({
            ok: true,
            network: {
                ...network,
                observation_count: locations.length,
                observations: locations
            }
        });
    }
    catch (error) {
        console.error('[/wigle/network/:bssid] Error:', error);
        return res.status(500).json({
            ok: false,
            error: 'Failed to fetch network details',
            detail: error instanceof Error ? error.message : String(error)
        });
    }
});
export default router;
