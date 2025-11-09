# Database Cleanup Analysis - ShadowCheck

**Generated:** 2025-11-07
**Database:** shadowcheck (PostgreSQL 18 + PostGIS)
**Purpose:** Comprehensive analysis of all database objects to identify cruft and create cleanup plan

---

## Executive Summary

The ShadowCheck database contains **57 tables** across 4 schemas, **300+ functions**, **21 triggers**, and **hundreds of indexes**. Analysis reveals significant cruft including:

- **Unused security classification tables** (marked for purging)
- **Duplicate/deprecated staging tables**
- **Hundreds of btree_gist extension functions** (not project-specific)
- **Unused surveillance/evidence tables**
- **Legacy enrichment tables with low usage**

**Estimated Cleanup Impact:**
- Remove ~15-20 unused tables (~50-100 MB)
- Remove ~200+ extension functions (reduce clutter)
- Consolidate 3 staging table groups into 1 active system
- Remove 5-10 unused triggers and associated indexes

---

## Database Schemas Overview

### Schema: `app` (Main Application Schema)
**Purpose:** ShadowCheck SIGINT Database - NEVER mutate source data, preserve ALL precision
**Tables:** 47 tables, 465 MB total
**Status:** ACTIVE - Core application data

### Schema: `analytics`
**Purpose:** Analytics and reporting
**Tables:** 1 table (hourly_signal_stats)
**Status:** ACTIVE

### Schema: `backup`
**Purpose:** Custody/audit trail
**Tables:** 5 tables
**Status:** MIXED - Some unused

### Schema: `sigint`
**Purpose:** Signal intelligence detections
**Tables:** 3 tables
**Status:** ACTIVE

---

## Table Analysis by Category

### ✅ CORE TABLES - ACTIVELY USED (Cannot Remove)

#### Primary Data Tables
| Table | Size | References | Purpose | Status |
|-------|------|------------|---------|--------|
| `app.locations_legacy` | 152 MB | 30+ | Core location observations | **CRITICAL** |
| `app.networks_legacy` | 63 MB | 25+ | Core network metadata | **CRITICAL** |
| `app.wireless_access_points` | 33 MB | 15+ | Unified access points | **ACTIVE** |
| `app.position_measurements` | 90 MB | 8+ | Position data | **ACTIVE** |
| `app.signal_measurements` | 40 MB | 8+ | Signal strength data | **ACTIVE** |

**Code References:**
- `server/routes/accessPoints.ts`: Query wireless_access_points
- `server/routes/networks.ts`: Query networks_legacy extensively
- `server/routes/federatedObservations.ts`: Joins locations_legacy + networks_legacy

---

### 🟡 STAGING TABLES - MULTIPLE SYSTEMS (Consolidation Needed)

#### Kismet Staging (ACTIVE - 465 MB)
| Table | Size | Last Used | Status |
|-------|------|-----------|--------|
| `app.kismet_packets_staging` | 465 MB | Active | ✅ KEEP |
| `app.kismet_devices_staging` | 17 MB | Active | ✅ KEEP |
| `app.kismet_alerts_staging` | 352 KB | Active | ✅ KEEP |
| `app.kismet_snapshots_staging` | 3.5 MB | Active | ✅ KEEP |
| `app.kismet_datasources_staging` | 48 KB | Active | ✅ KEEP |

**Referenced in:** `server/routes/pipelines.ts` (lines 145-289)

#### KML Staging (128 MB - LOW USAGE)
| Table | Size | Last Used | Status |
|-------|------|-----------|--------|
| `app.kml_locations_staging` | 128 MB | Referenced | 🟡 REVIEW |
| `app.kml_networks_staging` | 59 MB | Referenced | 🟡 REVIEW |

**Usage:** `server/routes/pipelines.ts` has KML import logic but may not be actively ingesting

**RECOMMENDATION:** Verify if KML imports are still running. If not used in 90+ days, archive and drop.

