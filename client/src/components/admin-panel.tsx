import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MetricsGrid } from "./metrics-grid";
import { ApiTestPanel } from "./api-test-panel";
import { DatabaseStatus } from "./database-status";
import { PrometheusQuery } from "./prometheus-query";
import { AlertStatus } from "./alert-status";
import { GrafanaDashboard } from "./grafana-dashboard";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Database, MemoryStick, Plug, Activity, Server, BarChart3, FileText, Bell, ExternalLink, Copy, Eye, EyeOff, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function AdminPanel() {
  const [endpointsOpen, setEndpointsOpen] = useState(false);
  const [showGrafanaPassword, setShowGrafanaPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const handleOpenTool = (toolName: string, url: string) => {
    console.log(`🚀 Opening ${toolName}...`, url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  const endpoints = [
    { path: "GET /api/v1/health", active: true },
    { path: "GET /api/v1/status", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/within", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/locations", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/visualize", active: systemStatus?.database.connected || false },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-4 mb-2">
            <div className="icon-container w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                System Administration
              </h1>
              <p className="text-sm text-slate-400 cyber-text tracking-wide mt-1">
                Complete system health, API status, and database monitoring
              </p>
            </div>
          </div>

      <Tabs defaultValue="system" className="w-full">
        <div className="premium-card p-2 mb-6">
          <TabsList className="grid w-full grid-cols-6 bg-transparent gap-2">
            <TabsTrigger value="system" data-testid="tab-system" className="premium-card hover:scale-105 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="hidden lg:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="api" data-testid="tab-api" className="premium-card hover:scale-105 flex items-center gap-2">
              <Plug className="h-4 w-4 text-amber-400" />
              <span className="hidden lg:inline">API</span>
            </TabsTrigger>
            <TabsTrigger value="database" data-testid="tab-database" className="premium-card hover:scale-105 flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span className="hidden lg:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="premium-card hover:scale-105 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              <span className="hidden lg:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="premium-card hover:scale-105 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="hidden lg:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="premium-card hover:scale-105 flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-400" />
              <span className="hidden lg:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="system" className="space-y-6">
          <MetricsGrid />
          
          {/* Database Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="premium-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      systemStatus?.database.connected ? 'bg-green-500' : 'bg-red-500'
                    } animate-pulse`}></span>
                    <span className="font-semibold text-lg text-slate-100">Database Connection</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Status: <span className="font-medium cyber-text">{systemStatus?.database.connected ? 'Connected' : 'Disconnected'}</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  PostGIS: <span className="text-cyan-400">{systemStatus?.database.postgisEnabled ? 'Enabled' : 'Disabled'}</span>
                </p>
              </div>
            </div>

            <div className="premium-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="icon-container w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <MemoryStick className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-lg text-slate-100">Memory Usage</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Used: <span className="font-medium metric-value text-xl">{systemStatus?.memory.used || 0}</span><span className="text-xs text-slate-400 ml-1">MB</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Total: <span className="text-purple-400">{systemStatus?.memory.total || 0} MB</span>
                </p>
              </div>
            </div>
          </div>

          {/* API Endpoints Status */}
          <div className="premium-card">
            <Accordion type="single" collapsible>
              <AccordionItem value="api-endpoints" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="icon-container w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30">
                      <Plug className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg text-slate-100">API Endpoint Status</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                        <span className="text-sm font-mono text-slate-300">{endpoint.path}</span>
                        <Badge variant={endpoint.active ? "default" : "destructive"} className="text-xs">
                          {endpoint.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiTestPanel />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseStatus />
        </TabsContent>

        {/* Monitoring Tools Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          {/* Grafana Dashboards */}
          <GrafanaDashboard />

          {/* Prometheus Query Interface */}
          <PrometheusQuery />

          {/* Tool Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grafana */}
          <div className="premium-card">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-container w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">Grafana Dashboard</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Metrics visualization and monitoring</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenTool('Grafana', 'http://localhost:3000')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-md hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Grafana
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Username</span>
                    <button
                      onClick={() => copyToClipboard('admin', 'Grafana username')}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-slate-100 font-mono">admin</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Password</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowGrafanaPassword(!showGrafanaPassword)}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title={showGrafanaPassword ? "Hide password" : "Show password"}
                      >
                        {showGrafanaPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard('KZQvo7+1Vj5lEw9P4dVwJi40OcHYA6kJR1iCULWza4k=', 'Grafana password')}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-100 font-mono text-sm">
                    {showGrafanaPassword ? 'KZQvo7+1Vj5lEw9P4dVwJi40OcHYA6kJR1iCULWza4k=' : '••••••••••••••••'}
                  </p>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <strong>Available Datasources:</strong> Prometheus (metrics), Loki (logs), PostgreSQL (direct DB access)
                </p>
              </div>
            </div>
          </div>

          {/* Prometheus */}
          <div className="premium-card">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-container w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">Prometheus Metrics</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Time-series metrics collection</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenTool('Prometheus', 'http://localhost:9091')}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-md hover:from-red-600 hover:to-orange-700 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Prometheus
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Metrics Port</p>
                  <p className="text-slate-100 font-mono">:9091</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Retention</p>
                  <p className="text-slate-100 font-mono">30 days</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Scrape Interval</p>
                  <p className="text-slate-100 font-mono">15s</p>
                </div>
              </div>
            </div>
          </div>

          {/* pgAdmin */}
          <div className="premium-card">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-container w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">pgAdmin Database Manager</h3>
                    <p className="text-sm text-slate-400 mt-0.5">PostgreSQL administration interface</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenTool('pgAdmin', 'http://localhost:8080')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-md hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open pgAdmin
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Email</span>
                    <button
                      onClick={() => copyToClipboard('admin@shadowcheck.local', 'pgAdmin email')}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-slate-100 font-mono text-sm">admin@shadowcheck.local</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Password</span>
                    <button
                      onClick={() => copyToClipboard('admin123', 'pgAdmin password')}
                      className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-slate-100 font-mono">admin123</p>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-400">
                  <strong>Note:</strong> Start pgAdmin with <code className="bg-slate-800 px-2 py-1 rounded">docker-compose --profile admin up -d</code>
                </p>
              </div>
            </div>
          </div>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <div className="premium-card">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="icon-container w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">Loki Log Aggregation</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Centralized log management with Promtail</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenTool('Loki Logs', 'http://localhost:3000/explore')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4" />
                  View in Grafana
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Loki Port</p>
                  <p className="text-slate-100 font-mono">:3100</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Log Sources</p>
                  <p className="text-slate-100 font-mono">Backend, Frontend, DB</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-300 mb-2"><strong>Log Labels Available:</strong></p>
                <div className="flex flex-wrap gap-2">
                  <code className="bg-slate-900 px-2 py-1 rounded text-xs text-green-400">service</code>
                  <code className="bg-slate-900 px-2 py-1 rounded text-xs text-green-400">app=shadowcheck</code>
                  <code className="bg-slate-900 px-2 py-1 rounded text-xs text-green-400">layer=api|database|web</code>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Live Alert Status */}
          <AlertStatus />

          {/* Static Alert Rules Documentation */}
          <div className="premium-card">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="icon-container w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/30">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Configured Alert Rules</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Monitoring alert thresholds and conditions</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Service Availability Alerts */}
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-slate-200 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  Service Availability
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">ServiceDown</span>
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when service is down for 2+ minutes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">HighErrorRate</span>
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when error rate exceeds 5% for 5 minutes</p>
                  </div>
                </div>
              </div>

              {/* Database Health Alerts */}
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-slate-200 flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  Database Health
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">ConnectionPoolExhausted</span>
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when 10+ clients are waiting for connections</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">ConnectionPoolLow</span>
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when idle connections drop below 20%</p>
                  </div>
                </div>
              </div>

              {/* Memory Alerts */}
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-slate-200 flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-purple-400" />
                  Memory Usage
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">CriticalMemoryUsage</span>
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when memory usage exceeds 95% for 2 minutes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-200">HighMemoryUsage</span>
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Triggers when memory usage exceeds 90% for 5 minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  <strong>View Active Alerts:</strong> Check Grafana dashboard or Prometheus at <a href="http://localhost:9091/alerts" target="_blank" rel="noopener noreferrer" className="underline">localhost:9091/alerts</a>
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  );
}