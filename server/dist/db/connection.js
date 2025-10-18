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
import { Pool } from 'pg';
import * as fs from 'fs';
// ===========================================================================
// CONFIGURATION
// ===========================================================================
/**
 * Load sensitive credentials from Docker secrets
 */
function loadSecret(secretName) {
    const secretPath = `/run/secrets/${secretName}`;
    try {
        if (fs.existsSync(secretPath)) {
            const secret = fs.readFileSync(secretPath, 'utf8').trim();
            console.log(`✓ Loaded secret: ${secretName}`);
            return secret;
        }
    }
    catch (error) {
        console.warn(`⚠ Could not read secret from ${secretPath}: ${error}`);
    }
    // Fallback to environment variable (for development)
    const envVar = process.env[secretName.toUpperCase().replace('-', '_')];
    if (envVar) {
        console.log(`✓ Using environment variable for: ${secretName}`);
        return envVar;
    }
    throw new Error(`Secret not found: ${secretName}`);
}
/**
 * Build database configuration from environment and secrets
 */
function buildDatabaseConfig() {
    // In development, use DATABASE_URL if available (simpler setup)
    if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
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
    // Production: Use Docker secrets and environment variables
    return {
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'shadowcheck',
        user: process.env.DB_USER || 'shadowcheck_user',
        password: loadSecret('db_password'),
        poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    };
}
/**
 * Build retry configuration from environment
 */
function buildRetryConfig() {
    return {
        maxAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
        initialDelay: parseInt(process.env.DB_RETRY_DELAY || '2000', 10),
        maxDelay: parseInt(process.env.DB_RETRY_MAX_DELAY || '30000', 10),
        backoffMultiplier: parseFloat(process.env.DB_RETRY_BACKOFF_MULTIPLIER || '2.0'),
        jitterEnabled: process.env.DB_RETRY_JITTER !== 'false',
    };
}
// ===========================================================================
// RETRY LOGIC - EXPONENTIAL BACKOFF WITH JITTER
// ===========================================================================
/**
 * Calculate delay for exponential backoff with optional jitter
 *
 * Jitter prevents thundering herd problem when multiple containers
 * retry simultaneously after a backend failure.
 */
function calculateBackoffDelay(attempt, config) {
    const baseDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(baseDelay, config.maxDelay);
    if (!config.jitterEnabled) {
        return cappedDelay;
    }
    // Add random jitter (0-25% of delay)
    const jitter = Math.random() * 0.25 * cappedDelay;
    return Math.floor(cappedDelay + jitter);
}
/**
 * Sleep utility with promise
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry a database operation with exponential backoff
 */
