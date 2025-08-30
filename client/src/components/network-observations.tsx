import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function NetworkObservations() {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const { data: networks, isLoading, error } = useQuery({
    queryKey: ["/api/v1/networks"],
    queryFn: () => api.getNetworks(20),
    enabled: systemStatus?.database.connected,
    refetchInterval: 10000,
  });

  const isConnected = systemStatus?.database.connected;

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-wifi text-primary"></i>
          Network Observations
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Recent wireless network detections</p>
      </div>
      <div className="p-6">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-database text-2xl text-muted-foreground"></i>
            </div>
            <h4 className="text-lg font-medium mb-2">No Database Connection</h4>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Network observations will appear here once you restore your PostgreSQL database backup with PostGIS extension.
            </p>
            <div className="space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>GET /api/v1/networks → 501 Not Implemented</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>GET /api/v1/within → 501 Not Implemented</span>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-destructive"></i>
            </div>
            <h4 className="text-lg font-medium mb-2 text-destructive">Error Loading Networks</h4>
            <p className="text-muted-foreground">
              {(error as any)?.message || "Failed to load network observations"}
            </p>
          </div>
        ) : networks && networks.data.length > 0 ? (
          <div className="space-y-4" data-testid="networks-list">
            {networks.data.map((network) => (
              <div key={network.id} className="border border-border rounded-md p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">
                      {network.ssid || "Hidden Network"}
                    </h5>
                    <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded font-mono">
                      {network.bssid}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {network.observed_at ? new Date(network.observed_at).toLocaleString() : "Unknown"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>Channel: {network.channel || "N/A"}</div>
                  <div>Signal: {network.signal_strength ? `${network.signal_strength} dBm` : "N/A"}</div>
                  <div>Encryption: {network.encryption || "Unknown"}</div>
                  <div>
                    Location: {network.latitude && network.longitude 
                      ? `${parseFloat(network.latitude).toFixed(4)}, ${parseFloat(network.longitude).toFixed(4)}`
                      : "N/A"}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center text-sm text-muted-foreground">
              Showing {networks.data.length} of {networks.count} total observations
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-wifi text-2xl text-muted-foreground"></i>
            </div>
            <h4 className="text-lg font-medium mb-2">No Network Observations</h4>
            <p className="text-muted-foreground">
              No wireless networks have been detected yet. Data will appear here as observations are collected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
