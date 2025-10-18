import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, AlertCircle, Info, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  labels: {
    alertname: string;
    severity: string;
    layer?: string;
    [key: string]: string | undefined;
  };
  annotations: {
    summary: string;
    description: string;
  };
  state: string;
  activeAt: string;
  value: string;
}

interface AlertGroup {
  labels: Record<string, string>;
  alerts: Alert[];
}

interface AlertsResponse {
  status: string;
  data: {
    groups: AlertGroup[];
  };
}

export function AlertStatus() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:9091/api/v1/rules");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AlertsResponse = await response.json();

      if (data.status === "success") {
        const allAlerts: Alert[] = [];
        data.data.groups.forEach((group) => {
          group.alerts?.forEach((alert) => {
            allAlerts.push(alert);
          });
        });

        setAlerts(allAlerts);
        setLastUpdate(new Date());
      } else {
        throw new Error("Failed to fetch alerts");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch alerts";
      setError(errorMessage);
      console.error("Alert fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "border-red-500/50 bg-red-500/10";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "info":
        return "border-blue-500/50 bg-blue-500/10";
      default:
        return "border-slate-500/50 bg-slate-500/10";
    }
  };

  const getStateBadge = (state: string) => {
    switch (state.toLowerCase()) {
      case "firing":
        return <Badge variant="destructive" className="text-xs">Firing</Badge>;
      case "pending":
        return <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="text-xs">Inactive</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{state}</Badge>;
    }
  };

  const firingAlerts = alerts.filter(a => a.state === "firing");
  const pendingAlerts = alerts.filter(a => a.state === "pending");
  const totalActiveAlerts = firingAlerts.length + pendingAlerts.length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-container w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Live Alert Status</h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time monitoring from Prometheus Alert Manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={fetchAlerts}
              disabled={loading}
              size="sm"
              variant="outline"
              className="border-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <a
              href="http://localhost:9091/alerts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Firing Alerts</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{firingAlerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Alerts</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Active</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{totalActiveAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Failed to fetch alerts</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
              <p className="text-xs text-slate-400 mt-2">
                Make sure Prometheus is running at <code className="bg-slate-800 px-1 rounded">localhost:9091</code>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Alerts */}
      {!error && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <Card
              key={idx}
              className={`p-4 ${getSeverityColor(alert.labels.severity)} border`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getSeverityIcon(alert.labels.severity)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-md font-semibold text-slate-100">
                          {alert.labels.alertname}
                        </h4>
                        {getStateBadge(alert.state)}
                        <Badge variant="outline" className="text-xs">
                          {alert.labels.severity}
                        </Badge>
                        {alert.labels.layer && (
                          <Badge variant="secondary" className="text-xs">
                            {alert.labels.layer}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">{alert.annotations.summary}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.annotations.description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                      <p>Since:</p>
                      <p className="font-mono">{new Date(alert.activeAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Alert Labels */}
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-700/30">
                    {Object.entries(alert.labels)
                      .filter(([key]) => !["alertname", "severity", "layer"].includes(key))
                      .map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs font-mono">
                          {key}={value}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Alerts State */}
      {!error && !loading && alerts.length === 0 && (
        <Card className="p-8 bg-green-500/10 border-green-500/30">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <Bell className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-100 mb-2">All Clear!</h4>
            <p className="text-sm text-slate-400">No active alerts at this time.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
