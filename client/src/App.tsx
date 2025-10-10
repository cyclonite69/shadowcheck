import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import VisualizationPage from "@/pages/visualization";
import NetworksPage from "@/pages/networks";
import { AdminPanel } from "@/components/admin-panel";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { FloatingActions } from "@/components/FloatingActions";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function Router() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log('Export triggered');
  };


  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route>
          {isMobile ? (
            <MobileShell>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/networks" component={() => <div className="flex-1 px-3 md:px-6 py-4 overflow-y-auto"><NetworksPage /></div>} />
                <Route path="/visualization" component={VisualizationPage} />
                <Route path="/admin" component={() => <div className="flex-1 px-3 md:px-6 py-4"><AdminPanel /></div>} />
                <Route component={NotFound} />
              </Switch>
            </MobileShell>
          ) : (
            <DesktopShell>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/networks" component={() => <div className="flex-1 px-3 md:px-6 py-4 overflow-y-auto"><NetworksPage /></div>} />
                <Route path="/visualization" component={VisualizationPage} />
                <Route path="/admin" component={() => <div className="flex-1 px-3 md:px-6 py-4"><AdminPanel /></div>} />
                <Route component={NotFound} />
              </Switch>
            </DesktopShell>
          )}
        </Route>
      </Switch>
      {isMobile && (
        <FloatingActions 
          onRefresh={handleRefresh}
          onExport={handleExport}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
