# ShadowCheck Code Audit - Detailed Findings

## Critical Issues Requiring Immediate Action

### 1. DUPLICATE ENDPOINT: GET /api/v1/security-analysis

**Locations:**
- First definition: `/home/nunya/shadowcheck/server/index.ts` lines 557-690
- Second definition: `/home/nunya/shadowcheck/server/index.ts` lines 745-798

**First Implementation (Lines 557-690):**
```
App receives request to GET /api/v1/security-analysis
↓
Express matches FIRST handler (line 557)
↓ (This one gets executed)
Returns advanced security categorization with:
  - SecurityStrength enum (EXCELLENT, GOOD, MODERATE, WEAK, VULNERABLE, OPEN)
  - parseCapabilities() function
  - categorizeNetworksBySecurity() function
  - Example networks per category
  - Observation counts
  - Security type breakdown (enterprise, personal_wpa3, etc.)
```

**Second Implementation (Lines 745-798):**
```
THIS CODE IS UNREACHABLE because first handler already matched the route
↓ (Would only execute if first handler didn't match)
Returns simpler categorization with:
  - Direct SQL categories (WPA3, WPA2, WPA, WEP, Open)
  - Simpler response structure
```

**Root Cause:** Code was likely merged without proper conflict resolution during development

**Resolution:**
1. Review both implementations to determine which is correct
2. Delete the second definition (lines 745-798)
3. If both features are needed, create separate endpoints:
   - `/api/v1/security-analysis/detailed` (advanced)
   - `/api/v1/security-analysis/simple` (simple)

---

## Unused Route Files

### File 1: `/home/nunya/shadowcheck/server/routes/networks.ts`

**Status:** Defined but never mounted

**Lines 1-80+ (file continues beyond):**
- Exports default router with GET endpoint
- Implements network list with cursor pagination
- Supports query params: `limit`, `before_time_ms`, `distinct_latest`
- Uses `location_details_enriched` view

**Why it's unused:**
- Not imported in `/home/nunya/shadowcheck/server/index.ts`
- No `app.use("/api/v1/networks", networksRouter)` call
- Functionality might be duplicated in inline GET /api/v1/networks (lines 103-514)

**Decision needed:** Mount it or delete it

---

### File 2: `/home/nunya/shadowcheck/server/routes/within.ts`

**Status:** Defined but never mounted

**Full file (Lines 1-61):**
- Exports default router with GET endpoint
- Purpose: Spatial radius search using Haversine distance
- Query params: `lat`, `lon`, `radius_m`, `limit`
- Uses math formula, not PostGIS

**Conflict detected:**
- Similar functionality exists inline at `/home/nunya/shadowcheck/server/index.ts` lines 951-1051
- Inline version uses PostGIS: `ST_DWithin()`
- Routes file uses Haversine: manual distance calculation
- Creates ambiguity about which implementation is preferred

**Decision needed:** 
1. Mount this file at `/api/v1/within` (and remove inline version), OR
2. Delete this file (and keep inline version)

Recommendation: Keep PostGIS version (inline), delete routes/within.ts

---

### File 3: `/home/nunya/shadowcheck/server/routes/sourceComparison.ts`

**Status:** Defined but never mounted

**Lines 1-80+ (file continues):**
- Exports default router with GET `/observations` endpoint
- Purpose: Multi-source data comparison with detailed metrics
- Uses `app.observations_federated` table
- Supports filtering by sources, radio_type, and bbox

**Why it's unused:**
- Not imported in `/home/nunya/shadowcheck/server/index.ts`
- No mount statement exists
- Query talks about federated observations but endpoint is never exposed

**Decision needed:** 
1. Mount at `/api/v1/comparison` or similar, OR
2. Delete the file if feature isn't needed

---

## Unused/Dead Code in Route Files

### File: `/home/nunya/shadowcheck/server/routes/metrics.ts`

**Status:** Defined but likely unused

**Purpose:** Provides GET `/api/v1/metrics` endpoint
- Queries consolidated dashboard metrics
- Uses `app.location_details_enriched` view
- Returns network counts, locations, radio types

**Conflict:**
- Inline version exists at `/home/nunya/shadowcheck/server/index.ts` lines 31-42
- Routes file version has different implementation
- Not imported or used anywhere

**Decision:** Delete or mount at `/api/v1/metrics/detailed`

---

### File: `/home/nunya/shadowcheck/server/routes/analytics.ts`

**Status:** Defined but likely unused

**Purpose:** Provides GET `/api/v1/analytics` endpoint
- Returns counts and cursor pagination
- Uses `locations_details_enriched` view

**Conflict:**
- Inline version exists at `/home/nunya/shadowcheck/server/index.ts` lines 520-551
- Routes file version has different schema
- Not imported or used anywhere

