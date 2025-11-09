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
import { Search, Filter, Shield, X, Radio, Signal, ChevronDown } from 'lucide-react';
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

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 300);

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

          {/* Search and filters */}
          <div className="space-y-3">
            {/* Row 1: Search + Dropdown Filters */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search by SSID or BSSID..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              {/* Radio Type Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Radio className="h-4 w-4" />
                    Radio Type
                    {filters.radioTypes && filters.radioTypes.length > 0 && (
                      <Badge className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0">
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
                    className="gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Shield className="h-4 w-4" />
                    Security
                    {securityFilters.size > 0 && (
                      <Badge className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0">
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

              {/* Stats */}
              <div className="text-sm text-slate-400">
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    {loadedCount.toLocaleString()} of {totalCount.toLocaleString()} loaded
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Signal Strength Slider */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Signal className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-slate-300">Signal Strength Range</Label>
                  <span className="text-xs font-mono text-slate-400">
                    {filters.minSignal ?? -100} dBm to {filters.maxSignal ?? 0} dBm
                  </span>
                </div>
                <div className="flex items-center gap-4">
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
                    className="flex-1"
                  />
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
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
