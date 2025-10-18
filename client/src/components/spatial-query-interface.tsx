import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

export function SpatialQueryInterface() {
  const { toast } = useToast();
  const [queryParams, setQueryParams] = useState({
    latitude: "",
    longitude: "",
    radius: "",
    limit: "50"
  });
  const [queryResults, setQueryResults] = useState<any>(null);
  const [encryptionFilter, setEncryptionFilter] = useState("all");
  const [signalFilter, setSignalFilter] = useState("all");

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const spatialQueryMutation = useMutation({
    mutationFn: async () => {
      const lat = parseFloat(queryParams.latitude);
      const lon = parseFloat(queryParams.longitude);
      const radius = parseFloat(queryParams.radius);
      const limit = parseInt(queryParams.limit);

      return api.spatialQuery(lat, lon, radius, limit);
    },
    onSuccess: (result) => {
      setQueryResults(result);
      toast({
        title: "Query Successful",
        description: `Found ${result.count} networks within ${queryParams.radius}m`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Query Failed",
        description: error.message || "Failed to execute spatial query",
        variant: "destructive",
      });
    },
  });

  const isConnected = systemStatus?.database.connected;
  const hasPostGIS = systemStatus?.database.postgisEnabled;

  const handleExecuteQuery = () => {
    if (!queryParams.latitude || !queryParams.longitude || !queryParams.radius) {
      toast({
        title: "Missing Parameters",
        description: "Please fill in latitude, longitude, and radius",
        variant: "destructive",
      });
      return;
    }

    spatialQueryMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    setQueryParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="premium-card mb-8">
      <div className="p-6 border-b border-border/20">
        <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
          <div className="icon-container w-8 h-8 mr-2">
            <MapPin className="h-4 w-4 text-blue-300" />
          </div>
          Spatial Query Interface
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Search for networks within geographic bounds</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Latitude</label>
            <input
              type="number"
              placeholder="37.7749"
              step="0.0001"
              value={queryParams.latitude}
              onChange={(e) => handleInputChange("latitude", e.target.value)}
              disabled={!isConnected}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              data-testid="input-latitude"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Longitude</label>
            <input
              type="number"
              placeholder="-122.4194"
              step="0.0001"
              value={queryParams.longitude}
              onChange={(e) => handleInputChange("longitude", e.target.value)}
              disabled={!isConnected}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              data-testid="input-longitude"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Radius (meters)</label>
            <select
              value={queryParams.radius}
              onChange={(e) => handleInputChange("radius", e.target.value)}
              disabled={!isConnected}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              data-testid="select-radius"
            >
              <option value="">Select radius</option>
              <option value="100">100m - Building</option>
              <option value="500">500m - Block</option>
              <option value="1000">1km - Neighborhood</option>
              <option value="2000">2km - District</option>
              <option value="5000">5km - City Area</option>
              <option value="10000">10km - Metropolitan</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Encryption Type</label>
            <select
              value={encryptionFilter}
              onChange={(e) => setEncryptionFilter(e.target.value)}
              disabled={!isConnected}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              data-testid="select-encryption"
            >
              <option value="all">All Types</option>
              <option value="open">Open Networks</option>
              <option value="wep">WEP Encryption</option>
              <option value="wpa">WPA/WPA2</option>
              <option value="wpa3">WPA3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Signal Strength</label>
            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              disabled={!isConnected}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              data-testid="select-signal"
            >
              <option value="all">All Strengths</option>
              <option value="strong">Strong (-30 to -60 dBm)</option>
              <option value="medium">Medium (-60 to -80 dBm)</option>
              <option value="weak">Weak (-80+ dBm)</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleExecuteQuery}
            disabled={!isConnected || !hasPostGIS || spatialQueryMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            data-testid="execute-spatial-query-button"
          >
            <i className="fas fa-search mr-2"></i>
            {spatialQueryMutation.isPending ? "Executing..." : "Execute Spatial Query"}
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <i className={`fas ${isConnected && hasPostGIS ? "fa-check-circle text-accent" : "fa-info-circle"}`}></i>
            <span>
              {!isConnected 
                ? "Database connection required"
                : !hasPostGIS 
                ? "PostGIS extension required"
                : "Ready for spatial queries"}
            </span>
          </div>
        </div>

        {queryResults && (
          <div className="border border-border rounded-md p-4 bg-muted/50">
            <h4 className="text-sm font-semibold mb-2">Query Results</h4>
            <div className="text-xs font-mono space-y-1">
              <div>Found: {queryResults.count} networks</div>
              <div>Query: lat={queryResults.query?.latitude}, lon={queryResults.query?.longitude}, radius={queryResults.query?.radius}m</div>
              {queryResults.data && queryResults.data.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(queryResults.data.slice(0, 3), null, 2)}</pre>
                  {queryResults.data.length > 3 && (
                    <div className="text-muted-foreground">... and {queryResults.data.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
