import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import { Sidebar } from "@/components/sidebar";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/networks" component={() => <div className="flex-1 p-6"><h1>Networks Page - Coming Soon</h1></div>} />
        <Route path="/spatial" component={() => <div className="flex-1 p-6"><h1>Spatial Query Page - Coming Soon</h1></div>} />
        <Route path="/visualization" component={() => <div className="flex-1 p-6"><h1>Visualization Page - Coming Soon</h1></div>} />
        <Route path="/database" component={() => <div className="flex-1 p-6"><h1>Database Status Page - Coming Soon</h1></div>} />
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
