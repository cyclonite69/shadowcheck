/**
 * DataSourceToggle - UI component for multi-source data federation
 *
 * Allows users to:
 * 1. Toggle between data modes (unified, deduplicated, smart_merged)
 * 2. Enable/disable individual data sources
 * 3. View source statistics and quality metrics
 * 4. See data completeness indicators
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Database, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSource {
  source_name: string;
  source_type: string;
  description: string;
  is_active: boolean;
  is_trusted: boolean;
  data_quality_score: number;
  import_pipeline: string;
  statistics: {
    total_observations: number;
    unique_networks: number;
    date_range_start: string | null;
    date_range_end: string | null;
    avg_signal_strength: number | null;
  };
}

type DataMode = 'unified' | 'deduplicated' | 'smart_merged' | 'precision_merged';

interface DataSourceToggleProps {
  currentMode: DataMode;
  onModeChange: (mode: DataMode) => void;
  selectedSources?: string[];
  onSourcesChange?: (sources: string[]) => void;
}

export function DataSourceToggle({
  currentMode,
  onModeChange,
  selectedSources,
  onSourcesChange
}: DataSourceToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data sources
  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/sources');
      if (!res.ok) throw new Error('Failed to fetch data sources');
      return res.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const sources: DataSource[] = sourcesData?.sources || [];

  // Toggle source mutation
  const toggleSource = useMutation({
    mutationFn: async ({ sourceName, active }: { sourceName: string; active: boolean }) => {
      const res = await fetch(`/api/v1/federated/sources/${sourceName}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      if (!res.ok) throw new Error('Failed to toggle source');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });

  // Refresh statistics mutation
  const refreshStats = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/federated/sources/refresh', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to refresh statistics');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    }
  });

  const handleToggleSource = (sourceName: string, currentActive: boolean) => {
    toggleSource.mutate({ sourceName, active: !currentActive });
  };

  const activeSources = sources.filter(s => s.is_active);
  const totalObservations = sources.reduce((sum, s) => sum + (s.statistics.total_observations || 0), 0);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Data Source Federation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeSources.length} of {sources.length} sources active • {totalObservations.toLocaleString()} total observations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Configure'}
          </button>
        </div>
      </div>

      {/* Data Mode Selector */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <label className="block text-xs font-medium text-slate-400 mb-2">Data Fusion Mode</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => onModeChange('unified')}
            className={cn(
              "px-3 py-2 text-xs rounded-lg border transition-all",
              currentMode === 'unified'
                ? "bg-blue-500/20 border-blue-500 text-blue-300"
                : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            )}
          >
            <div className="font-semibold">Unified</div>
            <div className="text-[10px] text-slate-400 mt-0.5">All sources</div>
          </button>

          <button
            onClick={() => onModeChange('deduplicated')}
            className={cn(
              "px-3 py-2 text-xs rounded-lg border transition-all",
              currentMode === 'deduplicated'
                ? "bg-blue-500/20 border-blue-500 text-blue-300"
                : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            )}
          >
            <div className="font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Deduplicated
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">No duplicates</div>
          </button>

          <button
            onClick={() => onModeChange('smart_merged')}
            className={cn(
              "px-3 py-2 text-xs rounded-lg border transition-all relative",
              currentMode === 'smart_merged'
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            )}
          >
            <div className="font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Smart Merge
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Best of each</div>
          </button>

          <button
            onClick={() => onModeChange('precision_merged')}
            className={cn(
              "px-3 py-2 text-xs rounded-lg border transition-all relative",
              currentMode === 'precision_merged'
                ? "bg-purple-500/20 border-purple-500 text-purple-300"
                : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
            )}
          >
            <div className="font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Precision
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Highest precision</div>
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-purple-500 text-white rounded-full">
              MAX
            </span>
          </button>
        </div>

        {/* Mode Description */}
        <div className="mt-3 px-3 py-2 bg-slate-900/50 rounded border border-slate-700">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              {currentMode === 'unified' && "Shows all observations from all active sources. May include duplicates across sources for enrichment."}
              {currentMode === 'deduplicated' && "Removes duplicate observations (same BSSID/time/location), keeping highest quality source."}
              {currentMode === 'smart_merged' && "Intelligently selects best field value from each source - creates most complete and accurate picture."}
              {currentMode === 'precision_merged' && "Advanced precision-aware merge: selects highest precision GPS, strongest signal, most complete metadata. Best for forensic analysis."}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Source Controls */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300">Individual Sources</h4>
            <button
              onClick={() => refreshStats.mutate()}
              disabled={refreshStats.isPending}
              className="px-2 py-1 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors disabled:opacity-50"
            >
              {refreshStats.isPending ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-slate-400 text-xs py-4">Loading sources...</div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.source_name}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    source.is_active
                      ? "bg-slate-700/30 border-slate-600"
                      : "bg-slate-800/30 border-slate-700 opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Source Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {source.source_name}
                        </span>
                        <span className={cn(
                          "px-1.5 py-0.5 text-[9px] rounded uppercase font-medium",
                          source.source_type === 'production' ? "bg-blue-500/20 text-blue-300" :
                          source.source_type === 'enrichment' ? "bg-purple-500/20 text-purple-300" :
                          "bg-yellow-500/20 text-yellow-300"
                        )}>
                          {source.source_type}
                        </span>
                        {source.is_trusted && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">{source.description}</p>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-500">Observations:</span>
                          <span className="text-slate-300 ml-1 font-mono">
                            {source.statistics.total_observations?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Networks:</span>
                          <span className="text-slate-300 ml-1 font-mono">
                            {source.statistics.unique_networks?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Quality:</span>
                          <span className={cn(
                            "ml-1 font-mono font-semibold",
                            source.data_quality_score >= 0.9 ? "text-emerald-400" :
                            source.data_quality_score >= 0.7 ? "text-yellow-400" :
                            "text-orange-400"
                          )}>
                            {(source.data_quality_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleSource(source.source_name, source.is_active)}
                      disabled={toggleSource.isPending}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-50",
                        source.is_active
                          ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-slate-600/50 text-slate-400 hover:bg-slate-600"
                      )}
                    >
                      {source.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Disabled
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer - Quick Stats */}
      {currentMode === 'smart_merged' && !isExpanded && (
        <div className="px-4 py-2 bg-emerald-500/10 border-t border-emerald-500/20">
          <p className="text-xs text-emerald-300 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Intelligent field-level merge active - showing best data from all sources
          </p>
        </div>
      )}

      {currentMode === 'precision_merged' && !isExpanded && (
        <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20">
          <p className="text-xs text-purple-300 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Precision-aware merge active - highest GPS accuracy, strongest signals, most complete metadata
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight badge component for showing active mode
 */
export function DataModeBadge({ mode }: { mode: DataMode }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium",
      mode === 'precision_merged' ? "bg-purple-500/20 text-purple-300" :
      mode === 'smart_merged' ? "bg-emerald-500/20 text-emerald-300" :
      mode === 'deduplicated' ? "bg-blue-500/20 text-blue-300" :
      "bg-slate-500/20 text-slate-300"
    )}>
      {mode === 'precision_merged' && <Zap className="h-3 w-3" />}
      {mode === 'smart_merged' && <Zap className="h-3 w-3" />}
      {mode === 'deduplicated' && <CheckCircle2 className="h-3 w-3" />}
      {mode === 'unified' && <Database className="h-3 w-3" />}
      {mode === 'precision_merged' ? 'Precision' :
       mode === 'smart_merged' ? 'Smart Merge' :
       mode === 'deduplicated' ? 'Deduplicated' :
       'Unified'}
    </span>
  );
}
