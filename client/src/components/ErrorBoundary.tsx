import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('AlertDashboard Error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        <div className='bg-red-900/20 border border-red-500 rounded-lg p-6'>
          <div className='flex items-center space-x-3 mb-4'>
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
            <h3 className='text-xl font-semibold text-red-300'>Something went wrong</h3>
          </div>

          <p className='text-red-200 mb-4'>
            The alert dashboard encountered an unexpected error. This might be due to a network
            issue or a problem with the application.
          </p>

          {error && (
            <details className='mb-4'>
              <summary className='text-red-300 cursor-pointer hover:text-red-200 transition-colors'>
                Technical Details
              </summary>
              <div className='mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-auto'>
                <div className='font-mono'>{error.message}</div>
                {error.stack && <pre className='mt-2 whitespace-pre-wrap'>{error.stack}</pre>}
              </div>
            </details>
          )}

          <div className='flex space-x-3'>
            <button
              onClick={retry}
              className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors'
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
