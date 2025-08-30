import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface EnhancedHeaderProps {
  title: string;
  subtitle: string;
  showMetrics?: boolean;
}

export function EnhancedHeader({ title, subtitle, showMetrics = true }: EnhancedHeaderProps) {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/v1/status"],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 5000,
  });

  const updateTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  return (
    <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 backdrop-blur-sm">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-satellite-dish text-primary-foreground text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {showMetrics && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <span className={`w-2 h-2 rounded-full ${
                    systemStatus?.database.connected ? 'bg-accent' : 'bg-destructive'
                  } status-indicator`}></span>
                  <span className="font-medium">
                    DB: {systemStatus?.database.connected ? 'Connected' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <i className="fas fa-memory text-primary text-xs"></i>
                  <span className="font-mono text-xs">
                    {systemStatus?.memory.used || 0}MB
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/30">
                  <span className="w-2 h-2 bg-accent rounded-full status-indicator"></span>
                  <span className="text-xs font-medium">
                    Online - {updateTimestamp()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <button 
                className="p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-border/30 hover:border-primary/30"
                onClick={() => window.location.reload()}
                data-testid="refresh-button"
              >
                <i className="fas fa-sync-alt text-muted-foreground hover:text-primary transition-colors"></i>
              </button>
              
              <button className="p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 border border-border/30 hover:border-primary/30">
                <i className="fas fa-cog text-muted-foreground hover:text-primary transition-colors"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}