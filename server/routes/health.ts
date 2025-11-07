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

router.get("/detailed", (_req: Request, res: Response) => {
  const status = getConnectionStatus();
  res.json({
    status: status.connected ? "ok" : "error",
    connected: status.connected,
    reconnecting: status.reconnecting,
    uptime: process.uptime(),
  });
});

router.get("/metrics", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/plain");
  res.send("# ok\n");
});

export default router;