#### WiGLE SQLite Staging (55 MB - ACTIVE)
| Table | Size | Status |
|-------|------|--------|
| `app.wigle_sqlite_locations_staging` | 34 MB | ✅ KEEP |
| `app.wigle_sqlite_networks_staging` | 21 MB | ✅ KEEP |
| `app.wigle_sqlite_routes_staging` | 48 KB | ✅ KEEP |

**Referenced in:** `server/routes/wigleStagingRoutes.ts`, `server/routes/pipelines.ts`

#### WiGLE API Staging (DEPRECATED - 72 KB)
| Table | Size | Status |
|-------|------|--------|
| `app.wigle_api_networks_staging_deprecated` | 40 KB | ❌ **REMOVE** |
| `app.wigle_api_locations_staging_deprecated` | 32 KB | ❌ **REMOVE** |

**REASON:** Table names include `_deprecated` suffix. Replace with `wigle_alpha_v3_*` tables.

---

### ✅ ACTIVE ENRICHMENT SYSTEM

#### WiGLE Alpha V3 (CURRENT SYSTEM - 1.8 MB)
| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.wigle_alpha_v3_observations` | 1.7 MB | API enrichment cache | ✅ KEEP |
| `app.wigle_alpha_v3_networks` | 120 KB | Network metadata | ✅ KEEP |

**Referenced in:** `server/routes/wigle_alpha_v3.ts` (all endpoints)

#### Enrichment Queue (320 KB)
| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.bssid_enrichment_queue` | 256 KB | Priority queue for WiGLE lookups | ✅ KEEP |
| `app.bssid_enrichment_history` | 64 KB | Audit trail | ✅ KEEP |

**Referenced in:** `server/routes/wigleEnrichment.ts`

#### Legacy Enrichment (112 KB - REVIEW)
| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.network_enrichments` | 112 KB | Old enrichment system | 🟡 **MIGRATE?** |

**RECOMMENDATION:** If data migrated to `wigle_alpha_v3_*`, can be dropped.

---

### ❌ SECURITY CLASSIFICATION TABLES - MARKED FOR PURGING

| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.network_classifications` | 64 KB | Security classification | ❌ **PURGE** |
| `app.network_tags` | 80 KB | Network tagging | ❌ **PURGE** |
| `app.security_zones` | 56 KB | Security zone definitions | ❌ **PURGE** |

**Reason:** User mentioned "used for security classification that will be purged"

**Code Impact:**
- `server/routes/classification.ts` uses network_classifications
- Before dropping, remove/update this route

---

### ❌ SURVEILLANCE/EVIDENCE TABLES - UNUSED

#### Surveillance Detection (UNUSED - 144 KB)
| Table | Size | Code References | Status |
|-------|------|-----------------|--------|
| `app.surveillance_detection_jobs` | 48 KB | NONE | ❌ REMOVE |
| `app.surveillance_job_status` | 48 KB | NONE | ❌ REMOVE |
| `app.correlation_alerts` | 56 KB | Route exists but not queried | ❌ REMOVE |
| `app.detection_records_master` | 16 KB | NONE | ❌ REMOVE |

**Found in:** `server/routes/surveillance.ts` references `get_wifi_surveillance_threats()` function but NOT these tables directly.

#### Evidence Management (UNUSED - 168 KB)
| Table | Size | Code References | Status |
|-------|------|-----------------|--------|
| `app.evidence_attachments` | 104 KB | NONE | ❌ REMOVE |
| `app.evidence_access_log` | 32 KB | NONE | ❌ REMOVE |
| `app.surveillance_evidence_files` | 32 KB | NONE | ❌ REMOVE |

**Analysis:** No API routes reference these tables. Likely planned feature never implemented.

#### Government Contractor Tracking (UNUSED - 64 KB)
| Table | Size | Status |
|-------|------|--------|
| `app.government_contractors` | 48 KB | ❌ REMOVE |
| `backup.government_infrastructure_correlations` | 16 KB | ❌ REMOVE |

**Analysis:** Tables exist but no code references found.

---

### 🟡 OTHER TABLES - REVIEW NEEDED

