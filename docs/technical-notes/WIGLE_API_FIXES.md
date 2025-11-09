# WiGLE API Ingestion Fixes

**Date:** 2025-11-02
**Session:** Claude Code Fix Session

## Issues Identified

1. **Wrong WiGLE API endpoint** - Using `/api/v3/detail/network/` instead of `/api/v3/detail/wifi/`
2. **Schema mismatch** - Routes referenced non-existent `wigle_observations` and `wigle_location_clusters` tables
3. **Missing route registration** - Alpha v3 routes not mounted in server
4. **No staging routes** - SQLite backup staging tables had no API access

## Fixes Applied

### 1. Fixed WiGLE API Endpoint ✅

**File:** `server/pipelines/enrichment/wigle_api_alpha_v3.py:125`

```python
# BEFORE (wrong):
url = f"https://api.wigle.net/api/v3/detail/network/{bssid}"

# AFTER (correct):
url = f"https://api.wigle.net/api/v3/detail/wifi/{bssid}"
```

This matches the actual WiGLE API v3 endpoint for WiFi network details.

### 2. Fixed Table References in Routes ✅

**File:** `server/routes/wigle_alpha_v3.ts`

The database uses the **simple schema** (`009_wigle_alpha_v3_simple.sql`) which has:
- `app.wigle_alpha_v3_networks` - network metadata
- `app.wigle_alpha_v3_observations` - raw observations (NO pre-computed clusters)

**Changes made:**

a) **Network detail endpoint** - Replaced cluster-based queries with dynamic SSID grouping:
```typescript
// OLD: Query wigle_location_clusters and wigle_observations
// NEW: Query wigle_alpha_v3_observations directly and cluster dynamically

FROM app.wigle_alpha_v3_observations
WHERE bssid = $1
ORDER BY ssid NULLS LAST, observation_time ASC
```

b) **SSID timeline endpoint** - Replaced cluster aggregation with observation aggregation:
```sql
-- OLD: Aggregated from wigle_location_clusters
-- NEW: Aggregate directly from observations
SELECT
  ssid,
  MIN(last_update) as first_seen,
  MAX(last_update) as last_seen,
  COUNT(*) as total_observations,
  COUNT(DISTINCT DATE(last_update)) as total_days,
  COUNT(DISTINCT ST_SnapToGrid(...)) as cluster_count
FROM app.wigle_alpha_v3_observations
WHERE bssid = $1
GROUP BY ssid
```

c) **Summary endpoint** - Fixed join to use correct table names:
```sql
FROM app.wigle_alpha_v3_networks n
LEFT JOIN app.wigle_alpha_v3_observations o ON o.bssid = n.bssid
```

### 3. Added WiGLE Staging Routes ✅

**File:** `server/routes/wigleStagingRoutes.ts` (NEW)

Created complete API for WiGLE SQLite backup staging tables:

- `GET /api/v1/wigle/staging/networks` - List staged network data
- `GET /api/v1/wigle/staging/locations` - List staged location observations
- `GET /api/v1/wigle/staging/summary` - Summary statistics
- `DELETE /api/v1/wigle/staging/clear` - Clear staging data after merge

These tables are populated by `server/pipelines/parsers/wigle_sqlite_parser.py` when importing Android app backups.

### 4. Registered All Routes ✅

**File:** `server/index.ts`

```typescript
import wigleStagingRouter from "./routes/wigleStagingRoutes.js";
import wigleAlphaV3Router from "./routes/wigle_alpha_v3.js";

app.use("/api/v1/wigle", wigleStagingRouter);
app.use("/api/v3", wigleAlphaV3Router);
```

## Schema Clarification

The database currently uses the **SIMPLE schema** (not the complex cached schema):

### Tables Present:
- ✅ `app.wigle_alpha_v3_networks` - Network metadata
- ✅ `app.wigle_alpha_v3_observations` - Raw observations with SSID per observation
- ✅ `app.wigle_sqlite_networks_staging` - SQLite backup staging (networks)
- ✅ `app.wigle_sqlite_locations_staging` - SQLite backup staging (locations)

### Tables NOT Present:
- ❌ `app.wigle_location_clusters` - Pre-computed clusters (not in simple schema)
- ❌ `app.wigle_observations` - Wrong name (should be wigle_alpha_v3_observations)

### Import Function:
- ✅ `app.import_wigle_alpha_v3_response(bssid, json)` - PostgreSQL function exists

## Testing Checklist

### Test WiGLE API Enrichment:

