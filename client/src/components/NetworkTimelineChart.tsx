/**
 * NetworkTimelineChart - Visualizes when networks appear throughout the day
 * Shows hourly activity patterns to identify network schedules
 */

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Wifi, TrendingUp } from 'lucide-react';
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
  bssid_filter: string | null;
  hourly_observations: HourlyObservation[];
}

interface NetworkTimelineChartProps {
  bssid?: string;
  days?: number;
}

export function NetworkTimelineChart({ bssid, days = 7 }: NetworkTimelineChartProps) {
  const [selectedBssid, setSelectedBssid] = useState<string | undefined>(bssid);

  // Fetch hourly timeline data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/v1/network-timeline/hourly', selectedBssid, days],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('days', days.toString());
      if (selectedBssid) params.set('bssid', selectedBssid);

      const res = await fetch(`/api/v1/network-timeline/hourly?${params}`);
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || 'Failed to fetch timeline');
      return json.data as TimelineData;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch summary stats
  const { data: summary } = useQuery({
    queryKey: ['/api/v1/network-timeline/summary'],
    queryFn: async () => {
      const res = await fetch('/api/v1/network-timeline/summary');
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

  // Get unique networks from data
  const uniqueNetworks = data?.hourly_observations
    .reduce((acc, obs) => {
      if (!acc.includes(obs.bssid)) acc.push(obs.bssid);
      return acc;
    }, [] as string[])
    .slice(0, 20); // Limit to top 20

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Network Activity Timeline
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Showing when networks appear over the last {days} days
          </p>
        </div>

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
      </div>

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

      {/* Network Filter */}
      {uniqueNetworks && uniqueNetworks.length > 0 && (
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-300">Filter by Network</h4>
            {selectedBssid && (
              <button
                onClick={() => setSelectedBssid(undefined)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueNetworks.slice(0, 10).map((bssid) => (
              <button
                key={bssid}
                onClick={() => setSelectedBssid(bssid === selectedBssid ? undefined : bssid)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  bssid === selectedBssid
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {bssid.slice(0, 17)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format hour (0-23) to readable time
function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}${period}`;
}
