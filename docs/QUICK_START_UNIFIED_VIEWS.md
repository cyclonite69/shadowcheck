# Quick Start: Unified Views Implementation

## 5-Minute Setup

This guide gets you up and running with the new unified views in ShadowCheck.

## Files Created

### Frontend Components

```
client/src/
├── lib/
│   ├── unifiedColumns.ts          # Column definitions
│   └── unifiedFilters.ts          # Filter system
└── components/
    ├── UnifiedFilterPanel.tsx      # Filter UI
    ├── UnifiedDataTable.tsx        # Table with sorting/reordering
    └── UnifiedNetworkExplorer.tsx  # Main combined view
```

### Backend Fixes

```
server/routes/
└── accessPoints.ts                 # Fixed enum type casting (lines 127, 148)
```

### Documentation

```
docs/
├── UNIFIED_VIEWS_IMPLEMENTATION.md  # Full implementation guide
└── QUICK_START_UNIFIED_VIEWS.md     # This file
```

## Step 1: Rebuild Backend

The backend has been updated to fix enum filtering issues:

```bash
# From project root
npx tsc --project server/tsconfig.json
docker-compose build --no-cache backend
docker restart shadowcheck_backend
```

**Or** use the simplified restart script:

```bash
./restart.sh
```

## Step 2: Test Backend Filters

Verify the fixes are working:

```bash
# Test WiFi filtering
curl "http://localhost:5000/api/v1/access-points?radio_types=wifi&limit=5" | jq '.ok'
# Should return: true

# Test Bluetooth filtering
curl "http://localhost:5000/api/v1/access-points?radio_types=bluetooth&limit=5" | jq '.ok'
# Should return: true

# Test data quality filtering
curl "http://localhost:5000/api/v1/access-points?data_quality=high,medium&limit=5" | jq '.ok'
# Should return: true
```

If any return `false`, check the error message and backend logs.

## Step 3: Integrate the Unified View

### Option A: Replace Existing Access Points Page

Edit `client/src/components/AccessPointsPage.tsx`:

```typescript
import { UnifiedNetworkExplorer } from './UnifiedNetworkExplorer';

export function AccessPointsPage() {
  return <UnifiedNetworkExplorer />;
}
```

### Option B: Add as New Tab in Visualization

Edit `client/src/pages/visualization.tsx`:

```typescript
// Add import
import { UnifiedNetworkExplorer } from '@/components/UnifiedNetworkExplorer';

// Add tab trigger
<TabsTrigger value="unified" data-testid="tab-unified">
  <Layers className="mr-2 h-4 w-4" />
  Unified Explorer
</TabsTrigger>

// Add tab content
<TabsContent value="unified" className="space-y-6">
  <div className="premium-card overflow-hidden" style={{ height: 'calc(100vh - 20rem)' }}>
    <UnifiedNetworkExplorer />
  </div>
</TabsContent>
```

### Option C: Update Access Points Explorer

Edit `client/src/components/AccessPointsExplorerView.tsx` to use the new filter panel:

The filter panel has already been integrated in the previous fix. Just verify it's working by checking that line 478 contains:

```typescript
<AccessPointsFilterPanel filters={filters} onFiltersChange={setFilters} />
```

## Step 4: Rebuild Frontend

```bash
cd client
npm run build
cd ..
```

Or if using the restart script, it handles this automatically.

## Step 5: Test the UI

1. **Navigate** to http://localhost:3001 (or wherever your frontend runs)

2. **Go to** Access Points or Visualization page (depending on integration method)

3. **Test Features**:
   - [ ] Click "WiFi Only" quick filter → should show only WiFi networks
   - [ ] Click "Bluetooth Only" quick filter → should show only Bluetooth devices
   - [ ] Set signal range -70 to -30 dBm → should filter by strength
   - [ ] Search for an SSID → should filter results
   - [ ] Click column header → should sort
   - [ ] Shift+Click another column → should add secondary sort
   - [ ] Drag column header → should reorder columns
   - [ ] Toggle between Observations/Access Points → should switch views
   - [ ] Click "Export CSV" → should download data

## Common Issues & Fixes

### Issue 1: Filters Not Working

**Symptom**: Clicking filter buttons doesn't change data

**Fix**:
```bash
# Clear Docker cache and rebuild
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue 2: "operator does not exist: app.radio_technology_enum = text"

**Symptom**: Backend error in logs

**Fix**: This means the enum casting fix wasn't applied. Check that lines 127 and 148 in `server/routes/accessPoints.ts` have `::text` cast:

```typescript
// Line 127
whereClauses.push(`radio_technology::text = ANY($${paramIndex}::text[])`);

// Line 148
whereClauses.push(`data_quality::text = ANY($${paramIndex}::text[])`);
```

### Issue 3: Column Reordering Not Working

**Symptom**: Dragging columns doesn't reorder them

**Fix**: Ensure you're passing `onColumnOrderChange` callback:

```typescript
<UnifiedDataTable
  data={data}
  viewMode={viewMode}
  columnOrder={columnOrder}
  onColumnOrderChange={setColumnOrder}  // ← Must be present
/>
```

### Issue 4: Multi-Column Sort Not Working

**Symptom**: Shift+Click doesn't add secondary sort

**Fix**: Check browser console for errors. Ensure `sortConfig` state is array and `onSortChange` is provided:

```typescript
const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);  // ← Array, not object

<UnifiedDataTable
  sortConfig={sortConfig}
  onSortChange={setSortConfig}  // ← Must be present
