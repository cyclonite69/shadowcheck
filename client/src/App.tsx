import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import VisualizationPage from "@/pages/visualization";
import NetworksPage from "@/pages/networks";
import { Sidebar } from "@/components/sidebar";
import { AdminPanel } from "@/components/admin-panel";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/networks" component={() => <div className="flex-1 p-6 overflow-y-auto"><NetworksPage /></div>} />
        <Route path="/spatial" component={() => <div className="flex-1 p-6"><h1>Spatial Query Page - Coming Soon</h1></div>} />
        <Route path="/visualization" component={VisualizationPage} />
        <Route path="/admin" component={() => <div className="flex-1 p-6"><AdminPanel /></div>} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
