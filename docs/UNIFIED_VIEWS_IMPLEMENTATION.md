# ShadowCheck Unified Views - Implementation Guide

## Overview

This document describes the implementation of standardized, unified views across all ShadowCheck data tables. The goal is to provide consistent column structures, filtering, sorting, and user experience whether viewing raw observations or aggregated access points.

## Architecture

### Core Components

1. **`lib/unifiedColumns.ts`** - Standardized column definitions
2. **`lib/unifiedFilters.ts`** - Unified filtering system
3. **`components/UnifiedFilterPanel.tsx`** - Filter UI component
4. **`components/UnifiedDataTable.tsx`** - Table component with sorting/reordering
5. **`components/UnifiedNetworkExplorer.tsx`** - Combined observations + access points view

### Key Features

- ✅ **Standardized Columns**: Same column names and formatting across all views
- ✅ **Multi-Column Sorting**: Shift+Click to add secondary/tertiary sorts
- ✅ **Column Reordering**: Drag and drop to rearrange columns
- ✅ **Column Visibility**: Show/hide columns via settings panel
- ✅ **Radio Type Filtering**: Filter by WiFi, Bluetooth, BLE, Cellular
- ✅ **Advanced Filtering**: Signal strength, security type, data quality, manufacturer
- ✅ **View Mode Toggle**: Switch between observations and aggregated access points
- ✅ **Filter Presets**: Quick filters for common use cases
- ✅ **Export to CSV**: Download filtered/sorted data

## Standardized Columns

All views now use the same column structure:

| Column ID | Label | Description | Available In |
|-----------|-------|-------------|--------------|
| `radio_type` | TYPE | Radio technology (WiFi, BT, etc.) | Both |
| `ssid` | SSID / NAME | Network name | Both |
| `bssid` | BSSID / MAC | Hardware MAC address | Both |
| `manufacturer` | MANUFACTURER | Device manufacturer | Both |
| `signal` | SIGNAL | Signal strength (dBm) | Both |
| `frequency` | FREQUENCY | Operating frequency | Both |
| `channel` | CHANNEL | WiFi channel | Observations only |
| `security` | SECURITY | Encryption/security type | Both |
| `first_seen` | FIRST SEEN | First observation timestamp | Both |
| `last_seen` | LAST SEEN | Most recent timestamp | Both |
| `observations` | OBS | Number of observations | Access Points |
| `sources` | SOURCES | Unique data sources | Access Points |
| `mobility` | MOBILITY | Mobility confidence | Access Points |
| `data_quality` | QUALITY | Data quality rating | Access Points |
| `latitude` | LATITUDE | GPS latitude | Both |
| `longitude` | LONGITUDE | GPS longitude | Both |
| `altitude` | ALTITUDE | Elevation (meters) | Observations only |
| `accuracy` | ACC | GPS accuracy | Observations only |
| `oui` | OUI | OUI prefix | Access Points |
| `is_hidden` | HIDDEN | Hidden SSID | Both |
| `is_mobile` | MOBILE | Mobile device | Access Points |

### Column Configuration

Columns are defined in `lib/unifiedColumns.ts`:

```typescript
export interface UnifiedColumnConfig {
  id: string;                    // Unique column ID
  label: string;                 // Display label
  description: string;           // Tooltip description
  category: 'identity' | 'radio' | 'location' | 'temporal' | 'metadata';
  width?: number;                // Column width in pixels
  sortable: boolean;             // Can be sorted
  filterable: boolean;           // Can be filtered
  defaultVisible: boolean;       // Visible by default
  observationField?: string;     // Field name in observation data
  accessPointField?: string;     // Field name in access point data
  formatter?: (value: any, row?: any) => string | JSX.Element;
}
```

## Filtering System

### Unified Filters

The `UnifiedFilters` interface supports all filter types:

