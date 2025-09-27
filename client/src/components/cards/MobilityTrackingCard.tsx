import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { MapPin, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Route } from 'lucide-react';

interface MobilityThreat {
  bssid: string;
  ssid: string;
  location_count: number;
  first_seen: string;
  last_seen: string;
  max_distance_km: number;
  min_distance_from_home: number;
  max_distance_from_home: number;
  manufacturer: string;
  mobility_classification: string;
}

interface ApiResponse {
  ok: boolean;
  data: MobilityThreat[];
  count: number;
  filters: {
    limit: number;
    min_distance: number;
  };
}

const MobilityTrackingCard: React.FC = () => {
  const [minDistance, setMinDistance] = useState<number>(10);
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['mobility-tracking', minDistance],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '50',
        min_distance: minDistance.toString(),
      });
      const response = await fetch(`/api/v1/surveillance/mobility?${params}`);
      if (!response.ok) throw new Error('Failed to fetch mobility tracking data');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getMobilityIcon = (classification: string) => {
    switch (classification) {
      case 'EXTREME_MOBILITY_THREAT':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'HIGH_MOBILITY_SURVEILLANCE':
        return <Route className='h-4 w-4 text-orange-500' />;
      case 'MODERATE_MOBILITY':
        return <MapPin className='h-4 w-4 text-yellow-500' />;
      default:
        return <TrendingUp className='h-4 w-4 text-gray-400' />;
    }
  };

  const getMobilityColor = (classification: string) => {
    switch (classification) {
      case 'EXTREME_MOBILITY_THREAT':
        return 'destructive';
      case 'HIGH_MOBILITY_SURVEILLANCE':
        return 'secondary';
      case 'MODERATE_MOBILITY':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getThreatLevel = (device: MobilityThreat) => {
    if (device.mobility_classification === 'EXTREME_MOBILITY_THREAT') return 'CRITICAL';
    if (device.max_distance_from_home > 100) return 'HIGH';
    if (device.location_count >= 5) return 'MEDIUM';
    return 'LOW';
  };

  const handleDrillDown = (bssid: string) => {
    setExpandedDevice(expandedDevice === bssid ? null : bssid);
  };

  const classificationCounts =
    data?.data.reduce(
      (acc, device) => {
        acc[device.mobility_classification] = (acc[device.mobility_classification] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Route className='h-5 w-5' />
            High-Mobility Device Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Failed to load mobility tracking data: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Route className='h-5 w-5' />
          High-Mobility Device Tracking
          {data && <Badge variant='secondary'>{data.count} devices</Badge>}
        </CardTitle>
        <CardDescription>
          Detection of surveillance devices that appear at multiple distant locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className='mb-4 flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label htmlFor='min-distance' className='text-sm font-medium'>
              Min Distance:
            </label>
            <select
              id='min-distance'
              value={minDistance}
              onChange={e => setMinDistance(Number(e.target.value))}
              className='border rounded px-2 py-1 text-sm'
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>

          <div className='flex gap-2 ml-auto'>
            <Badge variant='destructive'>
              Extreme: {classificationCounts['EXTREME_MOBILITY_THREAT'] || 0}
            </Badge>
            <Badge variant='secondary'>
              High: {classificationCounts['HIGH_MOBILITY_SURVEILLANCE'] || 0}
            </Badge>
            <Badge variant='outline'>
              Moderate: {classificationCounts['MODERATE_MOBILITY'] || 0}
            </Badge>
          </div>
        </div>

        {/* Device List */}
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            <span className='ml-2'>Analyzing device mobility patterns...</span>
          </div>
        ) : (
          <div className='space-y-3'>
            {data?.data.map(device => (
              <div key={device.bssid} className='border rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    {getMobilityIcon(device.mobility_classification)}
                    <div>
                      <div className='font-medium'>{device.ssid}</div>
                      <div className='text-sm text-gray-500'>
                        {device.bssid} • {device.manufacturer}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Badge variant={getMobilityColor(device.mobility_classification)}>
                      {device.mobility_classification.replace(/_/g, ' ')}
                    </Badge>
                    <Badge
                      variant={
                        getThreatLevel(device) === 'CRITICAL'
                          ? 'destructive'
                          : getThreatLevel(device) === 'HIGH'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {getThreatLevel(device)}
                    </Badge>
                    <span className='text-sm font-bold text-blue-600'>
                      {Math.round(device.max_distance_km)} km
                    </span>
                    <Button variant='ghost' size='sm' onClick={() => handleDrillDown(device.bssid)}>
                      {expandedDevice === device.bssid ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Drill-down details */}
                {expandedDevice === device.bssid && (
                  <div className='mt-4 pt-4 border-t space-y-3'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium'>Location Count:</span>
                        <div className='text-gray-600'>
                          {device.location_count} unique locations
                        </div>
                      </div>
                      <div>
                        <span className='font-medium'>Max Range:</span>
                        <div className='text-gray-600'>{Math.round(device.max_distance_km)} km</div>
                      </div>
                      <div>
                        <span className='font-medium'>Distance from Home:</span>
                        <div className='text-gray-600'>
                          {Math.round(device.min_distance_from_home * 100) / 100} -{' '}
                          {Math.round(device.max_distance_from_home * 100) / 100} km
                        </div>
                      </div>
                      <div>
                        <span className='font-medium'>Activity Period:</span>
                        <div className='text-gray-600'>
                          {device.first_seen} to {device.last_seen}
                        </div>
                      </div>
                    </div>

                    {/* Threat Assessment */}
                    <div className='p-3 bg-gray-50 rounded-lg'>
                      <div className='font-medium text-sm mb-2'>Mobility Assessment:</div>
                      <div className='text-sm text-gray-700'>
                        {device.mobility_classification === 'EXTREME_MOBILITY_THREAT' && (
                          <>
                            🚨 <strong>CRITICAL:</strong> Device appears at home (≤1km) and at
                            distant locations (&gt;50km). This pattern indicates active surveillance
                            operations targeting your location.
                          </>
                        )}
                        {device.mobility_classification === 'HIGH_MOBILITY_SURVEILLANCE' && (
                          <>
                            ⚠️ <strong>HIGH:</strong> Device detected at {device.location_count}+
                            locations. Consistent with mobile surveillance or tracking operations.
                          </>
                        )}
                        {device.mobility_classification === 'MODERATE_MOBILITY' && (
                          <>
                            🔍 <strong>MODERATE:</strong> Device shows moderate mobility patterns.
                            May indicate legitimate mobile usage or potential surveillance.
                          </>
                        )}
                      </div>
                    </div>

                    <div className='flex gap-2 mt-3'>
                      <Button size='sm' variant='outline'>
                        View Movement Pattern
                      </Button>
                      <Button size='sm' variant='outline'>
                        Export Timeline
                      </Button>
                      <Button size='sm' variant='outline'>
                        Correlate with Federal Networks
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {data?.data.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                No high-mobility devices detected at this distance threshold. Try lowering the
                minimum distance filter.
              </div>
            )}
          </div>
        )}

        <div className='mt-4 flex justify-between items-center'>
          <Button variant='outline' onClick={() => refetch()}>
            Refresh Analysis
          </Button>
          <span className='text-sm text-gray-500'>
            Last updated: {data ? new Date().toLocaleTimeString() : 'Never'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobilityTrackingCard;
