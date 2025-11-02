import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Database, Trash2, GitMerge, CheckCircle2, Loader2, HardDrive, Smartphone, Map } from 'lucide-react';
import { iconColors, getIconContainerClasses, getIconTextColor } from '@/lib/iconColors';

interface KMLFile {
  filename: string;
  imported: boolean;
  observations: number;
}

interface WiGLEFile {
  filename: string;
  type: string;
}

interface KismetFile {
  filename: string;
  imported: boolean;
  devices: number;
  size: number;
  sizeFormatted: string;
}

interface KMLStats {
  networks_count: string;
  locations_count: string;
  files_imported: string;
  first_import: string | null;
  last_import: string | null;
}

interface KismetStats {
  devices_count: string;
  datasources_count: string;
  packets_count: string;
  alerts_count: string;
  snapshots_count: string;
  files_imported: string;
  first_import: string | null;
  last_import: string | null;
}

interface WigleApiStats {
  networks: string;
  locations: string;
  unique_queries: string;
  last_import: string | null;
}

// Simple component to show WiGLE staging data
function WigleStagingPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/wigle-api/staging-data'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/wigle-api/staging-data');
      return res.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className="premium-card">
        <CardContent className="pt-6">
          <Skeleton className="h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  const observations = data?.observations || [];
  const displayLimit = 50; // Limit displayed observations to prevent page freeze
  const displayedObservations = observations.slice(0, displayLimit);

  if (observations.length === 0) {
    return (
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <Map className="h-5 w-5 text-slate-400" />
            Staging Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No staging data to display</p>
            <p className="text-xs mt-2">Query WiGLE API to import observations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Map className="h-5 w-5 text-green-400" />
          Staging Data Preview ({observations.length} total observations)
        </CardTitle>
        {observations.length > displayLimit && (
          <p className="text-xs text-amber-400 mt-1">
            Showing first {displayLimit} observations to prevent performance issues
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {displayedObservations.map((obs: any, idx: number) => (
            <div key={`${obs.bssid}-${idx}`} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-100 truncate">{obs.ssid || '<hidden>'}</p>
                    {obs.threat_level && (
                      <Badge variant={obs.threat_level === 'EXTREME' || obs.threat_level === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-xs shrink-0">
                        {obs.threat_level}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400">{obs.bssid}</p>
                  {obs.observation_time && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(obs.observation_time).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {obs.frequency && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-1 text-xs">
                      {obs.frequency} MHz
                    </Badge>
                  )}
                  {obs.signal_level && (
                    <p className="text-xs text-slate-400">Signal: {obs.signal_level} dBm</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {obs.lat.toFixed(6)}, {obs.lon.toFixed(6)}
                  </p>
                  {obs.distance_from_home_km && (
                    <p className="text-xs text-amber-400 mt-1">
                      {obs.distance_from_home_km} km away
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${obs.lat},${obs.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 hover:text-green-300 mt-1 inline-block"
                  >
                    View on Map →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelinesPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState<string | null>(null);
  const [includePackets, setIncludePackets] = useState(false);
  const [, navigate] = useLocation();

  // ==================== KML PIPELINE ====================

  const { data: kmlFilesData, isLoading: kmlFilesLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kml/files'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/files');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: kmlStatsData, isLoading: kmlStatsLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kml/stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/stats');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const importKMLMutation = useMutation({
    mutationFn: async (filename: string) => {
      const res = await fetch('/api/v1/pipelines/kml/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      return res.json();
    },
    onSuccess: (data, filename) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      setImporting(null);
      if (data.ok) {
        toast({
          title: 'KML import successful',
          description: `${filename}: ${data.stats.networks} networks, ${data.stats.locations} observations`,
        });
      } else {
        toast({
          title: 'KML import failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
  });

  const importAllKMLMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/import-all', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      setImporting(null);
      if (data.ok) {
        toast({
          title: 'KML bulk import complete',
          description: `${data.summary.successful}/${data.summary.total_files} files imported`,
        });
      }
    },
  });

  const mergeKMLMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/merge', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      toast({
        title: 'KML merge complete',
        description: `Merged ${data.merged.networks} networks and ${data.merged.locations} observations`,
      });
    },
  });

  const clearKMLMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/clear', { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/files'] });
      toast({ title: 'KML staging cleared' });
    },
  });

  // ==================== WIGLE PIPELINE ====================

  const { data: wigleFilesData } = useQuery({
    queryKey: ['/api/v1/pipelines/wigle/files'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/wigle/files');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const importWiGLEMutation = useMutation({
    mutationFn: async (filename: string) => {
      const res = await fetch('/api/v1/pipelines/wigle/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      return res.json();
    },
    onSuccess: (data, filename) => {
      setImporting(null);
      if (data.ok) {
        toast({
          title: 'WiGLE import successful',
          description: `${filename}: ${data.stats.networks} networks, ${data.stats.locations} observations imported to production`,
        });
      } else {
        toast({
          title: 'WiGLE import failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
  });

  const [wigleApiQuery, setWigleApiQuery] = useState({
    ssid: '',
    bssid: '',
    latrange1: '',
    latrange2: '',
    longrange1: '',
    longrange2: ''
  });

  // WiGLE API stats query
  const { data: wigleApiStatsData, isLoading: wigleApiStatsLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/wigle-api/stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/wigle-api/stats');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const wigleApiMutation = useMutation({
    mutationFn: async (query: any) => {
      // If ONLY BSSID is provided, use detail endpoint to get full observation history
      const isBssidOnly = query.bssid && !query.ssid && !query.latrange1;
      const endpoint = isBssidOnly ? '/api/v1/pipelines/wigle-api/detail' : '/api/v1/pipelines/wigle-api/query';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isBssidOnly ? { bssid: query.bssid } : query),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/wigle-api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/wigle-api/staging-data'] });
      if (data.ok) {
        const message = data.stats?.observations_imported
          ? `Imported ${data.stats.observations_imported} observations for ${data.bssid}`
          : `Imported ${data.stats.networks} networks and ${data.stats.locations} locations to staging`;
        toast({
          title: 'WiGLE API import successful',
          description: message,
        });
        // Reset form
        setWigleApiQuery({ ssid: '', bssid: '', latrange1: '', latrange2: '', longrange1: '', longrange2: '' });
      } else {
        toast({
          title: 'WiGLE API import failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
  });

  const clearWigleApiMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/wigle-api/clear', {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/wigle-api/stats'] });
      if (data.ok) {
        toast({
          title: 'WiGLE API staging cleared',
          description: 'All staging data has been removed',
        });
      } else {
        toast({
          title: 'Clear failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
  });

  // ==================== KISMET PIPELINE ====================

  const { data: kismetFilesData, isLoading: kismetFilesLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kismet/files'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kismet/files');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: kismetStatsData, isLoading: kismetStatsLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kismet/stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kismet/stats');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const importKismetMutation = useMutation({
    mutationFn: async ({ filename, includePackets }: { filename: string; includePackets: boolean }) => {
      const res = await fetch('/api/v1/pipelines/kismet/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, includePackets }),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kismet/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kismet/stats'] });
      setImporting(null);
      if (data.ok) {
        toast({
          title: 'Kismet import successful',
          description: `${variables.filename}: ${data.stats.devices} devices, ${data.stats.datasources} datasources`,
        });
      } else {
        toast({
          title: 'Kismet import failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
  });

  const clearKismetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kismet/clear', { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kismet/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kismet/files'] });
      toast({ title: 'Kismet staging cleared' });
    },
  });

  const kmlStats: KMLStats | null = kmlStatsData?.stats || null;
  const kmlFiles: KMLFile[] = kmlFilesData?.files || [];
  const wigleFiles: WiGLEFile[] = wigleFilesData?.files || [];
  const kismetStats: KismetStats | null = kismetStatsData?.stats || null;
  const kismetFiles: KismetFile[] = kismetFilesData?.files || [];

  return (
    <Tabs defaultValue="kml" className="w-full">
      <div className="premium-card p-2 mb-6">
        <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2">
          <TabsTrigger value="kml" className="premium-card hover:scale-105 flex items-center gap-2">
            <FileText className={`h-4 w-4 ${iconColors.info.text}`} />
            <span>KML Files</span>
          </TabsTrigger>
          <TabsTrigger value="wigle" className="premium-card hover:scale-105 flex items-center gap-2">
            <Smartphone className={`h-4 w-4 ${iconColors.success.text}`} />
            <span>WiGLE SQLite</span>
          </TabsTrigger>
          <TabsTrigger value="kismet" className="premium-card hover:scale-105 flex items-center gap-2">
            <HardDrive className={`h-4 w-4 ${iconColors.special.text}`} />
            <span>Kismet</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* ==================== KML TAB ==================== */}
      <TabsContent value="kml" className="space-y-6">
        {/* KML Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">KML Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{kmlFiles.length}</div>
              <p className="text-xs text-slate-400 mt-1">{kmlFiles.filter(f => f.imported).length} imported</p>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Networks (Staging)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kmlStats?.networks_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Observations (Staging)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kmlStats?.locations_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={parseInt(kmlStats?.files_imported || '0') > 0 ? 'default' : 'secondary'}>
                {parseInt(kmlStats?.files_imported || '0') > 0 ? 'Ready to Merge' : 'Empty'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* KML Actions */}
        <Card className="premium-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">KML Pipeline Actions</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => { setImporting('ALL'); importAllKMLMutation.mutate(); }} disabled={importing !== null} className="bg-gradient-to-r from-blue-500 to-cyan-600">
                  {importing === 'ALL' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />Import All</>}
                </Button>
                <Button onClick={() => mergeKMLMutation.mutate()} disabled={mergeKMLMutation.isPending || parseInt(kmlStats?.locations_count || '0') === 0} className="bg-gradient-to-r from-green-500 to-emerald-600">
                  {mergeKMLMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Merging...</> : <><GitMerge className="mr-2 h-4 w-4" />Merge to Production</>}
                </Button>
                <Button onClick={() => clearKMLMutation.mutate()} disabled={clearKMLMutation.isPending || parseInt(kmlStats?.locations_count || '0') === 0} variant="destructive">
                  {clearKMLMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Clearing...</> : <><Trash2 className="mr-2 h-4 w-4" />Clear Staging</>}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* KML Files List */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-100">Available KML Files ({kmlFiles.length})</CardTitle>
            <CardDescription className="text-slate-400">WiGLE KML exports - Import to staging, then merge to production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {kmlFilesLoading ? <Skeleton className="h-16 w-full" /> : kmlFiles.map((file) => (
                <div key={file.filename} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className={getIconContainerClasses(file.imported ? 'success' : 'secondary')}>
                      {file.imported ? <CheckCircle2 className={`h-5 w-5 ${getIconTextColor('success')}`} /> : <FileText className={`h-5 w-5 ${getIconTextColor('secondary')}`} />}
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-300">{file.filename}</p>
                      {file.imported && <p className="text-xs text-slate-500">{file.observations.toLocaleString()} observations</p>}
                    </div>
                  </div>
                  <Button onClick={() => { setImporting(file.filename); importKMLMutation.mutate(file.filename); }} disabled={importing !== null} size="sm">
                    {importing === file.filename ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />{file.imported ? 'Re-import' : 'Import'}</>}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== WIGLE TAB ==================== */}
      <TabsContent value="wigle" className="space-y-6">
        {/* WiGLE API Stats Dashboard */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Database className={`h-5 w-5 ${getIconTextColor('info')}`} />
              WiGLE API Staging Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wigleApiStatsLoading ? (
                <>
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </>
              ) : (
                <>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">Networks (Alpha v3)</p>
                    <p className="text-2xl font-semibold text-slate-100">{parseInt(wigleApiStatsData?.stats?.networks_alpha_v3 || '0').toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{parseInt(wigleApiStatsData?.stats?.unique_bssids_alpha_v3 || '0')} unique BSSIDs</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">Observations</p>
                    <p className="text-2xl font-semibold text-slate-100">{parseInt(wigleApiStatsData?.stats?.observations_alpha_v3 || '0').toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{parseInt(wigleApiStatsData?.stats?.unique_ssids_alpha_v3 || '0')} unique SSIDs</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">SSID Clusters</p>
                    <p className="text-2xl font-semibold text-slate-100">{parseInt(wigleApiStatsData?.stats?.ssid_clusters_detected || '0').toLocaleString()}</p>
                    <p className="text-xs text-red-400 mt-1">{parseInt(wigleApiStatsData?.stats?.high_threat_clusters || '0')} EXTREME/CRITICAL</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-400 mb-1">Last Import</p>
                    <p className="text-sm font-semibold text-slate-100">
                      {wigleApiStatsData?.stats?.last_import_alpha_v3 ? new Date(wigleApiStatsData.stats.last_import_alpha_v3).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => clearWigleApiMutation.mutate()} disabled={clearWigleApiMutation.isPending || parseInt(wigleApiStatsData?.stats?.networks_alpha_v3 || '0') === 0} variant="destructive">
                {clearWigleApiMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Clearing...</> : <><Trash2 className="mr-2 h-4 w-4" />Clear Staging</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WiGLE Staging Data Preview */}
        {parseInt(wigleApiStatsData?.stats?.networks_alpha_v3 || '0') > 0 && <WigleStagingPreview />}

        {/* WiGLE API Query Form */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-100">WiGLE API Query</CardTitle>
            <CardDescription className="text-slate-400">
              Query WiGLE API and import results to staging (NEVER merged to production)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">SSID</label>
                  <input
                    type="text"
                    placeholder="Network name"
                    value={wigleApiQuery.ssid}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, ssid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">BSSID (MAC)</label>
                  <input
                    type="text"
                    placeholder="00:11:22:33:44:55"
                    value={wigleApiQuery.bssid}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, bssid: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Lat Min</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="40.0"
                    value={wigleApiQuery.latrange1}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, latrange1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Lat Max</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="40.1"
                    value={wigleApiQuery.latrange2}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, latrange2: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Long Min</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="-74.1"
                    value={wigleApiQuery.longrange1}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, longrange1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Long Max</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="-74.0"
                    value={wigleApiQuery.longrange2}
                    onChange={(e) => setWigleApiQuery({ ...wigleApiQuery, longrange2: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <Button
                onClick={() => wigleApiMutation.mutate(wigleApiQuery)}
                disabled={wigleApiMutation.isPending || (!wigleApiQuery.ssid && !wigleApiQuery.bssid && !wigleApiQuery.latrange1)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {wigleApiMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Querying WiGLE API...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Query & Import to Staging
                  </>
                )}
              </Button>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  <strong>Note:</strong> Requires WIGLE_API_NAME and WIGLE_API_TOKEN in .env file.
                  Results are imported to staging tables only (NEVER merged to production).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WiGLE SQLite Database Files */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-100">WiGLE Android App Database</CardTitle>
            <CardDescription className="text-slate-400">
              Import zipped SQLite database backups directly to production (no staging)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {wigleFiles.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No WiGLE database files found</p>
                  <p className="text-xs mt-2">Place .zip or .sqlite files in pipelines/wigle/</p>
                </div>
              ) : (
                wigleFiles.map((file) => (
                  <div key={file.filename} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className={getIconContainerClasses('success')}>
                        <Database className={`h-5 w-5 ${getIconTextColor('success')}`} />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-slate-300">{file.filename}</p>
                        <p className="text-xs text-slate-500">{file.type === 'zip' ? 'Zipped SQLite' : 'SQLite Database'}</p>
                      </div>
                    </div>
                    <Button onClick={() => { setImporting(file.filename); importWiGLEMutation.mutate(file.filename); }} disabled={importing !== null} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600">
                      {importing === file.filename ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />Import to Production</>}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ==================== KISMET TAB ==================== */}
      <TabsContent value="kismet" className="space-y-6">
        {/* Kismet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kismetStats?.devices_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Datasources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kismetStats?.datasources_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Packets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kismetStats?.packets_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(kismetStats?.alerts_count || '0').toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={parseInt(kismetStats?.files_imported || '0') > 0 ? 'default' : 'secondary'}>
                {parseInt(kismetStats?.files_imported || '0')} Files
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Kismet Actions */}
        <Card className="premium-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-100">Kismet Pipeline Actions</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Staging only - never merged to production
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => clearKismetMutation.mutate()} disabled={clearKismetMutation.isPending || parseInt(kismetStats?.devices_count || '0') === 0} variant="destructive">
                  {clearKismetMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Clearing...</> : <><Trash2 className="mr-2 h-4 w-4" />Clear Staging</>}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Kismet Files List */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-slate-100">Available Kismet Databases ({kismetFiles.length})</CardTitle>
            <CardDescription className="text-slate-400">Kismet .kismet files - Import to staging tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {kismetFilesLoading ? <Skeleton className="h-16 w-full" /> : kismetFiles.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <HardDrive className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No Kismet database files found</p>
                  <p className="text-xs mt-2">Place .kismet files in pipelines/kismet/</p>
                </div>
              ) : (
                kismetFiles.map((file) => (
                  <div key={file.filename} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className={getIconContainerClasses(file.imported ? 'special' : 'secondary')}>
                        {file.imported ? <CheckCircle2 className={`h-5 w-5 ${getIconTextColor('special')}`} /> : <HardDrive className={`h-5 w-5 ${getIconTextColor('secondary')}`} />}
                      </div>
                      <div>
                        <p className="text-sm font-mono text-slate-300">{file.filename}</p>
                        <p className="text-xs text-slate-500">{file.sizeFormatted}{file.imported ? ` • ${file.devices} devices` : ''}</p>
                      </div>
                    </div>
                    <Button onClick={() => { setImporting(file.filename); importKismetMutation.mutate({ filename: file.filename, includePackets }); }} disabled={importing !== null} size="sm">
                      {importing === file.filename ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : <><Upload className="mr-2 h-4 w-4" />{file.imported ? 'Re-import' : 'Import'}</>}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
