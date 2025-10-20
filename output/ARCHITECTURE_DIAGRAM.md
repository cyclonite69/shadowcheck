# SHADOWCHECK SURVEILLANCE DETECTION - SYSTEM ARCHITECTURE

## DATABASE ARCHITECTURE (Discovered)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE (shadowcheck)                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    IMMUTABLE SOURCE DATA (Read-Only)                 │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.locations_legacy            436,622 observations             │ │
│ │ - bssid, lat, lon, time, level, accuracy                        │ │
│ │ - Source: WiGLE/Kismet collection                               │ │
│ │ - Status: ✅ PRODUCTION DATA                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.networks_legacy             154,997 unique networks          │ │
│ │ - bssid, ssid, capabilities, frequency, lastlat, lastlon        │ │
│ │ - Source: Aggregated from locations_legacy                      │ │
│ │ - Status: ✅ PRODUCTION DATA                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.routes_legacy               19,616 GPS route points          │ │
│ │ - lat, lon, time, run_id, wifi/cell/bt visible counts          │ │
│ │ - Source: Trip tracking data                                    │ │
│ │ - Status: ✅ USEFUL FOR TRIP SEGMENTATION                       │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     DETECTION INFRASTRUCTURE (Working)               │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ FUNCTIONS (Production-Ready)                                    │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ analyze_individual_network_sightings()                      │ │ │
│ │ │ - Analyzes each BSSID for stalking patterns                 │ │ │
│ │ │ - Home/away classification                                  │ │ │
│ │ │ - Distance calculations                                     │ │ │
│ │ │ - Risk scoring                                              │ │ │
│ │ │ Status: ✅ PRODUCTION READY                                 │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ analyze_temporal_sighting_patterns()                        │ │ │
│ │ │ - Detects networks that appear in correlation with user     │ │ │
│ │ │ - Temporal pattern analysis (arriving/leaving home)         │ │ │
│ │ │ Status: ✅ PRODUCTION READY                                 │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ VIEWS (Active Detection)                                        │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ filtered_surveillance_threats                               │ │ │
│ │ │ - Core detection view                                       │ │ │
│ │ │ - Identifies networks seen at home AND far away            │ │ │
│ │ │ - Distance-based threat levels (10/20/50/80+ km)           │ │ │
│ │ │ - Excludes whitelisted networks                            │ │ │
│ │ │ Status: ✅ 13 THREATS DETECTED                              │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ MATERIALIZED VIEWS (Performance)                                │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ networks_latest_by_bssid_mv         44 MB                   │ │ │
│ │ │ - Latest position for each BSSID                            │ │ │
│ │ │ - Fast lookups without scanning 436K rows                   │ │ │
│ │ │ Status: ✅ CRITICAL FOR PERFORMANCE                         │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   CONFIGURATION TABLES (Essential)                   │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.location_markers            1 home location                 │ │
│ │ - marker_type: 'home'                                           │ │
│ │ - location_point: POINT(43.0234, -83.6968)                      │ │
│ │ - Used as reference for distance calculations                   │ │
│ │ Status: ✅ CONFIGURED                                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.network_classifications     0 whitelisted networks          │ │
│ │ - bssid, ssid, trust_level, description                         │ │
│ │ - Purpose: Exclude known-safe networks from detection           │ │
│ │ Status: ⚠️  EMPTY - NEEDS POPULATION                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.user_devices                0 user devices                  │ │
│ │ - device_name, access_point_id, device_type                     │ │
│ │ - Purpose: Exclude user's own devices from detection            │ │
│ │ Status: ⚠️  EMPTY - NEEDS POPULATION                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│               INCIDENT TRACKING (Needs Cleanup/Population)           │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.correlation_alerts          0 incidents (after cleanup)     │ │
│ │ - incident_id, target_device, correlated_ap                     │ │
│ │ - threat_level, confidence_score, investigation_status          │ │
│ │ Status: 🔧 NEEDS CLEANUP (has 402 test records)                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ app.detection_records_master    0 alerts (after cleanup)        │ │
│ │ - alert_id, alert_level, alert_type, description                │ │
│ │ - confidence_score, evidence_summary                            │ │
│ │ Status: 🔧 NEEDS CLEANUP (has 1 test record)                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       CRUFT TO REMOVE                                │
├─────────────────────────────────────────────────────────────────────┤
│ 🗑️  app.surveillance_anomalies          (6 duplicate test records)  │
│ 🗑️  Trigger: auto_government_correlation_check    (disabled)        │
│ 🗑️  Trigger: set_manufacturer_on_insert           (disabled)        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## THREAT DETECTION FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: DATA COLLECTION (Already Done)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  WiGLE Uploads    Kismet Scans    Manual Collection                 │
│       │               │                  │                           │
│       └───────────────┴──────────────────┘                           │
│                       │                                              │
│                       ▼                                              │
│           ┌─────────────────────────┐                                │
│           │  436,622 Observations   │                                │
│           │  154,997 Networks       │                                │
│           │  19,616 Route Points    │                                │
│           └─────────────────────────┘                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: HOME LOCATION REFERENCE                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│           ┌─────────────────────────┐                                │
│           │  location_markers       │                                │
│           │  Home: 43.023, -83.697  │  ← User sets this once         │
│           └─────────────────────────┘                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: DISTANCE CALCULATION (PostGIS)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  For each network in networks_legacy:                                │
│                                                                       │
│  1. Get last known position (lastlat, lastlon)                       │
│  2. Calculate distance from home using PostGIS geography             │
│  3. Classify as:                                                     │
│     - Home: < 500m                                                   │
│     - Local: 500m - 2km                                              │
│     - Away: 2km - 10km                                               │
│     - Distant: > 10km                                                │
│                                                                       │
│  Example:                                                            │
│  BSSID: aa:bb:cc:dd:ee:ff                                            │
│  Home sightings: 5 times (within 500m)                               │
│  Distant sightings: 3 times (25km, 48km, 67km away)                  │
│  Max distance: 67.2 km                                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: THREAT DETECTION (filtered_surveillance_threats view)       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Filter criteria:                                                    │
│  ✓ Seen at home (home_sightings > 0)                                │
│  ✓ Seen far away (distant_sightings > 0)                            │
│  ✓ Max distance >= 10km                                             │
│  ✓ NOT in whitelist (network_classifications)                       │
│                                                                       │
│  Threat level classification:                                        │
│  • EXTREME:   80+ km from home                                       │
│  • CRITICAL:  50-80 km from home                                     │
│  • HIGH:      20-50 km from home                                     │
│  • MEDIUM:    10-20 km from home                                     │
│                                                                       │
│  Current result: 13 THREATS DETECTED                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: CONFIDENCE SCORING (get_surveillance_incidents function)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Confidence = MIN(1.0,                                               │
│    (distance / 100km) × 0.5 +        ← Distance factor              │
│    (distant_count / total) × 0.3 +   ← Proportion distant           │
│    (home_presence_bonus) × 0.2       ← Home certainty               │
│  )                                                                   │
│                                                                       │
│  Example:                                                            │
│  Network seen 67km away, 3/8 times distant, 5 times at home         │
│  Confidence = (67/100)×0.5 + (3/8)×0.3 + 0.2 = 0.85 (85%)          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: WHITELIST FILTERING (network_classifications)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User can mark networks as "trusted":                                │
│  • Home WiFi                                                         │
│  • Work networks                                                     │
│  • Family/friend locations                                           │
│  • Coffee shops frequently visited                                   │
│                                                                       │
│  These networks are excluded from threat detection                   │
│                                                                       │
│  Status: Empty (0 networks whitelisted)                              │
│          Need UI for user to populate                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: USER DEVICE FILTERING (user_devices)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User can mark their own devices:                                    │
│  • Phone hotspot                                                     │
│  • Laptop WiFi                                                       │
│  • Smartwatch                                                        │
│  • Car Bluetooth                                                     │
│                                                                       │
│  These devices are excluded from threat detection                    │
│  (Don't flag your own phone as "following you")                      │
│                                                                       │
│  Status: Empty (0 devices registered)                                │
│          Need UI for user to populate                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 8: INCIDENT LOGGING (detection_records_master)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  When a threat is detected:                                          │
│  1. Create alert record                                              │
│  2. Set alert_level (emergency, critical, warning)                   │
│  3. Set requires_immediate_attention flag                            │
│  4. Build evidence_summary (JSON)                                    │
│  5. Set investigation_status = 'active'                              │
│                                                                       │
│  Status: Table exists, needs population via API                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 9: USER NOTIFICATION (Not Yet Implemented)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Future enhancement:                                                 │
│  • In-app notification badge                                         │
│  • Email alerts                                                      │
│  • SMS alerts (Twilio)                                               │
│  • Push notifications (mobile app)                                   │
│                                                                       │
│  Current: Manual check via UI                                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 10: USER INVESTIGATION (UI Not Wired)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User views threat in UI:                                            │
│  1. See BSSID, SSID, threat level                                    │
│  2. View map of all sightings                                        │
│  3. See timeline (when/where)                                        │
│  4. Check manufacturer (MAC OUI lookup)                              │
│  5. Decide action:                                                   │
│     • Whitelist (false positive)                                     │
│     • Investigate further                                            │
│     • Report to authorities                                          │
│                                                                       │
│  Status: Need to build UI components                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API ENDPOINTS (Current vs. Needed)

### Current Endpoints (Working)
```
GET /api/v1/surveillance/stats
  → Returns: total_locations, total_networks, high_risk, locations_near_home
  → Status: ⚠️  Returns wrong field name (total_observations instead of total_locations)

GET /api/v1/surveillance/location-visits
  → Returns: Top 50 most-visited locations
  → Status: ✅ Working

GET /api/v1/surveillance/network-patterns
  → Returns: Network observation patterns
  → Status: ✅ Working

GET /api/v1/surveillance/home-following
  → Returns: Networks that follow user from home
  → Status: ✅ Working
```

### New Endpoints (To Add)
```
GET /api/v1/surveillance/incidents?min_distance=10&limit=50
  → Returns: Detected surveillance threats with confidence scores
  → Source: app.get_surveillance_incidents()
  → Status: 🆕 Need to create

POST /api/v1/surveillance/whitelist
  → Body: { bssid, ssid, trust_level, description, notes }
  → Returns: { ok: true, added: true/false }
  → Source: app.add_to_whitelist()
  → Status: 🆕 Need to create

GET /api/v1/surveillance/whitelist
  → Returns: All whitelisted networks
  → Source: SELECT * FROM app.network_classifications
  → Status: 🆕 Need to create

POST /api/v1/surveillance/user-devices
  → Body: { bssid, device_name, device_type }
  → Returns: { ok: true }
  → Source: INSERT INTO app.user_devices
  → Status: 🆕 Need to create
```

---

## CURRENT STATE vs. TARGET STATE

### Data Flow (Current)
```
Database → API (broken field names) → UI (shows 0 or empty)
   ✅           ⚠️                        ❌
```

### Data Flow (After Implementation)
```
Database → API (fixed) → UI (shows threats) → User Action → Whitelist/Alert
   ✅         ✅              ✅                   ✅             ✅
```

---

## PERFORMANCE METRICS

### Query Performance (Estimated)
```
filtered_surveillance_threats view:      2-5 seconds
get_surveillance_incidents():            1-2 seconds
analyze_individual_network_sightings():  3-10 seconds (full scan)
networks_latest_by_bssid_mv lookup:      <100ms (cached)
```

### Database Size
```
Total database: ~500 MB
  - locations_legacy: ~150 MB
  - networks_legacy: ~50 MB
  - networks_latest_by_bssid_mv: 44 MB (cached)
  - Other tables: ~250 MB
```

### Scalability Limits
```
Current: 436K observations → performs well
Expected: 1M+ observations → may need:
  - Partitioning by date
  - More aggressive matview usage
  - Archive old data (>2 years)
```

---

## SECURITY ARCHITECTURE

### Data Protection Layers

```
┌───────────────────────────────────────────────┐
│ Layer 1: Database Audit Logs                  │
│ - All changes logged to backup.data_access_log│
│ - Protected trigger: protect_audit_tables     │
│ Status: ✅ Active                              │
└───────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│ Layer 2: Read-Only Convention                 │
│ - *_legacy tables never modified              │
│ - Application enforces read-only              │
│ Status: ⚠️  No DB-level protection             │
└───────────────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────────┐
│ Layer 3: User Data Encryption                 │
│ - Sensitive data in network_classifications   │
│ - location_markers contains home address      │
│ Status: ⚠️  Not encrypted                      │
└───────────────────────────────────────────────┘
```

---

## IMPLEMENTATION CHECKLIST

### Database (SQL)
- [ ] Run cleanup_script.sql (15 min)
- [ ] Run build_script.sql (15 min)
- [ ] Verify with test queries (5 min)

### Backend (TypeScript)
- [ ] Fix server/storage.ts:371 (2 min)
- [ ] Add /incidents endpoint (30 min)
- [ ] Add /whitelist endpoints (30 min)
- [ ] Test with curl (15 min)

### Frontend (React)
- [ ] Fix Total Locations card (5 min)
- [ ] Wire Threats tab to API (1 hour)
- [ ] Build incident detail view (2 hours)
- [ ] Add whitelist button (1 hour)
- [ ] Test end-to-end flow (30 min)

### Total Time: ~6-8 hours

---

**Architecture Discovery Complete**
**Status:** ✅ Ready for implementation
**Next:** Execute cleanup script → build script → backend fix → UI integration
