import { Router, Request, Response } from "express";
import { getPool, getConnectionStatus } from "../db/connection.js";
import { isSystemShuttingDown } from "../utils/shutdown.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const status = getConnectionStatus();
    if (!status.connected || status.reconnecting) {
      return res.status(503).json({ ok: false, status: status.reconnecting ? "reconnecting" : "disconnected" });
    }
    res.json({ ok: true, status: "ok", uptime: process.uptime() });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/ready", async (_req: Request, res: Response) => {
  if (isSystemShuttingDown()) {
    return res.status(503).json({ status: "not_ready" });
  }
  const status = getConnectionStatus();
  if (!status.connected || status.reconnecting) {
    return res.status(503).json({ status: "not_ready" });
  }
  res.json({ status: "ready" });
});

router.get("/detailed", async (_req: Request, res: Response) => {
  try {
    const status = getConnectionStatus();

    // Get connection pool stats
    const poolStats = status.pool || { total: 0, idle: 0, waiting: 0 };
    const active = poolStats.total - poolStats.idle;

    // Try to get PostGIS version if connected
    let postgisVersion = "N/A";
    if (status.connected) {
      try {
        const pool = getPool();
        const result = await pool.query('SELECT PostGIS_version() as version');
        postgisVersion = result.rows[0]?.version || "N/A";
      } catch (err) {
        console.error('Failed to get PostGIS version:', err);
      }
    }

    res.json({
      status: status.connected ? "ok" : "error",
      connected: status.connected,
      reconnecting: status.reconnecting,
      uptime: process.uptime(),
      database: {
        connected: status.connected,
        activeConnections: active,
        totalConnections: poolStats.total,
        idleConnections: poolStats.idle,
        waitingConnections: poolStats.waiting,
        postgisVersion: postgisVersion,
        postgisEnabled: postgisVersion !== "N/A"
      }
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/metrics", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.send("# ok\n");
});

export default router;
