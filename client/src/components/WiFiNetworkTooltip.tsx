/**
 * WiFiNetworkTooltip - Interactive tooltip for displaying WiFi network details
 *
 * Features:
 * - Dark modal design with hierarchical information
 * - WiFi icon in upper right corner
 * - Color-coded signal strength
 * - Location grouping with accent border
 * - Truncated MAC address display
 */

import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WiFiNetworkTooltipProps {
  /** Network SSID (null for hidden networks) */
  ssid: string | null;
  /** MAC address (BSSID) */
  bssid: string;
  /** Frequency in MHz (will be displayed in GHz) */
  frequency?: number;
  /** Signal strength in dBm */
  signalStrength: number;
  /** Encryption/Security type */
  encryption: string;
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Altitude in meters */
  altitude?: number;
  /** Last seen timestamp */
  lastSeen: string | Date;
  /** Position of tooltip */
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  /** CSS class overrides */
  className?: string;
}

export function WiFiNetworkTooltip({
  ssid,
  bssid,
  frequency,
  signalStrength,
  encryption,
  latitude,
  longitude,
  altitude,
  lastSeen,
  position = { top: 100, left: 100 },
  className
}: WiFiNetworkTooltipProps) {
  // Format frequency from MHz to GHz
  const formattedFrequency = frequency ? `${(frequency / 1000).toFixed(3)} GHz` : 'Unknown';

  // Format timestamp
  const formattedTimestamp = typeof lastSeen === 'string'
    ? new Date(lastSeen).toLocaleString()
    : lastSeen.toLocaleString();

  // Truncate MAC address if too long
  const truncatedBssid = bssid.length > 20 ? `${bssid.slice(0, 17)}...` : bssid;

  // Signal strength color coding
  const getSignalColor = (signal: number) => {
    if (signal >= -50) return 'text-green-400';
    if (signal >= -60) return 'text-yellow-400';
    if (signal >= -70) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div
      className={cn(
        "absolute z-50 bg-black border border-slate-700 rounded-lg shadow-2xl",
        "min-w-[280px] max-w-[320px] p-4",
        className
      )}
      style={position}
    >
      {/* Header with WiFi Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-white font-bold text-base mb-1">
            {ssid || <span className="italic text-slate-400">(hidden)</span>}
          </div>
          <div className="text-slate-400 text-xs font-mono truncate" title={bssid}>
            {truncatedBssid}
          </div>
        </div>
        <Wifi className="h-5 w-5 text-slate-300 ml-2 flex-shrink-0" />
      </div>

      {/* Network Details */}
      <div className="space-y-2 text-sm">
        {/* Frequency */}
        {frequency && (
          <div className="flex justify-between">
            <span className="text-slate-400">Frequency:</span>
            <span className="text-slate-200">{formattedFrequency}</span>
          </div>
        )}

        {/* Signal Strength */}
        <div className="flex justify-between">
          <span className="text-slate-400">Signal:</span>
          <span className={cn("font-medium", getSignalColor(signalStrength))}>
            {signalStrength} dBm
          </span>
        </div>

        {/* Encryption */}
        <div className="flex justify-between">
          <span className="text-slate-400">Encryption:</span>
          <span className="text-slate-200">{encryption}</span>
        </div>
      </div>

      {/* Location Information with Accent Border */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="pl-3 border-l-2 border-cyan-500 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Latitude:</span>
            <span className="text-slate-300 font-mono">{latitude.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Longitude:</span>
            <span className="text-slate-300 font-mono">{longitude.toFixed(6)}</span>
          </div>
          {altitude !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Altitude:</span>
              <span className="text-slate-300 font-mono">{altitude.toFixed(1)} m</span>
            </div>
          )}
        </div>
      </div>

      {/* Last Seen Timestamp */}
      <div className="mt-3 pt-2 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          Last seen: <span className="text-slate-300">{formattedTimestamp}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * WiFiNetworkTooltipDemo - Demo component showing tooltip usage
 */
export function WiFiNetworkTooltipDemo() {
  const sampleData = {
    ssid: null, // Hidden network
    bssid: '00:11:22:33:44:55:66:77',
    frequency: 5180, // MHz
    signalStrength: -45,
    encryption: 'WPA2',
    latitude: 43.012345,
    longitude: -83.687654,
    altitude: 215.5,
    lastSeen: new Date('2025-01-09T10:30:00')
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 p-8">
      <div className="text-white mb-4">
        <h2 className="text-2xl font-bold mb-2">WiFi Network Tooltip Demo</h2>
        <p className="text-slate-400">
          Example tooltip showing network details with proper styling and iconography
        </p>
      </div>

      {/* Tooltip positioned in center-left */}
      <WiFiNetworkTooltip
        {...sampleData}
        position={{ top: 150, left: 100 }}
      />

      {/* Another example with strong signal */}
      <WiFiNetworkTooltip
        ssid="CoffeeShop_Guest"
        bssid="AA:BB:CC:DD:EE:FF"
        frequency={2437}
        signalStrength={-35}
        encryption="WPA3"
        latitude={43.055678}
        longitude={-83.712345}
        altitude={220.0}
        lastSeen={new Date()}
        position={{ top: 150, right: 100 }}
      />

      {/* Weak signal example */}
      <WiFiNetworkTooltip
        ssid="Home Network"
        bssid="11:22:33:44:55:66"
        frequency={5805}
        signalStrength={-75}
        encryption="WPA2-PSK"
        latitude={43.023456}
        longitude={-83.698765}
        lastSeen={new Date('2025-01-09T08:15:00')}
        position={{ bottom: 100, left: 100 }}
      />
    </div>
  );
}
