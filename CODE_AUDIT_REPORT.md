# ShadowCheck Code Audit Report
## Unused Routes, Pages, and Cruft Analysis

Generated: 2025-11-13

---

## SECTION 1: BACKEND ROUTES ANALYSIS

### Routes Registered in server/index.ts (Lines 8-18, 81-91)

The following routes are imported and registered:

1. `healthRouter` → `/api/v1/health` (Line 8, 81)
2. `visualizeRouter` → `/api/v1/visualize` (Line 9, 82)
3. `surveillanceRouter` → `/api/v1/surveillance` (Line 10, 83)
4. `pipelinesRouter` → `/api/v1/pipelines` (Line 11, 84)
5. `accessPointsRouter` → `/api/v1/access-points` (Line 12, 85)
6. `wigleEnrichmentRouter` → `/api/v1/wigle` (Line 13, 86)
7. `wigleStagingRouter` → `/api/v1/wigle` (Line 14, 87)
8. `wigleAlphaV3Router` → `/api/v3` (Line 15, 88)
9. `networkObservationsRouter` → `/api/v1/network` (Line 16, 89)
10. `locationMarkersRouter` → `/api/v1/locations` (Line 17, 90)
11. `networkTimelineRouter` → `/api/v1/network-timeline` (Line 18, 91)

### Defined Route Files NOT Registered (Orphaned Routes)

**File: /home/nunya/shadowcheck/server/routes/networks.ts**
- Status: DEFINED BUT NOT MOUNTED
- Lines: 1-80+ (checked first 80 lines, file is longer)
- Exports: Router with GET `/` endpoint
- Purpose: Network list with cursor pagination and distinct_latest option
- Issue: Imported in old config but NOT in current server/index.ts
- Recommendation: Either register this route or remove file

**File: /home/nunya/shadowcheck/server/routes/within.ts**
- Status: DEFINED BUT NOT MOUNTED
- Lines: 1-61
- Exports: Router with GET `/` endpoint
- Purpose: Haversine distance query (networks within radius)
- Query: Spatial filtering using math, not PostGIS
- Issue: Route is defined but never registered via app.use()
- Note: Similar functionality may exist in server/index.ts at line 951 as inline endpoint
- Recommendation: Consider consolidating or registering this route

**File: /home/nunya/shadowcheck/server/routes/sourceComparison.ts**
- Status: DEFINED BUT NOT MOUNTED
- Lines: 1-80+ (checked first 80 lines)
- Exports: Router with GET `/observations` endpoint
- Purpose: Multi-source data comparison analysis
- Issue: Never imported or registered in server/index.ts
- Recommendation: Either register via /api/v1/comparison or remove

### Route Files REGISTERED (Active/Used)

- ✓ health.ts (4 endpoints)
- ✓ visualize.ts (1 endpoint)
- ✓ surveillance.ts (6 endpoints: wifi/threats, wifi/summary, location-clusters, settings, feedback, learning/adjust)
- ✓ pipelines.ts (14+ endpoints for KML, WiGLE, Kismet, WiGLE API)
- ✓ accessPoints.ts
- ✓ wigleEnrichment.ts
- ✓ wigleStagingRoutes.ts
- ✓ wigle_alpha_v3.ts
- ✓ networkObservations.ts
- ✓ locationMarkers.ts
- ✓ networkTimeline.ts

### Inline Routes in server/index.ts (Embedded API Endpoints)

**Lines 31-42: GET /api/v1/metrics**
- Purpose: Consolidated dashboard metrics
- Status: ACTIVE - inline endpoint

**Lines 103-514: GET /api/v1/networks**
- Purpose: Network list with extensive filtering options
- Implements: group_by_bssid, distinct_latest, bbox filtering, radius search
- Lines 103-306: group_by_bssid mode
- Lines 308-346: distinct_latest mode
- Lines 348-514: raw mode (default)
- Status: ACTIVE - inline endpoint

**Lines 520-551: GET /api/v1/analytics**
- Purpose: Dashboard overview metrics
- Status: ACTIVE - inline endpoint

**Lines 557-690: GET /api/v1/security-analysis** (FIRST DEFINITION)
- Purpose: WiFi network security strength analysis
- Status: ACTIVE - inline endpoint

**Lines 696-739: GET /api/v1/signal-strength**
- Purpose: Signal strength distribution
- Status: ACTIVE - inline endpoint

