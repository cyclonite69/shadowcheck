import { users, networks } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
let db = null;
// Import db conditionally to handle cases where DATABASE_URL is not set
async function getDb() {
    if (!db && process.env.DATABASE_URL) {
        try {
            const dbModule = await import("./db");
            const dbInstance = dbModule.db;
            db = dbInstance;
        }
        catch (error) {
            console.error("Failed to initialize database:", error);
            db = null;
        }
    }
    return db;
}
export class DatabaseStorage {
    async isDatabaseConnected() {
        const dbInstance = await getDb();
        return dbInstance !== null;
    }
    async getConnectionInfo() {
        const dbInstance = await getDb();
        if (!dbInstance) {
            return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
        }
        try {
            // Check for active connections and PostGIS
            const connectionResult = await dbInstance.execute(sql `
        SELECT COUNT(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
            let postgisEnabled = false;
            try {
                const postgisResult = await dbInstance.execute(sql `
          SELECT EXISTS(
            SELECT 1 FROM pg_extension WHERE extname = 'postgis'
          ) as postgis_enabled
        `);
                postgisEnabled = postgisResult[0]?.postgis_enabled || false;
            }
            catch (error) {
                // PostGIS extension might not be available
                postgisEnabled = false;
            }
            return {
                activeConnections: parseInt(connectionResult[0]?.active_connections) || 0,
                maxConnections: 5,
                postgisEnabled: postgisEnabled
            };
        }
        catch (error) {
            console.error("Error getting connection info:", error);
            return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
        }
    }
    async getUser(id) {
        const dbInstance = await getDb();
        if (!dbInstance)
            return undefined;
        try {
            const [user] = await dbInstance.select().from(users).where(eq(users.id, id));
            return user || undefined;
        }
        catch (error) {
            console.error("Error getting user:", error);
            return undefined;
        }
    }
    async getUserByUsername(username) {
        const dbInstance = await getDb();
        if (!dbInstance)
            return undefined;
        try {
            const [user] = await dbInstance.select().from(users).where(eq(users.username, username));
            return user || undefined;
        }
        catch (error) {
            console.error("Error getting user by username:", error);
            return undefined;
        }
    }
    async createUser(insertUser) {
        const dbInstance = await getDb();
        if (!dbInstance)
            throw new Error("Database not connected");
        const [user] = await dbInstance
            .insert(users)
            .values(insertUser)
            .returning();
        return user;
    }
    async getNetworks(limit = 50) {
        const dbInstance = await getDb();
        if (!dbInstance)
            return [];
        try {
            const result = await dbInstance
                .select()
                .from(networks)
                .orderBy(sql `${networks.observed_at} DESC`)
                .limit(limit);
            return result;
        }
        catch (error) {
            console.error("Error getting networks:", error);
            return [];
        }
    }
    async getNetworksWithin(lat, lon, radius, limit = 50) {
        const dbInstance = await getDb();
        if (!dbInstance)
            return [];
        try {
            // Use PostGIS ST_DWithin for spatial query
            const result = await dbInstance.execute(sql `
        SELECT * FROM ${networks}
        WHERE ST_DWithin(
          ${networks.geom}::geometry,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geometry,
          ${radius}
        )
        ORDER BY ${networks.observed_at} DESC
        LIMIT ${limit}
      `);
            return result;
        }
        catch (error) {
            console.error("Error getting networks within radius:", error);
            return [];
        }
    }
    async createNetwork(network) {
        const dbInstance = await getDb();
        if (!dbInstance)
            throw new Error("Database not connected");
        const [createdNetwork] = await dbInstance
            .insert(networks)
            .values(network)
            .returning();
        return createdNetwork;
    }
    // Analytics methods
    async getNetworkAnalytics() {
        const dbInstance = await getDb();
        if (!dbInstance) {
            return {
                success: false,
                message: "Database not connected",
                data: { overview: {} }
            };
        }
        try {
            // Get analytics from app.locations_legacy
            const result = await dbInstance.execute(sql `
        SELECT
          COUNT(*) as total_observations,
          COUNT(DISTINCT l.bssid) as distinct_networks,
          ROUND(AVG(l.level)::numeric, 2) as avg_signal_strength
        FROM app.locations_legacy l
      `);
            const overview = result[0] || {};
            return {
                success: true,
                data: { overview }
            };
        }
        catch (error) {
            console.error("Error getting network analytics:", error);
            return {
                success: false,
                message: "Failed to get network analytics",
                data: { overview: {} }
            };
        }
    }
    async getSignalStrengthDistribution() {
        try {
            const dbInstance = await getDb();
            if (!dbInstance) {
                return { ok: true, data: [] };
            }
            // Query signal strength distribution from app.locations_legacy
            const result = await dbInstance.execute(sql `
        SELECT
          CASE
            WHEN level >= -30 THEN 'Excellent (-30 to 0 dBm)'
            WHEN level >= -50 THEN 'Good (-50 to -30 dBm)'
            WHEN level >= -60 THEN 'Fair (-60 to -50 dBm)'
            WHEN level >= -70 THEN 'Weak (-70 to -60 dBm)'
            ELSE 'Very Weak (< -70 dBm)'
          END as signal_range,
          COUNT(*) as count,
          ROUND(AVG(level)::numeric, 2) as avg_signal_in_range
        FROM app.locations_legacy
        WHERE level IS NOT NULL
        GROUP BY signal_range
        ORDER BY count DESC
      `);
            return {
                ok: true,
                data: result
            };
        }
        catch (error) {
            console.error("Error getting signal strength distribution:", error);
            return { ok: true, data: [] };
        }
    }
    async getSecurityAnalysis() {
        try {
            const dbInstance = await getDb();
            if (!dbInstance) {
                return { ok: true, data: [] };
            }
            // Query security analysis from app.network using app.locations_legacy
            const result = await dbInstance.execute(sql `
        WITH security_counts AS (
          SELECT
            COALESCE(n.capabilities, '[ESS]') as security,
            COUNT(DISTINCT l.bssid) as unique_devices,
            COUNT(*) as network_count
          FROM app.locations_legacy l
          JOIN app.network n ON l.bssid = n.bssid
          GROUP BY security
        ),
        total AS (
          SELECT SUM(network_count) as total_count FROM security_counts
        )
        SELECT
          sc.security,
          sc.network_count,
          sc.unique_devices,
          ROUND((sc.network_count::numeric / t.total_count * 100), 2) as percentage,
          CASE
            WHEN sc.security LIKE '%WPA3%' THEN 'High Security'
            WHEN sc.security LIKE '%WPA2%' THEN 'Medium Security'
            WHEN sc.security LIKE '%WPA%' THEN 'Medium Security'
            WHEN sc.security LIKE '%WEP%' THEN 'Low Security'
            WHEN sc.security = '[ESS]' OR sc.security = '' THEN 'Open Network'
            ELSE 'Unknown Security'
          END as security_level
        FROM security_counts sc
        CROSS JOIN total t
        ORDER BY sc.network_count DESC
      `);
            return {
                ok: true,
                data: result
            };
        }
        catch (error) {
            console.error("Error getting security analysis:", error);
            return { ok: true, data: [] };
        }
    }
    async getRadioStats() {
        try {
            const dbInstance = await getDb();
            if (!dbInstance) {
                return { ok: true, data: [] };
            }
            // Query using app.locations_legacy as source of truth
            const result = await dbInstance.execute(sql `
        SELECT
          n.type as radio_type,
          COUNT(DISTINCT l.bssid) as distinct_networks,
          COUNT(*) as total_observations
        FROM app.locations_legacy l
        JOIN app.network n ON l.bssid = n.bssid
        GROUP BY n.type
        ORDER BY total_observations DESC
      `);
            return {
                ok: true,
                data: result
            };
        }
        catch (error) {
            console.error("Error getting radio stats:", error);
            return { ok: true, data: [] };
        }
    }
    async getTimelineData() {
        try {
            const dbInstance = await getDb();
            if (!dbInstance) {
                return { ok: true, data: [] };
            }
            // Get network detections over the last 24 hours grouped by hour using app.locations_legacy
            const result = await dbInstance.execute(sql `
        SELECT
          DATE_TRUNC('hour', TO_TIMESTAMP(l.time / 1000)) as hour,
          n.type as radio_type,
          COUNT(*) as detection_count
        FROM app.locations_legacy l
        JOIN app.network n ON l.bssid = n.bssid
        WHERE l.time >= EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours') * 1000
        GROUP BY hour, n.type
        ORDER BY hour ASC
      `);
            return {
                ok: true,
                data: result
            };
        }
        catch (error) {
            console.error("Error getting timeline data:", error);
            return { ok: true, data: [] };
        }
    }
}
// Use in-memory storage as fallback
export class MemStorage {
    users;
    constructor() {
        this.users = new Map();
    }
    async isDatabaseConnected() {
        return false;
    }
    async getConnectionInfo() {
        return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
    }
    async createUser(insertUser) {
        const id = crypto.randomUUID();
        const user = { ...insertUser, id };
        this.users.set(id, user);
        return user;
    }
    async getNetworks(limit) {
        return [];
    }
    async getNetworksWithin(lat, lon, radius, limit) {
        return [];
    }
    async createNetwork(network) {
        throw new Error("Database not connected");
    }
    // Analytics methods - fallback
    async getNetworkAnalytics() {
        return { ok: true, data: { overview: {} } };
    }
    async getSignalStrengthDistribution() {
        return { ok: true, data: [] };
    }
    async getSecurityAnalysis() {
        return { ok: true, data: [] };
    }
    async getRadioStats() {
        return { ok: true, data: [] };
    }
    async getTimelineData() {
        return { ok: true, data: [] };
    }
}
export const storage = new DatabaseStorage();
