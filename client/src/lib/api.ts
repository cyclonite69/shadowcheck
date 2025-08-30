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
  }
};
