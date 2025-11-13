# WiGLE API Data Merge Strategy

## Current State Analysis

**WiGLE API Tables:**
- `app.wigle_alpha_v3_networks`: 71 networks
- `app.wigle_alpha_v3_observations`: 3,885 observations

**Staging Tables:**
- `app.wigle_sqlite_networks_staging_deduped`: 173,326 networks
- `app.wigle_sqlite_locations_staging`: 577,470 observations

**Overlap:**
- **All 71 API networks already exist in staging** (100% overlap)
- 0 true orphans (all BSSIDs are already in networks_staging_deduped)

---

## Merge Strategy

### Phase 1: Add Data Source Tracking Column

Add `data_source` column to locations_staging to track origin:
- `'sqlite'` - Original SQLite import data
- `'csv'` - CSV import data
- `'wigle_api'` - WiGLE API enrichment data

```sql
ALTER TABLE app.wigle_sqlite_locations_staging
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'sqlite';

-- Set existing data source based on sqlite_filename
UPDATE app.wigle_sqlite_locations_staging
SET data_source = CASE
    WHEN sqlite_filename LIKE '%csv%' OR sqlite_filename LIKE '%CSV%' THEN 'csv'
    ELSE 'sqlite'
END
WHERE data_source IS NULL OR data_source = 'sqlite';
```

### Phase 2: Update Networks from WiGLE API

Update the 71 networks in staging with enriched WiGLE API data where API has better/more complete data:

```sql
UPDATE app.wigle_sqlite_networks_staging_deduped staging
SET
    -- Update SSID if staging doesn't have it
    ssid = COALESCE(staging.ssid, api.ssid),

    -- Update frequency if staging doesn't have it
    frequency = COALESCE(NULLIF(staging.frequency, 0), NULLIF(api.frequency, 0)),

    -- Update capabilities/encryption if staging doesn't have it
    capabilities = COALESCE(staging.capabilities, api.encryption),

    -- Update channel if not set
    -- Note: Staging doesn't have channel column, may need to add it

    -- Update type if not set
    type = COALESCE(staging.type, api.type),

    -- Prefer WiGLE trilaterated coordinates if staging has 0,0 or NULL
    lastlat = CASE
        WHEN staging.lastlat IS NULL OR staging.lastlat = 0
        THEN api.trilaterated_lat
        ELSE staging.lastlat
    END,
    lastlon = CASE
        WHEN staging.lastlon IS NULL OR staging.lastlon = 0
        THEN api.trilaterated_lon
        ELSE staging.lastlon
    END,

    -- Use trilaterated coords for best location if staging has 0,0
    bestlat = CASE
        WHEN staging.bestlat IS NULL OR staging.bestlat = 0
        THEN api.trilaterated_lat
        ELSE staging.bestlat
    END,
    bestlon = CASE
        WHEN staging.bestlon IS NULL OR staging.bestlon = 0
        THEN api.trilaterated_lon
        ELSE staging.bestlon
    END
FROM app.wigle_alpha_v3_networks api
WHERE staging.bssid = api.bssid
  AND (
    -- Only update if API has data that staging lacks
    (staging.ssid IS NULL OR staging.ssid = '') AND (api.ssid IS NOT NULL AND api.ssid != '')
    OR (staging.frequency IS NULL OR staging.frequency = 0) AND (api.frequency IS NOT NULL AND api.frequency != 0)
    OR (staging.capabilities IS NULL OR staging.capabilities = '') AND (api.encryption IS NOT NULL AND api.encryption != '')
    OR (staging.lastlat IS NULL OR staging.lastlat = 0) AND api.trilaterated_lat IS NOT NULL
    OR (staging.lastlon IS NULL OR staging.lastlon = 0) AND api.trilaterated_lon IS NOT NULL
  );
```

**Expected Updates:**
- SSIDs: 66 networks (API has SSIDs that staging might lack)
- Frequencies: 70 networks
- Coordinates: Networks with 0,0 coordinates
- Encryption/capabilities: Various

### Phase 3: Insert WiGLE API Observations

Insert observations from WiGLE API as new location records with `data_source = 'wigle_api'`:

