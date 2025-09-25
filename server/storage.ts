import { users, networks, cells, type User, type InsertUser, type Network, type InsertNetwork, type LegacyNetwork, type LegacyLocation } from "@shared/schema";
import { eq, sql, and, lt, lte, gte } from "drizzle-orm";

let db: any = null;

// Import db conditionally to handle cases where DATABASE_URL is not set
async function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
      const { db: dbInstance } = await import("./db");
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
  getNetworks(limit?: number): Promise<Network[]>;
  getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  
  // Analytics methods
  getNetworkAnalytics(): Promise<any>;
  getSignalStrengthDistribution(): Promise<any>;
  getSecurityAnalysis(): Promise<any>;
  
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

  async getNetworks(limit: number = 50): Promise<Network[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance
        .select()
        .from(networks)
        .orderBy(sql`${networks.observed_at} DESC`)
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
      // Use PostGIS ST_DWithin for spatial query
      const result = await dbInstance.execute(sql`
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
    if (!dbInstance) return null;

    try {
      // Get basic analytics using the networks table
      const networks_data = await this.getNetworks(1000);
      
      if (!networks_data || networks_data.length === 0) {
        return {
          success: false,
          message: "No network data available for analytics"
        };
      }

      // Calculate overview statistics
      const overview = {
        total_networks: networks_data.length,
        total_observations: networks_data.length,
        distinct_ssids: new Set(networks_data.map(n => n.ssid).filter(Boolean)).size,
        distinct_bssids: new Set(networks_data.map(n => n.bssid)).size,
        avg_signal_strength: networks_data.filter(n => n.signal_strength).length > 0 
          ? networks_data.filter(n => n.signal_strength).reduce((sum, n) => sum + (n.signal_strength || 0), 0) / networks_data.filter(n => n.signal_strength).length
          : null
      };

      return {
        success: true,
        data: { overview }
      };
    } catch (error) {
      console.error("Error getting network analytics:", error);
      return {
        success: false,
        message: "Failed to get network analytics"
      };
    }
  }

  async getSignalStrengthDistribution(): Promise<any> {
    try {
      // Get networks and process signal strength distribution in memory
      const networks_data = await this.getNetworks(1000);
      
      if (!networks_data || networks_data.length === 0) {
        return [];
      }

      const signalRanges = {
        'Excellent (-30 to 0 dBm)': [],
        'Good (-50 to -30 dBm)': [],
        'Fair (-60 to -50 dBm)': [],
        'Weak (-70 to -60 dBm)': [],
        'Very Weak (< -70 dBm)': [],
        'No Signal Data': []
      } as Record<string, number[]>;

      networks_data.forEach(network => {
        const signal = network.signal_strength;
        if (signal === null || signal === undefined) {
          signalRanges['No Signal Data'].push(0);
        } else if (signal >= -30) {
          signalRanges['Excellent (-30 to 0 dBm)'].push(signal);
        } else if (signal >= -50) {
          signalRanges['Good (-50 to -30 dBm)'].push(signal);
        } else if (signal >= -60) {
          signalRanges['Fair (-60 to -50 dBm)'].push(signal);
        } else if (signal >= -70) {
          signalRanges['Weak (-70 to -60 dBm)'].push(signal);
        } else {
          signalRanges['Very Weak (< -70 dBm)'].push(signal);
        }
      });

      return Object.entries(signalRanges)
        .map(([range, values]) => ({
          signal_range: range,
          count: values.length,
          avg_signal_in_range: values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null
        }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error getting signal strength distribution:", error);
      return [];
    }
  }

  async getSecurityAnalysis(): Promise<any> {
    try {
      // Get networks and process security analysis in memory
      const networks_data = await this.getNetworks(1000);
      
      if (!networks_data || networks_data.length === 0) {
        return [];
      }

      const securityCounts = networks_data.reduce((acc, network) => {
        const security = network.encryption || 'Open Network';
        if (!acc[security]) {
          acc[security] = {
            devices: new Set(),
            count: 0
          };
        }
        acc[security].devices.add(network.bssid);
        acc[security].count++;
        return acc;
      }, {} as Record<string, { devices: Set<string>; count: number }>);

      const totalNetworks = networks_data.length;
      
      return Object.entries(securityCounts)
        .map(([security, data]) => {
          let securityLevel = 'Unknown Security';
          if (security.toLowerCase().includes('wpa3')) {
            securityLevel = 'High Security';
          } else if (security.toLowerCase().includes('wpa2')) {
            securityLevel = 'Medium Security';
          } else if (security.toLowerCase().includes('wep')) {
            securityLevel = 'Low Security';
          } else if (security === 'Open Network' || security === '') {
            securityLevel = 'Open Network';
          }

          return {
            security,
            network_count: data.count,
            unique_devices: data.devices.size,
            percentage: Math.round((data.count / totalNetworks) * 100 * 100) / 100,
            security_level: securityLevel
          };
        })
        .sort((a, b) => b.network_count - a.network_count);
    } catch (error) {
      console.error("Error getting security analysis:", error);
      return [];
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
    return {};
  }

  async getSignalStrengthDistribution(): Promise<any> {
    return [];
  }

  async getSecurityAnalysis(): Promise<any> {
    return [];
  }
}

export const storage = new DatabaseStorage();
