import React from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';

interface AuthErrorHelperProps {
  error: string;
  onClearSession?: () => Promise<void>;
  onRetry?: () => void;
}

/**
 * Helper component for authentication errors with user-friendly actions
 */
export function AuthErrorHelper({ error, onClearSession, onRetry }: AuthErrorHelperProps) {
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClearSession = async () => {
    if (!onClearSession) return;
    
    setIsClearing(true);
    try {
      await onClearSession();
    } catch (err) {
      console.error('Error clearing session:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const isSessionError = error.includes('already signed in') || 
                        error.includes('signed in user') ||
                        error.includes('refresh the page');

  const isConfirmationError = error.includes('confirm') || 
                             error.includes('verification');

  const getErrorType = () => {
    if (isSessionError) return 'session';
    if (isConfirmationError) return 'confirmation';
    return 'generic';
  };

  const getHelpText = () => {
    switch (getErrorType()) {
      case 'session':
        return 'This usually happens when there\'s a cached login session. Try clearing the session or refreshing the page.';
      case 'confirmation':
        return 'Your account needs to be verified. Check your email for a confirmation link.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">{error}</p>
            <p className="text-xs text-red-600">{getHelpText()}</p>
          </div>

          {(isSessionError && onClearSession) && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleClearSession}
                disabled={isClearing}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear Session
                  </>
                )}
              </button>
              
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Page
              </button>
            </div>
          )}

          {isConfirmationError && (
            <div className="mt-4">
              <a
                href="/confirm-signup"
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Email Confirmation
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
