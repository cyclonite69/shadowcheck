/**
 * WigleEnrichmentPanel - Test panel for WiGLE API pipeline with security classification
 *
 * Features:
 * - Tag BSSIDs for enrichment
 * - View enrichment queue with security analysis
 * - Trigger enrichment processing
 * - Display enriched networks with comprehensive security classification
 * - Security-focused analytics
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database, Play, Trash2, Plus, RefreshCw, AlertTriangle,
  Shield, ShieldAlert, ShieldCheck, ShieldX, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { UnifiedObservationModal, type ObservationData, type SecurityClassification } from './UnifiedObservationModal';

interface QueueItem {
  tag_id: number;
  bssid: string;
  tagged_at: string;
  tagged_by: string;
  tag_reason: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  error_message?: string;
  wigle_records_found?: number;
  wigle_locations_found?: number;
  has_local_data?: boolean;
  has_wigle_data?: boolean;
}

interface EnrichedNetwork {
  netid: string;
  ssid: string;
  qos: number;
  channel: number;
  encryption: string;
  type: string;
  lasttime: string;
  lastupdt: string;
  trilat: number;
  trilong: number;
  country?: string;
  region?: string;
  city?: string;
}

interface EnrichmentStats {
  total_tagged: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  networks_enriched: number;
  locations_collected: number;
}

/**
 * Security classification mapping for quick visual assessment
 */
