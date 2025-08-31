import NetworkMap from "@/components/Map/NetworkMap";
import { SpatialQueryInterface } from "@/components/spatial-query-interface";
import { NetworkObservations } from "@/components/network-observations";
import { EnhancedHeader } from "@/components/enhanced-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VisualizationPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="Geospatial Visualization"
        subtitle="Interactive mapping and spatial analysis of network observations"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <Tabs defaultValue="gis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="gis" data-testid="tab-unified-gis">Unified GIS</TabsTrigger>
            <TabsTrigger value="spatial" data-testid="tab-spatial">Spatial Queries</TabsTrigger>
            <TabsTrigger value="observations" data-testid="tab-observations">Observations</TabsTrigger>
          </TabsList>

          <TabsContent value="gis" className="space-y-6">
            <NetworkMap />
          </TabsContent>

          <TabsContent value="spatial" className="space-y-6">
            <SpatialQueryInterface />
          </TabsContent>

          <TabsContent value="observations" className="space-y-6">
            <NetworkObservations />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}