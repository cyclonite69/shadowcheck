// server/routes/sourceComparison.ts
// Advanced comparative analysis endpoints for multi-source data analysis

import { Router } from "express";
import { db } from "../db/connection";

const router = Router();

/**
 * GET /api/v1/comparison/observations
 * Compare observations from selected sources with detailed metrics
 *
 * Query params:
 * - sources: Comma-separated list of source names (required)
 * - limit: Max results per source (default: 100)
 * - radio_type: Filter by radio type
 * - bbox: Bounding box filter
 */
router.get("/observations", async (req, res) => {
  try {
    const sourcesParam = req.query.sources ? String(req.query.sources) : null;

    if (!sourcesParam) {
      return res.status(400).json({
        ok: false,
        error: "Missing required 'sources' parameter"
      });
    }

    const sources = sourcesParam.split(',').map(s => s.trim());
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
    const radioType = req.query.radio_type ? String(req.query.radio_type) : null;

    // Query observations from each source separately for comparison
    const sourceResults = await Promise.all(
      sources.map(async (sourceName) => {
        const params: any[] = [sourceName];
        const where: string[] = ['source_name = $1'];

        if (radioType) {
          params.push(radioType);
          where.push(`radio_type = $${params.length}`);
        }

        params.push(limit);

        const sql = `
          SELECT
            source_name,
            observation_id,
            bssid,
            signal_strength,
            latitude,
            longitude,
            observed_at,
            ssid,
            radio_type,
            frequency,
            source_quality_score
          FROM app.observations_federated
          WHERE ${where.join(' AND ')}
          ORDER BY observed_at DESC NULLS LAST
          LIMIT $${params.length}
        `;

        const rows =await db.query(sql, params);

        // Calculate source-specific metrics
        const metrics = {
          total_observations: rows.length,
          unique_networks: new Set(rows.map((r: any) => r.bssid)).size,
          avg_signal: rows.length > 0
            ? rows.reduce((sum: any, r: any) => sum + (r.signal_strength || 0), 0) / rows.length
            : null,
          radio_types: rows.reduce((acc: Record<string, number>, r: any) => {
            if (r.radio_type) {
              acc[r.radio_type] = (acc[r.radio_type] || 0) + 1;
            }
            return acc;
          }, {}),
          date_range: {
            earliest: rows.length > 0 ? rows[rows.length - 1].observed_at : null,
            latest: rows.length > 0 ? rows[0].observed_at : null
          }
        };

        return {
          source_name: sourceName,
          observations: rows,
          metrics
        };
      })
    );

    res.json({
      ok: true,
      selected_sources: sources,
      count: sources.length,
      results: sourceResults
    });
  } catch (err: any) {
    console.error("[/comparison/observations] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to compare observations",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/comparison/overlap
 * Find overlapping observations between selected sources
 *
 * Query params:
 * - sources: Comma-separated list of source names (required, min 2)
 * - limit: Max results (default: 100)
 */
router.get("/overlap", async (req, res) => {
  try {
    const sourcesParam = req.query.sources ? String(req.query.sources) : null;

    if (!sourcesParam) {
      return res.status(400).json({
        ok: false,
        error: "Missing required 'sources' parameter"
      });
    }

    const sources = sourcesParam.split(',').map(s => s.trim());

    if (sources.length < 2) {
      return res.status(400).json({
        ok: false,
        error: "Need at least 2 sources for overlap analysis"
      });
    }

    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);

    // Find observations that exist in multiple selected sources
    const sql = `
      SELECT
        bssid,
        time_ms,
        ROUND(latitude::NUMERIC, 6) as lat_rounded,
        ROUND(longitude::NUMERIC, 6) as lon_rounded,
        COUNT(DISTINCT source_name) as source_count,
        array_agg(DISTINCT source_name ORDER BY source_name) as found_in_sources,
        array_agg(DISTINCT observation_id) as observation_ids,
        MAX(signal_strength) as max_signal,
        MIN(signal_strength) as min_signal,
        AVG(signal_strength) as avg_signal,
        MAX(source_quality_score) as best_quality,
        array_agg(DISTINCT ssid) FILTER (WHERE ssid IS NOT NULL) as ssids,
        array_agg(DISTINCT radio_type) FILTER (WHERE radio_type IS NOT NULL) as radio_types
      FROM app.observations_federated
      WHERE source_name = ANY($1)
      GROUP BY bssid, time_ms, ROUND(latitude::NUMERIC, 6), ROUND(longitude::NUMERIC, 6)
      HAVING COUNT(DISTINCT source_name) > 1
      ORDER BY source_count DESC, time_ms DESC
      LIMIT $2
    `;

    const rows =await db.query(sql, [sources, limit]);

    // Calculate overlap statistics
    const stats = {
      total_overlapping: rows.length,
      by_source_count: rows.reduce((acc: Record<number, number>, r: any) => {
        const count = Number(r.source_count);
        acc[count] = (acc[count] || 0) + 1;
        return acc;
      }, {}),
      quality_improvement: rows.filter((r: any) =>
        r.max_signal && r.min_signal && (r.max_signal - r.min_signal) > 10
      ).length
    };

    res.json({
      ok: true,
      selected_sources: sources,
      count: rows.length,
      statistics: stats,
      overlaps: rows.map((row: any) => ({
        bssid: row.bssid,
        time_ms: row.time_ms,
        latitude: row.lat_rounded,
        longitude: row.lon_rounded,
        found_in: row.found_in_sources,
        source_count: Number(row.source_count),
        signal_range: {
          min: row.min_signal,
          max: row.max_signal,
          avg: row.avg_signal ? Number(row.avg_signal).toFixed(1) : null
        },
        best_quality: Number(row.best_quality),
        ssids: row.ssids,
        radio_types: row.radio_types
      }))
    });
  } catch (err: any) {
    console.error("[/comparison/overlap] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to analyze overlap",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/comparison/unique
 * Find observations unique to each selected source
 *
 * Query params:
 * - sources: Comma-separated list of source names (required)
 * - limit: Max results per source (default: 100)
 */
router.get("/unique", async (req, res) => {
  try {
    const sourcesParam = req.query.sources ? String(req.query.sources) : null;

    if (!sourcesParam) {
      return res.status(400).json({
        ok: false,
        error: "Missing required 'sources' parameter"
      });
    }

    const sources = sourcesParam.split(',').map(s => s.trim());
    const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);

    // For each source, find observations that don't exist in any other selected source
    const uniqueResults = await Promise.all(
      sources.map(async (sourceName) => {
        const otherSources = sources.filter(s => s !== sourceName);

        const sql = `
          WITH source_observations AS (
            SELECT bssid, time_ms, ROUND(latitude::NUMERIC, 6) as lat, ROUND(longitude::NUMERIC, 6) as lon
            FROM app.observations_federated
            WHERE source_name = $1
          ),
          other_observations AS (
            SELECT DISTINCT bssid, time_ms, ROUND(latitude::NUMERIC, 6) as lat, ROUND(longitude::NUMERIC, 6) as lon
            FROM app.observations_federated
            WHERE source_name = ANY($2)
          )
          SELECT
            o.*,
            COUNT(*) OVER() as total_unique
          FROM app.observations_federated o
          WHERE o.source_name = $1
            AND NOT EXISTS (
              SELECT 1 FROM other_observations oo
              WHERE oo.bssid = o.bssid
                AND oo.time_ms = o.time_ms
                AND oo.lat = ROUND(o.latitude::NUMERIC, 6)
                AND oo.lon = ROUND(o.longitude::NUMERIC, 6)
            )
          ORDER BY o.observed_at DESC NULLS LAST
          LIMIT $3
        `;

        const rows =await db.query(sql, [sourceName, otherSources, limit]);

        return {
          source_name: sourceName,
          unique_count: rows.length > 0 ? Number(rows[0].total_unique) : 0,
          sample: rows.slice(0, 10).map((r: any) => {
            const { total_unique, ...observation } = r;
            return observation;
          })
        };
      })
    );

    res.json({
      ok: true,
      selected_sources: sources,
      results: uniqueResults,
      total_unique: uniqueResults.reduce((sum: any, r) => sum + r.unique_count, 0)
    });
  } catch (err: any) {
    console.error("[/comparison/unique] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to find unique observations",
      detail: err?.message || String(err)
    });
  }
});

/**
 * POST /api/v1/comparison/merge
 * Merge selected sources with specified strategy and return combined dataset
 *
 * Body:
 * - sources: Array of source names
 * - mode: 'unified' | 'deduplicated' | 'smart_merged'
 * - limit: Max results (default: 100)
 * - filters: Optional filters (radio_type, bbox, etc.)
 */
router.post("/merge", async (req, res) => {
  try {
    const { sources, mode = 'smart_merged', limit = 100, filters = {} } = req.body;

    if (!Array.isArray(sources) || sources.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Missing or invalid 'sources' array in request body"
      });
    }

    const maxLimit = Math.min(Number(limit) || 100, 10000);

    // Build query based on merge mode
    const params: any[] = [sources];
    const where: string[] = [];

    // View selection based on mode
    const viewName = mode === 'smart_merged' ? 'observations_smart_merged' :
                     mode === 'deduplicated' ? 'observations_deduplicated' :
                     'observations_federated';

    // Add source filter (except for smart_merged which doesn't have source_name)
    if (mode !== 'smart_merged') {
      where.push('source_name = ANY($1)');
    }

    // Add optional filters
    if (filters.radio_type) {
      params.push(filters.radio_type);
      where.push(`radio_type = $${params.length}`);
    }

    if (filters.bbox && Array.isArray(filters.bbox) && filters.bbox.length === 4) {
      const [minLat, maxLat, minLon, maxLon] = filters.bbox;
      params.push(minLat, maxLat, minLon, maxLon);
      where.push(`latitude BETWEEN $${params.length - 3} AND $${params.length - 2}`);
      where.push(`longitude BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    params.push(maxLimit);

    // Build appropriate SQL for each mode
    let sql: string;

    if (mode === 'smart_merged') {
      // Smart merge: filter by contributing sources
      sql = `
        SELECT *
        FROM app.observations_smart_merged
        WHERE contributing_sources && $1::TEXT[]
          ${where.length > 1 ? `AND ${where.slice(1).join(' AND ')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length}
      `;
    } else {
      sql = `
        SELECT *
        FROM app.${viewName}
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY observed_at DESC NULLS LAST
        LIMIT $${params.length}
      `;
    }

    const rows =await db.query(sql, params);

    // Calculate merge statistics
    const stats = {
      mode,
      sources_used: sources,
      result_count: rows.length,
      unique_networks: new Set(rows.map((r: any) => r.bssid)).size,
      radio_type_breakdown: rows.reduce((acc: Record<string, number>, r: any) => {
        if (r.radio_type) {
          acc[r.radio_type] = (acc[r.radio_type] || 0) + 1;
        }
        return acc;
      }, {}),
      date_range: rows.length > 0 ? {
        earliest: rows[rows.length - 1].observed_at,
        latest: rows[0].observed_at
      } : null
    };

    res.json({
      ok: true,
      mode,
      sources: sources,
      count: rows.length,
      statistics: stats,
      data: rows
    });
  } catch (err: any) {
    console.error("[/comparison/merge] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to merge sources",
      detail: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/comparison/quality-matrix
 * Generate quality comparison matrix across sources
 *
 * Query params:
 * - sources: Comma-separated list of source names
 */
router.get("/quality-matrix", async (req, res) => {
  try {
    const sourcesParam = req.query.sources ? String(req.query.sources) : null;

    if (!sourcesParam) {
      return res.status(400).json({
        ok: false,
        error: "Missing required 'sources' parameter"
      });
    }

    const sources = sourcesParam.split(',').map(s => s.trim());

    // Calculate quality metrics for each source
    const qualityResults = await Promise.all(
      sources.map(async (sourceName) => {
        const sql = `
          SELECT
            source_name,
            COUNT(*) as total_observations,
            COUNT(DISTINCT bssid) as unique_networks,

            -- Completeness metrics
            COUNT(*) FILTER (WHERE ssid IS NOT NULL AND ssid != '') as has_ssid,
            COUNT(*) FILTER (WHERE frequency IS NOT NULL) as has_frequency,
            COUNT(*) FILTER (WHERE capabilities IS NOT NULL) as has_capabilities,
            COUNT(*) FILTER (WHERE signal_strength IS NOT NULL) as has_signal,
            COUNT(*) FILTER (WHERE altitude IS NOT NULL) as has_altitude,
            COUNT(*) FILTER (WHERE accuracy IS NOT NULL) as has_accuracy,

            -- Signal quality
            AVG(signal_strength) FILTER (WHERE signal_strength IS NOT NULL) as avg_signal,
            STDDEV(signal_strength) FILTER (WHERE signal_strength IS NOT NULL) as signal_stddev,

            -- Spatial quality
            AVG(accuracy) FILTER (WHERE accuracy IS NOT NULL AND accuracy > 0) as avg_accuracy,

            -- Temporal coverage
            MIN(observed_at) as earliest_observation,
            MAX(observed_at) as latest_observation,

            -- Data quality score
            AVG(source_quality_score) as avg_quality_score

          FROM app.observations_federated
          WHERE source_name = $1
          GROUP BY source_name
        `;

        const rows =await db.query(sql, [sourceName]);

        if (rows.length === 0) {
          return {
            source_name: sourceName,
            error: "No data found"
          };
        }

        const r = rows[0];
        const total = Number(r.total_observations);

        return {
          source_name: sourceName,
          total_observations: total,
          unique_networks: Number(r.unique_networks),
          completeness: {
            ssid: total > 0 ? (Number(r.has_ssid) / total * 100).toFixed(1) : 0,
            frequency: total > 0 ? (Number(r.has_frequency) / total * 100).toFixed(1) : 0,
            capabilities: total > 0 ? (Number(r.has_capabilities) / total * 100).toFixed(1) : 0,
            signal: total > 0 ? (Number(r.has_signal) / total * 100).toFixed(1) : 0,
            altitude: total > 0 ? (Number(r.has_altitude) / total * 100).toFixed(1) : 0,
            accuracy: total > 0 ? (Number(r.has_accuracy) / total * 100).toFixed(1) : 0
          },
          signal_quality: {
            avg: r.avg_signal ? Number(r.avg_signal).toFixed(1) : null,
            stddev: r.signal_stddev ? Number(r.signal_stddev).toFixed(1) : null
          },
          spatial_quality: {
            avg_accuracy: r.avg_accuracy ? Number(r.avg_accuracy).toFixed(1) : null
          },
          temporal_coverage: {
            earliest: r.earliest_observation,
            latest: r.latest_observation,
            span_days: r.earliest_observation && r.latest_observation
              ? Math.round(
                  (new Date(r.latest_observation).getTime() -
                   new Date(r.earliest_observation).getTime()) / (1000 * 60 * 60 * 24)
                )
              : null
          },
          overall_quality_score: Number(r.avg_quality_score).toFixed(2)
        };
      })
    );

    res.json({
      ok: true,
      selected_sources: sources,
      quality_matrix: qualityResults
    });
  } catch (err: any) {
    console.error("[/comparison/quality-matrix] error:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to generate quality matrix",
      detail: err?.message || String(err)
    });
  }
});

export default router;
