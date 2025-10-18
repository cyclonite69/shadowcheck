/**
 * Graceful Shutdown Handler for ShadowCheck Backend
 *
 * Handles SIGTERM and SIGINT signals to ensure:
 * - Active HTTP connections complete
 * - Database connections close cleanly
 * - In-flight transactions finish
 * - Resources are released properly
 *
 * Critical for zero data loss during deployments and restarts
 */
import type { Server } from 'http';
interface ShutdownConfig {
    timeout: number;
    signals: NodeJS.Signals[];
}
/**
 * Register graceful shutdown handlers
 * @param httpServer Express HTTP server instance
 * @param config Optional shutdown configuration
 */
export declare function registerShutdownHandlers(httpServer: Server, config?: Partial<ShutdownConfig>): void;
/**
 * Check if system is currently shutting down
 */
export declare function isSystemShuttingDown(): boolean;
export {};
