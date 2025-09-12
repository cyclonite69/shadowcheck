import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Signal, Wifi, Activity, TrendingUp, Eye } from 'lucide-react';

export function AnalyticsDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/v1/analytics'],
    queryFn: () => api.getNetworkAnalytics(),
    refetchInterval: 30000,
  });

  const { data: signalDistribution, isLoading: signalLoading } = useQuery({
    queryKey: ['/api/v1/signal-strength'],
    queryFn: () => api.getSignalStrengthDistribution(),
    refetchInterval: 30000,
  });

  const { data: securityAnalysis, isLoading: securityLoading } = useQuery({
    queryKey: ['/api/v1/security-analysis'],
    queryFn: () => api.getSecurityAnalysis(),
    refetchInterval: 30000,
  });

  if (analyticsLoading || signalLoading || securityLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  const overview = analytics?.data?.overview || {};
  const signalData = signalDistribution?.data || [];
  const securityData = securityAnalysis?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-600 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            SIGINT Forensics Analytics
          </CardTitle>
          <CardDescription>
            Real-time analysis of SIGINT data from the forensics database
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Networks</span>
            </div>
            <p
              className="text-2xl font-bold text-green-600 mt-1"
              data-testid="metric-total-networks"
            >
              {Number(overview.total_networks || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Unique BSSIDs</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1" data-testid="metric-unique-bssids">
              {Number(overview.unique_bssids || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Unique SSIDs</span>
            </div>
            <p
              className="text-2xl font-bold text-purple-600 mt-1"
              data-testid="metric-unique-ssids"
            >
              {Number(overview.unique_ssids || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Signal</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mt-1" data-testid="metric-avg-signal">
              {overview.avg_signal_strength
                ? `${Math.round(overview.avg_signal_strength)} dBm`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Strength Distribution */}
        <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <Signal className="h-5 w-5" />
              Signal Strength Distribution
            </CardTitle>
            <CardDescription>
              Distribution of wireless signal strengths across observations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {signalData.length > 0 ? (
              signalData.map((range: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.signal_range}</span>
                    <Badge variant="outline" className="text-xs">
                      {Number(range.count).toLocaleString()} networks
                    </Badge>
                  </div>
                  <Progress value={(range.count / signalData[0].count) * 100} className="h-2" />
                  {range.avg_signal_in_range && (
                    <p className="text-xs text-muted-foreground">
                      Avg: {range.avg_signal_in_range} dBm
                    </p>
                  )}
                </div>
              ))
            ) : (
              <Alert>
                <AlertDescription>No signal strength data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Security Analysis */}
        <Card className="border-red-500/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Analysis
            </CardTitle>
            <CardDescription>Encryption and security protocol distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityData.length > 0 ? (
              securityData.slice(0, 8).map((security: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {security.security || 'Open Network'}
                      </span>
                      <Badge
                        variant={
                          security.security_level === 'High Security'
                            ? 'default'
                            : security.security_level === 'Medium Security'
                              ? 'secondary'
                              : security.security_level === 'Low Security'
                                ? 'destructive'
                                : 'outline'
                        }
                        className="text-xs"
                      >
                        {security.security_level}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{security.percentage}%</span>
                  </div>
                  <Progress value={parseFloat(security.percentage)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Number(security.network_count).toLocaleString()} networks</span>
                    <span>{Number(security.unique_devices).toLocaleString()} devices</span>
                  </div>
                </div>
              ))
            ) : (
              <Alert>
                <AlertDescription>No security analysis data available</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Breakdown Table */}
      {analytics?.data?.securityBreakdown && analytics.data.securityBreakdown.length > 0 && (
        <Card className="border-indigo-500/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-indigo-600 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detailed Security Protocol Breakdown
            </CardTitle>
            <CardDescription>
              Complete list of all detected security protocols and their frequencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.data.securityBreakdown.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-background/60 border border-border/30 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-foreground">
                      {item.security || 'Open'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Number(item.count).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
