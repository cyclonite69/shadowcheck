/**
 * WiGLE API Data Viewer with Mapbox
 * Displays networks enriched from WiGLE with all observation points
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Radio, Clock, Signal, Globe } from 'lucide-react';
import { WiGLEMapViewer } from '@/components/WiGLEMapViewer';

interface WiGLENetwork {
  wigle_api_net_id: number;
  bssid: string;
  ssid: string;
  frequency: number | null;
  capabilities: string;
  type: string;
  lasttime: string;
  lastlat: number;
  lastlon: number;
  trilat: number;
  trilong: number;
  channel: number;
  qos: number;
  country: string;
  region: string;
  city: string;
  query_timestamp: string;
}

interface WiGLENetworkDetail extends WiGLENetwork {
  observation_count: number;
  observations: Array<{
    wigle_api_loc_id: number;
    bssid: string;
    lat: number;
    lon: number;
    altitude: number | null;
    accuracy: number | null;
    time: string;
    signal_level: number | null;
    query_timestamp: string;
  }>;
}

export default function WiGLEViewer() {
  const [selectedBSSID, setSelectedBSSID] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Fetch list of WiGLE networks
  const { data: networksData, isLoading: networksLoading } = useQuery({
    queryKey: ['wigle-networks', page, limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/wigle/networks?limit=${limit}&offset=${page * limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch WiGLE networks');
      return response.json();
    }
  });

  // Fetch detailed network data when a network is selected
  const { data: networkDetail, isLoading: detailLoading } = useQuery<{
    ok: boolean;
    network: WiGLENetworkDetail;
  }>({
    queryKey: ['wigle-network', selectedBSSID],
    queryFn: async () => {
      if (!selectedBSSID) throw new Error('No BSSID selected');
      const response = await fetch(`/api/v1/wigle/network/${selectedBSSID}`);
      if (!response.ok) throw new Error('Failed to fetch network details');
      return response.json();
    },
    enabled: !!selectedBSSID
  });

  const networks: WiGLENetwork[] = networksData?.data || [];
  const totalNetworks = networksData?.metadata?.total || 0;
  const totalPages = Math.ceil(totalNetworks / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WiGLE API Data Viewer</h1>
          <p className="text-muted-foreground mt-1">
            Networks enriched from WiGLE.net database
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Globe className="h-4 w-4 mr-2" />
          {totalNetworks.toLocaleString()} Networks
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network List */}
        <Card>
          <CardHeader>
            <CardTitle>Networks from WiGLE</CardTitle>
          </CardHeader>
          <CardContent>
            {networksLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading networks...
              </div>
            ) : networks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No WiGLE networks found. Use the enrichment panel to fetch data.
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {networks.map((network) => (
                    <button
                      key={network.wigle_api_net_id}
                      onClick={() => setSelectedBSSID(network.bssid)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedBSSID === network.bssid
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Radio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-sm font-medium truncate">
                              {network.bssid}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {network.ssid || '<hidden>'}
                          </div>
                          {network.city && network.region && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {network.city}, {network.region}
                            </div>
                          )}
                        </div>
                        {network.channel && (
                          <Badge variant="secondary" className="ml-2">
                            Ch {network.channel}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Network Detail & Map */}
        <Card>
          <CardHeader>
            <CardTitle>Network Details & Location Map</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedBSSID ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a network from the list to view details and map
              </div>
            ) : detailLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading network details...
              </div>
            ) : networkDetail?.network ? (
              <div className="space-y-4">
                {/* Network Info */}
                <div className="space-y-3 pb-4 border-b">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">BSSID</div>
                      <div className="font-mono font-medium">
                        {networkDetail.network.bssid}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">SSID</div>
                      <div className="font-medium">
                        {networkDetail.network.ssid || '<hidden>'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Channel</div>
                      <div className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        {networkDetail.network.channel || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Encryption</div>
                      <div>{networkDetail.network.capabilities || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Observations</div>
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3" />
                        {networkDetail.network.observation_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Seen</div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {new Date(networkDetail.network.lasttime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {networkDetail.network.city && (
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="text-sm font-medium">
                        {networkDetail.network.city}, {networkDetail.network.region},{' '}
                        {networkDetail.network.country}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map */}
                <WiGLEMapViewer network={networkDetail.network} />

                {/* Observations Table */}
                <div>
                  <h4 className="font-medium mb-2">All Observations</h4>
                  <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Time</th>
                          <th className="px-3 py-2 text-left">Location</th>
                          <th className="px-3 py-2 text-right">Signal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {networkDetail.network.observations.map((obs) => (
                          <tr key={obs.wigle_api_loc_id} className="hover:bg-accent">
                            <td className="px-3 py-2 whitespace-nowrap">
                              {new Date(obs.time).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">
                              {obs.lat.toFixed(5)}, {obs.lon.toFixed(5)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {obs.signal_level ? `${obs.signal_level} dBm` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-destructive">
                Failed to load network details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
