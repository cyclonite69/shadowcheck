import React from 'react';
import { AlertDashboard } from '../components/surveillance/AlertDashboard';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AlertsPage() {
  return (
    <ErrorBoundary>
      <div className='flex-1 overflow-hidden'>
        <AlertDashboard />
      </div>
    </ErrorBoundary>
  );
}
