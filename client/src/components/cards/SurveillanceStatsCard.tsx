import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { BarChart3, Activity, Shield, Tag, AlertTriangle } from 'lucide-react';

interface SurveillanceStats {
  category: string;
  count: number;
  last_activity: string;
}

interface ApiResponse {
  ok: boolean;
  data: SurveillanceStats[];
  generated_at: string;
}

const SurveillanceStatsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['surveillance-stats'],
    queryFn: async () => {
      const response = await fetch('/api/v1/surveillance/stats');
      if (!response.ok) throw new Error('Failed to fetch surveillance statistics');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatIcon = (category: string) => {
    if (category.includes('Federal')) return <Shield className='h-5 w-5 text-red-500' />;
    if (category.includes('Mobility')) return <Activity className='h-5 w-5 text-orange-500' />;
    if (category.includes('Tagged')) return <Tag className='h-5 w-5 text-blue-500' />;
    return <BarChart3 className='h-5 w-5 text-gray-500' />;
  };

  const getStatColor = (category: string, count: number) => {
    if (category.includes('Federal') && count > 0) return 'destructive';
    if (category.includes('Mobility') && count > 10) return 'secondary';
    if (category.includes('Tagged')) return 'default';
    return 'outline';
  };

  const getThreatLevel = (category: string, count: number) => {
    if (category.includes('Federal') && count > 0) return 'ACTIVE THREATS';
    if (category.includes('Mobility') && count > 20) return 'HIGH ACTIVITY';
    if (category.includes('Mobility') && count > 0) return 'MONITORING';
    return 'NORMAL';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Surveillance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Failed to load surveillance statistics: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalThreats = data?.data.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const federalCount = data?.data.find(s => s.category.includes('Federal'))?.count || 0;
  const mobilityCount = data?.data.find(s => s.category.includes('Mobility'))?.count || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5' />
          Surveillance Statistics
          {totalThreats > 0 && (
            <Badge variant={federalCount > 0 ? 'destructive' : 'secondary'}>
              {totalThreats} total detections
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time surveillance detection metrics and activity summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
            <span className='ml-2'>Loading surveillance statistics...</span>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Overview Alert */}
            {federalCount > 0 && (
              <Alert>
                <Shield className='h-4 w-4' />
                <AlertDescription>
                  🚨 <strong>{federalCount}</strong> federal surveillance networks detected. Active
                  monitoring recommended.
                </AlertDescription>
              </Alert>
            )}

            {mobilityCount > 10 && (
              <Alert>
                <Activity className='h-4 w-4' />
                <AlertDescription>
                  ⚠️ <strong>{mobilityCount}</strong> high-mobility devices detected. Potential
                  surveillance teams operating in area.
                </AlertDescription>
              </Alert>
            )}

            {/* Statistics Grid */}
            <div className='grid gap-4'>
              {data?.data.map((stat, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    {getStatIcon(stat.category)}
                    <div>
                      <div className='font-medium'>{stat.category}</div>
                      <div className='text-sm text-gray-500'>
                        Last activity:{' '}
                        {stat.last_activity
                          ? new Date(stat.last_activity).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Badge variant={getStatColor(stat.category, stat.count)}>
                      {getThreatLevel(stat.category, stat.count)}
                    </Badge>
                    <span className='text-2xl font-bold text-gray-900'>{stat.count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Insights */}
            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
              <div className='font-medium mb-2'>Analysis Summary:</div>
              <div className='text-sm text-gray-700 space-y-1'>
                {federalCount > 0 ? (
                  <div>
                    🔴 <strong>Active Surveillance:</strong> {federalCount} federal networks
                    detected
                  </div>
                ) : (
                  <div>
                    🟢 <strong>No Federal Threats:</strong> No government surveillance networks
                    detected
                  </div>
                )}

                {mobilityCount > 0 ? (
                  <div>
                    🟡 <strong>Mobile Surveillance:</strong> {mobilityCount} high-mobility devices
                    tracked
                  </div>
                ) : (
                  <div>
                    🟢 <strong>No Mobility Threats:</strong> No suspicious device movement patterns
                  </div>
                )}

                <div className='mt-2 pt-2 border-t text-xs text-gray-500'>
                  Generated at:{' '}
                  {data?.generated_at ? new Date(data.generated_at).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 mt-4'>
              <Button variant='outline' onClick={() => refetch()}>
                Refresh Stats
              </Button>
              <Button variant='outline' size='sm'>
                Export Report
              </Button>
              <Button variant='outline' size='sm'>
                View Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveillanceStatsCard;
