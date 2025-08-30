import { EnhancedHeader } from '@/components/enhanced-header';
import { UnifiedGISInterface } from '@/components/unified-gis-interface';
import { G63AnalyticsDashboard } from '@/components/g63-analytics-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function G63ForensicsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="G63 Forensics GIS"
        subtitle="Interactive geospatial analysis of SIGINT wireless observations"
      />
      
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <Tabs defaultValue="gis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/50">
            <TabsTrigger value="gis" data-testid="tab-gis">Interactive GIS</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="gis" className="space-y-6">
            <UnifiedGISInterface />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <G63AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}