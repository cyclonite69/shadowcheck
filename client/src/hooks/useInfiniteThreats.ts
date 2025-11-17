/**
 * useInfiniteThreats - Infinite scroll for WiFi surveillance threats
 *
 * Fetches threats from /api/v1/surveillance/wifi/threats with pagination support
 */

import { useInfiniteQuery } from '@tanstack/react-query';

export interface ThreatFilters {
  minDistanceKm?: number;
  homeRadiusM?: number;
  minHomeSightings?: number;
}

interface ThreatObservation {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  signal_strength: number;
  timestamp_ms: number;
  observed_at: string;
  ssid: string;
  frequency: number;
  capabilities: string;
  radio_type: string;
  distance_from_home_km: string;
}

export interface Threat {
  bssid: string;
  ssid: string;
  radio_band: string;
  total_sightings: number;
  home_sightings: number;
  away_sightings: number;
  max_distance_km: number;
  threat_level: string;
  threat_description: string;
  confidence_score: number;
  is_mobile_hotspot: boolean;
  // Relevance scoring fields
  distinct_dates: number;
  distinct_locations: number;
  time_span_days: string;
  seen_both_home_and_away: boolean;
  relevance_score: number;
  relevance_label: string;
  observations: ThreatObservation[];
}

interface ThreatsResponse {
  ok: boolean;
  count: number;
  total_count: number;
  offset: number;
  limit: number;
  responseTime: string;
  data: Threat[];
}

interface UseInfiniteThreatsOptions {
  filters?: ThreatFilters;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Fetch threats with pagination
 */
async function fetchThreats({
  pageParam = 0,
  filters = {},
  pageSize = 100,
}: {
  pageParam?: number;
  filters?: ThreatFilters;
  pageSize?: number;
}): Promise<ThreatsResponse> {
  const params = new URLSearchParams({
    limit: pageSize.toString(),
    offset: pageParam.toString(),
  });

  // Add filters
  if (filters.minDistanceKm !== undefined) {
    params.append('min_distance_km', filters.minDistanceKm.toString());
  }

  if (filters.homeRadiusM !== undefined) {
    params.append('home_radius_m', filters.homeRadiusM.toString());
  }

  if (filters.minHomeSightings !== undefined) {
    params.append('min_home_sightings', filters.minHomeSightings.toString());
  }

  const response = await fetch(`/api/v1/surveillance/wifi/threats?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch threats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for infinite scrolling threats
 */
export function useInfiniteThreats({
  filters = {},
  pageSize = 100,
  enabled = true,
}: UseInfiniteThreatsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['surveillance-threats', filters, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      fetchThreats({ pageParam, filters, pageSize }),
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
    staleTime: 30000, // 30 seconds (match original refetchInterval)
    enabled,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper to flatten all threats from pages
 */
export function flattenThreats(pages: ThreatsResponse[] | undefined): Threat[] {
  if (!pages) return [];
  return pages.flatMap(page => page.data);
}

/**
 * Helper to get total count
 */
export function getTotalThreatCount(pages: ThreatsResponse[] | undefined): number {
  if (!pages || pages.length === 0) return 0;
  return pages[0].total_count;
}
