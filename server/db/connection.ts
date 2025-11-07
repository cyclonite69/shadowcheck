/**
 * ===========================================================================
 * SHADOWCHECK - RESILIENT DATABASE CONNECTION MODULE
 * ===========================================================================
 *
 * FEATURES:
 * - Exponential backoff with jitter for retry attempts
 * - Automatic reconnection on transient failures
 * - Connection pool management
 * - Health monitoring and metrics
 * - Graceful degradation
 * - Docker secrets support
 *
 * This module implements the Retry Pattern with Exponential Backoff to handle
 * transient connection failures during container startup and runtime.
 *
 * ===========================================================================
 */
import { Pool, PoolClient, PoolConfig } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// ===========================================================================
// INTERFACES
// ===========================================================================
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  poolMin?: number;
  poolMax?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  errors: number;
  lastConnectTime?: Date;
  lastDisconnectTime?: Date;
  lastError?: string;
}

// ===========================================================================
// DATABASE CONNECTION POOL
// ===========================================================================
export class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private retryConfig: RetryConfig;
  private metrics: ConnectionMetrics;
  private isShuttingDown: boolean = false;
  private isReconnecting: boolean = false;

  constructor() {
    this.config = buildDatabaseConfig();
    this.retryConfig = buildRetryConfig();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): ConnectionMetrics {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      totalQueries: 0,
      errors: 0,
    };
  }

  /**
   * Initialize connection pool with retry logic
   */
  async connect(): Promise<void> {
    console.log('='.repeat(70));
    console.log('SHADOWCHECK DATABASE CONNECTION');
    console.log('='.repeat(70));
    console.log(`Host: ${this.config.host}:${this.config.port}`);
    console.log(`Database: ${this.config.database}`);
    console.log(`User: ${this.config.user}`);
    console.log(`Pool: ${this.config.poolMin}-${this.config.poolMax} connections`);
    console.log('='.repeat(70));

    await retryWithBackoff(
      async () => {
        // Create pool configuration
        const poolConfig: PoolConfig = {
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          min: this.config.poolMin,
          max: this.config.poolMax,
          idleTimeoutMillis: this.config.idleTimeout,
          connectionTimeoutMillis: this.config.connectionTimeout,
          // Enable keepalive for long-lived connections
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
        };

        // Create new pool
        this.pool = new Pool(poolConfig);

        // Set up event handlers
        this.setupPoolEventHandlers();

        // Test connection
        const client = await this.pool.connect();
        try {
          const result = await client.query('SELECT NOW() as time, version() as version');
          console.log(`✓ [DB] Connected at: ${result.rows[0].time}`);
          console.log(`✓ [DB] PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);

          // Test PostGIS extension
          const postgisResult = await client.query('SELECT PostGIS_version() as version');
          console.log(`✓ [DB] PostGIS Version: ${postgisResult.rows[0].version}`);

          this.metrics.lastConnectTime = new Date();
          this.metrics.totalConnections++;
        } finally {
          client.release();
        }
      },
      'database connection',
      this.retryConfig
    );

    console.log('✓ [DB] Connection pool initialized successfully');
  }

  /**
   * Set up event handlers for connection pool monitoring
   */
  private setupPoolEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', () => {
      this.metrics.activeConnections++;
      console.log(`[DB Pool] Client connected (active: ${this.metrics.activeConnections})`);
    });

    this.pool.on('acquire', () => {
      console.log(`[DB Pool] Client acquired from pool`);
    });

    this.pool.on('remove', () => {
      this.metrics.activeConnections--;
      console.log(`[DB Pool] Client removed from pool (active: ${this.metrics.activeConnections})`);
    });

    this.pool.on('error', (err, client) => {
      this.metrics.errors++;
      this.metrics.lastError = err.message;
      console.error(`✗ [DB Pool] Unexpected error on idle client:`, err);

      // Attempt to reconnect on critical errors
      if (err.message.includes('Connection terminated') || err.message.includes('ECONNREFUSED')) {
        console.log('[DB Pool] Attempting to reconnect...');
        this.handleDisconnection();
      }
    });
  }

  /**
   * Handle unexpected disconnections
   */
  private async handleDisconnection(): Promise<void> {
    if (this.isShuttingDown || this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    this.metrics.lastDisconnectTime = new Date();
    console.warn('⚠ [DB] Connection lost, attempting to reconnect...');

    try {
      await this.disconnect();
      await sleep(5000); // Wait before reconnecting
      await this.connect();
      console.log('✓ [DB] Reconnection successful');
    } catch (error) {
      console.error('✗ [DB] Reconnection failed:', error);
      // Will retry on next error
    } finally {
      this.isReconnecting = false;
    }
  }

  /**
   * Execute a query with automatic retry
   */
  async query<T = any>(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call connect() first.');
    }

    this.metrics.totalQueries++;

    const result = await retryWithBackoff(
      async () => {
        const client = await this.pool!.connect();
        try {
          return await client.query(text, params);
        } finally {
          client.release();
        }
      },
      `query: ${text.substring(0, 50)}`,
      this.retryConfig
    );
    
    return result.rows;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    reconnecting: boolean;
    pool: { total: number; idle: number; waiting: number } | null;
  } {
    return {
      connected: this.pool !== null,
      reconnecting: this.isReconnecting,
      pool: this.pool
        ? {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount,
          }
        : null,
    };
  }

  /**
   * Gracefully disconnect
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    await this.disconnect();
  }
}

// ===========================================================================
// SINGLETON INSTANCE
// ===========================================================================
export const db = new DatabaseConnection();

// Export for testing
export type { RetryConfig, DatabaseConfig, ConnectionMetrics };

// ===========================================================================
// HELPER FUNCTIONS FOR HEALTH CHECKS
// ===========================================================================

/**
 * Get the underlying Pool instance
 * Used by health checks and monitoring
 */
export function getPool(): Pool {
  if (!db || !(db as any).pool) {
    throw new Error('Database pool not initialized. Call db.connect() first.');
  }
  return (db as any).pool;
}

/**
 * Get connection status (safe version)
 * Returns status without throwing
 */
export function getConnectionStatus(): {
  connected: boolean;
  reconnecting: boolean;
  pool: { total: number; idle: number; waiting: number } | null;
} {
  return (db as any).getStatus();
}

/**
 * Get connection pool statistics
 * Returns current pool state for monitoring
 */
export function getConnectionStats(): {
  total: number;
  idle: number;
  waiting: number;
} {
  try {
    const pool = getPool();
    return {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };
  } catch (error) {
    // Return zeros if pool not initialized
    return {
      total: 0,
      idle: 0,
      waiting: 0,
    };
  }
}

/**
 * Close the connection pool
 * Used by graceful shutdown handler
 */
export async function closePool(): Promise<void> {
  await db.shutdown();
}

/**
 * Execute a query
 */
export async function query<T = any>(text: string, params?: any[]): Promise<any> {
  return await db.query<T>(text, params);
}

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

/**
 * Load database configuration from environment and secrets
 */
function buildDatabaseConfig(): DatabaseConfig {
  const passwordFile = process.env.DB_PASSWORD_FILE;
  let password = process.env.DB_PASSWORD || '';

  if (passwordFile) {
    try {
      password = fs.readFileSync(passwordFile, 'utf-8').trim();
      console.log('✓ Loaded secret: db_password');
    } catch (err) {
      console.error('✗ Failed to load DB password from file:', err);
    }
  }

  // Check for DATABASE_URL (common convention)
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
      poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    };
  }

  return {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'shadowcheck',
    user: process.env.DB_USER || 'shadowcheck_user',
    password,
    poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  };
}

/**
 * Load retry configuration from environment
 */
function buildRetryConfig(): RetryConfig {
  return {
    maxAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
    initialDelayMs: parseInt(process.env.DB_RETRY_DELAY || '2000', 10),
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  config: RetryConfig
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(`[DB] Attempting ${label} (attempt ${attempt}/${config.maxAttempts})`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`[DB] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < config.maxAttempts) {
        const delayMs = Math.min(
          config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1) +
            Math.random() * 1000,
          config.maxDelayMs
        );
        console.log(`[DB] Retrying in ${Math.round(delayMs)}ms...`);
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error(`Failed to ${label} after ${config.maxAttempts} attempts`);
}