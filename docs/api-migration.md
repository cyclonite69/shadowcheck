# Unified API Migration - Remove G63 Schema References

## Current Problem
The codebase has dual schema references:
- Main APIs using `app` schema (networks, locations, network_observations)
- G63 APIs using separate `g63.network` and `g63.location` tables
- This creates confusion and maintenance overhead

## Solution: Unify All APIs to Use `app` Schema

### API Endpoints to Migrate

All these G63 endpoints should be removed/consolidated:
- `/api/v1/g63/networks` → `/api/v1/networks`
- `/api/v1/g63/networks/within` → `/api/v1/within`  
- `/api/v1/g63/locations` → `/api/v1/locations`
- `/api/v1/g63/locations/:bssid` → `/api/v1/locations/:bssid`
- `/api/v1/g63/visualize` → `/api/v1/visualize`
- `/api/v1/g63/analytics` → `/api/v1/analytics`
- `/api/v1/g63/signal-strength` → `/api/v1/signal-strength`
- `/api/v1/g63/security-analysis` → `/api/v1/security-analysis`

### Storage Methods to Remove/Rename

Remove these G63-specific methods from `storage.ts`:
- `getG63Networks()` → Use `getNetworks()`
- `getG63NetworksWithin()` → Use `getNetworksWithin()`
- `getG63Locations()` → Use `getLocations()` 
- `getG63LocationsByBssid()` → Use `getLocationsByBssid()`
- `getG63NetworkAnalytics()` → Use `getNetworkAnalytics()`
- `getG63SignalStrengthDistribution()` → Use `getSignalStrengthDistribution()`
- `getG63SecurityAnalysis()` → Use `getSecurityAnalysis()`

### Schema References to Remove

From `shared/schema.ts`, remove:
- `g63Schema` 
- `g63Networks` table definition
- `g63Locations` table definition
- `G63Network` type
- `G63Location` type

## Implementation Steps

### 1. Update Storage Interface
```typescript
// Remove G63 methods and add unified methods
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Unified network methods
  getNetworks(limit?: number): Promise<any[]>;
  getNetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<any[]>;
  createNetwork(network: InsertNetwork): Promise<Network>;
  
  // Add missing location methods
  getLocations(limit?: number): Promise<any[]>;
  getLocationsByBssid(bssid: string): Promise<any[]>;
  
  // Unified analytics methods  
  getNetworkAnalytics(): Promise<any>;
  getSignalStrengthDistribution(): Promise<any>;
  getSecurityAnalysis(): Promise<any>;
  
  isDatabaseConnected(): Promise<boolean>;
  getConnectionInfo(): Promise<{ activeConnections: number; maxConnections: number; postgisEnabled: boolean }>;
}
```

### 2. Clean Up Routes
Remove all `/api/v1/g63/*` endpoints from `routes.ts` and replace with unified endpoints:

```typescript
// Remove lines 227-432 (all G63 endpoints)
// Keep only the main API endpoints that use storage methods consistently
```

### 3. Update Storage Implementation
Replace G63 methods with unified app schema methods:

```typescript
async getNetworks(limit: number = 50): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  try {
    const result = await dbInstance.execute(sql`
      SELECT * FROM app.api_networks_unified
      ORDER BY last_seen_at DESC
      LIMIT ${limit}
    `);
    return result;
  } catch (error) {
    console.error("Error getting networks:", error);
    return [];
  }
}

async getLocations(limit: number = 50): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  try {
    const result = await dbInstance.execute(sql`
      SELECT l.*, 
             COUNT(no.id) as network_count,
             ARRAY_AGG(DISTINCT n.bssid) as bssids
      FROM app.locations l
      LEFT JOIN app.network_observations no ON l.id = no.location_id
      LEFT JOIN app.networks n ON no.network_id = n.id
      GROUP BY l.id
      ORDER BY l.observed_at DESC
      LIMIT ${limit}
    `);
    return result;
  } catch (error) {
    console.error("Error getting locations:", error);
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
    console.error("Error getting locations for BSSID:", error);
    return [];
  }
}
```

## Benefits of This Migration

1. **Single Source of Truth**: All APIs use the same `app` schema
2. **Consistency**: Unified data structure across all endpoints  
3. **Maintainability**: No more dual schema confusion
4. **Performance**: Optimized views instead of multiple table schemas
5. **Clarity**: Clear API structure without legacy G63 references

## Migration Script

```sql
-- If there's data in g63 tables, migrate it to app schema first
-- (This would need to be customized based on your specific data)

-- Example migration (adjust as needed):
-- INSERT INTO app.networks (bssid, first_seen_at, last_seen_at, current_ssid, current_frequency, current_capabilities)
-- SELECT DISTINCT bssid, 
--        to_timestamp(MIN(lasttime)/1000),
--        to_timestamp(MAX(lasttime)/1000),
--        ssid, frequency, capabilities
-- FROM g63.network 
-- GROUP BY bssid, ssid, frequency, capabilities
-- ON CONFLICT (bssid) DO NOTHING;
```

This unified approach eliminates the confusion between G63 and app schemas while maintaining all the functionality through the optimized views in the `app` schema.