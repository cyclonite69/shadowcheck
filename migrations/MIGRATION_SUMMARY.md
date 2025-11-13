# WiGLE SQLite to Legacy Tables Migration Summary

**Date:** 2025-11-09
**Status:** ✅ **COMPLETED SUCCESSFULLY**

## Overview

Successfully migrated data from WiGLE SQLite staging tables to replace the legacy network and location tables with fresh, high-quality WiGLE data.

## Migration Statistics

### Networks
| Metric | Before (Legacy) | After (WiGLE) | Change |
|--------|----------------|---------------|---------|
| Total Records | 140,054 | 170,095 | +30,041 (+21.4%) |
| Unique BSSIDs | 140,054 | 170,095 | +30,041 |

### Locations/Observations
| Metric | Before (Legacy) | After (WiGLE) | Change |
|--------|----------------|---------------|---------|
| Total Records | 436,622 | 543,659 | +107,037 (+24.5%) |
| Unique BSSIDs | 132,529 | 162,799 | +30,270 |

### Data Quality Improvements
- ✅ **30,041 new networks** discovered
- ✅ **107,037 additional location observations** for improved accuracy
- ✅ **Fresh timestamps** - latest observation: 2025-01-09 (timestamp: 1762704829000)
- ✅ **Better spatial coverage** with 543,659 GPS-verified observations

## What Was Migrated

### Source Tables → Destination Tables
1. `app.wigle_sqlite_networks` (170,095 records) → `app.networks_legacy` (170,095 records)
2. `app.wigle_sqlite_locations_staging` (543,659 records) → `app.locations_legacy` (543,659 records)

### Schema Transformations

#### Networks Migration
```sql
wigle_sqlite_networks              →  networks_legacy
----------------------------------------
network_id                         →  unified_id
bssid                              →  bssid
ssid                               →  ssid
frequency                          →  frequency
capabilities                       →  capabilities
type                               →  type
bestlevel                          →  bestlevel
bestlat                            →  bestlat
bestlon                            →  bestlon
last_seen (timestamp)              →  lasttime (epoch milliseconds)
lastlat                            →  lastlat
lastlon                            →  lastlon
```

#### Locations Migration
```sql
wigle_sqlite_locations_staging     →  locations_legacy
----------------------------------------
unified_id                         →  unified_id
source_id                          →  source_id
_id                                →  _id
bssid                              →  bssid
level                              →  level
lat                                →  lat
lon                                →  lon
altitude                           →  altitude
accuracy                           →  accuracy
time                               →  time
external                           →  external
mfgrid                             →  mfgrid
```

## Indexes Recreated

### networks_legacy Indexes
- ✅ `idx_networks_legacy_location` - GIST spatial index for geography queries
- ✅ `idx_networks_bssid` - B-tree index for BSSID lookups
- ✅ `idx_networks_bestlevel` - B-tree index for signal strength queries
- ✅ `idx_networks_capabilities` - B-tree index for security/encryption filtering
- ✅ `idx_networks_type` - B-tree index for radio type filtering
- ✅ `uq_networks_legacy_bssid` - UNIQUE constraint ensuring one record per BSSID

### locations_legacy Indexes
- ✅ `idx_locations_bssid` - B-tree index for BSSID lookups
- ✅ `idx_locations_lat_lon` - GIST spatial index for geography queries
- ✅ `idx_locations_legacy_bssid_time` - Composite index for time-series queries
- ✅ `idx_locations_legacy_coords` - B-tree index for coordinate range queries

## Triggers Recreated

### networks_legacy Triggers
- ✅ `trim_all_text_trigger` - Text normalization before INSERT/UPDATE
- ✅ `t_proactive_alert` - Real-time surveillance threat detection

### locations_legacy Triggers
- ✅ `trim_text_trigger` - Text normalization before INSERT/UPDATE

## Foreign Keys & Constraints

Both tables maintain foreign key relationships to `app.provenance_legacy(id)`:
- `network_source_id_fkey` on networks_legacy
- `location_source_id_fkey` on locations_legacy

## Views Recreated

- ✅ `app.latest_location_per_bssid` - Provides latest GPS observation per network

