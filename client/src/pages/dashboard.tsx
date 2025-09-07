import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EnhancedHeader } from "@/components/enhanced-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { BarChart3, Wifi, MapPin, Shield, Activity, Zap } from 'lucide-react';

export default function Dashboard() {
  const { data: g63Networks, isLoading: networksLoading } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    queryFn: () => api.getG63Networks(10),
    refetchInterval: 30000,
  });

  const { data: g63Analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/v1/g63/analytics'],
    queryFn: () => api.getG63Analytics(),
    refetchInterval: 30000,
  });

  const { data: radioStats, isLoading: radioStatsLoading } = useQuery({
    queryKey: ['/api/v1/radio-stats'],
    queryFn: () => api.getRadioStats(),
    refetchInterval: 30000,
  });

  const { data: securityAnalysis } = useQuery({
    queryKey: ['/api/v1/g63/security-analysis'],
    queryFn: () => api.getG63SecurityAnalysis(),
    refetchInterval: 30000,
  });

  const { data: signalAnalysis } = useQuery({
    queryKey: ['/api/v1/g63/signal-strength'],
    queryFn: () => api.getG63SignalStrengthDistribution(),
    refetchInterval: 30000,
  });

  const overview = g63Analytics?.data?.overview || {};
  const radioData = radioStats?.data || [];
  
  // Helper function to get radio stats by type
  const getRadioStats = (type: string) => {
    const stats = radioData.find((r: any) => r.radio_type === type);
    return {
      observations: stats?.total_observations || 0,
      networks: stats?.distinct_networks || 0
    };
  };
  
  const wifiStats = getRadioStats('wifi');
  const cellularStats = getRadioStats('cellular');
  const bluetoothStats = getRadioStats('bluetooth');
  const bleStats = getRadioStats('ble');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="SIGINT Forensics Dashboard"
        subtitle="Real-time intelligence from wireless observations and cellular detections"
      />
      
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        {/* Radio Type Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <i className="fas fa-wifi text-slate-700 text-lg"></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700" data-testid="metric-wifi-observations">
                    {wifiStats.observations.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">WiFi Observations</p>
                  <p className="text-sm text-slate-500">
                    {wifiStats.networks.toLocaleString()} distinct networks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <i className="fas fa-signal text-slate-700 text-lg"></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700" data-testid="metric-cellular-observations">
                    {cellularStats.observations.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">Cellular Observations</p>
                  <p className="text-sm text-slate-500">
                    {cellularStats.networks.toLocaleString()} distinct towers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <i className="fab fa-bluetooth text-slate-700 text-lg"></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700" data-testid="metric-bluetooth-observations">
                    {bluetoothStats.observations.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">Bluetooth Observations</p>
                  <p className="text-sm text-slate-500">
                    {bluetoothStats.networks.toLocaleString()} distinct devices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <i className="fab fa-bluetooth-b text-slate-700 text-lg"></i>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-700" data-testid="metric-ble-observations">
                    {bleStats.observations.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">BLE Observations</p>
                  <p className="text-sm text-slate-500">
                    {bleStats.networks.toLocaleString()} distinct devices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-700" data-testid="metric-total-observations">
                    {Number(overview.total_observations || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Network Observations</p>
                  <p className="text-xs text-slate-500">Location records in database</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg">
                  <Wifi className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-700" data-testid="metric-distinct-networks">
                    {Number(overview.distinct_networks || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Distinct Networks</p>
                  <p className="text-xs text-slate-500">Unique radio sources detected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Analysis */}
        <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-slate-700 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Network Security Breakdown
            </CardTitle>
            <CardDescription>
              Encryption and security analysis of detected networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(securityAnalysis?.data || []).slice(0, 8).map((item: any, index: number) => {
                const count = Number(item.network_count) || 0;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/40"
                    data-testid={`security-${item.security?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.security?.includes('WPA') ? 'bg-slate-500' :
                        item.security?.includes('WEP') ? 'bg-slate-500' :
                        item.security === '[ESS]' ? 'bg-slate-500' : 'bg-slate-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.security_level || 'Unknown Security'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.security || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!securityAnalysis?.data || securityAnalysis.data.length === 0) && (
                <div className="col-span-full text-center py-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <Link href="/visualization" className="block">
            <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interactive Visualization
                </CardTitle>
                <CardDescription>
                  Geospatial mapping and analysis tools with Mapbox integration for forensics data
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin" className="block">
            <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm hover:border-orange-400/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Administration
                </CardTitle>
                <CardDescription>
                  Database monitoring, API status, and system health diagnostics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Network Activity */}
        <Card className="border-slate-500/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-700 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent SIGINT Activity
            </CardTitle>
            <CardDescription>
              Latest wireless network observations from forensics database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {networksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : g63Networks?.data && g63Networks.data.length > 0 ? (
              <div className="space-y-3" data-testid="recent-activity">
                {g63Networks.data.slice(0, 5).map((network) => (
                  <div
                    key={network.bssid}
                    className="flex items-center justify-between p-3 rounded border border-slate-500/20 bg-background/40"
                    data-testid={`activity-${network.bssid}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-mono text-sm text-slate-700" data-testid={`activity-ssid-${network.bssid}`}>
                          {network.ssid || 'Hidden Network'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {network.bssid} • {network.frequency} MHz
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {network.bestlevel} dBm
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Number(network.lasttime)).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-activity">
                No recent forensics activity. Database connection may be required.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
