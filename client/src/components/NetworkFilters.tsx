/**
 * Network Filters - Sidebar filter panel for unified view
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, MapPin, Wifi, Bluetooth, Radio, Signal, Smartphone } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';

interface FilterState {
  search: string;
  radioTypes: string[];
  dateRange: { start: string; end: string };
  signalRange: [number, number];
  securityTypes: string[];
  radiusSearch: { lat: number; lng: number; radiusMeters: number } | null;
}

interface NetworkFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const defaultFilters: FilterState = {
  search: '',
  radioTypes: [],
  dateRange: { start: '', end: '' },
  signalRange: [-100, 0],
  securityTypes: [],
  radiusSearch: null,
};

export function NetworkFilters({ filters, onChange, resultCount, totalCount }: NetworkFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.radioTypes.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.signalRange[0] !== -100 ||
    filters.signalRange[1] !== 0 ||
    filters.securityTypes.length > 0 ||
    filters.radiusSearch !== null;

  const handleRadioTypeToggle = (type: string, checked: boolean) => {
    const types = checked
      ? [...filters.radioTypes, type]
      : filters.radioTypes.filter((t) => t !== type);
    onChange({ ...filters, radioTypes: types });
  };

  const handleSecurityTypeToggle = (type: string, checked: boolean) => {
    const types = checked
      ? [...filters.securityTypes, type]
      : filters.securityTypes.filter((t) => t !== type);
    onChange({ ...filters, securityTypes: types });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(defaultFilters)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Result Count */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-slate-300">
          Showing <span className="font-bold text-blue-400">{resultCount.toLocaleString()}</span> of{' '}
          <span className="font-bold text-slate-200">{totalCount.toLocaleString()}</span> networks
        </p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-slate-300">Search SSID / BSSID</Label>
        <Input
          placeholder="Search networks..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
        />
      </div>

      {/* Network Types */}
      <div className="space-y-3">
        <Label className="text-slate-300 flex items-center gap-2">
          <Radio className="w-4 h-4" />
          Network Types
        </Label>
        <div className="space-y-2.5 pl-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-wifi"
              checked={filters.radioTypes.includes('W')}
              onCheckedChange={(checked) => handleRadioTypeToggle('W', !!checked)}
              className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label
              htmlFor="filter-wifi"
              className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
            >
              <Wifi className={`w-4 h-4 ${iconColors.primary.text}`} />
              WiFi
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-ble"
              checked={filters.radioTypes.includes('E')}
              onCheckedChange={(checked) => handleRadioTypeToggle('E', !!checked)}
              className="border-slate-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
            <label
              htmlFor="filter-ble"
              className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
            >
              <Signal className={`w-4 h-4 ${iconColors.warning.text}`} />
              Bluetooth LE
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-bt"
              checked={filters.radioTypes.includes('B')}
              onCheckedChange={(checked) => handleRadioTypeToggle('B', !!checked)}
              className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <label
              htmlFor="filter-bt"
              className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
            >
              <Bluetooth className={`w-4 h-4 ${iconColors.secondary.text}`} />
              Bluetooth Classic
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-lte"
              checked={filters.radioTypes.includes('L')}
              onCheckedChange={(checked) => handleRadioTypeToggle('L', !!checked)}
              className="border-slate-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <label
              htmlFor="filter-lte"
              className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
            >
              <Smartphone className={`w-4 h-4 ${iconColors.success.text}`} />
              Cellular / LTE
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-other"
              checked={filters.radioTypes.includes('G')}
              onCheckedChange={(checked) => handleRadioTypeToggle('G', !!checked)}
              className="border-slate-600 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
            />
            <label
              htmlFor="filter-other"
              className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-slate-400" />
              Other (G)
            </label>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <Label className="text-slate-300">Date Range</Label>
        <div className="space-y-2">
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) =>
              onChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })
            }
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) =>
              onChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })
            }
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
      </div>

      {/* Signal Strength Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-slate-300">Signal Strength</Label>
          <span className="text-sm text-slate-400">
            {filters.signalRange[0]} to {filters.signalRange[1]} dBm
          </span>
        </div>
        <Slider
          min={-100}
          max={0}
          step={1}
          value={filters.signalRange}
          onValueChange={(value) => onChange({ ...filters, signalRange: value as [number, number] })}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Weak (-100)</span>
          <span>Strong (0)</span>
        </div>
      </div>

      {/* Security Types */}
      <div className="space-y-3">
        <Label className="text-slate-300">Security</Label>
        <div className="space-y-2.5 pl-2">
          {['Open', 'WEP', 'WPA', 'WPA2', 'WPA3'].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`security-${type}`}
                checked={filters.securityTypes.includes(type)}
                onCheckedChange={(checked) => handleSecurityTypeToggle(type, !!checked)}
                className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor={`security-${type}`}
                className="text-sm text-slate-300 cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Radius Search - Phase 4 enhancement */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4" />
          Location Radius Search
        </Label>
        {filters.radiusSearch ? (
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
            <p className="text-sm text-slate-300">
              {filters.radiusSearch.radiusMeters}m radius from
              <br />
              <span className="text-xs text-slate-400">
                {filters.radiusSearch.lat.toFixed(4)}, {filters.radiusSearch.lng.toFixed(4)}
              </span>
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...filters, radiusSearch: null })}
              className="w-full text-slate-400 hover:text-slate-200"
            >
              Clear
            </Button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Click "Radius Tool" on map to search by location
          </p>
        )}
      </div>

      {/* Filter Stats */}
      <div className="pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span>Active Filters:</span>
            <span className="text-blue-400 font-semibold">
              {hasActiveFilters ? 'Yes' : 'None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Filter Efficiency:</span>
            <span className="text-green-400 font-semibold">
              {totalCount > 0 ? ((resultCount / totalCount) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
