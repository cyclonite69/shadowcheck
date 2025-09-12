# API Schema Alignment Fixes

## Issues Identified

### 1. Storage Layer Misalignment

**Problem**: `storage.ts` methods query wrong tables/schemas

- `getNetworks()` queries `app.networks` but APIs expect `location_details_enriched` structure
- G63 APIs work correctly but main APIs have schema mismatch

**Fix**: Update storage methods to use new unified views

### 2. Route Handler Inconsistency

**Problem**: Different network endpoints use different data sources

- `/api/v1/networks` (in routes.ts) calls `storage.getNetworks()`
- `/api/v1/networks` (in routes/networks.ts) directly queries `location_details_enriched`
- Routes are duplicated and conflicting

**Fix**: Consolidate to single network endpoint using unified view

### 3. Schema vs API Response Mismatch

**Problem**: Normalized schema doesn't match expected API responses

- Schema has `networks` with `first_seen_at`, `last_seen_at`, `current_ssid`
- APIs expect `observed_at`, `ssid`, `signal_strength`, `latitude`, `longitude`

**Fix**: Use the new views that bridge this gap

## Recommended Changes

### 1. Update Storage Methods

```typescript
// In storage.ts - update getNetworks method
async getNetworks(limit: number = 50): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  try {
    // Use the new unified view instead of direct table query
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

// Update getNetworksWithin for spatial queries
async getNetworksWithin(lat: number, lon: number, radius: number, limit: number = 50): Promise<any[]> {
  const dbInstance = await getDb();
  if (!dbInstance) return [];

  try {
    const result = await dbInstance.execute(sql`
      SELECT * FROM app.api_networks_spatial
      WHERE ST_DWithin(
        geom,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
        ${radius}
      )
      ORDER BY observed_at DESC
      LIMIT ${limit}
    `);
    return result;
  } catch (error) {
    console.error("Error getting networks within radius:", error);
    return [];
  }
}
```

### 2. Consolidate Network Routes

**Remove duplicate endpoints**: The main `routes.ts` has `/api/v1/networks` that conflicts with `routes/networks.ts`

**Keep**: `routes/networks.ts` and `routes/networks_v2.ts` but update them to use storage methods consistently

```typescript
// In routes/networks.ts - update to use storage layer
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100) || 100, 1000);
  const before = Number(req.query.before_time_ms);

  try {
    let networks;
    if (before && Number.isFinite(before)) {
      // Add time filtering to the unified view query
      networks = await storage.getNetworksBeforeTime(before, limit);
    } else {
      networks = await storage.getNetworks(limit);
    }

    res.json({
      ok: true,
      count: networks.length,
      cursor: {
        next_before_time_ms: networks.length ? networks[networks.length - 1].time_epoch_ms : null,
      },
      rows: networks,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});
```

### 3. Update Main Routes

**Remove conflicting endpoints from routes.ts**:

- Remove `/api/v1/networks` (line 74-101)
- Keep visualization endpoints but update to use storage methods

```typescript
// In routes.ts - update visualization endpoint
app.get('/api/v1/visualize', async (req, res) => {
  const isConnected = await storage.isDatabaseConnected();
  if (!isConnected) {
    return res.status(501).json({
      ok: false,
      error: 'Database not connected. Please restore your PostgreSQL backup for visualization.',
      code: 'DB_NOT_CONNECTED',
    });
  }

  try {
    // Use storage method instead of direct query
    const networks = await storage.getNetworks(1000);

    // Format for Mapbox visualization
    const geojson = {
      type: 'FeatureCollection',
      features: networks
        .filter((n) => n.latitude && n.longitude)
        .map((network) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(network.longitude), parseFloat(network.latitude)],
          },
          properties: {
            id: network.id,
            ssid: network.ssid,
            bssid: network.bssid,
            signal_strength: network.signal_strength,
            encryption: network.encryption,
            observed_at: network.observed_at,
          },
        })),
    };

    res.json({
      ok: true,
      data: geojson,
      count: geojson.features.length,
    });
  } catch (error) {
    console.error('Error generating visualization data:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to generate visualization data',
    });
  }
});
```

### 4. Add New Analytics Endpoints

```typescript
// Add to routes.ts
app.get('/api/v1/analytics', async (req, res) => {
  const isConnected = await storage.isDatabaseConnected();
  if (!isConnected) {
    return res.status(501).json({
      ok: false,
      error: 'Database not connected',
      code: 'DB_NOT_CONNECTED',
    });
  }

  try {
    const analytics = await storage.getNetworkAnalytics();
    res.json({
      ok: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch analytics',
    });
  }
});
```

### 5. Add Missing Storage Methods

```typescript
// Add to storage.ts interface and implementation
async getNetworkAnalytics(): Promise<any> {
  const dbInstance = await getDb();
  if (!dbInstance) return {};

  try {
    const result = await dbInstance.execute(sql`
      SELECT * FROM app.api_network_analytics
    `);
    return result[0] || {};
  } catch (error) {
    console.error("Error getting network analytics:", error);
    return {};
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
    console.error("Error getting networks before time:", error);
    return [];
  }
}
```

## Implementation Steps

1. **Create Views**: Run `database-views.sql` as postgres user
2. **Update Storage**: Modify `storage.ts` with new methods
3. **Fix Routes**: Update `routes.ts` to remove duplicates and use storage methods
4. **Update Network Routes**: Modify `routes/networks.ts` to use storage consistently
5. **Test**: Verify all endpoints return consistent data structure
6. **Add Metrics**: Include new analytics endpoints

## Expected Benefits

1. **Consistency**: All network APIs return same data structure
2. **Performance**: Views are optimized with proper indexes
3. **Maintainability**: Single source of truth for network data
4. **Spatial Queries**: PostGIS integration works correctly
5. **Analytics**: Pre-calculated metrics for dashboard performance
