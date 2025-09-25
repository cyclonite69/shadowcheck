import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function MetricsGrid() {
  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const { data: health } = useQuery({
    queryKey: ["/api/v1/health"],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000,
  });

  const metrics = [
    {
      title: "API Health",
      value: health?.ok ? "Online" : "Offline",
      icon: "fas fa-heartbeat",
      color: health?.ok ? "text-accent" : "text-destructive",
      bgColor: health?.ok ? "bg-accent/10" : "bg-destructive/10",
    },
    {
      title: "DB Connections",
      value: systemStatus 
        ? `${systemStatus.database.activeConnections}/${systemStatus.database.maxConnections}`
        : "0/5",
      icon: "fas fa-database",
      color: systemStatus?.database.connected ? "text-accent" : "text-destructive",
      bgColor: systemStatus?.database.connected ? "bg-accent/10" : "bg-destructive/10",
    },
    {
      title: "Memory Usage",
      value: systemStatus ? `${systemStatus.memory.used}MB` : "0MB",
      icon: "fas fa-memory",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Queries",
      value: "0",
      icon: "fas fa-search",
      color: "text-muted-foreground",
      bgColor: "bg-secondary",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-muted rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-6" data-testid={`metric-card-${metric.title.toLowerCase().replace(' ', '-')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
            <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
              <i className={`${metric.icon} ${metric.color} text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