**Lines 745-798: GET /api/v1/security-analysis** (DUPLICATE/SECOND DEFINITION)
- Lines 745+: Second definition of same endpoint
- WARNING: DUPLICATE ROUTE - This will override the first one (lines 557-690)
- Both return similar security analysis but different SQL queries
- First query (line 562): Uses parseCapabilities and categorizeNetworksBySecurity functions
- Second query (line 747): Different classification logic with simpler categories
- Issue: Having two definitions of the same endpoint is confusing and the second shadows the first
- Recommendation: CONSOLIDATE - Choose one implementation and remove the other

**Lines 801-903: GET /api/v1/timeline**
- Purpose: Network detection timeline with flexible time ranges
- Status: ACTIVE - inline endpoint

**Lines 907-931: GET /api/v1/status**
- Purpose: Database connection status
- Status: ACTIVE - inline endpoint

**Lines 934-940: GET /api/v1/version**
- Purpose: API version information
- Status: ACTIVE - inline endpoint

**Lines 943-948: GET /api/v1/config**
- Purpose: Frontend configuration (Mapbox token)
- Status: ACTIVE - inline endpoint

**Lines 951-1051: GET /api/v1/within**
- Purpose: Spatial query using PostGIS
- Status: ACTIVE - inline endpoint
- Note: Similar to routes/within.ts but different implementation

**Lines 1054-1154: GET /api/v1/radio-stats**
- Purpose: Radio type statistics with detailed classification
- Status: ACTIVE - inline endpoint

**Line 93-94: GET /healthz**
- Purpose: Legacy health endpoint for backward compatibility
- Status: LEGACY but still registered

---

## SECTION 2: FRONTEND PAGES ANALYSIS

### Pages Registered in client/src/App.tsx (Router Configuration)

**Home Page: / (Line 34)**
- File: `/home/nunya/shadowcheck/client/src/pages/home.tsx`
- Status: ACTIVE
- Exports: HomePage component
- Features: Landing page with feature descriptions

**Dashboard: /dashboard (Lines 39, 56)**
- File: `/home/nunya/shadowcheck/client/src/pages/dashboard.tsx`
- Status: ACTIVE
- Both Mobile and Desktop shells

**Geospatial Intelligence: /geospatial-intelligence (Lines 40, 57)**
- File: `/home/nunya/shadowcheck/client/src/pages/geospatial-intelligence.tsx`
- Status: ACTIVE
- Both Mobile and Desktop shells

**Redirects: /visualization (Lines 41-42, 58-59)**
- Redirect to: `/geospatial-intelligence`
- Status: LEGACY - old URL mapping

**Redirects: /access-points (Lines 44-45, 61-62)**
- Redirect to: `/geospatial-intelligence`
- Status: LEGACY - old URL mapping

**Surveillance: /surveillance (Lines 47, 64)**
- File: `/home/nunya/shadowcheck/client/src/pages/surveillance.tsx`
- Status: ACTIVE
- Both Mobile and Desktop shells

**Admin Panel: /admin (Lines 48, 65)**
- Component: `AdminPanel` (imported line 11)
- File: `/home/nunya/shadowcheck/client/src/components/admin-panel.tsx`
- Status: ACTIVE
- Features: System status, health metrics, API testing, database status, Grafana dashboard
- Route: Inline component definition in App.tsx

**WiFi Tooltip Demo: /wifi-tooltip-demo (Lines 49, 66)**
- Component: `WiFiNetworkTooltipDemo` (imported line 12)
- File: Somewhere in components
- Status: DEMO/DEV - likely development-only route
- Recommendation: Consider removing from production routing

**Not Found: (Lines 50, 67)**
- File: `/home/nunya/shadowcheck/client/src/pages/not-found.tsx`
- Status: ACTIVE - catch-all 404 page

### All Page Files in client/src/pages/

- ✓ home.tsx - ACTIVE (landing page)
- ✓ dashboard.tsx - ACTIVE (main dashboard)
- ✓ surveillance.tsx - ACTIVE (surveillance threats)
- ✓ geospatial-intelligence.tsx - ACTIVE (map view)
- ✓ not-found.tsx - ACTIVE (404 page)

### Frontend Components with Admin Features

**AdminPanel Component (admin-panel.tsx)**
- Location: `/home/nunya/shadowcheck/client/src/components/admin-panel.tsx`
- Status: ACTIVE and MOUNTED at `/admin` route
- Features:
  - System status monitoring
  - Database connectivity checks
  - PostGIS version display
  - API endpoint testing
  - Grafana dashboard embedding
  - Prometheus query interface
  - Alert status monitoring
  - Pipelines panel management
  - Orphaned networks detection
  - Network map visualization

---

## SECTION 3: IMPORTED BUT POTENTIALLY UNUSED RESOURCES

### Unused Imports in server/index.ts

