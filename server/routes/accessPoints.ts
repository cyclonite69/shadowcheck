/**
 * Access Points API - Unified Network View with Infinite Scroll
 *
 * Provides paginated access to wireless_access_points data with:
 * - Offset-based pagination (500 records per page)
 * - Dynamic column selection
 * - Total count caching
 * - Proper TypeScript types
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

const router = Router();

// Whitelist of allowed columns for security
const ALLOWED_COLUMNS = new Set([
  'access_point_id',
  'mac_address',
  'current_network_name',
  'radio_technology',
  'manufacturer',
  'oui_prefix_hex',
  'is_hidden_network',
  'is_mobile_device',
  'primary_frequency_hz',
  'max_signal_observed_dbm',
  'mobility_confidence_score',
  'total_observations',
  'unique_data_sources',
  'data_quality',
  'first_seen',
  'last_seen',
  'record_created_at',
  'record_updated_at',
  'location_geojson'
]);

// Default columns (always included)
const DEFAULT_COLUMNS = [
  'access_point_id',
  'mac_address',
  'current_network_name',
  'radio_technology'
];

// Cache for total count (refresh every 5 minutes)
let cachedTotalCount: number | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface AccessPointQueryParams {
  limit?: string;
  offset?: string;
  columns?: string;
  search?: string;
  radio_types?: string;
  min_signal?: string;
  max_signal?: string;
  data_quality?: string;
}

/**
 * GET /api/v1/access-points
 *
 * Query Parameters:
 *   - limit: Number of records to return (default: 500, max: 1000)
 *   - offset: Starting offset for pagination (default: 0)
 *   - columns: Comma-separated list of additional columns (default columns always included)
 *   - search: Search term for MAC address or network name
 *   - radio_types: Comma-separated list of radio types to filter
 *   - min_signal: Minimum signal strength (dBm)
 *   - max_signal: Maximum signal strength (dBm)
 *   - data_quality: Filter by quality level (high, medium, low)
 *   - bbox: Bounding box filter as "minLng,minLat,maxLng,maxLat" (e.g., "-83.7,43.0,-83.6,43.1")
 *   - radius_lat: Center latitude for radius search
 *   - radius_lng: Center longitude for radius search
 *   - radius_meters: Radius in meters for spatial search
 *
 * Response:
 *   {
 *     "ok": true,
 *     "data": [...],
 *     "metadata": {
 *       "total": 126091,
 *       "limit": 500,
 *       "offset": 0,
 *       "hasMore": true,
 *       "returned": 500
 *     }
 *   }
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Parse and validate parameters
    const limit = Math.min(Number(req.query.limit) || 500, 1000);
    const offset = Number(req.query.offset) || 0;

    // Parse column selection
    const requestedColumns = req.query.columns
      ? String(req.query.columns).split(',').map((c: string) => c.trim()).filter((c: string) => ALLOWED_COLUMNS.has(c))
      : [];

    // Combine default columns with requested columns (deduplicate)
    const columnsToSelect = Array.from(new Set([...DEFAULT_COLUMNS, ...requestedColumns]));
    const columnList = columnsToSelect.join(', ');

    // Build WHERE clause based on filters
    const whereClauses: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Search filter (MAC address or network name)
    if (req.query.search) {
      whereClauses.push(`(
        mac_address ILIKE $${paramIndex} OR
        current_network_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${req.query.search}%`);
      paramIndex++;
    }

    // Radio type filter
    if (req.query.radio_types) {
      const radioTypes = String(req.query.radio_types).split(',').map((t: string) => t.trim());
      whereClauses.push(`radio_technology = ANY($${paramIndex}::text[])`);
      queryParams.push(radioTypes);
      paramIndex++;
    }

    // Signal strength range filter
    if (req.query.min_signal) {
      whereClauses.push(`max_signal_observed_dbm >= $${paramIndex}`);
      queryParams.push(Number(req.query.min_signal));
      paramIndex++;
    }

    if (req.query.max_signal) {
      whereClauses.push(`max_signal_observed_dbm <= $${paramIndex}`);
      queryParams.push(Number(req.query.max_signal));
      paramIndex++;
    }

    // Data quality filter
    if (req.query.data_quality) {
      const qualityLevels = String(req.query.data_quality).split(',').map((q: string) => q.trim());
      whereClauses.push(`data_quality = ANY($${paramIndex}::text[])`);
      queryParams.push(qualityLevels);
      paramIndex++;
    }

    // Spatial Filters - Bounding Box
    if (req.query.bbox) {
      const bbox = String(req.query.bbox).split(',').map(Number);
      if (bbox.length === 4 && bbox.every(n => !isNaN(n))) {
        const [minLng, minLat, maxLng, maxLat] = bbox;
        whereClauses.push(`
          location_geojson IS NOT NULL AND
          ST_Intersects(
            location_geojson::geometry,
            ST_MakeEnvelope($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, 4326)
          )
        `);
        queryParams.push(minLng, minLat, maxLng, maxLat);
        paramIndex += 4;
      }
    }

    // Spatial Filters - Radius Search
    if (req.query.radius_lat && req.query.radius_lng && req.query.radius_meters) {
      const centerLat = Number(req.query.radius_lat);
      const centerLng = Number(req.query.radius_lng);
      const radiusMeters = Number(req.query.radius_meters);

      if (!isNaN(centerLat) && !isNaN(centerLng) && !isNaN(radiusMeters)) {
        whereClauses.push(`
          location_geojson IS NOT NULL AND
          ST_DWithin(
            location_geojson::geography,
            ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
            $${paramIndex + 2}
          )
        `);
        queryParams.push(centerLng, centerLat, radiusMeters);
        paramIndex += 3;
      }
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    // Get total count (cached)
    let totalCount: number;
    const now = Date.now();

    if (cachedTotalCount !== null && (now - cacheTimestamp) < CACHE_TTL_MS) {
      totalCount = cachedTotalCount;
    } else {
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM app.api_networks ${whereClause}`,
        whereClause ? queryParams : []
      );
      totalCount = Number(countResult[0].total);

      // Cache only if no filters applied (for accurate total)
      if (whereClauses.length === 0) {
        cachedTotalCount = totalCount;
        cacheTimestamp = now;
      }
    }

    // Fetch paginated data
    queryParams.push(limit);
    queryParams.push(offset);

    const dataSql = `
      SELECT ${columnList}
      FROM app.api_networks
      ${whereClause}
      ORDER BY access_point_id DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    const result = await db.query(dataSql, queryParams);

    // Calculate if there are more records
    const hasMore = offset + result.length < totalCount;

    res.json({
      ok: true,
      data: result,
      metadata: {
        total: totalCount,
        limit,
        offset,
        hasMore,
        returned: result.length
      }
    });

  } catch (error: any) {
    console.error('[AccessPoints API] Error:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
});

/**
 * GET /api/v1/access-points/columns
 *
 * Returns the list of available columns for dynamic column selection
 */
