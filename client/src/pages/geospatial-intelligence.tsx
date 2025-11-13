/**
 * Geospatial Intelligence Page
 *
 * Complete Access Points functionality:
 * - Interactive map with filters
 * - Full observations table
 * - No tabs - single focused interface
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteNetworkObservations, type NetworkFilters } from '@/hooks/useInfiniteNetworkObservations';
import { flattenNetworkObservations } from '@/types';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { useNetworkObservationsByBssid } from '@/hooks/useNetworkObservationsByBssid';
import { NetworkObservationsTableView } from '@/components/NetworkObservationsTableView';
import { ObservationColumnSelector } from '@/components/ObservationColumnSelector';
import { AccessPointsMapView } from '@/components/AccessPointsMapView';
import { FilterBar } from '@/components/FilterBar';
import { categorizeSecurityType } from '@/lib/securityDecoder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { type ImperativePanelHandle } from 'react-resizable-panels';
import { type SortingState, type Updater } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';

export default function GeospatialIntelligencePage() {
  const queryClient = useQueryClient();

  // Refs for controlling panel collapse/expand
  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const [topPanelCollapsed, setTopPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);

  // Column visibility state
  const columnConfig = useNetworkObservationColumns();

  // Selected rows state for map
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Get Mapbox token from environment
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

  useEffect(() => {
    localStorage.setItem('shadowcheck_column_order', JSON.stringify(columnConfig.columnOrder));
  }, [columnConfig.columnOrder]);

  // Filter state
  const [filters, setFilters] = useState<NetworkFilters>({
    search: '',
    radioTypes: [],
    minSignal: undefined,
    maxSignal: undefined,
    sortBy: 'observed_at',
    sortDir: 'desc',
    sortColumns: [{ id: 'observed_at', desc: true }],
  });

  // Security filter state (factual security types)
  const [securityFilters, setSecurityFilters] = useState<Set<string>>(new Set());

  // Map style state with persistence
  const [mapStyle, setMapStyle] = useState<'dark' | 'standard' | 'satellite'>(() => {
    const saved = sessionStorage.getItem('mapStyle');
    return (saved as 'dark' | 'standard' | 'satellite') || 'dark';
  });

  const handleMapStyleChange = (newStyle: 'dark' | 'standard' | 'satellite') => {
    setMapStyle(newStyle);
    sessionStorage.setItem('mapStyle', newStyle);
  };

  // Spatial filter state
  const [centerPoint, setCenterPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(1000); // meters
  const [gpsLoading, setGpsLoading] = useState(false);
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Date range filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch home location from database on mount
  useEffect(() => {
    fetch('/api/v1/locations/home')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.data) {
          setHomeLocation({
            lat: data.data.latitude,
            lng: data.data.longitude
          });
          console.log('[Location] Home location loaded:', data.data);
        }
      })
      .catch(err => {
        console.error('[Location] Failed to fetch home location:', err);
      });
  }, []);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // GPS handler to get current location
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCenterPoint(point);
        setGpsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location: ' + error.message);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Fetch data from locations_legacy with infinite scroll
  const queryResult = useInfiniteNetworkObservations({
    filters: {
      ...filters,
      search: debouncedSearch,
      dateStart: startDate || undefined,
      dateEnd: endDate || undefined,
      // Spatial filtering: only show networks within radius of center point
      radiusLat: centerPoint?.lat,
      radiusLng: centerPoint?.lng,
      radiusMeters: centerPoint ? searchRadius : undefined,
    },
    pageSize: 500,
    enabled: true,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = queryResult;

  // Calculate stats
  const totalCount = data?.pages?.[0]?.total_count ?? 0;
  const loadedCount = data?.pages?.reduce((sum, page) => sum + page.count, 0) ?? 0;

  // Flatten all pages
  const allObservations = useMemo(() => flattenNetworkObservations(data?.pages || []), [data?.pages]);

  // Apply client-side security filtering by type
  const tableData = useMemo(() => {
    if (securityFilters.size === 0) return allObservations;
    return allObservations.filter((observation: any) => {
      const securityType = categorizeSecurityType(observation.capabilities, observation.type);
      return securityFilters.has(securityType);
    });
  }, [allObservations, securityFilters]);

  // Get selected BSSIDs from checked rows
  const selectedBssids = useMemo(() => {
    return tableData
      .filter((obs, index) => selectedRows[index.toString()])
      .map(obs => obs.bssid);
  }, [tableData, selectedRows]);

  // Fetch ALL observations for selected BSSIDs (ungrouped - every observation point)
  const { data: allObservationsForSelected = [] } = useNetworkObservationsByBssid(selectedBssids);

  // Functions to toggle panel collapse/expand
  const toggleTopPanel = () => {
    const panel = topPanelRef.current;
    if (panel) {
      if (topPanelCollapsed) {
        panel.expand();
        setTopPanelCollapsed(false);
      } else {
        panel.collapse();
        setTopPanelCollapsed(true);
      }
    }
  };

  const toggleBottomPanel = () => {
    const panel = bottomPanelRef.current;
    if (panel) {
      if (bottomPanelCollapsed) {
        panel.expand();
        setBottomPanelCollapsed(false);
      } else {
        panel.collapse();
        setBottomPanelCollapsed(true);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="flex-shrink-0 px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="icon-container w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 shadow-lg shadow-green-500/30">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                Geospatial Intelligence
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Interactive mapping and spatial analysis of network observations
              </p>
            </div>
          </div>
        </div>

        {/* Content Area - Map + Table */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Resizable Split View: Filters + Map + Table */}
          <ResizablePanelGroup direction="vertical" className="flex-1">
            {/* Filter Panel (Top) - Collapsible to expand map upward */}
            <ResizablePanel
              ref={topPanelRef}
              defaultSize={15}
              minSize={5}
              maxSize={30}
              collapsible
              collapsedSize={5}
              onCollapse={() => setTopPanelCollapsed(true)}
              onExpand={() => setTopPanelCollapsed(false)}
            >
              <div className="h-full overflow-hidden border-b border-slate-700 bg-slate-800/50 relative">
                {/* Collapse/Expand Button */}
                <button
                  onClick={toggleTopPanel}
                  className="absolute top-2 right-2 z-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg p-2 transition-colors shadow-lg"
                  title={topPanelCollapsed ? "Expand filters" : "Collapse filters to show more map"}
                >
                  {topPanelCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-slate-300" />
                  )}
                </button>
                <div className="px-6 py-4 space-y-4">
                  {/* Title and stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-200">
                        Network Observations
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Browse {totalCount.toLocaleString()} network observations from locations_legacy • Multi-column sorting with Shift+Click
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => columnConfig.resetToDefaults()}
                        className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      >
                        Reset Columns
                      </Button>
                      <ObservationColumnSelector />
                    </div>
                  </div>

                  {/* Search and Unified Filter Bar */}
                  <div className="space-y-3">
                    {/* Combined Row: Search input + Filter Bar */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative flex-shrink-0 w-64">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="text"
                          placeholder="Search SSID, BSSID, or Manufacturer..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                          }
                          className="pl-8 pr-3 py-2 h-9 text-sm bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                        />
                      </div>

                      {/* Stats */}
                      <div className="text-sm text-slate-400 ml-auto order-last">
                        {isLoading ? (
                          <span>Loading...</span>
                        ) : (
                          <span className="font-medium">
                            Showing {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Unified Filter Bar on same row */}
                      <FilterBar
                      filters={filters}
                      onFiltersChange={setFilters}
                      securityFilters={securityFilters}
                      onSecurityFiltersChange={setSecurityFilters}
                      centerPoint={centerPoint}
                      onCenterPointChange={setCenterPoint}
                      searchRadius={searchRadius}
                      onSearchRadiusChange={setSearchRadius}
                      dateRange={{ start: startDate, end: endDate }}
                      onDateRangeChange={(range) => {
                        setStartDate(range.start);
                        setEndDate(range.end);
                      }}
                      homeLocation={homeLocation}
                      onGetGPS={handleGetGPS}
                      gpsLoading={gpsLoading}
                      mapStyle={mapStyle}
                      onMapStyleChange={handleMapStyleChange}
                    />
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-slate-700 hover:bg-slate-600" />

            {/* Map Panel - Can be resized from top and bottom handles */}
            <ResizablePanel defaultSize={55} minSize={20} maxSize={80}>
              <AccessPointsMapView
                selectedObservations={allObservationsForSelected}
                mapboxToken={mapboxToken}
                centerPoint={centerPoint}
                searchRadius={searchRadius}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-slate-700 hover:bg-slate-600" />

            {/* Table Panel (Bottom Half) - Collapsible for map expansion */}
            <ResizablePanel
              ref={bottomPanelRef}
              defaultSize={30}
              minSize={5}
              maxSize={90}
              collapsible
              collapsedSize={5}
              onCollapse={() => setBottomPanelCollapsed(true)}
              onExpand={() => setBottomPanelCollapsed(false)}
            >
              <div className="h-full overflow-hidden relative">
                {/* Collapse/Expand Button */}
                <button
                  onClick={toggleBottomPanel}
                  className="absolute top-2 right-2 z-10 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg p-2 transition-colors shadow-lg"
                  title={bottomPanelCollapsed ? "Expand table" : "Collapse table to show more map"}
                >
                  {bottomPanelCollapsed ? (
                    <ChevronUp className="h-4 w-4 text-slate-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                  )}
                </button>
                <NetworkObservationsTableView
                  data={tableData}
                  columnConfig={columnConfig}
                  sorting={filters.sortColumns || []}
                  onSortingChange={(updater: Updater<SortingState>) => {
                    console.log('[SORT_CHANGE] triggered at', new Date().getTime());
                    const newState = typeof updater === 'function' ? updater(filters.sortColumns || []) : updater;
                    const primary = newState[0] || { id: 'observed_at', desc: true };

                    // Update sort state with FULL array for multi-column support
                    setFilters(prev => ({
                      ...prev,
                      sortColumns: newState,
                      // Keep single sortBy/sortDir for backward compatibility
                      sortBy: primary.id,
                      sortDir: primary.desc ? 'desc' : 'asc'
                    }));

                    // Reset to first page by invalidating query
                    queryClient.invalidateQueries({
                      queryKey: ['network-observations'],
                      exact: false,
                    });
                  }}
                  fetchNextPage={fetchNextPage}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  selectedRows={selectedRows}
                  onSelectedRowsChange={setSelectedRows}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
}
