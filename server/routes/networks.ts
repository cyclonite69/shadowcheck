// server/routes/networks.ts
import { Router } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/v1/networks?limit=100&before_time_ms=...&distinct_latest=1
 *
 * - Default: recent rows ordered by time DESC with cursor pagination.
 * - distinct_latest=1 : only the most-recent row per BSSID (like visualize_latest),
 *   still ordered by time DESC and limited/paginated by time.
 *
 * Always returns enriched Wi-Fi fields when meaningful:
 *   frequency_mhz, channel, band
 * Adds cellular fields when bssid = MCC_MNC_CID:
 *   cell_mcc, cell_mnc, cell_cid
 * Adds BLE service UUIDs for BT rows when present in capabilities:
 *   ble_services[]
 */
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
  const before = Number(req.query.before_time_ms);
  const hasBefore = Number.isFinite(before);

  const distinctLatest =
    req.query.distinct_latest === '1' ||
    req.query.distinct_latest === 'true' ||
    req.query.distinct_latest === 'yes';

  // Build base CTE depending on distinct_latest
  const whereTime = hasBefore ? 'WHERE l.time < $1' : '';
  const paramOffset = hasBefore ? 2 : 1;

  const baseCTE = distinctLatest
    ? `
      WITH latest AS (
        SELECT bssid, MAX(time) AS max_time
        FROM app.locations_legacy
        GROUP BY bssid
      ),
      rows AS (
        SELECT
          l.unified_id as id,
          l.bssid,
          l.level,
          l.lat,
          l.lon,
          l.altitude,
          l.accuracy,
          l.time::text  AS time,
          l.time        AS time_epoch_ms,
          to_char( to_timestamp(l.time/1000.0) AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
          n.ssid,
          n.frequency,
          n.capabilities,
          n.type,
          n.bestlevel,
          n.lasttime,
          -- Cellular identifiers (only when MCC_MNC_CID)
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 1)::int ELSE NULL END AS cell_mcc,
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 2)::int ELSE NULL END AS cell_mnc,
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 3)::bigint ELSE NULL END AS cell_cid,
          -- BLE service UUIDs for BT
          CASE WHEN n.type = 'BT' THEN (
            SELECT array_agg(DISTINCT m[1])::text[]
            FROM regexp_matches(coalesce(n.capabilities,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
          ) ELSE NULL END AS ble_services
        FROM app.locations_legacy l
        LEFT JOIN app.networks_legacy n ON n.bssid = l.bssid
        JOIN latest x ON x.bssid = l.bssid AND x.max_time = l.time
        ${whereTime}
        ORDER BY l.time DESC
        LIMIT $${paramOffset}
      )
    `
    : `
      WITH rows AS (
        SELECT
          l.unified_id as id,
          l.bssid,
          l.level,
          l.lat,
          l.lon,
          l.altitude,
          l.accuracy,
          l.time::text  AS time,
          l.time        AS time_epoch_ms,
          to_char( to_timestamp(l.time/1000.0) AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
          n.ssid,
          n.frequency,
          n.capabilities,
          n.type,
          n.bestlevel,
          n.lasttime,
          -- Cellular identifiers (only when MCC_MNC_CID)
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 1)::int ELSE NULL END AS cell_mcc,
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 2)::int ELSE NULL END AS cell_mnc,
          CASE WHEN n.type LIKE 'C%'
                 AND l.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(l.bssid, '_', 3)::bigint ELSE NULL END AS cell_cid,
          -- BLE service UUIDs for BT
          CASE WHEN n.type = 'BT' THEN (
            SELECT array_agg(DISTINCT m[1])::text[]
            FROM regexp_matches(coalesce(n.capabilities,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
          ) ELSE NULL END AS ble_services
        FROM app.locations_legacy l
        LEFT JOIN app.networks_legacy n ON n.bssid = l.bssid
        ${whereTime}
        ORDER BY l.time DESC
        LIMIT $${paramOffset}
      )
    `;

  const finalSql = `
    ${baseCTE}
    SELECT *
    FROM rows
  `;

  try {
    const params: any[] = hasBefore ? [before, limit] : [limit];
    const { rows } = await query(finalSql, params);

    // Transform data to match frontend expectations
    const transformedData = rows.map(row => ({
      id: row.id,
      ssid: row.ssid,
      bssid: row.bssid,
      frequency: row.frequency,
      channel: null, // Not available in this schema
      signal_strength: row.level,
      encryption: row.capabilities || 'Open',
      latitude: row.lat?.toString(),
      longitude: row.lon?.toString(),
      observed_at: row.time_iso,
      created_at: row.time_iso,
      // Additional properties for compatibility
      capabilities: row.capabilities,
      bestlevel: row.bestlevel,
      lasttime: row.time_iso,
      radio_type: row.type
    }));

    res.json({
      ok: true,
      data: transformedData,
      count: transformedData.length,
      limit: limit,
      cursor: {
        next_before_time_ms: rows.length ? rows[rows.length - 1].time_epoch_ms : null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
