import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v1/networks/:bssid/observations
 *
 * Returns all GPS observations for a specific BSSID with signal strength and timestamps.
 * Used by the Mapbox network visualization component for ANY BSSID.
 *
 * Query params:
 *   - limit: max number of observations (default 10000, max 50000)
 *   - offset: pagination offset (default 0)
 *
 * Returns:
 *   {
 *     bssid: string,
 *     total_observations: number,
 *     observations: [{
 *       lat: number,
 *       lon: number,
 *       signal: number (dBm),
 *       timestamp: number (unix ms),
 *       accuracy: number (meters, if available)
 *     }]
 *   }
 */
router.get('/:bssid/observations', async (req: Request, res: Response) => {
  try {
    const { bssid } = req.params;
    const limit = Math.min(
      parseInt(req.query.limit as string) || 10000,
      50000
    );
    const offset = parseInt(req.query.offset as string) || 0;

    if (!bssid || bssid.trim() === '') {
      return res.status(400).json({
        ok: false,
        error: 'BSSID parameter is required'
      });
    }

    // Get total count for pagination from WiGLE Alpha v3 data
    const countResult = await db.query(
      `SELECT COUNT(*) as total
       FROM app.wigle_alpha_v3_observations
       WHERE bssid = $1
         AND lat IS NOT NULL
         AND lon IS NOT NULL
         AND lat != 0
         AND lon != 0`,
      [bssid]
    );

    const totalObservations = parseInt(countResult[0]?.total || '0');

    if (totalObservations === 0) {
      return res.json({
        ok: true,
        bssid,
        total_observations: 0,
        observations: [],
        message: 'No observations found for this BSSID'
      });
    }

    // Get observations with location, signal, and timestamp from WiGLE Alpha v3 data
    const observationsResult = await db.query(
      `SELECT
         lat,
         lon,
         signal_dbm as signal,
         EXTRACT(EPOCH FROM observation_time) * 1000 as timestamp,
         accuracy
       FROM app.wigle_alpha_v3_observations
       WHERE bssid = $1
         AND lat IS NOT NULL
         AND lon IS NOT NULL
         AND lat != 0
         AND lon != 0
       ORDER BY observation_time ASC
       LIMIT $2 OFFSET $3`,
      [bssid, limit, offset]
    );

    // Calculate signal strength statistics
    const signals = observationsResult
      .map((r: any) => r.signal)
      .filter((s: any) => s !== null);

    const signalStats = signals.length > 0 ? {
      min: Math.min(...signals),
      max: Math.max(...signals),
      avg: Math.round(signals.reduce((a: number, b: number) => a + b, 0) / signals.length)
    } : null;

    // Calculate time range
    const timestamps = observationsResult
      .map((r: any) => r.timestamp)
      .filter((t: any) => t !== null);

    const timeRange = timestamps.length > 0 ? {
      first: Math.min(...timestamps),
      last: Math.max(...timestamps)
    } : null;

    return res.json({
      ok: true,
      bssid,
      total_observations: totalObservations,
      observations: observationsResult.map((row: any) => ({
        lat: parseFloat(row.lat),
        lon: parseFloat(row.lon),
        signal: row.signal !== null ? parseInt(row.signal) : null,
        timestamp: row.timestamp !== null ? parseInt(row.timestamp) : null,
        accuracy: row.accuracy !== null ? parseFloat(row.accuracy) : null
      })),
      stats: {
        signal: signalStats,
        time_range: timeRange,
        returned: observationsResult.length,
        offset,
        has_more: offset + observationsResult.length < totalObservations
      }
    });

  } catch (error) {
    console.error('[NetworkObservations] Error fetching observations:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch network observations',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/networks/:bssid/info
 *
 * Returns basic network information for a BSSID from networks_legacy table.
 */
router.get('/:bssid/info', async (req: Request, res: Response) => {
  try {
    const { bssid } = req.params;

    if (!bssid || bssid.trim() === '') {
      return res.status(400).json({
        ok: false,
        error: 'BSSID parameter is required'
      });
    }

    const result = await db.query(
      `SELECT
         bssid,
         ssid,
         frequency,
         capabilities,
         type,
         bestlevel as best_signal,
         lastlat as last_lat,
         lastlon as last_lon,
         lasttime as last_seen
       FROM app.networks_legacy
       WHERE bssid = $1
       LIMIT 1`,
      [bssid]
    );

    if (result.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Network not found'
      });
    }

    const network = result[0];
    return res.json({
      ok: true,
      network: {
        bssid: network.bssid,
        ssid: network.ssid || '<hidden>',
        frequency: network.frequency,
        capabilities: network.capabilities,
        type: network.type,
        best_signal: network.best_signal,
        last_location: {
          lat: network.last_lat,
          lon: network.last_lon
        },
        last_seen: network.last_seen
      }
    });

  } catch (error) {
    console.error('[NetworkObservations] Error fetching network info:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch network information',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
