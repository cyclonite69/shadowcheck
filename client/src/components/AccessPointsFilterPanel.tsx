/**
 * AccessPointsFilterPanel - Comprehensive filtering UI for Access Points
 *
 * Features:
 * - Search by SSID or MAC address
 * - Radio type filter (WiFi, Bluetooth, BLE, Cellular)
 * - Signal strength range
 * - Data quality filter
 * - Encryption/Security filter (Open, WEP, WPA, WPA2, WPA3)
 * - Clear all filters
 */

import { useState } from 'react';
import { Search, X, Wifi, Bluetooth, Signal, Database, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { type AccessPointFilters } from '@/hooks/useInfiniteAccessPoints';
import { cn } from '@/lib/utils';

interface AccessPointsFilterPanelProps {
  filters: AccessPointFilters;
  onFiltersChange: (filters: AccessPointFilters) => void;
}

export function AccessPointsFilterPanel({ filters, onFiltersChange }: AccessPointsFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput });
  };

  const toggleRadioType = (type: string) => {
    const current = filters.radioTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, radioTypes: updated });
  };

  const toggleDataQuality = (quality: string) => {
    const current = filters.dataQuality || [];
    const updated = current.includes(quality)
      ? current.filter((q) => q !== quality)
      : [...current, quality];
    onFiltersChange({ ...filters, dataQuality: updated });
  };

  const toggleEncryption = (encryption: string) => {
    const current = filters.encryption || [];
    const updated = current.includes(encryption)
      ? current.filter((e) => e !== encryption)
      : [...current, encryption];
    onFiltersChange({ ...filters, encryption: updated });
  };

  const updateSignalRange = (min?: number, max?: number) => {
    onFiltersChange({
      ...filters,
      minSignal: min,
      maxSignal: max,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({
      search: '',
      radioTypes: [],
      minSignal: undefined,
      maxSignal: undefined,
      dataQuality: [],
      encryption: [],
      bbox: filters.bbox, // Keep spatial filters
      radiusSearch: filters.radiusSearch, // Keep spatial filters
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.radioTypes && filters.radioTypes.length > 0) ||
    filters.minSignal !== undefined ||
    filters.maxSignal !== undefined ||
    (filters.dataQuality && filters.dataQuality.length > 0) ||
    (filters.encryption && filters.encryption.length > 0);

  return (
    <div className="border-b border-slate-700 bg-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          <h3 className="text-sm font-semibold text-slate-300">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
              Active
            </span>
          )}
        </div>

        {hasActiveFilters && (
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
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by SSID or MAC address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFiltersChange({ ...filters, search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="grid grid-cols-2 gap-4">
            {/* Radio Type Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                <Wifi className="h-3 w-3" />
                Radio Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['wifi', 'bluetooth', 'ble', 'cellular'].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleRadioType(type)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                      filters.radioTypes?.includes(type)
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Quality Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                <Database className="h-3 w-3" />
                Data Quality
              </label>
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low'].map((quality) => (
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
          </div>

          {/* Encryption/Security Filter */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Shield className="h-3 w-3" />
              Encryption
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'None', label: 'Open', color: 'red' },
                { value: 'WEP', label: 'WEP', color: 'red' },
                { value: 'WPA', label: 'WPA', color: 'orange' },
                { value: 'WPA2', label: 'WPA2', color: 'yellow' },
                { value: 'WPA3', label: 'WPA3', color: 'green' },
                { value: 'Unknown', label: 'Unknown', color: 'slate' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => toggleEncryption(value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
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
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
              <Signal className="h-3 w-3" />
              Signal Strength (dBm)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min (e.g. -90)"
                value={filters.minSignal ?? ''}
                onChange={(e) => updateSignalRange(e.target.value ? Number(e.target.value) : undefined, filters.maxSignal)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="-120"
                max="0"
              />
              <span className="text-slate-500">to</span>
              <input
                type="number"
                placeholder="Max (e.g. -30)"
                value={filters.maxSignal ?? ''}
                onChange={(e) => updateSignalRange(filters.minSignal, e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="-120"
                max="0"
              />
              {(filters.minSignal !== undefined || filters.maxSignal !== undefined) && (
                <button
                  onClick={() => updateSignalRange(undefined, undefined)}
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
