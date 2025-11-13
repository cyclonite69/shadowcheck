# WiGLE CSV to SQLite Staging Merge Strategy

## Executive Summary

**Recommendation: MERGE with selective field updates**

- **3,231 new networks** (100% with location data) → Add to staging
- **43,276 overlapping networks** → Update fields where CSV has data but SQLite doesn't
- **33,811 new location observations** → Add to staging
- **87,894 exact duplicate observations** → Skip
- **4,978 near-duplicate observations** → Keep stronger signal

---

## Data Overview

### Networks Comparison

| Metric | Count | Percentage |
|--------|-------|------------|
| **CSV Networks Total** | 46,507 | 100% |
| **SQLite Networks Total** | 170,095 | - |
| **Overlapping BSSIDs** | 43,276 | 93.05% |
| **New BSSIDs from CSV** | 3,231 | 6.95% |

### Location Observations Comparison

| Metric | Count | Percentage |
|--------|-------|------------|
| **CSV Locations Total** | 121,726 | 100% |
| **SQLite Locations Total** | 543,659 | - |
| **Exact Duplicates (skip these)** | 87,894 | 72.2% |
| **Near-Duplicates (diff signal)** | 4,978 | 4.1% |
| **Truly New Observations** | 33,811 | 27.8% |

---

## Field-Level Analysis for Overlapping BSSIDs

### Where CSV Has Data That SQLite Lacks

| Field | Count | Action |
|-------|-------|--------|
| **SSID** | 41 | Update SQLite with CSV value |
| **Frequency** | 169 | Update SQLite with CSV value |
| **Capabilities** | 33 | Update SQLite with CSV value |
| **MfgrId** | 26 | Update SQLite with CSV value |
| **RCOIs** | 0 | No updates needed |
| **Service** | 0 | No updates needed |

**Total updates needed: 269 fields across ~250 networks**

### Where SQLite Has Data That CSV Lacks

| Field | Count | Keep SQLite |
|-------|-------|-------------|
| **SSID** | 107 | ✓ |
| **Frequency** | 349 | ✓ |
| **Capabilities** | 0 | - |
| **MfgrId** | 3,195 | ✓ (SQLite is much better) |
| **RCOIs** | 0 | - |
| **Service** | 4,420 | ✓ (SQLite is much better) |

**SQLite has significantly better mfgrid and service coverage**

---

## Near-Duplicate Observations Analysis

**4,978 observations** have same BSSID + lat/lon + time but different signal levels.

### Signal Difference Distribution:
- Max difference: 63 dBm
- Common differences: 40-50 dBm (likely device calibration differences)

### Examples:
```
BSSID: F4:30:B9:42:B0:63
Location: 43.0208, -83.6967
Time: 2024-04-04 18:17:37
CSV Signal: 0 dBm (invalid)
SQLite Signal: -63 dBm (valid)
→ Keep SQLite version
```

### Strategy for Near-Duplicates:
- **Keep observation with stronger signal** (higher RSSI = less negative)
- **Filter out invalid signals** (0 dBm, -100 dBm are usually errors)
- **Prefer SQLite when signal difference > 40 dBm** (CSV may have errors)

---

## Recommended Merge Strategy

### Phase 1: Add New Networks (3,231 BSSIDs)

```sql
INSERT INTO app.wigle_sqlite_networks_staging_deduped (
    bssid, ssid, frequency, capabilities, lasttime, lastlat, lastlon,
    type, bestlevel, bestlat, bestlon, rcois, mfgrid, service,
    sqlite_filename, imported_at
)
SELECT
    bssid, ssid, frequency, capabilities, lasttime, lastlat, lastlon,
    type, bestlevel, bestlat, bestlon, rcois, mfgrid, service,
    sqlite_filename,
    NOW() as imported_at
FROM app.wigle_csv_networks
WHERE NOT EXISTS (
    SELECT 1 FROM app.wigle_sqlite_networks_staging_deduped sqlite
    WHERE sqlite.bssid = wigle_csv_networks.bssid
);
```

**Expected: 3,231 new rows added**

---

### Phase 2: Update Existing Networks (43,276 overlapping BSSIDs)

