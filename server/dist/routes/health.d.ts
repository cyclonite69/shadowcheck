/**
 * Health Check Endpoints for ShadowCheck Backend
 *
 * Provides multiple health check endpoints for different use cases:
 * - /health - Basic liveness check (is the process running?)
 * - /health/ready - Readiness check (can the service handle requests?)
 * - /health/detailed - Detailed health metrics with dependencies
 *
 * Used by:
 * - Docker health checks
 * - Kubernetes readiness/liveness probes
 * - Load balancers
 * - Monitoring systems (Prometheus)
 */
declare const router: import("express-serve-static-core").Router;
export default router;
