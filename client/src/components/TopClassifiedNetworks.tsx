/**
 * Top Classified Networks Viewer
 *
 * Shows the top 100 most-sighted WiFi networks from the classification system
 * with pagination (10 per page)
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wifi, ChevronLeft, ChevronRight, Shield, Building, Smartphone, MapPin } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';

interface ClassifiedNetwork {
  bssid: string;
  ssid: string;
  technology_resolved: string;
  security_risk_level: string;
  infrastructure_type: string;
  total_observations: number;
  location_confidence: string;
  is_stale: boolean;
  frequency_band: string;
}

export function TopClassifiedNetworks() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalToFetch = 100;

  const { data, isLoading } = useQuery({
    queryKey: ['/api/v1/classification/top-networks'],
    queryFn: async () => {
      // Fetch top 100 Wi-Fi networks sorted by observation count
      const res = await fetch(`/api/v1/classification/networks?technology=Wi-Fi&limit=${totalToFetch}`);
      if (!res.ok) throw new Error('Failed to fetch networks');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const networks: ClassifiedNetwork[] = data?.data || [];
  const totalPages = Math.ceil(networks.length / pageSize);
  const currentPageNetworks = networks.slice(page * pageSize, (page + 1) * pageSize);

  const getSecurityColor = (risk: string) => {
    if (risk.includes('Robust')) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (risk.includes('Vulnerable')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (risk.includes('Insecure')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (risk.includes('Unsecured')) return 'text-red-500 bg-red-600/10 border-red-600/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getInfraIcon = (type: string) => {
    if (type.includes('Corporate')) return Building;
    if (type.includes('Mobile')) return Smartphone;
    if (type.includes('Personal')) return Wifi;
    return Shield;
  };

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Wifi className={`h-5 w-5 ${iconColors.primary.text}`} />
              Top Classified Wi-Fi Networks
            </CardTitle>
            <CardDescription className="text-slate-400">
              Most frequently observed networks • Showing {networks.length} of top 100 • Page {page + 1} of {totalPages}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400 min-w-[80px] text-center">
              Page {page + 1}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : currentPageNetworks.length > 0 ? (
          <div className="space-y-2">
            {currentPageNetworks.map((network, idx) => {
              const InfraIcon = getInfraIcon(network.infrastructure_type);
              const rank = page * pageSize + idx + 1;

              return (
                <div
                  key={network.bssid}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  {/* Left: Rank & Network Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30">
                      <span className="text-sm font-bold text-blue-400">#{rank}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm text-slate-200 truncate font-semibold">
                          {network.ssid || '<Hidden>'}
                        </p>
                        {network.is_stale && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-500">
                            Stale
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <code className="text-xs">{network.bssid}</code>
                        <span>•</span>
                        <span>{network.frequency_band}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {network.location_confidence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Infrastructure & Security */}
                  <div className="hidden md:flex items-center gap-3 mx-4">
                    <div className="flex items-center gap-2">
                      <InfraIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-400 max-w-[120px] truncate">
                        {network.infrastructure_type.replace('/', ' / ')}
                      </span>
                    </div>

                    <Badge className={`text-xs border ${getSecurityColor(network.security_risk_level)}`}>
                      {network.security_risk_level.split('(')[0].trim()}
                    </Badge>
                  </div>

                  {/* Right: Observation Count */}
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-blue-300 font-mono">
                      {network.total_observations.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">sightings</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Wifi className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No classified networks found</p>
            <p className="text-sm mt-1">Classification system may need refresh</p>
          </div>
        )}

        {/* Page Navigation Footer */}
        {networks.length > pageSize && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, networks.length)} of {networks.length} networks
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
