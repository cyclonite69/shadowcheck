import { Router } from "express";
import { query } from "../db";

const router = Router();

/**
 * GET /api/v1/networks_v2?limit=100&before_time_ms=...
 * Uses app.location_details_enriched_v2
 */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
  const before = Number(req.query.before_time_ms);
  const hasBefore = Number.isFinite(before);

  const where = hasBefore ? "WHERE d.time < $1" : "";
  const limPos = hasBefore ? 2 : 1;

  const sql = `
    SELECT *
    FROM app.location_details_enriched_v2 d
    ${where}
    ORDER BY d.time DESC
    LIMIT $${limPos}
  `;

  try {
    const params: any[] = hasBefore ? [before, limit] : [limit];
    const { rows } = await query(sql, params);
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
