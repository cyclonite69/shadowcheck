/**
 * NetworkLocationModal - Shows network location on a map
 */

import { useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface NetworkLocationModalProps {
  network: {
    bssid: string;
    ssid: string | null;
    latitude?: string;
    longitude?: string;
    signal_strength?: number | null;
  } | null;
  onClose: () => void;
}

export function NetworkLocationModal({ network, onClose }: NetworkLocationModalProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!network || !mapContainer.current) return;

    const lat = parseFloat(network.latitude || '0');
    const lng = parseFloat(network.longitude || '0');

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return;
    }

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 15,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<div class="text-slate-900">
            <div class="font-semibold">${network.ssid || 'Hidden Network'}</div>
            <div class="text-xs text-slate-600">${network.bssid}</div>
            ${network.signal_strength ? `<div class="text-xs text-slate-600">Signal: ${network.signal_strength} dBm</div>` : ''}
          </div>`
        )
      )
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [network]);

  if (!network) return null;

  const lat = parseFloat(network.latitude || '0');
  const lng = parseFloat(network.longitude || '0');
  const hasValidCoords = lat && lng && !isNaN(lat) && !isNaN(lng);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                {network.ssid || 'Hidden Network'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{network.bssid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {hasValidCoords ? (
            <div ref={mapContainer} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No location data available</p>
                <p className="text-xs mt-1">This network has no GPS coordinates</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasValidCoords && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div>
                <span className="font-mono">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </span>
              </div>
              {network.signal_strength && (
                <div>
                  Signal: <span className="text-slate-300">{network.signal_strength} dBm</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
