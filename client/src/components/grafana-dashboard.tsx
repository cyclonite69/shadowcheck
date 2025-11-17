import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIconContainerClasses, iconColors } from "@/lib/iconColors";
import {
  BarChart3,
  ExternalLink,
  Maximize2,
  RefreshCw,
  TrendingUp,
  Activity,
  Database,
  Globe
} from "lucide-react";

interface Dashboard {
  id: string;
  title: string;
  description: string;
  uid: string;
  icon: typeof BarChart3;
  color: string;
}

const GRAFANA_URL = "http://localhost:3000";

export function GrafanaDashboard() {
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  const dashboards: Dashboard[] = [
    {
      id: "system-overview",
      title: "System Overview",
      description: "Complete system health, uptime, and resource usage",
      uid: "shadowcheck-overview",
      icon: Activity,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "database-metrics",
      title: "Database Metrics",
      description: "PostgreSQL performance, connections, and query stats",
      uid: "shadowcheck-db",
      icon: Database,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "api-performance",
      title: "API Performance",
      description: "Request rates, response times, and error rates",
      uid: "shadowcheck-api",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "network-analysis",
      title: "Network Analysis",
      description: "WiFi network detection and location tracking",
      uid: "shadowcheck-networks",
      icon: Globe,
      color: "from-orange-500 to-red-600"
    }
  ];

  const getDashboardUrl = (uid: string, embed: boolean = false) => {
    const params = embed
      ? "?kiosk=tv&theme=dark&refresh=30s"
      : "?theme=dark";
    return `${GRAFANA_URL}/d/${uid}${params}`;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboards.map((dashboard) => {
          const Icon = dashboard.icon;
          return (
            <Card
              key={dashboard.id}
              className="premium-card overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => setSelectedDashboard(dashboard.uid)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`icon-container w-12 h-12 bg-gradient-to-br ${dashboard.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{dashboard.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{dashboard.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDashboard(dashboard.uid);
                    }}
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    View Embedded
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 bg-gradient-to-r ${dashboard.color} hover:opacity-90 transition-all shadow-lg`}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getDashboardUrl(dashboard.uid, false), "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Grafana
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Embedded Dashboard Viewer */}
      {selectedDashboard && (
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="icon-container w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {dashboards.find(d => d.uid === selectedDashboard)?.title}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Live dashboard from Grafana
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Auto-refresh
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const iframe = document.getElementById('grafana-iframe') as HTMLIFrameElement;
                  if (iframe) { /* iframe.src = iframe.src; */ }
                }}
                className="border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all"
                title="Refresh Dashboard"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(getDashboardUrl(selectedDashboard, false), "_blank")}
                className="border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedDashboard(null)}
                className="border-slate-700 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all"
                title="Close Embedded View"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Dashboard iframe */}
          <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            <div className="aspect-video">
              <iframe
                id="grafana-iframe"
                src={getDashboardUrl(selectedDashboard, true)}
                className="w-full h-full"
                style={{ minHeight: "600px" }}
                frameBorder="0"
                title="Grafana Dashboard"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Dashboard auto-refreshes every 30 seconds. Open in Grafana for full interactive experience with custom time ranges and filters.
            </p>
          </div>
        </div>
      )}

      {/* Quick Access Info */}
      {!selectedDashboard && (
        <Card className="premium-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="icon-container w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Grafana Access</h3>
                <p className="text-sm text-slate-400 mt-0.5">Direct access to Grafana interface</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">URL</p>
                <p className="text-slate-100 font-mono text-sm">{GRAFANA_URL}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Credentials</p>
                <p className="text-slate-100 font-mono text-sm">admin / [see monitoring tab]</p>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 cursor-pointer active:scale-95"
              style={{ cursor: 'pointer' }}
              onClick={() => window.open(GRAFANA_URL, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Grafana
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
