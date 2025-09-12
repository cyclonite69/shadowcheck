import React from 'react';
import { Database, Server, Activity, AlertCircle } from 'lucide-react';

interface StatusCardProps {
  status?: {
    ok: boolean;
    database: {
      connected: boolean;
      activeConnections: number;
      maxConnections: number;
      postgisEnabled: boolean;
    };
    memory: {
      used: number;
      total: number;
    };
    uptime: number;
  };
  isLoading?: boolean;
  error?: Error | null;
}

const StatusCard: React.FC<StatusCardProps> = ({ status, isLoading, error }) => {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getMemoryPercentage = () => {
    if (!status) return 0;
    return Math.round((status.memory.used / status.memory.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="glassy p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Activity size={20} className="text-teal-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-teal-300">System Status</h3>
        </div>
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassy p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold text-red-300">System Status</h3>
        </div>
        <div className="text-center text-red-400">Error loading status: {error.message}</div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="glassy p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Activity size={20} className="text-teal-400" />
        <h3 className="text-lg font-semibold text-teal-300">System Status</h3>
      </div>

      {/* Database Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Database
              size={16}
              className={status.database.connected ? 'text-green-400' : 'text-red-400'}
            />
            <span className="text-sm font-medium text-gray-300">Database</span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              status.database.connected ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}
          >
            {status.database.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>
            Connections: {status.database.activeConnections}/{status.database.maxConnections}
          </div>
          <div>PostGIS: {status.database.postgisEnabled ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Server size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Memory</span>
          </div>
          <span className="text-xs text-gray-400">
            {getMemoryPercentage()}% ({status.memory.used}MB)
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${getMemoryPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Uptime */}
      <div className="text-center">
        <div className="text-lg font-bold text-teal-300">{formatUptime(status.uptime)}</div>
        <div className="text-xs text-gray-400">Uptime</div>
      </div>
    </div>
  );
};

export default StatusCard;
