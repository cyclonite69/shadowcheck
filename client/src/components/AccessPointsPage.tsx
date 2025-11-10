/**
 * AccessPointsPage - Network observations from locations_legacy
 *
 * Features:
 * - Infinite scroll with 436K+ observations
 * - Multi-column sorting (Shift+Click)
 * - SSID search (queries locations_legacy)
 * - Smooth virtual scrolling
 */

import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteNetworkObservations, type NetworkFilters } from '@/hooks/useInfiniteNetworkObservations';
import { flattenNetworkObservations, type NetworkObservation } from '@/types';
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
import { type SortingState, type Updater } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';

export function AccessPointsPage() {
  const queryClient = useQueryClient();
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

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header with controls */}
      <div className="flex-shrink-0 border-b border-slate-700 bg-slate-800/50">
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
            {/* Row 1: Search input */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search SSID or BSSID..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-8 pr-3 py-2 h-9 text-sm bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Stats */}
              <div className="text-sm text-slate-400 ml-auto">
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span className="font-medium">
                    Showing {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Unified Filter Bar */}
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
            />
          </div>
        </div>
      </div>

      {/* Resizable Split View: Map on top, Table on bottom */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Map Panel - Fully collapsable and expandable */}
        <ResizablePanel defaultSize={40} minSize={0} maxSize={95} collapsible>
          <AccessPointsMapView
            selectedObservations={allObservationsForSelected}
            mapboxToken={mapboxToken}
            centerPoint={centerPoint}
            searchRadius={searchRadius}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-700 hover:bg-slate-600" />

        {/* Table Panel - Always visible with minimum size */}
        <ResizablePanel defaultSize={60} minSize={5}>
          <div className="h-full overflow-hidden">
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
  );
}
