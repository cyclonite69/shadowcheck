import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EnhancedHeader } from "@/components/enhanced-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { BarChart3, Wifi, MapPin, Shield, Activity, Zap, Radio, Bluetooth, Radar, Satellite, Target, Antenna, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { iconColors } from '@/lib/iconColors';
import { SecurityStrength, getSecurityBadgeClass, SecurityType, categorizeNetworksByType, getSecurityTypeStyle } from '@/lib/securityDecoder';

export default function Dashboard() {
  const [timelineRange, setTimelineRange] = useState<string>('24h');
  const [showDistinctNetworks, setShowDistinctNetworks] = useState<boolean>(true);
  const [showDistinctSecurity, setShowDistinctSecurity] = useState<boolean>(true);

  // Removed networks query - recent activity section redacted

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/v1/analytics'],
    queryFn: () => api.getAnalytics(),
    refetchInterval: 30000,
  });

  const { data: radioStats, isLoading: radioStatsLoading } = useQuery({
    queryKey: ['/api/v1/radio-stats'],
    queryFn: () => api.getRadioStats(),
    refetchInterval: 30000,
  });

  const { data: securityAnalysis } = useQuery({
    queryKey: ['/api/v1/security-analysis'],
    queryFn: () => api.getSecurityAnalysis(),
    refetchInterval: 30000,
  });

  const { data: signalAnalysis } = useQuery({
    queryKey: ['/api/v1/signal-strength'],
    queryFn: () => api.getSignalStrengthDistribution(),
    refetchInterval: 30000,
  });

  const { data: timelineData } = useQuery({
    queryKey: ['/api/v1/timeline', timelineRange],
    queryFn: async () => {
      const res = await fetch(`/api/v1/timeline?range=${timelineRange}&granularity=auto`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  const overview = analytics?.data?.overview || {};
  const radioData = radioStats?.data || [];

  // Helper function to get radio stats by type
  const getRadioStats = (type: string) => {
    const stats = radioData.find((r: any) => r.radio_type === type);
    return {
      observations: Number(stats?.total_observations) || 0,
      networks: Number(stats?.distinct_networks) || 0
    };
  };

  const wifiStats = getRadioStats('wifi');
  const cellularStats = getRadioStats('cellular');
  const bluetoothStats = getRadioStats('bluetooth');
  const bleStats = getRadioStats('ble');

  // Transform timeline data for charting (handles all granularities)
  const transformTimelineData = () => {
    const rawData = timelineData?.data || [];
    if (rawData.length === 0) return [];

    // Group data by time bucket
    const bucketMap = new Map<string, any>();

    rawData.forEach((item: any) => {
      const bucket = item.time_bucket;
      if (!bucketMap.has(bucket)) {
        bucketMap.set(bucket, {
          time_bucket: bucket,
          wifi: 0,
          cellular: 0,
          bluetooth: 0,
          ble: 0
        });
      }

      const bucketData = bucketMap.get(bucket)!;
      const radioType = item.radio_type?.toLowerCase() || '';
      const count = Number(item.unique_networks) || 0;

      if (radioType === 'wifi') {
        bucketData.wifi += count;
      } else if (radioType === 'cellular') {
        bucketData.cellular += count;
      } else if (radioType === 'bluetooth') {
        bucketData.bluetooth += count;
      } else if (radioType === 'ble') {
        bucketData.ble += count;
      }
    });

    // Convert to array and sort by time
    return Array.from(bucketMap.values()).sort((a, b) =>
      new Date(a.time_bucket).getTime() - new Date(b.time_bucket).getTime()
    );
  };

  const timelineChartData = transformTimelineData();

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-2">
            <div className="icon-container w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                Intelligence Dashboard
              </h1>
              <p className="text-sm text-slate-400 cyber-text tracking-wide mt-1">
                Real-time SIGINT analytics and network forensics
              </p>
            </div>
          </div>
          {/* Radio Type Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="premium-card"
            aria-label={`WiFi observations: ${wifiStats.observations.toLocaleString()} total, ${wifiStats.networks.toLocaleString()} networks`}
            data-testid="card-wifi"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Wifi className={`h-8 w-8 ${iconColors.primary.text}`} />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-wifi-observations">
                    {wifiStats.observations.toLocaleString()}
                  </p>
                  <p className={`text-base font-semibold ${iconColors.primary.text} mb-1`}>WiFi Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {wifiStats.networks.toLocaleString()} networks
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          <div
            className="premium-card"
            aria-label={`Cellular observations: ${cellularStats.observations.toLocaleString()} total, ${cellularStats.networks.toLocaleString()} towers`}
            data-testid="card-cellular"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Antenna className={`h-8 w-8 ${iconColors.success.text}`} />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-cellular-observations">
                    {cellularStats.observations.toLocaleString()}
                  </p>
                  <p className={`text-base font-semibold ${iconColors.success.text} mb-1`}>Cellular Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {cellularStats.networks.toLocaleString()} towers
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          <div
            className="premium-card"
            aria-label={`Bluetooth observations: ${bluetoothStats.observations.toLocaleString()} total, ${bluetoothStats.networks.toLocaleString()} devices`}
            data-testid="card-bluetooth"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Bluetooth className={`h-8 w-8 ${iconColors.secondary.text}`} />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-bluetooth-observations">
                    {bluetoothStats.observations.toLocaleString()}
                  </p>
                  <p className={`text-base font-semibold ${iconColors.secondary.text} mb-1`}>Bluetooth Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {bluetoothStats.networks.toLocaleString()} devices
                  </p>
                </div>
              </div>
            </CardContent>
          </div>

          <div
            className="premium-card"
            aria-label={`BLE observations: ${bleStats.observations.toLocaleString()} total, ${bleStats.networks.toLocaleString()} devices`}
            data-testid="card-ble"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Radio className={`h-8 w-8 ${iconColors.warning.text}`} />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-ble-observations">
                    {bleStats.observations.toLocaleString()}
                  </p>
                  <p className={`text-base font-semibold ${iconColors.warning.text} mb-1`}>BLE Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {bleStats.networks.toLocaleString()} devices
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
          </div>

          {/* Total Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="premium-card">
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="icon-container w-16 h-16">
                    <Radar className={`h-8 w-8 ${iconColors.info.text}`} />
                  </div>
                  <div>
                    <p className="text-4xl metric-value mb-2" data-testid="metric-total-observations">
                      {Number(overview.total_observations || 0).toLocaleString()}
                    </p>
                    <p className={`text-lg font-medium ${iconColors.info.text} mb-1`}>Total Network Observations</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full inline-block">
                      Location records in database
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="premium-card">
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="icon-container w-16 h-16">
                    <Shield className={`h-8 w-8 ${iconColors.neutral.text}`} />
                  </div>
                  <div>
                    <p className="text-4xl metric-value mb-2" data-testid="metric-distinct-networks">
                      {Number(overview.distinct_networks || 0).toLocaleString()}
                    </p>
                    <p className={`text-lg font-medium ${iconColors.neutral.text} mb-1`}>Distinct Networks</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full inline-block">
                      Unique radio sources detected
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
          </div>

          {/* Security Type Analysis */}
          <div className="premium-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-300 flex items-center gap-2">
                  <Shield className={`h-5 w-5 ${iconColors.danger.text}`} />
                  Security Type Distribution
                </CardTitle>
                <CardDescription className="text-slate-400">
                  WiFi network security categorized by authentication type
                </CardDescription>
              </div>
              <button
                onClick={() => setShowDistinctSecurity(!showDistinctSecurity)}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm text-slate-300 transition-colors"
              >
                {showDistinctSecurity ? 'Show Total Observed' : 'Show Distinct Networks'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {securityAnalysis?.data ? (() => {
              const typeCategories = categorizeNetworksByType(securityAnalysis.data, !showDistinctSecurity);
              const total = showDistinctSecurity
                ? (securityAnalysis.data.total_networks || 1)
                : (securityAnalysis.data.total_observations || 1);

              return (
              <>
                {/* Security Type Distribution - Centered Pie Chart */}
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'WPA3-Enterprise',
                            value: typeCategories[SecurityType.WPA3_ENTERPRISE] || 0,
                            color: '#10b981'
                          },
                          {
                            name: 'WPA3-Personal',
                            value: typeCategories[SecurityType.WPA3_PERSONAL] || 0,
                            color: '#3b82f6'
                          },
                          {
                            name: 'WPA2-Enterprise',
                            value: typeCategories[SecurityType.WPA2_ENTERPRISE] || 0,
                            color: '#06b6d4'
                          },
                          {
                            name: 'WPA2-Personal',
                            value: typeCategories[SecurityType.WPA2_PERSONAL] || 0,
                            color: '#f59e0b'
                          },
                          {
                            name: 'Legacy (WPA/WEP)',
                            value: (typeCategories[SecurityType.WPA_ENTERPRISE] || 0) +
                                   (typeCategories[SecurityType.WPA_PERSONAL] || 0) +
                                   (typeCategories[SecurityType.WEP] || 0),
                            color: '#f97316'
                          },
                          {
                            name: 'OWE',
                            value: typeCategories[SecurityType.OWE] || 0,
                            color: '#8b5cf6'
                          },
                          {
                            name: 'Open',
                            value: typeCategories[SecurityType.OPEN] || 0,
                            color: '#ef4444'
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {[
                          { color: '#10b981' }, // WPA3-Enterprise
                          { color: '#3b82f6' }, // WPA3-Personal
                          { color: '#06b6d4' }, // WPA2-Enterprise
                          { color: '#f59e0b' }, // WPA2-Personal
                          { color: '#f97316' }, // Legacy
                          { color: '#8b5cf6' }, // OWE
                          { color: '#ef4444' }  // Open
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                      />
                      <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Total Networks Summary */}
                <div className="mt-6 text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-5xl font-bold text-blue-300 mb-2 font-mono">
                    {total.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-300 mb-1">
                    {showDistinctSecurity ? 'Distinct WiFi Networks' : 'Total WiFi Observations'}
                  </p>
                  <p className="text-xs text-slate-400">Analyzed for security posture</p>
                </div>
              </>
              );
            })() : (
              <div className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
          </CardContent>
          </div>

          {/* Network Type Breakdown Chart */}
          <div className="premium-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-300 flex items-center gap-2">
                  <Radar className={`h-5 w-5 ${iconColors.info.text}`} />
                  Radio Type Distribution
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Breakdown of detected wireless protocols and radio frequencies
                </CardDescription>
              </div>
              <button
                onClick={() => setShowDistinctNetworks(!showDistinctNetworks)}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-sm text-slate-300 transition-colors"
              >
                {showDistinctNetworks ? 'Show Total Observed' : 'Show Distinct Networks'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'WiFi Networks',
                          value: showDistinctNetworks ? wifiStats.networks : wifiStats.observations,
                          color: '#3b82f6'
                        },
                        {
                          name: 'Cellular Towers',
                          value: showDistinctNetworks ? cellularStats.networks : cellularStats.observations,
                          color: '#10b981'
                        },
                        {
                          name: 'Bluetooth Devices',
                          value: showDistinctNetworks ? bluetoothStats.networks : bluetoothStats.observations,
                          color: '#a855f7'
                        },
                        {
                          name: 'BLE Beacons',
                          value: showDistinctNetworks ? bleStats.networks : bleStats.observations,
                          color: '#f59e0b'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[{ color: '#3b82f6' }, { color: '#10b981' }, { color: '#a855f7' }, { color: '#f59e0b' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-3xl font-bold text-blue-300 mb-2 font-mono">
                    {(showDistinctNetworks ? wifiStats.networks : wifiStats.observations).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-300">WiFi Networks</p>
                  <p className="text-xs text-blue-400 mt-1">
                    {showDistinctNetworks
                      ? `${wifiStats.observations.toLocaleString()} total observations`
                      : `${wifiStats.networks.toLocaleString()} unique networks`}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-3xl font-bold text-green-300 mb-2 font-mono">
                    {(showDistinctNetworks ? cellularStats.networks : cellularStats.observations).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-300">Cellular Towers</p>
                  <p className="text-xs text-green-400 mt-1">
                    {showDistinctNetworks
                      ? `${cellularStats.observations.toLocaleString()} total observations`
                      : `${cellularStats.networks.toLocaleString()} unique towers`}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <p className="text-3xl font-bold text-purple-300 mb-2 font-mono">
                    {(showDistinctNetworks ? bluetoothStats.networks : bluetoothStats.observations).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-300">Bluetooth Devices</p>
                  <p className="text-xs text-purple-400 mt-1">
                    {showDistinctNetworks
                      ? `${bluetoothStats.observations.toLocaleString()} total observations`
                      : `${bluetoothStats.networks.toLocaleString()} unique devices`}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-3xl font-bold text-orange-300 mb-2 font-mono">
                    {(showDistinctNetworks ? bleStats.networks : bleStats.observations).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-300">BLE Beacons</p>
                  <p className="text-xs text-orange-400 mt-1">
                    {showDistinctNetworks
                      ? `${bleStats.observations.toLocaleString()} total observations`
                      : `${bleStats.networks.toLocaleString()} unique beacons`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          </div>

          {/* Signal Strength Distribution - Bar Chart */}
          <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Activity className={`h-5 w-5 ${iconColors.success.text}`} />
              Signal Strength Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              Distribution of network signal strengths across all observations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(signalAnalysis?.data || []).map((item: any) => ({
                    range: item.signal_range,
                    count: Number(item.count) || 0,
                    fill:
                      item.signal_range?.includes('Very Weak') ? '#ef4444' :
                      item.signal_range?.includes('Weak') ? '#f59e0b' :
                      item.signal_range?.includes('Fair') ? '#eab308' :
                      item.signal_range?.includes('Good') ? '#84cc16' :
                      item.signal_range?.includes('Excellent') ? '#10b981' : '#9ca3af'
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="range"
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: 'Observation Count', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {(signalAnalysis?.data || []).map((item: any, index: number) => {
                      const color =
                        item.signal_range?.includes('Very Weak') ? '#ef4444' :
                        item.signal_range?.includes('Weak') ? '#f59e0b' :
                        item.signal_range?.includes('Fair') ? '#eab308' :
                        item.signal_range?.includes('Good') ? '#84cc16' :
                        item.signal_range?.includes('Excellent') ? '#10b981' : '#9ca3af';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          </div>

          {/* Network Activity Timeline - Line Chart */}
          <div className="premium-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-slate-300 flex items-center gap-2">
                  <Zap className={`h-5 w-5 ${iconColors.warning.text}`} />
                  Network Detection Timeline
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Trend of unique network detections over selected time range
                </CardDescription>
              </div>
              {/* Time Range Selector */}
              <div className="flex flex-wrap gap-2">
                {['1h', '6h', '12h', '24h', '7d', '30d', '6mo', '1y', 'all'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimelineRange(range)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      timelineRange === range
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {range === 'all' ? 'All Time' :
                     range === '6mo' ? '6 Months' :
                     range === '1y' ? '1 Year' :
                     range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="time_bucket"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (timelineRange === '1h' || timelineRange === '6h' || timelineRange === '12h' || timelineRange === '24h') {
                        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      } else if (timelineRange === '7d' || timelineRange === '30d') {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } else {
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                      }
                    }}
                    interval={1}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: 'Detections', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="wifi" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="WiFi" />
                  <Line type="monotone" dataKey="cellular" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Cellular" />
                  <Line type="monotone" dataKey="bluetooth" stroke="#c084fc" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Bluetooth" />
                  <Line type="monotone" dataKey="ble" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="BLE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/visualization" className="block">
              <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300 h-full">
                <CardHeader className="relative p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="icon-container">
                      <Radar className={`h-8 w-8 ${iconColors.info.text}`} />
                    </div>
                    <div>
                      <CardTitle className="text-slate-300 text-xl mb-3">
                        Interactive Visualization
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Geospatial mapping and analysis tools with Mapbox integration for forensics data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </div>
            </Link>

            <Link href="/admin" className="block">
              <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300 h-full">
                <CardHeader className="relative p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="icon-container">
                      <Shield className={`h-8 w-8 ${iconColors.special.text}`} />
                    </div>
                    <div>
                      <CardTitle className="text-slate-300 text-xl mb-3">
                        System Administration
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Database monitoring, API status, and system health diagnostics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </div>
            </Link>
          </div>

          {/* Recent SIGINT Activity section removed - redacted for security */}
        </div>
      </main>
    </div>
  );
}
