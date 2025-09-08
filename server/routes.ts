import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import helmet from "helmet";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false
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
    } catch (error) {
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
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const networks = await storage.getNetworks(limit);
      
      res.json({
        ok: true,
        data: networks,
        count: networks.length,
        limit
      });
    } catch (error) {
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

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lon as string);
    const radiusMeters = parseFloat(radius as string);
    const maxResults = Math.min(parseInt(limit as string) || 50, 100);

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
    } catch (error) {
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
    } catch (error) {
      console.error("Error generating visualization data:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to generate visualization data"
      });
    }
  });

  const httpServer = createServer(app);

  // G63 Forensics API endpoints
  app.get("/api/v1/g63/networks", async (req, res) => {
    const isConnected = await storage.isDatabaseConnected();
    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected. Resource-constrained environment detected.",
        code: "DB_NOT_CONNECTED"
      });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const networks = await storage.getG63Networks(limit);
      
      res.json({
        ok: true,
        data: networks,
        count: networks.length
      });
    } catch (error) {
      console.error("Error fetching G63 networks:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to fetch forensics network data"
      });
    }
  });

  app.get("/api/v1/g63/networks/within", async (req, res) => {
    const isConnected = await storage.isDatabaseConnected();
    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected. Spatial queries unavailable in resource-constrained environment.",
        code: "DB_NOT_CONNECTED"
      });
    }

    try {
      const { lat, lon, radius, limit } = req.query;
      
      if (!lat || !lon || !radius) {
        return res.status(400).json({
          ok: false,
          error: "Missing required parameters: lat, lon, radius"
        });
      }

      const networks = await storage.getG63NetworksWithin(
        parseFloat(lat as string),
        parseFloat(lon as string),
        parseFloat(radius as string),
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        ok: true,
        data: networks,
        count: networks.length
      });
    } catch (error) {
      console.error("Error in spatial G63 query:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to execute spatial forensics query"
      });
    }
  });

  app.get("/api/v1/g63/locations", async (req, res) => {
    const isConnected = await storage.isDatabaseConnected();
    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected. Resource-constrained environment detected.",
        code: "DB_NOT_CONNECTED"
      });
    }

    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const locations = await storage.getG63Locations(limit);
      
      res.json({
        ok: true,
        data: locations,
        count: locations.length
      });
    } catch (error) {
      console.error("Error fetching G63 locations:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to fetch forensics location data"
      });
    }
  });

  app.get("/api/v1/g63/locations/:bssid", async (req, res) => {
    const isConnected = await storage.isDatabaseConnected();
    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected. Resource-constrained environment detected.",
        code: "DB_NOT_CONNECTED"
      });
    }

    try {
      const { bssid } = req.params;
      const locations = await storage.getG63LocationsByBssid(bssid);
      
      res.json({
        ok: true,
        data: locations,
        count: locations.length
      });
    } catch (error) {
      console.error("Error fetching G63 locations by BSSID:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to fetch forensics location data by BSSID"
      });
    }
  });

  // G63 Forensics visualization endpoint
  app.get("/api/v1/g63/visualize", async (req, res) => {
    const isConnected = await storage.isDatabaseConnected();
    if (!isConnected) {
      return res.status(501).json({
        ok: false,
        error: "Database not connected. Forensics visualization unavailable in resource-constrained environment.",
        code: "DB_NOT_CONNECTED"
      });
    }

    try {
      const networks = await storage.getG63Networks(1000);
      
      // Format G63 forensics data for Mapbox visualization
      const geojson = {
        type: "FeatureCollection",
        features: networks
          .filter(n => n.lastlat && n.lastlon)
          .map(network => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [network.lastlon, network.lastlat]
            },
            properties: {
              bssid: network.bssid,
              ssid: network.ssid,
              frequency: network.frequency,
              capabilities: network.capabilities,
              signal_strength: network.bestlevel,
              lasttime: new Date(Number(network.lasttime)).toISOString(),
              type: network.type
            }
          }))
      };

      res.json({
        ok: true,
        data: geojson,
        count: geojson.features.length
      });
    } catch (error) {
      console.error("Error generating G63 visualization data:", error);
      res.status(500).json({
        ok: false,
        error: "Failed to generate forensics visualization data"
      });
    }
  });

  // G63 Analytics endpoints
  app.get("/api/v1/g63/analytics", async (req, res) => {
    try {
      const analytics = await storage.getG63NetworkAnalytics();
      res.json({ ok: true, data: analytics });
    } catch (error) {
      console.error("Error fetching G63 analytics:", error);
      res.status(500).json({ error: "Failed to fetch G63 analytics" });
    }
  });

  app.get("/api/v1/g63/signal-strength", async (req, res) => {
    try {
      const distribution = await storage.getG63SignalStrengthDistribution();
      res.json({ ok: true, data: distribution });
    } catch (error) {
      console.error("Error fetching G63 signal strength distribution:", error);
      res.status(500).json({ error: "Failed to fetch G63 signal strength distribution" });
    }
  });

  app.get("/api/v1/g63/security-analysis", async (req, res) => {
    try {
      const securityAnalysis = await storage.getG63SecurityAnalysis();
      res.json({ ok: true, data: securityAnalysis });
    } catch (error) {
      console.error("Error fetching G63 security analysis:", error);
      res.status(500).json({ error: "Failed to fetch G63 security analysis" });
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
