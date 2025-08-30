import { useQuery } from "@tanstack/react-query";
import { MetricsGrid } from "@/components/metrics-grid";
import { ApiTestPanel } from "@/components/api-test-panel";
import { DatabaseStatus } from "@/components/database-status";
import { SpatialQueryInterface } from "@/components/spatial-query-interface";
import { NetworkObservations } from "@/components/network-observations";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const updateTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">SIGINT Forensics Dashboard</h2>
            <p className="text-sm text-muted-foreground">Monitor and analyze wireless network observations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <span className="w-2 h-2 bg-accent rounded-full status-indicator"></span>
              <span className="text-xs font-medium" data-testid="system-status">
                System Online - {updateTimestamp()}
              </span>
            </div>
            <button 
              className="p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => window.location.reload()}
              data-testid="refresh-button"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <MetricsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ApiTestPanel />
          <DatabaseStatus />
        </div>
        
        <SpatialQueryInterface />
        <NetworkObservations />
      </main>
    </div>
  );
}
