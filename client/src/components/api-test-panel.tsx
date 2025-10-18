import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, Play, CheckCircle2, XCircle, Zap, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
          case "networks":
            result = await api.getNetworks(10);
            break;
          case "status":
            result = await api.getSystemStatus();
            break;
          case "within":
            result = await fetch('/api/v1/within?lat=37.7749&lon=-122.4194&radius=5000').then(r => r.json());
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
    {
      method: "GET",
      path: "/api/v1/health",
      endpoint: "health",
      available: true,
      description: "Check system health status",
    },
    {
      method: "GET",
      path: "/api/v1/status",
      endpoint: "status",
      available: true,
      description: "Get system status information",
    },
    {
      method: "GET",
      path: "/api/v1/networks",
      endpoint: "networks",
      available: systemStatus?.database.connected || false,
      description: "Fetch network observations",
    },
    {
      method: "GET",
      path: "/api/v1/within",
      endpoint: "within",
      available: systemStatus?.database.connected || false,
      description: "Query networks within radius",
    },
  ];

  return (
    <div className="premium-card">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-container w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <FlaskConical className="h-5 w-5 text-white" />
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
      <div className="p-6 space-y-3">
        {endpoints.map((ep) => (
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
                  className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/20"
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
    </div>
  );
}
