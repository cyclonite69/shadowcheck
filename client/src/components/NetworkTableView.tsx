/**
 * Network Table View - Simplified table for unified view
 * Accepts networks as props and supports selection/click
 */

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wifi, Bluetooth, Signal, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconColors } from '@/lib/iconColors';
import { formatRelativeTime } from '@/lib/dateUtils';
import { parseWiFiSecurity, getSecurityLevelColor } from '@/lib/securityUtils';

interface Network {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    uid?: string;
    bssid: string;
    ssid: string;
    frequency?: number;
    signal?: number | null;
    signal_strength?: number | null;
    encryption?: string;
    capabilities?: string;
    seen?: string;
    observed_at?: string;
    radio_type?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface NetworkTableViewProps {
  networks: Network[];
  selectedNetworkId?: string | null;
  onRowClick?: (network: Network) => void;
}

const getRadioTypeIcon = (type: string) => {
  const upperType = type?.toUpperCase() || 'W';
  switch (upperType) {
    case 'W':
      return <Wifi className={`w-4 h-4 ${iconColors.primary.text}`} />;
    case 'B':
      return <Bluetooth className={`w-4 h-4 ${iconColors.secondary.text}`} />;
    case 'E':
      return <Signal className={`w-4 h-4 ${iconColors.warning.text}`} />;
    default:
      return <Radio className={`w-4 h-4 ${iconColors.neutral.text}`} />;
  }
};

const getRadioTypeName = (type: string) => {
  const upperType = type?.toUpperCase() || 'W';
  switch (upperType) {
    case 'W':
      return 'WiFi';
    case 'B':
      return 'Bluetooth';
    case 'E':
      return 'BLE';
    case 'G':
      return 'GSM';
    case 'L':
      return 'LTE';
    case 'N':
      return 'NR';
    default:
      return 'Unknown';
  }
};

export function NetworkTableView({ networks, selectedNetworkId, onRowClick }: NetworkTableViewProps) {
  const displayNetworks = useMemo(() => {
    return networks.slice(0, 500); // Limit to 500 for performance
  }, [networks]);

  if (networks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>No networks found. Adjust filters to see data.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-slate-900">
      <Table>
        <TableHeader className="sticky top-0 bg-slate-800 z-10">
          <TableRow>
            <TableHead className="w-12 text-slate-300">Type</TableHead>
            <TableHead className="text-slate-300">SSID</TableHead>
            <TableHead className="text-slate-300">BSSID</TableHead>
            <TableHead className="w-24 text-center text-slate-300">Signal</TableHead>
            <TableHead className="w-32 text-slate-300">Security</TableHead>
            <TableHead className="w-32 text-slate-300">Last Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayNetworks.map((network) => {
            const networkId = network.properties.bssid || network.properties.uid;
            const isSelected = networkId === selectedNetworkId;
            const signal = network.properties.signal ?? network.properties.signal_strength;
            const radioType = network.properties.radio_type || 'W';
            const security = radioType.toUpperCase() === 'W'
              ? parseWiFiSecurity(network.properties.capabilities || network.properties.encryption || '')
              : 'N/A';

            return (
              <TableRow
                key={networkId}
                id={`network-row-${networkId}`}
                onClick={() => onRowClick?.(network)}
                className={cn(
                  'cursor-pointer hover:bg-slate-800 transition-colors',
                  isSelected && 'bg-blue-900/30 border-l-4 border-blue-500'
                )}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getRadioTypeIcon(radioType)}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-200">
                  {network.properties.ssid || <span className="text-slate-500 italic">Hidden</span>}
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-400">
                  {network.properties.bssid}
                </TableCell>
                <TableCell className="text-center">
                  {signal !== null && signal !== undefined ? (
                    <span className={cn(
                      'font-semibold',
                      signal > -60 ? 'text-green-400' :
                      signal > -70 ? 'text-yellow-400' :
                      signal > -80 ? 'text-orange-400' :
                      'text-red-400'
                    )}>
                      {signal} dBm
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {radioType.toUpperCase() === 'W' ? (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      getSecurityLevelColor(security)
                    )}>
                      {security}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">
                      {getRadioTypeName(radioType)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-400">
                  {formatRelativeTime(network.properties.seen || network.properties.observed_at || '')}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {networks.length > 500 && (
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-3 text-center text-sm text-slate-400">
          Showing 500 of {networks.length.toLocaleString()} networks. Use filters to refine results.
        </div>
      )}
    </div>
  );
}
