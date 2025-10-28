/**
 * Network Table View - Simplified table for unified view
 * Accepts networks as props and supports row selection
 */

import { useMemo, useEffect, useRef } from 'react';
import { Wifi, Bluetooth, Signal, Shield, ShieldAlert, ShieldCheck, ShieldX, ShieldQuestion, Radio, Smartphone } from 'lucide-react';
import { formatForensicsTime } from '@/lib/dateUtils';
import { parseSecurityClassification, SECURITY_CLASSIFICATION } from '@/lib/wirelessClassification';
import { iconColors } from '@/lib/iconColors';
import { cn } from '@/lib/utils';

interface NetworkFeature {
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
    signal_strength?: number | null;
    signal?: number | null;
    encryption?: string;
    observed_at?: string;
    seen?: string;
    radio_type?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface NetworkTableViewProps {
  networks: NetworkFeature[];
  selectedNetworkId?: string | null;
  onRowClick?: (network: NetworkFeature) => void;
}

export function NetworkTableView({ networks, selectedNetworkId, onRowClick }: NetworkTableViewProps) {
  const displayLimit = 500; // Show first 500 networks for performance
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Scroll to selected row when selection changes
  useEffect(() => {
    if (selectedNetworkId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedNetworkId]);

  const displayedNetworks = useMemo(() => {
    return networks.slice(0, displayLimit);
  }, [networks]);

  const getRadioIcon = (type?: string) => {
    const radioType = type?.toUpperCase() || 'W';

    switch (radioType) {
      case 'W':
        return <Wifi className={`h-4 w-4 ${iconColors.primary.text}`} />;
      case 'B':
        return <Bluetooth className={`h-4 w-4 ${iconColors.secondary.text}`} />;
      case 'E':
        return <Signal className={`h-4 w-4 ${iconColors.warning.text}`} />;
      case 'L':
        return <Smartphone className={`h-4 w-4 ${iconColors.success.text}`} />;
      case 'G':
        return <Radio className="h-4 w-4 text-slate-400" />;
      default:
        return <Radio className="h-4 w-4 text-slate-400" />;
    }
  };

  const getSignalColor = (signal?: number | null) => {
    if (!signal) return 'text-slate-500';
    if (signal >= -50) return 'text-green-400';
    if (signal >= -70) return 'text-yellow-400';
    if (signal >= -85) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSecurityBadge = (encryption?: string) => {
    if (!encryption) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
          <ShieldQuestion className="h-3 w-3" />
          Unknown
        </span>
      );
    }

    const securityClass = parseSecurityClassification(encryption);
    const metadata = SECURITY_CLASSIFICATION[securityClass];

    // Map risk level to colors and icons
    const getRiskColor = (risk: string) => {
      switch (risk) {
        case 'critical':
          return 'bg-red-500/10 text-red-400 border-red-500/30';
        case 'high':
          return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
        case 'moderate':
          return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
        case 'acceptable':
          return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        case 'optimal':
          return 'bg-green-500/10 text-green-400 border-green-500/30';
        default:
          return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      }
    };

    const getRiskIcon = (risk: string) => {
      switch (risk) {
        case 'critical':
          return ShieldX;
        case 'high':
          return ShieldAlert;
        case 'moderate':
        case 'acceptable':
          return ShieldCheck;
        case 'optimal':
          return ShieldCheck;
        default:
          return Shield;
      }
    };

    const Icon = getRiskIcon(metadata.risk);

    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        getRiskColor(metadata.risk)
      )}
      title={`${metadata.label} - ${metadata.description}`}
      >
        <Icon className="h-3 w-3" />
        {metadata.label}
      </span>
    );
  };

  const getNetworkId = (network: NetworkFeature) => {
    return network.properties.bssid || network.properties.uid || '';
  };

  if (networks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>No networks found. Adjust filters to see results.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-300">
          Showing {displayedNetworks.length.toLocaleString()} of {networks.length.toLocaleString()} networks
        </h3>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">SSID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">BSSID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Signal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Frequency</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Security</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {displayedNetworks.map((network, index) => {
              const networkId = getNetworkId(network);
              const isSelected = selectedNetworkId === networkId;
              const props = network.properties;
              const signal = props.signal_strength ?? props.signal;
              // Create unique key using BSSID + timestamp + index to handle duplicate observations
              const uniqueKey = `${networkId}-${props.observed_at || props.seen || ''}-${index}`;

              return (
                <tr
                  key={uniqueKey}
                  id={`network-row-${networkId}`}
                  ref={isSelected ? selectedRowRef : null}
                  onClick={() => onRowClick?.(network)}
                  className={cn(
                    'cursor-pointer transition-all',
                    'hover:bg-slate-800/50',
                    isSelected && 'bg-blue-500/10 border-l-4 border-l-blue-500'
                  )}
                >
                  <td className="px-4 py-3">
                    {getRadioIcon(props.radio_type)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-200 font-medium">
                      {props.ssid || <span className="text-slate-500 italic">Hidden</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-slate-400">{props.bssid}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('font-mono text-xs', getSignalColor(signal))}>
                      {signal ? `${signal} dBm` : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {props.frequency ? `${props.frequency} MHz` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {getSecurityBadge(props.encryption)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {props.observed_at ? formatForensicsTime(props.observed_at) :
                     props.seen ? formatForensicsTime(props.seen) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer showing if there are more networks */}
      {networks.length > displayLimit && (
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500">
            Showing first {displayLimit} networks. {(networks.length - displayLimit).toLocaleString()} more hidden for performance.
          </p>
        </div>
      )}
    </div>
  );
}
