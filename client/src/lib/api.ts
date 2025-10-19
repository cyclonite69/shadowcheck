import { apiRequest } from "./queryClient";
import { sql } from 'drizzle-orm';

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
    observation_count?: number;
    type?: string;
  }>;
  count: number;
  total_count?: number;
  limit: number;
  cursor?: {
    next_before_time_ms?: number | null;
  };
  rows?: Array<any>; // For new cursor-based API
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

export interface ForensicsNetworksResponse {
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

export interface ForensicsLocationsResponse {
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

  async getNetworks(options?: {
    limit?: number;
    offset?: number;
    before_time_ms?: number;
    distinct_latest?: boolean;
    group_by_bssid?: boolean;
    search?: string;
    radio_types?: string[];
    min_signal?: number;
    max_signal?: number;
    min_freq?: number;
    max_freq?: number;
  }): Promise<NetworksResponse> {
    const params = new URLSearchParams();

    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.before_time_ms) params.append('before_time_ms', options.before_time_ms.toString());
    if (options?.distinct_latest) params.append('distinct_latest', '1');
    if (options?.group_by_bssid) params.append('group_by_bssid', '1');
    if (options?.search) params.append('search', options.search);
    if (options?.radio_types && options.radio_types.length > 0) {
      params.append('radio_types', options.radio_types.join(','));
    }
    if (options?.min_signal !== undefined) params.append('min_signal', options.min_signal.toString());
    if (options?.max_signal !== undefined) params.append('max_signal', options.max_signal.toString());
    if (options?.min_freq !== undefined) params.append('min_freq', options.min_freq.toString());
    if (options?.max_freq !== undefined) params.append('max_freq', options.max_freq.toString());

    const queryString = params.toString();
    const url = queryString ? `/api/v1/networks?${queryString}` : '/api/v1/networks';

    const res = await apiRequest("GET", url);
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

  // Analytics API methods
  async getAnalytics(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/analytics");
    return res.json();
  },

  async getSignalStrengthDistribution(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/signal-strength");
    return res.json();
  },

  async getSecurityAnalysis(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/security-analysis");
    return res.json();
  },

  async getRadioStats(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/radio-stats");
    return res.json();
  },

  async getTimelineData(): Promise<any> {
    const res = await apiRequest("GET", "/api/v1/timeline");
    return res.json();
  }
};
