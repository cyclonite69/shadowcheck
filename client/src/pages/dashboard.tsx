import { MetricsGrid } from "@/components/metrics-grid";
import { ApiTestPanel } from "@/components/api-test-panel";
import { DatabaseStatus } from "@/components/database-status";
import { SpatialQueryInterface } from "@/components/spatial-query-interface";
import { NetworkObservations } from "@/components/network-observations";
import { EnhancedHeader } from "@/components/enhanced-header";

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EnhancedHeader 
        title="SIGINT Forensics Dashboard"
        subtitle="Monitor and analyze wireless network observations with real-time intelligence"
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 grid-pattern">
        <MetricsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ApiTestPanel />
          <DatabaseStatus />
        </div>
        
        <SpatialQueryInterface />
        <NetworkObservations />
      </main>
    </div>
  );
}
