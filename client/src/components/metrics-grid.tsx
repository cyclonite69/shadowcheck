import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Activity, Database, MemoryStick, MapPin } from 'lucide-react';
import { iconColors } from '@/lib/iconColors';

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

  const getIconColor = (title: string, status: boolean) => {
    if (!status) return 'text-slate-500';

    switch (title) {
      case 'API Health':
        return 'text-green-400';
      case 'Database Status':
        return 'text-cyan-400';
      case 'Memory Usage':
        return 'text-purple-400';
      case 'PostGIS Enabled':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  const metrics = [
    {
      title: "API Health",
      value: health?.ok ? "Online" : "Offline",
      icon: Activity,
      gradient: health?.ok ? iconColors.success.gradient : iconColors.danger.gradient,
      shadowColor: health?.ok ? iconColors.success.glow : iconColors.danger.glow,
      status: health?.ok,
    },
    {
      title: "Database Status",
      value: systemStatus?.database.connected ? "Connected" : "Disconnected",
      icon: Database,
      gradient: systemStatus?.database.connected ? iconColors.info.gradient : iconColors.neutral.gradient,
      shadowColor: systemStatus?.database.connected ? iconColors.info.glow : iconColors.neutral.glow,
      status: systemStatus?.database.connected,
    },
    {
      title: "Memory Usage",
      value: systemStatus ? `${systemStatus.memory.used}MB` : "0MB",
      icon: MemoryStick,
      gradient: iconColors.secondary.gradient,
      shadowColor: iconColors.secondary.glow,
      status: true,
    },
    {
      title: "PostGIS Enabled",
      value: systemStatus?.database.postgisEnabled ? "Yes" : "No",
      icon: MapPin,
      gradient: systemStatus?.database.postgisEnabled ? iconColors.warning.gradient : iconColors.neutral.gradient,
      shadowColor: systemStatus?.database.postgisEnabled ? iconColors.warning.glow : iconColors.neutral.glow,
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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-800/30 border border-slate-700/50`}>
                <Icon className={`h-7 w-7 ${getIconColor(metric.title, metric.status ?? false)}`} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
