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
import { closePool } from '../db/connection';

interface ShutdownConfig {
  timeout: number; // Maximum time to wait for graceful shutdown (ms)
  signals: NodeJS.Signals[];
}

const DEFAULT_CONFIG: ShutdownConfig = {
  timeout: 10000, // 10 seconds
  signals: ['SIGTERM', 'SIGINT'],
};

let isShuttingDown = false;

/**
 * Register graceful shutdown handlers
 * @param httpServer Express HTTP server instance
 * @param config Optional shutdown configuration
 */
export function registerShutdownHandlers(
  httpServer: Server,
  config: Partial<ShutdownConfig> = {}
): void {
  const finalConfig: ShutdownConfig = { ...DEFAULT_CONFIG, ...config };

  finalConfig.signals.forEach((signal) => {
    process.on(signal, async () => {
      if (isShuttingDown) {
        console.warn(`[Shutdown] Received ${signal} during shutdown - forcing exit`);
        process.exit(1);
      }

      isShuttingDown = true;
      console.log(`[Shutdown] ${signal} signal received - starting graceful shutdown`);

      // Set timeout to force exit if graceful shutdown hangs
      const forceExitTimer = setTimeout(() => {
        console.error(
          `[Shutdown] Graceful shutdown timeout (${finalConfig.timeout}ms) - forcing exit`
        );
        process.exit(1);
      }, finalConfig.timeout);

      try {
        // Step 1: Stop accepting new connections
        console.log('[Shutdown] Stopping HTTP server (no new connections accepted)');
        await new Promise<void>((resolve, reject) => {
          httpServer.close((err) => {
            if (err) {
              console.error('[Shutdown] Error closing HTTP server:', err);
              reject(err);
            } else {
              console.log('[Shutdown] HTTP server closed successfully');
              resolve();
            }
          });
        });

        // Step 2: Close database connections
        console.log('[Shutdown] Closing database connection pool');
        await closePool();
        console.log('[Shutdown] Database connections closed successfully');

        // Step 3: Cleanup complete
        clearTimeout(forceExitTimer);
        console.log('[Shutdown] Graceful shutdown completed successfully');
        process.exit(0);
      } catch (error) {
        clearTimeout(forceExitTimer);
        console.error('[Shutdown] Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('[Fatal] Uncaught exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('[Fatal] Unhandled promise rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

/**
 * Check if system is currently shutting down
 */
export function isSystemShuttingDown(): boolean {
  return isShuttingDown;
}
