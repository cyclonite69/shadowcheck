import { type User, type InsertUser, type Network, type InsertNetwork } from "@shared/schema";
export interface IStorage {
    getUser(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    getNetworks(limit?: number): Promise<Network[]>;
    getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
    createNetwork(network: InsertNetwork): Promise<Network>;
    getNetworkAnalytics(): Promise<any>;
    getSignalStrengthDistribution(): Promise<any>;
    getSecurityAnalysis(): Promise<any>;
    getRadioStats(): Promise<any>;
    getTimelineData(): Promise<any>;
    isDatabaseConnected(): Promise<boolean>;
    getConnectionInfo(): Promise<{
        activeConnections: number;
        maxConnections: number;
        postgisEnabled: boolean;
    }>;
}
export declare class DatabaseStorage implements IStorage {
    isDatabaseConnected(): Promise<boolean>;
    getConnectionInfo(): Promise<{
        activeConnections: number;
        maxConnections: number;
        postgisEnabled: boolean;
    }>;
    getUser(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getNetworks(limit?: number): Promise<Network[]>;
    getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
    createNetwork(network: InsertNetwork): Promise<Network>;
    getNetworkAnalytics(): Promise<any>;
    getSignalStrengthDistribution(): Promise<any>;
    getSecurityAnalysis(): Promise<any>;
    getRadioStats(): Promise<any>;
    getTimelineData(): Promise<any>;
}
export declare class MemStorage implements IStorage {
    private users;
    constructor();
    isDatabaseConnected(): Promise<boolean>;
    getConnectionInfo(): Promise<{
        activeConnections: number;
        maxConnections: number;
        postgisEnabled: boolean;
    }>;
    getUser(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getNetworks(limit?: number): Promise<Network[]>;
    getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<Network[]>;
    createNetwork(network: InsertNetwork): Promise<Network>;
    getNetworkAnalytics(): Promise<any>;
    getSignalStrengthDistribution(): Promise<any>;
    getSecurityAnalysis(): Promise<any>;
    getRadioStats(): Promise<any>;
    getTimelineData(): Promise<any>;
}
export declare const storage: DatabaseStorage;
