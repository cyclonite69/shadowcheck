import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Network, 
  Search, 
  SortAsc, 
  SortDesc, 
  Filter,
  Wifi,
  Signal,
  Shield,
  MapPin,
  Calendar
} from 'lucide-react';
import { bssidToColor, formatBSSID, getBSSIDOctets, calculateColorSimilarity } from '@/utils/bssid-color';

interface NetworkEntry {
  bssid: string;
  ssid: string;
  security: string;
  signal_strength: number;
  frequency: number;
  latitude?: number;
  longitude?: number;
  last_seen?: string;
  network_count?: number;
}

type SortField = 'bssid' | 'ssid' | 'signal_strength' | 'security' | 'frequency' | 'last_seen';
type SortDirection = 'asc' | 'desc';

export default function NetworksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('bssid');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [securityFilter, setSecurityFilter] = useState<string>('all');
  const [selectedOctet, setSelectedOctet] = useState<number | null>(null);

  const { data: networksData, isLoading } = useQuery({
    queryKey: ['/api/v1/g63/networks'],
    refetchInterval: 30000,
  });

  const networks = useMemo(() => {
    if (!networksData || !('data' in networksData) || !networksData.data) return [];
    return networksData.data as NetworkEntry[];
  }, [networksData]);

  // Filter and sort networks
  const filteredAndSortedNetworks = useMemo(() => {
    let filtered = networks.filter((network) => {
      // Search filter
      const searchMatch = !searchTerm || 
        network.bssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        network.ssid?.toLowerCase().includes(searchTerm.toLowerCase());

      // Security filter
      const securityMatch = securityFilter === 'all' || 
        (securityFilter === 'encrypted' && network.security && network.security !== '[ESS]') ||
        (securityFilter === 'open' && (!network.security || network.security === '[ESS]')) ||
        (securityFilter === 'wpa' && network.security?.includes('WPA')) ||
        (securityFilter === 'wep' && network.security?.includes('WEP'));

      return searchMatch && securityMatch;
    });

    // Sort networks
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'bssid':
          aVal = a.bssid;
          bVal = b.bssid;
          break;
        case 'ssid':
          aVal = a.ssid || '';
          bVal = b.ssid || '';
          break;
        case 'signal_strength':
          aVal = a.signal_strength || -100;
          bVal = b.signal_strength || -100;
          break;
        case 'security':
          aVal = a.security || '';
          bVal = b.security || '';
          break;
        case 'frequency':
          aVal = a.frequency || 0;
          bVal = b.frequency || 0;
          break;
        case 'last_seen':
          aVal = a.last_seen || '';
          bVal = b.last_seen || '';
          break;
        default:
          aVal = a.bssid;
          bVal = b.bssid;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' 
        ? aVal - bVal
        : bVal - aVal;
    });

    return filtered;
  }, [networks, searchTerm, sortField, sortDirection, securityFilter]);

  // Group by BSSID octet for forensic analysis
  const octetGroups = useMemo(() => {
    const groups: { [key: string]: NetworkEntry[] } = {};
    
    filteredAndSortedNetworks.forEach(network => {
      const octets = getBSSIDOctets(network.bssid);
      if (octets.length === 6) {
        const groupKey = selectedOctet !== null 
          ? octets[selectedOctet] 
          : octets.slice(0, 3).join(':'); // Group by OUI by default
        
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(network);
      }
    });

    return groups;
  }, [filteredAndSortedNetworks, selectedOctet]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const getSecurityLevel = (security: string) => {
    if (!security || security === '[ESS]') return 'Open';
    if (security.includes('WPA')) return 'WPA';
    if (security.includes('WEP')) return 'WEP';
    return 'Other';
  };

  const getSignalStrengthColor = (signal: number) => {
    if (signal >= -50) return 'text-green-400';
    if (signal >= -70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading network data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Forensic Analysis
            <Badge variant="outline" className="ml-auto">
              {filteredAndSortedNetworks.length} networks
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search BSSID or SSID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-networks"
              />
            </div>

            {/* Security Filter */}
            <Select value={securityFilter} onValueChange={setSecurityFilter}>
              <SelectTrigger data-testid="select-security-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Security type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Security</SelectItem>
                <SelectItem value="encrypted">Encrypted</SelectItem>
                <SelectItem value="open">Open Networks</SelectItem>
                <SelectItem value="wpa">WPA/WPA2</SelectItem>
                <SelectItem value="wep">WEP</SelectItem>
              </SelectContent>
            </Select>

            {/* Octet Grouping */}
            <Select 
              value={selectedOctet?.toString() || 'oui'} 
              onValueChange={(value) => setSelectedOctet(value === 'oui' ? null : parseInt(value))}
            >
              <SelectTrigger data-testid="select-octet-group">
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Group by OUI</SelectItem>
                <SelectItem value="0">1st Octet</SelectItem>
                <SelectItem value="1">2nd Octet</SelectItem>
                <SelectItem value="2">3rd Octet</SelectItem>
                <SelectItem value="3">4th Octet</SelectItem>
                <SelectItem value="4">5th Octet</SelectItem>
                <SelectItem value="5">6th Octet</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger data-testid="select-sort-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bssid">BSSID</SelectItem>
                  <SelectItem value="ssid">SSID</SelectItem>
                  <SelectItem value="signal_strength">Signal</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Groups */}
      <div className="space-y-6">
        {Object.entries(octetGroups).map(([groupKey, groupNetworks]) => (
          <Card key={groupKey} className="border-green-500/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                {selectedOctet !== null ? `Octet ${selectedOctet + 1}: ${groupKey}` : `OUI: ${groupKey}`}
                <Badge variant="outline" className="ml-auto">
                  {groupNetworks.length} networks
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupNetworks.map((network, index) => {
                  const color = bssidToColor(network.bssid);
                  const securityLevel = getSecurityLevel(network.security);
                  
                  return (
                    <div
                      key={`${network.bssid}-${index}`}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border/30 bg-background/40 hover:bg-background/60 transition-colors"
                      data-testid={`network-${network.bssid.replace(/:/g, '-')}`}
                    >
                      {/* BSSID Color Indicator */}
                      <div
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{ backgroundColor: color.hex }}
                        title={`Color: ${color.hex} (H:${Math.round(color.hsl.h)} S:${Math.round(color.hsl.s)} L:${Math.round(color.hsl.l)})`}
                      />

                      {/* Network Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        {/* BSSID */}
                        <div>
                          <p className="font-mono text-sm font-medium text-foreground">
                            {formatBSSID(network.bssid)}
                          </p>
                          <p className="text-xs text-muted-foreground">BSSID</p>
                        </div>

                        {/* SSID */}
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">
                            {network.ssid || 'Hidden Network'}
                          </p>
                          <p className="text-xs text-muted-foreground">SSID</p>
                        </div>

                        {/* Security */}
                        <div>
                          <Badge 
                            variant={securityLevel === 'Open' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {securityLevel}
                          </Badge>
                        </div>

                        {/* Signal Strength */}
                        <div>
                          <p className={`text-sm font-medium ${getSignalStrengthColor(network.signal_strength)}`}>
                            <Signal className="h-3 w-3 inline mr-1" />
                            {network.signal_strength} dBm
                          </p>
                        </div>

                        {/* Frequency */}
                        <div>
                          <p className="text-sm text-foreground">
                            {network.frequency ? `${network.frequency} MHz` : 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {network.frequency > 5000 ? '5GHz' : network.frequency > 2000 ? '2.4GHz' : 'Unknown'}
                          </p>
                        </div>

                        {/* Location/Last Seen */}
                        <div>
                          {network.latitude && network.longitude ? (
                            <p className="text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {network.latitude.toFixed(4)}, {network.longitude.toFixed(4)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {network.last_seen || 'Unknown'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Network Count */}
                      {network.network_count && network.network_count > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {network.network_count} sightings
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedNetworks.length === 0 && (
        <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Networks Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to see more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}