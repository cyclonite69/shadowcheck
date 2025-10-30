/**
 * ObservationsExpandedRow - Displays observation history for a network
 *
 * Shows detailed GPS observations when a network row is expanded
 * Includes timestamps, locations, signal strength, distance from home
 */

import { useNetworkObservations } from '@/hooks/useNetworkObservations';
import { Loader2, MapPin, Signal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObservationsExpandedRowProps {
  macAddress: string;
  colSpan: number;
}

// Home coordinates for distance calculation
const HOME_LAT = 43.02342188;
const HOME_LON = -83.6968461;

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format timestamp to readable format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function ObservationsExpandedRow({ macAddress, colSpan }: ObservationsExpandedRowProps) {
  const { data, isLoading, isError, error } = useNetworkObservations(macAddress, true);

  if (isLoading) {
    return (
      <tr className="bg-slate-800/30">
        <td colSpan={colSpan} className="px-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm text-slate-400">Loading observations...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (isError) {
    return (
      <tr className="bg-slate-800/30">
        <td colSpan={colSpan} className="px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-red-400">Failed to load observations</p>
            <p className="text-xs text-slate-500 mt-1">{error?.message}</p>
          </div>
        </td>
      </tr>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <tr className="bg-slate-800/30">
        <td colSpan={colSpan} className="px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-400">No observations found</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-slate-800/30">
      <td colSpan={colSpan} className="px-4 py-4">
        <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                Observation History ({data.metadata.total} total)
              </h4>
            </div>
            <div className="text-xs text-slate-500">
              Showing {data.data.length} most recent
            </div>
          </div>

          {/* Observations Table */}
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      When
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right text-slate-400 font-semibold">
                    Distance
                  </th>
                  <th className="px-3 py-2 text-right text-slate-400 font-semibold">
                    <div className="flex items-center justify-end gap-1">
                      <Signal className="h-3 w-3" />
                      Signal
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-semibold">
                    Encryption
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.data.map((obs, idx) => {
                  const distanceKm = calculateDistance(
                    HOME_LAT,
                    HOME_LON,
                    obs.latitude,
                    obs.longitude
                  );
                  const isNearHome = distanceKm < 0.5;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-2 text-slate-300 font-mono">
                        {formatTimestamp(obs.observed_at)}
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-mono">
                        {obs.latitude.toFixed(6)}, {obs.longitude.toFixed(6)}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-right font-semibold',
                          isNearHome ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {distanceKm.toFixed(2)} km
                      </td>
                      <td className="px-3 py-2 text-right text-slate-300">
                        {obs.signal_strength ? `${obs.signal_strength} dBm` : '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs',
                            obs.encryption === 'Open'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-green-500/20 text-green-400'
                          )}
                        >
                          {obs.encryption || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {data.metadata.hasMore && (
            <div className="mt-3 text-center text-xs text-slate-500">
              ... and {data.metadata.total - data.data.length} more observations
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
