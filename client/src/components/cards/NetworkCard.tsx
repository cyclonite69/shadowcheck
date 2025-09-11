import React from 'react';
import { Wifi, MapPin, Clock, Shield } from 'lucide-react';

interface NetworkCardProps {
  network: {
    id: string;
    bssid: string;
    ssid?: string;
    signal_strength?: number;
    encryption?: string;
    observed_at: string;
    latitude?: number;
    longitude?: number;
  };
}

const NetworkCard: React.FC<NetworkCardProps> = ({ network }) => {
  const getSignalColor = (strength?: number) => {
    if (!strength) return 'bg-gray-400';
    if (strength > -50) return 'bg-green-500';
    if (strength > -70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalWidth = (strength?: number) => {
    if (!strength) return '20%';
    const percentage = Math.max(0, Math.min(100, (strength + 100) * 1.5));
    return `${percentage}%`;
  };

  const getSecurityColor = (encryption?: string) => {
    if (!encryption || encryption.includes('Open')) return 'text-red-400';
    if (encryption.includes('WPA3')) return 'text-green-400';
    if (encryption.includes('WPA2')) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="glassy p-4 rounded-lg mb-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Wifi size={16} className="text-teal-400" />
          <div>
            <div className="font-mono text-sm text-teal-300">
              {network.ssid || 'Hidden Network'}
            </div>
            <div className="font-mono text-xs text-gray-400">
              {network.bssid}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Shield size={14} className={getSecurityColor(network.encryption)} />
          <span className="text-xs text-gray-400">
            {network.encryption?.replace(/[\[\]]/g, '') || 'Open'}
          </span>
        </div>
      </div>

      {/* Signal Strength Bar */}
      {network.signal_strength && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Signal</span>
            <span>{network.signal_strength} dBm</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getSignalColor(network.signal_strength)}`}
              style={{ width: getSignalWidth(network.signal_strength) }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        {network.latitude && network.longitude && (
          <div className="flex items-center space-x-1">
            <MapPin size={12} />
            <span>
              {network.latitude.toFixed(4)}, {network.longitude.toFixed(4)}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{new Date(network.observed_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkCard;