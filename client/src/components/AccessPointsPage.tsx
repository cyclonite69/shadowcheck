/**
 * AccessPointsPage - Network observations from locations_legacy
 *
 * Features:
 * - Infinite scroll with 436K+ observations
 * - Multi-column sorting (Shift+Click)
 * - SSID search (queries locations_legacy)
 * - Smooth virtual scrolling
 */

import { useState } from 'react';
import { Search, Filter, Shield, X, Radio, Signal } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteNetworkObservations, type NetworkFilters } from '@/hooks/useInfiniteNetworkObservations';
import { useNetworkObservationColumns } from '@/hooks/useNetworkObservationColumns';
import { NetworkObservationsTableView } from '@/components/NetworkObservationsTableView';
import { ObservationColumnSelector } from '@/components/ObservationColumnSelector';
import { SecurityBadge } from '@/components/SecurityTooltip';
import { SecurityStrength, getSecurityBadgeClass } from '@/lib/securityDecoder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AccessPointsPage() {
  // Column visibility state
  const columnConfig = useNetworkObservationColumns();

  // Filter state
  const [filters, setFilters] = useState<NetworkFilters>({
    search: '',
    radioTypes: [],
    minSignal: undefined,
    maxSignal: undefined,
  });

  // Security filter state
  const [securityFilters, setSecurityFilters] = useState<Set<SecurityStrength>>(new Set());

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

  const { data, isLoading } = queryResult;

  // Calculate stats
  const totalCount = data?.pages?.[0]?.total_count ?? 0;
  const loadedCount = data?.pages?.reduce((sum, page) => sum + page.count, 0) ?? 0;

  // Apply client-side security filtering
  // TODO: Need to add capabilities field to NetworkObservation type
  const filteredQueryResult = {
    ...queryResult,
    data: securityFilters.size > 0 && data ? {
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        data: page.data.filter((observation: any) => {
          if (!observation.capabilities) return true; // Show if no capabilities
          const { parseCapabilities } = require('@/lib/securityDecoder');
          const analysis = parseCapabilities(observation.capabilities);
          return securityFilters.has(analysis.strength);
        })
      }))
    } : data
  };

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
            <ObservationColumnSelector />
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

                  {['WiFi', 'Cellular', 'Bluetooth', 'BLE'].map((type) => (
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
                      <Badge className="border mr-2 text-xs px-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {type}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}

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
                    Filter by Security Strength
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />

                  {Object.values(SecurityStrength).map((strength) => (
                    <DropdownMenuCheckboxItem
                      key={strength}
                      checked={securityFilters.has(strength)}
                      onCheckedChange={(checked) => {
                        const newFilters = new Set(securityFilters);
                        if (checked) {
                          newFilters.add(strength);
                        } else {
                          newFilters.delete(strength);
                        }
                        setSecurityFilters(newFilters);
                      }}
                      className="text-slate-300"
                    >
                      <Badge className={`${getSecurityBadgeClass(strength)} border mr-2 text-xs px-2`}>
                        {strength}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}

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

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <NetworkObservationsTableView queryResult={filteredQueryResult as any} columnConfig={columnConfig} />
      </div>
    </div>
  );
}