```typescript
export interface UnifiedFilters {
  // Text search
  search?: string;

  // Radio type filter
  radioTypes?: ('wifi' | 'bluetooth' | 'ble' | 'cellular')[];

  // Signal strength range
  minSignal?: number;
  maxSignal?: number;

  // Security types
  securityTypes?: string[];
  encryption?: string[];

  // Data quality (access points only)
  dataQuality?: ('high' | 'medium' | 'low')[];

  // Boolean flags
  hiddenOnly?: boolean;
  mobileOnly?: boolean;

  // Spatial filters
  bbox?: [number, number, number, number];
  radiusSearch?: { lat: number; lng: number; radiusMeters: number };
}
```

### Filter Presets

Pre-configured filters for common use cases:

```typescript
export const FILTER_PRESETS = {
  strongSignals: { minSignal: -60, maxSignal: 0 },
  wifiOnly: { radioTypes: ['wifi'] },
  bluetoothOnly: { radioTypes: ['bluetooth', 'ble'] },
  secureNetworks: { encryption: ['WPA2', 'WPA3'] },
  openNetworks: { encryption: ['None'] },
  highQuality: { dataQuality: ['high'] },
};
```

## Multi-Column Sorting

Users can sort by multiple columns simultaneously:

1. **Click** a column header → Sort by that column (ascending)
2. **Click again** → Toggle to descending
3. **Click third time** → Remove sort
4. **Shift+Click** → Add secondary/tertiary sort columns

Example: Sort by TYPE (ascending), then SIGNAL (descending), then SSID (ascending)

Implementation in `UnifiedDataTable.tsx`:

```typescript
const handleSort = (columnId: string, event: React.MouseEvent) => {
  if (event.shiftKey) {
    // Multi-column sort - add to existing sorts
    const existingIndex = sortConfig.findIndex(s => s.columnId === columnId);
    if (existingIndex >= 0) {
      // Toggle direction or remove
      const current = sortConfig[existingIndex];
      if (current.direction === 'asc') {
        newSortConfig = sortConfig.map((s, i) =>
          i === existingIndex ? { ...s, direction: 'desc' } : s
        );
      } else {
        newSortConfig = sortConfig.filter((_, i) => i !== existingIndex);
      }
    } else {
      // Add new sort column
      newSortConfig = [...sortConfig, { columnId, direction: 'asc' }];
    }
  } else {
    // Single column sort
    newSortConfig = [{ columnId, direction: 'asc' }];
  }
};
```

## Column Reordering

Drag and drop column headers to reorder:

```typescript
const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
  e.preventDefault();
  if (!draggedColumn || !onColumnOrderChange) return;

  const currentOrder = columnOrder || displayColumns.map(c => c.id);
  const draggedIndex = currentOrder.indexOf(draggedColumn);
  const targetIndex = currentOrder.indexOf(targetColumnId);

  const newOrder = [...currentOrder];
  newOrder.splice(draggedIndex, 1);
  newOrder.splice(targetIndex, 0, draggedColumn);

  onColumnOrderChange(newOrder);
};
```

## Backend Integration

### Access Points API

**Endpoint**: `GET /api/v1/access-points`

**Fixed Issues**:
- ✅ Enum type casting for `radio_technology` (was failing with "operator does not exist" error)
- ✅ Enum type casting for `data_quality`

**Changes Made** (`server/routes/accessPoints.ts`):

```typescript
// Radio type filter - FIXED
if (req.query.radio_types) {
  const radioTypes = String(req.query.radio_types).split(',').map((t: string) => t.trim());
  whereClauses.push(`radio_technology::text = ANY($${paramIndex}::text[])`);  // Added ::text cast
  queryParams.push(radioTypes);
  paramIndex++;
}

// Data quality filter - FIXED
if (req.query.data_quality) {
  const qualityLevels = String(req.query.data_quality).split(',').map((q: string) => q.trim());
  whereClauses.push(`data_quality::text = ANY($${paramIndex}::text[])`);  // Added ::text cast
  queryParams.push(qualityLevels);
  paramIndex++;
}
```

### Observations API

The observations endpoint uses `useInfiniteNetworkObservations` which queries `locations_legacy` table. It already supports:
- ✅ Search filtering (SSID/BSSID)
- ✅ Radio type filtering
- ✅ Signal strength range

## Integration Steps

### Step 1: Replace Existing Views

