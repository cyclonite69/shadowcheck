import { users, networks, cells, g63Networks, g63Locations, type User, type InsertUser, type Network, type InsertNetwork, type G63Network, type G63Location } from "@shared/schema";
import { eq, sql, and, lt, gte } from "drizzle-orm";

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
  
  // G63 Forensics methods
  getG63Networks(limit?: number): Promise<G63Network[]>;
  getG63NetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<G63Network[]>;
  getG63Locations(limit?: number): Promise<G63Location[]>;
  getG63LocationsByBssid(bssid: string): Promise<G63Location[]>;
  
  // G63 Analytics methods
  getG63NetworkAnalytics(): Promise<any>;
  getG63SignalStrengthDistribution(): Promise<any>;
  getG63SecurityAnalysis(): Promise<any>;
  
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
      
      const postgisResult = await dbInstance.execute(sql`
        SELECT EXISTS(
          SELECT 1 FROM pg_extension WHERE extname = 'postgis'
        ) as postgis_enabled
      `);

      return {
        activeConnections: parseInt(connectionResult[0]?.active_connections) || 0,
        maxConnections: 5,
        postgisEnabled: postgisResult[0]?.postgis_enabled || false
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

  // G63 Forensics methods
  async getG63Networks(limit: number = 50): Promise<G63Network[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance
        .select()
        .from(g63Networks)
        .orderBy(sql`${g63Networks.lasttime} DESC`)
        .limit(limit);
      
      // Convert BigInt to string for JSON serialization
      return result.map(network => ({
        ...network,
        lasttime: network.lasttime.toString()
      }));
    } catch (error) {
      console.error("Error getting G63 networks:", error);
      return [];
    }
  }

  async getG63NetworksWithin(lat: number, lon: number, radius: number, limit: number = 50): Promise<G63Network[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      // Calculate bounding box for efficient filtering
      const lat_min = lat - (radius / 111320);
      const lat_max = lat + (radius / 111320);
      const lon_min = lon - (radius / (111320 * Math.cos(lat * Math.PI / 180)));
      const lon_max = lon + (radius / (111320 * Math.cos(lat * Math.PI / 180)));

      const result = await dbInstance
        .select()
        .from(g63Networks)
        .where(and(
          gte(g63Networks.lastlat, lat_min),
          lte(g63Networks.lastlat, lat_max),
          gte(g63Networks.lastlon, lon_min),
          lte(g63Networks.lastlon, lon_max)
        ))
        .orderBy(sql`${g63Networks.lasttime} DESC`)
        .limit(limit);
      
      // Convert BigInt to string for JSON serialization
      return result.map(network => ({
        ...network,
        lasttime: network.lasttime.toString()
      }));
    } catch (error) {
      console.error("Error getting G63 networks within radius:", error);
      return [];
    }
  }

  async getG63Locations(limit: number = 50): Promise<G63Location[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance
        .select()
        .from(g63Locations)
        .orderBy(sql`${g63Locations.time} DESC`)
        .limit(limit);
      
      // Convert BigInt to string for JSON serialization
      return result.map(location => ({
        ...location,
        _id: location._id.toString(),
        time: location.time.toString()
      }));
    } catch (error) {
      console.error("Error getting G63 locations:", error);
      return [];
    }
  }

  async getG63LocationsByBssid(bssid: string): Promise<G63Location[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance
        .select()
        .from(g63Locations)
        .where(eq(g63Locations.bssid, bssid))
        .orderBy(sql`${g63Locations.time} DESC`);
      
      // Convert BigInt to string for JSON serialization
      return result.map(location => ({
        ...location,
        _id: location._id.toString(),
        time: location.time.toString()
      }));
    } catch (error) {
      console.error("Error getting G63 locations for BSSID:", error);
      return [];
    }
  }

  async getG63NetworkAnalytics(): Promise<any> {
    const dbInstance = await getDb();
    if (!dbInstance) return {};

    try {
      // Get basic analytics using the existing G63 methods
      const networks = await this.getG63Networks(1000);
      
      if (!networks || networks.length === 0) {
        return { overview: {}, securityBreakdown: [] };
      }

      const uniqueBssids = new Set(networks.map(n => n.bssid)).size;
      const uniqueSsids = new Set(networks.map(n => n.ssid).filter(Boolean)).size;
      const signalValues = networks.map(n => n.bestlevel).filter(s => s !== null && s !== undefined);
      const avgSignal = signalValues.length > 0 ? signalValues.reduce((a, b) => a + b, 0) / signalValues.length : null;
      
      // Group by security capabilities
      const securityCounts = networks.reduce((acc, network) => {
        const security = network.capabilities || 'Open';
        acc[security] = (acc[security] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const securityBreakdown = Object.entries(securityCounts)
        .map(([security, count]) => ({ security, count }))
        .sort((a, b) => b.count - a.count);
      
      return {
        overview: {
          total_networks: networks.length,
          unique_bssids: uniqueBssids,
          unique_ssids: uniqueSsids,
          avg_signal_strength: avgSignal,
          min_signal: Math.min(...signalValues),
          max_signal: Math.max(...signalValues)
        },
        securityBreakdown
      };
    } catch (error) {
      console.error("Error getting G63 network analytics:", error);
      return { overview: {}, securityBreakdown: [] };
    }
  }

  async getG63SignalStrengthDistribution(): Promise<any> {
    try {
      // Get networks and process signal strength distribution in memory
      const networks = await this.getG63Networks(1000);
      
      if (!networks || networks.length === 0) {
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

      networks.forEach(network => {
        const signal = network.bestlevel;
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
      console.error("Error getting G63 signal strength distribution:", error);
      return [];
    }
  }

  async getG63SecurityAnalysis(): Promise<any> {
    try {
      // Get networks and process security analysis in memory
      const networks = await this.getG63Networks(1000);
      
      if (!networks || networks.length === 0) {
        return [];
      }

      const securityCounts = networks.reduce((acc, network) => {
        const security = network.capabilities || 'Open Network';
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

      const totalNetworks = networks.length;
      
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
      console.error("Error getting G63 security analysis:", error);
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

  // G63 Forensics methods - fallback
  async getG63Networks(limit?: number): Promise<G63Network[]> {
    return [];
  }

  async getG63NetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<G63Network[]> {
    return [];
  }

  async getG63Locations(limit?: number): Promise<G63Location[]> {
    return [];
  }

  async getG63LocationsByBssid(bssid: string): Promise<G63Location[]> {
    return [];
  }

  // G63 Analytics methods - fallback
  async getG63NetworkAnalytics(): Promise<any> {
    return {};
  }

  async getG63SignalStrengthDistribution(): Promise<any> {
    return [];
  }

  async getG63SecurityAnalysis(): Promise<any> {
    return [];
  }
}

export const storage = new DatabaseStorage();
