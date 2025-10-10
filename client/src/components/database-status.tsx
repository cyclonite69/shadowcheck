import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function DatabaseStatus() {
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const handleRestoreDatabase = () => {
    // This would open a file upload dialog or redirect to database restoration workflow
    console.log("Database restoration requested");
    // TODO: Implement database restoration workflow
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-database text-destructive"></i>
            Database Status
          </h3>
          <p className="text-sm text-muted-foreground mt-1">PostgreSQL + PostGIS connection</p>
        </div>
        <div className="p-6">
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className={`fas fa-database ${systemStatus?.database.connected ? "text-accent" : "text-destructive"}`}></i>
          Database Status
        </h3>
        <p className="text-sm text-muted-foreground mt-1">PostgreSQL + PostGIS connection</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection Pool</span>
            <span className={`px-2 py-1 text-xs rounded ${
              systemStatus?.database.connected 
                ? "bg-accent/20 text-accent" 
                : "bg-destructive/20 text-destructive"
            }`} data-testid="db-status">
              {systemStatus?.database.connected ? "Connected" : "Dormant"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Active Connections</span>
            <span className="text-sm font-mono" data-testid="db-connections">
              {systemStatus?.database.activeConnections || 0}/{systemStatus?.database.maxConnections || 5}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">PostGIS Extension</span>
            <span className="text-sm text-muted-foreground" data-testid="postgis-status">
              {systemStatus?.database.postgisEnabled ? "Available" : "Not Available"}
            </span>
          </div>
          
          {!systemStatus?.database.connected && (
            <div className="pt-4 border-t border-border">
              <button 
                onClick={handleRestoreDatabase}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                data-testid="restore-database-button"
              >
                <i className="fas fa-upload mr-2"></i>
                Restore Database Backup
              </button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Upload your PostgreSQL backup to activate spatial queries
              </p>
            </div>
          )}
          
          {systemStatus?.database.connected && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-accent">
                <i className="fas fa-check-circle"></i>
                <span>Database ready for spatial operations</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
