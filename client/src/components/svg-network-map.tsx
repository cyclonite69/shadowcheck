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
  
  // Calculate map bounds
  const lats = features.map((f: any) => f.geometry.coordinates[1]);
  const lngs = features.map((f: any) => f.geometry.coordinates[0]);
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;

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
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Network Map Visualization
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Interactive SVG Map */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Map className="h-5 w-5" />
            Network GIS Map ({features.length} networks)
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
                const { x, y } = projectToSVG(
                  feature.geometry.coordinates[1], 
                  feature.geometry.coordinates[0]
                );
                const isOpen = feature.properties?.encryption === 'Open';
                const color = generateColorFromBSSID(feature.properties?.bssid || '').hex;
                const signalStrength = Math.abs(feature.properties?.signal_strength || -50);
                const radius = Math.max(3, Math.min(12, (100 - signalStrength) / 8));

                return (
                  <g key={index}>
                    {/* Network dot */}
                    <circle
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={isOpen ? '#ef4444' : color}
                      stroke={isOpen ? '#ffffff' : '#64748b'}
                      strokeWidth="1"
                      opacity="0.8"
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      onClick={() => setSelectedNetwork(feature.properties)}
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
                      <WifiOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <Wifi className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm font-semibold text-white">
                      {selectedNetwork.ssid || 'Hidden Network'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedNetwork(null)}
                    className="text-gray-400 hover:text-white"
                    data-testid="close-popup"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">BSSID:</span>
                    <span className="text-cyan-400 font-mono">{selectedNetwork.bssid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Signal:</span>
                    <span className="text-white">{selectedNetwork.signal_strength} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security:</span>
                    <span className={selectedNetwork.encryption === 'Open' ? 'text-red-400' : 'text-green-400'}>
                      {selectedNetwork.encryption || 'Unknown'}
                    </span>
                  </div>
                  {selectedNetwork.frequency && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Frequency:</span>
                      <span className="text-white">{selectedNetwork.frequency} MHz</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-green-400">{(networks as any)?.data?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Networks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{features.length}</p>
              <p className="text-xs text-muted-foreground">On Map</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-400">
                {features.filter((f: any) => f.properties?.encryption === 'Open').length}
              </p>
              <p className="text-xs text-muted-foreground">Open Networks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}