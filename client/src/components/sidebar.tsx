import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { href: "/networks", icon: "fas fa-wifi", label: "Networks" },
    { href: "/spatial", icon: "fas fa-map-marked-alt", label: "Spatial Query" },
    { href: "/visualization", icon: "fas fa-chart-line", label: "Visualization" },
    { href: "/admin", icon: "fas fa-shield-alt", label: "Admin Panel" },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-card to-card/95 border-r border-border/50 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-accent rounded-xl flex items-center justify-center shadow-lg ring-1 ring-primary/20">
            <i className="fas fa-satellite-dish text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              ShadowCheck
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-wider">
              SIGINT FORENSICS API
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                location === item.href
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/20 shadow-sm"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-4 transition-colors ${
                location === item.href ? "text-primary" : "group-hover:text-primary"
              }`}></i>
              <span className="text-sm font-medium">{item.label}</span>
              {location === item.href && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="fas fa-bolt text-xs"></i>
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors text-left">
              <i className="fas fa-sync text-primary text-xs"></i>
              <span className="text-xs text-muted-foreground">Refresh Data</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors text-left">
              <i className="fas fa-download text-primary text-xs"></i>
              <span className="text-xs text-muted-foreground">Export Data</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <i className="fas fa-server"></i>
            <span>Replit Cloud</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full status-indicator"></span>
            <span className="text-accent font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
