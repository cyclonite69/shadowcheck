/**
 * Classification System Test Panel
 *
 * Comprehensive testing interface for all classification API endpoints
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  Shield,
  Building,
  Smartphone,
  MapPin,
  Search,
  BarChart3,
  LucideIcon
} from 'lucide-react';

interface RegularTest {
  name: string;
  icon: LucideIcon;
  description: string;
  url: string;
  color: string;
  custom?: never;
  action?: never;
}

interface CustomTest {
  name: string;
  icon: LucideIcon;
  description: string;
  custom: true;
  action: () => void;
  color: string;
  url?: never;
}

type EndpointTest = RegularTest | CustomTest;

export function ClassificationTestPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [endpointResult, setEndpointResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Test endpoint function
  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(name);
    setSelectedEndpoint(name);
    try {
      const res = await fetch(url, options);
      const data = await res.json();

      setEndpointResult({
        success: res.ok,
        status: res.status,
        data: data,
        timestamp: new Date().toISOString()
      });

      if (res.ok) {
        toast({
          title: `✅ ${name} - Success`,
          description: `Status: ${res.status}`,
        });
      } else {
        toast({
          title: `❌ ${name} - Failed`,
          description: data.error || `Status: ${res.status}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      setEndpointResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });

      toast({
        title: `❌ ${name} - Error`,
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/classification/refresh', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Classification Refresh Complete',
        description: `Refreshed ${data.total_networks} networks in ${data.duration_ms}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/classification'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const endpoints: { category: string; tests: EndpointTest[] }[] = [
    {
      category: 'Summary & Statistics',
      tests: [
        {
          name: 'Classification Summary',
          icon: Database,
          description: 'Get overall classification statistics',
          url: '/api/v1/classification/summary',
          color: 'blue'
        },
        {
          name: 'Technology Breakdown',
          icon: BarChart3,
          description: 'Detailed technology type distribution',
          url: '/api/v1/classification/technology-breakdown',
          color: 'green'
        },
        {
          name: 'Security Breakdown',
          icon: Shield,
          description: 'Security risk level distribution',
          url: '/api/v1/classification/security-breakdown',
          color: 'orange'
        },
        {
          name: 'Location Stats',
          icon: MapPin,
          description: 'Statistics by location confidence',
          url: '/api/v1/classification/stats-by-location',
          color: 'purple'
        }
      ]
    },
    {
      category: 'Network Queries',
      tests: [
        {
          name: 'Get All Networks (Limit 10)',
          icon: Database,
          description: 'Fetch classified networks',
          url: '/api/v1/classification/networks?limit=10',
          color: 'blue'
        },
        {
          name: 'Wi-Fi Networks Only',
          icon: Database,
          description: 'Filter by Wi-Fi technology',
          url: '/api/v1/classification/networks?technology=Wi-Fi&limit=10',
          color: 'cyan'
        },
        {
          name: 'High-Risk Networks',
          icon: AlertCircle,
          description: 'Networks with security vulnerabilities',
          url: '/api/v1/classification/high-risk-networks?limit=20',
          color: 'red'
        },
        {
          name: 'Mobile Assets',
          icon: Smartphone,
          description: 'Mobile hotspots and vehicle networks',
          url: '/api/v1/classification/mobile-assets?limit=20',
          color: 'indigo'
        },
        {
          name: 'Corporate Networks',
          icon: Building,
          description: 'Corporate/commercial infrastructure',
          url: '/api/v1/classification/networks?infrastructure=Corporate/Commercial&limit=10',
          color: 'teal'
        }
      ]
    },
    {
      category: 'Search & Lookup',
      tests: [
        {
          name: 'Search Networks',
          icon: Search,
          description: 'Search by SSID or BSSID',
          custom: true,
          action: () => {
            if (!searchQuery) {
              toast({
                title: 'Search Query Required',
                description: 'Enter an SSID or BSSID to search',
                variant: 'destructive'
              });
              return;
            }
            testEndpoint('Search Networks', `/api/v1/classification/search?q=${encodeURIComponent(searchQuery)}`);
          },
          color: 'yellow'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="premium-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-100 flex items-center gap-3">
                <Database className="h-7 w-7 text-blue-400" />
                Network Classification System - API Testing
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Test all classification endpoints and view real-time results
              </CardDescription>
            </div>
            <Button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {refreshMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Classifications
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Test Endpoints */}
      {endpoints.map((category, catIdx) => (
        <Card key={catIdx} className="premium-card">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tests.map((test, testIdx) => {
                const Icon = test.icon;
                const isLoading = loading === test.name;
                const wasSelected = selectedEndpoint === test.name;

                return (
                  <div
                    key={testIdx}
                    className={`p-4 rounded-lg border transition-all ${
                      wasSelected
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-${test.color}-500/20 border border-${test.color}-500/30 flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 text-${test.color}-400`} />
                      </div>
                      {wasSelected && endpointResult && (
                        <Badge variant={endpointResult.success ? 'default' : 'destructive'}>
                          {endpointResult.success ? 'Success' : 'Failed'}
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 mb-1">
                      {test.name}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      {test.description}
                    </p>

                    {'custom' in test && test.custom ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter SSID or BSSID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button
                          onClick={test.action}
                          disabled={isLoading}
                          size="sm"
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Icon className="mr-2 h-4 w-4" />
                              Test
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => testEndpoint(test.name, (test as RegularTest).url)}
                        disabled={isLoading}
                        size="sm"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Icon className="mr-2 h-4 w-4" />
                            Test Endpoint
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Results Panel */}
      {endpointResult && (
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              {endpointResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              Test Results: {selectedEndpoint}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {endpointResult.timestamp}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Status Code</p>
                  <p className={`text-2xl font-bold ${endpointResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {endpointResult.status || 'Error'}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Result</p>
                  <p className={`text-lg font-semibold ${endpointResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {endpointResult.success ? 'Success' : 'Failed'}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Data Type</p>
                  <p className="text-lg font-semibold text-slate-200">
                    {endpointResult.data ? typeof endpointResult.data : 'None'}
                  </p>
                </div>
              </div>

              {/* Response Data */}
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-2 font-mono">Response Data:</p>
                <pre className="text-xs text-slate-300 overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(endpointResult.data || endpointResult.error, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
