import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Menu, X } from 'lucide-react';

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-4 left-4 z-50 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg hover:bg-card transition-all duration-200 shadow-lg"
        data-testid="button-toggle-sidebar"
        aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
      >
        {sidebarCollapsed ? (
          <Menu className="h-5 w-5 text-foreground" />
        ) : (
          <X className="h-5 w-5 text-foreground" />
        )}
      </button>
      
      {/* Sidebar with collapse animation */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-0 -ml-64' : 'w-64'
      }`}>
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      }`}>
        {children}
      </div>
    </div>
  );
}