```sql
-- Get max unified_id first
SELECT MAX(unified_id) FROM app.wigle_sqlite_locations_staging;
-- Assume max is 6009709 (577470 existing + 33811 from CSV merge)

INSERT INTO app.wigle_sqlite_locations_staging (
    unified_id,
    bssid,
    lat,
    lon,
    altitude,
    accuracy,
    time,
    level,
    mfgrid,
    sqlite_filename,
    data_source
)
SELECT
    6009709 + ROW_NUMBER() OVER (ORDER BY api.bssid, api.observation_time) as unified_id,
    api.bssid,
    api.lat,
    api.lon,
    api.altitude,
    api.accuracy,
    EXTRACT(EPOCH FROM api.observation_time) * 1000 as time,  -- Convert to milliseconds
    api.signal_dbm as level,
    NULL as mfgrid,  -- API doesn't have this
    'wigle_api_orphan_recovery.jsonl' as sqlite_filename,
    'wigle_api' as data_source
FROM app.wigle_alpha_v3_observations api
WHERE NOT EXISTS (
    -- Skip if exact observation already exists
    SELECT 1 FROM app.wigle_sqlite_locations_staging staging
    WHERE staging.bssid = api.bssid
      AND staging.lat = api.lat
      AND staging.lon = api.lon
      AND staging.time = EXTRACT(EPOCH FROM api.observation_time) * 1000
);
```

**Expected:** ~3,885 new observations (or fewer if some duplicates exist)

### Phase 4: Verification

```sql
-- Check data source distribution
SELECT
    data_source,
    COUNT(*) as observation_count,
    COUNT(DISTINCT bssid) as unique_bssids
FROM app.wigle_sqlite_locations_staging
GROUP BY data_source
ORDER BY observation_count DESC;

-- Verify networks updated
SELECT
    COUNT(*) as networks_with_wigle_enrichment
FROM app.wigle_sqlite_networks_staging_deduped
WHERE bssid IN (SELECT bssid FROM app.wigle_alpha_v3_networks);

-- Check networks that now have SSIDs from API
SELECT
    staging.bssid,
    staging.ssid as staging_ssid,
    api.ssid as api_ssid,
    staging.lastlat,
    staging.lastlon,
    api.trilaterated_lat,
    api.trilaterated_lon
FROM app.wigle_sqlite_networks_staging_deduped staging
INNER JOIN app.wigle_alpha_v3_networks api ON api.bssid = staging.bssid
WHERE staging.ssid IS NOT NULL AND staging.ssid != ''
LIMIT 10;
```

---

## Key Decisions

### 1. No True Orphans
All 71 WiGLE API networks already have records in staging_deduped. This means the orphan_recovery.jsonl was for networks that were already captured locally but needed enrichment.

### 2. Data Source Tracking
Using `data_source` column to track provenance:
- Helps with debugging
- Allows filtering by source
- Enables trust/quality scoring

### 3. Selective Updates (COALESCE Strategy)
- **Never overwrite existing good data**
- Only fill in NULLs or 0 values
- WiGLE trilaterated coordinates are authoritative when staging has 0,0

### 4. Observation Deduplication
- Check for exact matches (bssid + lat + lon + time)
- WiGLE API observations often have different precision than local captures
- May result in fewer than 3,885 new records if some are duplicates

---

## Benefits of This Merge

**Networks Table:**
- +66 SSIDs (filling in blanks)
- +70 frequency values
- Improved coordinate accuracy for networks with 0,0 coords
- Better encryption/capabilities data

**Locations Table:**
- +~3,885 high-quality WiGLE observations
- Authoritative trilaterated coordinates
- Temporal coverage improvement
- Clear data provenance tracking

---

## Risks & Mitigations

### Risk 1: Coordinate Conflicts
- **Issue:** WiGLE trilaterated coords might differ from local observations
- **Mitigation:** Only use WiGLE coords when staging has 0,0 (invalid data)

### Risk 2: Time Format Issues
- **Issue:** WiGLE uses timestamp without timezone, staging uses millisecond epoch
- **Mitigation:** Explicit conversion: `EXTRACT(EPOCH FROM timestamp) * 1000`

### Risk 3: Duplicate Observations
- **Issue:** Some WiGLE observations might already exist from local scans
- **Mitigation:** Use NOT EXISTS check on (bssid, lat, lon, time) tuple

### Risk 4: Data Source Ambiguity
- **Issue:** Can't tell later where data came from
- **Mitigation:** `data_source` column explicitly tracks origin

---

## Execution Order

1. **Add data_source column** to locations_staging
2. **Set existing records' data_source** (sqlite/csv based on filename)
3. **Update networks** from WiGLE API (COALESCE strategy)
4. **Insert API observations** with data_source='wigle_api'
5. **Verify** counts and sample data
6. **Update networks from locations** (if new observations improve data)

---

## Expected Final State

**Networks:**
- 173,326 networks (no change - all API networks already exist)
- 71 networks enriched with WiGLE API metadata
- Improved SSID coverage
- Better coordinate accuracy for networks that had 0,0

**Observations:**
- 577,470 + ~3,885 = ~581,355 total observations
- Clear data provenance via data_source column
- High-quality WiGLE observations flagged separately
