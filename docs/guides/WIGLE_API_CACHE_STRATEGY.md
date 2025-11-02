# WiGLE API Cache Replacement Strategy

## Current State Analysis

### Existing Tables
- `app.wigle_api_networks_staging` - Network metadata cache (4 networks, 96 KB)
- `app.wigle_api_locations_staging` - Observation locations cache (2,481 locations, 1.9 MB)
- `app.bssid_enrichment_queue` - Tag queue for networks to fetch from WiGLE

### Current Workflow
1. User tags BSSIDs via `/api/v1/wigle/tag` endpoint
2. BSSIDs enter `bssid_enrichment_queue` with status 'pending'
3. External pipeline fetches from WiGLE API and populates staging tables
4. API endpoints query staging tables for enriched data

### Problem with Current Approach
- **Append-only**: Old WiGLE data accumulates, never gets refreshed
- **No versioning**: Can't tell when data was fetched or if it's stale
- **No SSID history**: WiGLE tracks SSID changes over time (like CA:99:B2:1E:55:13 with "Delta3G" → "Whitman1968"), but we only keep latest query

---

## Alpha v3 API Response Structure (Reference)

From `/response_1762039938542.json` - Network CA:99:B2:1E:55:13:

```json
{
  "networkId": "CA:99:B2:1E:55:13",
  "trilateratedLatitude": 43.02347565,
  "trilateratedLongitude": -83.69673157,
  "bestClusterWiGLEQoS": 6,
  "firstSeen": "2023-09-16T00:29:47.000Z",
  "lastSeen": "2024-09-19T03:29:15.000Z",
  "streetAddress": {
    "road": "Martin Luther King Avenue",
    "city": "Flint",
    "region": "MI",
    "country": "US",
    "postalcode": "48052"
  },
  "locationClusters": [
    {
      "clusterSsid": "Delta3G",          // 804 observations, 67 days
      "centroidLatitude": 43.023475,
      "daysObservedCount": 67,
      "locations": [ /* 804 observations */ ]
    },
    {
      "clusterSsid": "Whitman1968",      // 133 observations, 1 day, MOBILE!
      "centroidLatitude": 42.435631,
      "daysObservedCount": 1,
      "locations": [ /* 133 observations */ ]
    }
  ]
}
```

**Key Insight**: This is a **mobile hotspot** that changed SSIDs. Same MAC, different SSIDs at different locations. This is INTEL GOLD for surveillance detection.

---

## Proposed: "Snapshot with History" Strategy

### Design Principles
1. **Replace on refresh** - New WiGLE query replaces old data for that BSSID
2. **Archive historical snapshots** - Keep 30-day snapshot history
3. **Track SSID changes** - Detect when SSID changes between queries
4. **Preserve observation details** - All individual location observations
5. **Efficient queries** - Fast lookup for latest data, archive for historical analysis

### New Schema

