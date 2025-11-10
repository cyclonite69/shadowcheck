/**
 * Location Markers API Endpoints
 *
 * Provides access to location markers (home, work, frequent locations, etc.)
 * stored in the app.location_markers table.
 */

import { Router, Request, Response } from "express";
import { query } from '../db/connection.js';

const router = Router();

/**
 * GET /api/v1/locations/markers
 *
 * Get all location markers or filter by type
 *
 * Query parameters:
 * - type: Filter by marker_type (home, work, frequent, sensitive, safe_zone, custom)
 * - active_only: Only return active markers (default: true)
 */
router.get("/markers", async (req: Request, res: Response) => {
  try {
    const markerType = req.query.type as string | undefined;
    const activeOnly = req.query.active_only !== 'false'; // Default true

    let sqlQuery = `
      SELECT
        marker_id,
        marker_name,
        marker_type,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        radius_meters,
        privacy_level,
        notes,
        created_at,
        updated_at,
        is_active
      FROM app.location_markers
      WHERE 1=1
    `;

    const params: any[] = [];

    if (markerType) {
      params.push(markerType);
      sqlQuery += ` AND marker_type = $${params.length}`;
    }

    if (activeOnly) {
      sqlQuery += ` AND is_active = true`;
    }

    sqlQuery += ` ORDER BY marker_type, marker_name`;

    const rows = await query(sqlQuery, params);

    return res.json({
      ok: true,
      count: rows.length,
      data: rows.map((row: any) => ({
        id: row.marker_id,
        name: row.marker_name,
        type: row.marker_type,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        radiusMeters: Number(row.radius_meters),
        privacyLevel: row.privacy_level,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }))
    });

  } catch (error) {
    console.error('[/api/v1/locations/markers] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve location markers",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/locations/markers/:id
 *
 * Get a specific location marker by ID
 */
router.get("/markers/:id", async (req: Request, res: Response) => {
  try {
    const markerId = parseInt(req.params.id);
    if (isNaN(markerId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid marker ID"
      });
    }

    const rows = await query(`
      SELECT
        marker_id,
        marker_name,
        marker_type,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        radius_meters,
        privacy_level,
        notes,
        created_at,
        updated_at,
        is_active
      FROM app.location_markers
      WHERE marker_id = $1
    `, [markerId]);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Location marker not found"
      });
    }

    const row = rows[0];

    return res.json({
      ok: true,
      data: {
        id: row.marker_id,
        name: row.marker_name,
        type: row.marker_type,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        radiusMeters: Number(row.radius_meters),
        privacyLevel: row.privacy_level,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }
    });

  } catch (error) {
    console.error('[/api/v1/locations/markers/:id] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve location marker",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/locations/home
 *
 * Convenience endpoint to get the home location marker
 */
router.get("/home", async (_req: Request, res: Response) => {
  try {
    const rows = await query(`
      SELECT
        marker_id,
        marker_name,
        marker_type,
        ST_Y(location_point::geometry) as latitude,
        ST_X(location_point::geometry) as longitude,
        radius_meters,
        privacy_level,
        notes,
        created_at,
        updated_at,
        is_active
      FROM app.location_markers
      WHERE marker_type = 'home'
        AND is_active = true
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No home location marker found"
      });
    }

    const row = rows[0];

    return res.json({
      ok: true,
      data: {
        id: row.marker_id,
        name: row.marker_name,
        type: row.marker_type,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        radiusMeters: Number(row.radius_meters),
        privacyLevel: row.privacy_level,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }
    });

  } catch (error) {
    console.error('[/api/v1/locations/home] error:', error);
    return res.status(500).json({
      ok: false,
      error: "Failed to retrieve home location",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
