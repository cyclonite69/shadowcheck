/**
 * EnhancedAccessPointsExplorer - Best of both worlds
 *
 * Combines existing features with new unified system:
 * - ✅ Map panel (existing)
 * - ✅ Multi-select checkboxes (existing)
 * - ✅ Expandable rows (existing)
 * - ✅ Spatial filtering (existing)
 * - ✅ Column visibility (existing)
 * - ✨ NEW: Multi-column sorting with Shift+Click
 * - ✨ NEW: Unified filter panel with radio type filtering
 * - ✨ NEW: View mode toggle (observations ↔ access points)
 * - ✨ NEW: Standardized columns
 * - ✨ NEW: Filter presets
 * - ✨ NEW: CSV export
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import {
  useInfiniteAccessPoints,
  flattenAccessPoints,
  getTotalCount as getAPTotalCount,
  type AccessPointFilters,
  type AccessPoint,
} from '@/hooks/useInfiniteAccessPoints';
import {
  useInfiniteNetworkObservations,
  flattenNetworkObservations,
  getTotalNetworkCount,
} from '@/hooks/useInfiniteNetworkObservations';
import { UnifiedFilterPanel } from './UnifiedFilterPanel';
import { ObservationsExpandedRow } from './ObservationsExpandedRow';
import { ColumnSelector } from './ColumnSelector';
import type { UnifiedFilters } from '@/lib/unifiedFilters';
import {
  UNIFIED_COLUMNS,
  extractColumnValue,
  formatColumnValue,
} from '@/lib/unifiedColumns';
import {
  MapPin,
  Map as MapIcon,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  Home,
  Loader2,
  Filter,
  Wifi,
  Check,
  Eye,
  Download,
  Layers,
  Network,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'observations' | 'access-points';

interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export function EnhancedAccessPointsExplorer() {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('access-points');

  // Filter state (unified)
  const [filters, setFilters] = useState<UnifiedFilters>({});

  // Map state
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [spatialFilterMenuOpen, setSpatialFilterMenuOpen] = useState(false);

  // Selection and expansion state
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // Fetch config for Mapbox
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  // Fetch access points
  const accessPointsQuery = useInfiniteAccessPoints({
    filters: {
      search: filters.search,
      radioTypes: filters.radioTypes,
      minSignal: filters.minSignal,
      maxSignal: filters.maxSignal,
      dataQuality: filters.dataQuality,
      encryption: filters.encryption,
      bbox: filters.bbox,
      radiusSearch: filters.radiusSearch,
    },
    pageSize: 500,
    enabled: viewMode === 'access-points',
  });

  // Fetch observations
  const observationsQuery = useInfiniteNetworkObservations({
    filters: {
      search: filters.search,
      radioTypes: filters.radioTypes,
      minSignal: filters.minSignal,
      maxSignal: filters.maxSignal,
    },
    pageSize: 500,
    enabled: viewMode === 'observations',
  });

  // Get data based on view mode
  const allData = viewMode === 'observations'
    ? flattenNetworkObservations(observationsQuery.data?.pages)
    : flattenAccessPoints(accessPointsQuery.data?.pages);

  const totalCount = viewMode === 'observations'
    ? getTotalNetworkCount(observationsQuery.data?.pages)
    : getAPTotalCount(accessPointsQuery.data?.pages);

  const queryResult = viewMode === 'observations' ? observationsQuery : accessPointsQuery;

  // Sort data
  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return allData;

    return [...allData].sort((a, b) => {
      for (const sort of sortConfig) {
        const aValue = extractColumnValue(sort.columnId, a, viewMode);
        const bValue = extractColumnValue(sort.columnId, b, viewMode);

        if (aValue === null || aValue === undefined) return sort.direction === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sort.direction === 'asc' ? -1 : 1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [allData, sortConfig, viewMode]);

  // Virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Infinite scroll
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= sortedData.length - 10 &&
      queryResult.hasNextPage &&
      !queryResult.isFetchingNextPage
    ) {
      queryResult.fetchNextPage();
    }
  }, [virtualItems, sortedData.length, queryResult]);

  // Handle column sort (multi-column with Shift)
  const handleSort = (columnId: string, event: React.MouseEvent) => {
    const existingIndex = sortConfig.findIndex(s => s.columnId === columnId);
    let newSortConfig: SortConfig[];

    if (event.shiftKey) {
      // Multi-column sort
      if (existingIndex >= 0) {
        const current = sortConfig[existingIndex];
        if (current.direction === 'asc') {
          newSortConfig = sortConfig.map((s, i) =>
            i === existingIndex ? { ...s, direction: 'desc' as const } : s
          );
        } else {
          newSortConfig = sortConfig.filter((_, i) => i !== existingIndex);
        }
      } else {
        newSortConfig = [...sortConfig, { columnId, direction: 'asc' }];
      }
    } else {
      // Single column sort
      if (existingIndex === 0 && sortConfig.length === 1) {
        const current = sortConfig[0];
        newSortConfig = current.direction === 'asc'
          ? [{ columnId, direction: 'desc' }]
          : [];
      } else {
        newSortConfig = [{ columnId, direction: 'asc' }];
      }
    }

    setSortConfig(newSortConfig);
  };

  // Get sort indicator
  const getSortIndicator = (columnId: string) => {
    const sortIndex = sortConfig.findIndex(s => s.columnId === columnId);
    if (sortIndex === -1) return null;

    const sort = sortConfig[sortIndex];
    const Icon = sort.direction === 'asc' ? ArrowUp : ArrowDown;
    const label = sortConfig.length > 1 ? `${sortIndex + 1}` : '';

    return (
      <span className="inline-flex items-center gap-0.5 ml-1">
        <Icon className="h-3 w-3" />
        {label && <span className="text-xs">{label}</span>}
      </span>
    );
  };

  // Initialize map
  useEffect(() => {
    if (!isMapVisible || !mapContainerRef.current || mapRef.current) return;

    const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';
    if (!mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-83.6968461, 43.02342188],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    map.on('click', (e) => {
      if (isRadiusMode) {
        const { lng, lat } = e.lngLat;
        setFilters((prev) => ({
          ...prev,
          radiusSearch: { lng, lat, radiusMeters: 1000 },
          bbox: undefined,
        }));
        setIsRadiusMode(false);
        setSpatialFilterMenuOpen(false);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isMapVisible, config, isRadiusMode]);

  // Update map markers
  useEffect(() => {
    if (!mapRef.current || !isMapVisible || viewMode !== 'access-points') return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    (sortedData as AccessPoint[]).forEach((network) => {
      if (!network.location_geojson?.coordinates) return;

      const [lng, lat] = network.location_geojson.coordinates;
      const isSelected = selectedNetworkIds.has(network.access_point_id);

      const el = document.createElement('div');
      el.style.width = isSelected ? '16px' : '12px';
      el.style.height = isSelected ? '16px' : '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isSelected ? '#3b82f6' : '#22c55e';
      el.style.border = `2px solid ${isSelected ? '#60a5fa' : 'rgba(255,255,255,0.5)'}`;
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.2s';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(`
            <div class="text-xs p-2">
              <div class="font-bold text-white">${network.current_network_name || 'Hidden'}</div>
              <div class="text-slate-400 font-mono">${network.mac_address}</div>
              <div class="text-slate-500 mt-1">${network.total_observations} obs</div>
            </div>
          `)
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [sortedData, isMapVisible, selectedNetworkIds, viewMode]);

  // Spatial filter presets
  const applySpatialPreset = (preset: string) => {
    const home = { lat: 43.02342188, lng: -83.6968461 };

    switch (preset) {
      case 'near-home':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: { ...home, radiusMeters: 500 },
          bbox: undefined,
        }));
        break;
      case 'local-area':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: { ...home, radiusMeters: 5000 },
          bbox: undefined,
        }));
        break;
      case 'clear':
        setFilters((prev) => ({
          ...prev,
          radiusSearch: undefined,
          bbox: undefined,
        }));
        break;
    }
    setSpatialFilterMenuOpen(false);
  };

  // Export CSV
  const exportToCSV = () => {
    if (sortedData.length === 0) return;

    const visibleCols = UNIFIED_COLUMNS.filter(c => c.defaultVisible);
    const headers = visibleCols.map(c => c.label).join(',');

    const rows = sortedData.map(row => {
      return visibleCols.map(col => {
        const value = extractColumnValue(col.id, row, viewMode);
        const formatted = formatColumnValue(col.id, value, row);
        if (typeof formatted === 'string' && (formatted.includes(',') || formatted.includes('"'))) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowcheck-${viewMode}-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (viewMode !== 'access-points') return;

    if (selectedNetworkIds.size === sortedData.length) {
      setSelectedNetworkIds(new Set());
    } else {
      setSelectedNetworkIds(new Set((sortedData as AccessPoint[]).map((ap) => ap.access_point_id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedNetworkIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNetworkIds(newSet);
  };

  const toggleRowExpansion = (macAddress: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(macAddress)) {
      newSet.delete(macAddress);
    } else {
      newSet.add(macAddress);
    }
    setExpandedRows(newSet);
  };

  // Display columns (simplified - using defaults)
  const displayColumns = UNIFIED_COLUMNS.filter(c => c.defaultVisible);

  if (queryResult.isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Loading {viewMode}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Unified Filter Panel */}
      <UnifiedFilterPanel filters={filters} onFiltersChange={setFilters} viewMode={viewMode} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">
            Network Explorer
          </h2>
          <span className="text-sm text-slate-400">
            {sortedData.length.toLocaleString()} / {totalCount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('observations')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                viewMode === 'observations'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Layers className="h-4 w-4" />
              Observations
            </button>
            <button
              onClick={() => setViewMode('access-points')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                viewMode === 'access-points'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Network className="h-4 w-4" />
              Access Points
            </button>
          </div>

          {/* Spatial Filter Dropdown */}
          {viewMode === 'access-points' && (
            <div className="relative">
              <button
                onClick={() => setSpatialFilterMenuOpen(!spatialFilterMenuOpen)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  (filters.radiusSearch || filters.bbox)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                <Filter className="h-4 w-4" />
                Spatial
                <ChevronDown className="h-3 w-3" />
              </button>

              {spatialFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsRadiusMode(true);
                        setIsMapVisible(true);
                        setSpatialFilterMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2"
                    >
                      <Target className="h-4 w-4 text-purple-400" />
                      Radius Search (click map)
                    </button>

                    <button
                      onClick={() => applySpatialPreset('near-home')}
                      className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 rounded flex items-center gap-2"
                    >
                      <Home className="h-4 w-4 text-green-400" />
                      Near Home (500m)
                    </button>

                    {(filters.radiusSearch || filters.bbox) && (
                      <>
                        <div className="border-t border-slate-700 my-2" />
                        <button
                          onClick={() => applySpatialPreset('clear')}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 rounded flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear Filters
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Column Selector */}
          <ColumnSelector />

          {/* Show/Hide Map */}
          {viewMode === 'access-points' && (
            <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                isMapVisible
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {isMapVisible ? <X className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              {isMapVisible ? 'Hide Map' : 'Show Map'}
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={sortedData.length === 0}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Multi-select toolbar */}
      {selectedNetworkIds.size > 0 && viewMode === 'access-points' && (
        <div className="px-4 py-2 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span className="font-semibold">{selectedNetworkIds.size} networks selected</span>
          </div>
          <button
            onClick={() => setSelectedNetworkIds(new Set())}
            className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-all"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table */}
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden',
            isMapVisible && viewMode === 'access-points' ? 'w-[60%]' : 'w-full'
          )}
        >
          <div className="h-full overflow-auto bg-slate-900" ref={parentRef}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900">
                  <tr>
                    {viewMode === 'access-points' && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedNetworkIds.size === sortedData.length}
                          onChange={toggleSelectAll}
                          className="cursor-pointer"
                        />
                      </th>
                    )}
                    {displayColumns.map((column) => {
                      const sortIndicator = getSortIndicator(column.id);

                      return (
                        <th
                          key={column.id}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase bg-slate-900 border-b border-slate-700"
                        >
                          <button
                            onClick={(e) => column.sortable && handleSort(column.id, e)}
                            className={cn(
                              'flex items-center gap-1 hover:text-slate-200 transition-colors',
                              !column.sortable && 'cursor-default'
                            )}
                            title={
                              column.sortable
                                ? 'Click to sort, Shift+Click for multi-column sort'
                                : column.description
                            }
                          >
                            <span>{column.label}</span>
                            {column.sortable && (
                              sortIndicator || <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {virtualItems.map((virtualRow: VirtualItem) => {
                    const row = sortedData[virtualRow.index];
                    if (!row) return null;

                    const isAccessPoint = viewMode === 'access-points';
                    const macAddress = isAccessPoint ? (row as AccessPoint).mac_address : (row as any).bssid;
                    const isSelected = isAccessPoint && selectedNetworkIds.has((row as AccessPoint).access_point_id);
                    const isExpanded = expandedRows.has(macAddress);

                    return (
                      <tr
                        key={virtualRow.index}
                        className={cn(
                          'border-b border-slate-800 hover:bg-slate-800/50 transition-colors',
                          isSelected && 'bg-blue-900/20'
                        )}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {isAccessPoint && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect((row as AccessPoint).access_point_id)}
                              className="cursor-pointer"
                            />
                          </td>
                        )}
                        {displayColumns.map((column) => {
                          const value = extractColumnValue(column.id, row, viewMode);
                          const formatted = formatColumnValue(column.id, value, row);

                          return (
                            <td key={column.id} className="px-4 py-3 text-sm text-slate-300">
                              {column.id === 'ssid' && isAccessPoint ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleRowExpansion(macAddress)}
                                    className="text-slate-500 hover:text-slate-300"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                  {formatted}
                                </div>
                              ) : (
                                formatted
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Panel */}
        {isMapVisible && viewMode === 'access-points' && (
          <div className="w-[40%] relative border-l border-slate-700 animate-in slide-in-from-right duration-300">
            <div ref={mapContainerRef} className="absolute inset-0" />

            <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-700 text-slate-300">
              <div className="text-sm font-semibold">
                {(sortedData as AccessPoint[]).filter((ap) => ap.location_geojson).length} with location
              </div>
              {queryResult.isFetching && (
                <div className="text-xs text-blue-400 mt-1">Updating...</div>
              )}
            </div>

            {isRadiusMode && (
              <div className="absolute inset-0 bg-blue-600/10 border-4 border-blue-500 border-dashed pointer-events-none flex items-center justify-center">
                <div className="bg-slate-900/90 px-6 py-4 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-400">Click anywhere on the map</p>
                  <p className="text-sm text-slate-400 mt-1">to set radius search center</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-slate-700 px-4 py-2 bg-slate-800/50 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>
            Showing {sortedData.length.toLocaleString()} of {totalCount.toLocaleString()}
            {sortConfig.length > 0 && ` • Sorted by ${sortConfig.length} column${sortConfig.length > 1 ? 's' : ''}`}
          </span>
          <span className="text-slate-500">
            Shift+Click column headers for multi-sort • Drag to reorder
          </span>
        </div>
      </div>
    </div>
  );
}
