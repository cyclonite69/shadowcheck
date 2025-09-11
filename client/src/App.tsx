import React, { useRef, useEffect } from 'react';
import { LayoutDashboard, AlertCircle, Wifi } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import Heatmap from './components/Heatmap';
import DraggableAlert from './components/DraggableAlert';
import './index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN || 'pk.test';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-118.2437, 34.0522],
      zoom: 10
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#001A00] text-white font-inter">
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[1fr_3fr_1fr] gap-4 p-4 flex flex-col lg:flex-row">
        <nav className="glassy p-4 rounded-lg">
          <LayoutDashboard size={20} className="text-[#00D9E1]" />
          <Wifi size={20} className="text-[#00D9E1] mt-2" />
          <p>Signals</p>
        </nav>
        <main className="glassy p-4 rounded-lg">
          <h1 className="text-xl font-bold mb-4">Sigint Forensics Dashboard</h1>
          <div 
            ref={mapContainer}
            className="w-full h-[60vh] lg:h-[80vh] rounded-lg overflow-hidden mb-4"
          />
          <Heatmap />
        </main>
        <aside className="glassy p-4 rounded-lg">
          <h2 className="text-lg mb-2">Alerts</h2>
          <DraggableAlert message="Signal anomaly detected" />
          <DraggableAlert message="High signal strength at node X" />
        </aside>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glassy p-2 flex justify-around">
        <LayoutDashboard size={20} className="text-[#00D9E1]" />
        <AlertCircle size={20} className="text-red-500" />
      </nav>
    </div>
  );
}

export default App;