## Backup Tables

Backup tables were created and are preserved for rollback if needed:

```sql
-- Backup tables (safe to drop after verification)
app.networks_legacy_backup   -- 140,054 records (old data)
app.locations_legacy_backup  -- 436,622 records (old data)
```

### To Drop Backups (After Verification)
```sql
DROP TABLE app.networks_legacy_backup;
DROP TABLE app.locations_legacy_backup;
```

## Verification Queries

### Check Record Counts
```sql
SELECT COUNT(*) FROM app.networks_legacy;   -- Should be 170095
SELECT COUNT(*) FROM app.locations_legacy;  -- Should be 543659
```

### Check Data Freshness
```sql
-- Most recent network observations
SELECT
    MAX(lasttime) as latest_network_observation,
    TO_TIMESTAMP(MAX(lasttime)/1000) as latest_datetime
FROM app.networks_legacy;

-- Most recent location observations
SELECT
    MAX(time) as latest_location_observation,
    TO_TIMESTAMP(MAX(time)/1000) as latest_datetime
FROM app.locations_legacy;
```

### Sample Network Data
```sql
SELECT bssid, ssid, frequency, type, bestlevel
FROM app.networks_legacy
LIMIT 10;
```

### Sample Location Data
```sql
SELECT bssid, lat, lon, level, TO_TIMESTAMP(time/1000) as observed_at
FROM app.locations_legacy
ORDER BY time DESC
LIMIT 10;
```

## Frontend/Backend Impact

### Access Points Page
The `/access-points` page (`AccessPointsPageTsx`) queries:
- `app.locations_legacy` for network observations
- `app.networks_legacy` for network metadata

**Expected behavior after migration:**
- ✅ **More networks visible** - 30,041 additional networks
- ✅ **Better map density** - 107,037 additional observation points
- ✅ **Improved accuracy** - Fresh WiGLE data with verified GPS coordinates
- ✅ **Better signal strength data** - More recent RSSI measurements

### API Endpoints Affected
All endpoints querying legacy tables will now return fresh WiGLE data:
- `GET /api/v1/access-points`
- `GET /api/v1/network/:bssid/observations`
- `GET /api/v1/surveillance/wifi/threats`
- `GET /api/v1/visualize/*`

## Performance Considerations

### Index Analysis
All indexes were recreated and analyzed (`ANALYZE` command run).

### Query Performance
- Spatial queries should perform well with GIST indexes
- BSSID lookups remain fast with B-tree indexes
- Time-series queries optimized with composite indexes

## Rollback Procedure

If issues are discovered, rollback to previous data:

```sql
BEGIN;

-- Drop current data
TRUNCATE TABLE app.locations_legacy RESTART IDENTITY CASCADE;
TRUNCATE TABLE app.networks_legacy RESTART IDENTITY CASCADE;

-- Restore from backup
INSERT INTO app.networks_legacy SELECT * FROM app.networks_legacy_backup;
INSERT INTO app.locations_legacy SELECT * FROM app.locations_legacy_backup;

-- Recreate indexes
REINDEX TABLE app.networks_legacy;
REINDEX TABLE app.locations_legacy;

-- Update statistics
ANALYZE app.networks_legacy;
ANALYZE app.locations_legacy;

COMMIT;
```

## Next Steps

1. ✅ **Test frontend** - Verify /access-points page displays new data correctly
2. ✅ **Test map clustering** - Verify 543K+ observations render efficiently with clustering
3. ✅ **Verify API responses** - Check all API endpoints return expected data
4. ⏳ **Monitor performance** - Watch query execution times with larger dataset
5. ⏳ **Drop backup tables** - After 24-48 hours of successful operation

## Migration Script Location

The migration script is preserved at:
```
/home/nunya/shadowcheck/migrations/migrate_wigle_to_legacy.sql
```

## Notes

- The migration was transactional and atomic - all changes committed successfully
- No data loss occurred - all original data preserved in backup tables
- All indexes, triggers, and constraints were successfully recreated
- The view `app.latest_location_per_bssid` is now available for queries
- Map clustering has been implemented to handle the larger dataset efficiently