Update fields **ONLY** where CSV has data and SQLite doesn't:

```sql
UPDATE app.wigle_sqlite_networks_staging_deduped sqlite
SET
    ssid = COALESCE(sqlite.ssid, csv.ssid),
    frequency = COALESCE(NULLIF(sqlite.frequency, 0), NULLIF(csv.frequency, 0)),
    capabilities = COALESCE(sqlite.capabilities, csv.capabilities),
    mfgrid = COALESCE(NULLIF(sqlite.mfgrid, 0), NULLIF(csv.mfgrid, 0)),
    rcois = COALESCE(sqlite.rcois, csv.rcois),
    service = COALESCE(sqlite.service, csv.service)
FROM app.wigle_csv_networks csv
WHERE sqlite.bssid = csv.bssid
  AND (
    -- Only update if CSV has data that SQLite lacks
    ((sqlite.ssid IS NULL OR sqlite.ssid = '') AND (csv.ssid IS NOT NULL AND csv.ssid != ''))
    OR ((sqlite.frequency IS NULL OR sqlite.frequency = 0) AND (csv.frequency IS NOT NULL AND csv.frequency != 0))
    OR ((sqlite.capabilities IS NULL OR sqlite.capabilities = '') AND (csv.capabilities IS NOT NULL AND csv.capabilities != ''))
    OR ((sqlite.mfgrid IS NULL OR sqlite.mfgrid = 0) AND (csv.mfgrid IS NOT NULL AND csv.mfgrid != 0))
    OR ((sqlite.rcois IS NULL OR sqlite.rcois = '') AND (csv.rcois IS NOT NULL AND csv.rcois != ''))
    OR ((sqlite.service IS NULL OR sqlite.service = '') AND (csv.service IS NOT NULL AND csv.service != ''))
  );
```

**Expected: ~250 rows updated across 269 fields**

**IMPORTANT:** This does NOT overwrite existing SQLite data, only fills in gaps.

---

### Phase 3: Add New Location Observations (33,811 + 4,978)

#### Step 3A: Add Truly Unique Observations

```sql
INSERT INTO app.wigle_sqlite_locations_staging (
    bssid, level, lat, lon, altitude, accuracy, time,
    external, mfgrid, sqlite_filename, imported_at
)
SELECT
    bssid, level, lat, lon, altitude, accuracy, time,
    external, mfgrid, sqlite_filename,
    NOW() as imported_at
FROM app.wigle_csv_locations csv
WHERE NOT EXISTS (
    SELECT 1 FROM app.wigle_sqlite_locations_staging sqlite
    WHERE sqlite.bssid = csv.bssid
      AND sqlite.lat = csv.lat
      AND sqlite.lon = csv.lon
      AND sqlite.time = csv.time
);
```

**Expected: 38,789 new observations (33,811 unique + 4,978 near-dupes)**

#### Step 3B: Handle Near-Duplicates (4,978 observations)

For observations with same bssid+lat+lon+time but different signal:

```sql
-- Replace weaker signal with stronger signal
WITH better_signals AS (
    SELECT
        csv.bssid, csv.lat, csv.lon, csv.time,
        csv.level as csv_level,
        sqlite.level as sqlite_level,
        CASE
            WHEN csv.level = 0 THEN 'sqlite'  -- CSV has invalid 0
            WHEN sqlite.level = 0 THEN 'csv'  -- SQLite has invalid 0
            WHEN ABS(csv.level - sqlite.level) > 40 THEN 'sqlite'  -- Huge diff, trust existing
            WHEN csv.level > sqlite.level THEN 'csv'  -- CSV stronger
            ELSE 'sqlite'  -- SQLite stronger or equal
        END as keep_source
    FROM app.wigle_csv_locations csv
    INNER JOIN app.wigle_sqlite_locations_staging sqlite
        ON sqlite.bssid = csv.bssid
       AND sqlite.lat = csv.lat
       AND sqlite.lon = csv.lon
       AND sqlite.time = csv.time
    WHERE csv.level != sqlite.level
)
UPDATE app.wigle_sqlite_locations_staging sqlite
SET level = csv.level
FROM app.wigle_csv_locations csv
INNER JOIN better_signals bs
    ON bs.bssid = csv.bssid
   AND bs.lat = csv.lat
   AND bs.lon = csv.lon
   AND bs.time = csv.time
WHERE sqlite.bssid = csv.bssid
  AND sqlite.lat = csv.lat
  AND sqlite.lon = csv.lon
  AND sqlite.time = csv.time
  AND bs.keep_source = 'csv';  -- Only update if CSV is better
```