**Decision:** Delete or mount at different path

---

## Frontend Issues

### Demo Route: `/wifi-tooltip-demo`

**Location:** `/home/nunya/shadowcheck/client/src/App.tsx` lines 49, 66

**Component:** `WiFiNetworkTooltipDemo` (imported line 12)

**Status:** Active in both mobile and desktop routing

**Problem:** 
- Appears to be development/testing only
- Should not be exposed in production
- No clear purpose in user flows

**Recommendation:** 
1. Move to separate dev configuration, OR
2. Delete from routing if no longer needed

---

### Legacy URL Redirects

**Location:** `/home/nunya/shadowcheck/client/src/App.tsx`

**Redirect 1 (Lines 41-42, 58-59):**
```
/visualization → /geospatial-intelligence
```

**Redirect 2 (Lines 44-45, 61-62):**
```
/access-points → /geospatial-intelligence
```

**Status:** Active for backward compatibility

**Problem:** Creates maintenance burden if not needed

**Recommendation:** 
1. Verify no external links still use old URLs
2. Remove redirects if fully migrated
3. Update documentation/bookmarks

---

## Admin Panel Features

### Location: `/home/nunya/shadowcheck/client/src/components/admin-panel.tsx`

**Status:** ACTIVE and WORKING

**Mounted at:** `/admin` route (App.tsx lines 48, 65)

**Features Implemented:**
- System status monitoring (lines 44-48)
- Health details fetching (lines 51-59)
- Database connection status
- PostGIS version display
- API endpoint testing panel
- Prometheus query interface
- Grafana dashboard embedding
- Alert status monitoring
- Pipelines management panel
- Orphaned networks detection
- Network map visualization

**API Endpoints Listed (Lines 85-100+):**
```
GET /api/v1/health
GET /api/v1/status
GET /api/v1/version
GET /api/v1/config
GET /api/v1/metrics
GET /api/v1/networks
GET /api/v1/within
GET /api/v1/visualize
GET /api/v1/analytics
GET /api/v1/signal-strength
GET /api/v1/security-analysis
GET /api/v1/timeline
GET /api/v1/radio-stats
GET /api/v1/surveillance/stats
GET /api/v1/surveillance/location-visits
... and more
```

**Recommendation:** Keep this component, all features are useful

---

## Code Quality Assessment

### What's Good

1. **Clean Imports:** No unused imports found in main files
2. **Documentation:** Route files have clear JSDoc comments
3. **Organization:** 11 separate router files for different features
4. **Admin Panel:** Comprehensive system monitoring interface
5. **Frontend:** Clean page structure with proper routing

### What Needs Improvement

1. **Pattern Inconsistency:** Mix of inline routes and separate files
2. **Duplicate Routes:** Two definitions of same endpoint
3. **Dead Code:** Multiple unused route files
4. **API Documentation:** No OpenAPI/Swagger spec
5. **Legacy Tables:** Still referencing `app.locations_legacy` and `app.networks_legacy`

---

## Recommended Cleanup Plan

### Phase 1: Critical (This Week)
- [ ] Delete second `/api/v1/security-analysis` definition (line 745-798)
- [ ] Delete unused route files: `networks.ts`, `within.ts`, `sourceComparison.ts`
- [ ] Remove `/wifi-tooltip-demo` from production routing

**Estimated Time:** 1 hour

### Phase 2: High Priority (Next Week)
- [ ] Clean up legacy redirects
- [ ] Delete `metrics.ts` and `analytics.ts` if inline versions are preferred
- [ ] Document decision on `within.ts` PostGIS implementation

**Estimated Time:** 2 hours

### Phase 3: Medium Priority (2-4 Weeks)
- [ ] Consolidate inline routes from index.ts to separate files
- [ ] Create OpenAPI/Swagger documentation
- [ ] Add route usage tracking/analytics

**Estimated Time:** 8-10 hours

---

## File Paths Summary

**Critical Files:**
- `/home/nunya/shadowcheck/server/index.ts` - Has duplicate route and inline endpoints
- `/home/nunya/shadowcheck/server/routes/networks.ts` - Unused
- `/home/nunya/shadowcheck/server/routes/within.ts` - Unused/duplicate
- `/home/nunya/shadowcheck/server/routes/sourceComparison.ts` - Unused
- `/home/nunya/shadowcheck/client/src/App.tsx` - Has demo route

**Good Files:**
- `/home/nunya/shadowcheck/client/src/components/admin-panel.tsx` - Keep as-is
- `/home/nunya/shadowcheck/server/routes/surveillance.ts` - Well-structured
- `/home/nunya/shadowcheck/server/routes/pipelines.ts` - Comprehensive
- `/home/nunya/shadowcheck/client/src/pages/*.tsx` - All needed

