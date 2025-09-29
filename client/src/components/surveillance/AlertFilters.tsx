import React from 'react';
import { SurveillanceAlert } from '../../lib/api';

interface AlertFiltersProps {
  onFiltersChange: (filters: {
    alert_level?: SurveillanceAlert['alert_level'];
    alert_status?: SurveillanceAlert['alert_status'];
    requires_immediate_attention?: boolean;
  }) => void;
}

export function AlertFilters({ onFiltersChange }: AlertFiltersProps) {
  const [filters, setFilters] = React.useState<{
    alert_level?: SurveillanceAlert['alert_level'];
    alert_status?: SurveillanceAlert['alert_status'];
    requires_immediate_attention?: boolean;
  }>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value === '' ? undefined : value,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className='premium-card p-6 cyber-border'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='icon-container'>
            <svg className='w-5 h-5 text-blue-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z' />
            </svg>
          </div>
          <h3 className='text-lg font-semibold hero-gradient-text'>Alert Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className='px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 cyber-glow text-sm'
          >
            Clear All
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Alert Level Filter */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-3 cyber-text'>Alert Level</label>
          <select
            value={filters.alert_level || ''}
            onChange={e => handleFilterChange('alert_level', e.target.value)}
            className='w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 cyber-glow-subtle'
          >
            <option value=''>All levels</option>
            <option value='emergency'>🚨 Emergency</option>
            <option value='critical'>❗ Critical</option>
            <option value='warning'>⚠️ Warning</option>
            <option value='info'>ℹ️ Info</option>
          </select>
        </div>

        {/* Alert Status Filter */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-3 cyber-text'>Status</label>
          <select
            value={filters.alert_status || ''}
            onChange={e => handleFilterChange('alert_status', e.target.value)}
            className='w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 cyber-glow-subtle'
          >
            <option value=''>All statuses</option>
            <option value='pending'>⏳ Pending</option>
            <option value='investigating'>🔍 Investigating</option>
            <option value='resolved'>✅ Resolved</option>
            <option value='dismissed'>❌ Dismissed</option>
          </select>
        </div>

        {/* Immediate Attention Filter */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-3 cyber-text'>Priority</label>
          <select
            value={
              filters.requires_immediate_attention === undefined
                ? ''
                : String(filters.requires_immediate_attention)
            }
            onChange={e =>
              handleFilterChange(
                'requires_immediate_attention',
                e.target.value === '' ? undefined : e.target.value === 'true'
              )
            }
            className='w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300 cyber-glow-subtle'
          >
            <option value=''>All priorities</option>
            <option value='true'>🔥 Immediate attention</option>
            <option value='false'>📋 Normal priority</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className='flex flex-col justify-end'>
          <label className='block text-sm font-medium text-slate-300 mb-3 cyber-text'>Quick Filters</label>
          <div className='flex flex-col space-y-2'>
            <button
              onClick={() =>
                onFiltersChange({ alert_status: 'pending', requires_immediate_attention: true })
              }
              className='px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm rounded-xl transition-all duration-300 cyber-glow'
            >
              🚨 Urgent Pending
            </button>
            <button
              onClick={() => onFiltersChange({ alert_level: 'critical' })}
              className='px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm rounded-xl transition-all duration-300 cyber-glow'
            >
              ❗ Critical Only
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='mt-6 pt-6 border-t border-slate-700/50'>
          <div className='flex items-center space-x-3 flex-wrap gap-2'>
            <span className='text-sm text-slate-400 cyber-text flex items-center gap-2'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              Active filters:
            </span>
            {filters.alert_level && (
              <span className='px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-500/30 text-blue-300 text-xs rounded-full cyber-text'>
                Level: {filters.alert_level}
              </span>
            )}
            {filters.alert_status && (
              <span className='px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-500/30 text-green-300 text-xs rounded-full cyber-text'>
                Status: {filters.alert_status}
              </span>
            )}
            {filters.requires_immediate_attention !== undefined && (
              <span className={`px-3 py-1 text-xs rounded-full cyber-text ${
                filters.requires_immediate_attention
                  ? 'bg-gradient-to-r from-red-500/20 to-red-400/20 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-500/30 text-yellow-300'
              }`}>
                Priority: {filters.requires_immediate_attention ? 'Urgent' : 'Normal'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
