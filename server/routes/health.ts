import { Router } from "express";
import { query } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const now = await query<{ now: string }>("SELECT now()");
    const who = await query<{ current_user: string }>("SELECT current_user");
    const db  = await query<{ current_database: string }>("SELECT current_database()");
    res.json({
      ok: true,
      time: now.rows[0]?.now,
      user: who.rows[0]?.current_user,
      database: db.rows[0]?.current_database,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

export default router;
