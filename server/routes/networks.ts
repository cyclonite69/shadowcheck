// server/routes/networks.ts
import { Router } from "express";
import { query } from "../db";

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
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
  const before = Number(req.query.before_time_ms);
  const hasBefore = Number.isFinite(before);

  const distinctLatest =
    req.query.distinct_latest === "1" ||
    req.query.distinct_latest === "true" ||
    req.query.distinct_latest === "yes";

  // Build base CTE depending on distinct_latest
  const whereTime = hasBefore ? "WHERE d.time < $1" : "";
  const paramOffset = hasBefore ? 2 : 1;

  const baseCTE = distinctLatest
    ? `
      WITH latest AS (
        SELECT bssid, MAX(time) AS max_time
        FROM app.location_details_enriched
        GROUP BY bssid
      ),
      rows AS (
        SELECT
          d.id, d.bssid, d.level, d.lat, d.lon, d.altitude, d.accuracy,
          d.time::text  AS time,
          d.time        AS time_epoch_ms,
          to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
          d.ssid_at_time,
          d.frequency_at_time,
          d.frequency_mhz,
          d.channel,
          d.band,
          d.radio_short,
          d.security_short,
          d.cipher_short,
          d.flags_short,
          -- Cellular identifiers (only when MCC_MNC_CID)
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 1)::int ELSE NULL END AS cell_mcc,
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 2)::int ELSE NULL END AS cell_mnc,
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 3)::bigint ELSE NULL END AS cell_cid,
          -- BLE service UUIDs for BT
          CASE WHEN d.radio_short = 'BT' THEN (
            SELECT array_agg(DISTINCT m[1])::text[]
            FROM regexp_matches(coalesce(d.capabilities_at_time,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
          ) ELSE NULL END AS ble_services
        FROM app.location_details_enriched d
        JOIN latest x ON x.bssid = d.bssid AND x.max_time = d.time
        ${whereTime}
        ORDER BY d.time DESC
        LIMIT $${paramOffset}
      )
    `
    : `
      WITH rows AS (
        SELECT
          d.id, d.bssid, d.level, d.lat, d.lon, d.altitude, d.accuracy,
          d.time::text  AS time,
          d.time        AS time_epoch_ms,
          to_char( to_timestamp(d.time/1000.0) AT TIME ZONE 'UTC',
                   'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"' ) AS time_iso,
          d.ssid_at_time,
          d.frequency_at_time,
          d.frequency_mhz,
          d.channel,
          d.band,
          d.radio_short,
          d.security_short,
          d.cipher_short,
          d.flags_short,
          -- Cellular identifiers (only when MCC_MNC_CID)
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 1)::int ELSE NULL END AS cell_mcc,
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 2)::int ELSE NULL END AS cell_mnc,
          CASE WHEN d.radio_short LIKE 'Cell%'
                 AND d.bssid ~ '^[0-9]+_[0-9]+_[0-9]+$'
               THEN split_part(d.bssid, '_', 3)::bigint ELSE NULL END AS cell_cid,
          -- BLE service UUIDs for BT
          CASE WHEN d.radio_short = 'BT' THEN (
            SELECT array_agg(DISTINCT m[1])::text[]
            FROM regexp_matches(coalesce(d.capabilities_at_time,''), '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'gi') m
          ) ELSE NULL END AS ble_services
        FROM app.location_details_enriched d
        ${whereTime}
        ORDER BY d.time DESC
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
    res.json({
      ok: true,
      count: rows.length,
      cursor: {
        next_before_time_ms: rows.length ? rows[rows.length - 1].time_epoch_ms : null
      },
      rows
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
