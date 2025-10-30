import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Database, Trash2, GitMerge, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { iconColors, getIconContainerClasses, getIconTextColor } from '@/lib/iconColors';

interface KMLFile {
  filename: string;
  imported: boolean;
  observations: number;
}

interface KMLStats {
  networks_count: string;
  locations_count: string;
  files_imported: string;
  first_import: string | null;
  last_import: string | null;
}

export function KMLPipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState<string | null>(null);

  // Fetch KML files
  const { data: filesData, isLoading: filesLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kml/files'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/files');
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Fetch KML stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/v1/pipelines/kml/stats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/stats');
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Import single file mutation
  const importFileMutation = useMutation({
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
          title: 'Import successful',
          description: `${filename}: ${data.stats.networks} networks, ${data.stats.locations} observations`,
        });
      } else {
        toast({
          title: 'Import failed',
          description: data.error,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any, filename) => {
      setImporting(null);
      toast({
        title: 'Import failed',
        description: `Error importing ${filename}: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Import all files mutation
  const importAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/import-all', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      setImporting(null);

      if (data.ok) {
        toast({
          title: 'Bulk import complete',
          description: `${data.summary.successful}/${data.summary.total_files} files imported successfully. ${data.summary.total_networks} networks, ${data.summary.total_locations} observations`,
        });
      }
    },
    onError: (error: any) => {
      setImporting(null);
      toast({
        title: 'Bulk import failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clear staging mutation
  const clearStagingMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/clear', {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/files'] });
      toast({
        title: 'Staging cleared',
        description: 'All KML staging data has been removed',
      });
    },
  });

  // Merge to production mutation
  const mergeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/pipelines/kml/merge', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/pipelines/kml/stats'] });
      toast({
        title: 'Merge complete',
        description: `Merged ${data.merged.networks} networks and ${data.merged.locations} observations into production`,
      });
    },
  });

  const handleImportFile = (filename: string) => {
    setImporting(filename);
    importFileMutation.mutate(filename);
  };

  const handleImportAll = () => {
    setImporting('ALL');
    importAllMutation.mutate();
  };

  const stats: KMLStats | null = statsData?.stats || null;
  const files: KMLFile[] = filesData?.files || [];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={getIconContainerClasses('info')}>
                <FileText className={`h-4 w-4 ${getIconTextColor('info')}`} />
              </div>
              <CardTitle className="text-sm font-medium text-slate-300">KML Files</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-100">{files.length}</div>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {files.filter(f => f.imported).length} imported
            </p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={getIconContainerClasses('success')}>
                <Database className={`h-4 w-4 ${getIconTextColor('success')}`} />
              </div>
              <CardTitle className="text-sm font-medium text-slate-300">Networks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(stats?.networks_count || '0').toLocaleString()}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">In staging</p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={getIconContainerClasses('warning')}>
                <Upload className={`h-4 w-4 ${getIconTextColor('warning')}`} />
              </div>
              <CardTitle className="text-sm font-medium text-slate-300">Observations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-100">
                {parseInt(stats?.locations_count || '0').toLocaleString()}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">GPS points</p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={getIconContainerClasses('special')}>
                <CheckCircle2 className={`h-4 w-4 ${getIconTextColor('special')}`} />
              </div>
              <CardTitle className="text-sm font-medium text-slate-300">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <Badge variant={parseInt(stats?.files_imported || '0') > 0 ? 'default' : 'secondary'}>
                {parseInt(stats?.files_imported || '0') > 0 ? 'Ready' : 'Empty'}
              </Badge>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {parseInt(stats?.files_imported || '0')} files loaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Pipeline Actions</CardTitle>
              <CardDescription className="text-slate-400">
                Import KML files and manage staging data
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleImportAll}
                disabled={importAllMutation.isPending || importing !== null}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
              >
                {importing === 'ALL' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import All
                  </>
                )}
              </Button>
              <Button
                onClick={() => mergeMutation.mutate()}
                disabled={mergeMutation.isPending || parseInt(stats?.locations_count || '0') === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {mergeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <GitMerge className="mr-2 h-4 w-4" />
                    Merge to Production
                  </>
                )}
              </Button>
              <Button
                onClick={() => clearStagingMutation.mutate()}
                disabled={clearStagingMutation.isPending || parseInt(stats?.locations_count || '0') === 0}
                variant="destructive"
              >
                {clearStagingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Staging
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KML Files List */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-slate-100">Available KML Files</CardTitle>
          <CardDescription className="text-slate-400">
            Click Import to load a file into staging tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filesLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No KML files found in pipelines/kml directory</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.filename}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={getIconContainerClasses(file.imported ? 'success' : 'secondary')}>
                      {file.imported ? (
                        <CheckCircle2 className={`h-5 w-5 ${getIconTextColor('success')}`} />
                      ) : (
                        <FileText className={`h-5 w-5 ${getIconTextColor('secondary')}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-mono text-slate-300">{file.filename}</p>
                      {file.imported && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {file.observations.toLocaleString()} observations loaded
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleImportFile(file.filename)}
                    disabled={importing !== null}
                    size="sm"
                    className={file.imported ? 'bg-slate-700' : ''}
                  >
                    {importing === file.filename ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {file.imported ? 'Re-import' : 'Import'}
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
