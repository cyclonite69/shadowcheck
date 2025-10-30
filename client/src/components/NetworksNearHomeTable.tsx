/**
 * Networks Near Home - Comprehensive Sortable Table
 *
 * Shows networks within configurable radius of home with:
 * - All available data fields
 * - Sortable columns
 * - Network selection checkboxes
 * - Infinite scroll
 * - Export to WiGLE/Kismet
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
  ssid: string;
  technology_resolved: string;
  frequency_band: string;
  frequency: number;
  capabilities: string;
  signal_strength: number;
  device_type: string;
  manufacturer_id: number;
  security_risk_level: string;
  infrastructure_type: string;
  is_stale: boolean;
  location_confidence: string;
  local_observations: number;
  wigle_observations: number;
  total_observations: number;
  avg_gps_accuracy_m: number;
  max_spread_m: number;
  first_observed: string;
  last_observed: string;
  distance_from_home: number;
  centroid_geojson: any;
}

type SortColumn = keyof Network;
type SortOrder = 'asc' | 'desc';

export function NetworksNearHomeTable() {
  const [radiusMeters, setRadiusMeters] = useState(100);
  const [radiusInput, setRadiusInput] = useState('100');
  const [sortColumn, setSortColumn] = useState<SortColumn>('total_observations');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(100);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/v1/classification/networks-near-home', radiusMeters, sortColumn, sortOrder, limit],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/classification/networks-near-home?radius_m=${radiusMeters}&limit=${limit}&sortBy=${sortColumn}&sortOrder=${sortOrder}`
      );
      if (!res.ok) throw new Error('Failed to fetch networks');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const networks: Network[] = data?.data || [];

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedNetworks.size === networks.length && networks.length > 0) {
      setSelectedNetworks(new Set());
    } else {
      setSelectedNetworks(new Set(networks.map((n) => n.bssid)));
    }
  };

  const toggleSelection = (bssid: string) => {
    const newSet = new Set(selectedNetworks);
    if (newSet.has(bssid)) {
      newSet.delete(bssid);
    } else {
      newSet.add(bssid);
    }
    setSelectedNetworks(newSet);
  };

  const loadMore = () => {
    setLimit(prev => prev + 50);
  };

  const applyRadius = () => {
    const parsed = parseInt(radiusInput);
    if (!isNaN(parsed) && parsed > 0) {
      setRadiusMeters(parsed);
    }
  };

  const exportSelected = (format: 'wigle' | 'kismet') => {
    const selected = networks.filter((n) => selectedNetworks.has(n.bssid));
    console.log(`Exporting ${selected.length} networks to ${format}:`, selected);
    // TODO: Implement actual export functionality
    alert(`Would export ${selected.length} networks to ${format.toUpperCase()}`);
  };

  const getSecurityColor = (risk: string) => {
    if (risk.includes('Robust')) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (risk.includes('Vulnerable')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (risk.includes('Insecure')) return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (risk.includes('Unsecured')) return 'text-red-500 bg-red-600/10 border-red-600/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getChannelFromFreq = (freq: number): string => {
    if (!freq || freq === 0) return 'Unknown';
    if (freq >= 2412 && freq <= 2484) return `${Math.floor((freq - 2407) / 5)}`;
    if (freq >= 5170 && freq <= 5825) return `${Math.floor((freq - 5000) / 5)}`;
    if (freq >= 5925 && freq <= 7125) return `${Math.floor((freq - 5950) / 5)}`;
    return 'N/A';
  };

  const SortableHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <th
      onClick={() => handleSort(column)}
      className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-700/30 select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </th>
  );

  return (
    <Card className="premium-card">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Wifi className={`h-5 w-5 ${iconColors.primary.text}`} />
              Networks Near Home
            </CardTitle>
            <CardDescription className="text-slate-400">
              {networks.length} Wi-Fi networks within {radiusMeters}m • {selectedNetworks.size} selected
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">Radius (m):</label>
              <input
                type="number"
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyRadius()}
                className="w-24 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />
              <Button
                onClick={applyRadius}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            </div>

            {selectedNetworks.size > 0 && (
              <>
                <Button
                  onClick={() => exportSelected('wigle')}
                  size="sm"
                  variant="outline"
                  className="bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to WiGLE
                </Button>
                <Button
                  onClick={() => exportSelected('kismet')}
                  size="sm"
                  variant="outline"
                  className="bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Kismet
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
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedNetworks.size === networks.length && networks.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <SortableHeader column="ssid" label="SSID" />
                  <SortableHeader column="bssid" label="BSSID" />
                  <SortableHeader column="frequency" label="Freq (MHz)" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Channel</th>
                  <SortableHeader column="frequency_band" label="Band" />
                  <SortableHeader column="signal_strength" label="Signal" />
                  <SortableHeader column="security_risk_level" label="Security" />
                  <SortableHeader column="infrastructure_type" label="Type" />
                  <SortableHeader column="total_observations" label="Sightings" />
                  <SortableHeader column="distance_from_home" label="Distance" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Device</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {networks.map((network) => (
                  <tr
                    key={network.bssid}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      selectedNetworks.has(network.bssid) ? 'bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedNetworks.has(network.bssid)}
                        onChange={() => toggleSelection(network.bssid)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-200 font-medium">
                      {network.ssid || '<Hidden>'}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-slate-400">
                      {network.bssid}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300 font-mono">
                      {network.frequency || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {getChannelFromFreq(network.frequency)}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {network.frequency_band}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {network.signal_strength ? `${network.signal_strength} dBm` : 'N/A'}
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={`text-xs border ${getSecurityColor(network.security_risk_level)}`}>
                        {network.security_risk_level.split('(')[0].trim()}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {network.infrastructure_type.replace('/', ' / ')}
                    </td>
                    <td className="px-3 py-3 text-sm text-blue-300 font-mono font-semibold">
                      {network.total_observations.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-300">
                      {network.distance_from_home.toFixed(1)}m
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">
                      {network.device_type || 'Unknown'}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 max-w-xs truncate" title={network.capabilities}>
                      {network.capabilities || 'N/A'}
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
                  Load More Networks
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Wifi className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No networks found within {radiusMeters}m of home</p>
            <p className="text-sm mt-1">Try increasing the radius</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
