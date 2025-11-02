// server/routes/federatedObservations.ts
// API endpoints for multi-source data federation

import { Router } from "express";
import { db } from "../db/connection";

const router = Router();

/**
 * GET /api/v1/federated/statistics
 * Get row counts for each federation view
 */
router.get("/statistics", async (req, res) => {
  try {
    const results = await Promise.all([
      db.query(`SELECT COUNT(*) as count FROM app.observations_federated`),
      db.query(`SELECT COUNT(*) as count FROM app.observations_deduplicated`),
      db.query(`SELECT COUNT(*) as count FROM app.observations_deduplicated_fuzzy`),
      db.query(`SELECT COUNT(*) as count FROM app.observations_smart_merged`),
      db.query(`SELECT COUNT(*) as count FROM app.observations_smart_merged_v2`),
      db.query(`SELECT COUNT(*) as count FROM app.observations_hybrid_merged`),
    ]);

    res.json({
      ok: true,
      federated: parseInt(results[0][0].count),
      deduplicated: parseInt(results[1][0].count),
      deduplicated_fuzzy: parseInt(results[2][0].count),
      smart_merged: parseInt(results[3][0].count),
      precision_merged: parseInt(results[4][0].count),
      hybrid: parseInt(results[5][0].count),
    });
  } catch (error: any) {
    console.error("Error fetching federation statistics:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch federation statistics",
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/federated/sources
 * List all available data sources with statistics
 */
router.get("/sources", async (req, res) => {
  try {
    const sql = `SELECT * FROM app.get_source_statistics()`;
    const rows = await db.query(sql);

    // Also get registry metadata
    const registrySql = `
      SELECT
        source_name,
        source_type,
        description,
        is_active,
        is_trusted,
        data_quality_score,
        import_pipeline,
        metadata
      FROM app.data_source_registry
      ORDER BY
        CASE source_type
          WHEN 'production' THEN 1
          WHEN 'enrichment' THEN 2
          WHEN 'staging' THEN 3
          ELSE 4
        END
    `;
    const registryRows = await db.query(registrySql);

    // Merge statistics with registry data
    const sources = registryRows.map((reg: any) => {
      const stats = rows.find((s: any) => s.source_name === reg.source_name);
      return {
        ...reg,
        statistics: stats || {
          total_observations: 0,
          unique_networks: 0,
          date_range_start: null,
          date_range_end: null,
          avg_signal_strength: null
        }
      };
    });

    res.json({
      ok: true,
      count: sources.length,
      sources
    });
  } catch (err: any) {
    console.error("[/federated/sources] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch data sources",
      detail: err?.message || String(err)
    });
  }
});

/**
 * POST /api/v1/federated/sources/:sourceName/toggle
 * Enable or disable a data source
 */
router.post("/sources/:sourceName/toggle", async (req, res) => {
  try {
    const { sourceName } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        ok: false,
        error: "Missing or invalid 'active' boolean in request body"
      });
    }

    const sql = `SELECT app.toggle_data_source($1, $2) as success`;
    const rows = await db.query(sql, [sourceName, active]);

    if (rows[0]?.success) {
      res.json({
        ok: true,
        source: sourceName,
        active,
        message: `Data source ${sourceName} ${active ? 'enabled' : 'disabled'}`
      });
    } else {
      res.status(404).json({
        ok: false,
        error: `Data source '${sourceName}' not found`
      });
    }
  } catch (err: any) {
    console.error("[/federated/sources/:sourceName/toggle] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to toggle data source",
      detail: err?.message || String(err)
    });
  }
});

/**
 * POST /api/v1/federated/sources/refresh
 * Refresh statistics for all data sources
 */
