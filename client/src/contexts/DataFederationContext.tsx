/**
 * DataFederationContext - Global state management for data source configuration
 *
 * Provides centralized control over:
 * - Merge mode (unified, deduplicated, smart_merged, precision_merged)
 * - Selected data sources
 * - Radio type filtering
 * - Legacy vs unified toggle
 *
 * All observation queries across all pages use this context
 * Settings persist to localStorage
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MergeMode = 'unified' | 'deduplicated' | 'deduplicated_fuzzy' | 'smart_merged' | 'precision_merged' | 'hybrid';
export type RadioType = 'W' | 'B' | 'C';  // WiGLE radio types: W=WiFi, B=Bluetooth, C=Cellular
export type DataSourceType = 'legacy' | 'unified' | 'kml' | 'wigle_api' | 'federated';

interface DataFederationSettings {
  // Merge mode
  mergeMode: MergeMode;
  setMergeMode: (mode: MergeMode) => void;

  // Selected sources for melding
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;

  // Radio type filtering
  selectedRadioTypes: RadioType[];
  setSelectedRadioTypes: (types: RadioType[]) => void;

  // Legacy vs unified (for surveillance page compatibility)
  dataSourceType: DataSourceType;
  setDataSourceType: (type: DataSourceType) => void;

  // Convenience methods
  isSourceSelected: (sourceName: string) => boolean;
  toggleSource: (sourceName: string) => void;
  isRadioTypeSelected: (type: RadioType) => boolean;
  toggleRadioType: (type: RadioType) => void;

  // Reset to defaults
  resetToDefaults: () => void;
}

const DataFederationContext = createContext<DataFederationSettings | undefined>(undefined);

// Default settings
const DEFAULT_SETTINGS = {
  mergeMode: 'hybrid' as MergeMode,  // Use all modalities in tandem
  selectedSources: ['locations_legacy', 'kml_staging', 'wigle_api'],
  selectedRadioTypes: ['W', 'B', 'C'] as RadioType[],  // All valid WiGLE radio types
  dataSourceType: 'unified' as DataSourceType,
};

// LocalStorage keys
const STORAGE_KEYS = {
  MERGE_MODE: 'shadowcheck_merge_mode',
  SELECTED_SOURCES: 'shadowcheck_selected_sources',
  SELECTED_RADIO_TYPES: 'shadowcheck_selected_radio_types',
  DATA_SOURCE_TYPE: 'shadowcheck_data_source_type',
};

export function DataFederationProvider({ children }: { children: ReactNode }) {
  // Load from localStorage or use defaults
  const [mergeMode, setMergeModeState] = useState<MergeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MERGE_MODE);
    return (stored as MergeMode) || DEFAULT_SETTINGS.mergeMode;
  });

  const [selectedSources, setSelectedSourcesState] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_SOURCES);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS.selectedSources;
  });

  const [selectedRadioTypes, setSelectedRadioTypesState] = useState<RadioType[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_RADIO_TYPES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out invalid radio types (migration from old E/L/G types)
      const valid = parsed.filter((t: string): t is RadioType => t === 'W' || t === 'B' || t === 'C');
      // If no valid types remain, use defaults
      return valid.length > 0 ? valid : DEFAULT_SETTINGS.selectedRadioTypes;
    }
    return DEFAULT_SETTINGS.selectedRadioTypes;
  });

  const [dataSourceType, setDataSourceTypeState] = useState<DataSourceType>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DATA_SOURCE_TYPE);
    return (stored as DataSourceType) || DEFAULT_SETTINGS.dataSourceType;
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERGE_MODE, mergeMode);
  }, [mergeMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_SOURCES, JSON.stringify(selectedSources));
  }, [selectedSources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_RADIO_TYPES, JSON.stringify(selectedRadioTypes));
  }, [selectedRadioTypes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATA_SOURCE_TYPE, dataSourceType);
  }, [dataSourceType]);

  // Wrapped setters
  const setMergeMode = (mode: MergeMode) => {
    setMergeModeState(mode);
    console.log(`[DataFederation] Merge mode changed to: ${mode}`);
  };

  const setSelectedSources = (sources: string[]) => {
    setSelectedSourcesState(sources);
    console.log(`[DataFederation] Selected sources changed to:`, sources);
  };

  const setSelectedRadioTypes = (types: RadioType[]) => {
    setSelectedRadioTypesState(types);
    console.log(`[DataFederation] Selected radio types changed to:`, types);
  };

  const setDataSourceType = (type: DataSourceType) => {
    setDataSourceTypeState(type);
    console.log(`[DataFederation] Data source type changed to: ${type}`);
  };

  // Convenience methods
  const isSourceSelected = (sourceName: string) => {
    return selectedSources.includes(sourceName);
  };

  const toggleSource = (sourceName: string) => {
    if (selectedSources.includes(sourceName)) {
      // Deselect - but keep at least one source
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter(s => s !== sourceName));
      }
    } else {
      // Select
      setSelectedSources([...selectedSources, sourceName]);
    }
  };

  const isRadioTypeSelected = (type: RadioType) => {
    return selectedRadioTypes.includes(type);
  };

  const toggleRadioType = (type: RadioType) => {
    if (selectedRadioTypes.includes(type)) {
      // Deselect - but keep at least one type
      if (selectedRadioTypes.length > 1) {
        setSelectedRadioTypes(selectedRadioTypes.filter(t => t !== type));
      }
    } else {
      // Select
      setSelectedRadioTypes([...selectedRadioTypes, type]);
    }
  };

  const resetToDefaults = () => {
    setMergeMode(DEFAULT_SETTINGS.mergeMode);
    setSelectedSources(DEFAULT_SETTINGS.selectedSources);
    setSelectedRadioTypes(DEFAULT_SETTINGS.selectedRadioTypes);
    setDataSourceType(DEFAULT_SETTINGS.dataSourceType);
    console.log('[DataFederation] Reset to default settings');
  };

  const value: DataFederationSettings = {
    mergeMode,
    setMergeMode,
    selectedSources,
    setSelectedSources,
    selectedRadioTypes,
    setSelectedRadioTypes,
    dataSourceType,
    setDataSourceType,
    isSourceSelected,
    toggleSource,
    isRadioTypeSelected,
    toggleRadioType,
    resetToDefaults,
  };

  return (
    <DataFederationContext.Provider value={value}>
      {children}
    </DataFederationContext.Provider>
  );
}

/**
 * Hook to access data federation settings
 */
export function useDataFederation() {
  const context = useContext(DataFederationContext);
  if (context === undefined) {
    throw new Error('useDataFederation must be used within a DataFederationProvider');
  }
  return context;
}

/**
 * Build query parameters for API calls based on current settings
 */
export function useDataFederationParams() {
  const {
    mergeMode,
    selectedSources,
    selectedRadioTypes,
    dataSourceType
  } = useDataFederation();

  return {
    // For /api/v1/federated/observations endpoint
    federatedParams: {
      mode: mergeMode,
      sources: selectedSources.join(','),
      radio_types: selectedRadioTypes.join(','),
    },

    // For /api/v1/surveillance endpoints (legacy compatibility)
    surveillanceParams: {
      data_source: dataSourceType,
      radio_types: selectedRadioTypes.join(','),
    },

    // For /api/v1/comparison endpoints
    comparisonParams: {
      sources: selectedSources.join(','),
      mode: mergeMode,
    },
  };
}
