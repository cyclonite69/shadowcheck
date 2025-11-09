/**
 * NetworkTooltip - Interactive WiFi network details tooltip
 * Dark modal-style tooltip for displaying network information on maps or other interfaces
 */

import { Wifi } from 'lucide-react';

interface NetworkTooltipProps {
  network: {
    ssid?: string | null;
    isHidden?: boolean;
    bssid: string;
    frequency?: number | null;
    signalStrength?: number | null;
    encryption?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    altitude?: number | null;
    lastSeen?: string | null;
  };
  position?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  className?: string;
}

export function NetworkTooltip({ network, position = {}, className = '' }: NetworkTooltipProps) {
  // Format frequency to GHz
  const frequencyGHz = network.frequency
    ? (network.frequency / 1000).toFixed(2)
    : null;

  // Truncate MAC address if needed
  const displayBssid = network.bssid.length > 20
    ? `${network.bssid.slice(0, 17)}...`
    : network.bssid;

  // Format timestamp
  const formatLastSeen = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const positionStyle = {
    top: position.top !== undefined ? `${position.top}px` : undefined,
    left: position.left !== undefined ? `${position.left}px` : undefined,
    bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
    right: position.right !== undefined ? `${position.right}px` : undefined,
  };

  return (
    <div
      className={`absolute z-50 bg-black border border-gray-700 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[400px] ${className}`}
      style={positionStyle}
    >
      {/* WiFi Icon - Upper Right */}
      <div className="absolute top-3 right-3 text-gray-400">
        <Wifi size={20} />
      </div>

      {/* Content */}
      <div className="space-y-2.5 text-sm">
        {/* Network Name */}
        <div>
          <span className="text-gray-400 text-xs uppercase tracking-wide">Network:</span>
          <div className="text-white font-bold mt-0.5">
            {network.isHidden || !network.ssid ? (
              <span className="italic">(hidden)</span>
            ) : (
              network.ssid
            )}
          </div>
        </div>

        {/* MAC Address */}
        <div>
          <span className="text-gray-400 text-xs uppercase tracking-wide">MAC Address:</span>
          <div className="text-gray-200 font-mono text-xs mt-0.5" title={network.bssid}>
            {displayBssid}
          </div>
        </div>

        {/* Frequency */}
        {frequencyGHz && (
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Frequency:</span>
            <div className="text-gray-200 mt-0.5">{frequencyGHz} GHz</div>
          </div>
        )}

        {/* Signal Strength */}
        {network.signalStrength !== null && network.signalStrength !== undefined && (
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Signal:</span>
            <div className="text-amber-400 font-semibold mt-0.5">
              {network.signalStrength} dBm
            </div>
          </div>
        )}

        {/* Encryption Type */}
        {network.encryption && (
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Encryption:</span>
            <div className="text-gray-200 mt-0.5">{network.encryption}</div>
          </div>
        )}

        {/* Location Group - with left accent */}
        {(network.latitude != null || network.longitude != null || network.altitude != null) && (
          <div className="border-l-2 border-cyan-500 pl-3 py-1 space-y-1.5">
            {network.latitude != null && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Latitude:</span>
                <span className="text-gray-200 text-xs font-mono">
                  {network.latitude.toFixed(6)}°
                </span>
              </div>
            )}
            {network.longitude != null && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Longitude:</span>
                <span className="text-gray-200 text-xs font-mono">
                  {network.longitude.toFixed(6)}°
                </span>
              </div>
            )}
            {network.altitude != null && (
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Altitude:</span>
                <span className="text-gray-200 text-xs font-mono">
                  {network.altitude.toFixed(1)} m
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Seen */}
        <div className="pt-2 border-t border-gray-800">
          <span className="text-gray-400 text-xs uppercase tracking-wide">Last Seen:</span>
          <div className="text-gray-300 text-xs mt-0.5">
            {formatLastSeen(network.lastSeen ?? null)}
          </div>
        </div>
      </div>
    </div>
  );
}