router.post("/sources/refresh", async (req, res) => {
  try {
    const sql = `SELECT * FROM app.refresh_source_statistics()`;
    const rows = await db.query(sql);

    res.json({
      ok: true,
      refreshed: rows.length,
      sources: rows
    });
  } catch (err: any) {
    console.error("[/federated/sources/refresh] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to refresh source statistics",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/observations
 * Query observations from selected sources
 *
 * Query parameters:
 * - sources: Comma-separated list of source names (default: all active)
 * - mode: 'unified' | 'deduplicated' | 'deduplicated_fuzzy' | 'smart_merged' | 'precision_merged' | 'hybrid' (default: 'unified')
 *   - unified: All observations from all sources (may include duplicates)
 *   - deduplicated: Exact deduplication (same BSSID/time/location)
 *   - deduplicated_fuzzy: Fuzzy deduplication (±5min, ~100m tolerance) - handles WiGLE batch processing
 *   - smart_merged: Best field value from each source
 *   - precision_merged: Highest GPS precision + strongest signal
 *   - hybrid: All modalities in tandem (precision GPS + smart metadata + unified timeline)
 * - limit: Max results (default: 100, max: 10000)
 * - offset: Pagination offset (default: 0)
 * - radio_types: Filter by radio type (W, B, E, L, G)
 * - min_quality: Minimum source quality score (0-1)
 * - bbox: Bounding box (minLat,maxLat,minLon,maxLon)
 */
router.get("/observations", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 10000);
    const offset = Number(req.query.offset ?? 0) || 0;
    const mode = String(req.query.mode ?? 'unified');
    const sourcesParam = req.query.sources ? String(req.query.sources) : null;
    const radioTypes = req.query.radio_types ? String(req.query.radio_types).split(',').map(t => t.trim().toUpperCase()) : [];
    const minQuality = req.query.min_quality ? Number(req.query.min_quality) : 0;

    // Build source filter
    const params: any[] = [];
    const where: string[] = [];

    // Select view based on mode
    const viewName = mode === 'hybrid' ? 'observations_hybrid_merged' :
                     mode === 'precision_merged' ? 'observations_smart_merged_v2' :
                     mode === 'smart_merged' ? 'observations_smart_merged' :
                     mode === 'deduplicated_fuzzy' ? 'observations_deduplicated_fuzzy' :
                     mode === 'deduplicated' ? 'observations_deduplicated' :
                     'observations_federated';

    // Source filter (only for federated/deduplicated modes, merged views don't have source_name)
    const mergedModes = ['smart_merged', 'precision_merged', 'hybrid'];
    if (!mergedModes.includes(mode)) {
      if (sourcesParam) {
        const sources = sourcesParam.split(',').map(s => s.trim());
        params.push(sources);
        where.push(`source_name = ANY($${params.length})`);
      } else {
        // Only query active sources by default
        where.push(`source_name IN (SELECT source_name FROM app.data_source_registry WHERE is_active = TRUE)`);
      }
    }

    // Radio type filter
    if (radioTypes.length > 0) {
      params.push(radioTypes);
      where.push(`radio_type = ANY($${params.length})`);
    }

    // Quality filter
    if (minQuality > 0) {
      params.push(minQuality);
      where.push(`source_quality_score >= $${params.length}`);
    }

    // Bounding box filter
    if (req.query.bbox) {
      const bbox = String(req.query.bbox).split(',').map(Number);
      if (bbox.length === 4) {
        params.push(bbox[0], bbox[1], bbox[2], bbox[3]);
        where.push(`latitude BETWEEN $${params.length - 3} AND $${params.length - 2}`);
        where.push(`longitude BETWEEN $${params.length - 1} AND $${params.length}`);
      }
    }

    params.push(limit, offset);

    // Build SQL based on mode (different views have different schemas)
    let sql: string;

    if (mode === 'hybrid') {
      // Hybrid view has unique schema (no altitude, observed_at, service)
      sql = `
        SELECT
          bssid,
          latitude,
          longitude,
          accuracy,
          signal_strength,
          ssid,
          frequency,
          capabilities,
          radio_type,
          time_ms,
          to_timestamp(time_ms / 1000.0) AS observed_at,
          all_observation_times,
          contributing_sources,
          source_count,
          avg_source_quality,
          max_source_quality,
          merge_strategy,
          strategy_details,
          ST_AsGeoJSON(location_point)::jsonb as location_geojson,
          COUNT(*) OVER() AS total_count
        FROM app.observations_hybrid_merged
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY time_ms DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
    } else if (['smart_merged', 'precision_merged'].includes(mode)) {
      // Smart/precision merged views
      sql = `
        SELECT
          bssid,
          signal_strength,
          latitude,
          longitude,
          altitude,
          accuracy,
          time_ms,
          observed_at,
          ssid,
          radio_type,
          frequency,
          capabilities,
          service,
          contributing_sources,
          source_count,
          avg_source_quality,
          max_source_quality,
          completeness_score,
          ST_AsGeoJSON(location_point)::jsonb as location_geojson,
          COUNT(*) OVER() AS total_count
        FROM app.${viewName}
        ${where.length ? `WHERE ${where.join(' AND')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
    } else if (mode === 'deduplicated_fuzzy') {
      // Fuzzy dedup view has source metadata but no kml_filename/api_query_params
      sql = `
        SELECT
          source_name,
          source_type,
          observation_id,
          bssid,
          signal_strength,
          latitude,
          longitude,
          altitude,
          accuracy,
          time_ms,
          observed_at,
          ssid,
          radio_type,
          frequency,
          capabilities,
          service,
          source_quality_score,
          fuzzy_match_count,
          was_deduplicated,
          ST_AsGeoJSON(location_point)::jsonb as location_geojson,
          COUNT(*) OVER() AS total_count
        FROM app.observations_deduplicated_fuzzy
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
    } else if (mode === 'deduplicated') {
      // Dedup view has source metadata but no kml_filename/api_query_params
      sql = `
        SELECT
          source_name,
          source_type,
          observation_id,
          bssid,
          signal_strength,
          latitude,
          longitude,
          altitude,
          accuracy,
          time_ms,
          observed_at,
          ssid,
          radio_type,
          frequency,
          capabilities,
          service,
          source_quality_score,
          ST_AsGeoJSON(location_point)::jsonb as location_geojson,
          COUNT(*) OVER() AS total_count
        FROM app.observations_deduplicated
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
    } else {
      // Federated view has full source metadata including kml_filename/api_query_params
      sql = `
      SELECT
        source_name,
        source_type,
        observation_id,
        bssid,
        signal_strength,
        latitude,
        longitude,
        altitude,
        accuracy,
        time_ms,
        observed_at,
        ssid,
        radio_type,
        frequency,
        capabilities,
        service,
        kml_filename,
        api_query_params,
        source_quality_score,
        ST_AsGeoJSON(location_point)::jsonb as location_geojson,
        COUNT(*) OVER() AS total_count
        FROM app.${viewName}
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;
    }

    const rows = await db.query(sql, params);
    const total_count = rows.length ? Number(rows[0].total_count) : 0;

    res.json({
      ok: true,
      mode,
      count: rows.length,
      total_count,
      offset,
      limit,
      data: rows.map((row: any) => {
        const { total_count, ...observation } = row;
        return observation;
      })
    });
  } catch (err: any) {
    console.error("[/federated/observations] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch federated observations",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/duplicates
 * Find observations that exist in multiple sources
 */
router.get("/duplicates", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);

    const sql = `
      SELECT
        bssid,
        time_ms,
        latitude,
        longitude,
        COUNT(DISTINCT source_name) as source_count,
        array_agg(DISTINCT source_name) as sources,
        array_agg(observation_id) as observation_ids,
        MAX(source_quality_score) as max_quality,
        MIN(source_quality_score) as min_quality
      FROM app.observations_federated
      GROUP BY bssid, time_ms, ROUND(latitude::NUMERIC, 6), ROUND(longitude::NUMERIC, 6)
      HAVING COUNT(DISTINCT source_name) > 1
      ORDER BY source_count DESC, time_ms DESC
      LIMIT $1
    `;

    const rows = await db.query(sql, [limit]);

    res.json({
      ok: true,
      count: rows.length,
      duplicates: rows
    });
  } catch (err: any) {
    console.error("[/federated/duplicates] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to find duplicate observations",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/comparison
 * Compare observation counts by radio type across sources
 */
router.get("/comparison", async (req, res) => {
  try {
    const sql = `
      SELECT
        source_name,
        radio_type,
        COUNT(*) as observation_count,
        COUNT(DISTINCT bssid) as unique_networks,
        ROUND(AVG(signal_strength)::NUMERIC, 2) as avg_signal,
        MIN(observed_at) as earliest,
        MAX(observed_at) as latest
      FROM app.observations_federated
      WHERE radio_type IS NOT NULL
      GROUP BY source_name, radio_type
      ORDER BY source_name, observation_count DESC
    `;

    const rows = await db.query(sql);

    // Pivot data for easier consumption
    const bySource: Record<string, any> = {};
    rows.forEach((row: any) => {
      if (!bySource[row.source_name]) {
        bySource[row.source_name] = {
          source_name: row.source_name,
          radio_types: {}
        };
      }
      bySource[row.source_name].radio_types[row.radio_type] = {
        observation_count: Number(row.observation_count),
        unique_networks: Number(row.unique_networks),
        avg_signal: row.avg_signal ? Number(row.avg_signal) : null,
        earliest: row.earliest,
        latest: row.latest
      };
    });

    res.json({
      ok: true,
      sources: Object.values(bySource)
    });
  } catch (err: any) {
    console.error("[/federated/comparison] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to generate comparison",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/precision-stats
 * Get precision improvement statistics from data melding
 */
router.get("/precision-stats", async (req, res) => {
  try {
    const sql = `SELECT * FROM app.get_precision_improvement_stats()`;
    const rows = await db.query(sql);

    res.json({
      ok: true,
      statistics: rows.map((r: any) => ({
        metric: r.metric,
        before_melding: Number(r.before_melding),
        after_melding: Number(r.after_melding),
        improvement_pct: Number(r.improvement_pct)
      }))
    });
  } catch (err: any) {
    console.error("[/federated/precision-stats] error:", err);
    res.json({
      ok: false,
      error: "Failed to fetch precision statistics",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/enrichment-stats
 * Get enrichment statistics from cross-source duplicates
 */
router.get("/enrichment-stats", async (req, res) => {
  try {
    const sql = `SELECT * FROM app.get_enrichment_stats()`;
    const rows = await db.query(sql);

    if (rows.length === 0) {
      return res.json({
        ok: true,
        statistics: null
      });
    }

    const r = rows[0];
    res.json({
      ok: true,
      statistics: {
        total_observations: Number(r.total_observations),
        observations_in_multiple_sources: Number(r.observations_in_multiple_sources),
        enrichment_percentage: Number(r.enrichment_percentage),
        avg_sources_per_duplicate: Number(r.avg_sources_per_duplicate),
        top_enrichment_pairs: r.top_enrichment_pairs
      }
    });
  } catch (err: any) {
    console.error("[/federated/enrichment-stats] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch enrichment statistics",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/federated/enrichment-analysis
 * Analyze cross-source enrichment for specific observations
 *
 * Query params:
 * - limit: Max results (default: 100)
 */
router.get("/enrichment-analysis", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);

    const sql = `SELECT * FROM app.analyze_cross_source_enrichment($1)`;
    const rows = await db.query(sql, [limit]);

    res.json({
      ok: true,
      count: rows.length,
      enrichments: rows.map((r: any) => ({
        bssid: r.bssid,
        time_ms: r.time_ms,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        source_count: Number(r.source_count),
        contributing_sources: r.contributing_sources,
        enrichment_fields: r.enrichment_fields
      }))
    });
  } catch (err: any) {
    console.error("[/federated/enrichment-analysis] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to analyze enrichment",
      detail: err?.message || String(err)
    });
  }
});

export default router;
