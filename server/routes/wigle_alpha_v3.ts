/**
 * WiGLE Alpha v3 API Routes
 *
 * Drop-in replacement for WiGLE Alpha v3 network detail endpoint
 * Provides SSID temporal tracking and location clustering
 *
 * Key Features:
 * - Full Alpha v3 response structure compatibility
 * - SSID change detection (e.g., Delta3G → Whitman1968)
 * - Location clustering by SSID
 * - All individual observation points
 * - Reverse geocoding (street addresses)
 *
 * INTEL GOLD: Detects mobile hotspots and SSID rotation patterns
 */

import { Router, Request, Response } from 'express';
import { getPool } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v3/network/:bssid/detail
 *
 * Returns complete network detail matching WiGLE Alpha v3 structure
 *
 * Example: /api/v3/network/CA:99:B2:1E:55:13/detail
 *
 * Response matches WiGLE Alpha v3 format:
 * {
 *   "networkId": "CA:99:B2:1E:55:13",
 *   "trilateratedLatitude": 43.02347565,
 *   "bestClusterWiGLEQoS": 6,
 *   "locationClusters": [
 *     {
 *       "clusterSsid": "Delta3G",
 *       "locations": [ ... 804 observations ... ]
 *     },
 *     {
 *       "clusterSsid": "Whitman1968",
 *       "locations": [ ... 133 observations ... ]
 *     }
 *   ]
 * }
 */
