import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Database, Server, MapPin, Upload, CheckCircle2 } from 'lucide-react';
import { iconColors, getIconContainerClasses, getIconTextColor } from '@/lib/iconColors';

export function DatabaseStatus() {
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  // Fetch detailed health for database connection stats and PostGIS version
  const { data: healthDetails } = useQuery({
    queryKey: ["/api/v1/health/detailed"],
    refetchInterval: 5000,
  }) as { data: any };

  const handleRestoreDatabase = () => {
    // This would open a file upload dialog or redirect to database restoration workflow
    console.log("Database restoration requested");
    // TODO: Implement database restoration workflow
  };

  if (isLoading) {
    return (
      <div className="premium-card">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`${getIconContainerClasses('info')} animate-pulse`}>
              <Database className={`h-5 w-5 ${getIconTextColor('info')}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Database Status</h3>
              <p className="text-sm text-slate-400 mt-0.5">PostgreSQL + PostGIS connection</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={getIconContainerClasses(systemStatus?.database.connected ? 'success' : 'danger')}>
            <Database className={`h-5 w-5 ${getIconTextColor(systemStatus?.database.connected ? 'success' : 'danger')}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Database Status</h3>
            <p className="text-sm text-slate-400 mt-0.5">PostgreSQL + PostGIS connection</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-300">
              <Server className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">Connection Pool</span>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-md border ${
              systemStatus?.database.connected
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`} data-testid="db-status">
              {systemStatus?.database.connected ? "Connected" : "Dormant"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">Active Connections</span>
              <span className="text-sm font-mono text-slate-100 font-semibold" data-testid="db-connections">
                {healthDetails?.database?.activeConnections || systemStatus?.database?.activeConnections || 0}/{healthDetails?.database?.totalConnections || systemStatus?.database?.maxConnections || 20}
              </span>
            </div>
            <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((healthDetails?.database?.activeConnections || systemStatus?.database?.activeConnections || 0) /
                    (healthDetails?.database?.totalConnections || systemStatus?.database?.maxConnections || 20)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>Idle: {healthDetails?.database?.idleConnections || 0}</span>
              <span>Waiting: {healthDetails?.database?.waitingConnections || 0}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">PostGIS Extension</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-slate-100 font-semibold" data-testid="postgis-status">
                {healthDetails?.database?.postgisEnabled ? "Available" : systemStatus?.database?.postgisEnabled ? "Available" : "Not Available"}
              </span>
              {(healthDetails?.database?.postgisVersion && healthDetails?.database?.postgisVersion !== "N/A") && (
                <span className="text-xs text-slate-400 font-mono">
                  v{healthDetails.database.postgisVersion.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          {!systemStatus?.database.connected && (
            <div className="pt-4 border-t border-slate-700/50">
              <button
                onClick={handleRestoreDatabase}
                className={`w-full px-4 py-3 bg-gradient-to-r ${iconColors.primary.gradient} text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg ${iconColors.primary.glow}`}
                data-testid="restore-database-button"
              >
                <Upload className="h-4 w-4" />
                Restore Database Backup
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Upload your PostgreSQL backup to activate spatial queries
              </p>
            </div>
          )}

          {systemStatus?.database.connected && (
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Database ready for spatial operations</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
