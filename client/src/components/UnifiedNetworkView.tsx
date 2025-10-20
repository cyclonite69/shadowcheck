/**
 * Unified Network View - Phase 1: Core Structure
 * Consolidates Map + Table in a resizable split view with shared filtering
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { NetworkMapboxViewer } from '@/components/Map/NetworkMapboxViewer';
import { NetworkTableView } from '@/components/NetworkTableView';
import { NetworkFilters } from '@/components/NetworkFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterState {
  search: string;
  radioTypes: string[];
  dateRange: { start: string; end: string };
  signalRange: [number, number];
  securityTypes: string[];
  radiusSearch: { lat: number; lng: number; radiusMeters: number } | null;
}

const defaultFilters: FilterState = {
  search: '',
  radioTypes: [],
  dateRange: { start: '', end: '' },
  signalRange: [-100, 0],
  securityTypes: [],
  radiusSearch: null,
};

export function UnifiedNetworkView() {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input (300ms delay)
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch config for Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  // Fetch ALL observations (not just unique networks)
  // Use debounced search for query key to reduce API calls
  const { data: networksResponse, isLoading, isFetching } = useQuery({
    queryKey: ['/api/v1/networks', debouncedSearch, filters.radioTypes, filters.signalRange, filters.dateRange, filters.securityTypes],
    queryFn: async () => {
      // Build query string with server-side filters
      const params = new URLSearchParams({
        limit: '500000',
        group_by_bssid: 'false'
      });

      // Add filters as query params
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (filters.radioTypes.length > 0) {
        params.append('radio_types', filters.radioTypes.join(','));
      }
      if (filters.signalRange[0] !== -100) {
        params.append('min_signal', filters.signalRange[0].toString());
      }
      if (filters.signalRange[1] !== 0) {
        params.append('max_signal', filters.signalRange[1].toString());
      }
      if (filters.dateRange.start) {
        params.append('date_start', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        params.append('date_end', filters.dateRange.end);
      }
      if (filters.securityTypes.length > 0) {
        params.append('security_types', filters.securityTypes.join(','));
      }

      const res = await fetch(`/api/v1/networks?${params.toString()}`);
      const json = await res.json();
      if (!json.ok) return [];

      // Convert API response to GeoJSON format for map
      return json.data.map((obs: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(obs.longitude), parseFloat(obs.latitude)]
        },
        properties: {
          bssid: obs.bssid,
          ssid: obs.ssid,
          frequency: obs.frequency,
          signal_strength: obs.signal_strength,
          signal: obs.signal_strength,
          encryption: obs.encryption,
          observed_at: obs.observed_at,
          seen: obs.observed_at,
          radio_type: obs.type,
          latitude: parseFloat(obs.latitude),
          longitude: parseFloat(obs.longitude)
        }
      }));
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Server-side filtering: Just return the response directly (already filtered by backend)
  const filteredNetworks = useMemo(() => {
    return networksResponse || [];
  }, [networksResponse]);

  // Handle map network click → highlight table row (Phase 2)
  const handleNetworkClick = useCallback((network: any) => {
    const networkId = network.properties?.bssid || network.properties?.uid;
    setSelectedNetworkId(networkId);
    // Scroll table to show this row
    setTimeout(() => {
      const row = document.getElementById(`network-row-${networkId}`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  // Handle table row click → center map on location (Phase 2)
  const handleTableRowClick = useCallback((network: any) => {
    const networkId = network.properties?.bssid || network.properties?.uid;
    setSelectedNetworkId(networkId);

    // Extract coordinates from network
    const coords = network.geometry?.coordinates;
    if (coords && coords.length === 2) {
      setMapCenter([coords[0], coords[1]]);
    }
  }, []);

  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  if (!mapboxToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Mapbox token not configured</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-80 border-r bg-card p-4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 flex flex-col">
          <Skeleton className="flex-1" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] w-full bg-slate-900">
      {/* Left Sidebar: Filter Panel */}
      <div className="w-80 border-r border-slate-700 bg-slate-800/50 overflow-y-auto">
        <NetworkFilters
          filters={filters}
          onChange={setFilters}
          resultCount={filteredNetworks.length}
          totalCount={networksResponse?.length || 0}
        />
      </div>

      {/* Right Side: Map + Table Split View */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Top Panel: Map */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <div ref={mapContainerRef} className="relative h-full w-full">
            <NetworkMapboxViewer
              networks={filteredNetworks}
              mapboxToken={mapboxToken}
              onNetworkClick={handleNetworkClick}
              selectedNetworkId={selectedNetworkId}
              center={mapCenter}
            />

            {/* Map Tools Overlay - Phase 4 enhancement */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="text-xs bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-300">
                <div className="font-semibold">Networks: {filteredNetworks.length.toLocaleString()}</div>
                {isFetching && (
                  <div className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                    <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    Updating...
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* Resize Handle */}
        <ResizableHandle
          withHandle
          className="bg-slate-700 hover:bg-blue-500 transition-colors"
        />

        {/* Bottom Panel: Table */}
        <ResizablePanel defaultSize={40} minSize={20}>
          <div className="h-full overflow-hidden bg-slate-900">
            <NetworkTableView
              networks={filteredNetworks}
              selectedNetworkId={selectedNetworkId}
              onRowClick={handleTableRowClick}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
