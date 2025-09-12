import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Shield, Wifi, Activity } from 'lucide-react';

interface AnalyticsCardProps {
  analytics?: {
    total_networks: number;
    unique_ssids: number;
    encrypted_networks: number;
    open_networks: number;
    signal_strength_avg: number;
    recent_observations: number;
  };
  signalStrength?: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  securityAnalysis?: {
    wpa3: number;
    wpa2: number;
    wpa: number;
    wep: number;
    open: number;
    unknown: number;
  };
}

const _COLORS = ['#00D9E1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  analytics,
  signalStrength,
  securityAnalysis,
}) => {
  if (!analytics) return null;

  const securityData = securityAnalysis
    ? [
        { name: 'WPA3', value: securityAnalysis.wpa3, color: '#10B981' },
        { name: 'WPA2', value: securityAnalysis.wpa2, color: '#00D9E1' },
        { name: 'WPA', value: securityAnalysis.wpa, color: '#F59E0B' },
        { name: 'WEP', value: securityAnalysis.wep, color: '#EF4444' },
        { name: 'Open', value: securityAnalysis.open, color: '#8B5CF6' },
      ]
    : [];

  return (
    <div className="glassy p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp size={20} className="text-teal-400" />
        <h3 className="text-lg font-semibold text-teal-300">Network Analytics</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Wifi size={16} className="text-teal-400" />
            <span className="text-2xl font-bold text-teal-300">{analytics.total_networks}</span>
          </div>
          <div className="text-xs text-gray-400">Total Networks</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Shield size={16} className="text-green-400" />
            <span className="text-2xl font-bold text-green-300">
              {analytics.encrypted_networks}
            </span>
          </div>
          <div className="text-xs text-gray-400">Encrypted</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Activity size={16} className="text-orange-400" />
            <span className="text-2xl font-bold text-orange-300">{analytics.unique_ssids}</span>
          </div>
          <div className="text-xs text-gray-400">Unique SSIDs</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-300">
            {analytics.signal_strength_avg?.toFixed(0) || 'N/A'}
          </div>
          <div className="text-xs text-gray-400">Avg Signal (dBm)</div>
        </div>
      </div>

      {/* Security Analysis Pie Chart */}
      {securityAnalysis && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Security Distribution</h4>
          <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={securityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  dataKey="value"
                >
                  {securityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Signal Strength Distribution */}
      {signalStrength && signalStrength.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Signal Strength Distribution</h4>
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer>
              <BarChart data={signalStrength}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#00D9E1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCard;
