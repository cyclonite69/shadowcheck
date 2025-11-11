/**
 * FilterBar - Unified horizontal filter control row
 *
 * Provides a clean, icon-based button interface for all observation filters
 * with expandable dropdown menus.
 */

import { useState } from 'react';
import {
  Radio,
  Shield,
  MapPin,
  Calendar,
  Signal,
  Navigation,
  Home,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getRadioTypeDisplay } from '@/components/NetworkObservationsTableView';
import { getSecurityTypeStyle } from '@/lib/securityDecoder';
import type { NetworkFilters } from '@/hooks/useInfiniteNetworkObservations';
import { useFilterCounts } from '@/hooks/useFilterCounts';

interface FilterBarProps {
  filters: NetworkFilters;
  onFiltersChange: (filters: NetworkFilters) => void;
  securityFilters: Set<string>;
  onSecurityFiltersChange: (filters: Set<string>) => void;
  centerPoint: { lat: number; lng: number } | null;
  onCenterPointChange: (point: { lat: number; lng: number } | null) => void;
  searchRadius: number;
  onSearchRadiusChange: (radius: number) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  homeLocation: { lat: number; lng: number } | null;
  onGetGPS: () => void;
  gpsLoading?: boolean;
}

export function FilterBar({
  filters,
  onFiltersChange,
  securityFilters,
  onSecurityFiltersChange,
  centerPoint,
  onCenterPointChange,
  searchRadius,
  onSearchRadiusChange,
  dateRange,
  onDateRangeChange,
  homeLocation,
  onGetGPS,
  gpsLoading = false,
}: FilterBarProps) {
  // Fetch filter counts for sorting
  const { data: filterCounts } = useFilterCounts('locations_legacy');

  // Track which dropdown is open (only one at a time)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownChange = (dropdown: string, isOpen: boolean) => {
    setOpenDropdown(isOpen ? dropdown : null);
  };

  // Helper to format location label
  const getLocationLabel = () => {
    if (!centerPoint) return 'Location';
    // Determine if it's GPS or Home
    const isHome = homeLocation &&
      centerPoint.lat === homeLocation.lat &&
      centerPoint.lng === homeLocation.lng;
    return isHome ? 'Home' : 'GPS';
  };

  // Helper to format date range label
  const getDateRangeLabel = () => {
    if (!dateRange.start && !dateRange.end) return 'Date Range';
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    if (dateRange.start && dateRange.end) {
      return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    }
    if (dateRange.start) return `From ${formatDate(dateRange.start)}`;
    return `Until ${formatDate(dateRange.end)}`;
  };

  // Helper to format signal range label
  const getSignalRangeLabel = () => {
    if (filters.minSignal === undefined && filters.maxSignal === undefined) {
      return 'Signal';
    }
    const min = filters.minSignal ?? -100;
    const max = filters.maxSignal ?? 0;
    return `${min} to ${max} dBm`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Radio Type Filter */}
      <Popover
        open={openDropdown === 'radio'}
        onOpenChange={(open) => handleDropdownChange('radio', open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 px-3 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 data-[state=open]:bg-slate-700"
          >
            <Radio className="h-4 w-4" />
            <span>Radio</span>
            {filters.radioTypes && filters.radioTypes.length > 0 && (
              <Badge className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0 h-4">
                {filters.radioTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-slate-800 border-slate-700" align="start">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300 mb-3">
              Filter by Radio Type
            </div>
            <div className="space-y-2">
              {(filterCounts?.radioTypes || [
                { type: 'WiFi', count: 0 },
                { type: 'BT', count: 0 },
                { type: 'BLE', count: 0 },
                { type: 'GSM', count: 0 },
                { type: 'LTE', count: 0 },
              ]).map(({ type, count }) => {
                const display = getRadioTypeDisplay({ type });
                const isChecked = filters.radioTypes?.includes(type) || false;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`radio-${type}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const current = filters.radioTypes || [];
                        const newTypes = checked
                          ? [...current, type]
                          : current.filter((t) => t !== type);
                        onFiltersChange({ ...filters, radioTypes: newTypes });
                      }}
                    />
                    <label
                      htmlFor={`radio-${type}`}
                      className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer flex-1"
                    >
                      {display.icon}
                      <span className="text-xs uppercase">{display.label}</span>
                      <span className="ml-auto text-xs text-slate-500">
                        {count > 0 ? count.toLocaleString() : ''}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
            {filters.radioTypes && filters.radioTypes.length > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, radioTypes: [] })}
                  className="w-full text-slate-400 hover:text-slate-200 justify-start gap-2 h-8"
                >
                  <X className="h-3 w-3" />
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Security Filter */}
      <Popover
        open={openDropdown === 'security'}
        onOpenChange={(open) => handleDropdownChange('security', open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 px-3 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 data-[state=open]:bg-slate-700"
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
            {securityFilters.size > 0 && (
              <Badge className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0 h-4">
                {securityFilters.size}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 bg-slate-800 border-slate-700" align="start">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300 mb-3">
              Filter by Security Type
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(filterCounts?.securityTypes || [
                { type: 'WPA3-SAE', count: 0 },
                { type: 'WPA2-EAP', count: 0 },
                { type: 'WPA2-PSK', count: 0 },
                { type: 'WPA2-OWE', count: 0 },
                { type: 'WPA-EAP', count: 0 },
                { type: 'WPA-PSK', count: 0 },
                { type: 'WPA-EAP,WPA2-EAP', count: 0 },
                { type: 'WPA-PSK,WPA2-PSK', count: 0 },
                { type: 'WEP', count: 0 },
                { type: 'Open', count: 0 },
              ]).map(({ type: securityType, count }) => {
                const style = getSecurityTypeStyle(securityType);
                const isChecked = securityFilters.has(securityType);
                return (
                  <div key={securityType} className="flex items-center gap-2">
                    <Checkbox
                      id={`security-${securityType}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newFilters = new Set(securityFilters);
                        if (checked) {
                          newFilters.add(securityType);
                        } else {
                          newFilters.delete(securityType);
                        }
                        onSecurityFiltersChange(newFilters);
                      }}
                    />
                    <label
                      htmlFor={`security-${securityType}`}
                      className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer flex-1"
                      title={style.description}
                    >
                      <span className="text-base">{style.icon}</span>
                      <span className={`text-xs font-medium ${style.text}`}>
                        {style.abbr}
                      </span>
                      <span className="ml-auto text-xs text-slate-500">
                        {count > 0 ? count.toLocaleString() : ''}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
            {securityFilters.size > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSecurityFiltersChange(new Set())}
                  className="w-full text-slate-400 hover:text-slate-200 justify-start gap-2 h-8"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Location Filter */}
      <Popover
        open={openDropdown === 'location'}
        onOpenChange={(open) => handleDropdownChange('location', open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={gpsLoading}
            className="gap-1.5 h-9 px-3 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 data-[state=open]:bg-slate-700"
          >
            {gpsLoading ? (
              <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MapPin className={`h-4 w-4 ${centerPoint ? 'text-green-400' : 'text-slate-400'}`} />
            )}
            <span className={centerPoint ? 'text-green-400' : 'text-slate-300'}>
              {getLocationLabel()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-slate-800 border-slate-700" align="start">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300 mb-3">
              Search Center
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onGetGPS();
                setOpenDropdown(null);
              }}
              className="w-full justify-start gap-2 text-slate-300 hover:text-slate-100 h-9"
            >
              <Navigation className="h-4 w-4 text-blue-400" />
              Use GPS Location
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (homeLocation) {
                  onCenterPointChange(homeLocation);
                  setOpenDropdown(null);
                } else {
                  alert('No home location found in database');
                }
              }}
              disabled={!homeLocation}
              className="w-full justify-start gap-2 text-slate-300 hover:text-slate-100 disabled:opacity-50 h-9"
            >
              <Home className="h-4 w-4 text-purple-400" />
              Use Home Location
              {homeLocation && <span className="ml-auto text-xs text-purple-400">✓</span>}
            </Button>
            {centerPoint && (
              <>
                <div className="pt-2 border-t border-slate-700 space-y-2">
                  <Label className="text-xs text-slate-400">Radius (meters)</Label>
                  <Input
                    type="number"
                    value={searchRadius}
                    onChange={(e) => onSearchRadiusChange(Number(e.target.value) || 1000)}
                    className="w-full h-8 px-2 text-xs bg-slate-900 border-slate-700 text-slate-200"
                    min="100"
                    max="50000"
                    step="100"
                  />
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onCenterPointChange(null);
                      setOpenDropdown(null);
                    }}
                    className="w-full text-red-400 hover:text-red-300 justify-start gap-2 h-8"
                  >
                    <X className="h-3 w-3" />
                    Clear Location
                  </Button>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date Range Filter */}
      <Popover
        open={openDropdown === 'date'}
        onOpenChange={(open) => handleDropdownChange('date', open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 px-3 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 data-[state=open]:bg-slate-700"
          >
            <Calendar className="h-4 w-4" />
            <span className={dateRange.start || dateRange.end ? 'text-green-400' : ''}>
              {getDateRangeLabel()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-slate-800 border-slate-700" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300">
              Filter by Date Range
            </div>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">Start Date</Label>
                <Input
                  type="datetime-local"
                  value={dateRange.start}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                  className="h-8 px-2 text-xs bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">End Date</Label>
                <Input
                  type="datetime-local"
                  value={dateRange.end}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  className="h-8 px-2 text-xs bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
            </div>
            {(dateRange.start || dateRange.end) && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDateRangeChange({ start: '', end: '' });
                  }}
                  className="w-full text-red-400 hover:text-red-300 justify-start gap-2 h-8"
                >
                  <X className="h-3 w-3" />
                  Clear Date Range
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Signal Range Filter */}
      <Popover
        open={openDropdown === 'signal'}
        onOpenChange={(open) => handleDropdownChange('signal', open)}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 px-3 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 data-[state=open]:bg-slate-700"
          >
            <Signal className="h-4 w-4" />
            <span className={filters.minSignal !== undefined || filters.maxSignal !== undefined ? 'text-green-400' : ''}>
              {getSignalRangeLabel()}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 bg-slate-800 border-slate-700" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-300">
              Filter by Signal Strength
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-slate-400 mb-1 block">Min (dBm)</Label>
                <Input
                  type="number"
                  placeholder="-100"
                  value={filters.minSignal ?? ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minSignal: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full h-8 px-2 text-xs text-center bg-slate-900 border-slate-700 text-slate-100 font-mono"
                  min="-120"
                  max="0"
                />
              </div>
              <div className="text-slate-600 text-xs pt-5">to</div>
              <div className="flex-1">
                <Label className="text-xs text-slate-400 mb-1 block">Max (dBm)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.maxSignal ?? ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxSignal: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full h-8 px-2 text-xs text-center bg-slate-900 border-slate-700 text-slate-100 font-mono"
                  min="-120"
                  max="0"
                />
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Range: {filters.minSignal ?? -100} dBm → {filters.maxSignal ?? 0} dBm
            </div>
            {(filters.minSignal !== undefined || filters.maxSignal !== undefined) && (
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onFiltersChange({
                      ...filters,
                      minSignal: undefined,
                      maxSignal: undefined,
                    });
                  }}
                  className="w-full text-red-400 hover:text-red-300 justify-start gap-2 h-8"
                >
                  <X className="h-3 w-3" />
                  Clear Signal Range
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
