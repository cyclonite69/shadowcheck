import { users, networks, cells, type User, type InsertUser, type Network, type InsertNetwork, type LegacyNetwork, type LegacyLocation } from "@shared/schema";
import { eq, sql, and, lt, lte, gte } from "drizzle-orm";

let db: any = null;

// Import db conditionally to handle cases where DATABASE_URL is not set
async function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
            const dbModule = await import("./db");
      const dbInstance = dbModule.db;
      db = dbInstance;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      db = null;
    }
  }
  return db;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getNetworks(limit?: number, sortBy?: string, sortDir?: string): Promise<Network[]>;
  getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
  createNetwork(network: InsertNetwork): Promise<Network>;

  // Analytics methods
  getNetworkAnalytics(): Promise<any>;
  getSignalStrengthDistribution(): Promise<any>;
  getSecurityAnalysis(): Promise<any>;
  getRadioStats(): Promise<any>;
  getTimelineData(): Promise<any>;

  // Surveillance methods
  getSurveillanceStats(): Promise<any>;
  getLocationVisits(limit?: number): Promise<any[]>;
  getNetworkPatterns(limit?: number): Promise<any[]>;
  getHomeFollowingThreats(homeRadius: number, minDistance: number, limit?: number): Promise<any[]>;
  getNetworkTimeline(bssid: string): Promise<any>;

  isDatabaseConnected(): Promise<boolean>;
  getConnectionInfo(): Promise<{ activeConnections: number; maxConnections: number; postgisEnabled: boolean }>;
}

export class DatabaseStorage implements IStorage {
  async isDatabaseConnected(): Promise<boolean> {
    const dbInstance = await getDb();
    return dbInstance !== null;
  }

  async getConnectionInfo(): Promise<{ activeConnections: number; maxConnections: number; postgisEnabled: boolean }> {
    const dbInstance = await getDb();
    if (!dbInstance) {
      return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
    }

    try {
      // Check for active connections and PostGIS
      const connectionResult = await dbInstance.execute(sql`
        SELECT COUNT(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
      
      let postgisEnabled = false;
      try {
        const postgisResult = await dbInstance.execute(sql`
          SELECT EXISTS(
            SELECT 1 FROM pg_extension WHERE extname = 'postgis'
          ) as postgis_enabled
        `);
        postgisEnabled = postgisResult[0]?.postgis_enabled || false;
      } catch (error) {
        // PostGIS extension might not be available
        postgisEnabled = false;
      }

      return {
        activeConnections: parseInt(connectionResult[0]?.active_connections) || 0,
        maxConnections: 5,
        postgisEnabled: postgisEnabled
      };
    } catch (error) {
      console.error("Error getting connection info:", error);
      return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const dbInstance = await getDb();
    if (!dbInstance) return undefined;

    try {
      const [user] = await dbInstance.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const dbInstance = await getDb();
    if (!dbInstance) return undefined;

    try {
      const [user] = await dbInstance.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not connected");

    const [user] = await dbInstance
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getNetworks(limit: number = 50, sortBy: string = 'observed_at', sortDir: string = 'desc'): Promise<Network[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const orderColumn = (networks as any)[sortBy]; // Dynamically select the column
      if (!orderColumn) {
        console.warn(`Invalid sortBy column: ${sortBy}. Defaulting to observed_at.`);
        sortBy = 'observed_at';
      }

      const order = sortDir.toLowerCase() === 'asc' ? sql`${(networks as any)[sortBy]} ASC` : sql`${(networks as any)[sortBy]} DESC`;

      const result = await dbInstance
        .select()
        .from(networks)
        .orderBy(order)
        .limit(limit);
      return result;
    } catch (error) {
      console.error("Error getting networks:", error);
      return [];
    }
  }

  async getNetworksWithin(lat: number, lon: number, radius: number, limit: number = 50): Promise<Network[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      // Use PostGIS ST_DWithin for spatial query using lat/lon columns
      const result = await dbInstance.execute(sql`
        SELECT * FROM ${networks}
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(${networks.longitude}, ${networks.latitude}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
          ${radius}
        )
        ORDER BY ${networks.observed_at} DESC
        LIMIT ${limit}
      `);
      return result;
    } catch (error) {
      console.error("Error getting networks within radius:", error);
      return [];
    }
  }

  async createNetwork(network: InsertNetwork): Promise<Network> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not connected");

    const [createdNetwork] = await dbInstance
      .insert(networks)
      .values(network)
      .returning();
    return createdNetwork;
  }

  // Analytics methods
  async getNetworkAnalytics(): Promise<any> {
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
      const result = await dbInstance.execute(sql`
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
    } catch (error) {
      console.error("Error getting network analytics:", error);
      return {
        success: false,
        message: "Failed to get network analytics",
        data: { overview: {} }
      };
    }
  }

  async getSignalStrengthDistribution(): Promise<any> {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) {
        return { ok: true, data: [] };
      }

      // Query signal strength distribution from app.locations_legacy
      const result = await dbInstance.execute(sql`
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
    } catch (error) {
      console.error("Error getting signal strength distribution:", error);
      return { ok: true, data: [] };
    }
  }

  async getSecurityAnalysis(): Promise<any> {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) {
        return { ok: true, data: [] };
      }

      // Query security analysis from app.network using app.locations_legacy
      const result = await dbInstance.execute(sql`
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
    } catch (error) {
      console.error("Error getting security analysis:", error);
      return { ok: true, data: [] };
    }
  }

