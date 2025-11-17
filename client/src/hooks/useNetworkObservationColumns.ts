/**
 * useNetworkObservationColumns - Column visibility for network observations
 *
 * Manages which columns are visible in the observations table
 */

import { useState, useEffect, useCallback } from 'react';

export interface ObservationColumn {
  id: string;
  label: string;
  defaultVisible: boolean;
  alwaysVisible?: boolean;
  description?: string;
  width: string; // Flexbox width (e.g., '100px' or 'flex-1')
}

export const OBSERVATION_COLUMNS: ObservationColumn[] = [
  // Core columns (always visible)
  { id: 'type', label: 'Type', defaultVisible: true, alwaysVisible: true, width: '80px', description: 'Radio technology' },
  { id: 'ssid', label: 'SSID', defaultVisible: true, alwaysVisible: true, width: '200px', description: 'Network name' },
  { id: 'bssid', label: 'BSSID', defaultVisible: true, alwaysVisible: true, width: '180px', description: 'MAC address' },
  { id: 'manufacturer', label: 'Manufacturer', defaultVisible: true, width: '200px', description: 'Device manufacturer (OUI lookup)' },
  { id: 'signal', label: 'Signal', defaultVisible: true, alwaysVisible: true, width: '100px', description: 'Signal strength' },

  // Optional columns
  { id: 'frequency', label: 'Frequency', defaultVisible: true, width: '120px', description: 'Operating frequency' },
  { id: 'channel', label: 'Channel', defaultVisible: false, width: '80px', description: 'WiFi channel number' },
  { id: 'security', label: 'Security', defaultVisible: true, width: '150px', description: 'Encryption type' },
  { id: 'latitude', label: 'Latitude', defaultVisible: false, width: '120px', description: 'GPS latitude' },
  { id: 'longitude', label: 'Longitude', defaultVisible: false, width: '120px', description: 'GPS longitude' },
  { id: 'altitude', label: 'Altitude', defaultVisible: false, width: '100px', description: 'Altitude in meters' },
  { id: 'accuracy', label: 'Accuracy', defaultVisible: false, width: '100px', description: 'GPS accuracy' },
  { id: 'observations', label: 'Observations', defaultVisible: true, width: '100px', description: 'Total observation count' },
  { id: 'seen', label: 'Last Seen', defaultVisible: true, width: 'flex-1', description: 'Most recent observation' },
];

const STORAGE_KEY = 'shadowcheck_observation_column_preferences';

interface ColumnVisibility {
  [columnId: string]: boolean;
}

function getDefaultVisibility(): ColumnVisibility {
  const visibility: ColumnVisibility = {};
  OBSERVATION_COLUMNS.forEach((col) => {
    visibility[col.id] = col.defaultVisible;
  });
  return visibility;
}

function loadPreferences(): ColumnVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultVisibility(), ...parsed };
    }
  } catch (error) {
    console.error('Failed to load column preferences:', error);
  }
  return getDefaultVisibility();
}

function savePreferences(preferences: ColumnVisibility): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save column preferences:', error);
  }
}

const COLUMN_ORDER_STORAGE_KEY = 'shadowcheck_column_order';

function loadColumnOrder(): string[] {
  try {
    const stored = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Basic validation to ensure it's an array of strings
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        // Migration: ensure 'select' column is always included
        if (!parsed.includes('select')) {
          // Add 'select' at the beginning if it's missing
          return ['select', ...parsed];
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load column order:', error);
  }
  // Include 'select' column in the default order (at the beginning)
  return ['select', ...OBSERVATION_COLUMNS.map(col => col.id)];
}

export function useNetworkObservationColumns() {
  const [columnOrder, setColumnOrder] = useState<string[]>(loadColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(loadPreferences);

  useEffect(() => {
    savePreferences(columnVisibility);
  }, [columnVisibility]);

  const toggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => {
      const column = OBSERVATION_COLUMNS.find((c) => c.id === columnId);
      if (column?.alwaysVisible) return prev;

      return {
        ...prev,
        [columnId]: !prev[columnId],
      };
    });
  }, []);

  const showAllColumns = useCallback(() => {
    const allVisible: ColumnVisibility = {};
    OBSERVATION_COLUMNS.forEach((col) => {
      allVisible[col.id] = true;
    });
    setColumnVisibility(allVisible);
  }, []);

  const hideAllColumns = useCallback(() => {
    const onlyCoreVisible: ColumnVisibility = {};
    OBSERVATION_COLUMNS.forEach((col) => {
      onlyCoreVisible[col.id] = col.alwaysVisible || false;
    });
    setColumnVisibility(onlyCoreVisible);
  }, []);

  const resetToDefaults = useCallback(() => {
    setColumnVisibility(getDefaultVisibility());
    setColumnOrder(['select', ...OBSERVATION_COLUMNS.map(col => col.id)]);
  }, []);

  const isColumnVisible = useCallback(
    (columnId: string): boolean => {
      return columnVisibility[columnId] ?? false;
    },
    [columnVisibility]
  );

  const visibleColumns = useCallback(() => {
    return OBSERVATION_COLUMNS.filter((col) => columnVisibility[col.id]);
  }, [columnVisibility]);

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

  return {
    columnVisibility,
    setColumnVisibility,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetToDefaults,
    visibleColumns,
    isColumnVisible,
    visibleCount,
    totalCount: OBSERVATION_COLUMNS.length,
    columnOrder,
    setColumnOrder,
  };
}
