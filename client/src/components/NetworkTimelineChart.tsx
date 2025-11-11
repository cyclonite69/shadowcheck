/**
 * NetworkTimelineChart - Visualizes when networks appear throughout the day
 * Shows hourly activity patterns to identify network schedules
 */

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Wifi, TrendingUp, MapPin, Filter } from 'lucide-react';
import { useState } from 'react';

interface HourlyObservation {
  hour: number;
  bssid: string;
  observation_count: number;
  avg_signal: number;
  first_seen: string;
  last_seen: string;
  days_seen: number;
}

interface TimelineData {
  days_analyzed: number;
  bssid_filter: string[] | null;
  radius_filter: { lat: number; lon: number; radius: number } | null;
  hourly_observations: HourlyObservation[];
}

interface AvailableNetwork {
  bssid: string;
  ssid: string;
  observation_count: number;
  avg_signal: number;
  last_seen: string;
}

interface NetworkTimelineChartProps {
  bssid?: string;
  days?: number;
}

export function NetworkTimelineChart({ bssid, days = 7 }: NetworkTimelineChartProps) {
  const [selectedBssids, setSelectedBssids] = useState<string[]>(bssid ? [bssid] : []);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [radius, setRadius] = useState<string>('1000');
  const [limit, setLimit] = useState<number>(20);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Build query params
  const hasRadiusFilter = latitude !== '' && longitude !== '' && radius !== '';

  // Fetch available networks for selection
  const { data: availableNetworks } = useQuery({
    queryKey: ['/api/v1/network-timeline/available-networks', days, latitude, longitude, radius, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('days', days.toString());
      params.set('limit', limit.toString());
      if (hasRadiusFilter) {
        params.set('lat', latitude);
        params.set('lon', longitude);
        params.set('radius', radius);
      }

      const res = await fetch(`/api/v1/network-timeline/available-networks?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch networks');
      return json.data.networks as AvailableNetwork[];
    },
    refetchInterval: 60000,
  });

  // Fetch hourly timeline data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/v1/network-timeline/hourly', selectedBssids, days, latitude, longitude, radius, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('days', days.toString());
      params.set('limit', limit.toString());
      if (selectedBssids.length > 0) params.set('bssids', selectedBssids.join(','));
      if (hasRadiusFilter) {
        params.set('lat', latitude);
        params.set('lon', longitude);
        params.set('radius', radius);
      }

      const res = await fetch(`/api/v1/network-timeline/hourly?${params}`);
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || 'Failed to fetch timeline');
      return json.data as TimelineData;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch summary stats
  const { data: summary } = useQuery({
    queryKey: ['/api/v1/network-timeline/summary', latitude, longitude, radius],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (hasRadiusFilter) {
        params.set('lat', latitude);
        params.set('lon', longitude);
        params.set('radius', radius);
      }
      const res = await fetch(`/api/v1/network-timeline/summary?${params}`);
      const json = await res.json();
      return json.ok ? json.data : null;
    },
  });

  // Transform data for chart - group by hour
  const chartData = data?.hourly_observations.reduce((acc, obs) => {
    const existing = acc.find((item) => item.hour === obs.hour);
    if (existing) {
      existing.observations += obs.observation_count;
      existing.networks += 1;
    } else {
      acc.push({
        hour: obs.hour,
        observations: obs.observation_count,
        networks: 1,
        hourLabel: formatHour(obs.hour),
      });
    }
    return acc;
  }, [] as Array<{ hour: number; observations: number; networks: number; hourLabel: string }>);

  // Sort by hour
  chartData?.sort((a, b) => a.hour - b.hour);

  // Toggle network selection
  const toggleNetwork = (bssid: string) => {
    setSelectedBssids(prev =>
      prev.includes(bssid)
        ? prev.filter(b => b !== bssid)
        : [...prev, bssid]
    );
  };

  // Select/deselect all networks
  const selectAllNetworks = () => {
    if (availableNetworks) {
      setSelectedBssids(availableNetworks.map(n => n.bssid));
    }
  };

  const deselectAllNetworks = () => {
    setSelectedBssids([]);
  };

  if (isLoading) {
    return (
      <div className="premium-card p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading timeline data...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="premium-card p-8 text-center text-red-400">
        <p>Error loading timeline: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!data || !chartData || chartData.length === 0) {
    return (
      <div className="premium-card p-8 text-center text-slate-400">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Network Activity Timeline
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {hasRadiusFilter
              ? `Within ${(parseFloat(radius) / 1000).toFixed(1)}km radius - Last ${days} days`
              : `Showing when networks appear over the last ${days} days`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          {summary && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300">{summary.total_networks.toLocaleString()} Networks</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">{summary.total_observations.toLocaleString()} Observations</span>
              </div>
            </div>
          )}

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-purple-400" />
            <h4 className="text-lg font-semibold text-slate-200">Spatial & Network Filters</h4>
          </div>

          {/* Radius Filter */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 40.7128"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -74.0060"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Radius (meters)</label>
              <input
                type="number"
                step="100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Networks</label>
              <input
                type="number"
                min="1"
                max="100"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Network Selection */}
          {availableNetworks && availableNetworks.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-slate-300">
                  Select Networks ({selectedBssids.length}/{availableNetworks.length} selected)
                </h5>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllNetworks}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllNetworks}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-900/50 rounded-lg">
                {availableNetworks.map((network) => (
                  <label
                    key={network.bssid}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedBssids.includes(network.bssid)
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBssids.includes(network.bssid)}
                      onChange={() => toggleNetwork(network.bssid)}
                      className="w-4 h-4 text-blue-500 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {network.ssid}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate">
                        {network.bssid}
                      </div>
                      <div className="text-xs text-slate-500">
                        {network.observation_count} obs • {network.avg_signal.toFixed(0)} dBm
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="premium-card p-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="hourLabel"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              label={{ value: 'Observations', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <Legend
              wrapperStyle={{ color: '#94a3b8' }}
            />
            <Bar
              dataKey="observations"
              fill="#3b82f6"
              name="Observations"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="networks"
              fill="#8b5cf6"
              name="Unique Networks"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper function to format hour (0-23) to readable time
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}${period}`;
}
