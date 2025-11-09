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
import { Search, Filter, Shield, X, Radio, Signal, ChevronDown, MapPin, Navigation, Calendar } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteNetworkObservations, type NetworkFilters } from '@/hooks/useInfiniteNetworkObservations';
import { flattenNetworkObservations, type NetworkObservation } from '@/types';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { useNetworkObservationsByBssid } from '@/hooks/useNetworkObservationsByBssid';
import { NetworkObservationsTableView, getRadioTypeDisplay } from '@/components/NetworkObservationsTableView';
import { ObservationColumnSelector } from '@/components/ObservationColumnSelector';
import { AccessPointsMapView } from '@/components/AccessPointsMapView';
import { SecurityBadge } from '@/components/SecurityTooltip';
import { SECURITY_TYPE_MAP, categorizeSecurityType, getSecurityTypeStyle } from '@/lib/securityDecoder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Spatial filter state
  const [centerPoint, setCenterPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(1000); // meters
  const [gpsLoading, setGpsLoading] = useState(false);

  // Date range filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

          {/* Search and filters - Compact Version */}
          <div className="space-y-2">
            {/* Row 1: Search + Filters + GPS + Radius */}
            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="SSID or BSSID..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-8 pr-3 py-1.5 h-8 text-sm bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Radio Type Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Radio
                    {filters.radioTypes && filters.radioTypes.length > 0 && (
                      <Badge className="ml-0.5 bg-blue-500 text-white text-xs px-1 py-0">
                        {filters.radioTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-slate-300">
                    Filter by Radio Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  {['WiFi', 'BT', 'BLE', 'GSM', 'LTE'].map((type) => {
                    const display = getRadioTypeDisplay({ type });
                    return (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={filters.radioTypes?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = filters.radioTypes || [];
                          const newTypes = checked
                            ? [...current, type]
                            : current.filter((t) => t !== type);
                          setFilters((prev) => ({ ...prev, radioTypes: newTypes }));
                        }}
                        className="text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          {display.icon}
                          <span className="text-xs uppercase">{display.label}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })}

                  {filters.radioTypes && filters.radioTypes.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters((prev) => ({ ...prev, radioTypes: [] }))}
                        className="w-full text-slate-400 hover:text-slate-200 justify-start gap-2"
                      >
                        <X className="h-3 w-3" />
                        Clear Filter
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Security Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 px-2.5 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Security
                    {securityFilters.size > 0 && (
                      <Badge className="ml-0.5 bg-blue-500 text-white text-xs px-1 py-0">
                        {securityFilters.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-slate-300">
                    Filter by Security Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  {[
                    'WPA3-SAE',
                    'WPA2-EAP',
                    'WPA2-PSK',
                    'WPA2-OWE',
                    'WPA-EAP',
                    'WPA-PSK',
                    'WPA-EAP,WPA2-EAP',
                    'WPA-PSK,WPA2-PSK',
                    'WEP',
                    'Open'
                  ].map((securityType) => {
                    const style = getSecurityTypeStyle(securityType);
                    return (
                      <DropdownMenuCheckboxItem
                        key={securityType}
                        checked={securityFilters.has(securityType)}
                        onCheckedChange={(checked) => {
                          const newFilters = new Set(securityFilters);
                          if (checked) {
                            newFilters.add(securityType);
                          } else {
                            newFilters.delete(securityType);
                          }
                          setSecurityFilters(newFilters);
                        }}
                        className="text-slate-300"
                      >
                        <div className="flex items-center gap-2" title={style.description}>
                          <span className="text-base">{style.icon}</span>
                          <span className={`text-xs font-medium ${style.text}`}>
                            {style.abbr}
                          </span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })}

                  {securityFilters.size > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSecurityFilters(new Set())}
                        className="w-full text-slate-400 hover:text-slate-200 justify-start gap-2"
                      >
                        <X className="h-3 w-3" />
                        Clear Filters
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* GPS Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="gap-1.5 h-8 px-2.5 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                {gpsLoading ? (
                  <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation className={`h-3.5 w-3.5 ${centerPoint ? 'text-green-400' : 'text-slate-400'}`} />
                )}
                <span className={centerPoint ? 'text-green-400' : 'text-slate-300'}>GPS</span>
              </Button>

              {/* Radius Search Input */}
              {centerPoint && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <Input
                    type="number"
                    placeholder="Radius (m)"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value) || 1000)}
                    className="w-24 h-8 px-2 text-xs bg-slate-900 border-slate-700 text-slate-200"
                    min="100"
                    max="50000"
                    step="100"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCenterPoint(null)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Expand/Collapse Advanced Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="gap-1 h-8 px-2 text-xs text-slate-400 hover:text-slate-200"
              >
                <Signal className="h-3.5 w-3.5" />
                {filtersExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronDown className="h-3 w-3 rotate-180" />}
              </Button>

              {/* Stats */}
              <div className="text-xs text-slate-400 ml-auto">
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    {loadedCount.toLocaleString()} / {totalCount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Advanced Filters (Collapsible) */}
            {filtersExpanded && (
              <div className="space-y-2">
                {/* Signal Strength Filter */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-800/40 to-slate-800/20 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Signal className="h-4 w-4 text-blue-400" />
                      <Label className="text-sm font-medium text-slate-200">Signal Strength</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="-100"
                          value={filters.minSignal ?? ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minSignal: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-16 h-7 px-2 text-xs text-center bg-slate-900/80 border-slate-600 text-slate-100 font-mono"
                          min="-120"
                          max="0"
                        />
                        <span className="text-xs text-slate-500">dBm</span>
                      </div>
                      <div className="flex-1 px-3">
                        <Slider
                          min={-100}
                          max={0}
                          step={5}
                          value={[filters.minSignal ?? -100, filters.maxSignal ?? 0]}
                          onValueChange={([min, max]) => {
                            setFilters((prev) => ({
                              ...prev,
                              minSignal: min === -100 ? undefined : min,
                              maxSignal: max === 0 ? undefined : max,
                            }));
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.maxSignal ?? ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxSignal: e.target.value ? Number(e.target.value) : undefined }))}
                          className="w-16 h-7 px-2 text-xs text-center bg-slate-900/80 border-slate-600 text-slate-100 font-mono"
                          min="-120"
                          max="0"
                        />
                        <span className="text-xs text-slate-500">dBm</span>
                      </div>
                    </div>
                    {(filters.minSignal !== undefined || filters.maxSignal !== undefined) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            minSignal: undefined,
                            maxSignal: undefined,
                          }))
                        }
                        className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 text-center font-mono">
                    Range: {filters.minSignal ?? -100} dBm → {filters.maxSignal ?? 0} dBm
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-800/40 to-slate-800/20 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <Label className="text-sm font-medium text-slate-200">Date Range</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-7 px-2 text-xs bg-slate-900/80 border-slate-600 text-slate-100"
                      />
                      <span className="text-xs text-slate-500">to</span>
                      <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-7 px-2 text-xs bg-slate-900/80 border-slate-600 text-slate-100"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                        }}
                        className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
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
