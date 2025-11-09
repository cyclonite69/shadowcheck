/**
 * AccessPointsMapView - Simple map view for selected access points
 * Displays selected network observations on a dark Mapbox map
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NetworkObservation } from '@/types';
import { macToColor } from '@/lib/mapUtils';
import { wireTooltipNetwork } from '@/components/Map/wireTooltipNetwork';

interface AccessPointsMapViewProps {
  selectedObservations: NetworkObservation[];
  mapboxToken: string;
  centerPoint?: { lat: number; lng: number } | null;
  searchRadius?: number;
}

export function AccessPointsMapView({
  selectedObservations,
  mapboxToken,
  centerPoint,
  searchRadius = 1000
}: AccessPointsMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const centerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const tooltipCleanupRef = useRef<(() => void) | null>(null);

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
      // Clean up tooltip
      if (tooltipCleanupRef.current) {
        tooltipCleanupRef.current();
        tooltipCleanupRef.current = null;
      }

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

  // Update network points with wire tooltip when selected observations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Filter out observations without valid coordinates
    const validObservations = selectedObservations.filter(
      obs => obs.latitude !== null && obs.longitude !== null &&
             !isNaN(Number(obs.latitude)) && !isNaN(Number(obs.longitude))
    );

    // Create GeoJSON FeatureCollection
    const features = validObservations.map((obs, idx) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [Number(obs.longitude), Number(obs.latitude)]
      },
      properties: {
        uid: idx,
        ssid: obs.ssid || null,
        bssid: obs.bssid,
        mac: obs.bssid,
        signal: obs.signal_strength,
        rssi: obs.signal_strength,
        frequency: obs.frequency,
        freq: obs.frequency,
        security: obs.encryption || obs.capabilities,
        encryption: obs.encryption || obs.capabilities,
        lat: Number(obs.latitude),
        lon: Number(obs.longitude),
        alt: obs.altitude,
        altitude: obs.altitude,
        observed_at: obs.observed_at,
        seen: obs.observed_at,
        colour: macToColor(obs.bssid),
        color: macToColor(obs.bssid)
      }
    }));

    const geojson = {
      type: 'FeatureCollection' as const,
      features
    };

    // Add or update source
    if (!map.current.getSource('networks')) {
      map.current.addSource('networks', {
        type: 'geojson',
        data: geojson
      });
    } else {
      (map.current.getSource('networks') as mapboxgl.GeoJSONSource).setData(geojson);
    }

    // Add layer if it doesn't exist
    if (!map.current.getLayer('networks')) {
      map.current.addLayer({
        id: 'networks',
        type: 'circle',
        source: 'networks',
        paint: {
          'circle-radius': 6,
          'circle-color': ['get', 'colour'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      });

      // Wire up the tooltip - only once when layer is created
      tooltipCleanupRef.current = wireTooltipNetwork(map.current, 'networks', { env: 'urban' });
    }

    // Fit map to show all points
    if (validObservations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    validObservations.forEach(obs => {
      bounds.extend([Number(obs.longitude), Number(obs.latitude)]);
    });

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

  // Handle GPS center point and radius circle
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
      centerMarkerRef.current = null;
    }

    // Remove existing radius circle layers
    if (map.current.getLayer('radius-circle-outline')) {
      map.current.removeLayer('radius-circle-outline');
    }
    if (map.current.getLayer('radius-circle')) {
      map.current.removeLayer('radius-circle');
    }
    if (map.current.getSource('radius-circle')) {
      map.current.removeSource('radius-circle');
    }

    if (!centerPoint) return;

    // Add center marker (GPS location)
    const el = document.createElement('div');
    el.className = 'gps-center-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#10b981';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.3)';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
      <div style="color: #1e293b; font-size: 12px;">
        <div style="font-weight: 600; margin-bottom: 4px; color: #10b981;">📍 GPS Location</div>
        <div style="margin-bottom: 4px;">
          <span style="color: #64748b;">Coordinates:</span><br/>
          <span style="font-family: monospace; font-size: 11px;">${centerPoint.lat.toFixed(6)}, ${centerPoint.lng.toFixed(6)}</span>
        </div>
        <div>
          <span style="color: #64748b;">Search Radius:</span>
          <span style="font-weight: 500;"> ${searchRadius}m</span>
        </div>
      </div>
    `);

    centerMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([centerPoint.lng, centerPoint.lat])
      .setPopup(popup)
      .addTo(map.current);

    // Add radius circle
    const radiusInKm = searchRadius / 1000;
    const points = 64;
    const coordinates: [number, number][] = [];

    for (let i = 0; i <= points; i++) {
      const angle = (i * 360) / points;
      const lat = centerPoint.lat + (radiusInKm / 111.32) * Math.sin((angle * Math.PI) / 180);
      const lng = centerPoint.lng + (radiusInKm / (111.32 * Math.cos((centerPoint.lat * Math.PI) / 180))) * Math.cos((angle * Math.PI) / 180);
      coordinates.push([lng, lat]);
    }

    map.current.addSource('radius-circle', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {}
      }
    });

    map.current.addLayer({
      id: 'radius-circle',
      type: 'fill',
      source: 'radius-circle',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.1,
        'fill-outline-color': '#10b981'
      }
    });

    map.current.addLayer({
      id: 'radius-circle-outline',
      type: 'line',
      source: 'radius-circle',
      paint: {
        'line-color': '#10b981',
        'line-width': 2,
        'line-opacity': 0.6
      }
    });

    // Fly to GPS location
    map.current.flyTo({
      center: [centerPoint.lng, centerPoint.lat],
      zoom: 14,
      duration: 1500
    });

  }, [centerPoint, searchRadius, mapLoaded]);

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
