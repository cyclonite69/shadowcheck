import React from 'react';
import { Sidebar } from '@/components/sidebar';

interface DesktopShellProps {
  children: React.ReactNode;
}

export function DesktopShell({ children }: DesktopShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground">
      {/* Fixed Sidebar */}
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area - ensures all pages can scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}