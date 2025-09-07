import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MetricsGrid } from "./metrics-grid";
import { ApiTestPanel } from "./api-test-panel";
import { DatabaseStatus } from "./database-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function AdminPanel() {
  const [endpointsOpen, setEndpointsOpen] = useState(false);
  
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const endpoints = [
    { path: "GET /api/v1/health", active: true },
    { path: "GET /api/v1/status", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/within", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/g63/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/g63/locations", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/g63/visualize", active: systemStatus?.database.connected || false },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-600 flex items-center gap-2">
            <i className="fas fa-shield-alt"></i>
            System Administration & Monitoring
          </CardTitle>
          <CardDescription>
            Complete system health, API status, and database monitoring for ShadowCheck
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="system" data-testid="tab-system">System Status</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">API Testing</TabsTrigger>
          <TabsTrigger value="database" data-testid="tab-database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <MetricsGrid />
          
          {/* Database Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-cyan-500/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${
                    systemStatus?.database.connected ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></span>
                  <span className="font-medium">Database Connection</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Status: {systemStatus?.database.connected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  PostGIS: {systemStatus?.database.postgisEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-500/20 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-memory text-purple-600"></i>
                  <span className="font-medium">Memory Usage</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used: {systemStatus?.memory.used || 0}MB
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Total: {systemStatus?.memory.total || 0}MB
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints Status */}
          <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <Accordion type="single" collapsible>
                <AccordionItem value="api-endpoints">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="text-amber-600 flex items-center gap-2">
                      <i className="fas fa-plug"></i>
                      <span>API Endpoint Status</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md bg-background/60 border border-border/30">
                          <span className="text-sm font-mono text-muted-foreground">{endpoint.path}</span>
                          <Badge variant={endpoint.active ? "default" : "destructive"} className="text-xs">
                            {endpoint.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiTestPanel />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}