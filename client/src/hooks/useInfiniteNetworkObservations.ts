/**
 * useInfiniteNetworkObservations - Infinite scroll for network observations
 *
 * Queries locations_legacy table via /api/v1/networks?group_by_bssid=1
 * This is the TRUTH source with full SSID history and observation data
 */

import { useInfiniteQuery } from '@tanstack/react-query';

export interface NetworkObservation {
  id: string;
  bssid: string;
  ssid: string | null;
  type: string; // W, B, E, L, G
  frequency: number | null;
  channel: number | null;
  encryption: string | null;
  latitude: string | undefined;
  longitude: string | undefined;
  altitude: number | null;
  accuracy: number | null;
  observed_at: string;
  signal_strength: number | null;
  observation_count: number;
  manufacturer: string | null;
}

export interface NetworkFilters {
  search?: string;
  radioTypes?: string[];
  minSignal?: number;
  maxSignal?: number;
  minFreq?: number;
  maxFreq?: number;
  dateStart?: string;
  dateEnd?: string;
  securityTypes?: string[];
  radiusLat?: number;
  radiusLng?: number;
  radiusMeters?: number;
}

interface NetworksResponse {
  ok: boolean;
  mode: string;
  count: number;
  total_count: number;
  data: NetworkObservation[];
}

interface UseInfiniteNetworkObservationsOptions {
  filters?: NetworkFilters;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Fetch network observations with pagination
 */
async function fetchNetworkObservations({
  pageParam = 0,
  filters = {},
  pageSize = 500,
}: {
  pageParam?: number;
  filters?: NetworkFilters;
  pageSize?: number;
}): Promise<NetworksResponse> {
  const params = new URLSearchParams({
    group_by_bssid: '1', // Group by BSSID for unique networks with observation counts
    limit: pageSize.toString(),
    offset: pageParam.toString(),
  });

  // Add filters
  if (filters.search) {
    params.append('search', filters.search);
  }

  if (filters.radioTypes && filters.radioTypes.length > 0) {
    const codeMap: Record<string, string> = {
      'WiFi': 'W',
      'Cellular': 'C',
      'Bluetooth': 'B',
      'BLE': 'E'
    };
    console.log('[DEBUG] radioTypes input:', filters.radioTypes);
    console.log('[DEBUG] codeMap:', codeMap);
    const codes = filters.radioTypes.map(type => codeMap[type] || type).join(',');
    console.log('[DEBUG] mapped codes:', codes);
    params.append('radio_types', codes);
  }

  if (filters.minSignal !== undefined) {
    params.append('min_signal', filters.minSignal.toString());
  }

  if (filters.maxSignal !== undefined) {
    params.append('max_signal', filters.maxSignal.toString());
  }

  if (filters.minFreq !== undefined) {
    params.append('min_freq', filters.minFreq.toString());
  }

  if (filters.maxFreq !== undefined) {
    params.append('max_freq', filters.maxFreq.toString());
  }

  if (filters.dateStart) {
    params.append('date_start', filters.dateStart);
  }

  if (filters.dateEnd) {
    params.append('date_end', filters.dateEnd);
  }

  if (filters.securityTypes && filters.securityTypes.length > 0) {
    params.append('security_types', filters.securityTypes.join(','));
  }

  if (filters.radiusLat !== undefined && filters.radiusLng !== undefined && filters.radiusMeters !== undefined) {
    params.append('radius_lat', filters.radiusLat.toString());
    params.append('radius_lng', filters.radiusLng.toString());
    params.append('radius_meters', filters.radiusMeters.toString());
  }

  const response = await fetch(`/api/v1/networks?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch network observations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for infinite scrolling network observations
 */
export function useInfiniteNetworkObservations({
  filters = {},
  pageSize = 500,
  enabled = true,
}: UseInfiniteNetworkObservationsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['network-observations', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      fetchNetworkObservations({ pageParam, filters, pageSize }),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.count, 0);

      // If we've loaded everything, return undefined
      if (loadedCount >= lastPage.total_count) {
        return undefined;
      }

      // Otherwise, return next offset
      return loadedCount;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper to flatten all pages into a single array
 */
export function flattenNetworkObservations(pages: NetworksResponse[] | undefined): NetworkObservation[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}

/**
 * Helper to get total count from response
 */
export function getTotalNetworkCount(pages: NetworksResponse[] | undefined): number {
  if (!pages || pages.length === 0) return 0;
  return pages[0].total_count;
}