async function retryWithBackoff(operation, operationName, retryConfig) {
    let lastError;
    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
        try {
            console.log(`[DB] Attempting ${operationName} (attempt ${attempt}/${retryConfig.maxAttempts})`);
            const result = await operation();
            if (attempt > 1) {
                console.log(`✓ [DB] ${operationName} succeeded after ${attempt} attempts`);
            }
            return result;
        }
        catch (error) {
            lastError = error;
            if (attempt < retryConfig.maxAttempts) {
                const delay = calculateBackoffDelay(attempt, retryConfig);
                console.warn(`⚠ [DB] ${operationName} failed (attempt ${attempt}/${retryConfig.maxAttempts}): ${lastError.message}`);
                console.log(`   Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }
    console.error(`✗ [DB] ${operationName} failed after ${retryConfig.maxAttempts} attempts`);
    throw new Error(`${operationName} failed after ${retryConfig.maxAttempts} attempts: ${lastError?.message}`);
}
// ===========================================================================
// DATABASE CONNECTION POOL
// ===========================================================================
export class DatabaseConnection {
    pool = null;
    config;
    retryConfig;
    metrics;
    isShuttingDown = false;
    constructor() {
        this.config = buildDatabaseConfig();
        this.retryConfig = buildRetryConfig();
        this.metrics = this.initializeMetrics();
    }
    initializeMetrics() {
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
    async connect() {
        console.log('='.repeat(70));
        console.log('SHADOWCHECK DATABASE CONNECTION');
        console.log('='.repeat(70));
        console.log(`Host: ${this.config.host}:${this.config.port}`);
        console.log(`Database: ${this.config.database}`);
        console.log(`User: ${this.config.user}`);
        console.log(`Pool: ${this.config.poolMin}-${this.config.poolMax} connections`);
        console.log('='.repeat(70));
        await retryWithBackoff(async () => {
            // Create pool configuration
            const poolConfig = {
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
            }
            finally {
                client.release();
            }
        }, 'database connection', this.retryConfig);
        console.log('✓ [DB] Connection pool initialized successfully');
    }
    /**
     * Set up event handlers for connection pool monitoring
     */
    setupPoolEventHandlers() {
        if (!this.pool)
            return;
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
    async handleDisconnection() {
        if (this.isShuttingDown) {
            return;
        }
        this.metrics.lastDisconnectTime = new Date();
        console.warn('⚠ [DB] Connection lost, attempting to reconnect...');
        try {
            await this.disconnect();
            await sleep(5000); // Wait before reconnecting
            await this.connect();
            console.log('✓ [DB] Reconnection successful');
        }
        catch (error) {
            console.error('✗ [DB] Reconnection failed:', error);
            // In production, you might want to trigger an alert here
        }
    }
    /**
     * Execute a query with automatic retry
     */
    async query(text, params) {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call connect() first.');
        }
        this.metrics.totalQueries++;
        return await retryWithBackoff(async () => {
            const result = await this.pool.query(text, params);
            return result.rows;
        }, 'query execution', {
            ...this.retryConfig,
            maxAttempts: 3, // Fewer retries for individual queries
        });
    }
    /**
     * Get a client from the pool for transactions
     */
    async getClient() {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call connect() first.');
        }
        return await this.pool.connect();
    }
    /**
     * Get current connection metrics
     */
    getMetrics() {
        if (this.pool) {
            this.metrics.totalConnections = this.pool.totalCount;
            this.metrics.activeConnections = this.pool.totalCount - this.pool.idleCount;
            this.metrics.idleConnections = this.pool.idleCount;
            this.metrics.waitingClients = this.pool.waitingCount;
        }
        return { ...this.metrics };
    }
    /**
     * Health check for monitoring
     */
    async healthCheck() {
        if (!this.pool) {
            return { healthy: false, message: 'Database pool not initialized' };
        }
        try {
            const startTime = Date.now();
            await this.pool.query('SELECT 1');
            const latency = Date.now() - startTime;
            return {
                healthy: true,
                message: 'Database connection healthy',
                latency,
            };
        }
        catch (error) {
            return {
                healthy: false,
                message: `Database health check failed: ${error.message}`,
            };
        }
    }
    /**
     * Graceful shutdown - close all connections
     */
    async disconnect() {
        if (this.isShuttingDown) {
            console.log('[DB] Shutdown already in progress...');
            return;
        }
        this.isShuttingDown = true;
        console.log('[DB] Initiating graceful shutdown...');
        if (this.pool) {
            try {
                // Wait for active queries to complete (with timeout)
                const shutdownTimeout = 10000; // 10 seconds
                const shutdownPromise = this.pool.end();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), shutdownTimeout));
                await Promise.race([shutdownPromise, timeoutPromise]);
                console.log('✓ [DB] Connection pool closed gracefully');
                this.pool = null;
            }
            catch (error) {
                console.error('✗ [DB] Error during shutdown:', error);
                throw error;
            }
        }
    }
}
// ===========================================================================
// SINGLETON EXPORT
// ===========================================================================
// Export singleton instance
export const db = new DatabaseConnection();
// ===========================================================================
// HELPER FUNCTIONS FOR HEALTH CHECKS
// ===========================================================================
/**
 * Get the underlying Pool instance
 * Used by health checks and monitoring
 */
export function getPool() {
    if (!db || !db.pool) {
        throw new Error('Database pool not initialized. Call db.connect() first.');
    }
    return db.pool;
}
/**
 * Get connection pool statistics
 * Returns current pool state for monitoring
 */
export function getConnectionStats() {
    try {
        const pool = getPool();
        return {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount,
        };
    }
    catch (error) {
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
export async function closePool() {
    await db.disconnect();
}
