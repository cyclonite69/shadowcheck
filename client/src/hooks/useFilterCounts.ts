/**
 * useFilterCounts - Fetch observation counts for filter options
 * Used to sort filter dropdowns by popularity (observation count)
 */

import { useQuery } from '@tanstack/react-query';
import { categorizeSecurityType } from '@/lib/securityDecoder';

interface RadioTypeCount {
  type: string;
  count: number;
}

interface SecurityTypeCount {
  capabilities: string | null;
  type: string | null;
  count: number;
}

interface FilterCountsResponse {
  ok: boolean;
  data: {
    radio_types: RadioTypeCount[];
    security_types: SecurityTypeCount[];
  };
}

export function useFilterCounts(mode: string = 'locations_legacy') {
  return useQuery({
    queryKey: ['filter-counts', mode],
    queryFn: async () => {
      const res = await fetch(`/api/v1/federated/filter-counts?mode=${mode}`);
      const json: FilterCountsResponse = await res.json();

      if (!json.ok) {
        throw new Error('Failed to fetch filter counts');
      }

      // Process security types to match frontend categorization
      const securityCountMap = new Map<string, number>();

      json.data.security_types.forEach(({ capabilities, type, count }) => {
        const securityType = categorizeSecurityType(capabilities ?? undefined, type ?? undefined);
        const currentCount = securityCountMap.get(securityType) || 0;
        securityCountMap.set(securityType, currentCount + count);
      });

      // Convert to sorted arrays
      const radioTypes = json.data.radio_types
        .sort((a, b) => b.count - a.count);

      const securityTypes = Array.from(securityCountMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      return {
        radioTypes,
        securityTypes,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
