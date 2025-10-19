/**
 * Unified Network View - Phase 1: Core Structure
 * Consolidates Map + Table in a resizable split view with shared filtering
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { NetworkMapboxViewer } from '@/components/Map/NetworkMapboxViewer';
import { NetworkObservationsTable } from '@/components/network-observations-table';
import { NetworkFilters } from '@/components/NetworkFilters';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Fetch config for Mapbox token
  const { data: config } = useQuery({
    queryKey: ['/api/v1/config'],
    queryFn: async () => {
      const res = await fetch('/api/v1/config');
      return res.json();
    },
  });

  // Fetch network data with filters
  const { data: networksResponse, isLoading } = useQuery({
    queryKey: ['/api/v1/visualize', filters],
    queryFn: async () => {
      const res = await fetch('/api/v1/visualize?limit=100000');
      const json = await res.json();
      return json.ok ? json.data.features : [];
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Apply client-side filters (Phase 3 will move this to server-side)
  const filteredNetworks = useMemo(() => {
    if (!networksResponse) return [];

    let filtered = networksResponse;

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter((network: any) => {
        const ssid = (network.properties.ssid || '').toLowerCase();
        const bssid = (network.properties.bssid || '').toLowerCase();
        return ssid.includes(term) || bssid.includes(term);
      });
    }

    // Radio type filter
    if (filters.radioTypes.length > 0) {
      filtered = filtered.filter((network: any) => {
        const type = network.properties.radio_type?.toUpperCase() || 'W';
        return filters.radioTypes.includes(type);
      });
    }

    // Signal range filter
    filtered = filtered.filter((network: any) => {
      const signal = network.properties.signal;
      if (signal === null || signal === undefined) return true;
      return signal >= filters.signalRange[0] && signal <= filters.signalRange[1];
    });

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((network: any) => {
        const obsDate = new Date(network.properties.seen);
        if (filters.dateRange.start && obsDate < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && obsDate > new Date(filters.dateRange.end)) return false;
        return true;
      });
    }

    return filtered;
  }, [networksResponse, filters]);

  // Handle map network click → highlight table row (Phase 2)
  const handleNetworkClick = useCallback((network: any) => {
    const networkId = network.properties?.bssid || network.properties?.uid;
    setSelectedNetworkId(networkId);
    // Scroll table to show this row (Phase 2 enhancement)
    setTimeout(() => {
      const row = document.getElementById(`network-row-${networkId}`);
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
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
            />

            {/* Map Tools Overlay - Phase 4 enhancement */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="text-xs bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-300">
                <div className="font-semibold">Networks: {filteredNetworks.length.toLocaleString()}</div>
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
            <NetworkObservationsTable />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
