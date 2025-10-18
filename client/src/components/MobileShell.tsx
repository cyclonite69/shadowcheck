import { useState } from 'react';
import { Link, useLocation } from "wouter";
import { Menu, X, Home, BarChart3, Wifi, TrendingUp, Shield, Satellite, Server } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  const [location] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/networks", icon: Wifi, label: "Network Observations", highlight: true },
    { href: "/visualization", icon: TrendingUp, label: "Network Visualization" },
    { href: "/admin", icon: Shield, label: "Admin Panel" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-blue-500/20">
            <Satellite className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              ShadowCheck
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-wider">
              SIGINT FORENSICS
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          data-testid="mobile-menu-toggle"
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-card to-card/95 border-r border-border/50 backdrop-blur-sm transform transition-transform duration-300 ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-blue-500/20">
              <Satellite className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  ShadowCheck
                </h1>
              </div>
              <p className="text-xs text-muted-foreground font-mono tracking-wider">
                SIGINT FORENSICS
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
                    : item.highlight
                    ? "hover:bg-gradient-to-r hover:from-slate-500/10 hover:to-blue-500/10 text-slate-600 hover:text-cyan-300 border border-slate-500/20 hover:border-slate-500/40"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => setIsDrawerOpen(false)}
              >
                <item.icon className={`w-4 h-4 transition-colors ${
                  location === item.href ? "text-primary" : 
                  item.highlight ? "text-slate-600 group-hover:text-cyan-300" :
                  "group-hover:text-primary"
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.highlight && location !== item.href && (
                  <div className="ml-auto px-1.5 py-0.5 bg-slate-500/20 text-slate-600 text-xs font-medium rounded">
                    NEW
                  </div>
                )}
                {location === item.href && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                )}
              </Link>
            ))}
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
              <span className="w-1.5 h-1.5 bg-accent rounded-full status-indicator"></span>
              <span className="text-accent font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-20 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}