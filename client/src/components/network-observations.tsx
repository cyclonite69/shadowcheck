import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { ChevronDown, ChevronRight, Filter, ArrowUpDown, ArrowUp, ArrowDown, Wifi, Signal, Bluetooth, Radio, Antenna, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { parseWiFiSecurity, parseNonWiFiSecurity, getSecurityLevelColor, getSecurityLevelIcon } from "@/lib/securityUtils";

type SortField = 'ssid' | 'bssid' | 'frequency' | 'signal_strength' | 'observed_at';
type SortDirection = 'asc' | 'desc';

export function NetworkObservations() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    wifi: true,
    cell: true,
    bluetooth: true,
    ble: true
  });
  const [sortField, setSortField] = useState<SortField>('observed_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const { data: networks, isLoading, error } = useQuery({
    queryKey: ["/api/v1/networks"],
    queryFn: () => api.getNetworks(20),
    enabled: systemStatus?.database.connected,
    refetchInterval: 10000,
  });

  const isConnected = systemStatus?.database.connected;

  // Filter and sort networks
  const filteredAndSortedNetworks = (networks?.data || [])
    .filter(network => {
      const radioType = getRadioType(network);
      return activeFilters[radioType];
    })
    .sort((a, b) => {
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
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  
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
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  function getRadioType(network: any): 'wifi' | 'cell' | 'bluetooth' | 'ble' {
    // Enhanced classification based on real data patterns
    const { bssid, ssid, frequency, encryption } = network;
    
    // Cellular towers: MCC_MNC_CID format or LTE encryption
    if (/^\d+_\d+_\d+$/.test(bssid) || encryption?.includes('LTE;')) {
      return 'cell';
    }
    
    // Bluetooth Classic: Device names suggesting BT
    if (ssid && (
      /bluetooth|bt|headphone|speaker|mouse|keyboard/i.test(ssid) ||
      encryption?.includes('BT')
    )) {
      return 'bluetooth';
    }
    
    // BLE devices: Enhanced detection with capability patterns
    if (
      (encryption === 'Misc') ||
      (encryption === 'Uncategorized') ||
      (encryption?.includes('Uncategorized;')) ||
      (encryption?.includes('Laptop;')) ||
      (encryption?.includes('Smartphone;')) ||
      (encryption?.includes('Headphones;')) ||
      (encryption?.includes('Display/Speaker;')) ||
      (encryption?.includes('Handsfree;')) ||
      (encryption && /.*;[0-9]+$/.test(encryption)) ||  // Pattern like "Type;10"
      (ssid && /echo|dot|alexa|dell|hp|macbook|fitbit|tile|beacon|ble|jlab|airpods|microsoft/i.test(ssid)) ||
      frequency === 0 || 
      (frequency > 0 && frequency <= 500)
    ) {
      return 'ble';
    }
    
    // Default to WiFi for standard frequencies and encryption
    return 'wifi';
  }


  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const totalFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="premium-card">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <div className="icon-container w-8 h-8 mr-2">
                    <Antenna className="h-4 w-4 text-green-300" />
                  </div>
                  Observed Networks
                </h3>
                <p className="text-sm text-muted-foreground mt-1">All detected radio signals: WiFi, Cellular, Bluetooth</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter size={16} />
                    Radio Types
                    {activeFilterCount < totalFilterCount && (
                      <div className="silver-accent px-2 py-1 rounded-full ml-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {activeFilterCount}/{totalFilterCount}
                        </span>
                      </div>
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
                    <Wifi className="h-4 w-4 mr-2 text-blue-300" />
                    WiFi Networks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.cell}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ ...prev, cell: checked }))
                    }
                  >
                    <Signal className="h-4 w-4 mr-2 text-green-300" />
                    Cellular Towers
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.bluetooth}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ ...prev, bluetooth: checked }))
                    }
                  >
                    <Bluetooth className="h-4 w-4 mr-2 text-purple-300" />
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
            </div>
          </div>
        </div>
        <CollapsibleContent>
      <div className="p-6">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-database text-2xl text-muted-foreground"></i>
            </div>
            <h4 className="text-lg font-medium mb-2">No Database Connection</h4>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Network observations will appear here once you restore your PostgreSQL database backup with PostGIS extension.
            </p>
            <div className="space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>GET /api/v1/networks → 501 Not Implemented</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>GET /api/v1/within → 501 Not Implemented</span>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-2xl text-destructive"></i>
            </div>
            <h4 className="text-lg font-medium mb-2 text-destructive">Error Loading Networks</h4>
            <p className="text-muted-foreground">
              {(error as any)?.message || "Failed to load network observations"}
            </p>
          </div>
        ) : networks && networks.data && networks.data.length > 0 ? (
          <div className="space-y-4" data-testid="networks-list">
            {/* Sortable Column Headers */}
            <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-muted/30 rounded-lg border">
              <Button
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-medium hover:bg-muted"
                onClick={() => handleSort('ssid')}
              >
                Network {getSortIcon('ssid')}
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-medium hover:bg-muted"
                onClick={() => handleSort('bssid')}
              >
                BSSID {getSortIcon('bssid')}
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-medium hover:bg-muted"
                onClick={() => handleSort('frequency')}
              >
                Frequency {getSortIcon('frequency')}
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-medium hover:bg-muted"
                onClick={() => handleSort('signal_strength')}
              >
                Signal {getSortIcon('signal_strength')}
              </Button>
              <Button
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs font-medium hover:bg-muted"
                onClick={() => handleSort('observed_at')}
              >
                Last Seen {getSortIcon('observed_at')}
              </Button>
            </div>
            {filteredAndSortedNetworks.map((network) => {
              const radioType = getRadioType(network);
              return (
                <div key={network.bssid} className="border border-border rounded-md p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="icon-container w-6 h-6 mr-2">
                        {radioType === 'wifi' && <Wifi className="h-3 w-3 text-blue-300" />}
                        {radioType === 'cell' && <Signal className="h-3 w-3 text-green-300" />}
                        {radioType === 'bluetooth' && <Bluetooth className="h-3 w-3 text-purple-300" />}
                        {radioType === 'ble' && <Radio className="h-3 w-3 text-purple-300" />}
                      </div>
                      <h5 className="font-medium">
                        {network.ssid || "Hidden Network"}
                      </h5>
                      <div className="silver-accent px-2 py-1 rounded-full">
                        <span className="text-xs font-semibold text-slate-700">
                          {radioType.toUpperCase()}
                        </span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded font-mono">
                        {network.bssid}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatForensicsTime(network.observed_at)}
                      </div>
                      <div className="text-xs text-muted-foreground/60">
                        {formatRelativeTime(network.observed_at)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="text-muted-foreground">
                      Frequency: <span className="text-foreground">{network.frequency ? `${network.frequency} MHz` : "N/A"}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Signal: <span className="text-foreground font-mono">
                        {network.signal_strength !== undefined && network.signal_strength !== null 
                          ? `${network.signal_strength} dBm` 
                          : "N/A"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Security: {(() => {
                        const secInfo = radioType === 'wifi' 
                          ? parseWiFiSecurity(network.encryption)
                          : parseNonWiFiSecurity(network.encryption, radioType);
                        const SecurityIcon = secInfo.level === 'high' ? ShieldCheck : secInfo.level === 'medium' ? Shield : ShieldAlert;
                        return (
                          <span className="flex items-center gap-1">
                            <SecurityIcon className={`h-3 w-3 ${getSecurityLevelColor(secInfo.level)}`} />
                            <span className={`${getSecurityLevelColor(secInfo.level)} font-medium`}>
                              {secInfo.short}
                            </span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-muted-foreground">
                      Location: <span className="text-foreground font-mono">
                        {network.latitude && network.longitude 
                          ? `${parseFloat(network.latitude).toFixed(6)}, ${parseFloat(network.longitude).toFixed(6)}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            )}
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredAndSortedNetworks.length} of {networks.data.length} total observations
              {activeFilterCount < totalFilterCount && (
                <span className="ml-2 text-primary">
                  (filtered by radio type)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-container w-16 h-16 mx-auto mb-4">
              <Antenna className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">No Network Observations</h4>
            <p className="text-muted-foreground mb-4">
              No radio signals have been detected yet. Data will appear here as observations are collected.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <i className="fas fa-wifi text-blue-600"></i>
                <span>WiFi</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-signal text-green-600"></i>
                <span>Cellular</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fab fa-bluetooth text-purple-600"></i>
                <span>Bluetooth</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fab fa-bluetooth-b text-purple-600"></i>
                <span>BLE</span>
              </div>
            </div>
          </div>
        )}
      </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
