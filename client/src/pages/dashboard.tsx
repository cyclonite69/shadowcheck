import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EnhancedHeader } from "@/components/enhanced-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { BarChart3, Wifi, MapPin, Shield, Activity, Zap, Radio, Bluetooth, Radar, Satellite, Target, Antenna } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { iconColors } from '@/lib/iconColors';

export default function Dashboard() {

  const { data: networks, isLoading: networksLoading } = useQuery({
    queryKey: ['/api/v1/networks'],
    queryFn: () => api.getNetworks(10),
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
    queryKey: ['/api/v1/timeline'],
    queryFn: () => api.getTimelineData(),
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

  // Transform timeline data to cover full 24 hours
  const transformTimelineData = () => {
    const rawData = timelineData?.data || [];

    // Create 24 hour slots (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i.toString().padStart(2, '0') + ':00';
      return {
        hour: hourStr,
        wifi: 0,
        cellular: 0,
        bluetooth: 0,
        ble: 0
      };
    });

    // Fill in actual data
    rawData.forEach((item: any) => {
      const hourDate = new Date(item.hour);
      const hourIndex = hourDate.getHours();
      const radioType = item.radio_type?.toLowerCase() || '';
      const count = Number(item.detection_count) || 0;

      if (hourIndex >= 0 && hourIndex < 24) {
        if (radioType === 'wifi') {
          hours[hourIndex].wifi += count;
        } else if (radioType === 'cellular') {
          hours[hourIndex].cellular += count;
        } else if (radioType === 'bluetooth') {
          hours[hourIndex].bluetooth += count;
        } else if (radioType === 'ble') {
          hours[hourIndex].ble += count;
        }
      }
    });

    return hours;
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

          {/* Security Analysis with Pie Chart */}
          <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Shield className={`h-5 w-5 ${iconColors.danger.text}`} />
              Network Security Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400">
              Encryption and security analysis of detected networks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const rawData = securityAnalysis?.data || [];
                        const consolidated: { [key: string]: { name: string; value: number; color: string } } = {};

                        rawData.forEach((item: any) => {
                          const security = item.security?.toLowerCase() || '';
                          let key = '';

                          if (security.includes('wpa3')) {
                            key = 'WPA3';
                          } else if (security.includes('wpa2')) {
                            key = 'WPA2';
                          } else if (security.includes('wpa') && !security.includes('wpa2') && !security.includes('wpa3')) {
                            key = 'WPA';
                          } else if (security.includes('wep')) {
                            key = 'WEP';
                          } else if (security === 'open network' || !security || security === '[ess]') {
                            key = 'Open';
                          } else {
                            key = 'Other';
                          }

                          if (!consolidated[key]) {
                            consolidated[key] = {
                              name: key,
                              value: 0,
                              color:
                                key === 'WPA3' ? '#10b981' :
                                key === 'WPA2' ? '#3b82f6' :
                                key === 'WPA' ? '#8b5cf6' :
                                key === 'WEP' ? '#f59e0b' :
                                key === 'Open' ? '#ef4444' : '#9ca3af'
                            };
                          }
                          consolidated[key].value += item.network_count;
                        });

                        return Object.values(consolidated).sort((a, b) => b.value - a.value).slice(0, 4);
                      })()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(() => {
                        const rawData = securityAnalysis?.data || [];
                        const consolidated: { [key: string]: { name: string; value: number; color: string } } = {};

                        rawData.forEach((item: any) => {
                          const security = item.security?.toLowerCase() || '';
                          let key = '';

                          if (security.includes('wpa3')) {
                            key = 'WPA3';
                          } else if (security.includes('wpa2')) {
                            key = 'WPA2';
                          } else if (security.includes('wpa') && !security.includes('wpa2') && !security.includes('wpa3')) {
                            key = 'WPA';
                          } else if (security.includes('wep')) {
                            key = 'WEP';
                          } else if (security === 'open network' || !security || security === '[ess]') {
                            key = 'Open';
                          } else {
                            key = 'Other';
                          }

                          if (!consolidated[key]) {
                            consolidated[key] = {
                              name: key,
                              value: 0,
                              color:
                                key === 'WPA3' ? '#10b981' :
                                key === 'WPA2' ? '#3b82f6' :
                                key === 'WPA' ? '#8b5cf6' :
                                key === 'WEP' ? '#f59e0b' :
                                key === 'Open' ? '#ef4444' : '#9ca3af'
                            };
                          }
                          consolidated[key].value += item.network_count;
                        });

                        return Object.values(consolidated).sort((a, b) => b.value - a.value).slice(0, 4).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ));
                      })()}
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
                {(() => {
                  const rawData = securityAnalysis?.data || [];
                  const consolidated: { [key: string]: { name: string; value: number; color: string; percentage: number } } = {};
                  let total = 0;

                  rawData.forEach((item: any) => {
                    const security = item.security?.toLowerCase() || '';
                    let key = '';

                    if (security.includes('wpa3')) {
                      key = 'WPA3';
                    } else if (security.includes('wpa2')) {
                      key = 'WPA2';
                    } else if (security.includes('wpa') && !security.includes('wpa2') && !security.includes('wpa3')) {
                      key = 'WPA';
                    } else if (security.includes('wep')) {
                      key = 'WEP';
                    } else if (security === 'open network' || !security || security === '[ess]') {
                      key = 'Open';
                    } else {
                      key = 'Other';
                    }

                    if (!consolidated[key]) {
                      consolidated[key] = {
                        name: key,
                        value: 0,
                        color:
                          key === 'WPA3' ? '#10b981' :
                          key === 'WPA2' ? '#3b82f6' :
                          key === 'WPA' ? '#8b5cf6' :
                          key === 'WEP' ? '#f59e0b' :
                          key === 'Open' ? '#ef4444' : '#9ca3af',
                        percentage: 0
                      };
                    }
                    consolidated[key].value += item.network_count;
                    total += item.network_count;
                  });

                  Object.values(consolidated).forEach(item => {
                    item.percentage = (item.value / total) * 100;
                  });

                  return Object.values(consolidated).sort((a, b) => b.value - a.value).slice(0, 4).map((item: any, index: number) => {
                    const bgColor =
                      item.name === 'WPA3' ? 'bg-green-500/10 border-green-500/20' :
                      item.name === 'WPA2' ? 'bg-blue-500/10 border-blue-500/20' :
                      item.name === 'WPA' ? 'bg-purple-500/10 border-purple-500/20' :
                      item.name === 'WEP' ? 'bg-orange-500/10 border-orange-500/20' :
                      'bg-red-500/10 border-red-500/20';
                    const textColor =
                      item.name === 'WPA3' ? 'text-green-300' :
                      item.name === 'WPA2' ? 'text-blue-300' :
                      item.name === 'WPA' ? 'text-purple-300' :
                      item.name === 'WEP' ? 'text-orange-300' :
                      'text-red-300';
                    const accentColor =
                      item.name === 'WPA3' ? 'text-green-400' :
                      item.name === 'WPA2' ? 'text-blue-400' :
                      item.name === 'WPA' ? 'text-purple-400' :
                      item.name === 'WEP' ? 'text-orange-400' :
                      'text-red-400';

                    return (
                      <div key={index} className={`text-center p-4 ${bgColor} rounded-xl border`}>
                        <p className={`text-3xl font-bold ${textColor} mb-2 font-mono`}>
                          {item.value?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-slate-300">{item.name}</p>
                        <p className={`text-xs ${accentColor} mt-1`}>{item.percentage?.toFixed(1)}% of total</p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="space-y-3">
              {(securityAnalysis?.data || []).slice(0, 8).map((item: any, index: number) => {
                const count = Number(item.network_count) || 0;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/40"
                    data-testid={`security-${item.security?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.security?.includes('WPA3') ? 'bg-green-500' :
                        item.security?.includes('WPA2') ? 'bg-blue-500' :
                        item.security?.includes('WPA') ? 'bg-yellow-500' :
                        item.security?.includes('WEP') ? 'bg-orange-500' :
                        item.security === '[ESS]' || !item.security ? 'bg-red-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.security_level || 'Unknown Security'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.security || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!securityAnalysis?.data || securityAnalysis.data.length === 0) && (
                <div className="col-span-full text-center py-4">
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
            </div>
          </CardContent>
          </div>

          {/* Network Type Breakdown Chart */}
          <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Radar className={`h-5 w-5 ${iconColors.info.text}`} />
              Radio Type Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              Breakdown of detected wireless protocols and radio frequencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'WiFi Networks', value: wifiStats.observations, color: '#3b82f6' },
                        { name: 'Cellular Towers', value: cellularStats.observations, color: '#10b981' },
                        { name: 'Bluetooth Devices', value: bluetoothStats.observations, color: '#a855f7' },
                        { name: 'BLE Beacons', value: bleStats.observations, color: '#f59e0b' }
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
                  <p className="text-3xl font-bold text-blue-300 mb-2 font-mono">{wifiStats.observations.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">WiFi Networks</p>
                  <p className="text-xs text-blue-400 mt-1">{wifiStats.networks.toLocaleString()} unique networks</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-3xl font-bold text-green-300 mb-2 font-mono">{cellularStats.observations.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">Cellular Towers</p>
                  <p className="text-xs text-green-400 mt-1">{cellularStats.networks.toLocaleString()} unique towers</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <p className="text-3xl font-bold text-purple-300 mb-2 font-mono">{bluetoothStats.observations.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">Bluetooth Devices</p>
                  <p className="text-xs text-purple-400 mt-1">{bluetoothStats.networks.toLocaleString()} unique devices</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-3xl font-bold text-orange-300 mb-2 font-mono">{bleStats.observations.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">BLE Beacons</p>
                  <p className="text-xs text-orange-400 mt-1">{bleStats.networks.toLocaleString()} unique beacons</p>
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
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Zap className={`h-5 w-5 ${iconColors.warning.text}`} />
              Network Detection Timeline
            </CardTitle>
            <CardDescription className="text-slate-400">
              Trend of network detections over the past 24 hours
            </CardDescription>
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
                    dataKey="hour"
                    stroke="#94a3b8"
                    style={{ fontSize: '12px' }}
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
