/**
 * OrphanedNetworksPanel - Display networks without location data
 *
 * Allows batch selection and tagging for WiGLE API enrichment
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, CheckSquare, Square, Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface OrphanedNetwork {
  bssid: string;
  ssid: string;
  frequency: number;
  capabilities: string;
  radio_type: string;
  lasttime: number;
  already_tagged: boolean;
}

interface OrphanedNetworksResponse {
  ok: boolean;
  data: OrphanedNetwork[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
    returned: number;
  };
}

export function OrphanedNetworksPanel() {
  const [selectedBssids, setSelectedBssids] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orphaned networks
  const { data, isLoading, error, refetch } = useQuery<OrphanedNetworksResponse>({
    queryKey: ['/api/v1/wigle/orphaned-networks', page],
    queryFn: async () => {
      const offset = page * pageSize;
      const res = await fetch(`/api/v1/wigle/orphaned-networks?limit=${pageSize}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch orphaned networks');
      return res.json();
    },
  });

  // Tag selected BSSIDs for enrichment
  const tagMutation = useMutation({
    mutationFn: async (bssids: string[]) => {
      const res = await fetch('/api/v1/wigle/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bssids,
          reason: 'orphaned network - no location data',
          priority: 75,
          tagged_by: 'admin'
        })
      });
      if (!res.ok) throw new Error('Failed to tag networks');
      return res.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Networks Tagged',
        description: `Successfully tagged ${result.tagged} networks for WiGLE enrichment`,
      });
      setSelectedBssids(new Set());
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Tagging Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSelect = (bssid: string) => {
    const newSelected = new Set(selectedBssids);
    if (newSelected.has(bssid)) {
      newSelected.delete(bssid);
    } else {
      newSelected.add(bssid);
    }
    setSelectedBssids(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedBssids.size === data?.data.filter(n => !n.already_tagged).length) {
      setSelectedBssids(new Set());
    } else {
      const allUntagged = data?.data.filter(n => !n.already_tagged).map(n => n.bssid) || [];
      setSelectedBssids(new Set(allUntagged));
    }
  };

  const handleTagSelected = () => {
    if (selectedBssids.size === 0) return;
    tagMutation.mutate(Array.from(selectedBssids));
  };

  if (error) {
    return (
      <div className="premium-card p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load orphaned networks: {(error as Error).message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Database className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Orphaned Networks</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Networks without location data ({data?.metadata.total || 0} total)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleTagSelected}
              disabled={selectedBssids.size === 0 || tagMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {tagMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Tagging...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Tag {selectedBssids.size} for WiGLE ({selectedBssids.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No orphaned networks found</p>
            <p className="text-sm mt-1">All networks have location data!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {selectedBssids.size === data?.data.filter(n => !n.already_tagged).length ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">BSSID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">SSID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((network) => (
                    <tr
                      key={network.bssid}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {network.already_tagged ? (
                          <span className="text-slate-600" title="Already tagged for enrichment">
                            <Square className="h-5 w-5" />
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleSelect(network.bssid)}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            {selectedBssids.has(network.bssid) ? (
                              <CheckSquare className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-slate-300">{network.bssid}</code>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {network.ssid || <span className="text-slate-500 italic">Hidden</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs uppercase text-slate-400">{network.radio_type}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {network.frequency ? `${network.frequency} MHz` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {network.already_tagged ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Queued
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            No Location
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.metadata.total > pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.metadata.total)} of {data.metadata.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {page + 1} of {Math.ceil(data.metadata.total / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * pageSize >= data.metadata.total}
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
