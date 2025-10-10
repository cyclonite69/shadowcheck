import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Signal, Wifi, Activity, TrendingUp, Eye } from 'lucide-react';

export function AnalyticsDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/v1/analytics"],
    queryFn: () => api.getAnalytics(),
    refetchInterval: 30000,
  });

  const { data: signalDistribution, isLoading: signalLoading } = useQuery({
    queryKey: ["/api/v1/signal-strength"],
    queryFn: () => api.getSignalStrengthDistribution(),
    refetchInterval: 30000,
  });

  const { data: securityAnalysis, isLoading: securityLoading } = useQuery({
    queryKey: ["/api/v1/security-analysis"],
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
      {/* Network Overview Stats */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <CardTitle>Network Analytics Overview</CardTitle>
          </div>
          <CardDescription>
            Real-time insights from wireless network forensics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">
                {overview.totalNetworks?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Networks</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">
                {overview.uniqueSSIDs?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Unique SSIDs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">
                {overview.encryptedNetworks?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Encrypted</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">
                {overview.openNetworks?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Open Networks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Strength Distribution */}
        <Card className="premium-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Signal className="h-5 w-5 text-amber-400" />
              <CardTitle>Signal Strength Distribution</CardTitle>
            </div>
            <CardDescription>
              RSSI analysis across detected networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signalData.length > 0 ? (
                signalData.map((range: any) => (
                  <div key={range.range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{range.range} dBm</span>
                      <span className="font-mono">{range.count} networks</span>
                    </div>
                    <Progress 
                      value={(range.count / Math.max(...signalData.map((s: any) => s.count))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No signal strength data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Analysis */}
        <Card className="premium-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <CardTitle>Security Analysis</CardTitle>
            </div>
            <CardDescription>
              Encryption protocols and security status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityData.length > 0 ? (
                securityData.map((security: any) => {
                  const getSecurityColor = (type: string) => {
                    if (type.toLowerCase().includes('open')) return 'red';
                    if (type.toLowerCase().includes('wep')) return 'orange';
                    if (type.toLowerCase().includes('wpa')) return 'green';
                    return 'blue';
                  };
                  
                  const color = getSecurityColor(security.type);
                  
                  return (
                    <div key={security.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`border-${color}-500/30 text-${color}-400`}
                        >
                          {security.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">{security.count} networks</div>
                        <div className="text-xs text-muted-foreground">
                          {((security.count / overview.totalNetworks) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No security analysis data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm">Most Active Band</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {overview.mostActiveBand || '2.4 GHz'}
            </div>
            <div className="text-xs text-muted-foreground">
              {overview.bandActivity || '65% of networks'}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <CardTitle className="text-sm">Detection Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {overview.detectionRate || '42'}/min
            </div>
            <div className="text-xs text-muted-foreground">
              New network observations
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-sm">Coverage Area</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {overview.coverageArea || '2.3'} km²
            </div>
            <div className="text-xs text-muted-foreground">
              Estimated surveillance range
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alerts */}
      {overview.alerts && overview.alerts.length > 0 && (
        <div className="space-y-2">
          {overview.alerts.map((alert: any, index: number) => (
            <Alert key={index} className="border-amber-500/30 bg-amber-500/5">
              <AlertDescription className="text-amber-400">
                {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}