import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ApiTestPanel() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, any>>({});

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
      path: "/api/v1/version",
      endpoint: "version",
      available: true,
      description: "Get system version information",
    },
    {
      method: "GET",
      path: "/api/v1/networks",
      endpoint: "networks",
      available: systemStatus?.database.connected || false,
      description: "Fetch network observations",
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-flask text-primary"></i>
          System Testing
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Test system endpoints</p>
      </div>
      <div className="p-6 space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.endpoint} className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-mono rounded ${
                  ep.available ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm">{ep.path}</span>
              </div>
              {ep.available ? (
                <button
                  onClick={() => testEndpointMutation.mutate(ep.endpoint)}
                  disabled={testEndpointMutation.isPending}
                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid={`test-button-${ep.endpoint}`}
                >
                  {testEndpointMutation.isPending ? "Testing..." : "Test"}
                </button>
              ) : (
                <span className="px-3 py-1 text-xs bg-destructive/20 text-destructive rounded">
                  501 No DB
                </span>
              )}
            </div>
            
            {testResults[ep.endpoint] && (
              <div className={`p-3 rounded-md text-xs font-mono ${
                testResults[ep.endpoint].success 
                  ? "bg-accent/10 text-accent" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {testResults[ep.endpoint].success ? (
                  <div>
                    <div className="font-semibold">✓ Success ({testResults[ep.endpoint].duration}ms)</div>
                    <div className="mt-1 opacity-75">
                      {JSON.stringify(testResults[ep.endpoint].data, null, 2).slice(0, 200)}...
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold">✗ Error {testResults[ep.endpoint].status}</div>
                    <div className="mt-1">{testResults[ep.endpoint].error}</div>
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
