import pg from "pg";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const { Pool } = pg;

const sslRequired =
  process.env.PGSSLMODE === "require" || /true|1|yes/i.test(process.env.PGSSL ?? "");

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });

// Retry on transient connection issues (Neon autosuspend/resume, etc.)
const RETRY_CODES = new Set([
  "57P01",  // admin_shutdown
  "53300",  // too_many_connections
  "08006",  // connection_failure
  "08003",  // connection_does_not_exist
  "08000",  // connection_exception
]);
const RETRY_MESSAGES = ["ETIMEDOUT", "ECONNRESET"];

export async function query<T = any>(text: string, params?: any[], tries = 2): Promise<pg.QueryResult<T>> {
  for (let attempt = 1; ; attempt++) {
    const client = await pool.connect();
    try {
      return await client.query<T>(text, params);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const msg = String(err?.message || "");
      const transient = (code && RETRY_CODES.has(code)) || RETRY_MESSAGES.some(k => msg.includes(k));
      if (transient && attempt < tries) {
        await new Promise(r => setTimeout(r, 250 * attempt));
        continue;
      }
      throw err;
    } finally {
      client.release();
    }
  }
}

// Drizzle database instance
export const db = connectionString
  ? drizzle(postgres(connectionString, { ssl: sslRequired ? { rejectUnauthorized: false } : undefined }))
  : null;