```sql
-- Main cache table (always has LATEST WiGLE data for each BSSID)
CREATE TABLE app.wigle_api_networks (
    wigle_network_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL UNIQUE,

    -- Network metadata (from Alpha v3 root level)
    ssid TEXT,
    network_type TEXT,  -- 'infra', 'adhoc', etc
    encryption TEXT,
    channel INTEGER,
    frequency INTEGER,

    -- Trilaterated position
    trilaterated_lat DOUBLE PRECISION,
    trilaterated_lon DOUBLE PRECISION,
    best_cluster_qos INTEGER,

    -- Temporal bounds
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    last_update TIMESTAMP,

    -- Reverse geocoding
    street_address JSONB,  -- {road, housenumber, city, region, country, postalcode}

    -- Raw API response for reference
    raw_api_response JSONB,

    -- ShadowCheck metadata
    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    query_snapshot_id BIGINT REFERENCES app.wigle_query_snapshots(snapshot_id),

    CONSTRAINT valid_coordinates CHECK (
        trilaterated_lat BETWEEN -90 AND 90
        AND trilaterated_lon BETWEEN -180 AND 180
    )
);

CREATE INDEX idx_wigle_networks_bssid ON app.wigle_api_networks(bssid);
CREATE INDEX idx_wigle_networks_query_time ON app.wigle_api_networks(query_timestamp);

-- Location clusters table (SSID temporal tracking)
CREATE TABLE app.wigle_location_clusters (
    cluster_id BIGSERIAL PRIMARY KEY,
    wigle_network_id BIGINT NOT NULL REFERENCES app.wigle_api_networks(wigle_network_id) ON DELETE CASCADE,

    -- Cluster metadata
    cluster_ssid TEXT,  -- SSID observed at this cluster
    centroid_lat DOUBLE PRECISION NOT NULL,
    centroid_lon DOUBLE PRECISION NOT NULL,
    cluster_score INTEGER,
    days_observed_count INTEGER,

    -- Temporal bounds for this SSID
    min_last_update TIMESTAMP,
    max_last_update TIMESTAMP,

    -- Observation count
    location_count INTEGER DEFAULT 0,

    CONSTRAINT valid_cluster_coords CHECK (
        centroid_lat BETWEEN -90 AND 90
        AND centroid_lon BETWEEN -180 AND 180
    )
);

CREATE INDEX idx_wigle_clusters_network ON app.wigle_location_clusters(wigle_network_id);
CREATE INDEX idx_wigle_clusters_ssid ON app.wigle_location_clusters(cluster_ssid);

-- Individual observations table (all location data points)
CREATE TABLE app.wigle_locations (
    location_id BIGSERIAL PRIMARY KEY,
    cluster_id BIGINT NOT NULL REFERENCES app.wigle_location_clusters(cluster_id) ON DELETE CASCADE,
    wigle_network_id BIGINT NOT NULL REFERENCES app.wigle_api_networks(wigle_network_id) ON DELETE CASCADE,

    -- Location data
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,

    -- Temporal data
    observation_time TIMESTAMP,
    last_update TIMESTAMP,
    month_bucket TEXT,  -- '202406' for aggregation

    -- Network state at this observation
    ssid TEXT,
    signal_dbm INTEGER,
    noise INTEGER,
    snr INTEGER,
    channel INTEGER,
    frequency INTEGER,
    encryption_value TEXT,

    -- WiGLE metadata
    wigle_net_id TEXT,  -- WiGLE's internal ID

    CONSTRAINT valid_location_coords CHECK (
        lat BETWEEN -90 AND 90
        AND lon BETWEEN -180 AND 180
    )
);

CREATE INDEX idx_wigle_locations_cluster ON app.wigle_locations(cluster_id);
CREATE INDEX idx_wigle_locations_network ON app.wigle_locations(wigle_network_id);
CREATE INDEX idx_wigle_locations_coords ON app.wigle_locations USING GIST(
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)
);
CREATE INDEX idx_wigle_locations_time ON app.wigle_locations(observation_time);
CREATE INDEX idx_wigle_locations_ssid ON app.wigle_locations(ssid);

-- Query snapshot history (for auditing and rollback)
CREATE TABLE app.wigle_query_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    query_type TEXT,  -- 'network_detail', 'search', 'bulk_refresh'
    bssids_updated TEXT[],
    networks_updated INTEGER,
    locations_added INTEGER,
    api_credits_used INTEGER,
    initiated_by TEXT,  -- 'pipeline', 'user:admin', 'cron'
    notes TEXT
);

-- Historical archive (snapshots older than 30 days)
CREATE TABLE app.wigle_networks_archive (
    LIKE app.wigle_api_networks INCLUDING ALL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to archive old data
CREATE OR REPLACE FUNCTION app.archive_old_wigle_data(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE(networks_archived INTEGER, locations_archived INTEGER) AS $$
DECLARE
    cutoff_date TIMESTAMP WITH TIME ZONE;
    nets_archived INTEGER := 0;
    locs_archived INTEGER := 0;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;

    -- Archive networks that have been replaced
    WITH archived AS (
        INSERT INTO app.wigle_networks_archive
        SELECT n.*, NOW()
        FROM app.wigle_api_networks n
        WHERE n.query_timestamp < cutoff_date
        RETURNING wigle_network_id
    )
    SELECT COUNT(*) INTO nets_archived FROM archived;

    -- Delete archived networks (CASCADE will delete clusters and locations)
    DELETE FROM app.wigle_api_networks
    WHERE query_timestamp < cutoff_date;

    GET DIAGNOSTICS locs_archived = ROW_COUNT;

    RETURN QUERY SELECT nets_archived, locs_archived;
END;
$$ LANGUAGE plpgsql;
```

---

## Replace Strategy

### When WiGLE API Returns New Data

