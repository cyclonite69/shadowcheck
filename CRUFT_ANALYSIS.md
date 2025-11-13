# ShadowCheck Repository Cruft Analysis
**Date:** 2025-11-13
**Analysis Type:** Comprehensive decruft audit

## Executive Summary

Total potential savings: **~386KB** in tracked files
**Recommendation:** SAFE TO DELETE most items below

---

## 1. Schema Files - FUTURE_ITERATIONS (~180KB)

### Location: `schema/future_iterations/`
**Status:** ❌ **UNUSED** - No references found in codebase

These appear to be experimental/development SQL files that were never integrated:

- `activate_surveillance_system.sql`
- `activate_surveillance_system_fixed.sql`
- `analyze_wifi_bluetooth_surveillance.sql`
- `calibrated_surveillance_detection.sql`
- `comprehensive_surveillance_analysis.sql`
- `comprehensive_surveillance_operation_report.sql`
- `consolidate_tables.sql`
- `data_quality_audit.sql`
- `fix_missing_coordinates.sql`
- `implement_wifi_surveillance_detection.sql`
- `location_marking_system.sql`
- `populate_manufacturers_final.sql`
- `precise_surveillance_detection.sql`
- `refactor_migration.sql`
- `refactor_migration_v2.sql`
- `refactor_step_by_step.sql`
- `sightings_analysis_corrected.sql`
- Plus 6 more files...

**Recommendation:** **DELETE** - Archive if needed for reference

---

## 2. Scripts - FUTURE_ITERATIONS (~72KB)

### Location: `scripts/future_iterations/`
**Status:** ❌ **UNUSED** - No references found

Deployment and generation scripts that appear abandoned:

- `analyze_schema.sh`
- `deploy.sh`
- `deploy_complete_surveillance_system.sh`
- `deploy_master.sh`
- `deploy_secure.sh`
- `generate_complete_surveillance_geojson.sh`
- `generate_corrected_surveillance_geojson.sh`
- `generate_simple_surveillance_geojson.sh`

**Recommendation:** **DELETE** - These appear to be superseded by current deployment approach

---

## 3. Schema - COMPREHENSIVE Directory (~134KB)

### Location: `schema/schema_comprehensive/`
**Status:** ⚠️ **REVIEW NEEDED**

Contains 11 numbered migration files (01-11):
- `01_extensions_and_schema.sql`
- `02_reference_tables.sql`
- `03_core_tables.sql`
- ...through `11_api_design.sql`

**Recommendation:** **KEEP** if these are your active migration files, **DELETE** if superseded by other schema files in root

---

## 4. Deprecated Files

### Already Cleaned:
- ✅ `client/src/pages/networks.tsx.deprecated` (REMOVED - 501 lines)

---

## 5. Documentation Analysis

### Location: `docs/`
**Status:** ⚠️ **REVIEW FOR REDUNDANCY**

Current documentation files (14 total):
- `DASHBOARD_ACCESS.md` - Dashboard usage guide
- `DASHBOARD_SETUP.md` - Dashboard setup instructions
- `EVIDENCE_BASED_ANALYSIS.md` - Analysis methodology (23KB)
- `FIXES_APPLIED.md` - Historical fixes log
- `IMPLEMENTATION_SUMMARY.md` - Implementation notes
- `MULTI_RADIO_ANALYSIS.md` - Radio analysis (33KB - LARGEST)
- `QUICK_START_UNIFIED_VIEWS.md` - Quick start guide
- `RADIO_TYPE_CLASSIFICATION.md` - Classification guide
- `README_SCRIPTS.md` - Scripts documentation
- `SECURITY_MODAL_GUIDE.md` - Security modal usage
- `STATUS.md` - Project status
- `TROUBLESHOOTING.md` - Troubleshooting guide
- `UNIFIED_VIEWS_IMPLEMENTATION.md` - Views implementation

**Potential Redundancy:**
1. Multiple "implementation" docs could be consolidated
2. `FIXES_APPLIED.md` + `STATUS.md` might overlap
3. Consider consolidating quick starts into main README

**Recommendation:** **REVIEW** - Consolidate overlapping content

---

## 6. React Components Analysis

### Total Components: 109 files in `client/src/components/`

**Components Checked (Sample):**
- ✅ ClassificationTestPanel - USED (imported in admin-panel.tsx)
- ✅ All major components appear to be in use

**Recommendation:** **KEEP ALL** - Active codebase, no obvious dead components found

---

## 7. Root Directory Files

### Shell Scripts in Root:
- `check-network.sh` - Network diagnostics
- `fix-docker-bridge.sh` - Docker networking fix
- `restart.sh` - Service restart script
- `start-dev.sh` - Development start
- `start.sh` - Production start
- `stop.sh` - Service stop

**Recommendation:** **KEEP** - All appear functional and referenced

---

## Cleanup Action Plan

### Phase 1: Safe Deletions (Immediate)
```bash
# Remove future_iterations directories
git rm -r schema/future_iterations/
git rm -r scripts/future_iterations/
```

**Savings:** ~252KB of tracked code

### Phase 2: Schema Review (Requires Analysis)
```bash
# Determine if schema_comprehensive is still needed
# If you're using other schema files, consider removing
```

**Potential savings:** ~134KB

### Phase 3: Documentation Consolidation (Optional)
- Merge redundant implementation docs
- Consolidate quick start guides
- Archive historical files (FIXES_APPLIED.md, STATUS.md) if outdated

**Potential savings:** ~50KB + improved clarity

---

## Summary Recommendations

| Category | Action | Savings | Risk |
|----------|--------|---------|------|
| schema/future_iterations/ | **DELETE** | 180KB | LOW |
| scripts/future_iterations/ | **DELETE** | 72KB | LOW |
| schema/schema_comprehensive/ | **REVIEW** | 134KB | MEDIUM |
| Documentation | **CONSOLIDATE** | 50KB | LOW |

**Total Safe Deletion:** ~252KB
**Total Potential:** ~386KB

---

## Next Steps

1. ✅ Review this analysis
2. ⬜ Approve deletions
3. ⬜ Execute cleanup (automated)
4. ⬜ Commit and push changes
5. ⬜ Update documentation index

**Ready to proceed with cleanup?**
