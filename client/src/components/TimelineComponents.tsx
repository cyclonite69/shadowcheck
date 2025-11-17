/**
 * PRESERVED TIMELINE COMPONENTS
 *
 * These components were previously in /pages/visualization.tsx (Timeline tab)
 * They are preserved here for future re-integration into Geospatial Intelligence
 *
 * To re-enable Timeline tab in visualization.tsx:
 * 1. Import these components
 * 2. Add Timeline tab back to TabsList
 * 3. Add TabsContent with NetworkTimelineChart and NetworkActivityHeatmap
 *
 * Example usage:
 * ```tsx
 * import { NetworkTimelineChart } from '@/components/NetworkTimelineChart';
 * import { NetworkActivityHeatmap } from '@/components/NetworkActivityHeatmap';
 *
 * <TabsContent value="timeline" className="space-y-6">
 *   <NetworkTimelineChart days={7} />
 *   <NetworkActivityHeatmap weeks={4} limit={5} />
 * </TabsContent>
 * ```
 */

export { NetworkTimelineChart } from './NetworkTimelineChart';
export { NetworkActivityHeatmap } from './NetworkActivityHeatmap';
