/**
 * Unified Filter System for ShadowCheck
 *
 * Provides consistent filtering across Network Observations and Access Points views.
 * Supports:
 * - Radio type filtering (WiFi, Bluetooth, BLE, Cellular)
 * - Field-based filtering (signal strength, security, manufacturer, etc.)
 * - Search filtering (SSID/BSSID)
 * - Spatial filtering (bbox, radius)
 */

export type RadioTypeFilter = 'wifi' | 'bluetooth' | 'ble' | 'cellular';

export interface FieldFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: any;
}

export interface UnifiedFilters {
  // Text search
  search?: string;

  // Radio type filter
  radioTypes?: RadioTypeFilter[];

  // Signal strength range
  minSignal?: number;
  maxSignal?: number;

  // Date range
  dateStart?: string;
  dateEnd?: string;

  // Security types
  securityTypes?: string[];

  // Data quality (for access points)
  dataQuality?: ('high' | 'medium' | 'low')[];

  // Encryption types
  encryption?: string[];

  // Manufacturer
  manufacturers?: string[];

  // Boolean flags
  hiddenOnly?: boolean;
  mobileOnly?: boolean;

  // Spatial filters
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  radiusSearch?: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };

  // Advanced field filters
  customFilters?: FieldFilter[];
}

/**
 * Convert unified filters to API query parameters
 */
export function filtersToQueryParams(filters: UnifiedFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.radioTypes && filters.radioTypes.length > 0) {
    params.radio_types = filters.radioTypes.join(',');
  }

  if (filters.minSignal !== undefined) {
    params.min_signal = filters.minSignal.toString();
  }

  if (filters.maxSignal !== undefined) {
    params.max_signal = filters.maxSignal.toString();
  }

  if (filters.dataQuality && filters.dataQuality.length > 0) {
    params.data_quality = filters.dataQuality.join(',');
  }

  if (filters.encryption && filters.encryption.length > 0) {
    params.encryption = filters.encryption.join(',');
  }

  if (filters.bbox) {
    params.bbox = filters.bbox.join(',');
  }

  if (filters.radiusSearch) {
    params.radius_lat = filters.radiusSearch.lat.toString();
    params.radius_lng = filters.radiusSearch.lng.toString();
    params.radius_meters = filters.radiusSearch.radiusMeters.toString();
  }

  return params;
}

/**
 * Count active filters (for UI badges)
 */
export function countActiveFilters(filters: UnifiedFilters): number {
  let count = 0;

  if (filters.search) count++;
  if (filters.radioTypes && filters.radioTypes.length > 0) count++;
  if (filters.minSignal !== undefined || filters.maxSignal !== undefined) count++;
  if (filters.dateStart || filters.dateEnd) count++;
  if (filters.dataQuality && filters.dataQuality.length > 0) count++;
  if (filters.encryption && filters.encryption.length > 0) count++;
  if (filters.manufacturers && filters.manufacturers.length > 0) count++;
  if (filters.hiddenOnly) count++;
  if (filters.mobileOnly) count++;
  if (filters.bbox) count++;
  if (filters.radiusSearch) count++;
  if (filters.customFilters && filters.customFilters.length > 0) {
    count += filters.customFilters.length;
  }

  return count;
}

/**
 * Clear all filters
 */
export function clearAllFilters(): UnifiedFilters {
  return {};
}

/**
 * Merge filters (for updating specific filter values)
 */
export function mergeFilters(
  current: UnifiedFilters,
  updates: Partial<UnifiedFilters>
): UnifiedFilters {
  return { ...current, ...updates };
}

/**
 * Validate signal range
 */
export function validateSignalRange(
  min: number | undefined,
  max: number | undefined
): { valid: boolean; error?: string } {
  if (min !== undefined && max !== undefined && min > max) {
    return { valid: false, error: 'Minimum signal must be less than maximum signal' };
  }

  if (min !== undefined && (min < -120 || min > 0)) {
    return { valid: false, error: 'Signal strength must be between -120 and 0 dBm' };
  }

  if (max !== undefined && (max < -120 || max > 0)) {
    return { valid: false, error: 'Signal strength must be between -120 and 0 dBm' };
  }

  return { valid: true };
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(filters: UnifiedFilters): string[] {
  const summary: string[] = [];

  if (filters.search) {
    summary.push(`Search: "${filters.search}"`);
  }

  if (filters.radioTypes && filters.radioTypes.length > 0) {
    summary.push(`Radio: ${filters.radioTypes.join(', ')}`);
  }

  if (filters.minSignal !== undefined || filters.maxSignal !== undefined) {
    const min = filters.minSignal ?? -120;
    const max = filters.maxSignal ?? 0;
    summary.push(`Signal: ${min} to ${max} dBm`);
  }

  if (filters.dataQuality && filters.dataQuality.length > 0) {
    summary.push(`Quality: ${filters.dataQuality.join(', ')}`);
  }

  if (filters.encryption && filters.encryption.length > 0) {
    summary.push(`Security: ${filters.encryption.join(', ')}`);
  }

  if (filters.hiddenOnly) {
    summary.push('Hidden networks only');
  }

  if (filters.mobileOnly) {
    summary.push('Mobile devices only');
  }

  if (filters.bbox) {
    summary.push('Bounding box filter active');
  }

  if (filters.radiusSearch) {
    summary.push(`Radius: ${filters.radiusSearch.radiusMeters}m`);
  }

  return summary;
}

/**
 * Preset filter configurations
 */
export const FILTER_PRESETS = {
  strongSignals: {
    minSignal: -60,
    maxSignal: 0,
  } as UnifiedFilters,

  wifiOnly: {
    radioTypes: ['wifi'],
  } as UnifiedFilters,

  bluetoothOnly: {
    radioTypes: ['bluetooth', 'ble'],
  } as UnifiedFilters,

  secureNetworks: {
    encryption: ['WPA2', 'WPA3'],
  } as UnifiedFilters,

  openNetworks: {
    encryption: ['None'],
  } as UnifiedFilters,

  highQuality: {
    dataQuality: ['high'],
  } as UnifiedFilters,
};
