/**
 * useColumnPreferences - Manage column visibility preferences
 *
 * Stores and retrieves column visibility preferences from localStorage
 * with support for grouped columns and reset to defaults.
 */

import { useState, useEffect, useCallback } from 'react';

export type ColumnGroup =
  | 'core'
  | 'network'
  | 'manufacturer'
  | 'statistics'
  | 'temporal'
  | 'location';

export interface ColumnConfig {
  id: string;
  label: string;
  group: ColumnGroup;
  defaultVisible: boolean;
  alwaysVisible?: boolean; // Core columns that can't be hidden
  description?: string;
}

/**
 * All available columns with their configuration
 */
export const COLUMN_DEFINITIONS: ColumnConfig[] = [
  // Core columns (always visible)
  {
    id: 'mac_address',
    label: 'MAC Address',
    group: 'core',
    defaultVisible: true,
    alwaysVisible: true,
    description: 'Hardware address identifier',
  },
  {
    id: 'current_network_name',
    label: 'Network Name (SSID)',
    group: 'core',
    defaultVisible: true,
    alwaysVisible: true,
    description: 'Broadcast network name',
  },
  {
    id: 'radio_technology',
    label: 'Radio Technology',
    group: 'core',
    defaultVisible: true,
    alwaysVisible: true,
    description: 'WiFi, Bluetooth, Cellular',
  },
  {
    id: 'max_signal_observed_dbm',
    label: 'Signal Strength',
    group: 'core',
    defaultVisible: true,
    alwaysVisible: true,
    description: 'Maximum observed signal in dBm',
  },

  // Network properties
  {
    id: 'primary_frequency_hz',
    label: 'Frequency',
    group: 'network',
    defaultVisible: true,
    description: 'Primary operating frequency',
  },
  {
    id: 'is_hidden_network',
    label: 'Hidden Network',
    group: 'network',
    defaultVisible: false,
    description: 'Network broadcasts SSID',
  },
  {
    id: 'data_quality',
    label: 'Data Quality',
    group: 'network',
    defaultVisible: true,
    description: 'Quality based on observations',
  },

  // Manufacturer data
  {
    id: 'manufacturer',
    label: 'Manufacturer',
    group: 'manufacturer',
    defaultVisible: true,
    description: 'Device manufacturer from OUI',
  },
  {
    id: 'oui_prefix_hex',
    label: 'OUI Prefix',
    group: 'manufacturer',
    defaultVisible: false,
    description: 'Organizationally Unique Identifier',
  },

  // Mobility indicators
  {
    id: 'is_mobile_device',
    label: 'Mobile Device',
    group: 'statistics',
    defaultVisible: false,
    description: 'Detected as mobile/portable',
  },
  {
    id: 'mobility_confidence_score',
    label: 'Mobility Score',
    group: 'statistics',
    defaultVisible: false,
    description: 'Confidence in mobility classification',
  },

  // Statistics
  {
    id: 'total_observations',
    label: 'Total Observations',
    group: 'statistics',
    defaultVisible: true,
    description: 'Number of times observed',
  },
  {
    id: 'unique_data_sources',
    label: 'Data Sources',
    group: 'statistics',
    defaultVisible: false,
    description: 'Number of unique sources',
  },

  // Temporal data
  {
    id: 'first_seen',
    label: 'First Seen',
    group: 'temporal',
    defaultVisible: false,
    description: 'First observation timestamp',
  },
  {
    id: 'last_seen',
    label: 'Last Seen',
    group: 'temporal',
    defaultVisible: true,
    description: 'Most recent observation',
  },
  {
    id: 'record_created_at',
    label: 'Record Created',
    group: 'temporal',
    defaultVisible: false,
    description: 'Database record creation time',
  },
  {
    id: 'record_updated_at',
    label: 'Record Updated',
    group: 'temporal',
    defaultVisible: false,
    description: 'Last database update time',
  },

  // Location data
  {
    id: 'location',
    label: 'Location',
    group: 'location',
    defaultVisible: false,
    description: 'GPS coordinates',
  },
];

