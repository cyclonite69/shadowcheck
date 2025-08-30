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
  const secureNetworks = securityAnalysis?.data?.filter((s: any) => 
    s.security.includes('WPA') || s.security.includes('WEP')
  ).reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
  const strongSignals = signalAnalysis?.data?.find((s: any) => 
    s.signal_range.includes('Good') || s.signal_range.includes('Excellent')
  )?.count || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="SIGINT Forensics Dashboard"
        subtitle="Real-time intelligence from G63 wireless observations and cellular detections"
      />
      
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        {/* Forensics Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Wifi className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cyan-400" data-testid="metric-networks">
                    {Number(overview.total_networks || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Network Observations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400" data-testid="metric-locations">
                    {Number(overview.unique_bssids || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Unique Devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400" data-testid="metric-secure">
                    {secureNetworks}
                  </p>
                  <p className="text-xs text-muted-foreground">Encrypted Networks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400" data-testid="metric-strong">
                    {Number(overview.unique_ssids || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Network Names</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/g63-forensics" className="block">
            <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm hover:border-cyan-400/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  G63 Forensics Data
                </CardTitle>
                <CardDescription>
                  Browse {Number(overview.total_networks || 0).toLocaleString()} network observations from real SIGINT operations
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/visualization" className="block">
            <Card className="border-purple-500/20 bg-card/80 backdrop-blur-sm hover:border-purple-400/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
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
            <Card className="border-orange-500/20 bg-card/80 backdrop-blur-sm hover:border-orange-400/40 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
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

        {/* Recent G63 Activity */}
        <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent SIGINT Activity
            </CardTitle>
            <CardDescription>
              Latest wireless network observations from G63 forensics database
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
                    className="flex items-center justify-between p-3 rounded border border-cyan-500/20 bg-background/40"
                    data-testid={`activity-${network.bssid}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-mono text-sm text-cyan-400" data-testid={`activity-ssid-${network.bssid}`}>
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
