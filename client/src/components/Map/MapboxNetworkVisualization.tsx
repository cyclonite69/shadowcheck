/**
 * Mapbox Network Visualization with Tooltip and Hover
 * Fetches data from API and displays with shadowcheck-lite features
 */

import { useQuery } from '@tanstack/react-query';
import { NetworkMapboxViewer } from './NetworkMapboxViewer';
import { Skeleton } from '@/components/ui/skeleton';

export function MapboxNetworkVisualization() {
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
    queryKey: ['/api/v1/g63/visualize'],
    queryFn: async () => {
      const res = await fetch('/api/v1/g63/visualize?limit=500');
      const json = await res.json();
      console.log('📍 Mapbox: API response:', json);
      return json.ok ? json.data.features : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000
  });

  const mapboxToken = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  console.log('🗺️ Mapbox state:', {
    isLoading,
    hasToken: !!mapboxToken,
    networkCount: networks?.length || 0,
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
    <div className="w-full" style={{ height: '600px' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-300">Network Map</h3>
          <p className="text-sm text-slate-400">
            {networks.length} network{networks.length !== 1 ? 's' : ''} | Click for details | Hover for signal range
          </p>
        </div>
      </div>
      <NetworkMapboxViewer
        networks={networks}
        mapboxToken={mapboxToken}
        onNetworkClick={(network) => {
          console.log('Network clicked:', network);
        }}
      />
    </div>
  );
}