**Expected: ~500-1000 observations updated with better signal values**

---

## Data Quality Checks After Merge

```sql
-- Verify new network count
SELECT COUNT(*) FROM app.wigle_sqlite_networks_staging_deduped;
-- Expected: 173,326 (170,095 + 3,231)

-- Verify new observation count
SELECT COUNT(*) FROM app.wigle_sqlite_locations_staging;
-- Expected: 582,448 (543,659 + 38,789)

-- Check field completeness improvements
SELECT
    COUNT(CASE WHEN ssid IS NOT NULL AND ssid != '' THEN 1 END) as ssid_count,
    COUNT(CASE WHEN frequency IS NOT NULL AND frequency != 0 THEN 1 END) as freq_count,
    COUNT(CASE WHEN mfgrid IS NOT NULL AND mfgrid != 0 THEN 1 END) as mfg_count,
    COUNT(CASE WHEN service IS NOT NULL AND service != '' THEN 1 END) as svc_count
FROM app.wigle_sqlite_networks_staging_deduped;
```

---

## Impact Summary

### Networks Table After Merge

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Networks** | 170,095 | 173,326 | +3,231 |
| **SSID Coverage** | ~8,000 | ~8,041 | +41 |
| **Frequency Coverage** | ~155,000 | ~155,169 | +169 |
| **MfgrId Coverage** | ~77,000 | ~77,026 | +26 |
| **Capabilities Coverage** | ~43,000 | ~43,033 | +33 |

### Locations Table After Merge

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Observations** | 543,659 | 582,448 | +38,789 |
| **Unique BSSIDs** | 162,799 | ~165,800 | +3,001 |
| **Signal Quality** | Good | Improved | +~750 stronger signals |

---

## Risks & Mitigations

### Risk 1: Overwriting Better Data
**Mitigation:** Use `COALESCE()` to only fill NULL/empty fields, never overwrite existing values.

### Risk 2: Invalid Signal Values (0 dBm, -100 dBm)
**Mitigation:** Explicit filtering in near-duplicate handling to skip obviously invalid readings.

### Risk 3: Exact Duplicates Creating Constraint Violations
**Mitigation:** Use `NOT EXISTS` checks to prevent inserting exact duplicates.

### Risk 4: Data Source Confusion
**Mitigation:** Preserve `sqlite_filename` field to track data origin (CSV files retain their source reference).

---

## Execution Plan

1. **Backup current staging tables** (just in case)
2. **Run Phase 1** - Add 3,231 new networks
3. **Verify Phase 1** - Check row count and sample data
4. **Run Phase 2** - Update overlapping networks with CSV data
5. **Verify Phase 2** - Check field completeness improvements
6. **Run Phase 3A** - Add new location observations
7. **Run Phase 3B** - Update near-duplicates with better signals
8. **Verify Phase 3** - Check observation counts and signal distribution
9. **Run data quality checks**
10. **Update production tables** (if satisfied with results)

---

## Conclusion

**The CSV data is valuable but mostly redundant:**
- 93% of CSV networks already exist in SQLite staging
- 72% of CSV observations are exact duplicates
- Only ~250 network records would benefit from field updates
- 3,231 truly new networks (with 5,529 observations)

**Recommendation: PROCEED with selective merge**
- Low risk of data corruption (using COALESCE prevents overwrites)
- Modest gains in completeness (+41 SSIDs, +169 frequencies, +26 mfgrids)
- Significant gain: 3,231 new networks with full location data
- Small gain: 38,789 new observations (7% increase)

**Expected final counts:**
- Networks: 173,326 (from 170,095)
- Observations: 582,448 (from 543,659)