```typescript
// Pseudocode for pipeline that fetches from WiGLE
async function refreshWiGLENetworkData(bssid: string) {
    const apiResponse = await wigleAPI.getNetworkDetail(bssid);

    await db.transaction(async (trx) => {
        // 1. Create snapshot record
        const snapshot = await trx('wigle_query_snapshots').insert({
            query_type: 'network_detail',
            bssids_updated: [bssid],
            initiated_by: 'pipeline'
        }).returning('snapshot_id');

        // 2. REPLACE (upsert) network metadata
        const network = await trx('wigle_api_networks')
            .insert({
                bssid: apiResponse.networkId,
                ssid: apiResponse.name,
                trilaterated_lat: apiResponse.trilateratedLatitude,
                trilaterated_lon: apiResponse.trilateratedLongitude,
                best_cluster_qos: apiResponse.bestClusterWiGLEQoS,
                first_seen: apiResponse.firstSeen,
                last_seen: apiResponse.lastSeen,
                street_address: apiResponse.streetAddress,
                raw_api_response: apiResponse,
                query_snapshot_id: snapshot.snapshot_id
            })
            .onConflict('bssid')
            .merge()  // REPLACE old data with new
            .returning('wigle_network_id');

        // 3. DELETE old clusters and locations (CASCADE handles this)
        await trx('wigle_location_clusters')
            .where('wigle_network_id', network.wigle_network_id)
            .delete();

        // 4. INSERT new clusters
        for (const cluster of apiResponse.locationClusters) {
            const clusterRecord = await trx('wigle_location_clusters').insert({
                wigle_network_id: network.wigle_network_id,
                cluster_ssid: cluster.clusterSsid,
                centroid_lat: cluster.centroidLatitude,
                centroid_lon: cluster.centroidLongitude,
                cluster_score: cluster.score,
                days_observed_count: cluster.daysObservedCount,
                min_last_update: cluster.minLastUpdate,
                max_last_update: cluster.maxLastUpdate,
                location_count: cluster.locations.length
            }).returning('cluster_id');

            // 5. INSERT all location observations
            const locations = cluster.locations.map(loc => ({
                cluster_id: clusterRecord.cluster_id,
                wigle_network_id: network.wigle_network_id,
                lat: loc.latitude,
                lon: loc.longitude,
                altitude: loc.alt,
                accuracy: loc.accuracy,
                observation_time: loc.time,
                last_update: loc.lastupdt,
                month_bucket: loc.month,
                ssid: loc.ssid,
                signal_dbm: loc.signal,
                noise: loc.noise,
                snr: loc.snr,
                channel: loc.channel,
                frequency: loc.frequency,
                encryption_value: loc.encryptionValue,
                wigle_net_id: loc.netId
            }));

            await trx('wigle_locations').insert(locations);
        }

        // 6. Update enrichment queue status
        await trx('bssid_enrichment_queue')
            .where('bssid', bssid)
            .update({
                status: 'completed',
                enriched_at: new Date()
            });
    });
}
```

---

## API Endpoint: Alpha v3 Parity

```typescript
// GET /api/v3/network/:bssid/detail
router.get('/network/:bssid/detail', async (req, res) => {
    const { bssid } = req.params;

    const network = await db('wigle_api_networks')
        .where('bssid', bssid.toUpperCase())
        .first();

    if (!network) {
        return res.status(404).json({
            ok: false,
            error: 'Network not found in WiGLE cache'
        });
    }

    const clusters = await db('wigle_location_clusters')
        .where('wigle_network_id', network.wigle_network_id)
        .orderBy('cluster_score', 'desc');

    const locationClusters = await Promise.all(
        clusters.map(async (cluster) => {
            const locations = await db('wigle_locations')
                .where('cluster_id', cluster.cluster_id)
                .orderBy('observation_time', 'asc');

            return {
                centroidLatitude: cluster.centroid_lat,
                centroidLongitude: cluster.centroid_lon,
                clusterSsid: cluster.cluster_ssid,
                minLastUpdate: cluster.min_last_update,
                maxLastUpdate: cluster.max_last_update,
                daysObservedCount: cluster.days_observed_count,
                score: cluster.cluster_score,
                locations: locations.map(loc => ({
                    latitude: loc.lat,
                    longitude: loc.lon,
                    alt: loc.altitude,
                    accuracy: loc.accuracy,
                    time: loc.observation_time,
                    lastupdt: loc.last_update,
                    month: loc.month_bucket,
                    ssid: loc.ssid,
                    signal: loc.signal_dbm,
                    noise: loc.noise,
                    snr: loc.snr,
                    channel: loc.channel,
                    frequency: loc.frequency,
                    encryptionValue: loc.encryption_value,
                    netId: loc.wigle_net_id
                }))
            };
        })
    );

    return res.json({
        networkId: network.bssid,
        trilateratedLatitude: network.trilaterated_lat,
        trilateratedLongitude: network.trilaterated_lon,
        bestClusterWiGLEQoS: network.best_cluster_qos,
        firstSeen: network.first_seen,
        lastSeen: network.last_seen,
        lastUpdate: network.last_update,
        streetAddress: network.street_address,
        name: network.ssid,
        type: network.network_type,
        encryption: network.encryption,
        channel: network.channel,
        locationClusters
    });
});
```

---

## Migration Plan

### Phase 1: Create New Schema
```bash
psql -h 127.0.0.1 -p 5432 -U shadowcheck_user -d shadowcheck -f schema/wigle_api_cache_v2.sql
```