**Option A: Replace AccessPointsPage**

```typescript
// client/src/components/AccessPointsPage.tsx
import { UnifiedNetworkExplorer } from './UnifiedNetworkExplorer';

export function AccessPointsPage() {
  return <UnifiedNetworkExplorer />;
}
```

**Option B: Add as New Tab**

```typescript
// client/src/pages/visualization.tsx
<TabsContent value="unified" className="space-y-6">
  <div className="premium-card overflow-hidden" style={{ height: 'calc(100vh - 20rem)' }}>
    <UnifiedNetworkExplorer />
  </div>
</TabsContent>
```

### Step 2: Update Navigation

```typescript
// Add to sidebar or navigation
<TabsTrigger value="unified" data-testid="tab-unified">
  <Layers className="mr-2 h-4 w-4" />
  Network Explorer
</TabsTrigger>
```

### Step 3: Test Filtering

Test all filter combinations:

```bash
# Test radio type filtering
curl "http://localhost:5000/api/v1/access-points?radio_types=wifi,bluetooth&limit=10"

# Test data quality filtering
curl "http://localhost:5000/api/v1/access-points?data_quality=high&limit=10"

# Test signal strength filtering
curl "http://localhost:5000/api/v1/access-points?min_signal=-60&max_signal=-30&limit=10"

# Test combined filters
curl "http://localhost:5000/api/v1/access-points?radio_types=wifi&data_quality=high,medium&min_signal=-70&limit=10"
```

## Security Column Standardization

All views now use a consistent security format:

### WiFi Networks
```
[WPA-PSK-CCMP][WPA2-PSK-CCMP][ESS]
[WPA2-PSK-CCMP][ESS]
[WEP][ESS]
Open / None
```

### Bluetooth Devices
```
Uncategorized
Misc
Unknown
```

Format is determined by the `encryption` field from observations or `most_recent_encryption` from access points.

## Usage Examples

### Example 1: View All Open WiFi Networks

1. Click "WiFi Only" preset button
2. Click encryption filter and select "Open"
3. Results show only open WiFi networks

### Example 2: Find Strong Bluetooth Signals Near Home

1. Click "Bluetooth Only" preset button
2. Click "Strong Signals" preset button (applies -60 to 0 dBm filter)
3. Use spatial filter to set radius around home

### Example 3: Export High-Quality Access Points

1. Toggle to "Access Points" view mode
2. Select "High" data quality filter
3. Click "Export CSV" button

### Example 4: Multi-Column Sort by Type, Signal, Name

1. Click "TYPE" column header (sort by type ascending)
2. Shift+Click "SIGNAL" column header (add secondary sort by signal)
3. Shift+Click "SSID / NAME" column header (add tertiary sort by name)

### Example 5: Reorder Columns

1. Click "Column Settings" in table footer
2. Or drag column headers directly to reorder
3. Signal column can be moved before SSID, etc.

## Troubleshooting

### Issue: Filters Not Working

**Symptom**: Setting filters doesn't change results

**Solution**:
1. Check backend logs for SQL errors
2. Verify enum casting is applied (::text)
3. Rebuild Docker image: `docker-compose build --no-cache backend`

### Issue: Column Reordering Not Persisting

**Symptom**: Column order resets on page refresh

**Solution**: Add localStorage persistence:

```typescript
// Save to localStorage
useEffect(() => {
  if (columnOrder) {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
  }
}, [columnOrder]);

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('columnOrder');
  if (saved) {
    setColumnOrder(JSON.parse(saved));
  }
}, []);
```

### Issue: Multi-Column Sort Not Working

**Symptom**: Shift+Click doesn't add secondary sort

**Solution**: Check that `onSortChange` callback is provided and the parent component maintains `sortConfig` state.

## Performance Considerations

### Virtual Scrolling

The table uses `@tanstack/react-virtual` for efficient rendering of large datasets:

```typescript
const rowVirtualizer = useVirtualizer({
  count: sortedData.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 48,    // Row height in pixels
  overscan: 10,              // Extra rows to render outside viewport
});
```

### Infinite Scroll

