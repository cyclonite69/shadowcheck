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
import { Pool, PoolClient } from 'pg';
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
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitterEnabled: boolean;
}
interface ConnectionMetrics {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingClients: number;
    totalQueries: number;
    errors: number;
    lastError?: string;
    lastConnectTime?: Date;
    lastDisconnectTime?: Date;
}
export declare class DatabaseConnection {
    private pool;
    private config;
    private retryConfig;
    private metrics;
    private isShuttingDown;
    constructor();
    private initializeMetrics;
    /**
     * Initialize connection pool with retry logic
     */
    connect(): Promise<void>;
    /**
     * Set up event handlers for connection pool monitoring
     */
    private setupPoolEventHandlers;
    /**
     * Handle unexpected disconnections
     */
    private handleDisconnection;
    /**
     * Execute a query with automatic retry
     */
    query<T = any>(text: string, params?: any[]): Promise<T>;
    /**
     * Get a client from the pool for transactions
     */
    getClient(): Promise<PoolClient>;
    /**
     * Get current connection metrics
     */
    getMetrics(): ConnectionMetrics;
    /**
     * Health check for monitoring
     */
    healthCheck(): Promise<{
        healthy: boolean;
        message: string;
        latency?: number;
    }>;
    /**
     * Graceful shutdown - close all connections
     */
    disconnect(): Promise<void>;
}
export declare const db: DatabaseConnection;
export type { RetryConfig, DatabaseConfig, ConnectionMetrics };
/**
 * Get the underlying Pool instance
 * Used by health checks and monitoring
 */
export declare function getPool(): Pool;
/**
 * Get connection pool statistics
 * Returns current pool state for monitoring
 */
export declare function getConnectionStats(): {
    total: number;
    idle: number;
    waiting: number;
};
/**
 * Close the connection pool
 * Used by graceful shutdown handler
 */
export declare function closePool(): Promise<void>;
