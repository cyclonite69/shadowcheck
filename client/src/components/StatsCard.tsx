import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, AlertTriangle } from 'lucide-react';

export function StatsCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Stats...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-16 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Stats Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Networks Detected</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.data.networks.toLocaleString() || 0}</div>
          <div className="flex items-center gap-2 mt-2">
            {data?.fallback ? (
              <Badge variant="outline" className="text-xs text-orange-600">
                Fallback Data
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-600">
                Live Database
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(data?.data.timestamp || '').toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.data.alerts.toLocaleString() || 0}</div>
          <div className="flex items-center gap-2 mt-2">
            {data?.fallback ? (
              <Badge variant="outline" className="text-xs text-orange-600">
                Fallback Data
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-green-600">
                Live Database
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}