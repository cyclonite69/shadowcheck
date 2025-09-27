import React from 'react';
import { SurveillanceAlert } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: SurveillanceAlert;
  onClick: () => void;
}

const alertLevelConfig = {
  emergency: {
    iconColor: 'text-red-400',
    textColor: 'text-red-300',
    badgeColor: 'bg-gradient-to-r from-red-500 to-red-600',
    glowColor: 'cyber-glow',
    pulse: true,
    borderGlow: 'shadow-lg shadow-red-500/20',
  },
  critical: {
    iconColor: 'text-red-400',
    textColor: 'text-red-300',
    badgeColor: 'bg-gradient-to-r from-red-500 to-red-600',
    glowColor: 'cyber-glow',
    pulse: false,
    borderGlow: 'shadow-lg shadow-red-500/20',
  },
  warning: {
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-300',
    badgeColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    glowColor: '',
    pulse: false,
    borderGlow: 'shadow-lg shadow-yellow-500/20',
  },
  info: {
    iconColor: 'text-blue-400',
    textColor: 'text-blue-300',
    badgeColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    glowColor: '',
    pulse: false,
    borderGlow: 'shadow-lg shadow-blue-500/20',
  },
};

const statusConfig = {
  pending: {
    color: 'bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-500/30',
    textColor: 'text-yellow-300',
    text: 'Pending',
  },
  investigating: {
    color: 'bg-gradient-to-r from-blue-500/20 to-blue-400/20 border border-blue-500/30',
    textColor: 'text-blue-300',
    text: 'Investigating',
  },
  resolved: {
    color: 'gold-accent',
    textColor: 'text-slate-800',
    text: 'Resolved',
  },
  dismissed: {
    color: 'silver-accent',
    textColor: 'text-slate-700',
    text: 'Dismissed',
  },
};

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const config = alertLevelConfig[alert.alert_level];
  const statusBadge = statusConfig[alert.alert_status];

  const confidenceColor =
    alert.confidence_score >= 0.8
      ? 'text-green-400'
      : alert.confidence_score >= 0.6
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div
      onClick={onClick}
      className={`
        premium-card p-6 cursor-pointer group
        ${config.glowColor} ${config.borderGlow}
        hover:scale-[1.02] transition-all duration-300
        ${config.pulse ? 'animate-pulse' : ''}
        ${alert.requires_immediate_attention ? 'cyber-border data-stream' : ''}
        relative overflow-hidden
      `}
    >
      {/* Priority indicator */}
      {alert.requires_immediate_attention && (
        <div className='absolute top-4 right-4'>
          <div className='relative'>
            <div className='w-4 h-4 bg-red-500 rounded-full animate-ping absolute'></div>
            <div className='w-4 h-4 bg-red-600 rounded-full relative'></div>
          </div>
        </div>
      )}

      <div className='flex items-start justify-between mb-6'>
        <div className='flex items-center space-x-3 flex-wrap gap-2'>
          {/* Alert Level Badge */}
          <div
            className={`${config.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase cyber-text`}
          >
            {alert.alert_level}
          </div>

          {/* Status Badge */}
          <div
            className={`${statusBadge.color} ${statusBadge.textColor} px-3 py-1 rounded-full text-xs font-medium cyber-text`}
          >
            {statusBadge.text}
          </div>

          {/* Immediate Attention Indicator */}
          {alert.requires_immediate_attention && (
            <div className='bg-gradient-to-r from-red-600 to-red-700 text-red-100 px-3 py-1 rounded-full text-xs font-bold cyber-text animate-pulse'>
              ⚠ URGENT
            </div>
          )}
        </div>

        {/* Confidence Score */}
        <div className={`text-sm font-bold ${confidenceColor} cyber-text`}>
          {Math.round(alert.confidence_score * 100)}%
        </div>
      </div>

      <div className='flex items-start gap-4 mb-4'>
        <div className='icon-container w-12 h-12'>
          <svg
            className={`w-6 h-6 ${config.iconColor}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            {alert.alert_level === 'emergency' || alert.alert_level === 'critical' ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            ) : alert.alert_level === 'warning' ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            )}
          </svg>
        </div>
        <div className='flex-1'>
          <h3
            className={'text-xl font-bold mb-2 hero-gradient-text group-hover:feature-gradient-text transition-all duration-300'}
          >
            {alert.alert_title}
          </h3>
          <div className='flex items-center space-x-4 text-sm text-slate-400 mb-3 cyber-text'>
            <span>
              Type: <span className={config.textColor}>{alert.alert_type}</span>
            </span>
            <span>
              ID: <span className={config.textColor}>#{alert.alert_id}</span>
            </span>
            {alert.anomaly_id && (
              <span>
                Anomaly: <span className={config.textColor}>#{alert.anomaly_id}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {alert.description && (
        <p className='text-slate-300 text-sm mb-4 leading-relaxed line-clamp-2'>
          {alert.description}
        </p>
      )}

      {/* Footer Info */}
      <div className='flex items-center justify-between pt-4 border-t border-slate-700/50'>
        <div className='flex items-center space-x-4 text-xs text-slate-400 cyber-text'>
          <div className='flex items-center space-x-1'>
            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>
              {formatDistanceToNow(new Date(alert.record_created_at), { addSuffix: true })}
            </span>
          </div>
          {alert.assigned_to && (
            <div className='flex items-center space-x-1'>
              <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              <span>{alert.assigned_to}</span>
            </div>
          )}
        </div>

        {/* Evidence indicator */}
        {alert.evidence_summary && (
          <div className='flex items-center space-x-1 silver-accent px-2 py-1 rounded-full'>
            <svg
              className='w-3 h-3 text-slate-700'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <span className='text-xs font-semibold text-slate-700 cyber-text'>Evidence</span>
          </div>
        )}
      </div>
    </div>
  );
}
