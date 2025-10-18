import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Activity, Database, MemoryStick, MapPin } from 'lucide-react';

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
      icon: Activity,
      gradient: health?.ok ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600",
      shadowColor: health?.ok ? "shadow-green-500/30" : "shadow-red-500/30",
      status: health?.ok,
    },
    {
      title: "Database Status",
      value: systemStatus?.database.connected ? "Connected" : "Disconnected",
      icon: Database,
      gradient: systemStatus?.database.connected ? "from-blue-500 to-cyan-600" : "from-gray-500 to-slate-600",
      shadowColor: systemStatus?.database.connected ? "shadow-blue-500/30" : "shadow-gray-500/30",
      status: systemStatus?.database.connected,
    },
    {
      title: "Memory Usage",
      value: systemStatus ? `${systemStatus.memory.used}MB` : "0MB",
      icon: MemoryStick,
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "shadow-purple-500/30",
      status: true,
    },
    {
      title: "PostGIS Enabled",
      value: systemStatus?.database.postgisEnabled ? "Yes" : "No",
      icon: MapPin,
      gradient: systemStatus?.database.postgisEnabled ? "from-amber-500 to-orange-600" : "from-gray-500 to-slate-600",
      shadowColor: systemStatus?.database.postgisEnabled ? "shadow-amber-500/30" : "shadow-gray-500/30",
      status: systemStatus?.database.postgisEnabled,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="premium-card p-6 animate-pulse loading-shimmer">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="premium-card p-6" data-testid={`metric-card-${metric.title.toLowerCase().replace(' ', '-')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">{metric.title}</p>
                <p className={`text-2xl font-bold ${metric.status ? 'text-slate-100' : 'text-slate-400'}`}>{metric.value}</p>
              </div>
              <div className={`icon-container w-12 h-12 bg-gradient-to-br ${metric.gradient} shadow-lg ${metric.shadowColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
