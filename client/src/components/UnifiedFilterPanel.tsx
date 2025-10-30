/**
 * UnifiedFilterPanel - Advanced filtering UI for all ShadowCheck views
 *
 * Features:
 * - Radio type selection (WiFi, Bluetooth, BLE, Cellular)
 * - Field-based filtering (signal, security, manufacturer, etc.)
 * - Search by SSID/BSSID
 * - Filter presets (strong signals, open networks, etc.)
 * - Active filter badges with counts
 * - Collapsible sections
 */

import { useState } from 'react';
import {
  Search,
  X,
  Wifi,
  Bluetooth,
  Signal,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
  Zap,
  Lock,
  Radio as RadioIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UnifiedFilters, RadioTypeFilter } from '@/lib/unifiedFilters';
import { countActiveFilters, validateSignalRange, FILTER_PRESETS } from '@/lib/unifiedFilters';

interface UnifiedFilterPanelProps {
  filters: UnifiedFilters;
  onFiltersChange: (filters: UnifiedFilters) => void;
  viewMode: 'observations' | 'access-points';
}

export function UnifiedFilterPanel({ filters, onFiltersChange, viewMode }: UnifiedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const activeFilterCount = countActiveFilters(filters);

  // Toggle radio type
  const toggleRadioType = (type: RadioTypeFilter) => {
    const current = filters.radioTypes || [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, radioTypes: updated });
  };

  // Toggle encryption type
  const toggleEncryption = (encryption: string) => {
    const current = filters.encryption || [];
    const updated = current.includes(encryption)
      ? current.filter(e => e !== encryption)
      : [...current, encryption];
    onFiltersChange({ ...filters, encryption: updated });
  };

  // Toggle data quality (access points only)
  const toggleDataQuality = (quality: 'high' | 'medium' | 'low') => {
    const current = filters.dataQuality || [];
    const updated = current.includes(quality)
      ? current.filter(q => q !== quality)
      : [...current, quality];
    onFiltersChange({ ...filters, dataQuality: updated });
  };

  // Update signal range
  const updateSignalRange = (min?: number, max?: number) => {
    const validation = validateSignalRange(min, max);
    if (!validation.valid) {
      console.warn(validation.error);
      return;
    }
    onFiltersChange({
      ...filters,
      minSignal: min,
      maxSignal: max,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  // Apply preset
  const applyPreset = (preset: UnifiedFilters) => {
    onFiltersChange({ ...filters, ...preset });
  };

  return (
    <div className="border-b border-slate-700 bg-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          <Filter className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => onFiltersChange({ ...filters, search: searchInput })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onFiltersChange({ ...filters, search: searchInput });
                }
              }}
              placeholder="Search by SSID or BSSID/MAC..."
              className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  onFiltersChange({ ...filters, search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Radio Type Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                <RadioIcon className="h-3 w-3" />
                Radio Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(['wifi', 'bluetooth', 'ble', 'cellular'] as RadioTypeFilter[]).map((type) => {
                  const icons = {
                    wifi: <Wifi className="h-3 w-3" />,
                    bluetooth: <Bluetooth className="h-3 w-3" />,
                    ble: <Bluetooth className="h-3 w-3" />,
                    cellular: <Signal className="h-3 w-3" />,
                  };

                  return (
                    <button
                      key={type}
                      onClick={() => toggleRadioType(type)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5',
                        filters.radioTypes?.includes(type)
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                      )}
                    >
                      {icons[type]}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Quality Filter (Access Points only) */}
            {viewMode === 'access-points' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                  <Zap className="h-3 w-3" />
                  Data Quality
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['high', 'medium', 'low'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => toggleDataQuality(quality)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                        filters.dataQuality?.includes(quality)
                          ? quality === 'high'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : quality === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                            : 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                      )}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security/Encryption Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Shield className="h-3 w-3" />
              Security / Encryption
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'None', label: 'Open', color: 'red', icon: <Lock className="h-3 w-3" /> },
                { value: 'WEP', label: 'WEP', color: 'red', icon: <Shield className="h-3 w-3" /> },
                { value: 'WPA', label: 'WPA', color: 'orange', icon: <Shield className="h-3 w-3" /> },
                { value: 'WPA2', label: 'WPA2', color: 'yellow', icon: <Shield className="h-3 w-3" /> },
                { value: 'WPA3', label: 'WPA3', color: 'green', icon: <Shield className="h-3 w-3" /> },
                { value: 'Unknown', label: 'Unknown', color: 'slate', icon: <Shield className="h-3 w-3" /> },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleEncryption(value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5',
                    filters.encryption?.includes(value)
                      ? color === 'red'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : color === 'orange'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        : color === 'yellow'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : color === 'green'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Signal Strength Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Signal className="h-3 w-3" />
                Signal Strength
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {filters.minSignal ?? -120} dBm to {filters.maxSignal ?? 0} dBm
                </span>
                {(filters.minSignal !== undefined || filters.maxSignal !== undefined) && (
                  <button
                    onClick={() => updateSignalRange(undefined, undefined)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {/* Min Signal Slider */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Minimum: {filters.minSignal ?? -120} dBm</label>
                <input
                  type="range"
                  min="-120"
                  max="0"
                  step="1"
                  value={filters.minSignal ?? -120}
                  onChange={(e) => updateSignalRange(Number(e.target.value), filters.maxSignal)}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              {/* Max Signal Slider */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Maximum: {filters.maxSignal ?? 0} dBm</label>
                <input
                  type="range"
                  min="-120"
                  max="0"
                  step="1"
                  value={filters.maxSignal ?? 0}
                  onChange={(e) => updateSignalRange(filters.minSignal, Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <span className="text-lg">📅</span>
              Date Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filters.dateStart || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateStart: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={filters.dateEnd || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateEnd: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {(filters.dateStart || filters.dateEnd) && (
                <button
                  onClick={() => onFiltersChange({ ...filters, dateStart: undefined, dateEnd: undefined })}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