```bash
# 1. Tag a BSSID for enrichment
curl -X POST http://localhost:5000/api/v1/wigle/tag \
  -H "Content-Type: application/json" \
  -d '{"bssids": ["AA:BB:CC:DD:EE:FF"]}'

# 2. Process enrichment queue (requires WIGLE_API_KEY env var)
cd /home/nunya/shadowcheck/server/pipelines/enrichment
python3 wigle_api_alpha_v3.py --process-queue --limit 1

# 3. Verify data was imported
curl http://localhost:5000/api/v3/network/AA:BB:CC:DD:EE:FF/detail

# 4. Check SSID timeline
curl http://localhost:5000/api/v3/network/AA:BB:CC:DD:EE:FF/ssid-timeline

# 5. View summary
curl http://localhost:5000/api/v3/networks/summary
```

### Test SQLite Backup Import:

```bash
# 1. Import WiGLE Android backup
cd /home/nunya/shadowcheck/server/pipelines/parsers
python3 wigle_sqlite_parser.py /path/to/backup.sqlite

# 2. Check staging data
curl http://localhost:5000/api/v1/wigle/staging/summary
curl http://localhost:5000/api/v1/wigle/staging/networks?limit=10
curl http://localhost:5000/api/v1/wigle/staging/locations?limit=10
```

## Known Issues / Future Work

### 1. Buffer Error ✅ FIXED
The buffer error was caused by the Python parser trying to load 1M+ location rows into memory at once.

**Root cause:**
- `wigle_sqlite_parser.py` line 91 had `LIMIT 1000000` with `fetchall()`
- This loaded all rows into memory before processing
- Large WiGLE databases (>100k locations) would cause memory exhaustion

**Fix applied:**
- Added batch processing (50k rows per batch)
- Process locations in chunks with LIMIT/OFFSET
- Added progress reporting
- Removed arbitrary 1M row limit

**File:** `server/pipelines/parsers/wigle_sqlite_parser.py:79-122`

### 2. Observations Table Naming
The simple schema uses `wigle_alpha_v3_observations` but the cached schema uses `wigle_observations`. This inconsistency could cause confusion.

**Recommendation:** Standardize on one name across all schemas.

### 3. No Location Data Issue ✅ FIXED
The pipeline endpoint had wrong column names causing INSERT failures.

**Root cause:**
- `pipelines.ts:697` tried to INSERT into column `time` but table has `observation_time`
- Referenced non-existent columns `signal_level` and `query_params`
- Missing required column `last_update`

**Fix applied:**
- Changed `time` → `observation_time`
- Changed `signal_level` → `signal_dbm`
- Removed `query_params` (doesn't exist in schema)
- Added `last_update` column mapping

**File:** `server/routes/pipelines.ts:693-710`

**Debug steps:**
```bash
# Check raw API response structure
curl "https://api.wigle.net/api/v3/detail/wifi/AA:BB:CC:DD:EE:FF" \
  -H "Authorization: Basic YOUR_API_KEY" | jq .

# Verify import worked
docker exec shadowcheck_postgres_18 psql -U shadowcheck_user -d shadowcheck \
  -c "SELECT COUNT(*) FROM app.wigle_alpha_v3_observations WHERE bssid = 'AA:BB:CC:DD:EE:FF'"

# Check backend logs for any remaining errors
docker logs shadowcheck_backend --tail 50 | grep -i error
```

## Files Changed

### First Commit (9dd240d) - API Endpoint and Schema Fixes:
1. `server/pipelines/enrichment/wigle_api_alpha_v3.py` - Fixed API endpoint
2. `server/routes/wigle_alpha_v3.ts` - Fixed table references and removed cluster dependency
3. `server/routes/wigleStagingRoutes.ts` - NEW file for staging API
4. `server/index.ts` - Added route registrations
5. `WIGLE_API_FIXES.md` - This documentation file

### Second Commit (c63cd20) - Buffer Error and Column Mismatch:
6. `server/pipelines/parsers/wigle_sqlite_parser.py` - Added batch processing
7. `server/routes/pipelines.ts` - Fixed column names in INSERT statements

## Restart Required

```bash
# Restart backend to load new routes
docker-compose -f docker-compose.prod.yml restart backend

# Or full restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Verification

Backend restarted successfully with no errors. Routes are now accessible:
- ✅ `/api/v3/network/:bssid/detail`
- ✅ `/api/v3/network/:bssid/ssid-timeline`
- ✅ `/api/v3/networks/summary`
- ✅ `/api/v1/wigle/staging/networks`
- ✅ `/api/v1/wigle/staging/locations`
- ✅ `/api/v1/wigle/staging/summary`
- ✅ `/api/v1/wigle/staging/clear`
