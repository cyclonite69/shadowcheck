import SimpleKeplerMap from "@/components/Map/SimpleKeplerMap";
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
          <div className="premium-card p-2 mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="gis" data-testid="tab-unified-gis" className="premium-card hover:scale-105">Unified GIS</TabsTrigger>
              <TabsTrigger value="spatial" data-testid="tab-spatial" className="premium-card hover:scale-105">Spatial Queries</TabsTrigger>
              <TabsTrigger value="observations" data-testid="tab-observations" className="premium-card hover:scale-105">Observations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gis" className="space-y-6">
            <div className="premium-card p-6">
              <SimpleKeplerMap />
            </div>
          </TabsContent>

          <TabsContent value="spatial" className="space-y-6">
            <div className="premium-card p-6">
              <SpatialQueryInterface />
            </div>
          </TabsContent>

          <TabsContent value="observations" className="space-y-6">
            <div className="premium-card p-6">
              <NetworkObservations />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}