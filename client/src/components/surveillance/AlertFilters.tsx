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
    <div className='bg-gray-800 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white'>Filter Alerts</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className='text-blue-400 hover:text-blue-300 text-sm transition-colors'
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Alert Level Filter */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Alert Level</label>
          <select
            value={filters.alert_level || ''}
            onChange={e => handleFilterChange('alert_level', e.target.value)}
            className='w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>All levels</option>
            <option value='emergency'>Emergency</option>
            <option value='critical'>Critical</option>
            <option value='warning'>Warning</option>
            <option value='info'>Info</option>
          </select>
        </div>

        {/* Alert Status Filter */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Status</label>
          <select
            value={filters.alert_status || ''}
            onChange={e => handleFilterChange('alert_status', e.target.value)}
            className='w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>All statuses</option>
            <option value='pending'>Pending</option>
            <option value='investigating'>Investigating</option>
            <option value='resolved'>Resolved</option>
            <option value='dismissed'>Dismissed</option>
          </select>
        </div>

        {/* Immediate Attention Filter */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Priority</label>
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
            className='w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>All priorities</option>
            <option value='true'>Immediate attention</option>
            <option value='false'>Normal priority</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className='flex flex-col justify-end'>
          <label className='block text-sm font-medium text-gray-300 mb-2'>Quick Filters</label>
          <div className='flex space-x-2'>
            <button
              onClick={() =>
                onFiltersChange({ alert_status: 'pending', requires_immediate_attention: true })
              }
              className='px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors'
            >
              Urgent Pending
            </button>
            <button
              onClick={() => onFiltersChange({ alert_level: 'critical' })}
              className='px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors'
            >
              Critical Only
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='mt-4 pt-4 border-t border-gray-700'>
          <div className='flex items-center space-x-2 flex-wrap'>
            <span className='text-sm text-gray-400'>Active filters:</span>
            {filters.alert_level && (
              <span className='px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded'>
                Level: {filters.alert_level}
              </span>
            )}
            {filters.alert_status && (
              <span className='px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded'>
                Status: {filters.alert_status}
              </span>
            )}
            {filters.requires_immediate_attention !== undefined && (
              <span className='px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded'>
                Priority: {filters.requires_immediate_attention ? 'Urgent' : 'Normal'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