Both observations and access points use infinite scroll pagination:

- **Page Size**: 500 records per page
- **Auto-Load**: Fetches next page when scrolling near bottom
- **Total Count Caching**: Backend caches total count for 5 minutes

### Filtering Performance

- Client-side filtering is applied after data fetch (for security types in observations view)
- Server-side filtering is used for all other filters to reduce data transfer
- Debounced search input prevents excessive API calls

## Migration Path

### Phase 1: Add Unified View (Complete)
- ✅ Create new unified components
- ✅ Fix backend enum filtering
- ✅ Test with sample data

### Phase 2: Integrate into Existing Pages
- [ ] Replace AccessPointsPage with UnifiedNetworkExplorer
- [ ] Update AccessPointsExplorerView to use UnifiedFilterPanel
- [ ] Add unified view as tab in visualization page

### Phase 3: Deprecate Old Components
- [ ] Remove old AccessPointsFilterPanel (replaced by UnifiedFilterPanel)
- [ ] Remove redundant column configuration logic
- [ ] Clean up unused imports

### Phase 4: Add Advanced Features
- [ ] Saved filter configurations
- [ ] Column presets (Network Admin, Security Analyst, etc.)
- [ ] Advanced field filtering (custom SQL-like queries)
- [ ] Batch operations on selected rows

## Testing Checklist

- [ ] WiFi filtering works (shows only WiFi networks)
- [ ] Bluetooth filtering works (shows only BT/BLE devices)
- [ ] Combined radio type filtering (WiFi + BT shows both)
- [ ] Signal strength range filtering (-70 to -30 dBm)
- [ ] Security type filtering (WPA2, WPA3, Open)
- [ ] Data quality filtering (high, medium, low)
- [ ] Search by SSID works
- [ ] Search by BSSID/MAC works
- [ ] Single column sort (click header)
- [ ] Multi-column sort (Shift+Click)
- [ ] Column reordering (drag and drop)
- [ ] Column visibility toggle
- [ ] View mode toggle (Observations ↔ Access Points)
- [ ] Filter presets work
- [ ] CSV export works
- [ ] Infinite scroll loads more data
- [ ] Virtual scrolling performs well with 100K+ rows

## API Reference

### Filter Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `search` | string | `?search=linksys` | SSID or BSSID search |
| `radio_types` | string | `?radio_types=wifi,bluetooth` | Comma-separated radio types |
| `min_signal` | number | `?min_signal=-70` | Minimum signal strength (dBm) |
| `max_signal` | number | `?max_signal=-30` | Maximum signal strength (dBm) |
| `data_quality` | string | `?data_quality=high,medium` | Data quality levels |
| `encryption` | string | `?encryption=WPA2,WPA3` | Security/encryption types |
| `bbox` | string | `?bbox=-83.7,43.0,-83.6,43.1` | Bounding box (minLng,minLat,maxLng,maxLat) |
| `radius_lat` | number | `?radius_lat=43.02` | Radius search center latitude |
| `radius_lng` | number | `?radius_lng=-83.69` | Radius search center longitude |
| `radius_meters` | number | `?radius_meters=1000` | Radius in meters |
| `limit` | number | `?limit=500` | Page size (max 1000) |
| `offset` | number | `?offset=0` | Pagination offset |

## Future Enhancements

### Planned Features

1. **Saved Views**: Save filter + column configurations
2. **Quick Search**: Global search across all fields
3. **Bulk Actions**: Classify multiple networks at once
4. **Column Grouping**: Group by radio type, manufacturer, etc.
5. **Advanced Filtering**: SQL-like query builder
6. **Real-Time Updates**: WebSocket streaming for live data
7. **Comparison Mode**: Side-by-side view of two filters
8. **Heat Maps**: Signal strength heat map overlay
9. **Timeline View**: Temporal visualization of observations
10. **Export Formats**: JSON, PCAP, KML in addition to CSV

## Support

For questions or issues:
- GitHub Issues: https://github.com/anthropics/shadowcheck/issues
- Documentation: /docs/
- API Docs: http://localhost:5000/api/v1/docs (when running)