/>
```

## Quick Reference: UI Controls

| Action | Control | Result |
|--------|---------|--------|
| **Filter by WiFi** | Click "📡 WiFi Only" button | Shows only WiFi networks |
| **Filter by Bluetooth** | Click "🔵 Bluetooth Only" button | Shows only BT/BLE devices |
| **Strong signals only** | Click "💪 Strong Signals" button | Shows -60 to 0 dBm signals |
| **Open networks** | Click "🔓 Open Networks" button | Shows unsecured networks |
| **Secure networks** | Click "🔒 Secure (WPA2/3)" button | Shows WPA2/WPA3 only |
| **Custom signal range** | Enter min/max in Signal Strength fields | Filters by custom range |
| **Search** | Type in search box, press Enter | Filters by SSID/BSSID |
| **Sort ascending** | Click column header | Sorts A→Z or low→high |
| **Sort descending** | Click header again | Sorts Z→A or high→low |
| **Multi-sort** | Shift+Click column headers | Adds secondary/tertiary sorts |
| **Reorder columns** | Drag column header | Moves column position |
| **Hide/show columns** | Click "Column Settings" footer button | Toggle column visibility |
| **Toggle view mode** | Click "Observations" or "Access Points" | Switches data view |
| **Export CSV** | Click "Export CSV" button | Downloads filtered data |
| **Refresh data** | Click "Refresh" button | Reloads from server |
| **Clear filters** | Click "Clear All" in filter panel | Removes all active filters |

## Advanced Usage

### Save Filter Configuration

Add to `UnifiedNetworkExplorer.tsx`:

```typescript
// Save filters to localStorage
useEffect(() => {
  localStorage.setItem('savedFilters', JSON.stringify(filters));
}, [filters]);

// Load saved filters on mount
useEffect(() => {
  const saved = localStorage.getItem('savedFilters');
  if (saved) {
    setFilters(JSON.parse(saved));
  }
}, []);
```

### Custom Column Presets

Create role-based column presets:

```typescript
const COLUMN_PRESETS = {
  'network-admin': ['radio_type', 'ssid', 'bssid', 'channel', 'signal', 'security'],
  'security-analyst': ['radio_type', 'ssid', 'security', 'first_seen', 'last_seen', 'observations'],
  'gis-specialist': ['ssid', 'latitude', 'longitude', 'altitude', 'accuracy'],
  'full': UNIFIED_COLUMNS.map(c => c.id),
};

// Apply preset
const applyColumnPreset = (preset: keyof typeof COLUMN_PRESETS) => {
  setVisibleColumns(COLUMN_PRESETS[preset]);
};
```

### Filter Chaining

Combine multiple filters programmatically:

```typescript
// Find all strong WiFi networks with WPA3 near home
const criticalNetworks: UnifiedFilters = {
  radioTypes: ['wifi'],
  minSignal: -60,
  encryption: ['WPA3'],
  radiusSearch: {
    lat: 43.023,
    lng: -83.696,
    radiusMeters: 500,
  },
};

setFilters(criticalNetworks);
```

## API Testing

Test the backend directly:

```bash
# Combined filters (WiFi + strong signals + high quality)
curl "http://localhost:5000/api/v1/access-points?\
radio_types=wifi&\
min_signal=-60&\
data_quality=high&\
limit=10" | jq '.metadata'

# Should return:
{
  "total": <number>,
  "limit": 10,
  "offset": 0,
  "hasMore": <boolean>,
  "returned": <number>
}
```

## Performance Tips

### For Large Datasets (100K+ rows)

1. **Use Filters**: Always filter data before sorting/exporting
2. **Limit Visible Columns**: Show only needed columns (10-12 max)
3. **Pagination**: Use infinite scroll, don't load all data at once
4. **Index Columns**: Ensure database has indexes on frequently filtered/sorted columns

### Recommended Database Indexes

```sql
-- Add these if not present
CREATE INDEX idx_radio_technology ON app.wireless_access_points(radio_technology);
CREATE INDEX idx_signal ON app.wireless_access_points(max_signal_observed_dbm);
CREATE INDEX idx_data_quality ON app.wireless_access_points(data_quality);
CREATE INDEX idx_encryption ON app.access_point_latest_encryption(most_recent_encryption);
```

## Next Steps

1. ✅ Complete this quick start
2. 📖 Read full [implementation guide](./UNIFIED_VIEWS_IMPLEMENTATION.md)
3. 🧪 Run through the [testing checklist](./UNIFIED_VIEWS_IMPLEMENTATION.md#testing-checklist)
4. 🚀 Deploy to production
5. 📊 Gather user feedback
6. 🔧 Implement advanced features from [future enhancements](./UNIFIED_VIEWS_IMPLEMENTATION.md#future-enhancements)

## Support

- **Issues**: https://github.com/anthropics/shadowcheck/issues
- **Docs**: `/docs/` directory
- **API Docs**: http://localhost:5000/api/v1/docs

## Summary

You now have:
- ✅ Standardized column structure across all views
- ✅ Unified filtering with radio type support
- ✅ Multi-column sorting (Shift+Click)
- ✅ Column reordering (drag & drop)
- ✅ View mode toggle (Observations ↔ Access Points)
- ✅ Filter presets for common use cases
- ✅ CSV export functionality
- ✅ Fixed backend enum filtering issues

**Total time to implement**: ~5-10 minutes (rebuild + integrate + test)

Happy filtering! 🎉
