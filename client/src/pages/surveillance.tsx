import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Radio,
  Wifi,
  AlertTriangle,
  Activity,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Eye,
  Radar,
  Navigation,
  Database,
  BarChart3
} from 'lucide-react';
import { GrafanaDashboard } from '@/components/grafana-dashboard';
import { iconColors } from '@/lib/iconColors';

// Home coordinates as reference point
const HOME_LAT = 43.02342188;
const HOME_LON = -83.6968461;

interface LocationVisit {
  location_id: number;
  lat: number;
  lon: number;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  avg_networks_detected: number;
  distance_from_home_meters: number;
}

interface NetworkPattern {
  bssid: string;
  ssid: string;
  type: string;
  total_observations: number;
  distinct_locations: number;
  max_distance_km: number;
  is_consumer_pattern: boolean;
  threat_level: string;
  suspicion_score: number;
}

interface SurveillanceStats {
  total_locations: number;
  total_networks: number;
  high_risk_networks: number;
  locations_near_home: number;
  avg_distance_from_home: number;
}

export default function SurveillancePage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch surveillance statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/v1/surveillance/stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/surveillance/stats');
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch location visit data
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/v1/surveillance/location-visits'],
    queryFn: async () => {
      const res = await fetch('/api/v1/surveillance/location-visits?limit=50');
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch network patterns
  const { data: networks, isLoading: networksLoading } = useQuery({
    queryKey: ['/api/v1/surveillance/network-patterns'],
    queryFn: async () => {
      const res = await fetch('/api/v1/surveillance/network-patterns?limit=50');
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch WiFi surveillance threats with full observations
  const { data: threats, isLoading: threatsLoading } = useQuery({
    queryKey: ['/api/v1/surveillance/wifi/threats'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/surveillance/wifi/threats?min_distance_km=0.5&limit=100`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch WiFi summary stats
  const { data: wifiSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/v1/surveillance/wifi/summary'],
    queryFn: async () => {
      const res = await fetch('/api/v1/surveillance/wifi/summary');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const statsData: SurveillanceStats = stats?.data || {
    total_locations: 0,
    total_networks: 0,
    high_risk_networks: 0,
    locations_near_home: 0,
    avg_distance_from_home: 0,
  };

  const getThreatColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EXTREME':
        return 'text-fuchsia-400 bg-fuchsia-500/20 border-fuchsia-500/30';
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-2">
            <div className="icon-container w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(139,92,246,0.5)]">
                Surveillance Intelligence
              </h1>
              <p className="text-sm text-slate-400 cyber-text tracking-wide mt-1">
                Advanced pattern detection and location correlation analysis
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="premium-card" data-testid="stat-total-locations">
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="icon-container w-12 h-12">
                    <MapPin className={`h-6 w-6 ${iconColors.primary.text}`} />
                  </div>
                  <div>
                    <p className="text-3xl metric-value mb-2">
                      {statsData.total_locations.toLocaleString()}
                    </p>
                    <p className={`text-base font-semibold ${iconColors.primary.text} mb-1`}>Total Locations</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                      Visited spots
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="premium-card" data-testid="stat-total-networks">
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="icon-container w-12 h-12">
                    <Wifi className={`h-6 w-6 ${iconColors.success.text}`} />
                  </div>
                  <div>
                    <p className="text-3xl metric-value mb-2">
                      {statsData.total_networks.toLocaleString()}
                    </p>
                    <p className={`text-base font-semibold ${iconColors.success.text} mb-1`}>Networks Detected</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                      Unique BSSIDs
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="premium-card" data-testid="stat-high-risk">
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="icon-container w-12 h-12">
                    <AlertTriangle className={`h-6 w-6 ${iconColors.danger.text}`} />
                  </div>
                  <div>
                    <p className="text-3xl metric-value mb-2 text-red-300">
                      {summaryLoading ? '...' : (wifiSummary?.data?.total_threats || statsData.high_risk_networks).toLocaleString()}
                    </p>
                    <p className={`text-base font-semibold ${iconColors.danger.text} mb-1`}>WiFi Threats</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full">
                      {wifiSummary?.data?.by_level?.extreme || 0} EXTREME · {wifiSummary?.data?.by_level?.high || 0} HIGH
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="premium-card" data-testid="stat-near-home">
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="icon-container w-12 h-12">
                    <Target className={`h-6 w-6 ${iconColors.secondary.text}`} />
                  </div>
                  <div>
                    <p className="text-3xl metric-value mb-2 text-purple-300">
                      {statsData.locations_near_home.toLocaleString()}
                    </p>
                    <p className={`text-base font-semibold ${iconColors.secondary.text} mb-1`}>Near Home</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                      Within 500m
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="premium-card" data-testid="stat-avg-distance">
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="icon-container w-12 h-12">
                    <Navigation className={`h-6 w-6 ${iconColors.warning.text}`} />
                  </div>
                  <div>
                    <p className="text-3xl metric-value mb-2 text-amber-300">
                      {(statsData.avg_distance_from_home / 1000).toFixed(1)}
                    </p>
                    <p className={`text-base font-semibold ${iconColors.warning.text} mb-1`}>Avg Distance</p>
                    <p className="text-sm !text-slate-700 dark:!text-slate-300 silver-accent px-3 py-1 rounded-full">
                      km from home
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="premium-card p-2 mb-6">
              <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2">
                <TabsTrigger value="overview" className="premium-card hover:scale-105 flex items-center gap-2">
                  <Eye className={`h-4 w-4 ${iconColors.secondary.text}`} />
                  <span className="hidden lg:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="locations" className="premium-card hover:scale-105 flex items-center gap-2">
                  <MapPin className={`h-4 w-4 ${iconColors.primary.text}`} />
                  <span className="hidden lg:inline">Locations</span>
                </TabsTrigger>
                <TabsTrigger value="networks" className="premium-card hover:scale-105 flex items-center gap-2">
                  <Wifi className={`h-4 w-4 ${iconColors.success.text}`} />
                  <span className="hidden lg:inline">Networks</span>
                </TabsTrigger>
                <TabsTrigger value="threats" className="premium-card hover:scale-105 flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${iconColors.danger.text}`} />
                  <span className="hidden lg:inline">Threats</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="premium-card hover:scale-105 flex items-center gap-2">
                  <BarChart3 className={`h-4 w-4 ${iconColors.special.text}`} />
                  <span className="hidden lg:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="text-slate-300 flex items-center gap-2">
                      <Shield className={`h-5 w-5 ${iconColors.primary.text}`} />
                      Recent Threat Activity
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Latest suspicious network detections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {threatsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : threats?.data?.length > 0 ? (
                      <div className="space-y-3">
                        {threats.data.slice(0, 5).map((threat: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/80 transition-colors cursor-pointer"
                            onClick={() => setSelectedTab('threats')}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-mono text-sm text-slate-200 font-semibold">
                                  {threat.ssid || 'Hidden Network'}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">{threat.bssid}</p>
                              </div>
                              <Badge className={getThreatColor(threat.threat_level)}>
                                {threat.threat_level}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400">Distance:</span>
                                <span className="text-slate-300 ml-1">{threat.max_distance_km}km</span>
                              </div>
                              <div>
                                <span className="text-slate-400">At Home:</span>
                                <span className="text-green-300 ml-1">{threat.home_sightings}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Away:</span>
                                <span className="text-red-300 ml-1">{threat.away_sightings}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Shield className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                        <p className="text-sm">No threats detected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle className="text-slate-300 flex items-center gap-2">
                      <Activity className={`h-5 w-5 ${iconColors.success.text}`} />
                      Location Activity Summary
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Most frequently visited locations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : locations?.data?.length > 0 ? (
                      <div className="space-y-3">
                        {locations.data.slice(0, 5).map((loc: LocationVisit, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className={`h-4 w-4 ${iconColors.primary.text}`} />
                                <span className="text-slate-200 font-semibold">Location #{loc.location_id}</span>
                              </div>
                              <span className="text-slate-400 text-xs">
                                {(loc.distance_from_home_meters / 1000).toFixed(2)} km away
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400">Visits:</span>
                                <span className="text-slate-300 ml-1">{loc.visit_count}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Networks:</span>
                                <span className="text-slate-300 ml-1">{Math.round(loc.avg_networks_detected)}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Last:</span>
                                <span className="text-slate-300 ml-1">
                                  {new Date(loc.last_visit).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        No location data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-slate-300 flex items-center gap-2">
                    <MapPin className={`h-5 w-5 ${iconColors.primary.text}`} />
                    Location Visit History
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Comprehensive tracking of all visited locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {locationsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-800/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : locations?.data?.length > 0 ? (
                    <div className="space-y-3">
                      {locations.data.map((loc: LocationVisit, idx: number) => (
                        <div
                          key={idx}
                          className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className={`h-5 w-5 ${iconColors.primary.text}`} />
                                <h3 className="text-lg font-semibold text-slate-200">
                                  Location #{loc.location_id}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-400 font-mono">
                                {loc.lat.toFixed(6)}, {loc.lon.toFixed(6)}
                              </p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {loc.visit_count} visits
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Distance from Home</p>
                              <p className="text-lg font-bold text-white">
                                {(loc.distance_from_home_meters / 1000).toFixed(2)} km
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Networks Detected</p>
                              <p className="text-lg font-bold text-white">
                                {Math.round(loc.avg_networks_detected)}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">First Visit</p>
                              <p className="text-sm text-white">
                                {new Date(loc.first_visit).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Last Visit</p>
                              <p className="text-sm text-white">
                                {new Date(loc.last_visit).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No Location Data</p>
                      <p className="text-sm">Location tracking data will appear here once available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Networks Tab */}
            <TabsContent value="networks" className="space-y-6">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-slate-300 flex items-center gap-2">
                    <Wifi className={`h-5 w-5 ${iconColors.success.text}`} />
                    Network Detection Patterns
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Analysis of all detected wireless networks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {networksLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-800/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : networks?.data?.length > 0 ? (
                    <div className="space-y-3">
                      {networks.data.map((network: NetworkPattern, idx: number) => (
                        <div
                          key={idx}
                          className="p-6 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Wifi className={`h-5 w-5 ${iconColors.success.text}`} />
                                <h3 className="text-lg font-semibold text-slate-200">
                                  {network.ssid || 'Hidden Network'}
                                </h3>
                                {network.is_consumer_pattern && (
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    Consumer SSID
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 font-mono">{network.bssid}</p>
                            </div>
                            <Badge className={getThreatColor(network.threat_level)}>
                              {network.threat_level} · {network.suspicion_score}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Total Observations</p>
                              <p className="text-lg font-bold text-white">{network.total_observations}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Distinct Locations</p>
                              <p className="text-lg font-bold text-white">{network.distinct_locations}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Max Distance</p>
                              <p className="text-lg font-bold text-white">{network.max_distance_km} km</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900/50">
                              <p className="text-xs text-slate-400 mb-1">Network Type</p>
                              <p className="text-sm text-white uppercase">{network.type || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <Radar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No Network Data</p>
                      <p className="text-sm">Network detection data will appear here once available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Threats Tab */}
            <TabsContent value="threats" className="space-y-6">
              {threatsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-96 bg-slate-800/50 rounded-lg animate-pulse premium-card" />
                  ))}
                </div>
              ) : threats?.data?.length > 0 ? (
                <div className="space-y-6">
                  {threats.data.map((threat: any, idx: number) => (
                    <Card
                      key={idx}
                      className={`premium-card border-2 transition-all ${
                        threat.threat_level === 'EXTREME'
                          ? 'border-fuchsia-500/50 bg-fuchsia-500/5'
                          : threat.threat_level === 'CRITICAL'
                          ? 'border-red-500/50 bg-red-500/5'
                          : threat.threat_level === 'HIGH'
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : threat.threat_level === 'MEDIUM'
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-blue-500/50 bg-blue-500/5'
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className={`h-6 w-6 ${iconColors.danger.text}`} />
                              <CardTitle className="text-2xl text-slate-100">
                                {threat.ssid || 'Hidden Network'}
                              </CardTitle>
                              {threat.is_mobile_hotspot && (
                                <Badge className="bg-purple-500/30 text-purple-300 border-purple-500/50">
                                  Mobile Hotspot
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 font-mono">{threat.bssid}</p>
                          </div>
                          <Badge className={`${getThreatColor(threat.threat_level)} text-lg px-4 py-2`}>
                            {threat.threat_level}
                          </Badge>
                        </div>
                        <CardDescription className="text-slate-300 mt-3">
                          {threat.threat_description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Radio Band</p>
                            <p className="text-lg font-bold text-white">{threat.radio_band || 'Unknown'}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Observations</p>
                            <p className="text-lg font-bold text-white">{threat.total_sightings}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">At Home</p>
                            <p className="text-lg font-bold text-green-300">{threat.home_sightings}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Away</p>
                            <p className="text-lg font-bold text-red-300">{threat.away_sightings}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Max Distance</p>
                            <p className="text-lg font-bold text-white">{threat.max_distance_km} km</p>
                          </div>
                          <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-700/50">
                            <p className="text-xs text-slate-400 mb-1">Confidence</p>
                            <p className="text-lg font-bold text-white">{(threat.confidence_score * 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        {/* Embedded Map showing all observations */}
                        {threat.observations && threat.observations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Observation Locations ({threat.observations.length} points)
                            </h4>
                            <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-900/50">
                              <div className="h-96 relative">
                                <iframe
                                  src={`/visualization?bssid=${encodeURIComponent(threat.bssid)}&fullscreen=0&showControls=1`}
                                  className="w-full h-full border-0"
                                  title={`Map for ${threat.bssid}`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Observations Table */}
                        {threat.observations && threat.observations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-300">Detection History</h4>
                            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-900/50">
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-slate-400">Time</th>
                                    <th className="px-4 py-2 text-left text-slate-400">Location</th>
                                    <th className="px-4 py-2 text-right text-slate-400">Distance from Home</th>
                                    <th className="px-4 py-2 text-right text-slate-400">Signal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                  {threat.observations.map((obs: any, obsIdx: number) => (
                                    <tr key={obsIdx} className="hover:bg-slate-800/50">
                                      <td className="px-4 py-2 text-slate-300 font-mono text-xs">
                                        {obs.observed_at ? new Date(obs.observed_at).toLocaleString() : 'Unknown'}
                                      </td>
                                      <td className="px-4 py-2 text-slate-300 font-mono text-xs">
                                        {obs.latitude.toFixed(6)}, {obs.longitude.toFixed(6)}
                                      </td>
                                      <td className={`px-4 py-2 text-right font-semibold ${
                                        parseFloat(obs.distance_from_home_km) < 0.5 ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                        {obs.distance_from_home_km} km
                                      </td>
                                      <td className="px-4 py-2 text-right text-slate-300">
                                        {obs.signal_strength} dBm
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="premium-card">
                  <CardContent className="text-center py-16 text-slate-400">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                    <p className="text-lg font-semibold mb-2 text-green-400">No Active Threats</p>
                    <p className="text-sm">No suspicious WiFi surveillance patterns detected at this time</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-slate-300 flex items-center gap-2">
                    <BarChart3 className={`h-5 w-5 ${iconColors.special.text}`} />
                    Grafana Surveillance Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time metrics and visualizations powered by Grafana
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GrafanaDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
