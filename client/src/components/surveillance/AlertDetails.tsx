import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { SurveillanceAlert, api } from '../../lib/api';
import { StatusUpdater } from './StatusUpdater';
import { format } from 'date-fns';

interface AlertDetailsProps {
  alert: SurveillanceAlert;
  onClose: () => void;
  onUpdate: () => void;
}

export function AlertDetails({ alert, onClose, onUpdate }: AlertDetailsProps) {
  const [showStatusUpdater, setShowStatusUpdater] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ alertId, update }: { alertId: number; update: any }) =>
      api.updateSurveillanceAlert(alertId, update),
    onSuccess: () => {
      onUpdate();
      setShowStatusUpdater(false);
    },
  });

  const handleStatusUpdate = (update: { alert_status: string; assigned_to?: string }) => {
    updateMutation.mutate({ alertId: alert.alert_id, update });
  };

  const alertLevelColors = {
    emergency: 'text-red-400 bg-red-900/20',
    critical: 'text-red-400 bg-red-900/20',
    warning: 'text-yellow-400 bg-yellow-900/20',
    info: 'text-blue-400 bg-blue-900/20',
  };

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-900/20',
    investigating: 'text-blue-400 bg-blue-900/20',
    resolved: 'text-green-400 bg-green-900/20',
    dismissed: 'text-gray-400 bg-gray-800',
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-gray-800 border-b border-gray-700 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-white'>Alert Details</h2>
            <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className='flex items-center space-x-4 flex-wrap'>
            <span
              className={`px-3 py-1 rounded font-semibold ${alertLevelColors[alert.alert_level]}`}
            >
              {alert.alert_level.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded ${statusColors[alert.alert_status]}`}>
              {alert.alert_status}
            </span>
            {alert.requires_immediate_attention && (
              <span className='px-3 py-1 rounded bg-red-700 text-red-100 font-medium animate-pulse'>
                URGENT
              </span>
            )}
            <span className='text-gray-300'>
              Confidence: {Math.round(alert.confidence_score * 100)}%
            </span>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Title and Description */}
          <div>
            <h3 className='text-xl font-semibold text-white mb-2'>{alert.alert_title}</h3>
            {alert.description && (
              <p className='text-gray-300 leading-relaxed'>{alert.description}</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-gray-700/50 rounded-lg p-4'>
              <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                Alert Information
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Alert ID:</span>
                  <span className='text-white'>#{alert.alert_id}</span>
                </div>
                {alert.anomaly_id && (
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Anomaly ID:</span>
                    <span className='text-white'>#{alert.anomaly_id}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Type:</span>
                  <span className='text-white'>{alert.alert_type}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Created:</span>
                  <span className='text-white'>
                    {format(new Date(alert.record_created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                {alert.updated_at && (
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Updated:</span>
                    <span className='text-white'>
                      {format(new Date(alert.updated_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className='bg-gray-700/50 rounded-lg p-4'>
              <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2'>
                Assignment & Status
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[alert.alert_status]}`}>
                    {alert.alert_status}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Assigned to:</span>
                  <span className='text-white'>{alert.assigned_to || 'Unassigned'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Confidence:</span>
                  <div className='flex items-center space-x-2'>
                    <div className='w-16 h-2 bg-gray-600 rounded-full'>
                      <div
                        className='h-2 bg-blue-500 rounded-full transition-all duration-300'
                        style={{ width: `${alert.confidence_score * 100}%` }}
                      />
                    </div>
                    <span className='text-white text-xs'>
                      {Math.round(alert.confidence_score * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Summary */}
          {alert.evidence_summary && (
            <div className='bg-gray-700/50 rounded-lg p-4'>
              <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3'>
                Evidence Summary
              </h4>
              <div className='bg-gray-800 rounded p-3'>
                <pre className='text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto'>
                  {JSON.stringify(alert.evidence_summary, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='flex items-center justify-between pt-4 border-t border-gray-700'>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowStatusUpdater(!showStatusUpdater)}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
              >
                Update Status
              </button>

              {alert.evidence_summary?.location && (
                <button className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'>
                  View on Map
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'
            >
              Close
            </button>
          </div>

          {/* Status Updater */}
          {showStatusUpdater && (
            <div className='bg-gray-700/50 rounded-lg p-4'>
              <StatusUpdater
                currentStatus={alert.alert_status}
                currentAssignee={alert.assigned_to}
                onUpdate={handleStatusUpdate}
                isLoading={updateMutation.isPending}
                onCancel={() => setShowStatusUpdater(false)}
              />
            </div>
          )}

          {/* Update Error */}
          {updateMutation.error && (
            <div className='bg-red-900/20 border border-red-500 rounded-lg p-3'>
              <p className='text-red-300 text-sm'>
                Failed to update alert: {updateMutation.error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
