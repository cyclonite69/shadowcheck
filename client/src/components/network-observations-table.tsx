import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wifi,
  Signal,
  Bluetooth,
  Radio,
  Antenna,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Calendar,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatForensicsTime, formatRelativeTime } from "@/lib/dateUtils";
import { parseWiFiSecurity, parseNonWiFiSecurity, getSecurityLevelColor } from "@/lib/securityUtils";
import { bssidToColor, formatBSSID } from "@/utils/bssid-color";

type SortField = 'ssid' | 'bssid' | 'frequency' | 'signal_strength' | 'observed_at' | 'radio_type' | 'encryption' | 'channel' | 'observation_count';
type SortDirection = 'asc' | 'desc';
type RadioType = 'wifi' | 'cell' | 'bluetooth' | 'ble';

interface NetworkObservation {
  id: string;
  bssid: string;
  ssid?: string;
  frequency?: number;
  encryption?: string;
  signal_strength?: number;
  latitude?: string;
  longitude?: string;
  observed_at?: string;
  type?: string;
  channel?: number;
  observation_count?: number;
}

export function NetworkObservationsTable() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    wifi: true,
    cell: true,
    bluetooth: true,
    ble: true
  });
  const [securityFilter, setSecurityFilter] = useState<string[]>([]);
  const [signalFilter, setSignalFilter] = useState<{ min: number; max: number }>({ min: -100, max: 0 });
  const [frequencyFilter, setFrequencyFilter] = useState<{ min: number; max: number }>({ min: 0, max: 7200 });
  const [channelFilter, setChannelFilter] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortField, setSortField] = useState<SortField>('observed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [displayLimit, setDisplayLimit] = useState(100);
  const [totalLimit, setTotalLimit] = useState(2000); // Increased from 500

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  // Build radio types array for server-side filtering
  const enabledRadioTypes = Object.entries(activeFilters)
    .filter(([_, enabled]) => enabled)
    .map(([type, _]) => type);

  const { data: networks, isLoading, error } = useQuery({
    queryKey: ["/api/v1/networks", searchTerm, enabledRadioTypes, signalFilter, frequencyFilter, totalLimit],
    queryFn: () => api.getNetworks({
      limit: totalLimit,
      search: searchTerm || undefined,
      radio_types: enabledRadioTypes.length < 4 ? enabledRadioTypes : undefined,
      min_signal: signalFilter.min !== -100 ? signalFilter.min : undefined,
      max_signal: signalFilter.max !== 0 ? signalFilter.max : undefined,
      min_freq: frequencyFilter.min !== 0 ? frequencyFilter.min : undefined,
      max_freq: frequencyFilter.max !== 7200 ? frequencyFilter.max : undefined,
    }),
    enabled: systemStatus?.database.connected,
    refetchInterval: 10000,
  });

  const isConnected = systemStatus?.database.connected;

  function getRadioType(network: NetworkObservation): RadioType {
    const { bssid, ssid, frequency, encryption } = network;

    if (/^\d+_\d+_\d+$/.test(bssid) || encryption?.includes('LTE;')) {
      return 'cell';
    }

    if (ssid && /bluetooth|bt|headphone|speaker|mouse|keyboard/i.test(ssid) || encryption?.includes('BT')) {
      return 'bluetooth';
    }

    if (
      encryption === 'Misc' ||
      encryption === 'Uncategorized' ||
      encryption?.includes('Uncategorized;') ||
      encryption?.includes('Laptop;') ||
      encryption?.includes('Smartphone;') ||
      encryption?.includes('Headphones;') ||
      (ssid && /echo|dot|alexa|dell|hp|fitbit|tile|beacon|ble|jlab|airpods/i.test(ssid)) ||
      frequency === 0 ||
      (frequency && frequency > 0 && frequency <= 500)
    ) {
      return 'ble';
    }

    return 'wifi';
  }

  function getRadioIcon(radioType: RadioType) {
    switch(radioType) {
      case 'wifi': return <Wifi className="h-5 w-5 text-blue-400" />;
      case 'cell': return <Signal className="h-5 w-5 text-green-400" />;
      case 'bluetooth': return <Bluetooth className="h-5 w-5 text-purple-400" />;
      case 'ble': return <Radio className="h-5 w-5 text-purple-300" />;
    }
  }

  function getRadioLabel(radioType: RadioType): string {
    switch(radioType) {
      case 'wifi': return 'WiFi';
      case 'cell': return 'Cell';
      case 'bluetooth': return 'BT';
      case 'ble': return 'BLE';
    }
  }

  const filteredAndSortedNetworks = useMemo(() => {
    if (!networks?.data) return [];

    // Most filtering is now done server-side
    // Apply security, channel, and date filters client-side
    let filtered = (networks.data as NetworkObservation[]).filter(network => {
      // Security filter (client-side only)
      if (securityFilter.length > 0) {
        const radioType = getRadioType(network);
        const secInfo = radioType === 'wifi'
          ? parseWiFiSecurity(network.encryption)
          : parseNonWiFiSecurity(network.encryption, radioType);
        if (!securityFilter.includes(secInfo.level)) return false;
      }

      // Channel filter (client-side)
      if (channelFilter.length > 0 && network.channel) {
        if (!channelFilter.includes(network.channel)) return false;
      }

      // Date range filter (client-side)
      if (dateFilter.start && network.observed_at) {
        const obsDate = new Date(network.observed_at);
        const startDate = new Date(dateFilter.start);
        if (obsDate < startDate) return false;
      }
      if (dateFilter.end && network.observed_at) {
        const obsDate = new Date(network.observed_at);
        const endDate = new Date(dateFilter.end);
        endDate.setHours(23, 59, 59, 999); // Include full end date
        if (obsDate > endDate) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'ssid':
          aValue = (a.ssid || '').toLowerCase();
          bValue = (b.ssid || '').toLowerCase();
          break;
        case 'bssid':
          aValue = a.bssid || '';
          bValue = b.bssid || '';
          break;
        case 'frequency':
          aValue = a.frequency || 0;
          bValue = b.frequency || 0;
          break;
        case 'signal_strength':
          aValue = a.signal_strength || -100;
          bValue = b.signal_strength || -100;
          break;
        case 'observed_at':
          aValue = new Date(a.observed_at || 0).getTime();
          bValue = new Date(b.observed_at || 0).getTime();
          break;
        case 'radio_type':
          aValue = getRadioType(a);
          bValue = getRadioType(b);
          break;
        case 'encryption':
          aValue = a.encryption || '';
          bValue = b.encryption || '';
          break;
        case 'channel':
          aValue = a.channel || 0;
          bValue = b.channel || 0;
          break;
        case 'observation_count':
          aValue = a.observation_count || 0;
          bValue = b.observation_count || 0;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [networks, securityFilter, channelFilter, dateFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  const getSignalBar = (signal: number) => {
    const percentage = Math.max(0, Math.min(100, ((signal + 100) / 70) * 100));
    const color = signal >= -40 ? '#22c55e' : signal >= -60 ? '#eab308' : signal >= -80 ? '#f97316' : '#ef4444';
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        <span className="text-xs font-mono tabular-nums" style={{ color }}>{signal} dBm</span>
      </div>
    );
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const totalFilterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = searchTerm || securityFilter.length > 0 || channelFilter.length > 0 || activeFilterCount < totalFilterCount || signalFilter.min !== -100 || signalFilter.max !== 0 || frequencyFilter.min !== 0 || frequencyFilter.max !== 7200 || dateFilter.start || dateFilter.end;

  // Virtualization: Only render visible rows
  const displayedNetworks = useMemo(() => {
    return filteredAndSortedNetworks.slice(0, displayLimit);
  }, [filteredAndSortedNetworks, displayLimit]);

  const hasMore = displayLimit < filteredAndSortedNetworks.length;

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + 100);
  }, []);

  return (
    <div className="premium-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <Antenna className="h-5 w-5" />
                  Network Observations
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {filteredAndSortedNetworks.length} of {networks?.data?.length || 0} observations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative w-64">
                <Input
                  placeholder="Search BSSID, SSID, security..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Radio Type Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Radio
                    {activeFilterCount < totalFilterCount && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {activeFilterCount}/{totalFilterCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Radio Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.wifi}
                    onCheckedChange={(checked) =>
                      setActiveFilters(prev => ({ ...prev, wifi: checked }))
                    }
                  >
                    <Wifi className="h-4 w-4 mr-2 text-blue-400" />
                    WiFi Networks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.cell}
                    onCheckedChange={(checked) =>
                      setActiveFilters(prev => ({ ...prev, cell: checked }))
                    }
                  >
                    <Signal className="h-4 w-4 mr-2 text-green-400" />
                    Cellular Towers
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.bluetooth}
                    onCheckedChange={(checked) =>
                      setActiveFilters(prev => ({ ...prev, bluetooth: checked }))
                    }
                  >
                    <Bluetooth className="h-4 w-4 mr-2 text-purple-400" />
                    Bluetooth
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.ble}
                    onCheckedChange={(checked) =>
                      setActiveFilters(prev => ({ ...prev, ble: checked }))
                    }
                  >
                    <Radio className="h-4 w-4 mr-2 text-purple-300" />
                    Bluetooth LE
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Signal Strength Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Signal className="h-4 w-4" />
                    Signal
                    {(signalFilter.min !== -100 || signalFilter.max !== 0) && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {signalFilter.min}~{signalFilter.max}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Filter by Signal Strength</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Minimum:</span>
                        <span className="font-mono font-medium">{signalFilter.min} dBm</span>
                      </div>
                      <Slider
                        min={-100}
                        max={0}
                        step={5}
                        value={[signalFilter.min]}
                        onValueChange={([value]) => setSignalFilter(prev => ({ ...prev, min: value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Maximum:</span>
                        <span className="font-mono font-medium">{signalFilter.max} dBm</span>
                      </div>
                      <Slider
                        min={-100}
                        max={0}
                        step={5}
                        value={[signalFilter.max]}
                        onValueChange={([value]) => setSignalFilter(prev => ({ ...prev, max: value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Range: {signalFilter.max - signalFilter.min} dB
                      </span>
                      {(signalFilter.min !== -100 || signalFilter.max !== 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSignalFilter({ min: -100, max: 0 })}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Security Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Security
                    {securityFilter.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {securityFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Security Level</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={securityFilter.includes('high')}
                    onCheckedChange={(checked) =>
                      setSecurityFilter(prev =>
                        checked
                          ? [...prev, 'high']
                          : prev.filter(s => s !== 'high')
                      )
                    }
                  >
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-400" />
                    High (WPA3, WPA2)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={securityFilter.includes('medium')}
                    onCheckedChange={(checked) =>
                      setSecurityFilter(prev =>
                        checked
                          ? [...prev, 'medium']
                          : prev.filter(s => s !== 'medium')
                      )
                    }
                  >
                    <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                    Medium (WPA)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={securityFilter.includes('low')}
                    onCheckedChange={(checked) =>
                      setSecurityFilter(prev =>
                        checked
                          ? [...prev, 'low']
                          : prev.filter(s => s !== 'low')
                      )
                    }
                  >
                    <ShieldAlert className="h-4 w-4 mr-2 text-red-400" />
                    Low (WEP, Open)
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Frequency Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Antenna className="h-4 w-4" />
                    Frequency
                    {(frequencyFilter.min !== 0 || frequencyFilter.max !== 7200) && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {frequencyFilter.min}-{frequencyFilter.max} MHz
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Filter by Frequency</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Minimum:</span>
                        <span className="font-mono font-medium">{frequencyFilter.min} MHz</span>
                      </div>
                      <Slider
                        min={0}
                        max={7200}
                        step={100}
                        value={[frequencyFilter.min]}
                        onValueChange={([value]) => setFrequencyFilter(prev => ({ ...prev, min: value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Maximum:</span>
                        <span className="font-mono font-medium">{frequencyFilter.max} MHz</span>
                      </div>
                      <Slider
                        min={0}
                        max={7200}
                        step={100}
                        value={[frequencyFilter.max]}
                        onValueChange={([value]) => setFrequencyFilter(prev => ({ ...prev, max: value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs text-muted-foreground">
                      <div>2.4 GHz: 2400-2500 MHz</div>
                      <div>5 GHz: 5000-5900 MHz</div>
                      <div>BLE: 2400-2500 MHz</div>
                      <div>6 GHz: 5900-7200 MHz</div>
                    </div>
                    <div className="flex items-center justify-end pt-2 border-t">
                      {(frequencyFilter.min !== 0 || frequencyFilter.max !== 7200) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFrequencyFilter({ min: 0, max: 7200 })}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Channel Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Channel
                    {channelFilter.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        {channelFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>Filter by WiFi Channel</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <div className="mb-2 text-xs text-muted-foreground font-semibold">2.4 GHz Channels</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(ch => (
                        <DropdownMenuCheckboxItem
                          key={ch}
                          checked={channelFilter.includes(ch)}
                          onCheckedChange={(checked) =>
                            setChannelFilter(prev =>
                              checked
                                ? [...prev, ch].sort((a, b) => a - b)
                                : prev.filter(c => c !== ch)
                            )
                          }
                          className="px-2 py-1 text-xs"
                        >
                          {ch}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <div className="mb-2 text-xs text-muted-foreground font-semibold">5 GHz Channels</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165].map(ch => (
                        <DropdownMenuCheckboxItem
                          key={ch}
                          checked={channelFilter.includes(ch)}
                          onCheckedChange={(checked) =>
                            setChannelFilter(prev =>
                              checked
                                ? [...prev, ch].sort((a, b) => a - b)
                                : prev.filter(c => c !== ch)
                            )
                          }
                          className="px-2 py-1 text-xs"
                        >
                          {ch}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    {channelFilter.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChannelFilter([])}
                        className="w-full"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                    {(dateFilter.start || dateFilter.end) && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        Active
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Filter by Date Range</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Start Date:</label>
                      <Input
                        type="date"
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">End Date:</label>
                      <Input
                        type="date"
                        value={dateFilter.end}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-end pt-2 border-t">
                      {(dateFilter.start || dateFilter.end) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDateFilter({ start: '', end: '' })}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="overflow-x-auto">
            {!isConnected ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Antenna className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium mb-2">No Database Connection</h4>
                <p className="text-muted-foreground">
                  Network observations will appear once the database is connected.
                </p>
              </div>
            ) : isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading observations...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-destructive" />
                </div>
                <h4 className="text-lg font-medium mb-2 text-destructive">Error Loading Networks</h4>
                <p className="text-muted-foreground">{(error as any)?.message || "Failed to load observations"}</p>
              </div>
            ) : filteredAndSortedNetworks.length > 0 ? (
              <>
                {/* Table */}
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/30 backdrop-blur-sm z-10">
                    <tr className="border-b border-border">
                      {/* Icon + Radio Type */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('radio_type')}
                        >
                          Type {getSortIcon('radio_type')}
                        </Button>
                      </th>

                      {/* Network Name */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('ssid')}
                        >
                          Network Name {getSortIcon('ssid')}
                        </Button>
                      </th>

                      {/* BSSID */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('bssid')}
                        >
                          BSSID {getSortIcon('bssid')}
                        </Button>
                      </th>

                      {/* Frequency */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('frequency')}
                        >
                          Frequency {getSortIcon('frequency')}
                        </Button>
                      </th>

                      {/* Channel */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('channel')}
                        >
                          Ch {getSortIcon('channel')}
                        </Button>
                      </th>

                      {/* Signal Strength */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('signal_strength')}
                        >
                          Signal {getSortIcon('signal_strength')}
                        </Button>
                      </th>

                      {/* Seen Count */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('observation_count')}
                        >
                          Seen {getSortIcon('observation_count')}
                        </Button>
                      </th>

                      {/* Security */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('encryption')}
                        >
                          Security {getSortIcon('encryption')}
                        </Button>
                      </th>

                      {/* Last Seen */}
                      <th className="px-4 py-3 text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 font-medium hover:bg-transparent"
                          onClick={() => handleSort('observed_at')}
                        >
                          Last Seen {getSortIcon('observed_at')}
                        </Button>
                      </th>

                      {/* Location */}
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-medium text-muted-foreground">Location</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedNetworks.map((network, index) => {
                      const radioType = getRadioType(network);
                      const color = bssidToColor(network.bssid);
                      const secInfo = radioType === 'wifi'
                        ? parseWiFiSecurity(network.encryption)
                        : parseNonWiFiSecurity(network.encryption, radioType);
                      const SecurityIcon = secInfo.level === 'high' ? ShieldCheck : secInfo.level === 'medium' ? Shield : ShieldAlert;

                      return (
                        <tr
                          key={network.bssid + index}
                          className="border-b border-border/10 hover:bg-muted/20 transition-colors"
                        >
                          {/* Icon + Radio Type */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRadioIcon(radioType)}
                              <span className="text-xs font-medium text-muted-foreground">
                                {getRadioLabel(radioType)}
                              </span>
                            </div>
                          </td>

                          {/* Network Name */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium">
                              {network.ssid || <span className="text-muted-foreground italic">Hidden</span>}
                            </span>
                          </td>

                          {/* BSSID with color */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs font-mono" style={{ color: color.hex }}>
                                {formatBSSID(network.bssid)}
                              </span>
                            </div>
                          </td>

                          {/* Frequency */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono tabular-nums">
                              {network.frequency ? `${network.frequency} MHz` : <span className="text-muted-foreground">—</span>}
                            </span>
                          </td>

                          {/* Channel */}
                          <td className="px-4 py-3">
                            <span className="text-xs tabular-nums">
                              {network.channel || <span className="text-muted-foreground">—</span>}
                            </span>
                          </td>

                          {/* Signal Strength */}
                          <td className="px-4 py-3">
                            {network.signal_strength !== undefined && network.signal_strength !== null
                              ? getSignalBar(network.signal_strength)
                              : <span className="text-xs text-muted-foreground">—</span>
                            }
                          </td>

                          {/* Seen Count */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold tabular-nums text-green-400">
                              {network.observation_count || 0}
                            </span>
                          </td>

                          {/* Security */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <SecurityIcon className={`h-4 w-4 ${getSecurityLevelColor(secInfo.level)}`} />
                              <span className={`text-xs font-medium ${getSecurityLevelColor(secInfo.level)}`}>
                                {secInfo.short}
                              </span>
                            </div>
                          </td>

                          {/* Last Seen */}
                          <td className="px-4 py-3">
                            <div className="text-xs">
                              <div>{formatForensicsTime(network.observed_at)}</div>
                              <div className="text-muted-foreground">{formatRelativeTime(network.observed_at)}</div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3">
                            {network.latitude && network.longitude ? (
                              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                                {parseFloat(network.latitude).toFixed(4)}, {parseFloat(network.longitude).toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-border/20 bg-muted/10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      Showing {displayedNetworks.length} of {filteredAndSortedNetworks.length} observations
                      {hasActiveFilters && <span className="text-primary ml-2">(filtered from {networks.data.length} total)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasMore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadMore}
                        >
                          Load More ({filteredAndSortedNetworks.length - displayLimit} remaining)
                        </Button>
                      )}
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('');
                            setSecurityFilter([]);
                            setSignalFilter({ min: -100, max: 0 });
                            setFrequencyFilter({ min: 0, max: 7200 });
                            setChannelFilter([]);
                            setDateFilter({ start: '', end: '' });
                            setActiveFilters({ wifi: true, cell: true, bluetooth: true, ble: true });
                            setDisplayLimit(100);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 px-6">
                <Antenna className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No observations found</h4>
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'No network data available'}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