### Phase 2: Migrate Existing Data
```sql
-- Migrate networks_staging → wigle_api_networks
INSERT INTO app.wigle_api_networks (
    bssid, ssid, network_type, encryption, channel, frequency,
    trilaterated_lat, trilaterated_lon, best_cluster_qos,
    first_seen, last_seen, last_update, street_address,
    query_timestamp
)
SELECT
    bssid, ssid, type, capabilities, channel, frequency,
    trilat, trilong, qos,
    firsttime, lasttime, lastupdt,
    jsonb_build_object('road', road, 'housenumber', housenumber,
                       'city', city, 'region', region, 'country', country,
                       'postalcode', postalcode),
    query_timestamp
FROM app.wigle_api_networks_staging
ON CONFLICT (bssid) DO UPDATE SET
    query_timestamp = EXCLUDED.query_timestamp;

-- Migrate locations_staging → wigle_locations (without clusters, for now)
-- We need to re-fetch from WiGLE API to get cluster data
```

### Phase 3: Update Pipelines
- Update WiGLE fetch pipeline to use new schema
- Implement replace-on-refresh logic
- Add snapshot tracking

### Phase 4: Deprecate Old Tables
```sql
-- Rename old tables (don't delete yet, keep for rollback)
ALTER TABLE app.wigle_api_networks_staging RENAME TO wigle_api_networks_staging_deprecated;
ALTER TABLE app.wigle_api_locations_staging RENAME TO wigle_api_locations_staging_deprecated;
```

### Phase 5: Archive Cron Job
```bash
# Add to cron: Archive data older than 30 days
0 2 * * * psql -h 127.0.0.1 -p 5432 -U shadowcheck_user -d shadowcheck -c "SELECT app.archive_old_wigle_data(30);"
```

---

## Benefits of This Approach

### 1. SSID Temporal Tracking
- **Before**: Only current SSID
- **After**: Full SSID history with location clusters per SSID
- **Use Case**: Detect mobile hotspots (CA:99:B2:1E:55:13 with Delta3G → Whitman1968)

### 2. Always Fresh Data
- **Before**: Stale data accumulates, never refreshed
- **After**: Each WiGLE query replaces old data with latest
- **Use Case**: Network moves, SSID changes, encryption updates

### 3. Historical Analysis
- **Before**: No history, lost after refresh
- **After**: 30-day snapshot archive for forensics
- **Use Case**: "When did this network first appear in my area?"

### 4. Alpha v3 API Parity
- **Before**: Basic network metadata
- **After**: Full location clusters, SSID timeline, reverse geocoding
- **Use Case**: Drop-in replacement for WiGLE Alpha v3 queries

### 5. Efficient Storage
- **Before**: Duplicate observations, no deduplication
- **After**: Structured clusters, automatic cleanup
- **Use Case**: Scale to thousands of networks without bloat

---

## Testing Strategy

### Test Case 1: Replace Existing Network
```bash
# Initial fetch
curl -X POST http://localhost:5000/api/v1/wigle/tag \
  -H "Content-Type: application/json" \
  -d '{"bssids": ["CA:99:B2:1E:55:13"]}'

# Verify data stored
curl http://localhost:5000/api/v3/network/CA:99:B2:1E:55:13/detail

# Wait 24 hours, re-fetch (should REPLACE old data)
curl -X POST http://localhost:5000/api/v1/wigle/tag \
  -H "Content-Type: application/json" \
  -d '{"bssids": ["CA:99:B2:1E:55:13"]}'

# Verify: old locations deleted, new locations added
# Should have DIFFERENT observation counts if network moved
```

### Test Case 2: SSID Change Detection
```bash
# Check cluster count and SSIDs
SELECT
    cluster_ssid,
    COUNT(*) as observations,
    days_observed_count
FROM app.wigle_location_clusters wlc
JOIN app.wigle_api_networks wan ON wlc.wigle_network_id = wan.wigle_network_id
WHERE wan.bssid = 'CA:99:B2:1E:55:13'
GROUP BY cluster_ssid, days_observed_count;

# Expected:
# Delta3G       | 804 | 67
# Whitman1968   | 133 | 1
```

### Test Case 3: Archive Function
```sql
-- Archive data older than 1 day (for testing)
SELECT * FROM app.archive_old_wigle_data(1);

-- Verify archived data
SELECT COUNT(*) FROM app.wigle_networks_archive;
```

---

## Next Steps

1. ✅ Review this strategy document
2. ⬜ Create SQL migration script (`server/db/migrations/009_wigle_cache_v2.sql`)
3. ⬜ Build TypeScript pipeline for replace-on-refresh
4. ⬜ Implement `/api/v3/network/:bssid/detail` endpoint
5. ⬜ Create Mapbox visualization with SSID timeline
6. ⬜ Add archive cron job
7. ⬜ Test with CA:99:B2:1E:55:13 (the mobile hotspot)
8. ⬜ Deprecate old staging tables

---

**This gives us WiGLE Alpha v3 parity with SSID temporal tracking. INTEL GOLD.**
