/**
 * Unified Column Definitions for ShadowCheck
 *
 * This module provides standardized column definitions that work across:
 * - Network Observations (raw observations from locations_legacy)
 * - Access Points (aggregated networks from wireless_access_points)
 * - Any other table views
 *
 * The goal is to have consistent column naming, formatting, and behavior
 * across all views while supporting both observation-level and aggregated data.
 */

export type RadioType = 'wifi' | 'bluetooth' | 'ble' | 'cellular' | 'unknown';

export interface UnifiedColumnConfig {
  id: string;
  label: string;
  description: string;
  category: 'identity' | 'radio' | 'location' | 'temporal' | 'metadata';
  width?: number;
  sortable: boolean;
  filterable: boolean;
  defaultVisible: boolean;
  /** Field name in observation data */
  observationField?: string | null;
  /** Field name in access point data */
  accessPointField?: string | null;
  /** Custom formatter function */
  formatter?: (value: any, row?: any) => string;
}

/**
 * Standardized column definitions
 * These columns work for both observations and aggregated access points
 */
export const UNIFIED_COLUMNS: UnifiedColumnConfig[] = [
  // IDENTITY COLUMNS
  {
    id: 'radio_type',
    label: 'TYPE',
    description: 'Radio technology (WiFi, Bluetooth, BLE, Cellular)',
    category: 'radio',
    width: 80,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'type',
    accessPointField: 'radio_technology',
  },
  {
    id: 'ssid',
    label: 'SSID / NAME',
    description: 'Network name (SSID for WiFi, device name for BT)',
    category: 'identity',
    width: 180,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'ssid',
    accessPointField: 'current_network_name',
  },
  {
    id: 'bssid',
    label: 'BSSID / MAC',
    description: 'Hardware MAC address',
    category: 'identity',
    width: 160,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'bssid',
    accessPointField: 'mac_address',
  },
  {
    id: 'manufacturer',
    label: 'MANUFACTURER',
    description: 'Device manufacturer (from OUI lookup)',
    category: 'identity',
    width: 140,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'manufacturer',
    accessPointField: 'manufacturer',
  },

  // RADIO COLUMNS
  {
    id: 'signal',
    label: 'SIGNAL',
    description: 'Signal strength in dBm',
    category: 'radio',
    width: 90,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'signal_strength',
    accessPointField: 'max_signal_observed_dbm',
  },
  {
    id: 'frequency',
    label: 'FREQUENCY',
    description: 'Operating frequency in MHz/GHz',
    category: 'radio',
    width: 110,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'frequency',
    accessPointField: 'primary_frequency_hz',
  },
  {
    id: 'channel',
    label: 'CHANNEL',
    description: 'WiFi channel number',
    category: 'radio',
    width: 80,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'channel',
    accessPointField: null, // Not available in access points
  },
  {
    id: 'security',
    label: 'SECURITY',
    description: 'Encryption/security type',
    category: 'radio',
    width: 200,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: 'encryption',
    accessPointField: 'most_recent_encryption',
  },

  // TEMPORAL COLUMNS
  {
    id: 'first_seen',
    label: 'FIRST SEEN',
    description: 'First observation timestamp',
    category: 'temporal',
    width: 160,
    sortable: true,
    filterable: false,
    defaultVisible: true,
    observationField: 'observed_at', // For observations, this is the timestamp
    accessPointField: 'first_seen',
  },
  {
    id: 'last_seen',
    label: 'LAST SEEN',
    description: 'Most recent observation timestamp',
    category: 'temporal',
    width: 160,
    sortable: true,
    filterable: false,
    defaultVisible: true,
    observationField: 'observed_at', // For observations, same as first_seen
    accessPointField: 'last_seen',
  },

  // METADATA COLUMNS
  {
    id: 'observations',
    label: 'OBS',
    description: 'Number of observations',
    category: 'metadata',
    width: 60,
    sortable: true,
    filterable: true,
    defaultVisible: true,
    observationField: null, // Always 1 for individual observations
    accessPointField: 'total_observations',
  },
  {
    id: 'sources',
    label: 'SOURCES',
    description: 'Number of unique data sources',
    category: 'metadata',
    width: 80,
    sortable: true,
    filterable: false,
    defaultVisible: false,
    observationField: null,
    accessPointField: 'unique_data_sources',
  },
  {
    id: 'mobility',
    label: 'MOBILITY',
    description: 'Mobility confidence score',
    category: 'metadata',
    width: 90,
    sortable: true,
    filterable: false,
    defaultVisible: false,
    observationField: null,
    accessPointField: 'mobility_confidence_score',
  },
  {
    id: 'data_quality',
    label: 'QUALITY',
    description: 'Data quality rating',
    category: 'metadata',
    width: 80,
    sortable: true,
    filterable: true,
    defaultVisible: false,
    observationField: null,
    accessPointField: 'data_quality',
  },

  // LOCATION COLUMNS
  {
    id: 'latitude',
    label: 'LATITUDE',
    description: 'GPS latitude coordinate',
    category: 'location',
    width: 100,
    sortable: true,
    filterable: false,
    defaultVisible: true,
    observationField: 'lat',
    accessPointField: 'location_geojson', // Needs extraction
  },
  {
    id: 'longitude',
    label: 'LONGITUDE',
    description: 'GPS longitude coordinate',
    category: 'location',
    width: 100,
    sortable: true,
    filterable: false,
    defaultVisible: true,
    observationField: 'lon',
    accessPointField: 'location_geojson', // Needs extraction
  },
  {
    id: 'altitude',
    label: 'ALTITUDE',
    description: 'Elevation in meters',
    category: 'location',
    width: 80,
    sortable: true,
    filterable: false,
    defaultVisible: false,
    observationField: 'altitude',
    accessPointField: null,
  },
  {
    id: 'accuracy',
    label: 'ACC',
    description: 'GPS accuracy in meters',
    category: 'location',
    width: 70,
    sortable: true,
    filterable: false,
    defaultVisible: false,
    observationField: 'accuracy',
    accessPointField: null,
  },

  // ADDITIONAL IDENTITY COLUMNS
  {
    id: 'oui',
    label: 'OUI',
    description: 'Organizationally Unique Identifier',
    category: 'identity',
    width: 100,
    sortable: true,
    filterable: false,
    defaultVisible: false,
    observationField: null,
    accessPointField: 'oui_prefix_hex',
  },
  {
    id: 'is_hidden',
    label: 'HIDDEN',
    description: 'Hidden SSID network',
    category: 'identity',
    width: 70,
    sortable: true,
    filterable: true,
    defaultVisible: false,
    observationField: null, // Can derive from empty SSID
    accessPointField: 'is_hidden_network',
  },
  {
    id: 'is_mobile',
    label: 'MOBILE',
    description: 'Mobile/portable device',
    category: 'identity',
    width: 70,
    sortable: true,
    filterable: true,
    defaultVisible: false,
    observationField: null,
    accessPointField: 'is_mobile_device',
  },
];

