import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function NetworkObservations() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    wifi: true,
    cell: true,
    bluetooth: true,
    ble: true
  });

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

  // Filter networks based on radio type
  const filteredNetworks = networks?.data?.filter(network => {
    // For now, assume all current networks are WiFi until we have proper radio type detection
    const radioType = getRadioType(network);
    return activeFilters[radioType];
  }) || [];

  function getRadioType(network: any): 'wifi' | 'cell' | 'bluetooth' | 'ble' {
    // This is a placeholder - you'll need to implement actual radio type detection
    // based on your data structure
    if (network.frequency && network.frequency > 2000) return 'wifi';
    if (network.frequency && network.frequency < 1000) return 'cell';
    return 'wifi'; // Default to wifi for now
  }

  function getRadioIcon(radioType: string): string {
    switch (radioType) {
      case 'wifi': return 'fas fa-wifi';
      case 'cell': return 'fas fa-signal';
      case 'bluetooth': return 'fab fa-bluetooth';
      case 'ble': return 'fab fa-bluetooth-b';
      default: return 'fas fa-wifi';
    }
  }

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const totalFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="bg-card rounded-lg border border-border">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <i className="fas fa-broadcast-tower text-primary"></i>
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
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {activeFilterCount}/{totalFilterCount}
                      </Badge>
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
                    <i className="fas fa-wifi mr-2 text-blue-500"></i>
                    WiFi Networks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.cell}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ ...prev, cell: checked }))
                    }
                  >
                    <i className="fas fa-signal mr-2 text-green-500"></i>
                    Cellular Towers
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.bluetooth}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ ...prev, bluetooth: checked }))
                    }
                  >
                    <i className="fab fa-bluetooth mr-2 text-purple-500"></i>
                    Bluetooth
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={activeFilters.ble}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ ...prev, ble: checked }))
                    }
                  >
                    <i className="fab fa-bluetooth-b mr-2 text-purple-400"></i>
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
            {filteredNetworks.map((network) => {
              const radioType = getRadioType(network);
              return (
                <div key={network.bssid} className="border border-border rounded-md p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`${getRadioIcon(radioType)} text-primary`}></i>
                      <h5 className="font-medium">
                        {network.ssid || "Hidden Network"}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {radioType.toUpperCase()}
                      </Badge>
                      <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded font-mono">
                        {network.bssid}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {network.observed_at ? new Date(network.observed_at).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <div>Frequency: {network.frequency ? `${network.frequency} MHz` : "N/A"}</div>
                    <div>Signal: {network.signal_strength ? `${network.signal_strength} dBm` : "N/A"}</div>
                    <div>Security: {network.encryption || "Unknown"}</div>
                    <div>
                      Location: {network.latitude && network.longitude 
                        ? `${parseFloat(network.latitude).toFixed(4)}, ${parseFloat(network.longitude).toFixed(4)}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )}
            )}
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredNetworks.length} of {networks.data.length} total observations
              {activeFilterCount < totalFilterCount && (
                <span className="ml-2 text-primary">
                  (filtered by radio type)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-broadcast-tower text-2xl text-muted-foreground"></i>
            </div>
            <h4 className="text-lg font-medium mb-2">No Network Observations</h4>
            <p className="text-muted-foreground mb-4">
              No radio signals have been detected yet. Data will appear here as observations are collected.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <i className="fas fa-wifi text-blue-500"></i>
                <span>WiFi</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fas fa-signal text-green-500"></i>
                <span>Cellular</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fab fa-bluetooth text-purple-500"></i>
                <span>Bluetooth</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fab fa-bluetooth-b text-purple-400"></i>
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
