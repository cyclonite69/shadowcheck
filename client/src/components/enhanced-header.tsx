interface EnhancedHeaderProps {
  title: string;
  subtitle: string;
}

export function EnhancedHeader({ title, subtitle }: EnhancedHeaderProps) {

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
    </header>
  );
}