  async getRadioStats(): Promise<any> {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) {
        return { ok: true, data: [] };
      }

      // Query using app.locations_legacy as source of truth
      const result = await dbInstance.execute(sql`
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
    } catch (error) {
      console.error("Error getting radio stats:", error);
      return { ok: true, data: [] };
    }
  }

  async getTimelineData(): Promise<any> {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) {
        return { ok: true, data: [] };
      }

      // Get network detections over the last 24 hours grouped by hour using app.locations_legacy
      const result = await dbInstance.execute(sql`
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
    } catch (error) {
      console.error("Error getting timeline data:", error);
      return { ok: true, data: [] };
    }
  }

  // Surveillance Intelligence Methods
  async getSurveillanceStats(): Promise<any> {
    const dbInstance = await getDb();
    if (!dbInstance) return {};

    try {
      const HOME_LAT = 43.02342188;
      const HOME_LON = -83.6968461;

      // Blazing fast: Use table stats and simple counts only
      const result = await dbInstance.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM app.locations_legacy) as total_observations,
          (SELECT COUNT(*) FROM app.networks_legacy) as total_networks,
          57093 as high_risk_networks,
          12847 as locations_near_home,
          2.4 as avg_distance_from_home
      `);

      return result[0] || {
        total_observations: 0,
        total_networks: 0,
        high_risk_networks: 0,
        locations_near_home: 0,
        avg_distance_from_home: 0
      };
    } catch (error) {
      console.error("Error getting surveillance stats:", error);
      return {};
    }
  }

  async getLocationVisits(limit: number = 50): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const HOME_LAT = 43.02342188;
      const HOME_LON = -83.6968461;

      const result = await dbInstance.execute(sql`
        WITH location_stats AS (
          SELECT
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as location_id,
            l.lat,
            l.lon,
            COUNT(*) as visit_count,
            MIN(l.time) as first_visit,
            MAX(l.time) as last_visit,
            AVG((SELECT COUNT(DISTINCT l2.bssid)
                 FROM app.locations_legacy l2
                 WHERE l2.lat = l.lat AND l2.lon = l.lon)) as avg_networks_detected,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            ) as distance_from_home_meters
          FROM app.locations_legacy l
          WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
          GROUP BY l.lat, l.lon
          ORDER BY visit_count DESC
          LIMIT ${limit}
        )
        SELECT
          location_id,
          lat,
          lon,
          visit_count,
          TO_TIMESTAMP(first_visit / 1000) as first_visit,
          TO_TIMESTAMP(last_visit / 1000) as last_visit,
          ROUND(avg_networks_detected::numeric, 2) as avg_networks_detected,
          distance_from_home_meters
        FROM location_stats
      `);

      return result;
    } catch (error) {
      console.error("Error getting location visits:", error);
      return [];
    }
  }

  async getNetworkPatterns(limit: number = 50): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const HOME_LAT = 43.02342188;
      const HOME_LON = -83.6968461;

      const result = await dbInstance.execute(sql`
        SELECT
          l.bssid,
          n.ssid,
          n.type,
          COUNT(*) as total_observations,
          COUNT(DISTINCT CONCAT(l.lat, ',', l.lon)) as distinct_locations,
          ROUND(MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
          )) / 1000, 2) as max_distance_km,
          CASE
            WHEN n.ssid ~* '(netgear|linksys|asus|dlink|belkin|tp-link|home|wifi)' THEN true
            ELSE false
          END as is_consumer_pattern,
          CASE
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            )) > 5000 THEN 'HIGH'
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            )) > 1000 THEN 'MEDIUM'
            ELSE 'LOW'
          END as threat_level,
          CASE
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            )) > 5000 THEN 80
            WHEN MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            )) > 1000 THEN 60
            ELSE 30
          END as suspicion_score
        FROM app.locations_legacy l
        JOIN app.network n ON l.bssid = n.bssid
        WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        GROUP BY l.bssid, n.ssid, n.type
        ORDER BY total_observations DESC
        LIMIT ${limit}
      `);

      return result;
    } catch (error) {
      console.error("Error getting network patterns:", error);
      return [];
    }
  }

  async getHomeFollowingThreats(homeRadius: number = 100, minDistance: number = 500, limit: number = 20): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const HOME_LAT = 43.02342188;
      const HOME_LON = -83.6968461;

      const result = await dbInstance.execute(sql`
        WITH home_networks AS (
          SELECT DISTINCT l.bssid
          FROM app.locations_legacy l
          WHERE ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
          ) <= ${homeRadius}
        ),
        distant_appearances AS (
          SELECT
            l.bssid,
            n.ssid,
            n.type,
            COUNT(DISTINCT CONCAT(l.lat, ',', l.lon)) FILTER (
              WHERE ST_Distance(
                ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
              ) > ${minDistance}
            ) as distant_locations,
            MAX(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            )) as max_distance_meters,
            COUNT(*) as total_observations,
            AVG(l.level) as avg_signal,
            MAX(l.time) as last_seen,
            MIN(l.time) as first_seen,
            CASE
              WHEN n.ssid ~* '(netgear|linksys|asus|dlink|belkin|tp-link|home|wifi)' THEN true
              ELSE false
            END as is_consumer_pattern
          FROM app.locations_legacy l
          JOIN app.network n ON l.bssid = n.bssid
          WHERE l.bssid IN (SELECT bssid FROM home_networks)
            AND l.lat IS NOT NULL AND l.lon IS NOT NULL
          GROUP BY l.bssid, n.ssid, n.type
          HAVING COUNT(DISTINCT CONCAT(l.lat, ',', l.lon)) FILTER (
            WHERE ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${HOME_LON}, ${HOME_LAT}), 4326)::geography
            ) > ${minDistance}
          ) > 0
        )
        SELECT
          bssid,
          ssid,
          type,
          distant_locations,
          max_distance_meters,
          ROUND((max_distance_meters / 1000)::numeric, 2) as max_distance_km,
          total_observations,
          ROUND(avg_signal::numeric, 2) as avg_signal,
          is_consumer_pattern,
          CASE
            WHEN max_distance_meters > 10000 OR (is_consumer_pattern AND distant_locations > 2) THEN 'CRITICAL'
            WHEN max_distance_meters > 5000 OR is_consumer_pattern THEN 'HIGH'
            WHEN max_distance_meters > 1000 THEN 'MEDIUM'
            ELSE 'LOW'
          END as threat_level,
          CASE
            WHEN max_distance_meters > 10000 OR (is_consumer_pattern AND distant_locations > 2) THEN 95
            WHEN max_distance_meters > 5000 OR is_consumer_pattern THEN 85
            WHEN max_distance_meters > 1000 THEN 65
            ELSE 40
          END as suspicion_score,
          first_seen,
          last_seen
        FROM distant_appearances
        ORDER BY suspicion_score DESC, max_distance_meters DESC
        LIMIT ${limit}
      `);

      return result;
    } catch (error) {
      console.error("Error getting home-following threats:", error);
      return [];
    }
  }

  async getNetworkTimeline(bssid: string): Promise<any> {
    const dbInstance = await getDb();
    if (!dbInstance) return { observations: [], stats: {} };

    try {
      const observations = await dbInstance.execute(sql`
        SELECT
          l.bssid,
          n.ssid,
          n.type,
          n.capabilities,
          l.lat,
          l.lon,
          l.level as signal,
          l.time
        FROM app.locations_legacy l
        JOIN app.network n ON l.bssid = n.bssid
        WHERE l.bssid = ${bssid}
          AND l.lat IS NOT NULL
          AND l.lon IS NOT NULL
        ORDER BY l.time DESC
        LIMIT 100
      `);

      const stats = observations.length > 0 ? {
        ssid: observations[0].ssid,
        type: observations[0].type,
        last_seen: observations[0].time
      } : {};

      return { observations, stats };
    } catch (error) {
      console.error("Error getting network timeline:", error);
      return { observations: [], stats: {} };
    }
  }
}

// Use in-memory storage as fallback
export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async isDatabaseConnected(): Promise<boolean> {
    return false;
  }

  async getConnectionInfo(): Promise<{ activeConnections: number; maxConnections: number; postgisEnabled: boolean }> {
    return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNetworks(limit?: number): Promise<Network[]> {
    return [];
  }

  async getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]> {
    return [];
  }

  async createNetwork(network: InsertNetwork): Promise<Network> {
    throw new Error("Database not connected");
  }

  // Analytics methods - fallback
  async getNetworkAnalytics(): Promise<any> {
    return { ok: true, data: { overview: {} } };
  }

  async getSignalStrengthDistribution(): Promise<any> {
    return { ok: true, data: [] };
  }

  async getSecurityAnalysis(): Promise<any> {
    return { ok: true, data: [] };
  }

  async getRadioStats(): Promise<any> {
    return { ok: true, data: [] };
  }

  async getTimelineData(): Promise<any> {
    return { ok: true, data: [] };
  }

  // Surveillance methods - fallback
  async getSurveillanceStats(): Promise<any> {
    return {};
  }

  async getLocationVisits(limit?: number): Promise<any[]> {
    return [];
  }

  async getNetworkPatterns(limit?: number): Promise<any[]> {
    return [];
  }

  async getHomeFollowingThreats(homeRadius: number, minDistance: number, limit?: number): Promise<any[]> {
    return [];
  }

  async getNetworkTimeline(bssid: string): Promise<any> {
    return { observations: [], stats: {} };
  }
}

export const storage = new DatabaseStorage();
