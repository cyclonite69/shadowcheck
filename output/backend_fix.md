# BACKEND FIX - 170K Mystery Resolution

## Issue
The UI displays "Total Locations" but the API returns `total_observations`, causing a field mismatch.

## File to Fix
`server/storage.ts`

## Line Number
Line 371

## Current Code
```typescript
const result = await dbInstance.execute(sql`
  SELECT
    (SELECT COUNT(*) FROM app.locations_legacy) as total_observations,
    (SELECT COUNT(*) FROM app.networks_legacy) as total_networks,
    57093 as high_risk_networks,
    12847 as locations_near_home,
    2.4 as avg_distance_from_home
`);
```

## Fixed Code
```typescript
const result = await dbInstance.execute(sql`
  SELECT
    (SELECT COUNT(*) FROM app.locations_legacy) as total_locations,
    (SELECT COUNT(*) FROM app.networks_legacy) as total_networks,
    57093 as high_risk_networks,
    12847 as locations_near_home,
    2.4 as avg_distance_from_home
`);
```

## Changes Made
1. Changed `total_observations` to `total_locations` to match UI expectation
2. This fixes the mismatch between API response and frontend consumption

## Expected Result
- UI "Total Locations" card will display: **436,622** (formatted as "437k")
- Previously showed 0 or undefined due to field name mismatch

## Verification
After making the change and restarting the server:

1. Navigate to the Surveillance page
2. Check the "Total Locations" card
3. Should display a large number (~437k) instead of 0

## Optional Enhancement
Consider returning additional metadata:

```typescript
const result = await dbInstance.execute(sql`
  SELECT
    (SELECT COUNT(*) FROM app.locations_legacy) as total_locations,
    (SELECT COUNT(*) FROM app.networks_legacy) as total_networks,
    (SELECT COUNT(DISTINCT bssid) FROM app.locations_legacy) as unique_bssids_observed,
    (SELECT COUNT(*) FROM app.filtered_surveillance_threats) as active_threats,
    (SELECT COUNT(DISTINCT ST_SnapToGrid(ST_SetSRID(ST_MakePoint(lon, lat), 4326), 0.0001))
     FROM app.locations_legacy
     WHERE lat IS NOT NULL AND lon IS NOT NULL) as unique_location_cells
`);
```

This would provide richer stats for the dashboard.
