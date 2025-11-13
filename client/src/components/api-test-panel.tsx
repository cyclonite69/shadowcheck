import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, Play, CheckCircle2, XCircle, Zap, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { iconColors, getIconContainerClasses, getIconTextColor } from '@/lib/iconColors';

export function ApiTestPanel() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const testEndpointMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      let result;
      const startTime = performance.now();

      try {
        switch (endpoint) {
          case "health":
            result = await api.getHealth();
            break;
          case "version":
            result = await api.getVersion();
            break;
          case "config":
            result = await api.getConfig();
            break;
          case "status":
            result = await api.getSystemStatus();
            break;
          case "metrics":
            result = await fetch('/api/v1/metrics').then(r => r.json());
            break;
          case "networks":
            result = await api.getNetworks({ limit: 10 });
            break;
          case "within":
            result = await api.spatialQuery(43.02342188, -83.6968461, 500, 50);
            break;
          case "visualize":
            result = await api.getVisualization();
            break;
          case "analytics":
            result = await api.getAnalytics();
            break;
          case "signal-strength":
            result = await api.getSignalStrengthDistribution();
            break;
          case "security-analysis":
            result = await api.getSecurityAnalysis();
            break;
          case "radio-stats":
            result = await api.getRadioStats();
            break;
          case "timeline":
            result = await api.getTimelineData();
            break;
          case "surveillance-stats":
            result = await fetch('/api/v1/surveillance/stats').then(r => r.json());
            break;
          case "location-visits":
            result = await fetch('/api/v1/surveillance/location-visits').then(r => r.json());
            break;
          case "network-patterns":
            result = await fetch('/api/v1/surveillance/network-patterns').then(r => r.json());
            break;
          case "home-following":
            result = await fetch('/api/v1/surveillance/home-following').then(r => r.json());
            break;
          case "network-timeline":
            // Use a sample BSSID for testing
            result = await fetch('/api/v1/surveillance/network-timeline/00:00:00:00:00:00').then(r => r.json());
            break;
          case "surveillance-wifi-threats":
            result = await fetch('/api/v1/surveillance/wifi/threats').then(r => r.json());
            break;
          case "surveillance-wifi-summary":
            result = await fetch('/api/v1/surveillance/wifi/summary').then(r => r.json());
            break;
          case "surveillance-settings":
            result = await fetch('/api/v1/surveillance/settings').then(r => r.json());
            break;
          case "access-points":
            result = await fetch('/api/v1/access-points?limit=10').then(r => r.json());
            break;
          case "access-points-columns":
            result = await fetch('/api/v1/access-points/columns').then(r => r.json());
            break;
          case "wigle-stats":
            result = await fetch('/api/v1/wigle/stats').then(r => r.json());
            break;
          case "wigle-queue":
            result = await fetch('/api/v1/wigle/queue').then(r => r.json());
            break;
          case "wigle-orphaned":
            result = await fetch('/api/v1/wigle/orphaned-networks').then(r => r.json());
            break;
          case "wigle-networks":
            result = await fetch('/api/v1/wigle/networks?limit=10').then(r => r.json());
            break;
          default:
            throw new Error("Unknown endpoint");
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        return { success: true, data: result, duration };
      } catch (error: any) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        return {
          success: false,
          error: error.message,
          status: error.status || 500,
          duration
        };
      }
    },
    onSuccess: (result, endpoint) => {
      setTestResults(prev => ({ ...prev, [endpoint]: result }));

      if (result.success) {
        toast({
          title: "Test Successful",
          description: `${endpoint} endpoint responded in ${result.duration}ms`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: `${endpoint} endpoint failed: ${result.error}`,
          variant: "destructive",
        });
      }
    },
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        testAllEndpoints();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    for (const ep of endpoints.filter(e => e.available)) {
      await testEndpointMutation.mutateAsync(ep.endpoint);
      // Small delay between tests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsTestingAll(false);
  };

  const endpoints = [
    // System Endpoints
    {
      method: "GET",
      path: "/api/v1/health",
      endpoint: "health",
      available: true,
      description: "Check API server health and uptime",
      category: "System",
    },
    {
      method: "GET",
      path: "/api/v1/version",
      endpoint: "version",
      available: true,
      description: "Get API version information",
      category: "System",
    },
    {
      method: "GET",
      path: "/api/v1/config",
      endpoint: "config",
      available: true,
      description: "Get frontend configuration (Mapbox token)",
      category: "System",
    },
    {
      method: "GET",
      path: "/api/v1/status",
      endpoint: "status",
      available: true,
      description: "Get detailed system status and metrics",
      category: "System",
    },
    {
      method: "GET",
      path: "/api/v1/metrics",
      endpoint: "metrics",
      available: systemStatus?.database.connected || false,
      description: "Get network count metrics",
      category: "System",
    },

    // Data Endpoints
    {
      method: "GET",
      path: "/api/v1/networks?limit=10",
      endpoint: "networks",
      available: systemStatus?.database.connected || false,
      description: "Fetch network observations (paginated)",
      category: "Data",
    },
    {
      method: "GET",
      path: "/api/v1/within?lat=43.0234&lon=-83.6968&radius=500",
      endpoint: "within",
      available: systemStatus?.database.connected || false,
      description: "Spatial query: networks within 500m of HOME",
      category: "Data",
    },
    {
      method: "GET",
      path: "/api/v1/visualize",
      endpoint: "visualize",
      available: systemStatus?.database.connected || false,
      description: "Get GeoJSON data for map visualization",
      category: "Data",
    },

    // Analytics Endpoints
    {
      method: "GET",
      path: "/api/v1/analytics",
      endpoint: "analytics",
      available: systemStatus?.database.connected || false,
      description: "Get comprehensive analytics summary",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/signal-strength",
      endpoint: "signal-strength",
      available: systemStatus?.database.connected || false,
      description: "Signal strength distribution analysis",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/security-analysis",
      endpoint: "security-analysis",
      available: systemStatus?.database.connected || false,
      description: "Network security analysis and stats",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/radio-stats",
      endpoint: "radio-stats",
      available: systemStatus?.database.connected || false,
      description: "Radio type statistics (WiFi/BLE/BT/Cell)",
      category: "Analytics",
    },
    {
      method: "GET",
      path: "/api/v1/timeline",
      endpoint: "timeline",
      available: systemStatus?.database.connected || false,
      description: "Network observation timeline data",
      category: "Analytics",
    },

    // Surveillance Endpoints
    {
      method: "GET",
      path: "/api/v1/surveillance/stats",
      endpoint: "surveillance-stats",
      available: systemStatus?.database.connected || false,
      description: "Surveillance detection statistics",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/location-visits",
      endpoint: "location-visits",
      available: systemStatus?.database.connected || false,
      description: "Location visit pattern analysis",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/network-patterns",
      endpoint: "network-patterns",
      available: systemStatus?.database.connected || false,
      description: "Network behavior pattern detection",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/home-following",
      endpoint: "home-following",
      available: systemStatus?.database.connected || false,
      description: "Home-following detection analysis",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/network-timeline/:bssid",
      endpoint: "network-timeline",
      available: systemStatus?.database.connected || false,
      description: "Network timeline by BSSID (sample)",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/wifi/threats",
      endpoint: "surveillance-wifi-threats",
      available: systemStatus?.database.connected || false,
      description: "WiFi threat detection analysis",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/wifi/summary",
      endpoint: "surveillance-wifi-summary",
      available: systemStatus?.database.connected || false,
      description: "WiFi surveillance summary",
      category: "Surveillance",
    },
    {
      method: "GET",
      path: "/api/v1/surveillance/settings",
      endpoint: "surveillance-settings",
      available: systemStatus?.database.connected || false,
      description: "Get surveillance detection settings",
      category: "Surveillance",
    },

    // Access Points Endpoints
    {
      method: "GET",
      path: "/api/v1/access-points?limit=10",
      endpoint: "access-points",
      available: systemStatus?.database.connected || false,
      description: "List access points with filtering",
      category: "Access Points",
    },
    {
      method: "GET",
      path: "/api/v1/access-points/columns",
      endpoint: "access-points-columns",
      available: systemStatus?.database.connected || false,
      description: "Get available data columns",
      category: "Access Points",
    },

    // WiGLE Enrichment Endpoints
    {
      method: "GET",
      path: "/api/v1/wigle/stats",
      endpoint: "wigle-stats",
      available: systemStatus?.database.connected || false,
      description: "WiGLE enrichment statistics",
      category: "WiGLE",
    },
    {
      method: "GET",
      path: "/api/v1/wigle/queue",
      endpoint: "wigle-queue",
      available: systemStatus?.database.connected || false,
      description: "View WiGLE enrichment queue",
      category: "WiGLE",
    },
    {
      method: "GET",
      path: "/api/v1/wigle/orphaned-networks",
      endpoint: "wigle-orphaned",
      available: systemStatus?.database.connected || false,
      description: "Networks without location data",
      category: "WiGLE",
    },
    {
      method: "GET",
      path: "/api/v1/wigle/networks?limit=10",
      endpoint: "wigle-networks",
      available: systemStatus?.database.connected || false,
      description: "WiGLE enriched networks list",
      category: "WiGLE",
    },
  ];

  return (
    <div className="premium-card">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={getIconContainerClasses('primary')}>
              <FlaskConical className={`h-5 w-5 ${getIconTextColor('primary')}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">API Health Dashboard</h3>
              <p className="text-sm text-slate-400 mt-0.5">Test all system endpoints with performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={testAllEndpoints}
              disabled={isTestingAll || testEndpointMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              {isTestingAll ? 'Testing All...' : 'Test All Endpoints'}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Group endpoints by category */}
        {['System', 'Data', 'Analytics', 'Surveillance', 'Access Points', 'WiGLE'].map(category => {
          const categoryEndpoints = endpoints.filter(ep => ep.category === category);
          if (categoryEndpoints.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  category === 'System' ? 'bg-blue-400' :
                  category === 'Data' ? 'bg-green-400' :
                  category === 'Analytics' ? 'bg-purple-400' :
                  category === 'Surveillance' ? 'bg-orange-400' :
                  category === 'Access Points' ? 'bg-cyan-400' :
                  'bg-pink-400'
                }`}></div>
                {category} Endpoints
              </h4>
              {categoryEndpoints.map((ep) => (
                <div key={ep.endpoint} className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-2.5 py-1 text-xs font-mono font-semibold rounded ${
                  ep.available ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                  {ep.method}
                </span>
                <div className="flex-1">
                  <span className="font-mono text-sm text-slate-300">{ep.path}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{ep.description}</p>
                </div>
              </div>
              {ep.available ? (
                <button
                  onClick={() => testEndpointMutation.mutate(ep.endpoint)}
                  disabled={testEndpointMutation.isPending}
                  className={`px-4 py-2 text-xs font-medium bg-gradient-to-r ${iconColors.primary.gradient} text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg ${iconColors.primary.glow}`}
                  data-testid={`test-button-${ep.endpoint}`}
                >
                  <Play className="h-3 w-3" />
                  {testEndpointMutation.isPending ? "Testing..." : "Test"}
                </button>
              ) : (
                <span className="px-3 py-2 text-xs font-medium bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                  DB Required
                </span>
              )}
            </div>

            {testResults[ep.endpoint] && (
              <div className={`p-4 rounded-lg border text-xs font-mono ${
                testResults[ep.endpoint].success
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>
                {testResults[ep.endpoint].success ? (
                  <div>
                    <div className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Success ({testResults[ep.endpoint].duration}ms)
                    </div>
                    <div className="opacity-75 bg-slate-900/50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(testResults[ep.endpoint].data, null, 2).slice(0, 200)}...
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      Error {testResults[ep.endpoint].status}
                    </div>
                    <div>{testResults[ep.endpoint].error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
