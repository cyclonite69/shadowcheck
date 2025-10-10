import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { generateColorFromBSSID, getSignalStrengthCategory, getSecurityStyling } from '@/lib/color-utils';
import { ChevronDown, ChevronUp, Search, Eye, EyeOff, Wifi } from 'lucide-react';

interface NetworkDataTableProps {
  onNetworkToggle?: (bssid: string, visible: boolean) => void;
  visibleNetworks?: Set<string>;
}

export function NetworkDataTable({ onNetworkToggle, visibleNetworks = new Set() }: NetworkDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('lasttime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);

  const { data: g63Networks, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    queryFn: () => api.getG63Networks(showAll ? 1000 : 100),
    refetchInterval: 30000,
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredNetworks = useMemo(() => {
    if (!g63Networks?.data) return [];

    let filtered = g63Networks.data.filter(network => 
      network.ssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.bssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.capabilities.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a];
      let bVal = b[sortField as keyof typeof b];

      if (sortField === 'bestlevel') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [g63Networks?.data, searchTerm, sortField, sortDirection]);

  const toggleNetworkVisibility = (bssid: string) => {
    const isVisible = visibleNetworks.has(bssid);
    onNetworkToggle?.(bssid, !isVisible);
  };

  const toggleAllNetworks = (visible: boolean) => {
    sortedAndFilteredNetworks.forEach(network => {
      onNetworkToggle?.(network.bssid, visible);
    });
  };

  if (isLoading) {
    return (
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!g63Networks?.data || g63Networks.data.length === 0) {
    return (
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-600 flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            G63 Network Data Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No G63 network data available. API returned: {JSON.stringify(g63Networks)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-medium text-left justify-start"
      onClick={() => handleSort(field)}
      data-testid={`sort-${field}`}
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-3 w-3 ml-1" /> : 
          <ChevronDown className="h-3 w-3 ml-1" />
      )}
    </Button>
  );

  return (
    <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-600 flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          G63 Network Data Table
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search networks, BSSID, or security..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-networks"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllNetworks(true)}
              data-testid="show-all-networks"
            >
              <Eye className="h-4 w-4 mr-1" />
              Show All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllNetworks(false)}
              data-testid="hide-all-networks"
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Hide All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="overflow-x-auto md:overflow-visible">
            <div className="grid grid-cols-11 gap-2 p-3 bg-muted/30 rounded-lg border border-border/30 text-xs font-medium min-w-[800px] md:min-w-full">
              <div className="col-span-1 text-center">Visible</div>
              <div className="col-span-2">
                <SortButton field="ssid">Network Name</SortButton>
              </div>
              <div className="col-span-2">
                <SortButton field="bssid">BSSID</SortButton>
              </div>
              <div className="col-span-1 text-center">
                <SortButton field="bestlevel">Signal</SortButton>
              </div>
              <div className="col-span-2">
                <SortButton field="capabilities">Security</SortButton>
              </div>
              <div className="col-span-1 text-center">
                <SortButton field="frequency">Frequency</SortButton>
              </div>
              <div className="col-span-2">
                <SortButton field="lasttime">Last Seen</SortButton>
              </div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="h-[60vh] md:h-[80vh] overflow-y-auto overflow-x-auto md:overflow-x-visible space-y-1 bg-background/20 border border-dashed border-yellow-500/50 min-h-[200px]">
            {sortedAndFilteredNetworks.length === 0 ? (
              <div className="p-8 text-center text-red-600 bg-red-500/10 rounded">
                No networks to display after filtering. Total available: {g63Networks?.data?.length || 0}
              </div>
            ) : (
              sortedAndFilteredNetworks.map((network) => {
                const color = generateColorFromBSSID(network.bssid);
                const signalInfo = getSignalStrengthCategory(network.bestlevel);
                const securityInfo = getSecurityStyling(network.capabilities);
                const isVisible = visibleNetworks.has(network.bssid);
                const lastSeen = new Date(Number(network.lasttime));

              return (
                <div
                  key={network.bssid}
                  className={`grid grid-cols-11 gap-2 p-3 rounded-lg border transition-all duration-200 min-w-[800px] md:min-w-full ${
                    isVisible 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border/30 bg-background/60 opacity-70'
                  }`}
                  style={{ borderLeftColor: color.hex, borderLeftWidth: '3px' }}
                  data-testid={`network-row-${network.bssid}`}
                >
                  {/* Toggle Switch */}
                  <div className="col-span-1 flex justify-center items-center">
                    <Switch
                      checked={isVisible}
                      onCheckedChange={(checked) => onNetworkToggle?.(network.bssid, checked)}
                      data-testid={`toggle-${network.bssid}`}
                    />
                  </div>

                  {/* Network Name */}
                  <div className="col-span-2">
                    <p className="font-medium text-sm truncate" title={network.ssid}>
                      {network.ssid || 'Hidden Network'}
                    </p>
                    <div 
                      className="w-4 h-2 rounded mt-1" 
                      style={{ backgroundColor: color.hex }}
                      title={`Color: ${color.hex}`}
                    ></div>
                  </div>

                  {/* BSSID */}
                  <div className="col-span-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      {network.bssid}
                    </p>
                  </div>

                  {/* Signal Strength */}
                  <div className="col-span-1 text-center">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ color: signalInfo.color, borderColor: signalInfo.color }}
                    >
                      {network.bestlevel} dBm
                    </Badge>
                  </div>

                  {/* Security */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <i 
                        className={`${securityInfo.icon} text-xs`}
                        style={{ color: securityInfo.color }}
                      ></i>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ color: securityInfo.color, borderColor: securityInfo.color }}
                      >
                        {securityInfo.level}
                      </Badge>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-mono">
                      {network.frequency ? `${network.frequency} MHz` : 'N/A'}
                    </span>
                  </div>

                  {/* Last Seen */}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      {lastSeen.toLocaleDateString()} {lastSeen.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Showing {sortedAndFilteredNetworks.length} of {g63Networks?.data?.length || 0} networks
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show all data:</span>
              <Switch
                checked={showAll}
                onCheckedChange={setShowAll}
                data-testid="toggle-show-all"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}