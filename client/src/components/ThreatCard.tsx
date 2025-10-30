/**
 * ThreatCard - Clean, minimal threat card component
 *
 * Shows network threat information without bloated embedded UIs
 */

import { useState } from 'react';
import { Wifi, Navigation, Eye, Home, MapPin, ArrowRight, X, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ThreatCardProps {
  threat: {
    bssid: string;
    ssid?: string;
    radio_band?: string;
    threat_level: 'EXTREME' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    max_distance_km: number;
    home_sightings: number;
    away_sightings: number;
    total_sightings: number;
    is_mobile_hotspot?: boolean;
    confidence_score?: number;
  };
  onViewDetails?: () => void;
  onDismiss?: () => void;
  onWhitelist?: () => void;
}

export function ThreatCard({ threat, onViewDetails, onDismiss, onWhitelist }: ThreatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThreatStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EXTREME':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const formatDistance = (km: number) => {
    if (km >= 1000) return `${(km / 1000).toFixed(1)}Kkm`;
    if (km >= 1) return `${km.toFixed(2)}km`;
    return `${(km * 1000).toFixed(0)}m`;
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 hover:bg-slate-800/70 transition-all duration-200 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            threat.threat_level === 'EXTREME' || threat.threat_level === 'CRITICAL'
              ? 'bg-red-500/10'
              : 'bg-orange-500/10'
          }`}>
            <Wifi className={`w-5 h-5 ${
              threat.threat_level === 'EXTREME' || threat.threat_level === 'CRITICAL'
                ? 'text-red-400'
                : 'text-orange-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium truncate">
                {threat.ssid || 'Hidden Network'}
              </h3>
              {threat.is_mobile_hotspot && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                  Mobile
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400 font-mono truncate">{threat.bssid}</p>
            {threat.radio_band && (
              <p className="text-xs text-slate-500 mt-1">{threat.radio_band}</p>
            )}
          </div>
        </div>
        <Badge className={`${getThreatStyle(threat.threat_level)} text-xs px-2 py-1 font-semibold border whitespace-nowrap`}>
          {threat.threat_level}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricBox
          icon={<Navigation className="w-4 h-4" />}
          label="Distance"
          value={formatDistance(threat.max_distance_km)}
          highlight={threat.max_distance_km >= 50}
        />
        <MetricBox
          icon={<Eye className="w-4 h-4" />}
          label="Observations"
          value={threat.total_sightings}
        />
        <MetricBox
          icon={<Home className="w-4 h-4" />}
          label="At Home"
          value={threat.home_sightings}
          valueClass="text-green-300"
        />
        <MetricBox
          icon={<MapPin className="w-4 h-4" />}
          label="Away"
          value={threat.away_sightings}
          valueClass="text-red-300"
          highlight={threat.away_sightings > threat.home_sightings}
        />
      </div>

      {/* Confidence Score (if available) */}
      {threat.confidence_score !== undefined && (
        <div className="mb-4 px-3 py-2 bg-slate-900/50 rounded border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Confidence Score</span>
            <span className="text-sm font-semibold text-white">
              {(threat.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${threat.confidence_score * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700/50">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            title="Dismiss this threat"
          >
            <X className="w-3 h-3" />
            Dismiss
          </button>
        )}
        {onWhitelist && (
          <button
            onClick={onWhitelist}
            className="px-3 py-1.5 text-sm text-slate-400 hover:text-green-300 transition-colors flex items-center gap-1"
            title="Mark as safe and whitelist"
          >
            <CheckCircle className="w-3 h-3" />
            Whitelist
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-4 py-1.5 text-sm bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors flex items-center gap-1.5 font-medium"
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function MetricBox({
  icon,
  label,
  value,
  valueClass = 'text-white',
  highlight = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClass?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-slate-900/50 rounded p-2.5 ${highlight ? 'ring-1 ring-red-500/30' : ''}`}>
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