None found - file appears to have clean, purposeful imports.

### Unused Components in App.tsx (Line 12)

**Import: WiFiNetworkTooltipDemo**
- Used at: Line 49, 66 (`/wifi-tooltip-demo` route)
- Status: Possibly dev-only - consider removing unless needed for production

---

## SECTION 4: COMMENTED-OUT CODE & LEGACY ENDPOINTS

### Legacy Endpoints (Still Functional)

**GET /healthz (Line 93-94 in server/index.ts)**
- Type: LEGACY health endpoint
- Status: For backward compatibility - still working
- Recommendation: Consider deprecating in favor of `/api/v1/health`

### Database References Comments

Multiple comments reference `app.locations_legacy` and `app.networks_legacy` tables:
- server/index.ts: Lines 233, 239, 246, 451, 471
- server/routes/surveillance.ts: Lines 93, 269, 299
- Other route files reference legacy tables
- Status: Still in use - not cruft but indicates legacy schema

---

## SECTION 5: CODE DUPLICATION ISSUES

### Critical: Duplicate Route Definition

**GET /api/v1/security-analysis - DEFINED TWICE**

**First Definition: server/index.ts, Lines 557-690**
- Implementation: Advanced security analysis with SecurityStrength enum
- Imports: parseCapabilities, categorizeNetworksBySecurity, SecurityStrength (line 559)
- Features:
  - Categorizes networks by security strength (EXCELLENT, GOOD, MODERATE, WEAK, VULNERABLE, OPEN)
  - Provides observation count analysis
  - Categorizes by security type (enterprise, personal_wpa3, personal_wpa2, legacy, open)
  - Returns examples for each category

**Second Definition: server/index.ts, Lines 745-798**
- Implementation: Simpler security analysis with different categories
- Features:
  - Uses basic SQL categories (WPA3, WPA2, WPA, WEP, Open)
  - Returns simpler breakdown structure
  - Different calculation approach

**Problem:**
- Both endpoints respond to the same GET request
- The second definition (starting line 745) will override the first (line 557)
- This means the first sophisticated implementation is unreachable
- Likely created when merging code without proper cleanup

**Recommendation: URGENT REFACTOR NEEDED**
1. Choose which implementation is correct
2. Remove the duplicate
3. If both are needed, give them different paths (e.g., `/api/v1/security-analysis/detailed` vs `/api/v1/security-analysis/simple`)

---

## SECTION 6: SUMMARY OF FINDINGS

### Critical Issues

1. **DUPLICATE Route**: GET /api/v1/security-analysis defined twice (Lines 557, 745)
   - Second definition shadows the first
   - Recommendation: Consolidate immediately

### High Priority Issues

1. **Unused Route Files**:
   - `server/routes/networks.ts` - Defined but never mounted
   - `server/routes/within.ts` - Defined but never mounted (functionality exists inline instead)
   - `server/routes/sourceComparison.ts` - Defined but never mounted

2. **Potential Dead Code**:
   - `/wifi-tooltip-demo` route - Appears to be demo/dev only
   - `/visualization` and `/access-points` redirects - Legacy URL mappings

### Moderate Issues

1. **Inline vs Router Pattern**: Mix of inline route definitions in server/index.ts and separate router files creates inconsistency
   - Most routes are in separate files (11 route files)
   - But many endpoints are defined inline in index.ts
   - Recommendation: Consolidate patterns for maintainability

2. **Legacy Endpoints**: Still supporting `/healthz` for backward compatibility
   - Could be cleaned up if no longer needed

### Code Quality

- No significant commented-out code blocks found
- Most comments are meaningful (reference legacy tables)
- Good JSDoc documentation on route endpoints
- Admin panel is comprehensive and well-integrated

---

## SECTION 7: RECOMMENDATIONS

### Immediate Actions (Critical)

1. **Fix Duplicate Security Analysis Route**
   - Choose correct implementation
   - Consolidate into single endpoint
   - Document the discrepancy
   - Estimated effort: 30 minutes

### Short-term Actions (High Priority)

1. **Consolidate Unused Route Files**
   - Mount or delete: `networks.ts`, `within.ts`, `sourceComparison.ts`
   - Verify no broken imports
   - Estimated effort: 1-2 hours

2. **Remove Demo Routes**
   - Remove `/wifi-tooltip-demo` from production routing if not needed
   - Or move to separate demo configuration
   - Estimated effort: 15 minutes

3. **Clean Legacy Redirects**
   - Review if `/visualization` and `/access-points` still needed
   - Remove if fully migrated to `/geospatial-intelligence`
   - Estimated effort: 15 minutes