router.get('/columns', async (_req: Request, res: Response) => {
  try {
    const columnGroups = {
      default: DEFAULT_COLUMNS,
      identity: [
        'manufacturer',
        'oui_prefix_hex',
        'is_hidden_network',
        'is_mobile_device'
      ],
      signal: [
        'primary_frequency_hz',
        'max_signal_observed_dbm',
        'mobility_confidence_score'
      ],
      statistics: [
        'total_observations',
        'unique_data_sources',
        'data_quality'
      ],
      timestamps: [
        'first_seen',
        'last_seen',
        'record_created_at',
        'record_updated_at'
      ],
      location: [
        'location_geojson'
      ]
    };

    res.json({
      ok: true,
      columns: columnGroups,
      allColumns: Array.from(ALLOWED_COLUMNS)
    });

  } catch (error: any) {
    console.error('[AccessPoints API] Error fetching columns:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
});

/**
 * GET /api/v1/access-points/:mac/observations
 *
 * Get all individual observations for a specific network (by MAC address)
 * Returns observation history from locations_legacy table
 */
router.get('/:mac/observations', async (req: Request, res: Response) => {
  try {
    const macAddress = req.params.mac;
    const limit = Math.min(Number(req.query.limit) || 1000, 10000);
    const offset = Number(req.query.offset) || 0;

    // Get total count for this BSSID
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM app.locations_legacy WHERE bssid = $1',
      [macAddress]
    );
    const totalCount = Number(countResult[0].total);

    // Fetch observations with pagination
    const result = await db.query(
      `SELECT
        bssid,
        ssid,
        type as radio_type,
        encryption,
        frequency,
        signal_strength,
        lat as latitude,
        lon as longitude,
        observed_at,
        ST_AsGeoJSON(ST_SetSRID(ST_MakePoint(lon, lat), 4326))::json as location_geojson
      FROM app.locations_legacy
      WHERE bssid = $1
      ORDER BY observed_at DESC
      LIMIT $2 OFFSET $3`,
      [macAddress, limit, offset]
    );

    const hasMore = offset + result.length < totalCount;

    res.json({
      ok: true,
      data: result,
      metadata: {
        total: totalCount,
        limit,
        offset,
        hasMore,
        returned: result.length,
        mac_address: macAddress
      }
    });

  } catch (error: any) {
    console.error('[AccessPoints API] Error fetching observations:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
});

/**
 * GET /api/v1/access-points/:id
 *
 * Get detailed information for a specific access point
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const accessPointId = Number(req.params.id);

    if (!Number.isFinite(accessPointId)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid access point ID'
      });
    }

    const result = await db.query(
      'SELECT * FROM app.api_networks WHERE access_point_id = $1',
      [accessPointId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Access point not found'
      });
    }

    res.json({
      ok: true,
      data: result[0]
    });

  } catch (error: any) {
    console.error('[AccessPoints API] Error fetching access point:', error);
    res.status(500).json({
      ok: false,
      error: error?.message || String(error)
    });
  }
});

export default router;
