import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Map, Search, Table, Clock } from 'lucide-react';
import { NetworkTimelineChart } from '@/components/NetworkTimelineChart';
import { NetworkActivityHeatmap } from '@/components/NetworkActivityHeatmap';

export default function VisualizationPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Enhanced Header Section */}
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="icon-container w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 shadow-lg shadow-green-500/30">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                  Geospatial Intelligence
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Interactive mapping and spatial analysis of network observations
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <Tabs defaultValue="timeline" className="w-full">
            <div className="premium-card p-2 mb-6">
              <TabsList className="grid w-full grid-cols-5 bg-transparent gap-2">
                <TabsTrigger
                  value="timeline"
                  data-testid="tab-timeline"
                  className="premium-card hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600/20 data-[state=active]:to-fuchsia-600/20 data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 transition-all"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="mapbox"
                  data-testid="tab-mapbox"
                  className="premium-card hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all"
                >
                  <Map className="mr-2 h-4 w-4" />
                  Network Map
                </TabsTrigger>
                <TabsTrigger
                  value="spatial"
                  data-testid="tab-spatial"
                  className="premium-card hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-600/20 data-[state=active]:to-emerald-600/20 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Spatial Queries
                </TabsTrigger>
                <TabsTrigger
                  value="observations"
                  data-testid="tab-observations"
                  className="premium-card hover:scale-105 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600/20 data-[state=active]:to-pink-600/20 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all"
                >
                  <Table className="mr-2 h-4 w-4" />
                  Observations
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Timeline Tab - Shows when networks turn on/off */}
            <TabsContent value="timeline" className="space-y-6">
              <NetworkTimelineChart days={7} />
              <NetworkActivityHeatmap weeks={4} limit={5} />
            </TabsContent>

            {/* Empty tab content areas - ready for future implementation */}
            <TabsContent value="mapbox" className="space-y-6">
              <div className="premium-card p-8 text-center text-slate-400">
                <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Network Map - Coming Soon</p>
              </div>
            </TabsContent>

            <TabsContent value="spatial" className="space-y-6">
              <div className="premium-card p-8 text-center text-slate-400">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Spatial Queries - Coming Soon</p>
              </div>
            </TabsContent>

            <TabsContent value="observations" className="space-y-6">
              <div className="premium-card p-8 text-center text-slate-400">
                <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Observations - Coming Soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}