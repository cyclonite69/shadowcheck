import { apiRequest } from "./queryClient";

export interface HealthResponse {
  ok: boolean;
  service: string;
  ts: string;
}

export interface VersionResponse {
  name: string;
  version: string;
  description: string;
}

export interface SystemStatusResponse {
  ok: boolean;
  database: {
    connected: boolean;
    activeConnections: number;
    maxConnections: number;
    postgisEnabled: boolean;
  };
  memory: {
    used: number;
    total: number;
  };
  uptime: number;
}

export interface NetworksResponse {
  ok: boolean;
  data: Array<{
    id: string;
    ssid?: string;
    bssid: string;
    frequency?: number;
    channel?: number;
    signal_strength?: number;
    encryption?: string;
    latitude?: string;
    longitude?: string;
    observed_at?: string;
    created_at?: string;
  }>;
  count: number;
  limit: number;
}

export interface SpatialQueryResponse {
  ok: boolean;
  data: Array<any>;
  count: number;
  query: {
    latitude: number;
    longitude: number;
    radius: number;
    limit: number;
  };
}

export interface ConfigResponse {
  ok: boolean;
  mapboxToken: string | null;
}

export interface G63NetworksResponse {
  ok: boolean;
  data: Array<{
    bssid: string;
    ssid: string;
    frequency: number;
    capabilities: string;
    lasttime: string;
    lastlat: number;
    lastlon: number;
    type: string;
    bestlevel: number;
    bestlat: number;
    bestlon: number;
    rcois: string;
    mfgrid: number;
    service: string;
  }>;
  count: number;
}

export interface G63LocationsResponse {
  ok: boolean;
  data: Array<{
    _id: string;
    bssid: string;
    level: number;
    lat: number;
    lon: number;
    altitude: number;
    accuracy: number;
    time: string;
    external: number;
    mfgrid: number;
  }>;
  count: number;
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await apiRequest("GET", "/api/v1/health");
    return res.json();
  },

  async getVersion(): Promise<VersionResponse> {
    const res = await apiRequest("GET", "/api/v1/version");
    return res.json();
  },

  async getConfig(): Promise<ConfigResponse> {
    const res = await apiRequest("GET", "/api/v1/config");
    return res.json();
  },

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await apiRequest("GET", "/api/v1/status");
    return res.json();
  },

  async getNetworks(limit: number = 50): Promise<NetworksResponse> {
    const res = await apiRequest("GET", `/api/v1/networks?limit=${limit}`);
    return res.json();
  },

  async spatialQuery(lat: number, lon: number, radius: number, limit: number = 50): Promise<SpatialQueryResponse> {
    const res = await apiRequest("GET", `/api/v1/within?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`);
    return res.json();
  },

  async getVisualization(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/visualize");
    return res.json();
  },

  // G63 Forensics API methods
  async getG63Networks(limit?: number): Promise<G63NetworksResponse> {
    const url = limit ? `/api/v1/g63/networks?limit=${limit}` : "/api/v1/g63/networks";
    const res = await apiRequest("GET", url);
    return res.json();
  },

  async getG63NetworksWithin(lat: number, lon: number, radius: number, limit?: number): Promise<G63NetworksResponse> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      radius: radius.toString(),
    });
    if (limit) params.append('limit', limit.toString());
    
    const res = await apiRequest("GET", `/api/v1/g63/networks/within?${params}`);
    return res.json();
  },

  async getG63Locations(limit?: number): Promise<G63LocationsResponse> {
    const url = limit ? `/api/v1/g63/locations?limit=${limit}` : "/api/v1/g63/locations";
    const res = await apiRequest("GET", url);
    return res.json();
  },

  async getG63LocationsByBssid(bssid: string): Promise<G63LocationsResponse> {
    const res = await apiRequest("GET", `/api/v1/g63/locations/${bssid}`);
    return res.json();
  },

  async getG63Visualization(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/g63/visualize");
    return res.json();
  },

  // G63 Analytics API methods
  async getG63Analytics(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/g63/analytics");
    return res.json();
  },

  async getG63SignalStrengthDistribution(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/g63/signal-strength");
    return res.json();
  },

  async getG63SecurityAnalysis(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/g63/security-analysis");
    return res.json();
  },

  async getRadioStats(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/radio-stats");
    return res.json();
  }
};
