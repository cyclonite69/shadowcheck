import { apiRequest } from './queryClient';
// Mock drizzle-orm import for compilation
const sql = { raw: (query: string) => query };

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
    // Additional properties for compatibility
    capabilities?: string;
    bestlevel?: number;
    lasttime?: string;
    network_count?: number;
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

export interface SurveillanceAlert {
  alert_id: number;
  anomaly_id?: number;
  alert_level: 'emergency' | 'critical' | 'warning' | 'info';
  alert_type: string;
  requires_immediate_attention: boolean;
  alert_title: string;
  alert_status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  confidence_score: number;
  record_created_at: string;
  description?: string;
  evidence_summary?: any;
  assigned_to?: string;
  updated_at?: string;
}

export interface SurveillanceAlertsResponse {
  ok: boolean;
  data: SurveillanceAlert[];
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface AlertUpdateRequest {
  alert_status: SurveillanceAlert['alert_status'];
  assigned_to?: string;
}

export interface StatsResponse {
  ok: boolean;
  data: {
    networks: number;
    alerts: number;
    wifi_networks?: number;
    cellular_towers?: number;
    bluetooth_classic?: number;
    ble_devices?: number;
    timestamp: string;
  };
  source?: string;
  fallback?: boolean;
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await apiRequest('GET', '/api/v1/health');
    return res.json();
  },

  async getVersion(): Promise<VersionResponse> {
    const res = await apiRequest('GET', '/api/v1/version');
    return res.json();
  },

  async getConfig(): Promise<ConfigResponse> {
    const res = await apiRequest('GET', '/api/v1/config');
    return res.json();
  },

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const res = await apiRequest('GET', '/api/v1/status');
    return res.json();
  },

  async getNetworks(limit: number = 50): Promise<NetworksResponse> {
    const res = await apiRequest('GET', `/api/v1/networks?limit=${limit}`);
    return res.json();
  },

  async spatialQuery(
    lat: number,
    lon: number,
    radius: number,
    limit: number = 50
  ): Promise<SpatialQueryResponse> {
    const res = await apiRequest(
      'GET',
      `/api/v1/within?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`
    );
    return res.json();
  },

  async getVisualization(): Promise<any> {
    const res = await apiRequest('GET', '/api/v1/visualize');
    return res.json();
  },

  // Analytics API methods
  async getAnalytics(): Promise<any> {
    const res = await apiRequest('GET', '/api/v1/analytics');
    return res.json();
  },

  async getSignalStrengthDistribution(): Promise<any> {
    const res = await apiRequest('GET', '/api/v1/signal-strength');
    return res.json();
  },

  async getSecurityAnalysis(): Promise<any> {
    const res = await apiRequest('GET', '/api/v1/security-analysis');
    return res.json();
  },

  async getRadioStats(): Promise<any> {
    const res = await apiRequest('GET', '/api/v1/radio-stats');
    return res.json();
  },

  // Surveillance Alerts API methods
  async getSurveillanceAlerts(
    page: number = 1,
    limit: number = 50,
    filters?: {
      alert_level?: SurveillanceAlert['alert_level'];
      alert_status?: SurveillanceAlert['alert_status'];
      requires_immediate_attention?: boolean;
    }
  ): Promise<SurveillanceAlertsResponse> {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const res = await apiRequest('GET', `/api/v1/surveillance/alerts?${searchParams}`);
      return res.json();
    } catch (error) {
      // Fallback to mock data if backend is unavailable
      console.warn('Backend unavailable, using mock surveillance alerts data:', error);
      const { getMockAlertsPage } = await import('../utils/mockAlerts');
      return getMockAlertsPage(page, limit, filters || {});
    }
  },

  async updateSurveillanceAlert(
    alertId: number,
    update: AlertUpdateRequest
  ): Promise<{ ok: boolean; data?: SurveillanceAlert }> {
    const res = await apiRequest('PATCH', `/api/v1/surveillance/alerts/${alertId}`, update);
    return res.json();
  },

  async getSurveillanceAlert(alertId: number): Promise<{ ok: boolean; data?: SurveillanceAlert }> {
    const res = await apiRequest('GET', `/api/v1/surveillance/alerts/${alertId}`);
    return res.json();
  },

  async getStats(): Promise<StatsResponse> {
    const res = await apiRequest('GET', '/api/v1/stats');
    return res.json();
  },
};
