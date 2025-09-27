import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, AlertTriangle, Search, Eye, ChevronDown, ChevronUp, Wifi } from 'lucide-react';

interface FederalThreat {
  bssid: string;
  ssid: string;
  threat_classification: string;
  final_threat_score: number;
  sightings: number;
  avg_distance_km: number;
  security_level: string;
  manufacturer: string;
  first_observed: string;
  last_observed: string;
  final_assessment: string;
  recommended_action: string;
}

interface ApiResponse {
  ok: boolean;
  data: FederalThreat[];
  count: number;
  filters: {
    threat_level?: string;
    limit: number;
  };
}

export default function FederalSurveillanceCard() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ['federal-surveillance', selectedLevel],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (selectedLevel !== 'all') {
        params.append('threat_level', selectedLevel);
      }
      const response = await fetch(`/api/v1/surveillance/federal?${params}`);
      if (!response.ok) throw new Error('Failed to fetch federal surveillance data');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getThreatIcon = (assessment: string) => {
    switch (assessment) {
      case 'CONFIRMED_THREAT':
        return <Shield className='h-4 w-4 text-red-500' />;
      case 'HIGH_SUSPICION':
        return <AlertTriangle className='h-4 w-4 text-orange-500' />;
      case 'INVESTIGATE':
        return <Search className='h-4 w-4 text-yellow-500' />;
      case 'POTENTIAL_HUMINT_COVER':
        return <Eye className='h-4 w-4 text-blue-500' />;
      default:
        return <Wifi className='h-4 w-4 text-gray-400' />;
    }
  };

  const getThreatColor = (assessment: string) => {
    switch (assessment) {
      case 'CONFIRMED_THREAT':
        return 'destructive';
      case 'HIGH_SUSPICION':
        return 'secondary';
      case 'INVESTIGATE':
        return 'outline';
      case 'POTENTIAL_HUMINT_COVER':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'HIGH_SECURITY':
        return 'destructive';
      case 'STANDARD_SECURITY':
        return 'secondary';
      case 'BASIC_SECURITY':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const threatCounts =
    data?.data.reduce(
      (acc, threat) => {
        acc[threat.final_assessment] = (acc[threat.final_assessment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  const handleDrillDown = (bssid: string) => {
    setExpandedThreat(expandedThreat === bssid ? null : bssid);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Federal Surveillance Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Failed to load federal surveillance data: {error.message}
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
          <Shield className='h-5 w-5' />
          Federal Surveillance Detection
          {data && <Badge variant='secondary'>{data.count} networks</Badge>}
        </CardTitle>
        <CardDescription>
          Real-time detection of federal law enforcement surveillance networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
          <TabsList className='grid w-full grid-cols-5'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='confirmed'>
              🚨 Confirmed ({threatCounts['CONFIRMED_THREAT'] || 0})
            </TabsTrigger>
            <TabsTrigger value='high'>
              ⚠️ Suspicion ({threatCounts['HIGH_SUSPICION'] || 0})
            </TabsTrigger>
            <TabsTrigger value='investigate'>
              🔍 Investigate ({threatCounts['INVESTIGATE'] || 0})
            </TabsTrigger>
            <TabsTrigger value='humint'>
              👤 HUMINT ({threatCounts['POTENTIAL_HUMINT_COVER'] || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className='mt-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
                <span className='ml-2'>Analyzing surveillance networks...</span>
              </div>
            ) : (
              <div className='space-y-3'>
                {data?.data.map(threat => (
                  <div key={threat.bssid} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        {getThreatIcon(threat.final_assessment)}
                        <div>
                          <div className='font-medium'>{threat.ssid}</div>
                          <div className='text-sm text-gray-500'>
                            {threat.bssid} • {threat.manufacturer}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Badge variant={getThreatColor(threat.final_assessment)}>
                          {threat.final_assessment.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={getSecurityColor(threat.security_level)}>
                          {threat.security_level.replace(/_/g, ' ')}
                        </Badge>
                        <span className='text-sm font-bold text-red-600'>
                          {threat.final_threat_score}
                        </span>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDrillDown(threat.bssid)}
                        >
                          {expandedThreat === threat.bssid ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Drill-down details */}
                    {expandedThreat === threat.bssid && (
                      <div className='mt-4 pt-4 border-t space-y-2'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='font-medium'>Classification:</span>
                            <div className='text-gray-600'>
                              {threat.threat_classification.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div>
                            <span className='font-medium'>Distance from Home:</span>
                            <div className='text-gray-600'>{threat.avg_distance_km} km</div>
                          </div>
                          <div>
                            <span className='font-medium'>Sightings:</span>
                            <div className='text-gray-600'>{threat.sightings}</div>
                          </div>
                          <div>
                            <span className='font-medium'>Active Period:</span>
                            <div className='text-gray-600'>
                              {threat.first_observed} to {threat.last_observed}
                            </div>
                          </div>
                        </div>

                        <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='font-medium text-sm mb-1'>Recommended Action:</div>
                          <div className='text-sm text-gray-700'>{threat.recommended_action}</div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                          <Button size='sm' variant='outline'>
                            View on Map
                          </Button>
                          <Button size='sm' variant='outline'>
                            WiGLE Lookup
                          </Button>
                          <Button size='sm' variant='outline'>
                            Tag Network
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {data?.data.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    No federal surveillance networks detected at this threat level.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
}