const STORAGE_KEY = 'shadowcheck_column_preferences';

interface ColumnVisibility {
  [columnId: string]: boolean;
}

/**
 * Get default column visibility settings
 */
function getDefaultVisibility(): ColumnVisibility {
  const visibility: ColumnVisibility = {};
  COLUMN_DEFINITIONS.forEach((col) => {
    visibility[col.id] = col.defaultVisible;
  });
  return visibility;
}

/**
 * Load column preferences from localStorage
 */
function loadPreferences(): ColumnVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new columns
      return { ...getDefaultVisibility(), ...parsed };
    }
  } catch (error) {
    console.error('Failed to load column preferences:', error);
  }
  return getDefaultVisibility();
}

/**
 * Save column preferences to localStorage
 */
function savePreferences(preferences: ColumnVisibility): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save column preferences:', error);
  }
}

/**
 * Hook for managing column visibility preferences
 */
export function useColumnPreferences() {
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(loadPreferences);

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    savePreferences(columnVisibility);
  }, [columnVisibility]);

  /**
   * Toggle a single column's visibility
   */
  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => {
      // Don't allow toggling always-visible columns
      const column = COLUMN_DEFINITIONS.find((c) => c.id === columnId);
      if (column?.alwaysVisible) {
        return prev;
      }

      return {
        ...prev,
        [columnId]: !prev[columnId],
      };
    });
  }, []);

  /**
   * Set visibility for a specific column
   */
  const setColumnVisible = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => {
      // Don't allow hiding always-visible columns
      const column = COLUMN_DEFINITIONS.find((c) => c.id === columnId);
      if (column?.alwaysVisible && !visible) {
        return prev;
      }

      return {
        ...prev,
        [columnId]: visible,
      };
    });
  }, []);

  /**
   * Show all columns
   */
  const showAllColumns = useCallback(() => {
    const allVisible: ColumnVisibility = {};
    COLUMN_DEFINITIONS.forEach((col) => {
      allVisible[col.id] = true;
    });
    setColumnVisibility(allVisible);
  }, []);

  /**
   * Hide all non-core columns
   */
  const hideAllColumns = useCallback(() => {
    const onlyCoreVisible: ColumnVisibility = {};
    COLUMN_DEFINITIONS.forEach((col) => {
      onlyCoreVisible[col.id] = col.alwaysVisible || false;
    });
    setColumnVisibility(onlyCoreVisible);
  }, []);

  /**
   * Reset to default visibility settings
   */
  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultVisibility();
    setColumnVisibility(defaults);
  }, []);

  /**
   * Get list of visible columns
   */
  const visibleColumns = useCallback(() => {
    return COLUMN_DEFINITIONS.filter((col) => columnVisibility[col.id]).map((col) => col.id);
  }, [columnVisibility]);

  /**
   * Get columns grouped by category
   */
  const columnsByGroup = useCallback(() => {
    const grouped: Partial<Record<ColumnGroup, ColumnConfig[]>> = {};

    COLUMN_DEFINITIONS.forEach((col) => {
      if (!grouped[col.group]) {
        grouped[col.group] = [];
      }
      grouped[col.group]!.push(col);
    });

    return grouped;
  }, []);

  /**
   * Check if a column is visible
   */
  const isColumnVisible = useCallback(
    (columnId: string): boolean => {
      return columnVisibility[columnId] ?? false;
    },
    [columnVisibility]
  );

  /**
   * Get count of visible columns
   */
  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisible,
    showAllColumns,
    hideAllColumns,
    resetToDefaults,
    visibleColumns,
    columnsByGroup,
    isColumnVisible,
    visibleCount,
    totalCount: COLUMN_DEFINITIONS.length,
  };
}
