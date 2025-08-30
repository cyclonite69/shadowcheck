import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const navItems = [
    { href: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { href: "/networks", icon: "fas fa-wifi", label: "Networks" },
    { href: "/spatial", icon: "fas fa-map-marked-alt", label: "Spatial Query" },
    { href: "/visualization", icon: "fas fa-chart-line", label: "Visualization" },
    { href: "/database", icon: "fas fa-database", label: "Database Status" },
  ];

  const endpoints = [
    { path: "GET /api/v1/health", active: true },
    { path: "GET /api/v1/version", active: true },
    { path: "GET /api/v1/networks", active: systemStatus?.database.connected || false },
    { path: "GET /api/v1/within", active: systemStatus?.database.connected || false },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-satellite-dish text-primary-foreground text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold">ShadowCheck</h1>
            <p className="text-xs text-muted-foreground font-mono">SIGINT Forensics API</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                location === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-4`}></i>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        
        {/* API Endpoints */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            API Endpoints
          </h3>
          <div className="space-y-1">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    endpoint.active ? "bg-accent status-indicator" : "bg-destructive"
                  }`}
                ></span>
                <span className="text-muted-foreground">{endpoint.path}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <i className="fas fa-server"></i>
          <span>Connected to Replit</span>
        </div>
      </div>
    </div>
  );
}
