# WiGLE Alpha v3 Implementation - FINAL (Simplified)

**Date**: 2025-11-01
**Approach**: Store raw observations, cluster dynamically at query time
**Status**: ✅ **COMPLETE AND TESTED**

---

## 🎯 The Right Way: Raw Observations + Dynamic Clustering

### Design Philosophy

**Store like `locations_legacy`, query like Alpha v3**

- ✅ Each observation = one row (GPS + SSID + signal)
- ✅ No pre-clustering at import time
- ✅ SSID clustering happens at **query time** via SQL views
- ✅ Flexible: can cluster by SSID, time, location, or any combination

---

## 📊 Schema (Simplified)

### Table 1: `app.wigle_alpha_v3_networks`

**Purpose**: Store top-level network metadata from Alpha v3 API
**Pattern**: Like `networks_legacy` but from Alpha v3

```sql
CREATE TABLE app.wigle_alpha_v3_networks (
    wigle_network_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,

    -- Metadata
    ssid TEXT,
    type TEXT,
    encryption TEXT,
    channel INTEGER,
    frequency INTEGER,

    -- Trilaterated position (from Alpha v3)
    trilaterated_lat DOUBLE PRECISION,
    trilaterated_lon DOUBLE PRECISION,
    best_cluster_qos INTEGER,

    -- Temporal bounds
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,

    -- Street address
    street_address JSONB,

    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 2: `app.wigle_alpha_v3_observations`

**Purpose**: Store ALL individual GPS observations with SSID
**Pattern**: Like `locations_legacy` but with SSID preserved per observation

```sql
CREATE TABLE app.wigle_alpha_v3_observations (
    observation_id BIGSERIAL PRIMARY KEY,
    bssid TEXT NOT NULL,

    -- Location
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,

    -- Time
    observation_time TIMESTAMP,
    last_update TIMESTAMP,
    month_bucket TEXT,

    -- Network state (SSID can change!)
    ssid TEXT,  -- KEY: SSID per observation, not per network!

    -- Signal
    signal_dbm INTEGER,
    noise INTEGER,
    snr INTEGER,

    -- Radio
    channel INTEGER,
    frequency INTEGER,
    encryption_value TEXT,

    query_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Insight**: We store 937 rows for CA:99:B2:1E:55:13, each with its observed SSID. No clustering at storage time!

### View: `app.wigle_alpha_v3_ssid_clusters`

**Purpose**: Dynamic SSID clustering at query time
**Pattern**: Aggregate raw observations by BSSID + SSID

```sql
CREATE VIEW app.wigle_alpha_v3_ssid_clusters AS
WITH ssid_observation_stats AS (
    SELECT
        o.bssid,
        o.ssid,
        COUNT(*) as observation_count,
        MIN(o.observation_time) as first_seen,
        MAX(o.observation_time) as last_seen,
        COUNT(DISTINCT DATE(o.observation_time)) as days_observed,
        AVG(o.lat) as centroid_lat,
        AVG(o.lon) as centroid_lon,
        MAX(ST_Distance(...)) as max_distance_from_home_km,
        AVG(o.signal_dbm) as avg_signal
    FROM app.wigle_alpha_v3_observations o
    GROUP BY o.bssid, o.ssid
)
SELECT
    *,
    CASE
        WHEN max_distance_from_home_km > 50 THEN 'mobile_hotspot'
        WHEN max_distance_from_home_km > 5 THEN 'mobile'
        WHEN max_distance_from_home_km < 1 THEN 'stationary'
        ELSE 'local'
    END as mobility_pattern,
    CASE
        WHEN max_distance_from_home_km >= 50 THEN 'EXTREME'
        WHEN max_distance_from_home_km >= 10 THEN 'CRITICAL'
        WHEN max_distance_from_home_km >= 5 THEN 'HIGH'
        ELSE 'LOW'
    END as threat_level
FROM ssid_observation_stats;
```

---

## 🚀 Import Function

```sql
CREATE FUNCTION app.import_wigle_alpha_v3_response(
    p_bssid TEXT,
    p_alpha_v3_json JSONB
)
RETURNS TABLE(networks_imported INTEGER, observations_imported INTEGER);
```

**What it does**:
1. Extracts root-level network metadata → `wigle_alpha_v3_networks`
2. Flattens ALL location clusters → individual rows in `wigle_alpha_v3_observations`
3. No clustering logic - just flatten and insert
4. Preserves SSID per observation (not per network!)

---

## 🧪 Test Results

### Import CA:99:B2:1E:55:13

```sql
SELECT * FROM app.import_wigle_alpha_v3_response(
    'CA:99:B2:1E:55:13',
    '<alpha_v3_json>'::JSONB
);
```

**Result**:
```
 networks_imported | observations_imported
-------------------+-----------------------
                 1 |                   937
```

### Verify Raw Data

```sql
SELECT
    COUNT(*) as total_observations,
    COUNT(DISTINCT ssid) as unique_ssids,
    COUNT(DISTINCT bssid) as unique_bssids
FROM app.wigle_alpha_v3_observations;
```

**Result**:
```
 total_observations | unique_ssids | unique_bssids
--------------------+--------------+---------------
                937 |            2 |             1
```

✅ **937 individual observations stored as raw data**

### Dynamic SSID Clustering (Query Time!)

```sql
SELECT
    ssid,
    observation_count,
    days_observed,
    max_distance_from_home_km,
    mobility_pattern,
    threat_level
FROM app.wigle_alpha_v3_ssid_clusters
WHERE bssid = 'CA:99:B2:1E:55:13'
ORDER BY observation_count DESC;
```

**Result**:
```
    ssid     | observation_count | days_observed | max_distance_from_home_km | mobility_pattern | threat_level
-------------+-------------------+---------------+---------------------------+------------------+--------------
 Delta3G     |               476 |            37 |                      0.28 | stationary       | LOW
 Whitman1968 |               461 |            30 |                    125.18 | mobile_hotspot   | EXTREME
```

✅ **Dynamic clustering reveals MAC spoofing pattern!**

---

## 🎯 Why This Approach is Superior

### ✅ Advantages

1. **Simple storage model**: One row per observation (like `locations_legacy`)
2. **Flexible queries**: Cluster by SSID, time, location, or any combination
3. **No data loss**: ALL observations preserved exactly as received
4. **Dynamic analysis**: Change clustering logic without re-importing data
5. **Future-proof**: Add new aggregations without schema changes

### 🚫 Previous Approach (Rejected)

- Pre-computed clusters at import time
- Hard-coded clustering logic in import function
- Required 3 tables (networks, clusters, observations)
- Inflexible: can't change clustering without re-import

---

## 📡 API Endpoint (To Be Implemented)

```typescript
// GET /api/v3/network/:bssid/detail
router.get('/network/:bssid/detail', async (req, res) => {
  const { bssid } = req.params;

  // Get network metadata
  const network = await db('wigle_alpha_v3_networks')
    .where('bssid', bssid.toUpperCase())
    .first();

  // Get SSID clusters (dynamic aggregation!)
  const ssidClusters = await db('wigle_alpha_v3_ssid_clusters')
    .where('bssid', bssid.toUpperCase())
    .orderBy('observation_count', 'desc');

  // Get all observations for each SSID
  const locationClusters = await Promise.all(
    ssidClusters.map(async (cluster) => {
      const observations = await db('wigle_alpha_v3_observations')
        .where({ bssid: bssid.toUpperCase(), ssid: cluster.ssid })
        .orderBy('observation_time', 'asc');

      return {
        clusterSsid: cluster.ssid,
        centroidLatitude: cluster.centroid_lat,
        centroidLongitude: cluster.centroid_lon,
        daysObservedCount: cluster.days_observed,
        mobilityPattern: cluster.mobility_pattern,
        threatLevel: cluster.threat_level,
        locations: observations.map(obs => ({
          latitude: obs.lat,
          longitude: obs.lon,
          alt: obs.altitude,
          accuracy: obs.accuracy,
          time: obs.observation_time,
          ssid: obs.ssid,
          signal: obs.signal_dbm,
          // ... other fields
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
    streetAddress: network.street_address,
    locationClusters,  // Dynamic SSID clusters!
    _meta: {
      cached_at: network.query_timestamp,
      source: 'shadowcheck_alpha_v3_dynamic_clustering'
    }
  });
});
```

---

## 🔍 Query Examples

### Find all networks with SSID rotation (potential spoofing)

```sql
SELECT
    bssid,
    COUNT(DISTINCT ssid) as unique_ssids,
    array_agg(DISTINCT ssid) as ssids,
    MAX(max_distance_from_home_km) as max_distance_km
FROM app.wigle_alpha_v3_ssid_clusters
GROUP BY bssid
HAVING COUNT(DISTINCT ssid) > 1
ORDER BY unique_ssids DESC;
```

### Find mobile hotspots (high mobility)

```sql
SELECT
    bssid,
    ssid,
    observation_count,
    max_distance_from_home_km,
    threat_level
FROM app.wigle_alpha_v3_ssid_clusters
WHERE mobility_pattern = 'mobile_hotspot'
ORDER BY max_distance_from_home_km DESC;
```

### Timeline of SSID changes for a MAC

```sql
SELECT
    ssid,
    first_seen::date,
    last_seen::date,
    observation_count,
    max_distance_from_home_km::NUMERIC(10,2) as max_distance_km
FROM app.wigle_alpha_v3_ssid_clusters
WHERE bssid = 'CA:99:B2:1E:55:13'
ORDER BY first_seen;
```

---

## 📁 Files

1. `/home/nunya/shadowcheck/schema/009_wigle_alpha_v3_simple.sql` - Migration
2. `/home/nunya/shadowcheck/response_1762039938542.json` - Test data

---

## 🎖 Success Criteria

- ✅ Schema migrated successfully
- ✅ 937 observations imported as individual rows
- ✅ Dynamic SSID clustering works (2 SSIDs detected)
- ✅ MAC spoofing pattern revealed (Delta3G vs Whitman1968)
- ✅ Threat levels calculated correctly (EXTREME for mobile hotspot)
- ✅ Storage model matches `locations_legacy` pattern
- ✅ No pre-computed clusters (all dynamic)

---

## 🚀 Next Steps

1. ✅ Schema complete
2. ✅ Import function tested
3. ⏳ Update API endpoint to use new schema
4. ⏳ Frontend integration with dynamic clustering
5. ⏳ Mapbox visualization with SSID timeline
6. ⏳ Automated WiGLE API fetch pipeline

---

**This is the right approach: store raw, aggregate on demand. INTEL GOLD achieved with clean, flexible architecture.**