#### User Device Tracking (80 KB)
| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.user_devices` | 80 KB | Track user's own devices | 🟡 **VERIFY** |

**Has trigger:** `user_devices_validate_ap_id`
**Check:** Is this feature actively used? If not, remove.

#### Location Markers (56 KB)
| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `app.location_markers` | 56 KB | Geographic markers/POIs | 🟡 **VERIFY** |

**Referenced in:** `server/routes/within.ts` (lines 23-45)
**Status:** Route exists, verify if frontend uses it.

#### Legacy Tables (3.6 MB)
| Table | Size | Status |
|-------|------|--------|
| `app.routes_legacy` | 3.5 MB | 🟡 **VERIFY** |
| `app.provenance_legacy` | 48 KB | 🟡 **VERIFY** |

**Question:** Are these from old Kismet schema? If superseded by new tables, archive and drop.

---

### ✅ MATERIALIZED VIEWS - KEEP

| View | Purpose | Refresh Strategy | Status |
|------|---------|------------------|--------|
| `app.mv_unified_network_observations` | Unified obs from all sources | On-demand | ✅ KEEP |
| `app.mv_network_classifications` | Cached classifications | On-demand | ✅ KEEP |
| `app.mv_legacy_observations` | Legacy data view | On-demand | ✅ KEEP |
| `app.networks_latest_by_bssid_mv` | Latest network state | On-demand | ✅ KEEP |

**Referenced in:** `server/routes/federatedObservations.ts`, `server/routes/accessPoints.ts`

---

### ❌ BACKUP SCHEMA TABLES - UNUSED

| Table | Size | Purpose | Status |
|-------|------|---------|--------|
| `backup.wigle_network_observations` | 48 KB | Old WiGLE backup | ❌ REMOVE |
| `backup.data_custody_log` | 40 KB | Custody chain | 🟡 **VERIFY** |
| `backup.data_access_log` | 40 KB | Access audit | 🟡 **VERIFY** |
| `backup.device_relationships` | 40 KB | Device relations | ❌ REMOVE |
| `backup.network_change_events` | 32 KB | Change tracking | ❌ REMOVE |
| `backup.device_colocation_events` | 32 KB | Colocation events | ❌ REMOVE |
| `backup.wigle_enrichment_metadata` | 16 KB | Old metadata | ❌ REMOVE |

**Recommendation:** If custody logging is not in use, remove entire backup schema except `data_custody_log` if legally required.

---

## Function Analysis

### ✅ ACTIVE FUNCTIONS (Keep)

**Core Application Functions:**
- `get_wifi_surveillance_threats()` - Used by surveillance.ts
- `get_source_statistics()` - Used by analytics.ts
- `adjust_thresholds_from_feedback()` - Threat feedback system
- `refresh_source_statistics()` - Analytics refresh
- `get_enrichment_stats()` - Enrichment monitoring

**Enrichment Functions:**
- `enrich_network(p_bssid text)` - WiGLE enrichment
- `assess_location_confidence()` - Location scoring
- `compute_mobility_score()` - Mobility analysis

**Classification Functions:**
- `classify_technology()` - Radio tech classification
- `classify_infrastructure()` - Infrastructure type
- `classify_security_risk()` - Security scoring

### ❌ EXTENSION FUNCTIONS - NOT PROJECT CODE (Ignore/Keep)

**btree_gist Extension (~200 functions):**
- `gbt_*` functions (e.g., `gbt_int4_compress`, `gbt_text_union`)
- These are from the `btree_gist` PostgreSQL extension
- **NOT project cruft** - required for GiST indexes on scalar types
- **ACTION:** None - part of PostgreSQL extension

**pgcrypto Extension (~20 functions):**
- `armor()`, `dearmor()`, `encrypt()`, `decrypt()`, `gen_random_uuid()`
- Password hashing: `gen_salt()`, `crypt()`
- **NOT project cruft** - standard crypto extension
- **ACTION:** None - keep if encryption is used

**dblink Extension (~30 functions):**
- `dblink()`, `dblink_exec()`, `dblink_connect()`, etc.
- **QUESTION:** Is cross-database querying used?
- **ACTION:** Check if `SELECT * FROM pg_extension WHERE extname='dblink'` shows usage. If unused, can drop extension.

### ❌ UNUSED SURVEILLANCE FUNCTIONS - REMOVE

| Function | Purpose | Code References | Status |
|----------|---------|-----------------|--------|
| `detect_aerial_surveillance_patterns()` | Detect aerial patterns | NONE | ❌ REMOVE |
| `detect_bssid_walking()` | Detect BSSID walking attack | NONE | ❌ REMOVE |
| `detect_calibrated_stalking_networks()` | Stalking detection | NONE | ❌ REMOVE |
| `detect_coordinated_movement()` | Coordinated movement | NONE | ❌ REMOVE |
| `detect_impossible_distance_anomalies()` | Distance anomalies | NONE | ❌ REMOVE |
| `detect_sequential_mac_patterns()` | MAC pattern detection | NONE | ❌ REMOVE |
| `detect_surveillance_route_correlation()` | Route correlation | NONE | ❌ REMOVE |
| `detect_wifi_evil_twins()` | Evil twin detection | NONE | ❌ REMOVE |
| `detect_wifi_network_impersonation()` | Impersonation detection | NONE | ❌ REMOVE |
| `detect_wifi_signal_anomalies()` | Signal anomalies | NONE | ❌ REMOVE |

**Reason:** Planned features never implemented. Complex functions with no callers.

### ❌ UNUSED EVIDENCE FUNCTIONS - REMOVE

- `export_government_infrastructure_evidence()` - No usage
- `export_surveillance_evidence_package()` - No usage
- `auto_check_government_correlation()` - No usage
- `auto_wigle_lookup_suspicious_infrastructure()` - No usage

### 🟡 LEGACY FUNCTIONS - REVIEW

- `analyze_individual_network_sightings()` - Check if used
- `analyze_network_sightings()` - Check if used
- `analyze_temporal_sighting_patterns()` - Check if used
- `get_stalking_threat_summary()` - Check if used

**Action:** Search codebase for function calls. If unused for 90+ days, remove.

---

## Trigger Analysis

### ✅ ACTIVE TRIGGERS - KEEP

| Trigger | Table | Function | Purpose | Status |
|---------|-------|----------|---------|--------|
| `t_proactive_alert` | networks_legacy | process_new_network_sighting_alert() | Alert on new networks | ✅ KEEP |
| `audit_*` triggers | Multiple | audit_trigger_func() | Audit trail | ✅ KEEP |
| `trigger_update_signal_detections_updated_at` | signal_detections* | update_updated_at_column() | Timestamp maintenance | ✅ KEEP |

### ❌ UNUSED TRIGGERS - REMOVE

| Trigger | Table | Status |
|---------|-------|--------|
| `protect_access_log_updates` | backup.data_access_log | ❌ REMOVE (if backup schema removed) |
| `user_devices_validate_ap_id` | user_devices | 🟡 VERIFY (if user_devices removed) |

---

## Index Analysis

### ✅ CRITICAL INDEXES - KEEP

**High-Use Tables (networks_legacy, locations_legacy):**
- `idx_networks_bssid` - Critical for lookups
- `idx_locations_bssid` - Critical for joins
- `idx_networks_legacy_location` (GiST) - Spatial queries
- `idx_locations_lat_lon` (GiST) - Spatial queries

**Kismet Staging:**
- `idx_kismet_devices_devmac` - Device lookups
- `idx_kismet_packets_time` - Temporal queries
- `idx_kismet_devices_time` - Temporal queries

**WiGLE Alpha V3:**
- All indexes on wigle_alpha_v3_* tables

### 🟡 INDEXES ON TABLES MARKED FOR REMOVAL

If tables are dropped, these indexes will be automatically removed:
- All indexes on `network_classifications`
- All indexes on `evidence_attachments`
- All indexes on `surveillance_detection_jobs`
- All indexes on `government_contractors`

**Action:** No manual cleanup needed - cascades with table drop.

---

## Cleanup Plan - Phased Approach

### Phase 1: Safe Removals (No Code Impact)

#### Step 1.1: Remove Deprecated Staging Tables
```sql
-- These have "_deprecated" suffix
DROP TABLE IF EXISTS app.wigle_api_networks_staging_deprecated CASCADE;
DROP TABLE IF EXISTS app.wigle_api_locations_staging_deprecated CASCADE;
```

#### Step 1.2: Remove Unused Evidence Tables
```sql
DROP TABLE IF EXISTS app.evidence_attachments CASCADE;
DROP TABLE IF EXISTS app.evidence_access_log CASCADE;
DROP TABLE IF EXISTS app.surveillance_evidence_files CASCADE;
```

#### Step 1.3: Remove Unused Surveillance Tables
```sql
DROP TABLE IF EXISTS app.surveillance_detection_jobs CASCADE;
DROP TABLE IF EXISTS app.surveillance_job_status CASCADE;
DROP TABLE IF EXISTS app.detection_records_master CASCADE;
-- Note: Keep correlation_alerts if route is still exposed
```

#### Step 1.4: Remove Government Tracking Tables
```sql
DROP TABLE IF EXISTS app.government_contractors CASCADE;
DROP TABLE IF EXISTS backup.government_infrastructure_correlations CASCADE;
```

#### Step 1.5: Remove Unused Detection Functions
```sql
DROP FUNCTION IF EXISTS app.detect_aerial_surveillance_patterns(numeric, numeric, integer, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_aerial_surveillance_patterns(numeric, integer, integer, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_bssid_walking() CASCADE;
DROP FUNCTION IF EXISTS app.detect_calibrated_stalking_networks(integer, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_coordinated_movement(integer, integer, numeric, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_impossible_distance_anomalies(bigint, integer, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_sequential_mac_patterns(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS app.detect_sequential_mac_patterns(integer, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_surveillance_route_correlation(bigint, integer, integer, integer, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_wifi_evil_twins(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS app.detect_wifi_network_impersonation(integer, numeric) CASCADE;
DROP FUNCTION IF EXISTS app.detect_wifi_signal_anomalies(integer, numeric) CASCADE;
```

#### Step 1.6: Remove Evidence Functions
```sql
DROP FUNCTION IF EXISTS app.export_government_infrastructure_evidence(bigint[], text) CASCADE;
DROP FUNCTION IF EXISTS app.export_surveillance_evidence_package(integer[], text, text) CASCADE;
DROP FUNCTION IF EXISTS app.auto_check_government_correlation() CASCADE;
DROP FUNCTION IF EXISTS app.auto_wigle_lookup_suspicious_infrastructure(integer, numeric) CASCADE;
```

**Expected Impact:**
- Free ~300-500 KB disk space
- Remove ~20 unused functions
- Remove ~6 unused tables
- **Zero code changes required** (nothing references these)

---

### Phase 2: Security Classification Purge

**PREREQUISITE:** User confirmation + code updates

#### Step 2.1: Update Code
```bash
# Remove or update these files:
server/routes/classification.ts  # Uses network_classifications
server/routes/surveillance.ts    # May reference network_tags
```

#### Step 2.2: Drop Tables
```sql
DROP TABLE IF EXISTS app.network_classifications CASCADE;
DROP TABLE IF EXISTS app.network_tags CASCADE;
DROP TABLE IF EXISTS app.security_zones CASCADE;
```

**Expected Impact:**
- Free ~200 KB
- Remove 1-2 API routes
- **Requires code changes**

---

### Phase 3: Staging Table Consolidation

**PREREQUISITE:** Verify KML imports not in use

#### Step 3.1: Check Last Usage
```sql
-- Check if KML tables have recent data
SELECT
  'kml_locations_staging' as table_name,
  COUNT(*) as row_count,
  MAX(time) as last_observation
FROM app.kml_locations_staging;

SELECT
  'kml_networks_staging' as table_name,
  COUNT(*) as row_count,
  MAX(lasttime) as last_observation
FROM app.kml_networks_staging;
```

#### Step 3.2: Archive and Drop (if unused > 90 days)
```sql
-- Archive to backup schema first
CREATE TABLE backup.kml_locations_staging_archived AS
  SELECT * FROM app.kml_locations_staging;

CREATE TABLE backup.kml_networks_staging_archived AS
  SELECT * FROM app.kml_networks_staging;

-- Drop from app schema
DROP TABLE app.kml_locations_staging CASCADE;
DROP TABLE app.kml_networks_staging CASCADE;
```

**Expected Impact:**
- Free ~187 MB
- **Risk:** If KML import pipeline still used, this breaks it

---

### Phase 4: Backup Schema Review

**PREREQUISITE:** Determine if audit/custody logging is required

#### Step 4.1: Check Legal Requirements
- Is `data_custody_log` legally required?
- Is `data_access_log` required for compliance?

#### Step 4.2: If NOT Required - Drop Entire Backup Schema
```sql
-- Drop all backup schema tables
DROP SCHEMA backup CASCADE;
```

#### Step 4.3: If Required - Drop Unused Tables Only
```sql
DROP TABLE IF EXISTS backup.wigle_network_observations CASCADE;
DROP TABLE IF EXISTS backup.device_relationships CASCADE;
DROP TABLE IF EXISTS backup.network_change_events CASCADE;
DROP TABLE IF EXISTS backup.device_colocation_events CASCADE;
DROP TABLE IF EXISTS backup.wigle_enrichment_metadata CASCADE;
```

**Expected Impact:**
- Free ~160-240 KB
- Simplify schema structure

---

### Phase 5: Extension Cleanup

**Check if extensions are used:**

```sql
-- List all installed extensions
SELECT extname, extversion FROM pg_extension
WHERE extname NOT IN ('plpgsql', 'postgis', 'postgis_topology');

-- Result will show: btree_gist, pgcrypto, dblink, etc.
```

#### Step 5.1: Check dblink Usage
```bash
# Search codebase for dblink usage
grep -r "dblink" /home/nunya/shadowcheck/server
grep -r "dblink" /home/nunya/shadowcheck/pipelines
```

If NO usage found:
```sql
DROP EXTENSION IF EXISTS dblink CASCADE;
```

**Note:** Keep `btree_gist` and `pgcrypto` - likely in use for indexes and password hashing.

---

### Phase 6: Legacy Table Migration

**PREREQUISITE:** Verify these are superseded

#### Check Legacy Tables
```sql
-- Check if routes_legacy is used
SELECT COUNT(*), MAX(routeid) FROM app.routes_legacy;

-- Check if provenance_legacy is used
SELECT COUNT(*), MAX(id) FROM app.provenance_legacy;
```

If empty or superseded:
```sql
DROP TABLE IF EXISTS app.routes_legacy CASCADE;
DROP TABLE IF EXISTS app.provenance_legacy CASCADE;
```

**Expected Impact:**
- Free ~3.6 MB

---

## Summary of Cleanup Targets

### Tables to Remove (High Confidence)
| Table | Size | Reason |
|-------|------|--------|
| wigle_api_*_deprecated | 72 KB | Deprecated |
| evidence_attachments | 104 KB | Unused |
| evidence_access_log | 32 KB | Unused |
| surveillance_evidence_files | 32 KB | Unused |
| surveillance_detection_jobs | 48 KB | Unused |
| surveillance_job_status | 48 KB | Unused |
| detection_records_master | 16 KB | Unused |
| government_contractors | 48 KB | Unused |
| backup.government_infrastructure_correlations | 16 KB | Unused |
| **TOTAL** | **~416 KB** | |

### Tables to Remove (User Confirmed - Security Classification)
| Table | Size |
|-------|------|
| network_classifications | 64 KB |
| network_tags | 80 KB |
| security_zones | 56 KB |
| **TOTAL** | **~200 KB** |

### Tables to Review/Archive
| Table | Size | Next Step |
|-------|------|-----------|
| kml_locations_staging | 128 MB | Verify usage, archive if inactive |
| kml_networks_staging | 59 MB | Verify usage, archive if inactive |
| routes_legacy | 3.5 MB | Check if empty/superseded |
| provenance_legacy | 48 KB | Check if empty/superseded |
| user_devices | 80 KB | Verify feature is used |
| backup schema tables | ~200 KB | Verify legal requirements |

### Functions to Remove
- ~10-15 unused detection functions
- ~4 unused evidence export functions
- ~3-5 legacy analysis functions (if confirmed unused)

**Total Estimated Cleanup:**
- **Immediate safe removal:** ~600 KB + 15 functions
- **After verification:** ~190 MB + additional functions
- **Total potential:** ~191 MB freed

---

## Verification Scripts

### Before Cleanup: Document Current State
```sql
-- Save table sizes
COPY (
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
         pg_total_relation_size(schemaname||'.'||tablename) AS bytes
  FROM pg_tables
  WHERE schemaname IN ('app', 'analytics', 'backup', 'sigint')
  ORDER BY bytes DESC
) TO '/tmp/shadowcheck_tables_before_cleanup.csv' CSV HEADER;

-- Save function count
COPY (
  SELECT n.nspname, p.proname, pg_get_function_arguments(p.oid) as args
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname IN ('app', 'analytics', 'backup', 'sigint')
  ORDER BY n.nspname, p.proname
) TO '/tmp/shadowcheck_functions_before_cleanup.csv' CSV HEADER;
```

### After Cleanup: Verify Changes
```sql
-- Compare table count
SELECT schemaname, COUNT(*) as table_count
FROM pg_tables
WHERE schemaname IN ('app', 'analytics', 'backup', 'sigint')
GROUP BY schemaname;

-- Check space freed
SELECT
  schemaname,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) AS total_size
FROM pg_tables
WHERE schemaname IN ('app', 'analytics', 'backup', 'sigint')
GROUP BY schemaname;
```

---

## Recommendations

### Immediate Actions (This Week)
1. ✅ Execute Phase 1 (Safe Removals) - No code changes needed
2. 📝 Document which tables were removed and backup data first
3. ✅ Run test suite after removal to verify no breakage

### Short Term (Next 2 Weeks)
1. 🔍 Verify KML import pipeline status
2. 🔍 Check if `user_devices` feature is actively used
3. 🔍 Determine legal requirements for backup schema
4. 📋 Update API documentation to remove dead endpoints

### Medium Term (Next Month)
1. ⚙️ Execute Phase 2 (Security Classification Purge)
2. ⚙️ Execute Phase 3-4 (Staging + Backup cleanup)
3. 📊 Monitor application for any issues
4. 🗄️ Consider vacuuming database after major cleanup

### Long Term (Next Quarter)
1. 📈 Implement monitoring for table growth
2. 🔄 Set up automated cleanup jobs for old staging data
3. 📝 Document which tables are actively used vs archived
4. 🏗️ Consider partitioning large tables (kismet_packets_staging @ 465 MB)

---

## Risk Assessment

### LOW RISK ✅
- Phase 1 removals (deprecated/unused tables)
- Extension function cleanup (if verified unused)

### MEDIUM RISK 🟡
- KML staging table removal (verify usage first)
- Legacy table removal (check if superseded)
- Backup schema removal (verify not required)

### HIGH RISK ⚠️
- Security classification purge (requires code changes)
- Removing tables referenced in existing routes
- Dropping functions without checking dynamic SQL calls

---

## Backup Strategy

Before ANY cleanup:

```bash
# Full database backup
docker exec shadowcheck_postgres_18 pg_dump -U shadowcheck_user shadowcheck > /tmp/shadowcheck_backup_$(date +%Y%m%d).sql

# Table-specific backups before dropping
docker exec shadowcheck_postgres_18 pg_dump -U shadowcheck_user -t app.evidence_attachments shadowcheck > /tmp/evidence_attachments_backup.sql
```

---

## Next Steps

1. **Review this document** with team/stakeholders
2. **Get confirmation** on security classification purge
3. **Verify** KML and legacy table usage
4. **Execute Phase 1** safe removals
5. **Monitor** application health
6. **Proceed** with additional phases based on findings

---

**Document Owner:** Database Cleanup Initiative
**Last Updated:** 2025-11-07
**Status:** Draft - Awaiting Review
