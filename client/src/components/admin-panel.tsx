import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function AdminPanel() {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const endpoints = [
    { path: "GET /api/v1/health", active: true },
    { path: "GET /api/v1/status", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/within", active: systemStatus?.database.connected || false },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-shield-alt text-primary"></i>
          System Administration
        </h3>
        
        {/* Database Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                systemStatus?.database.connected ? 'bg-accent' : 'bg-destructive'
              } status-indicator`}></span>
              <span className="font-medium">Database Connection</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {systemStatus?.database.connected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              PostGIS: {systemStatus?.database.postgisEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          
          <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-memory text-primary"></i>
              <span className="font-medium">Memory Usage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Used: {systemStatus?.memory.used || 0}MB
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Total: {systemStatus?.memory.total || 0}MB
            </p>
          </div>
        </div>

        {/* API Endpoints Status */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <i className="fas fa-plug text-xs"></i>
            API Endpoint Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/30">
                <span className="text-sm font-mono text-muted-foreground">{endpoint.path}</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  endpoint.active ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                }`}>
                  {endpoint.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-lock text-primary"></i>
          Security Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Database Security</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>SCRAM-SHA-256 password encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>SSL/TLS certificate validation</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>Connection pooling with authentication</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">API Security</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>CORS protection enabled</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>Helmet security headers</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-accent text-xs"></i>
                <span>Session-based authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}