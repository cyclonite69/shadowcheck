import { MapVisualization } from "@/components/map-visualization";
import { SpatialQueryInterface } from "@/components/spatial-query-interface";
import { NetworkObservations } from "@/components/network-observations";
import { EnhancedHeader } from "@/components/enhanced-header";

export default function VisualizationPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="Geospatial Visualization"
        subtitle="Interactive mapping and spatial analysis of network observations"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <div className="space-y-6">
          <MapVisualization />
          <SpatialQueryInterface />
          <NetworkObservations />
        </div>
      </main>
    </div>
  );
}