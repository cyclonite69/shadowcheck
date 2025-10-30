/**
 * Top Networks - Global Most Sighted Networks
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wifi, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';

interface Network {
  bssid: string;
  ssid: string | null;
  frequency: number | null;
  frequency_band: string;
  signal_strength: number | null;
  security_risk_level: string;
  infrastructure_type: string;
  total_observations: number;
  capabilities: string | null;
}

type SortColumn = 'ssid' | 'bssid' | 'frequency' | 'signal_strength' | 'security_risk_level' | 'total_observations';

export function NetworksNearHome() {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total_observations');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBSSIDs, setSelectedBSSIDs] = useState<string[]>([]);
  const [limit, setLimit] = useState(100);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/v1/classification/networks', sortColumn, sortOrder, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/classification/networks?technology=Wi-Fi&limit=${limit}&sortBy=${sortColumn}&sortOrder=${sortOrder}`
      );
      if (!res.ok) throw new Error('Failed to fetch networks');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const networks: Network[] = data?.data || [];

  // Parse security details from capabilities
  const parseSecurityDetails = (caps: string | null): string => {
    if (!caps) return 'Unknown';

    const details: string[] = [];

    // Check for WPA3
    if (caps.includes('WPA3') || caps.includes('SAE')) {
      details.push('WPA3');
    }
    // Check for WPA2
    else if (caps.includes('WPA2') || caps.includes('RSN')) {
      details.push('WPA2');
    }
    // Check for WPA1
    else if (caps.includes('WPA-')) {
      details.push('WPA');
    }
    // Check for WEP
    else if (caps.includes('WEP')) {
      details.push('WEP');
    }

    // Check for Enterprise (EAP) vs Personal (PSK)
    if (caps.includes('EAP') || caps.includes('MGT')) {
      details.push('Enterprise');
    } else if (caps.includes('PSK')) {
      details.push('Personal');
    }

    // Check for encryption
    if (caps.includes('CCMP')) {
      details.push('AES');
    } else if (caps.includes('TKIP')) {
      details.push('TKIP');
    }

    // Check for WPS
    if (caps.includes('WPS')) {
      details.push('WPS');
    }

    return details.length > 0 ? details.join(' ') : 'Open';
  };

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const toggleSelect = (bssid: string) => {
    if (selectedBSSIDs.includes(bssid)) {
      setSelectedBSSIDs(selectedBSSIDs.filter(b => b !== bssid));
    } else {
      setSelectedBSSIDs([...selectedBSSIDs, bssid]);
    }
  };

  const selectAll = () => {
    if (selectedBSSIDs.length === networks.length) {
      setSelectedBSSIDs([]);
    } else {
      setSelectedBSSIDs(networks.map(n => n.bssid));
    }
  };

  const loadMore = () => {
    setLimit(prev => prev + 100);
  };

  const exportSelected = (format: string) => {
    const selected = networks.filter(n => selectedBSSIDs.includes(n.bssid));
    alert(`Exporting ${selected.length} networks to ${format.toUpperCase()}`);
  };

  const getSecurityColor = (risk: string) => {
    if (!risk) return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    if (risk.includes('Robust')) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (risk.includes('Vulnerable')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (risk.includes('Insecure')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (risk.includes('Unsecured')) return 'text-red-500 bg-red-600/10 border-red-600/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getChannel = (freq: number | null): string => {
    if (!freq || freq === 0) return '—';
    if (freq >= 2412 && freq <= 2484) return `${Math.floor((freq - 2407) / 5)}`;
    if (freq >= 5170 && freq <= 5825) return `${Math.floor((freq - 5000) / 5)}`;
    if (freq >= 5925 && freq <= 7125) return `${Math.floor((freq - 5950) / 5)}`;
    return '—';
  };

  const SortHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase cursor-pointer hover:bg-slate-700/30 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </th>
  );

  if (error) {
    return (
      <Card className="premium-card">
        <CardContent className="p-8">
          <div className="text-center text-red-400">
            <p>Error loading networks</p>
            <p className="text-sm text-slate-400 mt-2">{String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Wifi className={`h-5 w-5 ${iconColors.primary.text}`} />
              Top Wi-Fi Networks (Most Sighted)
            </CardTitle>
            <CardDescription className="text-slate-400">
              {networks.length} networks sorted by observation count • {selectedBSSIDs.length} selected
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedBSSIDs.length > 0 && (
              <>
                <Button
                  onClick={() => exportSelected('wigle')}
                  size="sm"
                  variant="outline"
                  className="bg-green-600/20 border-green-500/30 text-green-400"
                >
                  <Download className="h-4 w-4 mr-2" />
                  WiGLE
                </Button>
                <Button
                  onClick={() => exportSelected('kismet')}
                  size="sm"
                  variant="outline"
                  className="bg-purple-600/20 border-purple-500/30 text-purple-400"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Kismet
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : networks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedBSSIDs.length === networks.length && networks.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <SortHeader column="ssid" label="SSID" />
                  <SortHeader column="bssid" label="BSSID" />
                  <SortHeader column="frequency" label="Freq" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Ch</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Band</th>
                  <SortHeader column="signal_strength" label="Signal" />
                  <SortHeader column="security_risk_level" label="Risk Level" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Security Details</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Type</th>
                  <SortHeader column="total_observations" label="Sightings" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {networks.map((net) => (
                  <tr
                    key={net.bssid}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      selectedBSSIDs.includes(net.bssid) ? 'bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBSSIDs.includes(net.bssid)}
                        onChange={() => toggleSelect(net.bssid)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-200 font-medium">
                      {net.ssid || '<Hidden>'}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-slate-400">
                      {net.bssid}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300 font-mono">
                      {net.frequency || '—'}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {getChannel(net.frequency)}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {net.frequency_band}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {net.signal_strength ? `${net.signal_strength} dBm` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={`text-xs border ${getSecurityColor(net.security_risk_level)}`}>
                        {(net.security_risk_level || 'Unknown').split('(')[0].trim()}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-green-300">
                      {parseSecurityDetails(net.capabilities)}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {(net.infrastructure_type || 'Unknown').replace('/', ' / ')}
                    </td>
                    <td className="px-3 py-3 text-sm text-blue-300 font-mono font-semibold">
                      {net.total_observations?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Load More Button */}
            {networks.length >= limit && (
              <div className="mt-4 flex items-center justify-center">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  Load More Networks (showing {limit})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Wifi className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No Wi-Fi networks found</p>
            <p className="text-sm mt-1">Check your database connection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
