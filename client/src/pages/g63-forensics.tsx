import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EnhancedHeader } from '@/components/enhanced-header';
import { G63MapVisualization } from '@/components/g63-map-visualization';
import { G63AnalyticsDashboard } from '@/components/g63-analytics-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Wifi, MapPin, Clock } from 'lucide-react';

export default function G63ForensicsPage() {
  const { data: networks, isLoading: networksLoading } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    queryFn: () => api.getG63Networks(100),
    refetchInterval: 30000,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/v1/g63/locations'],
    queryFn: () => api.getG63Locations(100),
    refetchInterval: 30000,
  });

  function formatTimestamp(timestamp: string | bigint) {
    const time = typeof timestamp === 'string' ? parseInt(timestamp) : Number(timestamp);
    return new Date(time).toLocaleString();
  }

  function getSecurityLevel(capabilities: string) {
    if (capabilities.includes('WPA3')) return 'high';
    if (capabilities.includes('WPA2')) return 'medium';
    if (capabilities.includes('WEP')) return 'low';
    return 'none';
  }

  function getSecurityBadge(level: string) {
    const colors: Record<string, string> = {
      high: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      none: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return (
      <Badge className={`${colors[level] || colors.none} border`}>
        {level.toUpperCase()}
      </Badge>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="G63 Forensics Database"
        subtitle="Real SIGINT data from G63 wireless observations and cellular detections"
      />
      
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <div className="space-y-6">
          {/* Database Status */}
          <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Forensics Database Status
              </CardTitle>
              <CardDescription>
                G63 SIGINT data integration - {networks?.count || 0} networks, {locations?.count || 0} observations
              </CardDescription>
            </CardHeader>
          </Card>

          {/* G63 Map Visualization */}
          <G63MapVisualization />

          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50">
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="networks" data-testid="tab-networks">
                Network Observations ({networks?.count || 0})
              </TabsTrigger>
              <TabsTrigger value="locations" data-testid="tab-locations">
                Location Data ({locations?.count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              <G63AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="networks" className="space-y-4">
              <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Network Observations
                  </CardTitle>
                  <CardDescription>
                    WiFi networks detected during SIGINT operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {networksLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : networks?.data && networks.data.length > 0 ? (
                    <div className="space-y-3" data-testid="networks-list">
                      {networks.data.map((network) => (
                        <div
                          key={network.bssid}
                          className="p-4 rounded-lg border border-cyan-500/20 bg-background/60"
                          data-testid={`network-card-${network.bssid}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-mono text-sm font-bold text-cyan-400" data-testid={`network-ssid-${network.bssid}`}>
                                  {network.ssid || 'Hidden Network'}
                                </h3>
                                {getSecurityBadge(getSecurityLevel(network.capabilities))}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div data-testid={`network-bssid-${network.bssid}`}>BSSID: <span className="font-mono">{network.bssid}</span></div>
                                <div data-testid={`network-frequency-${network.bssid}`}>Frequency: {network.frequency} MHz</div>
                                <div data-testid={`network-signal-${network.bssid}`}>Signal: {network.bestlevel} dBm</div>
                                <div data-testid={`network-capabilities-${network.bssid}`}>Security: {network.capabilities}</div>
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div className="flex items-center gap-1 mb-1">
                                <MapPin className="h-3 w-3" />
                                <span data-testid={`network-coordinates-${network.bssid}`}>
                                  {network.lastlat.toFixed(6)}, {network.lastlon.toFixed(6)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span data-testid={`network-time-${network.bssid}`}>
                                  {formatTimestamp(network.lasttime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="networks-empty">
                      No network observations available. Database connection may be required.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Data
                  </CardTitle>
                  <CardDescription>
                    Individual location measurements and signal strength readings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : locations?.data && locations.data.length > 0 ? (
                    <div className="space-y-2" data-testid="locations-list">
                      {locations.data.map((location) => (
                        <div
                          key={location._id}
                          className="p-3 rounded border border-cyan-500/20 bg-background/40"
                          data-testid={`location-card-${location._id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-mono text-sm text-cyan-400" data-testid={`location-bssid-${location._id}`}>
                                {location.bssid}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Signal: {location.level} dBm | Accuracy: {location.accuracy}m
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div data-testid={`location-coordinates-${location._id}`}>
                                {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                              </div>
                              <div data-testid={`location-time-${location._id}`}>
                                {formatTimestamp(location.time)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground" data-testid="locations-empty">
                      No location data available. Database connection may be required.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}