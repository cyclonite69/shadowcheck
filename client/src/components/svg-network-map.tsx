import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Satellite, Map, Wifi, WifiOff } from 'lucide-react';
import { generateColorFromBSSID } from '@/lib/color-utils';

export function SvgNetworkMap() {
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);

  const { data: visualizationData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/visualize'],
    refetchInterval: 30000,
  });

  const { data: networks } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const features = (visualizationData as any)?.data?.features || [];
  
  // If no features, show placeholder
  if (features.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Satellite className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-white">No network data available for mapping</p>
            <p className="text-slate-500 text-sm">Data is being fetched...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate map bounds with validation
  const coords = features
    .map((f: any) => f.geometry?.coordinates)
    .filter((coord: any) => coord && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]));
  
  if (coords.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-red-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Map className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-white">Invalid coordinate data</p>
            <p className="text-slate-500 text-sm">Unable to render map from current data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lats = coords.map((coord: number[]) => coord[1]);
  const lngs = coords.map((coord: number[]) => coord[0]);
  const minLat = Math.min(...lats) - 0.001;
  const maxLat = Math.max(...lats) + 0.001;
  const minLng = Math.min(...lngs) - 0.001;
  const maxLng = Math.max(...lngs) + 0.001;

  // Map projection function
  const projectToSVG = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 760 + 20;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 360 + 20;
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Network Map Visualization
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Interactive SVG Map */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <Map className="h-5 w-5" />
            Network GIS Map ({features.length} networks) 
            {coords.length > 0 && (
              <span className="text-xs text-slate-500">
                [{coords.length} valid coordinates]
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-900 rounded-lg border border-cyan-500/20 relative overflow-hidden">
            <svg 
              width="100%" 
              height="400" 
              viewBox="0 0 800 400"
              className="bg-gray-900"
            >
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Networks */}
              {features.map((feature: any, index: number) => {
                // Validate coordinates
                if (!feature.geometry?.coordinates || feature.geometry.coordinates.length < 2) {
                  return null;
                }
                
                const lat = feature.geometry.coordinates[1];
                const lng = feature.geometry.coordinates[0];
                
                if (isNaN(lat) || isNaN(lng)) {
                  return null;
                }
                
                const { x, y } = projectToSVG(lat, lng);
                const isOpen = feature.properties?.encryption === 'Open';
                const color = generateColorFromBSSID(feature.properties?.bssid || '').hex;
                const signalStrength = Math.abs(feature.properties?.signal_strength || -50);
                const radius = Math.max(4, Math.min(10, (100 - signalStrength) / 10));

                return (
                  <g key={index}>
                    {/* Network dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={isOpen ? '#ef4444' : color}
                      stroke={isOpen ? '#ffffff' : '#64748b'}
                      strokeWidth="2"
                      opacity="0.9"
                      className="cursor-pointer hover:opacity-100 hover:stroke-white transition-all"
                      onClick={() => {
                        console.log('Network clicked:', feature.properties);
                        setSelectedNetwork(feature.properties);
                      }}
                      data-testid={`network-point-${index}`}
                    />
                    
                    {/* Signal strength ring */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius + 4}
                      fill="none"
                      stroke={isOpen ? '#ef4444' : color}
                      strokeWidth="1"
                      opacity="0.3"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
              
              {/* Legend */}
              <g transform="translate(20, 340)">
                <circle cx="0" cy="0" r="6" fill="#ef4444" />
                <text x="15" y="5" fill="#94a3b8" fontSize="12">Open Networks</text>
                
                <circle cx="120" cy="0" r="6" fill="#22d3ee" />
                <text x="135" y="5" fill="#94a3b8" fontSize="12">Secured Networks</text>
                
                <text x="250" y="5" fill="#64748b" fontSize="11">Dot size = Signal strength</text>
              </g>
            </svg>

            {/* Network details popup */}
            {selectedNetwork && (
              <div className="absolute top-4 right-4 bg-gray-800 border border-cyan-500/30 rounded-lg p-4 max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {selectedNetwork.encryption === 'Open' ? (
                      <WifiOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Wifi className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="text-sm font-semibold text-white">
                      {selectedNetwork.ssid || 'Hidden Network'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedNetwork(null)}
                    className="text-slate-500 hover:text-white"
                    data-testid="close-popup"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">BSSID:</span>
                    <span className="text-slate-600 font-mono">{selectedNetwork.bssid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signal:</span>
                    <span className="text-white">{selectedNetwork.signal_strength} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security:</span>
                    <span className={selectedNetwork.encryption === 'Open' ? 'text-slate-500' : 'text-slate-500'}>
                      {selectedNetwork.encryption || 'Unknown'}
                    </span>
                  </div>
                  {selectedNetwork.frequency && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frequency:</span>
                      <span className="text-white">{selectedNetwork.frequency} MHz</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-slate-500 font-semibold mb-3">Network Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-slate-500">{(networks as any)?.data?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Networks</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-600">{features.length}</p>
                <p className="text-xs text-muted-foreground">On Map</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-500">
                  {features.filter((f: any) => f.properties?.encryption === 'Open').length}
                </p>
                <p className="text-xs text-muted-foreground">Open Networks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-slate-500 font-semibold mb-3">Map Debug Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Valid coordinates:</span>
                <span className="text-white">{coords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lat range:</span>
                <span className="text-slate-600">{coords.length > 0 ? `${minLat.toFixed(4)} → ${maxLat.toFixed(4)}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lng range:</span>
                <span className="text-slate-600">{coords.length > 0 ? `${minLng.toFixed(4)} → ${maxLng.toFixed(4)}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected:</span>
                <span className="text-white">{selectedNetwork ? selectedNetwork.ssid || 'Hidden' : 'None'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}