import {
  users,
  networks,
  type User,
  type InsertUser,
  type Network,
  type InsertNetwork,
} from '../shared/schema.js';
import { eq, sql, and, lt, lte, gte } from 'drizzle-orm';

import { query } from './db';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getNetworks(limit?: number): Promise<Network[]>;
  getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
  createNetwork(network: InsertNetwork): Promise<Network>;

  // Location methods
  getLocations(limit?: number): Promise<any[]>;
  getLocationsByBssid(bssid: string): Promise<any[]>;

  // Analytics methods
  getNetworkAnalytics(): Promise<any>;
  getSignalStrengthDistribution(): Promise<any>;
  getSecurityAnalysis(): Promise<any>;
  getNetworksBeforeTime(beforeTime: number, limit: number): Promise<any[]>;

  isDatabaseConnected(): Promise<boolean>;
  getConnectionInfo(): Promise<{
    activeConnections: number;
    maxConnections: number;
    postgisEnabled: boolean;
  }>;
}

export class DatabaseStorage implements IStorage {
  async isDatabaseConnected(): Promise<boolean> {
    try {
      await query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async getConnectionInfo(): Promise<{
    activeConnections: number;
    maxConnections: number;
    postgisEnabled: boolean;
  }> {
    try {
      // Check for active connections and PostGIS
      const connectionResult = await query(`
        SELECT COUNT(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);

      let postgisEnabled = false;
      try {
        const postgisResult = await query(`
          SELECT EXISTS(
            SELECT 1 FROM pg_extension WHERE extname = 'postgis'
          ) as postgis_enabled
        `);
        postgisEnabled = postgisResult.rows[0]?.postgis_enabled || false;
      } catch (error) {
        // PostGIS extension might not be available
        postgisEnabled = false;
      }

      return {
        activeConnections: parseInt(connectionResult.rows[0]?.active_connections) || 0,
        maxConnections: 5,
        postgisEnabled: postgisEnabled,
      };
    } catch (error) {
      console.error('Error getting connection info:', error);
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
      console.error('Error getting user:', error);
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
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error('Database not connected');

    const [user] = await dbInstance.insert(users).values(insertUser).returning();
    return user;
  }

  async getNetworks(limit: number = 10000): Promise<any[]> {
    try {
      const result = await query(`
        SELECT * FROM app.api_networks_unified
        ORDER BY last_seen_at DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting networks:', error);
      return [];
    }
  }

  async getNetworksWithin(
    lat: number,
    lon: number,
    radius: number,
    limit: number = 50
  ): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      // Calculate bounding box for efficient filtering
      const lat_min = lat - radius / 111320;
      const lat_max = lat + radius / 111320;
      const lon_min = lon - radius / (111320 * Math.cos((lat * Math.PI) / 180));
      const lon_max = lon + radius / (111320 * Math.cos((lat * Math.PI) / 180));

      const result = await dbInstance.execute(sql`
        SELECT * FROM app.api_networks_unified
        WHERE latitude BETWEEN ${lat_min} AND ${lat_max}
        AND longitude BETWEEN ${lon_min} AND ${lon_max}
        ORDER BY last_seen_at DESC
        LIMIT ${limit}
      `);
      return result;
    } catch (error) {
      console.error('Error getting networks within radius:', error);
      return [];
    }
  }

  async createNetwork(network: InsertNetwork): Promise<Network> {
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error('Database not connected');

    const [createdNetwork] = await dbInstance.insert(networks).values(network).returning();
    return createdNetwork;
  }

  // Location methods
  async getLocations(limit: number = 50): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance.execute(sql`
        SELECT l.*,
               COUNT(no.id) as network_count,
               ARRAY_AGG(DISTINCT n.bssid) FILTER (WHERE n.bssid IS NOT NULL) as bssids
        FROM app.locations l
        LEFT JOIN app.network_observations no ON l.id = no.location_id
        LEFT JOIN app.networks n ON no.network_id = n.id
        GROUP BY l.id
        ORDER BY l.observed_at DESC
        LIMIT ${limit}
      `);
      return result;
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  }

