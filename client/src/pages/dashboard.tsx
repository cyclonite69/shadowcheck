import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { EnhancedHeader } from "@/components/enhanced-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { BarChart3, Wifi, MapPin, Shield, Activity, Zap, Radio, Bluetooth, Radar, Satellite, Target, Antenna } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

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

  const overview = analytics?.data?.overview || {};
  const radioData = radioStats?.data || [];
  
  // Helper function to get radio stats by type
  const getRadioStats = (type: string) => {
    const stats = radioData.find((r: any) => r.radio_type === type);
    return {
      observations: stats?.total_observations || 0,
      networks: stats?.distinct_networks || 0
    };
  };
  
  const wifiStats = getRadioStats('wifi');
  const cellularStats = getRadioStats('cellular');
  const bluetoothStats = getRadioStats('bluetooth');
  const bleStats = getRadioStats('ble');

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <div className="cyber-scan-line shrink-0">
        <EnhancedHeader 
          title="ShadowCheck SIGINT Forensics Platform"
          subtitle="Real-time intelligence from wireless observations and cellular detections"
        />
      </div>
      
      <main className="flex-1 overflow-y-auto p-6 grid-pattern min-h-0">
        {/* Radio Type Statistics */}
        <div className="responsive-grid mb-12">
          <button
            type="button"
            className={`premium-card cursor-pointer ${
              selectedCard === 'wifi' ? 'selected' : ''
            }`}
            onClick={() => setSelectedCard(selectedCard === 'wifi' ? null : 'wifi')}
            aria-pressed={selectedCard === 'wifi'}
            aria-label={`WiFi observations: ${wifiStats.observations.toLocaleString()} total, ${wifiStats.networks.toLocaleString()} networks. ${selectedCard === 'wifi' ? 'Currently selected' : 'Click to select'}`}
            data-testid="card-wifi"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Wifi className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-wifi-observations">
                    {wifiStats.observations.toLocaleString()}
                  </p>
                  <p className="text-base font-semibold text-blue-300 mb-1">WiFi Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {wifiStats.networks.toLocaleString()} networks
                  </p>
                </div>
              </div>
            </CardContent>
          </button>

          <button
            type="button"
            className={`premium-card cursor-pointer ${
              selectedCard === 'cellular' ? 'selected' : ''
            }`}
            onClick={() => setSelectedCard(selectedCard === 'cellular' ? null : 'cellular')}
            aria-pressed={selectedCard === 'cellular'}
            aria-label={`Cellular observations: ${cellularStats.observations.toLocaleString()} total, ${cellularStats.networks.toLocaleString()} towers. ${selectedCard === 'cellular' ? 'Currently selected' : 'Click to select'}`}
            data-testid="card-cellular"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Antenna className="h-8 w-8 text-green-300" />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-cellular-observations">
                    {cellularStats.observations.toLocaleString()}
                  </p>
                  <p className="text-base font-semibold text-green-300 mb-1">Cellular Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {cellularStats.networks.toLocaleString()} towers
                  </p>
                </div>
              </div>
            </CardContent>
          </button>

          <button
            type="button"
            className={`premium-card cursor-pointer ${
              selectedCard === 'bluetooth' ? 'selected' : ''
            }`}
            onClick={() => setSelectedCard(selectedCard === 'bluetooth' ? null : 'bluetooth')}
            aria-pressed={selectedCard === 'bluetooth'}
            aria-label={`Bluetooth observations: ${bluetoothStats.observations.toLocaleString()} total, ${bluetoothStats.networks.toLocaleString()} devices. ${selectedCard === 'bluetooth' ? 'Currently selected' : 'Click to select'}`}
            data-testid="card-bluetooth"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Bluetooth className="h-8 w-8 text-purple-300" />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-bluetooth-observations">
                    {bluetoothStats.observations.toLocaleString()}
                  </p>
                  <p className="text-base font-semibold text-purple-300 mb-1">Bluetooth Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {bluetoothStats.networks.toLocaleString()} devices
                  </p>
                </div>
              </div>
            </CardContent>
          </button>

          <button
            type="button"
            className={`premium-card cursor-pointer ${
              selectedCard === 'ble' ? 'selected' : ''
            }`}
            onClick={() => setSelectedCard(selectedCard === 'ble' ? null : 'ble')}
            aria-pressed={selectedCard === 'ble'}
            aria-label={`BLE observations: ${bleStats.observations.toLocaleString()} total, ${bleStats.networks.toLocaleString()} devices. ${selectedCard === 'ble' ? 'Currently selected' : 'Click to select'}`}
            data-testid="card-ble"
          >
            <CardContent className="relative p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-container">
                  <Radio className="h-8 w-8 text-orange-300" />
                </div>
                <div>
                  <p className="text-3xl metric-value mb-2" data-testid="metric-ble-observations">
                    {bleStats.observations.toLocaleString()}
                  </p>
                  <p className="text-base font-semibold text-orange-300 mb-1">BLE Observations</p>
                  <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                    {bleStats.networks.toLocaleString()} devices
                  </p>
                </div>
              </div>
            </CardContent>
          </button>
        </div>

        {/* Total Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="premium-card">
            <CardContent className="relative p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="icon-container w-16 h-16">
                    <Radar className="h-8 w-8 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-4xl metric-value mb-2" data-testid="metric-total-observations">
                      {Number(overview.total_observations || 0).toLocaleString()}
                    </p>
                    <p className="text-lg font-medium text-slate-300 mb-1">Total Network Observations</p>
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
                    <Shield className="h-8 w-8 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-4xl metric-value mb-2" data-testid="metric-distinct-networks">
                      {Number(overview.distinct_networks || 0).toLocaleString()}
                    </p>
                    <p className="text-lg font-medium text-indigo-300 mb-1">Distinct Networks</p>
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
        <div className="premium-card mb-8">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Shield className="h-5 w-5" />
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
                      data={[
                        { name: 'WPA3 Secure', value: 143, color: '#10b981' },
                        { name: 'WPA2 Protected', value: 89, color: '#3b82f6' },
                        { name: 'WEP Vulnerable', value: 23, color: '#f59e0b' },
                        { name: 'Open Networks', value: 87, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[{ color: '#10b981' }, { color: '#3b82f6' }, { color: '#f59e0b' }, { color: '#ef4444' }].map((entry, index) => (
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
                <div className="text-center p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-3xl font-bold text-green-300 mb-2 font-mono">143</p>
                  <p className="text-sm text-slate-300">Secure Networks (WPA3)</p>
                  <p className="text-xs text-green-400 mt-1">41.7% of total</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-3xl font-bold text-blue-300 mb-2 font-mono">89</p>
                  <p className="text-sm text-slate-300">Protected Networks (WPA2)</p>
                  <p className="text-xs text-blue-400 mt-1">26.0% of total</p>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-3xl font-bold text-orange-300 mb-2 font-mono">23</p>
                  <p className="text-sm text-slate-300">Vulnerable (WEP)</p>
                  <p className="text-xs text-orange-400 mt-1">6.7% of total</p>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-3xl font-bold text-red-300 mb-2 font-mono">87</p>
                  <p className="text-sm text-slate-300">Unsecured Networks</p>
                  <p className="text-xs text-red-400 mt-1">25.4% of total</p>
                </div>
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
        <div className="premium-card mb-8">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Radar className="h-5 w-5" />
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

        {/* Quick Access Cards - Perfectly Centered */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <Link href="/visualization" className="block">
              <div className="premium-card group cursor-pointer hover:scale-105 transition-all duration-300 h-full">
                <CardHeader className="relative p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="icon-container">
                      <Radar className="h-8 w-8 text-blue-300" />
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
                      <Shield className="h-8 w-8 text-orange-300" />
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
        </div>

        {/* Recent Network Activity */}
        <div className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-300 flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                        {network.bestlevel} dBm
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(Number(network.lasttime)).toLocaleTimeString()}
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
      </main>
    </div>
  );
}
