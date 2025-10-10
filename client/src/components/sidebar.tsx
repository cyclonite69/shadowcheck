import { Link, useLocation } from "wouter";
import { Home, BarChart3, Wifi, TrendingUp, Shield, Satellite, Zap, RefreshCw, Download, Server, Circle } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home", highlight: true },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard", highlight: true },
    { href: "/networks", icon: Wifi, label: "Observed Networks", highlight: true },
    { href: "/visualization", icon: TrendingUp, label: "Network Visualization", highlight: true },
    { href: "/admin", icon: Shield, label: "Admin Panel", highlight: true },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-card to-card/95 border-r border-border/50 flex flex-col backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                ShadowCheck
              </h1>
              <p className="text-xs text-slate-400 cyber-text tracking-wider">
                SIGINT FORENSICS PLATFORM
              </p>
            </div>
          </div>
        </Link>
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
                  : item.highlight
                  ? "hover:bg-gradient-to-r hover:from-slate-500/10 hover:to-blue-500/10 text-slate-600 hover:text-cyan-300 border border-slate-500/20 hover:border-slate-500/40"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${
                location === item.href ? "text-primary" : 
                item.highlight ? "text-slate-600 group-hover:text-cyan-300" :
                "group-hover:text-primary"
              }`} />
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
            <Zap className="h-3 w-3" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors text-left">
              <RefreshCw className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Refresh Data</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors text-left">
              <Download className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground">Export Data</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Server className="h-3 w-3" />
            <span>Replit Cloud</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
            <span className="text-accent font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
