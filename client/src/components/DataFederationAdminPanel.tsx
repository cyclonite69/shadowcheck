/**
 * Data Federation Admin Panel
 * Full admin interface for configuring federation settings
 */

import { useDataFederation, type MergeMode, type DataSourceType } from '@/contexts/DataFederationContext';
import { RadioTypeFilter } from './RadioTypeFilter';
import { Database, Layers, Radio, TrendingUp, Zap, GitMerge, Info } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

export function DataFederationAdminPanel() {
  const {
    mergeMode,
    setMergeMode,
    selectedSources,
    setSelectedSources,
    selectedRadioTypes,
    setSelectedRadioTypes,
    dataSourceType,
    setDataSourceType,
  } = useDataFederation();

  // Fetch federation statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/v1/federated/statistics'],
    queryFn: async () => {
      const res = await fetch('/api/v1/federated/statistics');
      if (!res.ok) throw new Error('Failed to fetch statistics');
      return res.json();
    },
  });

  // Available merge modes
  const mergeModes: { value: MergeMode; label: string; description: string; icon: typeof Layers }[] = [
    {
      value: 'unified',
      label: 'Unified',
      description: 'All observations from all sources',
      icon: Database,
    },
    {
      value: 'deduplicated',
      label: 'Deduplicated',
      description: 'Remove exact duplicates',
      icon: Layers,
    },
    {
      value: 'deduplicated_fuzzy',
      label: 'Fuzzy Dedup',
      description: '±5min temporal, ~100m spatial tolerance',
      icon: GitMerge,
    },
    {
      value: 'smart_merged',
      label: 'Smart Merge',
      description: 'Best field value from each source',
      icon: Zap,
    },
    {
      value: 'precision_merged',
      label: 'Precision',
      description: 'Highest GPS accuracy observations',
      icon: TrendingUp,
    },
    {
      value: 'hybrid',
      label: 'Hybrid',
      description: 'All merge strategies in tandem',
      icon: Radio,
    },
  ];

  // Available data sources
  const dataSources = [
    { id: 'locations_legacy', label: 'Legacy Locations', color: 'text-blue-400' },
    { id: 'kml_staging', label: 'KML Staging', color: 'text-green-400' },
    { id: 'wigle_api', label: 'WiGLE API', color: 'text-purple-400' },
  ];

  // Data source types for surveillance
  const dataSourceTypes: { value: DataSourceType; label: string; description: string }[] = [
    { value: 'legacy', label: 'Legacy', description: 'Original locations_legacy table' },
    { value: 'unified', label: 'Unified', description: 'Federated observations (all sources)' },
    { value: 'kml', label: 'KML Only', description: 'KML staging data only' },
    { value: 'wigle_api', label: 'WiGLE Only', description: 'WiGLE API data only' },
    { value: 'federated', label: 'Federated', description: 'Custom federated query' },
  ];

  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter((s) => s !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className={`h-6 w-6 ${iconColors.special.text}`} />
        <div>
          <h2 className="text-xl font-bold text-slate-200">Data Federation Configuration</h2>
          <p className="text-sm text-slate-400">Configure multi-source data merge strategies</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.federated?.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Unified Observations</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="flex items-center gap-3">
              <Layers className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.deduplicated?.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Deduplicated</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="flex items-center gap-3">
              <GitMerge className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.deduplicated_fuzzy?.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Fuzzy Deduped</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <GitMerge className="h-5 w-5 text-purple-400" />
          Merge Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mergeModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setMergeMode(mode.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  mergeMode === mode.value
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${mergeMode === mode.value ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div className="flex-1">
                    <div className={`font-semibold ${mergeMode === mode.value ? 'text-purple-300' : 'text-slate-300'}`}>
                      {mode.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{mode.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-400" />
          Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dataSources.map((source) => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedSources.includes(source.id)
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <span className={`font-semibold ${selectedSources.includes(source.id) ? source.color : 'text-slate-400'}`}>
                  {source.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Radio className="h-5 w-5 text-green-400" />
          Radio Types
        </h3>
        <RadioTypeFilter
          selectedTypes={selectedRadioTypes}
          onSelectionChange={setSelectedRadioTypes}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          Surveillance Data Source
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataSourceTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setDataSourceType(type.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                dataSourceType === type.value
                  ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="font-semibold text-slate-300">{type.label}</div>
              <div className="text-xs text-slate-400 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-blue-500/5 border-blue-500/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-blue-300 mb-2">About Data Federation</p>
            <p className="text-slate-400">
              Data federation combines observations from multiple sources (legacy locations, KML files, WiGLE API) using
              different merge strategies. Settings are persisted in browser localStorage and affect all pages globally.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
