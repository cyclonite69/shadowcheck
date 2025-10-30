/**
 * useNetworkObservations - Fetch individual observations for a network
 *
 * Fetches from /api/v1/access-points/:mac/observations
 * Used when expanding network rows to show observation history
 */

import { useQuery } from '@tanstack/react-query';

export interface NetworkObservation {
  bssid: string;
  ssid: string | null;
  radio_type: string;
  encryption: string | null;
  frequency: number | null;
  signal_strength: number | null;
  latitude: number;
  longitude: number;
  observed_at: string;
  location_geojson: {
    type: string;
    coordinates: [number, number];
  };
}

interface ObservationsResponse {
  ok: boolean;
  data: NetworkObservation[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    returned: number;
    mac_address: string;
  };
}

/**
 * Hook to fetch observations for a specific network
 */
export function useNetworkObservations(macAddress: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['network-observations', macAddress],
    queryFn: async (): Promise<ObservationsResponse> => {
      const response = await fetch(
        `/api/v1/access-points/${encodeURIComponent(macAddress)}/observations?limit=100`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch observations: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: enabled && !!macAddress,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
