/**
 * Health Check Endpoints for ShadowCheck Backend
 *
 * Provides multiple health check endpoints for different use cases:
 * - /health - Basic liveness check (is the process running?)
 * - /health/ready - Readiness check (can the service handle requests?)
 * - /health/detailed - Detailed health metrics with dependencies
 *
 * Used by:
 * - Docker health checks
 * - Kubernetes readiness/liveness probes
 * - Load balancers
 * - Monitoring systems (Prometheus)
 */

import { Router, Request, Response } from "express";
import { query, pool } from "../db";
import { isSystemShuttingDown } from "../utils/shutdown";
import { getPool, getConnectionStats } from '../db/connection';

const router = Router();

/**
 * Basic liveness check
 * Returns 200 if process is alive and can query database
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const now = await query<{ now: string }>("SELECT now()");
    const who = await query<{ current_user: string }>("SELECT current_user");
    const db = await query<{ current_database: string }>("SELECT current_database()");
    res.json({
      ok: true,
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      time: now.rows[0]?.now,
      user: who.rows[0]?.current_user,
      database: db.rows[0]?.current_database,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      status: "error",
      error: err?.message ?? String(err),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Readiness check
 * Returns 200 only if service can handle requests
 * - Database connection is healthy
 * - Not currently shutting down
 */
router.get("/ready", async (_req: Request, res: Response) => {
  // Check if shutting down
  if (isSystemShuttingDown()) {
    return res.status(503).json({
      status: "not_ready",
      reason: "service_shutting_down",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Check database connectivity
    const pool = getPool();
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    return res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: "ok",
        shutdown: "not_shutting_down",
      },
    });
  } catch (error) {
    console.error("[Health] Readiness check failed:", error);
    return res.status(503).json({
      status: "not_ready",
      reason: "database_connection_failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Detailed health check with metrics
 * Returns comprehensive health information
 */
router.get("/detailed", async (_req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Database health check with query timing
    const pool = getPool();
    const dbCheckStart = Date.now();
    const client = await pool.connect();

    // Test query with PostGIS function to verify extension is working
    const result = await client.query(
      "SELECT PostGIS_version() as version, NOW() as timestamp"
    );
    const dbCheckDuration = Date.now() - dbCheckStart;

    const postgisVersion = result.rows[0]?.version || "unknown";
    const dbTimestamp = result.rows[0]?.timestamp;

    client.release();

    // Get connection pool stats
    const poolStats = getConnectionStats();

    // System metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      cpu: process.cpuUsage(),
    };

    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      checks: {
        database: {
          status: "ok",
          responseTime: `${dbCheckDuration}ms`,
          postgisVersion,
          serverTimestamp: dbTimestamp,
          pool: poolStats,
        },
        system: systemMetrics,
        shutdown: {
          isShuttingDown: isSystemShuttingDown(),
        },
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error("[Health] Detailed health check failed:", error);

    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
      checks: {
        database: {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });
  }
});

/**
 * Prometheus metrics endpoint
 * Returns metrics in Prometheus format
 */
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const poolStats = getConnectionStats();
    const memoryUsage = process.memoryUsage();

    // Prometheus format metrics
    const metrics = [
      "# HELP shadowcheck_uptime_seconds Application uptime in seconds",
      "# TYPE shadowcheck_uptime_seconds gauge",
      `shadowcheck_uptime_seconds ${process.uptime()}`,
      "",
      "# HELP shadowcheck_memory_heap_used_bytes Heap memory used in bytes",
      "# TYPE shadowcheck_memory_heap_used_bytes gauge",
      `shadowcheck_memory_heap_used_bytes ${memoryUsage.heapUsed}`,
      "",
      "# HELP shadowcheck_memory_heap_total_bytes Total heap memory in bytes",
      "# TYPE shadowcheck_memory_heap_total_bytes gauge",
      `shadowcheck_memory_heap_total_bytes ${memoryUsage.heapTotal}`,
      "",
      "# HELP shadowcheck_db_pool_total Total database connections in pool",
      "# TYPE shadowcheck_db_pool_total gauge",
      `shadowcheck_db_pool_total ${poolStats.total}`,
      "",
      "# HELP shadowcheck_db_pool_idle Idle database connections",
      "# TYPE shadowcheck_db_pool_idle gauge",
      `shadowcheck_db_pool_idle ${poolStats.idle}`,
      "",
      "# HELP shadowcheck_db_pool_waiting Waiting database connection requests",
      "# TYPE shadowcheck_db_pool_waiting gauge",
      `shadowcheck_db_pool_waiting ${poolStats.waiting}`,
      "",
    ].join("\n");

    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.status(200).send(metrics);
  } catch (error) {
    console.error("[Health] Metrics endpoint failed:", error);
    res.status(500).send("# Error generating metrics\n");
  }
});

export default router;
