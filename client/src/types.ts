export interface NetworkObservation {
  bssid: string;
  ssid: string | null;
  type: string;
  frequency: number;
  channel: number;
  encryption: string;
  signal_strength: number | null;
  latitude: number | string;
  longitude: number | string;
  altitude: number | null;
  accuracy: number | null;
  observed_at: string;
  observation_count: number;
  manufacturer: string;
  capabilities: string;
  // Add other fields as needed
}

export function flattenNetworkObservations(data: any[] | undefined): NetworkObservation[] {
  return data?.flatMap(page => page.data || []) || [];
}

export function getTotalNetworkCount(data: any[] | undefined): number {
  return data?.reduce((sum, page) => sum + (page.count || 0), 0) || 0;
}