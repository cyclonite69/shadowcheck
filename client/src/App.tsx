import React, { useRef, useEffect } from 'react';
import { LayoutDashboard, AlertCircle, Wifi, Loader } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import {
  useConfigQuery,
  useNetworksQuery,
  useVisualizeQuery,
  useAnalyticsQuery,
  useSignalStrengthQuery,
  useSecurityAnalysisQuery,
  useStatusQuery,
} from './hooks/useQueries';
import NetworkCard from './components/cards/NetworkCard';
import AnalyticsCard from './components/cards/AnalyticsCard';
import StatusCard from './components/cards/StatusCard';
import SpatialCard from './components/cards/SpatialCard';
import Heatmap from './components/Heatmap';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Queries
  const { data: config } = useConfigQuery();
  const { data: networks, isLoading: networksLoading, error: networksError } = useNetworksQuery(100);
  const { data: visualize } = useVisualizeQuery();
  const { data: analytics } = useAnalyticsQuery();
  const { data: signalStrength } = useSignalStrengthQuery();
  const { data: securityAnalysis } = useSecurityAnalysisQuery();
  const { data: status, isLoading: statusLoading, error: statusError } = useStatusQuery();

  // Initialize Mapbox
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const token = config?.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN;
    mapboxgl.accessToken = token || 'pk.test';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-118.2437, 34.0522],
      zoom: 10,
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [config]);

  // Add GeoJSON data to map
  useEffect(() => {
    if (!map.current || !visualize?.data) return;

    map.current.on('load', () => {
      // Add network points source
      if (!map.current!.getSource('networks')) {
        map.current!.addSource('networks', {
          type: 'geojson',
          data: visualize.data,
        });

        // Add network points layer
        map.current!.addLayer({
          id: 'network-points',
          type: 'circle',
          source: 'networks',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'case',
              ['has', 'signal_strength'],
              [
                'interpolate',
                ['linear'],
                ['get', 'signal_strength'],
                -90,
                '#ef4444',
                -70,
                '#f59e0b',
                -50,
                '#10b981',
              ],
              '#00d9e1',
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Add click handler
        map.current!.on('click', 'network-points', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `
                <div class="text-black">
                  <strong>${feature.properties?.ssid || 'Hidden Network'}</strong><br>
                  <strong>BSSID:</strong> ${feature.properties?.bssid}<br>
                  <strong>Signal:</strong> ${feature.properties?.signal_strength || 'N/A'} dBm<br>
                  <strong>Security:</strong> ${feature.properties?.encryption || 'Unknown'}
                </div>
              `
              )
              .addTo(map.current!);
          }
        });

        map.current!.on('mouseenter', 'network-points', () => {
          map.current!.getCanvas().style.cursor = 'pointer';
        });

        map.current!.on('mouseleave', 'network-points', () => {
          map.current!.getCanvas().style.cursor = '';
        });
      }
    });
  }, [visualize]);

  return (
    <div className="min-h-screen bg-[#001A00] text-white font-inter">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_3fr_1fr] gap-4 p-4 flex flex-col lg:flex-row">
        {/* Navigation Panel */}
        <nav className="glassy p-4 rounded-lg mb-4 lg:mb-0">
          <div className="flex items-center space-x-2 mb-6">
            <LayoutDashboard size={24} className="text-[#00D9E1]" />
            <h2 className="text-xl font-bold">ShadowCheck</h2>
          </div>

          {/* Status Card */}
          <StatusCard status={status} isLoading={statusLoading} error={statusError} />

          <div className="mt-4">
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer">
                <Wifi size={16} className="text-[#00D9E1]" />
                <span>Networks ({networks?.count || 0})</span>
              </li>
              <li className="flex items-center space-x-2 p-2 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer">
                <AlertCircle size={16} className="text-red-400" />
                <span>Alerts</span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content - Map and Analytics */}
        <main className="glassy p-4 rounded-lg mb-4 lg:mb-0">
          <h1 className="text-xl font-bold mb-4">SIGINT Forensics Dashboard</h1>
          <div className="h-[60vh] lg:h-[80vh] mb-4">
            <SpatialCard />
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsCard
              analytics={analytics}
              signalStrength={signalStrength}
              securityAnalysis={securityAnalysis}
            />
            <Heatmap />
          </div>
        </main>

        {/* Observations Panel */}
        <aside className="glassy p-4 rounded-lg flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Wifi size={20} className="text-[#00D9E1]" />
            <h3 className="text-lg font-semibold">Observations</h3>
          </div>

          {/* Networks List - Full Height */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {networksLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader size={20} className="animate-spin text-[#00D9E1]" />
                <span className="ml-2 text-gray-400">Loading observations...</span>
              </div>
            )}

            {networksError && (
              <div className="text-center text-red-400 text-sm p-4">
                Error loading observations: {networksError.message}
              </div>
            )}

            {networks?.data.map((network) => (
              <NetworkCard key={network.id} network={network} />
            ))}
          </div>
        </aside>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glassy p-2 flex justify-around">
        <LayoutDashboard size={20} className="text-[#00D9E1]" />
        <AlertCircle size={20} className="text-red-500" />
      </nav>
    </div>
  );
}

export default App;
