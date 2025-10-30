/**
 * SourceComparisonView - Side-by-side comparison of individual data pipelines
 *
 * Allows users to:
 * 1. Select multiple data sources individually
 * 2. View comparative statistics and quality metrics
 * 3. See observation differences/overlaps
 * 4. Meld selected sources together with configurable merge strategy
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  GitCompare,
  BarChart3,
  Layers,
  CheckSquare,
  Square,
  Zap,
  TrendingUp,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceStatistics {
  source_name: string;
  source_type: string;
  total_observations: number;
  unique_networks: number;
  date_range_start: string | null;
  date_range_end: string | null;
  avg_signal_strength: number | null;
  quality_score: number;
}

interface RadioTypeBreakdown {
  source_name: string;
  radio_types: Record<string, {
    observation_count: number;
    unique_networks: number;
    avg_signal: number | null;
    earliest: string;
    latest: string;
  }>;
}

interface SourceComparisonViewProps {
  onMergeRequested?: (selectedSources: string[], mode: string) => void;
}

export function SourceComparisonView({ onMergeRequested }: SourceComparisonViewProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>(['locations_legacy']);
  const [mergeMode, setMergeMode] = useState<'unified' | 'deduplicated' | 'smart_merged'>('smart_merged');

  // Fetch available sources
  const { data: sourcesData } = useQuery({
    queryKey: ['dataSources'],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/sources');
      if (!res.ok) throw new Error('Failed to fetch sources');
      return res.json();
    },
    refetchInterval: 30000
  });

  // Fetch statistics for all sources
  const { data: statsData } = useQuery({
    queryKey: ['sourceStatistics'],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/sources');
      if (!res.ok) throw new Error('Failed to fetch statistics');
      return res.json();
    }
  });

  // Fetch comparative radio type breakdown
  const { data: comparisonData } = useQuery({
    queryKey: ['sourceComparison'],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/comparison');
      if (!res.ok) throw new Error('Failed to fetch comparison');
      return res.json();
    }
  });

  const sources = sourcesData?.sources || [];
  const comparison: RadioTypeBreakdown[] = comparisonData?.sources || [];

  const toggleSource = (sourceName: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceName)
        ? prev.filter(s => s !== sourceName)
        : [...prev, sourceName]
    );
  };

  const handleMerge = () => {
    if (onMergeRequested && selectedSources.length > 0) {
      onMergeRequested(selectedSources, mergeMode);
    }
  };

  // Calculate comparison metrics
  const getSourceStats = (sourceName: string) => {
    return sources.find((s: any) => s.source_name === sourceName);
  };

  const getRadioBreakdown = (sourceName: string) => {
    return comparison.find(c => c.source_name === sourceName);
  };

  const radioTypes = ['W', 'B', 'E', 'L', 'G'] as const;
  const radioTypeLabels: Record<string, string> = {
    W: 'WiFi',
    B: 'Bluetooth',
    E: 'LTE',
    L: 'LoRa',
    G: 'GSM'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <GitCompare className="h-6 w-6 text-emerald-400" />
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Data Pipeline Comparison</h2>
            <p className="text-sm text-slate-400">
              Select individual sources to compare and optionally meld together
            </p>
          </div>
        </div>

        {/* Source Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((source: any) => {
            const isSelected = selectedSources.includes(source.source_name);
            const stats = source.statistics || {};

            return (
              <button
                key={source.source_name}
                onClick={() => toggleSource(source.source_name)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500"
                    : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-500" />
                    )}
                    <span className="text-sm font-semibold text-slate-200">
                      {source.source_name}
                    </span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 text-xs rounded uppercase font-medium",
                    source.source_type === 'production' ? "bg-blue-500/20 text-blue-300" :
                    source.source_type === 'enrichment' ? "bg-purple-500/20 text-purple-300" :
                    "bg-yellow-500/20 text-yellow-300"
                  )}>
                    {source.source_type}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3">{source.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Observations:</span>
                    <div className="text-slate-200 font-mono font-semibold">
                      {stats.total_observations?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Networks:</span>
                    <div className="text-slate-200 font-mono font-semibold">
                      {stats.unique_networks?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Quality:</span>
                    <div className={cn(
                      "font-mono font-semibold",
                      source.data_quality_score >= 0.9 ? "text-emerald-400" :
                      source.data_quality_score >= 0.7 ? "text-yellow-400" :
                      "text-orange-400"
                    )}>
                      {(source.data_quality_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Avg Signal:</span>
                    <div className="text-slate-200 font-mono font-semibold">
                      {stats.avg_signal_strength ? `${stats.avg_signal_strength.toFixed(0)} dBm` : 'N/A'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
              {selectedSources.length > 0 && (
                <span className="ml-2 text-slate-500">
                  ({selectedSources.join(', ')})
                </span>
              )}
            </span>
            {selectedSources.length > 1 && (
              <button
                onClick={handleMerge}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Meld Selected Sources
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Merge Mode Selector (shown when multiple sources selected) */}
      {selectedSources.length > 1 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            Merge Strategy
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMergeMode('unified')}
              className={cn(
                "p-3 rounded-lg border transition-all",
                mergeMode === 'unified'
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              )}
            >
              <Database className="h-5 w-5 mb-2 text-blue-400" />
              <div className="text-xs font-semibold text-slate-200">Unified</div>
              <div className="text-xs text-slate-400 mt-1">All observations from all sources</div>
            </button>

            <button
              onClick={() => setMergeMode('deduplicated')}
              className={cn(
                "p-3 rounded-lg border transition-all",
                mergeMode === 'deduplicated'
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              )}
            >
              <CheckSquare className="h-5 w-5 mb-2 text-blue-400" />
              <div className="text-xs font-semibold text-slate-200">Deduplicated</div>
              <div className="text-xs text-slate-400 mt-1">Remove duplicates, keep highest quality</div>
            </button>

            <button
              onClick={() => setMergeMode('smart_merged')}
              className={cn(
                "p-3 rounded-lg border transition-all",
                mergeMode === 'smart_merged'
                  ? "bg-emerald-500/20 border-emerald-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              )}
            >
              <Zap className="h-5 w-5 mb-2 text-emerald-400" />
              <div className="text-xs font-semibold text-slate-200">Smart Merge</div>
              <div className="text-xs text-slate-400 mt-1">Best field value from each source</div>
            </button>
          </div>
        </div>
      )}

      {/* Comparative Analysis Table */}
      {selectedSources.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Radio Type Breakdown Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3 text-slate-400 font-medium">Source</th>
                  {radioTypes.map(type => (
                    <th key={type} className="text-center p-3 text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-1">
                        <Radio className="h-4 w-4" />
                        <span>{radioTypeLabels[type]}</span>
                      </div>
                    </th>
                  ))}
                  <th className="text-right p-3 text-slate-400 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedSources.map(sourceName => {
                  const breakdown = getRadioBreakdown(sourceName);
                  const stats = getSourceStats(sourceName);

                  return (
                    <tr key={sourceName} className="border-b border-slate-700/50">
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{sourceName}</div>
                        <div className="text-xs text-slate-500">{stats?.source_type}</div>
                      </td>
                      {radioTypes.map(type => {
                        const typeData = breakdown?.radio_types[type];
                        return (
                          <td key={type} className="p-3 text-center">
                            {typeData ? (
                              <div>
                                <div className="font-mono text-slate-200 font-semibold">
                                  {typeData.observation_count.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {typeData.unique_networks.toLocaleString()} networks
                                </div>
                                {typeData.avg_signal && (
                                  <div className="text-xs text-slate-500">
                                    {typeData.avg_signal.toFixed(0)} dBm
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right">
                        <div className="font-mono text-slate-200 font-bold">
                          {stats?.statistics?.total_observations?.toLocaleString() || '0'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overlap Analysis (when multiple sources selected) */}
      {selectedSources.length > 1 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            Data Overlap & Uniqueness
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Overlapping Observations</div>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                <DuplicateCounter selectedSources={selectedSources} />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Same BSSID + time + location
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Unique to Single Source</div>
              <div className="text-2xl font-bold text-blue-400 font-mono">
                <UniqueCounter selectedSources={selectedSources} />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Only in one selected source
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Data Quality Gain</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {selectedSources.length > 1 ? '+' : ''}
                {selectedSources.length > 1
                  ? ((selectedSources.length - 1) * 15).toFixed(0)
                  : '0'}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Estimated completeness improvement
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper component to count duplicate observations across selected sources
 */
function DuplicateCounter({ selectedSources }: { selectedSources: string[] }) {
  const { data } = useQuery({
    queryKey: ['duplicates', selectedSources],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/duplicates?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch duplicates');
      return res.json();
    },
    enabled: selectedSources.length > 1
  });

  // Filter duplicates to only those that exist in selected sources
  const relevantDuplicates = data?.duplicates?.filter((dup: any) =>
    dup.sources.some((s: string) => selectedSources.includes(s))
  ) || [];

  return <>{relevantDuplicates.length.toLocaleString()}</>;
}

/**
 * Helper component to count unique observations per source
 */
function UniqueCounter({ selectedSources }: { selectedSources: string[] }) {
  const { data } = useQuery({
    queryKey: ['duplicates', selectedSources],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/duplicates?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch duplicates');
      return res.json();
    },
    enabled: selectedSources.length > 1
  });

  // Count observations that only exist in one of the selected sources
  const uniqueCount = data?.duplicates?.filter((dup: any) =>
    dup.source_count === 1 && selectedSources.includes(dup.sources[0])
  ).length || 0;

  return <>{uniqueCount.toLocaleString()}</>;
}
