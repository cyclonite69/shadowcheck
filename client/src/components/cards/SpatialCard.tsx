import React, { useState } from 'react';
import { MapPin, Search, Wifi, Target } from 'lucide-react';
import { useWithinQuery } from '../../hooks/useQueries';
import NetworkCard from './NetworkCard';

const SpatialCard: React.FC = () => {
  const [lat, setLat] = useState<number>(34.0522);
  const [lon, setLon] = useState<number>(-118.2437);
  const [radius, setRadius] = useState<number>(1000);
  const [searchEnabled, setSearchEnabled] = useState<boolean>(false);

  const { data, isLoading, error } = useWithinQuery(lat, lon, radius, 20, searchEnabled);

  const handleSearch = () => {
    setSearchEnabled(true);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="glassy p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Target size={20} className="text-teal-400" />
        <h3 className="text-lg font-semibold text-teal-300">Spatial Search</h3>
      </div>

      {/* Search Controls */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-teal-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={lon}
              onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-teal-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400">Radius (meters)</label>
          <input
            type="number"
            step="100"
            min="100"
            max="50000"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 1000)}
            className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-teal-400 focus:outline-none"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleGetCurrentLocation}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <MapPin size={12} />
            <span>Use Location</span>
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 text-xs bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded transition-colors"
          >
            <Search size={12} />
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="text-center text-red-400 text-sm mb-4">
          Error: {error.message}
        </div>
      )}

      {data && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Wifi size={14} className="text-teal-400" />
              <span className="text-sm text-gray-300">Results</span>
            </div>
            <span className="text-xs text-gray-400">{data.count} networks</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {data.data.map((network) => (
              <div key={network.id} className="relative">
                <NetworkCard
                  network={{
                    ...network,
                    observed_at: new Date().toISOString(),
                  }}
                />
                <div className="absolute top-2 right-2 text-xs text-teal-400">
                  {network.distance?.toFixed(0)}m
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchEnabled && data && data.count === 0 && (
        <div className="text-center text-gray-400 text-sm">
          No networks found in this area
        </div>
      )}
    </div>
  );
};

export default SpatialCard;