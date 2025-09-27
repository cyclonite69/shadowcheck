import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, type SurveillanceAlert } from '../../lib/api';
import { AlertCard } from './AlertCard';
import { AlertFilters } from './AlertFilters';
import { AlertDetails } from './AlertDetails';

interface AlertFiltersState {
  alert_level?: SurveillanceAlert['alert_level'];
  alert_status?: SurveillanceAlert['alert_status'];
  requires_immediate_attention?: boolean;
}

export function AlertDashboard() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AlertFiltersState>({});
  const [selectedAlert, setSelectedAlert] = useState<SurveillanceAlert | null>(null);

  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['surveillance-alerts', page, filters],
    queryFn: () => api.getSurveillanceAlerts(page, 20, filters),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const handleFilterChange = (newFilters: AlertFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleAlertClick = (alert: SurveillanceAlert) => {
    setSelectedAlert(alert);
  };

  const handleAlertUpdate = () => {
    refetch();
    setSelectedAlert(null);
  };

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='premium-card cyber-border p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='icon-container'>
                <svg
                  className='w-8 h-8 text-red-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='hero-gradient-text text-xl font-bold'>Error Loading Alerts</h3>
                <p className='text-slate-400 cyber-text'>
                  Failed to load surveillance alerts. Please check your connection.
                </p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 cyber-glow'
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Background Elements */}
      <div
        className='absolute inset-0 opacity-5'
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className='absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl' />

      <div className='relative max-w-7xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-6 cyber-glow cyber-scan-line'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
            <span className='text-sm text-slate-300 cyber-text'>
              Real-time surveillance monitoring active
            </span>
          </div>
          <h1 className='text-4xl lg:text-5xl font-bold mb-4'>
            <span className='hero-gradient-text block mb-2'>Alert Management</span>
            <span className='feature-gradient-text block'>Intelligence Dashboard</span>
          </h1>
          <p className='text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed'>
            Monitor and triage surveillance alerts from advanced SIGINT analysis and threat
            detection systems
          </p>
        </div>

        {/* Filters */}
        <div className='mb-6'>
          <AlertFilters onFiltersChange={handleFilterChange} />
        </div>

        {/* Stats Bar */}
        {alertsData && (
          <div className='mb-12 responsive-grid'>
            <div className='premium-card text-center p-8 hover:scale-105 cyber-border data-stream'>
              <div className='icon-container mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-blue-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <div className='metric-value text-3xl mb-2'>{alertsData.total}</div>
              <div className='text-slate-300 silver-accent px-4 py-2 rounded-full inline-block'>
                <span className='text-xs font-semibold text-slate-700 cyber-text'>
                  Total Alerts
                </span>
              </div>
            </div>
            <div className='premium-card text-center p-8 hover:scale-105 cyber-border data-stream'>
              <div className='icon-container mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-red-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div className='metric-value text-3xl mb-2 text-red-300'>
                {alertsData.data.filter(a => a.requires_immediate_attention).length}
              </div>
              <div className='text-slate-300 bg-gradient-to-r from-red-500/20 to-red-400/20 border border-red-500/30 px-4 py-2 rounded-full inline-block'>
                <span className='text-xs font-semibold text-red-300 cyber-text'>
                  Immediate Attention
                </span>
              </div>
            </div>
            <div className='premium-card text-center p-8 hover:scale-105 cyber-border data-stream'>
              <div className='icon-container mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-yellow-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='metric-value text-3xl mb-2 text-yellow-300'>
                {alertsData.data.filter(a => a.alert_status === 'pending').length}
              </div>
              <div className='text-slate-300 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border border-yellow-500/30 px-4 py-2 rounded-full inline-block'>
                <span className='text-xs font-semibold text-yellow-300 cyber-text'>
                  Pending Review
                </span>
              </div>
            </div>
            <div className='premium-card text-center p-8 hover:scale-105 cyber-border data-stream'>
              <div className='icon-container mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='metric-value text-3xl mb-2 text-green-300'>
                {alertsData.data.filter(a => a.alert_status === 'resolved').length}
              </div>
              <div className='text-slate-300 gold-accent px-4 py-2 rounded-full inline-block'>
                <span className='text-xs font-semibold text-slate-800 cyber-text'>Resolved</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='space-y-6'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='premium-card p-6 loading-shimmer'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='icon-container w-12 h-12'>
                    <div className='w-6 h-6 bg-slate-600 rounded'></div>
                  </div>
                  <div className='flex-1'>
                    <div className='h-6 bg-slate-600 rounded-lg w-3/4 mb-2'></div>
                    <div className='h-4 bg-slate-700 rounded w-1/2'></div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='h-3 bg-slate-700 rounded w-2/3'></div>
                  <div className='h-3 bg-slate-700 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts List */}
        {alertsData && !isLoading && (
          <div className='space-y-6'>
            {alertsData.data.length === 0 ? (
              <div className='premium-card p-16 text-center cyber-border'>
                <div className='icon-container mx-auto mb-6'>
                  <svg
                    className='w-10 h-10 text-slate-400'
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
                </div>
                <h3 className='hero-gradient-text text-xl font-bold mb-4'>
                  No alerts match your filters
                </h3>
                <p className='text-slate-400 mb-6'>
                  Adjust your filtering criteria or clear all filters to see available alerts
                </p>
                <button
                  onClick={() => setFilters({})}
                  className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 cyber-glow'
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              alertsData.data.map(alert => (
                <AlertCard
                  key={alert.alert_id}
                  alert={alert}
                  onClick={() => handleAlertClick(alert)}
                />
              ))
            )}

            {/* Pagination */}
            {alertsData.totalPages > 1 && (
              <div className='flex justify-center items-center space-x-4 mt-12'>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className='px-6 py-3 premium-card hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cyber-glow'
                >
                  <svg
                    className='w-4 h-4 mr-2 inline'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                  Previous
                </button>

                <div className='premium-card px-6 py-3 cyber-border'>
                  <span className='text-slate-300 cyber-text'>
                    Page <span className='feature-gradient-text font-bold'>{page}</span> of{' '}
                    <span className='feature-gradient-text font-bold'>{alertsData.totalPages}</span>
                  </span>
                </div>

                <button
                  onClick={() => setPage(p => Math.min(alertsData.totalPages, p + 1))}
                  disabled={page >= alertsData.totalPages}
                  className='px-6 py-3 premium-card hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cyber-glow'
                >
                  Next
                  <svg
                    className='w-4 h-4 ml-2 inline'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Alert Details Modal */}
        {selectedAlert && (
          <AlertDetails
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onUpdate={handleAlertUpdate}
          />
        )}
      </div>
    </div>
  );
}
