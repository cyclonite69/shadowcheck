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
import { SecurityStrength, getSecurityBadgeClass } from '@/lib/securityDecoder';

export default function Dashboard() {
  const [timelineRange, setTimelineRange] = useState<string>('24h');
  const [showDistinctNetworks, setShowDistinctNetworks] = useState<boolean>(true);

  const { data: networks, isLoading: networksLoading } = useQuery({
    queryKey: ['/api/v1/networks'],
    queryFn: () => api.getNetworks({ limit: 10 }),
    refetchInterval: 30000,
  });

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

          {/* Security Strength Analysis */}
          <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Shield className={`h-5 w-5 ${iconColors.danger.text}`} />
              Security Strength Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              WiFi network security analysis by encryption strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityAnalysis?.data ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  {/* Pie Chart */}
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Excellent',
                              value: securityAnalysis.data.categories[SecurityStrength.EXCELLENT] || 0,
                              color: '#10b981'
                            },
                            {
                              name: 'Good',
                              value: securityAnalysis.data.categories[SecurityStrength.GOOD] || 0,
                              color: '#3b82f6'
                            },
                            {
                              name: 'Moderate',
                              value: securityAnalysis.data.categories[SecurityStrength.MODERATE] || 0,
                              color: '#f59e0b'
                            },
                            {
                              name: 'Weak',
                              value: securityAnalysis.data.categories[SecurityStrength.WEAK] || 0,
                              color: '#f97316'
                            },
                            {
                              name: 'Vulnerable',
                              value: securityAnalysis.data.categories[SecurityStrength.VULNERABLE] || 0,
                              color: '#ef4444'
                            },
                            {
                              name: 'Open',
                              value: securityAnalysis.data.categories[SecurityStrength.OPEN] || 0,
                              color: '#dc2626'
                            }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            { color: '#10b981' },
                            { color: '#3b82f6' },
                            { color: '#f59e0b' },
                            { color: '#f97316' },
                            { color: '#ef4444' },
                            { color: '#dc2626' }
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

                  {/* Security Score Summary */}
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-5xl font-bold text-blue-300 mb-2 font-mono">
                        {securityAnalysis.data.summary.security_score}
                      </p>
                      <p className="text-sm text-slate-300 mb-1">Overall Security Score</p>
                      <p className="text-xs text-slate-400">Out of 100</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <p className="text-2xl font-bold text-green-300 mb-1 font-mono">
                          {securityAnalysis.data.summary.secure_networks.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-300">Secure Networks</p>
                        <p className="text-xs text-green-400 mt-1">Excellent/Good</p>
                      </div>
                      <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                        <p className="text-2xl font-bold text-red-300 mb-1 font-mono">
                          {securityAnalysis.data.summary.at_risk_networks.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-300">At-Risk Networks</p>
                        <p className="text-xs text-red-400 mt-1">Weak/Vulnerable/Open</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Strength Breakdown */}
                <div className="space-y-3">
                  {Object.entries(securityAnalysis.data.categories).map(([strength, count]) => {
                    const total = securityAnalysis.data.total_networks || 1;
                    const percentage = ((count as number / total) * 100).toFixed(1);
                    const colors = {
                      [SecurityStrength.EXCELLENT]: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-300', bar: 'bg-green-500' },
                      [SecurityStrength.GOOD]: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-300', bar: 'bg-blue-500' },
                      [SecurityStrength.MODERATE]: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-300', bar: 'bg-yellow-500' },
                      [SecurityStrength.WEAK]: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-300', bar: 'bg-orange-500' },
                      [SecurityStrength.VULNERABLE]: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-300', bar: 'bg-red-500' },
                      [SecurityStrength.OPEN]: { bg: 'bg-red-600/10', border: 'border-red-600/20', text: 'text-red-300', bar: 'bg-red-600' }
                    };
                    const style = colors[strength as SecurityStrength] || colors[SecurityStrength.MODERATE];

                    if ((count as number) === 0) return null;

                    return (
                      <div
                        key={strength}
                        className={`flex items-center justify-between p-4 rounded-lg border ${style.border} ${style.bg}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Badge className={`${getSecurityBadgeClass(strength as SecurityStrength)} border text-xs px-2`}>
                            {strength}
                          </Badge>
                          <div className="flex-1">
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 ${style.bar} transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${style.text} font-mono`}>
                            {(count as number).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400">{percentage}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* At-Risk Warning */}
                {securityAnalysis.data.summary.at_risk_networks > 0 && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-300 mb-1">
                        Security Alert
                      </p>
                      <p className="text-xs text-slate-400">
                        {securityAnalysis.data.summary.at_risk_networks} networks detected with weak or no encryption.
                        Consider upgrading to WPA2 or WPA3 for better security.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
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

          {/* Recent Network Activity */}
          <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Activity className={`h-5 w-5 ${iconColors.success.text}`} />
              Recent SIGINT Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest wireless network observations from forensics database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {networksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : networks?.data && networks.data.length > 0 ? (
              <div className="space-y-3" data-testid="recent-activity">
                {networks.data.slice(0, 5).map((network) => (
                  <div
                    key={network.bssid}
                    className="flex items-center justify-between p-3 rounded border border-slate-500/20 bg-background/40"
                    data-testid={`activity-${network.bssid}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-mono text-sm text-slate-300" data-testid={`activity-ssid-${network.bssid}`}>
                          {network.ssid || 'Hidden Network'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {network.bssid} • {network.frequency} MHz
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {network.signal_strength} dBm
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Number(network.observed_at)).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="no-activity">
                No recent forensics activity. Database connection may be required.
              </div>
            )}
          </CardContent>
          </div>
        </div>
      </main>
    </div>
  );
}
