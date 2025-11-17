import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Loader2, MapPin, Radio, Calendar, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Initialize Mapbox
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiY3ljbG9uaXRlMDEiLCJhIjoiY21oZ3YzaHNxMGxkdDJtb2cxZ29kNWdiMiJ9.tQIcL65LMxi5xDxP5fWzyQ';
mapboxgl.accessToken = MAPBOX_TOKEN;

if (!MAPBOX_TOKEN || MAPBOX_TOKEN === '') {
  console.error('[NetworkMapVisualizer] No Mapbox token found!');
}

interface NetworkObservation {
  lat: number;
  lon: number;
  signal: number | null;
  timestamp: number | null;
  accuracy: number | null;
}

interface NetworkData {
  ok: boolean;
  bssid: string;
  total_observations: number;
  observations: NetworkObservation[];
  stats: {
    signal: {
      min: number;
      max: number;
      avg: number;
    } | null;
    time_range: {
      first: number;
      last: number;
    } | null;
    returned: number;
    offset: number;
    has_more: boolean;
  };
}

export function NetworkMapVisualizer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [bssid, setBssid] = useState('CA:99:B2:1E:55:13'); // Default to delta3g
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('[NetworkMapVisualizer] Initializing Mapbox map...');
    console.log('[NetworkMapVisualizer] Token:', MAPBOX_TOKEN.substring(0, 20) + '...');
    console.log('[NetworkMapVisualizer] Container:', mapContainer.current);

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-83.697, 43.023], // Default center (Michigan)
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('[NetworkMapVisualizer] Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('[NetworkMapVisualizer] Map error:', e);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
    } catch (error) {
      console.error('[NetworkMapVisualizer] Failed to initialize map:', error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Fetch network observations
  const fetchNetworkData = async (targetBssid: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/network/${encodeURIComponent(targetBssid)}/observations?limit=10000`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: NetworkData = await response.json();

      if (!data.ok) {
        throw new Error('Failed to fetch network observations');
      }

      if (data.total_observations === 0) {
        setError(`No observations found for BSSID: ${targetBssid}`);
        setNetworkData(null);
        return;
      }

      setNetworkData(data);
      visualizeOnMap(data);
    } catch (err) {
      console.error('Error fetching network data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load network data');
      setNetworkData(null);
    } finally {
      setLoading(false);
    }
  };

  // Visualize observations on map
  const visualizeOnMap = (data: NetworkData) => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    // Add markers for each observation
    data.observations.forEach((obs, index) => {
      // Calculate color based on signal strength (gradient from green to red)
      const signalNormalized = obs.signal !== null
        ? Math.max(0, Math.min(1, (obs.signal + 100) / 50)) // -100 to -50 dBm range
        : 0.5;

      const hue = signalNormalized * 120; // 0 (red) to 120 (green)
      const color = `hsl(${hue}, 100%, 50%)`;

      // Create marker
      const el = document.createElement('div');
      el.className = 'network-observation-marker';
      el.style.backgroundColor = color;
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';

      // Format timestamp
      const timestamp = obs.timestamp
        ? new Date(obs.timestamp).toLocaleString()
        : 'Unknown';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="color: white; font-family: monospace; font-size: 12px;">
          <div><strong>Observation #${index + 1}</strong></div>
          <div style="margin-top: 8px;">
            <strong>Signal:</strong> ${obs.signal !== null ? obs.signal + ' dBm' : 'N/A'}<br/>
            <strong>Location:</strong> ${obs.lat.toFixed(6)}, ${obs.lon.toFixed(6)}<br/>
            <strong>Accuracy:</strong> ${obs.accuracy !== null ? obs.accuracy.toFixed(1) + 'm' : 'N/A'}<br/>
            <strong>Time:</strong> ${timestamp}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([obs.lon, obs.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
      bounds.extend([obs.lon, obs.lat]);
    });

    // Fit map to show all observations
    if (data.observations.length > 0) {
      if (data.observations.length === 1) {
        // For single observation, center on that point with appropriate zoom
        const obs = data.observations[0];
        console.log('[NetworkMapVisualizer] Single observation, centering at:', {
          lat: obs.lat,
          lng: obs.lon
        });

        map.current.flyTo({
          center: [obs.lon, obs.lat],
          zoom: 15,
          duration: 1000
        });
      } else {
        // For multiple observations, fit to bounds
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        console.log('[NetworkMapVisualizer] Fitting bounds:', {
          sw: { lat: sw.lat, lng: sw.lng },
          ne: { lat: ne.lat, lng: ne.lng },
          observations: data.observations.length
        });

        map.current.fitBounds(bounds, {
          padding: 40,
          duration: 1000,
          maxZoom: 15
        });
      }
    }
  };

  // Handle search
  const handleSearch = () => {
    const trimmed = bssid.trim();
    if (!trimmed) {
      setError('Please enter a BSSID');
      return;
    }
    fetchNetworkData(trimmed);
  };

  // Format date range
  const formatDateRange = () => {
    if (!networkData?.stats.time_range) return 'N/A';
    const first = new Date(networkData.stats.time_range.first).toLocaleDateString();
    const last = new Date(networkData.stats.time_range.last).toLocaleDateString();
    return `${first} → ${last}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <MapPin className="h-6 w-6 text-cyan-400" />
          Network Observation Visualizer
        </h1>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Enter BSSID (e.g., CA:99:B2:1E:55:13)"
              value={bssid}
              onChange={(e) => setBssid(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              'Visualize'
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Panel */}
        {networkData && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-700 border-slate-600 p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Observations</span>
              </div>
              <p className="text-xl font-bold text-slate-100">
                {networkData.total_observations.toLocaleString()}
              </p>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400">Signal Range</span>
              </div>
              <p className="text-xl font-bold text-slate-100">
                {networkData.stats.signal
                  ? `${networkData.stats.signal.min} → ${networkData.stats.signal.max} dBm`
                  : 'N/A'
                }
              </p>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-slate-400">Avg Signal</span>
              </div>
              <p className="text-xl font-bold text-slate-100">
                {networkData.stats.signal?.avg} dBm
              </p>
            </Card>

            <Card className="bg-slate-700 border-slate-600 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-400">Time Range</span>
              </div>
              <p className="text-sm font-bold text-slate-100">
                {formatDateRange()}
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative" style={{ minHeight: '400px' }}>
        <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

        {/* Legend */}
        {networkData && (
          <div className="absolute bottom-4 left-4 bg-slate-800/95 border border-slate-700 rounded-lg p-3 backdrop-blur">
            <div className="text-xs font-semibold text-slate-100 mb-2">Signal Strength</div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(0, 100%, 50%)'}}></div>
                <span>Weak</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(60, 100%, 50%)'}}></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(120, 100%, 50%)'}}></div>
                <span>Strong</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
