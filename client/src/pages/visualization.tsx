import { MapboxNetworkVisualization } from "@/components/Map/MapboxNetworkVisualization";
import { SpatialQueryInterface } from "@/components/spatial-query-interface";
import { NetworkObservationsTable } from "@/components/network-observations-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';

export default function VisualizationPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-2">
            <div className="icon-container w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 shadow-lg shadow-green-500/30">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                Geospatial Intelligence
              </h1>
              <p className="text-sm text-slate-400 cyber-text tracking-wide mt-1">
                Interactive mapping and spatial analysis of network observations
              </p>
            </div>
          </div>

          <Tabs defaultValue="mapbox" className="w-full">
          <div className="premium-card p-2 mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="mapbox" data-testid="tab-mapbox" className="premium-card hover:scale-105">Network Map</TabsTrigger>
              <TabsTrigger value="spatial" data-testid="tab-spatial" className="premium-card hover:scale-105">Spatial Queries</TabsTrigger>
              <TabsTrigger value="observations" data-testid="tab-observations" className="premium-card hover:scale-105">Observations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mapbox" className="space-y-6">
            <div className="premium-card p-6">
              <MapboxNetworkVisualization />
            </div>
          </TabsContent>

          <TabsContent value="spatial" className="space-y-6">
            <div className="premium-card p-6">
              <SpatialQueryInterface />
            </div>
          </TabsContent>

          <TabsContent value="observations" className="space-y-6">
            <NetworkObservationsTable />
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}