router.get('/network/:bssid/detail', async (req: Request, res: Response) => {
  try {
    const { bssid } = req.params;
    const pool = getPool();

    // Get network metadata
    const networkResult = await pool.query(`
      SELECT
        wigle_network_id,
        bssid,
        ssid,
        name,
        network_type,
        encryption,
        channel,
        frequency,
        bcninterval,
        freenet,
        dhcp,
        paynet,
        trilaterated_lat,
        trilaterated_lon,
        best_cluster_qos,
        first_seen,
        last_seen,
        last_update,
        street_address,
        comment,
        query_timestamp
      FROM app.wigle_alpha_v3_networks
      WHERE bssid = $1
    `, [bssid.toUpperCase()]);

    if (networkResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Network not found in WiGLE Alpha v3 cache',
        hint: 'Use POST /api/v1/wigle/tag to fetch from WiGLE API first'
      });
    }

    const network = networkResult.rows[0];

    // Get all observations grouped by SSID (simple schema - no pre-computed clusters)
    const observationsResult = await pool.query(`
      SELECT
        lat,
        lon,
        altitude as alt,
        accuracy,
        observation_time as time,
        last_update as lastupdt,
        month_bucket as month,
        ssid,
        signal_dbm as signal,
        noise,
        snr,
        channel,
        frequency,
        encryption_value,
        wigle_net_id as "netId",
        name,
        wep
      FROM app.wigle_alpha_v3_observations
      WHERE bssid = $1
      ORDER BY ssid NULLS LAST, observation_time ASC
    `, [bssid.toUpperCase()]);

    // Group observations by SSID into clusters (dynamic clustering)
    const observationsBySSID = new Map<string, any[]>();
    for (const obs of observationsResult.rows) {
      const ssidKey = obs.ssid || '<hidden>';
      if (!observationsBySSID.has(ssidKey)) {
        observationsBySSID.set(ssidKey, []);
      }
      observationsBySSID.get(ssidKey)!.push({
        latitude: obs.lat,
        longitude: obs.lon,
        alt: obs.alt,
        accuracy: obs.accuracy,
        time: obs.time,
        lastupdt: obs.lastupdt,
        month: obs.month,
        ssid: obs.ssid,
        signal: obs.signal,
        noise: obs.noise,
        snr: obs.snr,
        channel: obs.channel,
        frequency: obs.frequency,
        encryptionValue: obs.encryption_value,
        netId: obs.netId,
        name: obs.name,
        wep: obs.wep
      });
    }

    // Build location clusters from grouped observations
    const locationClusters = Array.from(observationsBySSID.entries()).map(([ssid, locations]) => {
      // Calculate centroid
      const centroidLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
      const centroidLon = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

      // Get temporal bounds
      const lastUpdates = locations.map(l => l.lastupdt).filter(Boolean).sort();
      const minLastUpdate = lastUpdates[0];
      const maxLastUpdate = lastUpdates[lastUpdates.length - 1];

      // Count unique days
      const uniqueDays = new Set(locations.map(l => l.lastupdt ? l.lastupdt.split('T')[0] : null).filter(Boolean));

      return {
        centroidLatitude: centroidLat,
        centroidLongitude: centroidLon,
        clusterSsid: ssid === '<hidden>' ? null : ssid,
        minLastUpdate,
        maxLastUpdate,
        daysObservedCount: uniqueDays.size,
        score: locations.length, // Use observation count as score
        locations
      };
    });

    // Build Alpha v3 compatible response
    const response = {
      networkId: network.bssid,
      trilateratedLatitude: network.trilaterated_lat,
      trilateratedLongitude: network.trilaterated_lon,
      bestClusterWiGLEQoS: network.best_cluster_qos,
      firstSeen: network.first_seen,
      lastSeen: network.last_seen,
      lastUpdate: network.last_update,
      streetAddress: network.street_address,
      name: network.name,
      type: network.network_type,
      comment: network.comment,
      bcninterval: network.bcninterval,
      freenet: network.freenet,
      dhcp: network.dhcp,
      paynet: network.paynet,
      encryption: network.encryption,
      channel: network.channel,
      frequency: network.frequency,
      locationClusters,

      // ShadowCheck metadata
      _meta: {
        cached_at: network.query_timestamp,
        total_clusters: locationClusters.length,
        total_observations: locationClusters.reduce((sum, c) => sum + c.locations.length, 0),
        unique_ssids: [...new Set(locationClusters.map(c => c.clusterSsid))].filter(Boolean),
        source: 'shadowcheck_alpha_v3_cache'
      }
    };

    return res.json(response);

  } catch (error) {
    console.error('[/api/v3/network/:bssid/detail] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch network details',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v3/network/:bssid/ssid-timeline
 *
 * Returns SSID change timeline for surveillance detection
 *
 * Example response:
 * {
 *   "bssid": "CA:99:B2:1E:55:13",
 *   "timeline": [
 *     {
 *       "ssid": "Delta3G",
 *       "first_seen": "2023-09-16",
 *       "last_seen": "2024-09-19",
 *       "observations": 804,
 *       "days_observed": 67,
 *       "primary_location": { "lat": 43.023, "lon": -83.696 },
 *       "distance_from_primary_km": 0,
 *       "pattern": "stationary"
 *     },
 *     {
 *       "ssid": "Whitman1968",
 *       "first_seen": "2024-03-16",
 *       "last_seen": "2024-03-16",
 *       "observations": 133,
 *       "days_observed": 1,
 *       "clusters": 16,
 *       "max_distance_km": 125,
 *       "pattern": "mobile_hotspot"
 *     }
 *   ],
 *   "threat_assessment": {
 *     "level": "HIGH",
 *     "reason": "SSID rotation + mobility pattern indicates surveillance device"
 *   }
 * }
 */
router.get('/network/:bssid/ssid-timeline', async (req: Request, res: Response) => {
  try {
    const { bssid } = req.params;
    const pool = getPool();

    // Get network
    const networkResult = await pool.query(`
      SELECT wigle_network_id, trilaterated_lat, trilaterated_lon
      FROM app.wigle_alpha_v3_networks
      WHERE bssid = $1
    `, [bssid.toUpperCase()]);

    if (networkResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Network not found'
      });
    }

    const network = networkResult.rows[0];

    // Aggregate SSID timeline from observations (dynamic - no clusters table)
    const timelineResult = await pool.query(`
      WITH ssid_aggregates AS (
        SELECT
          ssid,
          MIN(last_update) as first_seen,
          MAX(last_update) as last_seen,
          COUNT(*) as total_observations,
          COUNT(DISTINCT DATE(last_update)) as total_days,
          COUNT(DISTINCT ST_SnapToGrid(ST_SetSRID(ST_MakePoint(lon, lat), 4326), 0.001)) as cluster_count,
          AVG(lat) as avg_lat,
          AVG(lon) as avg_lon,
          MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
          ) / 1000.0) as max_distance_km
        FROM app.wigle_alpha_v3_observations
        WHERE bssid = $1
        GROUP BY ssid
      )
      SELECT
        ssid,
        first_seen,
        last_seen,
        total_observations,
        total_days,
        cluster_count,
        avg_lat,
        avg_lon,
        max_distance_km,
        CASE
          WHEN cluster_count = 1 AND max_distance_km < 1 THEN 'stationary'
          WHEN cluster_count > 5 AND max_distance_km > 50 THEN 'mobile_hotspot'
          WHEN cluster_count > 1 AND max_distance_km > 5 THEN 'mobile'
          ELSE 'stationary'
        END as pattern
      FROM ssid_aggregates
      ORDER BY first_seen ASC, total_observations DESC
    `, [bssid.toUpperCase(), network.trilaterated_lon, network.trilaterated_lat]);

    const timeline = timelineResult.rows;
    const uniqueSSIDs = timeline.filter(t => t.ssid).length;
    const hasMobilePattern = timeline.some(t => t.pattern === 'mobile_hotspot');

    // Threat assessment
    let threatLevel = 'LOW';
    let threatReason = 'Normal access point behavior';

    if (uniqueSSIDs > 1 && hasMobilePattern) {
      threatLevel = 'HIGH';
      threatReason = 'SSID rotation + mobility pattern indicates surveillance device';
    } else if (uniqueSSIDs > 1) {
      threatLevel = 'MEDIUM';
      threatReason = 'Multiple SSIDs detected for same MAC address';
    } else if (hasMobilePattern) {
      threatLevel = 'MEDIUM';
      threatReason = 'Mobile hotspot pattern detected';
    }

    return res.json({
      bssid: bssid.toUpperCase(),
      timeline,
      threat_assessment: {
        level: threatLevel,
        reason: threatReason,
        unique_ssids: uniqueSSIDs,
        total_observations: timeline.reduce((sum, t) => sum + parseInt(t.total_observations), 0),
        max_distance_km: Math.max(...timeline.map(t => parseFloat(t.max_distance_km) || 0))
      }
    });

  } catch (error) {
    console.error('[/api/v3/network/:bssid/ssid-timeline] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch SSID timeline',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v3/networks/summary
 *
 * Returns summary of cached WiGLE Alpha v3 networks
 */
router.get('/networks/summary', async (req: Request, res: Response) => {
  try {
    const pool = getPool();

    const summaryResult = await pool.query(`
      SELECT
        COUNT(DISTINCT n.bssid) as total_networks,
        COUNT(DISTINCT n.ssid) FILTER (WHERE n.ssid IS NOT NULL) as unique_ssids,
        MIN(n.query_timestamp)::date as oldest_cache,
        MAX(n.query_timestamp)::date as newest_cache,
        COUNT(o.observation_id) as total_observations
      FROM app.wigle_alpha_v3_networks n
      LEFT JOIN app.wigle_alpha_v3_observations o ON o.bssid = n.bssid
    `);

    return res.json({
      ok: true,
      summary: summaryResult.rows[0]
    });

  } catch (error) {
    console.error('[/api/v3/networks/summary] Error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch summary',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
