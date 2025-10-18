import pg from "pg";
import postgres from "postgres";
export declare const pool: pg.Pool;
export declare function query<T extends pg.QueryResultRow = any>(text: string, params?: any[], tries?: number): Promise<pg.QueryResult<T>>;
export declare const db: (import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>> & {
    $client: postgres.Sql<{}>;
}) | null;
