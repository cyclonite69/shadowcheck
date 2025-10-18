import { createServer } from "http";
import { storage } from "./storage";
import helmet from "helmet";
import cors from "cors";
export async function registerRoutes(app) {
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: false, // Disable for development
    }));
    app.use(cors({
        origin: true,
        credentials: true
    }));
    // Health endpoint - always available
    app.get("/api/v1/health", async (req, res) => {
        res.json({
            ok: true,
            service: "shadowcheck",
            ts: new Date().toISOString()
        });
    });
    // Version endpoint - always available
    app.get("/api/v1/version", async (req, res) => {
        res.json({
            name: "shadowcheck",
            version: "1.0.0",
            description: "SIGINT Forensics API with PostGIS spatial capabilities"
        });
    });
    // Config endpoint - provides frontend configuration
    app.get("/api/v1/config", async (req, res) => {
        res.json({
            ok: true,
            mapboxToken: process.env.MAPBOX_TOKEN || null
        });
    });
    // System status endpoint
    app.get("/api/v1/status", async (req, res) => {
        try {
            const isConnected = await storage.isDatabaseConnected();
            const connectionInfo = await storage.getConnectionInfo();
            res.json({
                ok: true,
                database: {
                    connected: isConnected,
                    activeConnections: connectionInfo.activeConnections,
                    maxConnections: connectionInfo.maxConnections,
                    postgisEnabled: connectionInfo.postgisEnabled
                },
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                },
                uptime: Math.round(process.uptime())
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to get system status"
            });
        }
    });
    // Networks endpoint - requires database
    app.get("/api/v1/networks", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Please restore your PostgreSQL backup.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const limit = Math.min(parseInt(req.query.limit) || 50, 100);
            const networks = await storage.getNetworks(limit);
            res.json({
                ok: true,
                data: networks,
                count: networks.length,
                limit
            });
        }
        catch (error) {
            console.error("Error fetching networks:", error);
            res.status(500).json({
                ok: false,
                error: "Failed to fetch network observations"
            });
        }
    });
    // Spatial query endpoint - requires database with PostGIS
    app.get("/api/v1/within", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Please restore your PostgreSQL backup with PostGIS extension.",
                code: "DB_NOT_CONNECTED"
            });
        }
        const { lat, lon, radius, limit } = req.query;
        // Validate required parameters
        if (!lat || !lon || !radius) {
            return res.status(400).json({
                ok: false,
                error: "Missing required parameters: lat, lon, radius"
            });
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const radiusMeters = parseFloat(radius);
        const maxResults = Math.min(parseInt(limit) || 50, 100);
        // Validate parameter ranges
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            return res.status(400).json({
                ok: false,
                error: "Invalid latitude. Must be between -90 and 90."
            });
        }
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                ok: false,
                error: "Invalid longitude. Must be between -180 and 180."
            });
        }
        if (isNaN(radiusMeters) || radiusMeters <= 0 || radiusMeters > 50000) {
            return res.status(400).json({
                ok: false,
                error: "Invalid radius. Must be between 1 and 50000 meters."
            });
        }
        try {
            const networks = await storage.getNetworksWithin(latitude, longitude, radiusMeters, maxResults);
            res.json({
                ok: true,
                data: networks,
                count: networks.length,
                query: {
                    latitude,
                    longitude,
                    radius: radiusMeters,
                    limit: maxResults
                }
            });
        }
        catch (error) {
            console.error("Error executing spatial query:", error);
            res.status(500).json({
                ok: false,
                error: "Failed to execute spatial query. Ensure PostGIS extension is installed."
            });
        }
    });
    // Visualization endpoint - requires database
    app.get("/api/v1/visualize", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Please restore your PostgreSQL backup for visualization.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const networks = await storage.getNetworks(1000);
            // Format for Mapbox visualization
            const geojson = {
                type: "FeatureCollection",
                features: networks
                    .filter(n => n.latitude && n.longitude)
                    .map(network => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [parseFloat(network.longitude || "0"), parseFloat(network.latitude || "0")]
                    },
                    properties: {
                        id: network.id,
                        ssid: network.ssid,
                        bssid: network.bssid,
                        signal_strength: network.signal_strength,
                        encryption: network.encryption,
                        observed_at: network.observed_at
                    }
                }))
            };
            res.json({
                ok: true,
                data: geojson,
                count: geojson.features.length
            });
        }
        catch (error) {
            console.error("Error generating visualization data:", error);
            res.status(500).json({
                ok: false,
                error: "Failed to generate visualization data"
            });
        }
    });
    const httpServer = createServer(app);
    // Analytics API endpoints
    app.get("/api/v1/analytics", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Resource-constrained environment detected.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const analytics = await storage.getNetworkAnalytics();
            res.json(analytics);
        }
        catch (error) {
            console.error("Error fetching analytics:", error);
            res.status(500).json({ error: "Failed to fetch analytics" });
        }
    });
    app.get("/api/v1/signal-strength", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Analytics unavailable in resource-constrained environment.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const distribution = await storage.getSignalStrengthDistribution();
            res.json(distribution);
        }
        catch (error) {
            console.error("Error fetching signal strength distribution:", error);
            res.status(500).json({ error: "Failed to fetch signal strength distribution" });
        }
    });
    app.get("/api/v1/security-analysis", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Analytics unavailable in resource-constrained environment.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const securityAnalysis = await storage.getSecurityAnalysis();
            res.json(securityAnalysis);
        }
        catch (error) {
            console.error("Error fetching security analysis:", error);
            res.status(500).json({ error: "Failed to fetch security analysis" });
        }
    });
    app.get("/api/v1/radio-stats", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Analytics unavailable in resource-constrained environment.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const radioStats = await storage.getRadioStats();
            res.json(radioStats);
        }
        catch (error) {
            console.error("Error fetching radio stats:", error);
            res.status(500).json({ error: "Failed to fetch radio stats" });
        }
    });
    app.get("/api/v1/timeline", async (req, res) => {
        const isConnected = await storage.isDatabaseConnected();
        if (!isConnected) {
            return res.status(501).json({
                ok: false,
                error: "Database not connected. Analytics unavailable in resource-constrained environment.",
                code: "DB_NOT_CONNECTED"
            });
        }
        try {
            const timeline = await storage.getTimelineData();
            res.json(timeline);
        }
        catch (error) {
            console.error("Error fetching timeline data:", error);
            res.status(500).json({ error: "Failed to fetch timeline data" });
        }
    });
    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received, shutting down gracefully');
        httpServer.close(() => {
            process.exit(0);
        });
    });
    return httpServer;
}
