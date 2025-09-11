// API base configuration
const API_BASE = '/api/v1';

// Error handling utility
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base fetch function with error handling
export const apiRequest = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE}${endpoint}`);
  
  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new ApiError(response.status, data.error || 'API request failed');
  }
  
  return data;
};

// Health/Config endpoints
export const fetchHealth = async () => {
  return apiRequest<{ ok: boolean; service: string; ts: string }>('/health');
};

export const fetchConfig = async () => {
  return apiRequest<{ ok: boolean; mapboxToken: string | null }>('/config');
};

export const fetchStatus = async () => {
  return apiRequest<{
    ok: boolean;
    database: { connected: boolean; activeConnections: number; maxConnections: number; postgisEnabled: boolean };
    memory: { used: number; total: number };
    uptime: number;
  }>('/status');
};

// Network endpoints
export const fetchNetworks = async (limit = 50) => {
  return apiRequest<{
    ok: boolean;
    data: Array<{
      id: string;
      bssid: string;
      ssid?: string;
      signal_strength?: number;
      encryption?: string;
      observed_at: string;
      latitude?: number;
      longitude?: number;
    }>;
    count: number;
    limit: number;
  }>(`/networks?limit=${limit}`);
};

export const fetchVisualize = async () => {
  return apiRequest<{
    ok: boolean;
    data: GeoJSON.FeatureCollection;
    count: number;
  }>('/visualize');
};

export const fetchWithin = async (lat: number, lon: number, radius: number, limit = 50) => {
  return apiRequest<{
    ok: boolean;
    data: Array<{
      id: string;
      bssid: string;
      ssid?: string;
      signal_strength?: number;
      distance: number;
      latitude: number;
      longitude: number;
    }>;
    count: number;
    query: { latitude: number; longitude: number; radius: number; limit: number };
  }>(`/within?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`);
};

// Analytics endpoints
export const fetchAnalytics = async () => {
  return apiRequest<{
    ok: boolean;
    data: {
      total_networks: number;
      unique_ssids: number;
      encrypted_networks: number;
      open_networks: number;
      signal_strength_avg: number;
      recent_observations: number;
    };
  }>('/analytics');
};

export const fetchSignalStrength = async () => {
  return apiRequest<{
    ok: boolean;
    data: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  }>('/signal-strength');
};

export const fetchSecurityAnalysis = async () => {
  return apiRequest<{
    ok: boolean;
    data: {
      wpa3: number;
      wpa2: number;
      wpa: number;
      wep: number;
      open: number;
      unknown: number;
    };
  }>('/security-analysis');
};

// Location endpoints
export const fetchLocations = async (limit = 50) => {
  return apiRequest<{
    ok: boolean;
    data: Array<{
      id: string;
      latitude: number;
      longitude: number;
      observed_at: string;
      accuracy?: number;
      altitude?: number;
    }>;
    count: number;
  }>(`/locations?limit=${limit}`);
};

export const fetchLocationsByBssid = async (bssid: string) => {
  return apiRequest<{
    ok: boolean;
    data: Array<{
      id: string;
      latitude: number;
      longitude: number;
      observed_at: string;
      signal_strength?: number;
    }>;
    count: number;
  }>(`/locations/${encodeURIComponent(bssid)}`);
};