/**
 * Get columns filtered by category
 */
export function getColumnsByCategory(category: UnifiedColumnConfig['category']): UnifiedColumnConfig[] {
  return UNIFIED_COLUMNS.filter(col => col.category === category);
}

/**
 * Get default visible columns
 */
export function getDefaultVisibleColumns(): UnifiedColumnConfig[] {
  return UNIFIED_COLUMNS.filter(col => col.defaultVisible);
}

/**
 * Get column by ID
 */
export function getColumnById(id: string): UnifiedColumnConfig | undefined {
  return UNIFIED_COLUMNS.find(col => col.id === id);
}

/**
 * Format value based on column type
 */
export function formatColumnValue(columnId: string, value: any, row?: any): string {
  const column = getColumnById(columnId);

  if (!column) return String(value ?? '-');

  // Use custom formatter if available
  if (column.formatter) {
    return column.formatter(value, row);
  }

  // Default formatters based on column ID
  switch (columnId) {
    case 'signal':
      return value !== null && value !== undefined ? `${value} dBm` : '-';

    case 'frequency':
      if (!value) return '-';
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(3)} GHz`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(3)} GHz`;
      }
      return `${value} MHz`;

    case 'latitude':
    case 'longitude':
      return value !== null && value !== undefined ? value.toFixed(6) : '-';

    case 'altitude':
      return value !== null && value !== undefined ? `${value.toFixed(1)}m` : '-';

    case 'accuracy':
      return value !== null && value !== undefined ? `${value.toFixed(1)}` : '-';

    case 'mobility':
      return value !== null && value !== undefined ? `${(value * 100).toFixed(0)}%` : '-';

    case 'is_hidden':
    case 'is_mobile':
      return value ? '✓' : '';

    case 'first_seen':
    case 'last_seen':
      return value ? formatTimestamp(value) : '-';

    case 'ssid':
      return value || '<Hidden>';

    case 'bssid':
      return value ? value.toUpperCase() : '-';

    case 'security':
      // Standardize security format
      if (!value) return 'Unknown';
      // Already formatted (e.g., [WPA-PSK-CCMP]...)
      if (value.includes('[') && value.includes(']')) return value;
      // Simple format (e.g., WPA2)
      return value;

    default:
      return value !== null && value !== undefined ? String(value) : '-';
  }
}

/**
 * Format timestamp to YYYY-MM-DD HH:mm:ss
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}

/**
 * Extract value from row data based on view mode
 */
export function extractColumnValue(
  columnId: string,
  row: Record<string, any>,
  viewMode: 'observations' | 'access-points'
): any {
  const column = getColumnById(columnId);
  if (!column) return null;

  const fieldName = viewMode === 'observations'
    ? column.observationField
    : column.accessPointField;

  if (!fieldName) {
    // Handle special cases for derived values
    if (columnId === 'observations' && viewMode === 'observations') {
      return 1; // Individual observations always count as 1
    }
    if (columnId === 'is_hidden' && viewMode === 'observations') {
      return !row['ssid'] || row['ssid'].trim() === '';
    }
    return null;
  }

  // Handle nested fields (e.g., location_geojson.coordinates)
  if (fieldName === 'location_geojson') {
    if (columnId === 'latitude') {
      return row['location_geojson']?.coordinates?.[1] ?? null;
    }
    if (columnId === 'longitude') {
      return row['location_geojson']?.coordinates?.[0] ?? null;
    }
  }

  return row[fieldName];
}
