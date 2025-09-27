import React, { useState } from 'react';
import { SurveillanceAlert } from '../../lib/api';

interface StatusUpdaterProps {
  currentStatus: SurveillanceAlert['alert_status'];
  currentAssignee?: string;
  onUpdate: (update: {
    alert_status: SurveillanceAlert['alert_status'];
    assigned_to?: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const statusOptions: Array<{
  value: SurveillanceAlert['alert_status'];
  label: string;
  description: string;
}> = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Alert awaiting initial review',
  },
  {
    value: 'investigating',
    label: 'Investigating',
    description: 'Alert is being actively investigated',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    description: 'Alert has been resolved or addressed',
  },
  {
    value: 'dismissed',
    label: 'Dismissed',
    description: 'Alert determined to be false positive or not actionable',
  },
];

const commonAssignees = [
  'Security Team',
  'SIGINT Analyst',
  'Threat Intelligence',
  'SOC Analyst',
  'Investigation Team',
];

export function StatusUpdater({
  currentStatus,
  currentAssignee,
  onUpdate,
  onCancel,
  isLoading,
}: StatusUpdaterProps) {
  const [newStatus, setNewStatus] = useState<SurveillanceAlert['alert_status']>(currentStatus);
  const [assignee, setAssignee] = useState(currentAssignee || '');
  const [customAssignee, setCustomAssignee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssignee = assignee === 'custom' ? customAssignee : assignee;
    onUpdate({
      alert_status: newStatus,
      assigned_to: finalAssignee || undefined,
    });
  };

  const hasChanges =
    newStatus !== currentStatus ||
    (assignee === 'custom' ? customAssignee : assignee) !== currentAssignee;

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <h4 className='text-lg font-semibold text-white mb-4'>Update Alert Status</h4>

      {/* Status Selection */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>New Status</label>
        <div className='space-y-2'>
          {statusOptions.map(option => (
            <label key={option.value} className='flex items-start space-x-3 cursor-pointer'>
              <input
                type='radio'
                name='status'
                value={option.value}
                checked={newStatus === option.value}
                onChange={e => setNewStatus(e.target.value as SurveillanceAlert['alert_status'])}
                className='mt-1 text-blue-600 focus:ring-blue-500 focus:ring-2'
                disabled={isLoading}
              />
              <div>
                <div className='text-white font-medium'>{option.label}</div>
                <div className='text-gray-400 text-sm'>{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Assignment */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>Assign To</label>
        <select
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          className='w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          disabled={isLoading}
        >
          <option value=''>Unassigned</option>
          {commonAssignees.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value='custom'>Custom...</option>
        </select>

        {/* Custom Assignee Input */}
        {assignee === 'custom' && (
          <div className='mt-2'>
            <input
              type='text'
              value={customAssignee}
              onChange={e => setCustomAssignee(e.target.value)}
              placeholder='Enter assignee name...'
              className='w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end space-x-3 pt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={!hasChanges || isLoading}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center space-x-2'
        >
          {isLoading && (
            <svg
              className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
          )}
          <span>{isLoading ? 'Updating...' : 'Update Alert'}</span>
        </button>
      </div>

      {/* Current Values Display */}
      <div className='text-xs text-gray-500 pt-2 border-t border-gray-600'>
        <div>
          Current status: <span className='text-gray-400'>{currentStatus}</span>
        </div>
        <div>
          Current assignee: <span className='text-gray-400'>{currentAssignee || 'Unassigned'}</span>
        </div>
      </div>
    </form>
  );
}
