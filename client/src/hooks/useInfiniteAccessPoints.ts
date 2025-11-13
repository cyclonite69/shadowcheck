/**
 * useInfiniteAccessPoints - Infinite scroll pagination for access points
 *
 * Fetches paginated access point data from /api/v1/access-points
 * with automatic pagination when scrolling reaches the bottom.
 *
 * Features:
 * - TanStack Query infinite query
 * - Automatic page fetching on scroll
 * - Filter support (search, radio types, signal range, etc.)
 * - Column selection support
 * - Total count tracking
 */

import { useInfiniteQuery } from '@tanstack/react-query';

export interface AccessPointFilters {
  search?: string;
  radioTypes?: string[];
  minSignal?: number;
  maxSignal?: number;
  dataQuality?: string[];
  encryption?: string[]; // Encryption type filter (None, WEP, WPA, WPA2, WPA3, Unknown)
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  radiusSearch?: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
}

export interface AccessPoint {
  access_point_id: number;
  mac_address: string;
  current_network_name: string | null;
  radio_technology: string;
  manufacturer: string | null;
  oui_prefix_hex: string | null;
  is_hidden_network: boolean;
  is_mobile_device: boolean;
  primary_frequency_hz: number | null;
  max_signal_observed_dbm: number | null;
  mobility_confidence_score: number | null;
  total_observations: number;
  unique_data_sources: number;
  data_quality: 'high' | 'medium' | 'low';
  first_seen: string;
  last_seen: string;
  record_created_at: string;
  record_updated_at: string;
  location_geojson: {
    type: string;
    coordinates: [number, number];
  } | null;
  most_recent_encryption: string | null;
}

interface AccessPointsResponse {
  ok: boolean;
  data: AccessPoint[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    returned: number;
  };
}

interface UseInfiniteAccessPointsOptions {
  filters?: AccessPointFilters;
  columns?: string[];
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Fetch access points with pagination
 */
async function fetchAccessPoints({
  pageParam = 0,
  filters = {},
  columns = [],
  pageSize = 500,
}: {
  pageParam?: number;
  filters?: AccessPointFilters;
  columns?: string[];
  pageSize?: number;
}): Promise<AccessPointsResponse> {
  const params = new URLSearchParams({
    limit: pageSize.toString(),
    offset: pageParam.toString(),
  });

  // Add column selection
  if (columns.length > 0) {
    params.append('columns', columns.join(','));
  }

  // Add filters
  if (filters.search) {
    params.append('search', filters.search);
  }

  if (filters.radioTypes && filters.radioTypes.length > 0) {
    params.append('radio_types', filters.radioTypes.join(','));
  }

  if (filters.minSignal !== undefined) {
    params.append('min_signal', filters.minSignal.toString());
  }

  if (filters.maxSignal !== undefined) {
    params.append('max_signal', filters.maxSignal.toString());
  }

  if (filters.dataQuality && filters.dataQuality.length > 0) {
    params.append('data_quality', filters.dataQuality.join(','));
  }

  if (filters.encryption && filters.encryption.length > 0) {
    params.append('encryption', filters.encryption.join(','));
  }

  // Add spatial filters
  if (filters.bbox) {
    params.append('bbox', filters.bbox.join(','));
  }

  if (filters.radiusSearch) {
    params.append('radius_lat', filters.radiusSearch.lat.toString());
    params.append('radius_lng', filters.radiusSearch.lng.toString());
    params.append('radius_meters', filters.radiusSearch.radiusMeters.toString());
  }

  const response = await fetch(`/api/v1/access-points?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch access points: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for infinite scrolling access points data
 */
export function useInfiniteAccessPoints({
  filters = {},
  columns = [],
  pageSize = 500,
  enabled = true,
}: UseInfiniteAccessPointsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['access-points', filters, columns, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      fetchAccessPoints({ pageParam, filters, columns, pageSize }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.metadata.hasMore) {
        return undefined;
      }
      return lastPage.metadata.offset + lastPage.metadata.limit;
    },
    initialPageParam: 0,
    enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus for performance
  });
}

/**
 * Helper to flatten all pages into a single array
 */
export function flattenAccessPoints(pages: AccessPointsResponse[] | undefined): AccessPoint[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}

/**
 * Helper to get total count from response
 */
export function getTotalCount(pages: AccessPointsResponse[] | undefined): number {
  if (!pages || pages.length === 0) return 0;
  return pages[0].metadata.total;
}
