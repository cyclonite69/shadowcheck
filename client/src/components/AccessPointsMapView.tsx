/**
 * AccessPointsMapView - Simple map view for selected access points
 * Displays selected network observations on a dark Mapbox map
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NetworkObservation } from '@/types';
import { macToColor } from '@/lib/mapUtils';

interface AccessPointsMapViewProps {
  selectedObservations: NetworkObservation[];
  mapboxToken: string;
}

export function AccessPointsMapView({ selectedObservations, mapboxToken }: AccessPointsMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    if (map.current) return; // Already initialized

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-83.6875, 43.0125], // Default center
      zoom: 10,
      maxZoom: 20
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

      setMapLoaded(true);

      // Resize map
      setTimeout(() => {
        if (map.current) map.current.resize();
      }, 100);
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Handle container resize (when panel is dragged)
  useEffect(() => {
    if (!mapContainer.current || !map.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        // Delay resize slightly to allow DOM to update
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 50);
      }
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mapLoaded]);

  // Update markers when selected observations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter out observations without valid coordinates
    const validObservations = selectedObservations.filter(
      obs => obs.latitude !== null && obs.longitude !== null &&
             !isNaN(Number(obs.latitude)) && !isNaN(Number(obs.longitude))
    );

    if (validObservations.length === 0) return;

    // Add new markers
    const bounds = new mapboxgl.LngLatBounds();

    validObservations.forEach(obs => {
      const lng = Number(obs.longitude);
      const lat = Number(obs.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = macToColor(obs.bssid);
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="color: #1e293b; font-size: 12px; min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${obs.ssid || 'Hidden Network'}</div>
          <div style="font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${obs.bssid.toUpperCase()}
          </div>
          ${obs.signal_strength !== null ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #64748b;">Signal:</span>
              <span style="font-weight: 500;">${obs.signal_strength} dBm</span>
            </div>
          ` : ''}
          ${obs.frequency ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #64748b;">Frequency:</span>
              <span>${(obs.frequency / 1000).toFixed(3)} GHz</span>
            </div>
          ` : ''}
          ${obs.encryption ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #64748b;">Security:</span>
              <span>${obs.encryption}</span>
            </div>
          ` : ''}
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            ${Number(obs.latitude).toFixed(6)}, ${Number(obs.longitude).toFixed(6)}
          </div>
        </div>
      `);

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Fit map to show all markers
    if (validObservations.length === 1) {
      const obs = validObservations[0];
      map.current.flyTo({
        center: [Number(obs.longitude), Number(obs.latitude)],
        zoom: 15,
        duration: 1000
      });
    } else if (validObservations.length > 1) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000,
        maxZoom: 17
      });
    }
  }, [selectedObservations, mapLoaded]);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <div
        ref={mapContainer}
        className="w-full h-full"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-slate-400 text-sm">Loading map...</div>
        </div>
      )}
      {mapLoaded && selectedObservations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-slate-500 text-sm bg-slate-800/90 px-4 py-2 rounded">
            Select networks to display on map
          </div>
        </div>
      )}
      {mapLoaded && selectedObservations.length > 0 && (
        <div className="absolute top-2 right-2 bg-slate-800/90 text-slate-200 px-3 py-1.5 rounded text-xs font-medium border border-slate-700">
          {selectedObservations.length} selected
        </div>
      )}
    </div>
  );
}