  async getLocationsByBssid(bssid: string): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance.execute(sql`
        SELECT l.*, no.signal_strength, no.observed_at as observation_time
        FROM app.locations l
        JOIN app.network_observations no ON l.id = no.location_id
        JOIN app.networks n ON no.network_id = n.id
        WHERE n.bssid = ${bssid}
        ORDER BY no.observed_at DESC
      `);
      return result;
    } catch (error) {
      console.error('Error getting locations for BSSID:', error);
      return [];
    }
  }

  async getNetworksBeforeTime(beforeTime: number, limit: number): Promise<any[]> {
    const dbInstance = await getDb();
    if (!dbInstance) return [];

    try {
      const result = await dbInstance.execute(sql`
        SELECT * FROM app.api_network_observations_enriched
        WHERE time < ${beforeTime}
        ORDER BY time DESC
        LIMIT ${limit}
      `);
      return result;
    } catch (error) {
      console.error('Error getting networks before time:', error);
      return [];
    }
  }

  async getNetworkAnalytics(): Promise<any> {
    try {
      const result = await query(`
        SELECT * FROM app.api_network_analytics
      `);
      return result.rows[0] || {};
    } catch (error) {
      console.error('Error getting network analytics:', error);
      return {};
    }
  }

  async getSignalStrengthDistribution(): Promise<any> {
    try {
      const result = await query(`
        SELECT 
          CASE 
            WHEN signal_strength >= -30 THEN 'Excellent (-30 to 0 dBm)'
            WHEN signal_strength >= -50 THEN 'Good (-50 to -30 dBm)'
            WHEN signal_strength >= -60 THEN 'Fair (-60 to -50 dBm)'
            WHEN signal_strength >= -70 THEN 'Weak (-70 to -60 dBm)'
            ELSE 'Very Weak (< -70 dBm)'
          END as range,
          COUNT(*) as count,
          AVG(signal_strength)::numeric(5,2) as avg_signal_in_range
        FROM app.network_observations
        WHERE signal_strength IS NOT NULL
        GROUP BY 
          CASE 
            WHEN signal_strength >= -30 THEN 'Excellent (-30 to 0 dBm)'
            WHEN signal_strength >= -50 THEN 'Good (-50 to -30 dBm)'
            WHEN signal_strength >= -60 THEN 'Fair (-60 to -50 dBm)'
            WHEN signal_strength >= -70 THEN 'Weak (-70 to -60 dBm)'
            ELSE 'Very Weak (< -70 dBm)'
          END
        ORDER BY count DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting signal strength distribution:', error);
      return [];
    }
  }

  async getSecurityAnalysis(): Promise<any> {
    try {
      const result = await query(`
        SELECT 
          CASE 
            WHEN current_capabilities ILIKE '%WPA3%' THEN 'WPA3'
            WHEN current_capabilities ILIKE '%WPA2%' THEN 'WPA2'
            WHEN current_capabilities ILIKE '%WPA%' THEN 'WPA'
            WHEN current_capabilities ILIKE '%WEP%' THEN 'WEP'
            WHEN current_capabilities = '' OR current_capabilities IS NULL THEN '[ESS]'
            ELSE 'Unknown'
          END as security,
          COUNT(*) as network_count,
          COUNT(DISTINCT bssid) as unique_devices,
          ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage,
          CASE 
            WHEN current_capabilities ILIKE '%WPA3%' THEN 'High Security'
            WHEN current_capabilities ILIKE '%WPA2%' THEN 'Medium Security'
            WHEN current_capabilities ILIKE '%WEP%' THEN 'Low Security'
            WHEN current_capabilities = '' OR current_capabilities IS NULL THEN 'Open Network'
            ELSE 'Unknown Security'
          END as security_level
        FROM app.networks
        GROUP BY 
          CASE 
            WHEN current_capabilities ILIKE '%WPA3%' THEN 'WPA3'
            WHEN current_capabilities ILIKE '%WPA2%' THEN 'WPA2'
            WHEN current_capabilities ILIKE '%WPA%' THEN 'WPA'
            WHEN current_capabilities ILIKE '%WEP%' THEN 'WEP'
            WHEN current_capabilities = '' OR current_capabilities IS NULL THEN '[ESS]'
            ELSE 'Unknown'
          END,
          CASE 
            WHEN current_capabilities ILIKE '%WPA3%' THEN 'High Security'
            WHEN current_capabilities ILIKE '%WPA2%' THEN 'Medium Security'
            WHEN current_capabilities ILIKE '%WEP%' THEN 'Low Security'
            WHEN current_capabilities = '' OR current_capabilities IS NULL THEN 'Open Network'
            ELSE 'Unknown Security'
          END
        ORDER BY network_count DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting security analysis:', error);
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

  async getConnectionInfo(): Promise<{
    activeConnections: number;
    maxConnections: number;
    postgisEnabled: boolean;
  }> {
    return { activeConnections: 0, maxConnections: 5, postgisEnabled: false };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
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

  async getNetworksWithin(
    lat: number,
    lon: number,
    radius: number,
    limit?: number
  ): Promise<Network[]> {
    return [];
  }

  async createNetwork(network: InsertNetwork): Promise<Network> {
    throw new Error('Database not connected');
  }

  // Location methods - fallback
  async getLocations(limit?: number): Promise<any[]> {
    return [];
  }

  async getLocationsByBssid(bssid: string): Promise<any[]> {
    return [];
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

  async getNetworksBeforeTime(beforeTime: number, limit: number): Promise<any[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();
