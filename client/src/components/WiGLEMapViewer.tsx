/**
 * WiGLE Network Map Viewer
 * Displays a network and all its observation points on a Mapbox map
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WiGLEObservation {
  wigle_api_loc_id: number;
  lat: number;
  lon: number;
  altitude: number | null;
  accuracy: number | null;
  time: string;
  signal_level: number | null;
}

interface WiGLENetwork {
  bssid: string;
  ssid: string;
  trilat: number;
  trilong: number;
  observations: WiGLEObservation[];
}

interface WiGLEMapViewerProps {
  network: WiGLENetwork;
}

export function WiGLEMapViewer({ network }: WiGLEMapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get Mapbox token from environment
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('VITE_MAPBOX_TOKEN not configured');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [network.trilong, network.trilat],
      zoom: 14
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      // Add observation points as a source
      const features = network.observations.map((obs) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [obs.lon, obs.lat]
        },
        properties: {
          id: obs.wigle_api_loc_id,
          time: obs.time,
          signal: obs.signal_level,
          accuracy: obs.accuracy,
          altitude: obs.altitude
        }
      }));

      map.current.addSource('observations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      // Add circle layer for observation points
      map.current.addLayer({
        id: 'observation-circles',
        type: 'circle',
        source: 'observations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            3,
            15,
            8,
            20,
            15
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'signal'], -70],
            -90,
            '#ef4444', // red for weak signal
            -70,
            '#f97316', // orange
            -50,
            '#eab308', // yellow
            -30,
            '#22c55e' // green for strong signal
          ],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add trilaterated center point (primary location)
      map.current.addSource('center', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [network.trilong, network.trilat]
          },
          properties: {
            bssid: network.bssid,
            ssid: network.ssid
          }
        }
      });

      map.current.addLayer({
        id: 'center-point',
        type: 'circle',
        source: 'center',
        paint: {
          'circle-radius': 12,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add label for center point
      map.current.addLayer({
        id: 'center-label',
        type: 'symbol',
        source: 'center',
        layout: {
          'text-field': ['get', 'ssid'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      // Add hover cursor
      map.current.on('mouseenter', 'observation-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'observation-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Add popup on click
      map.current.on('click', 'observation-circles', (e) => {
        if (!e.features || !e.features[0] || !map.current) return;

        const feature = e.features[0];
        const coords = (feature.geometry as any).coordinates.slice();
        const { time, signal, accuracy, altitude } = feature.properties as any;

        const popupContent = `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Observation Point</div>
            <div style="font-size: 12px; color: #666;">
              <div><strong>Time:</strong> ${new Date(time).toLocaleString()}</div>
              ${signal ? `<div><strong>Signal:</strong> ${signal} dBm</div>` : ''}
              ${accuracy ? `<div><strong>Accuracy:</strong> ${accuracy}m</div>` : ''}
              ${altitude ? `<div><strong>Altitude:</strong> ${altitude}m</div>` : ''}
              <div><strong>Coordinates:</strong> ${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}</div>
            </div>
          </div>
        `;

        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      // Fit bounds to show all observations
      if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach((feature) => {
          bounds.extend(feature.geometry.coordinates as [number, number]);
        });
        // Also include the center point
        bounds.extend([network.trilong, network.trilat]);

        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 16
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [network]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-lg overflow-hidden border"
    />
  );
}