function getSecurityBadge(encryption: string): { label: string; color: string; Icon: typeof Shield } {
  const enc = encryption.toLowerCase();

  if (enc === 'none' || enc === 'open' || !enc) {
    return { label: 'OPEN', color: 'bg-red-500/20 text-red-400 border-red-500/30', Icon: ShieldX };
  }
  if (enc.includes('wep')) {
    return { label: 'WEP', color: 'bg-red-500/20 text-red-400 border-red-500/30', Icon: ShieldAlert };
  }
  if (enc.includes('wpa3')) {
    return { label: 'WPA3', color: 'bg-green-500/20 text-green-400 border-green-500/30', Icon: ShieldCheck };
  }
  if (enc.includes('wpa2')) {
    return { label: 'WPA2', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', Icon: ShieldCheck };
  }
  if (enc.includes('wpa')) {
    return { label: 'WPA', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', Icon: ShieldAlert };
  }

  return { label: 'UNKNOWN', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', Icon: Shield };
}

export function WigleEnrichmentPanel() {
  const queryClient = useQueryClient();
  const [newBssid, setNewBssid] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<ObservationData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch enrichment queue
  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['wigle', 'queue'],
    queryFn: async () => {
      const res = await fetch('/api/v1/wigle/queue?status=pending&limit=50');
      if (!res.ok) throw new Error('Failed to fetch queue');
      return res.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Fetch enrichment stats
  const { data: statsData } = useQuery({
    queryKey: ['wigle', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/wigle/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch enriched networks
  const { data: networksData, isLoading: networksLoading } = useQuery({
    queryKey: ['wigle', 'networks'],
    queryFn: async () => {
      const res = await fetch('/api/v1/wigle/networks?limit=100');
      if (!res.ok) throw new Error('Failed to fetch networks');
      return res.json();
    },
  });

  // Tag BSSID mutation
  const tagMutation = useMutation({
    mutationFn: async (bssid: string) => {
      const res = await fetch('/api/v1/wigle/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bssids: [bssid],
          reason: 'manual tag from test panel',
          priority: 50,
          tagged_by: 'test-panel'
        })
      });
      if (!res.ok) throw new Error('Failed to tag BSSID');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wigle', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['wigle', 'stats'] });
      setNewBssid('');
    }
  });

  // Enrich mutation
  const enrichMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/wigle/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ async: true, limit: 10 })
      });
      if (!res.ok) throw new Error('Failed to start enrichment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wigle', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['wigle', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['wigle', 'networks'] });
    }
  });

  // Delete from queue mutation
  const deleteMutation = useMutation({
    mutationFn: async (tagId: number) => {
      const res = await fetch(`/api/v1/wigle/tag/${tagId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tag');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wigle', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['wigle', 'stats'] });
    }
  });

  const stats: EnrichmentStats | undefined = statsData?.stats;
  const queue: QueueItem[] = queueData?.data || [];
  const networks: EnrichedNetwork[] = networksData?.networks || [];

  // Calculate security distribution
  const securityDistribution = networks.reduce((acc, net) => {
    const { label } = getSecurityBadge(net.encryption);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleTagBssid = () => {
    if (!newBssid.trim()) return;
    tagMutation.mutate(newBssid.trim());
  };

  const handleViewDetails = (network: EnrichedNetwork) => {
    const obs: ObservationData = {
      bssid: network.netid,
      ssid: network.ssid,
      encryption: network.encryption.toLowerCase() as SecurityClassification,
      radio_technology: network.type || 'WiFi',
      channel: network.channel,
      location: network.trilat && network.trilong ? {
        lat: network.trilat,
        lng: network.trilong
      } : undefined,
      wigle_data: {
        country: network.country,
        region: network.region,
        city: network.city,
        last_updated: network.lastupdt,
        qos: network.qos
      }
    };
    setSelectedNetwork(obs);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Database className="h-6 w-6 text-purple-400" />
            WiGLE API Enrichment Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Test interface for WiGLE data enrichment with security classification analysis
          </p>
        </div>

        <Button
          onClick={() => enrichMutation.mutate()}
          disabled={enrichMutation.isPending || queue.length === 0}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Play className="h-4 w-4" />
          {enrichMutation.isPending ? 'Processing...' : 'Start Enrichment'}
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard label="Total Tagged" value={stats.total_tagged} color="text-slate-300" />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-400" />
          <StatCard label="Processing" value={stats.processing} color="text-blue-400" />
          <StatCard label="Completed" value={stats.completed} color="text-green-400" Icon={CheckCircle} />
          <StatCard label="Failed" value={stats.failed} color="text-red-400" Icon={XCircle} />
          <StatCard label="Networks" value={stats.networks_enriched} color="text-purple-400" />
          <StatCard label="Locations" value={stats.locations_collected} color="text-cyan-400" />
        </div>
      )}

      {/* Security Distribution */}
      {networks.length > 0 && (
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            Security Classification Distribution ({networks.length} networks)
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(securityDistribution).map(([label, count]) => {
              const { color, Icon } = getSecurityBadge(label);
              return (
                <Badge key={label} className={cn("gap-2 px-3 py-1", color)}>
                  <Icon className="h-3 w-3" />
                  {label}: {count}
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tag New BSSID */}
      <Card className="p-4 bg-slate-800/50 border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Tag BSSID for Enrichment</h3>
        <div className="flex gap-2">
          <Input
            placeholder="AA:BB:CC:DD:EE:FF"
            value={newBssid}
            onChange={(e) => setNewBssid(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTagBssid()}
            className="font-mono bg-slate-900 border-slate-700 text-slate-200"
          />
          <Button
            onClick={handleTagBssid}
            disabled={tagMutation.isPending || !newBssid.trim()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Tag
          </Button>
        </div>
        {tagMutation.isError && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {tagMutation.error.message}
          </p>
        )}
      </Card>

      {/* Tabs for Queue and Networks */}
      <Tabs defaultValue="networks" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="networks" className="gap-2">
            <Database className="h-4 w-4" />
            Enriched Networks ({networks.length})
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Enrichment Queue ({queue.length})
          </TabsTrigger>
        </TabsList>

        {/* Enriched Networks Tab */}
        <TabsContent value="networks" className="space-y-2">
          {networksLoading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading networks...</p>
          ) : networks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              No enriched networks yet. Tag BSSIDs and run enrichment to see results.
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {networks.map((network) => {
                const security = getSecurityBadge(network.encryption);
                const SecurityIcon = security.Icon;

                return (
                  <Card
                    key={network.netid}
                    className="p-4 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(network)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <code className="text-sm font-mono text-slate-200">{network.netid}</code>
                          <span className="text-sm font-medium text-slate-300">
                            {network.ssid || <span className="italic text-slate-500">Hidden</span>}
                          </span>
                          <Badge className={cn("gap-1.5 text-xs", security.color)}>
                            <SecurityIcon className="h-3 w-3" />
                            {security.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>Type: {network.type}</span>
                          <span>Channel: {network.channel}</span>
                          <span>QoS: {network.qos}</span>
                          {network.city && (
                            <span className="text-slate-500">
                              {network.city}, {network.region}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Enrichment Queue Tab */}
        <TabsContent value="queue" className="space-y-2">
          {queueLoading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading queue...</p>
          ) : queue.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 italic">
              Queue is empty. Tag BSSIDs above to add them to the enrichment queue.
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {queue.map((item) => (
                <Card key={item.tag_id} className="p-4 bg-slate-800/50 border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono text-slate-200">{item.bssid}</code>
                        <StatusBadge status={item.status} />
                        {item.has_local_data && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            Local Data
                          </Badge>
                        )}
                        {item.has_wigle_data && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            WiGLE Data
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Priority: {item.priority}</span>
                        <span>Tagged by: {item.tagged_by}</span>
                        <span>Reason: {item.tag_reason}</span>
                      </div>

                      {item.error_message && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {item.error_message}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.tag_id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <UnifiedObservationModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        observation={selectedNetwork}
      />
    </div>
  );
}

/**
 * Helper Components
 */

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  Icon?: typeof CheckCircle;
}

function StatCard({ label, value, color, Icon }: StatCardProps) {
  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 uppercase">{label}</p>
        {Icon && <Icon className={cn("h-4 w-4", color)} />}
      </div>
      <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: QueueItem['status'] }) {
  const config = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };

  const { label, color } = config[status];

  return (
    <Badge className={cn("text-xs", color)}>
      {label}
    </Badge>
  );
}
