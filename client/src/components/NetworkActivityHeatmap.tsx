/**
 * NetworkActivityHeatmap - Shows network activity across days of week and hours
 * Visualizes when networks are most active as a heatmap
 */

import { useQuery } from '@tanstack/react-query';
import { Calendar, Wifi } from 'lucide-react';

interface NetworkHeatmapData {
  bssid: string;
  ssid: string;
  activity: number[][]; // [day_of_week][hour_of_day]
}

interface HeatmapResponse {
  weeks_analyzed: number;
  networks: NetworkHeatmapData[];
}

interface NetworkActivityHeatmapProps {
  weeks?: number;
  limit?: number;
}

export function NetworkActivityHeatmap({ weeks = 4, limit = 10 }: NetworkActivityHeatmapProps) {
  // Fetch heatmap data
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/v1/network-timeline/heatmap', weeks, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('weeks', weeks.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/v1/network-timeline/heatmap?${params}`);
      const json = await res.json();

      if (!json.ok) throw new Error(json.error || 'Failed to fetch heatmap');
      return json.data as HeatmapResponse;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="premium-card p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading heatmap data...</span>
        </div>
      </div>
    );
  }

  if (isError || !data || !data.networks || data.networks.length === 0) {
    return (
      <div className="premium-card p-8 text-center text-slate-400">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No heatmap data available</p>
      </div>
    );
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get max value for color scaling
  const maxActivity = Math.max(
    ...data.networks.flatMap((network) =>
      network.activity.flat().filter((val) => val > 0)
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Weekly Activity Heatmap
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Network activity patterns over the last {weeks} weeks
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Wifi className="h-4 w-4 text-purple-400" />
          <span>{data.networks.length} Networks</span>
        </div>
      </div>

      {/* Heatmaps */}
      <div className="space-y-6">
        {data.networks.map((network) => (
          <div key={network.bssid} className="premium-card p-4">
            {/* Network Info */}
            <div className="mb-4">
              <div className="text-sm font-medium text-slate-200">{network.ssid}</div>
              <div className="text-xs text-slate-400 font-mono">{network.bssid}</div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Hour labels */}
                <div className="flex gap-0.5 mb-1">
                  <div className="w-12" /> {/* Day label space */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="w-6 text-center text-[10px] text-slate-500"
                    >
                      {hour % 6 === 0 ? hour : ''}
                    </div>
                  ))}
                </div>

                {/* Days with activity */}
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-0.5 mb-0.5">
                    <div className="w-12 text-xs text-slate-400">{day}</div>
                    {hours.map((hour) => {
                      const value = network.activity[dayIndex]?.[hour] || 0;
                      const intensity = value > 0 ? Math.min((value / maxActivity) * 100, 100) : 0;

                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className="w-6 h-6 rounded-sm transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor:
                              intensity > 0
                                ? `rgba(139, 92, 246, ${0.2 + intensity / 100 * 0.8})`
                                : '#1e293b',
                            border: '1px solid #334155',
                          }}
                          title={`${day} ${hour}:00 - ${value} observations`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 25, 50, 75, 100].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor:
                        intensity > 0
                          ? `rgba(139, 92, 246, ${0.2 + intensity / 100 * 0.8})`
                          : '#1e293b',
                      border: '1px solid #334155',
                    }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