### Medium-term Actions (Code Quality)

1. **Standardize Route Definition Pattern**
   - Move inline routes from server/index.ts to separate router files
   - Organize by feature/domain
   - Estimated effort: 3-4 hours

2. **Document API Endpoints**
   - Create OpenAPI/Swagger spec
   - Document all 40+ endpoints systematically
   - Estimated effort: 4-6 hours

3. **Add Route Usage Metrics**
   - Track which routes are actually used
   - Identify truly dead code
   - Estimated effort: 2-3 hours

---

## APPENDIX: Detailed Route Inventory

### All Backend Routes (40+ endpoints)

#### Health & Status Routes
- GET /api/v1/health
- GET /api/v1/health/ready
- GET /api/v1/health/detailed
- GET /api/v1/health/metrics
- GET /healthz (legacy)
- GET /api/v1/status
- GET /api/v1/version
- GET /api/v1/config

#### Data Retrieval Routes
- GET /api/v1/networks (inline, with multiple modes)
- GET /api/v1/analytics (inline)
- GET /api/v1/visualize
- GET /api/v1/metrics (inline)
- GET /api/v1/within (inline + routes/within.ts)
- GET /api/v1/signal-strength (inline)
- GET /api/v1/timeline (inline)
- GET /api/v1/radio-stats (inline)

#### Security Analysis Routes
- GET /api/v1/security-analysis (inline, DUPLICATE)

#### Classification Routes (classification.ts)
- GET /api/v1/classification/summary
- GET /api/v1/classification/networks
- GET /api/v1/classification/network/:bssid
- GET /api/v1/classification/technology-breakdown
- GET /api/v1/classification/security-breakdown
- GET /api/v1/classification/high-risk-networks
- GET /api/v1/classification/mobile-assets
- POST /api/v1/classification/refresh
- GET /api/v1/classification/search
- GET /api/v1/classification/networks-near-home
- GET /api/v1/classification/stats-by-location

#### Surveillance Routes (surveillance.ts)
- GET /api/v1/surveillance/wifi/threats
- GET /api/v1/surveillance/wifi/summary
- GET /api/v1/surveillance/location-clusters
- GET /api/v1/surveillance/settings
- POST /api/v1/surveillance/settings
- POST /api/v1/surveillance/feedback
- POST /api/v1/surveillance/learning/adjust
- GET /api/v1/surveillance/feedback/stats

#### Access Points Routes (accessPoints.ts)
- GET /api/v1/access-points
- GET /api/v1/access-points/map
- GET /api/v1/access-points/timeline
- POST /api/v1/access-points/search
- Others...

#### Network Timeline Routes (networkTimeline.ts)
- GET /api/v1/network-timeline/for-networks
- Others...

#### Network Observations Routes (networkObservations.ts)
- GET /api/v1/network/observations
- Others...

#### Location Markers Routes (locationMarkers.ts)
- GET /api/v1/locations/markers
- POST /api/v1/locations/markers
- Others...

#### Pipelines Routes (pipelines.ts - 14+ endpoints)
- GET /api/v1/pipelines/kml/files
- POST /api/v1/pipelines/kml/import
- POST /api/v1/pipelines/kml/import-all
- GET /api/v1/pipelines/kml/stats
- DELETE /api/v1/pipelines/kml/clear
- POST /api/v1/pipelines/kml/merge
- GET /api/v1/pipelines/wigle/files
- POST /api/v1/pipelines/wigle/import
- GET /api/v1/pipelines/kismet/files
- POST /api/v1/pipelines/kismet/import
- GET /api/v1/pipelines/kismet/stats
- DELETE /api/v1/pipelines/kismet/clear
- POST /api/v1/pipelines/wigle-api/query
- POST /api/v1/pipelines/wigle-api/detail
- GET /api/v1/pipelines/wigle-api/stats
- GET /api/v1/pipelines/wigle-api/staging-data
- DELETE /api/v1/pipelines/wigle-api/clear

#### WiGLE Enrichment Routes
- Multiple endpoints in wigleEnrichment.ts

#### WiGLE Staging Routes
- Multiple endpoints in wigleStagingRoutes.ts

#### WiGLE Alpha v3 Routes (wigle_alpha_v3.ts)
- GET /api/v3/network/:bssid/detail

#### Federated Observations Routes
- Multiple endpoints in federatedObservations.ts

#### Unused Route Files (NOT MOUNTED)
- /api/v1/networks (routes/networks.ts) - Alternative networks endpoint
- /api/v1/comparison/observations (sourceComparison.ts) - Multi-source comparison

