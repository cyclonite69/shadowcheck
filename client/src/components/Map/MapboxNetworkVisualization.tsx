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
    <div className="w-full space-y-4">
      {/* Map Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-300">Network Map</h3>
          <p className="text-sm text-slate-400">
            Showing {networks.length} network observation{networks.length !== 1 ? 's' : ''}
          </p>
        </div>
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
      </div>

      {/* Map Container with Legend */}
      <div className="relative rounded-lg border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/50">
        {/* Map Legend */}
        <div className="absolute bottom-6 right-6 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg p-4 min-w-[200px]">
          <div className="space-y-3">
            {/* Cluster Legend */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Network Clusters</div>
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

            {/* Signal Strength Legend */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Signal Strength</div>
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

        {/* Map */}
        <div className="h-[700px]">
          <NetworkMapboxViewer
            networks={networks}
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
