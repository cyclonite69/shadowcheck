import { Link, useLocation } from "wouter";
import { Home, BarChart3, Wifi, TrendingUp, Shield, Satellite, Zap, Server, Circle, Eye } from "lucide-react";
import { iconColors } from "@/lib/iconColors";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home", highlight: true, color: iconColors.primary },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard", highlight: true, color: iconColors.info },
    { href: "/visualization", icon: TrendingUp, label: "Network Visualization", highlight: true, color: iconColors.success },
    { href: "/access-points", icon: Satellite, label: "Access Points", highlight: true, color: iconColors.warning },
    { href: "/surveillance", icon: Eye, label: "Surveillance Intelligence", highlight: true, color: iconColors.special },
    { href: "/admin", icon: Shield, label: "Admin Panel", highlight: true, color: iconColors.neutral },
  ];

  return (
    <div className="h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col cyber-scan-line overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50">
        <Link href="/">
          <div className="flex flex-col items-center gap-4 cursor-pointer group">
            {/* ShadowCheck Badge */}
            <div className="relative">
              <div className="icon-container w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-900">✓</span>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)]">
                ShadowCheck
              </h1>
              <p className="text-[10px] text-slate-400 cyber-text tracking-widest mt-1">
                SIGINT FORENSICS
              </p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                location === item.href
                  ? `bg-gradient-to-r ${item.color.bg}/20 ${item.color.border.replace('border-', 'to-')}/20 text-white border ${item.color.border}/30 shadow-lg ${item.color.glow} cyber-glow`
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700/50"
              }`}
              data-testid={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                location === item.href ? item.color.text :
                `text-slate-500 group-hover:${item.color.text}`
              }`} />
              <span className="text-sm font-medium">{item.label}</span>
              {location === item.href && (
                <div className={`ml-auto w-2 h-2 ${item.color.bg} rounded-full animate-pulse`}></div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/50">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${iconColors.primary.text}`} />
            <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ShadowCheck
            </span>
          </div>
          <div className="text-[10px] text-slate-500 tracking-wider cyber-text">
            WIRELESS INTELLIGENCE PLATFORM
          </div>
          <div className="mt-2 px-3 py-1 silver-accent rounded-full inline-block">
            <span className="text-[10px] font-semibold text-slate-700">OPERATIONAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
