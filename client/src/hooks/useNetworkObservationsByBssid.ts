/**
 * useNetworkObservationsByBssid - Fetch ALL observations for specific BSSIDs
 *
 * Used to get every observation point for selected networks to display on map
 */

import { useQuery } from '@tanstack/react-query';
import { type NetworkObservation } from '@/types';

interface ObservationsResponse {
  ok: boolean;
  count: number;
  data: NetworkObservation[];
}

/**
 * Fetch all observations for given BSSIDs (ungrouped - every observation point)
 */
async function fetchObservationsByBssids(bssids: string[]): Promise<NetworkObservation[]> {
  if (bssids.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    bssids: bssids.join(','),
    limit: '10000', // High limit to get all observations
  });

  const response = await fetch(`/api/v1/access-points/observations/bulk?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch observations: ${response.statusText}`);
  }

  const data: ObservationsResponse = await response.json();
  return data.data || [];
}

/**
 * Hook to fetch all observation points for selected BSSIDs
 */
export function useNetworkObservationsByBssid(bssids: string[]) {
  return useQuery({
    queryKey: ['network-observations-by-bssid', bssids.sort().join(',')],
    queryFn: () => fetchObservationsByBssids(bssids),
    enabled: bssids.length > 0,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}
