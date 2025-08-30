import { users, networks, cells, type User, type InsertUser, type Network, type InsertNetwork } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
