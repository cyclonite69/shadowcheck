/**
 * Mapbox Network Visualization with Tooltip and Hover
 * Fetches data from API and displays with shadowcheck-lite features
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NetworkMapboxViewer } from './NetworkMapboxViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info, Filter, X, ChevronDown, Wifi, Bluetooth, Radio, Maximize2, Minimize2 } from 'lucide-react';

interface FilterState {
  dateRange: { start: string; end: string };
  networkTypes: { wifi: boolean; ble: boolean; bluetooth: boolean };
  signalRange: [number, number];
  searchTerm: string;
}

export function MapboxNetworkVisualization() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    networkTypes: { wifi: true, ble: true, bluetooth: true },
    signalRange: [-100, 0],
    searchTerm: ''
  });
  // Fetch Mapbox token from config
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    }
  });

  // Fetch network data
  const { data: networks, isLoading } = useQuery({
    queryKey: ['/api/v1/visualize'],
    queryFn: async () => {
      const res = await fetch('/api/v1/visualize?limit=500');
      const json = await res.json();
      console.log('📍 Mapbox: API response:', json);
      return json.ok ? json.data.features : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000
  });

  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  // Client-side filtering
  const filteredNetworks = useMemo(() => {
    if (!networks) return [];

    return networks.filter((network: any) => {
      const props = network.properties;

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const obsDate = new Date(props.seen);
        if (filters.dateRange.start && obsDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && obsDate > new Date(filters.dateRange.end)) return false;
      }

      // Network type filter
      const radioType = props.radio_type?.toLowerCase() || 'w';
      if (radioType === 'w' && !filters.networkTypes.wifi) return false;
      if (radioType === 'e' && !filters.networkTypes.ble) return false;
      if (radioType === 'b' && !filters.networkTypes.bluetooth) return false;

      // Signal strength filter
      const signal = props.signal;
      if (signal !== null && signal !== undefined) {
        if (signal < filters.signalRange[0] || signal > filters.signalRange[1]) return false;
      }

      // Search term (SSID or BSSID)
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const ssid = (props.ssid || '').toLowerCase();
        const bssid = (props.bssid || '').toLowerCase();
        if (!ssid.includes(term) && !bssid.includes(term)) return false;
      }

      return true;
    });
  }, [networks, filters]);

  const hasActiveFilters =
    filters.dateRange.start ||
    filters.dateRange.end ||
    !filters.networkTypes.wifi ||
    !filters.networkTypes.ble ||
    !filters.networkTypes.bluetooth ||
    filters.signalRange[0] !== -100 ||
    filters.signalRange[1] !== 0 ||
    filters.searchTerm;

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      networkTypes: { wifi: true, ble: true, bluetooth: true },
      signalRange: [-100, 0],
      searchTerm: ''
    });
  };

  console.log('🗺️ Mapbox state:', {
    isLoading,
    hasToken: !!mapboxToken,
    networkCount: networks?.length || 0,
    filteredCount: filteredNetworks.length,
    configData: config
  });

  if (isLoading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="space-y-4 w-full max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-300">Map Configuration Missing</h3>
          <p className="text-sm text-slate-400">
            Mapbox token not configured. Please set VITE_MAPBOX_TOKEN in environment.
          </p>
        </div>
      </div>
    );
  }

  if (!networks || networks.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-300">No Network Data</h3>
          <p className="text-sm text-slate-400">
            No network observations found. Upload data to visualize.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6' : ''}`}>
      {/* Map Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-300">Network Map</h3>
          <p className="text-sm text-slate-400">
            Showing {filteredNetworks.length} of {networks.length} network observation{networks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Click markers for details
            </span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              Hover for signal range
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            style={{ cursor: 'pointer' }}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                    Active
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="gap-1 text-xs text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3" />
                Reset All
              </Button>
            )}
          </div>

          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-700/50">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Search SSID / BSSID</label>
                <Input
                  placeholder="Filter by name or MAC..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                    className="bg-slate-800/50 border-slate-700 text-xs"
                  />
                  <Input
                    type="datetime-local"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                    className="bg-slate-800/50 border-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* Signal Strength Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Signal Strength: {filters.signalRange[0]} to {filters.signalRange[1]} dBm
                </label>
                <Slider
                  min={-100}
                  max={0}
                  step={5}
                  value={filters.signalRange}
                  onValueChange={(value) => setFilters({ ...filters, signalRange: value as [number, number] })}
                  className="mt-2"
                />
              </div>

              {/* Network Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Network Types</label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.networkTypes.wifi ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, networkTypes: { ...filters.networkTypes, wifi: !filters.networkTypes.wifi } })}
                    className="flex-1 gap-1"
                  >
                    <Wifi className="h-3 w-3" />
                    WiFi
                  </Button>
                  <Button
                    variant={filters.networkTypes.ble ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, networkTypes: { ...filters.networkTypes, ble: !filters.networkTypes.ble } })}
                    className="flex-1 gap-1"
                  >
                    <Bluetooth className="h-3 w-3" />
                    BLE
                  </Button>
                  <Button
                    variant={filters.networkTypes.bluetooth ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, networkTypes: { ...filters.networkTypes, bluetooth: !filters.networkTypes.bluetooth } })}
                    className="flex-1 gap-1"
                  >
                    <Radio className="h-3 w-3" />
                    BT
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Map Container with Legend */}
      <div className="relative rounded-lg border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/50">
        {/* Map Legend */}
        <TooltipProvider>
          <div className="absolute bottom-6 right-6 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg p-4 min-w-[220px]">
            <div className="space-y-3">
              {/* Cluster Legend */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-slate-300">Network Clusters</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-slate-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[250px]">
                      <p className="text-xs">Clusters group nearby networks. Click to zoom in and expand.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-400">&lt; 10 networks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-slate-400">10-50 networks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-400">&gt; 50 networks</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700/50"></div>

              {/* Point Colors */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-slate-300">Point Colors</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-slate-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[250px]">
                      <p className="text-xs">Colors are derived from BSSID. Similar BSSIDs (same vendor/OUI) get similar colors for pattern recognition.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-xs text-slate-400">
                  Based on BSSID/MAC address
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700/50"></div>

              {/* Signal Strength Legend */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-slate-300">Signal Strength</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-slate-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[250px]">
                      <p className="text-xs">Hover over points to see estimated signal range circle. Stronger signals have larger coverage areas.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500/20"></div>
                    <span className="text-xs text-slate-400">Strong (&gt; -50 dBm)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-yellow-500 bg-yellow-500/20"></div>
                    <span className="text-xs text-slate-400">Medium (-50 to -70)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-red-500/20"></div>
                    <span className="text-xs text-slate-400">Weak (&lt; -70 dBm)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* Map */}
        <div className={isFullscreen ? "h-[calc(100vh-12rem)]" : "h-[700px]"}>
          <NetworkMapboxViewer
            networks={filteredNetworks}
            mapboxToken={mapboxToken}
            onNetworkClick={(network) => {
              console.log('Network clicked:', network);
            }}
          />
        </div>
      </div>
    </div>
  );
}
