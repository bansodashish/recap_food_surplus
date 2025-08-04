import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Crown } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
  requiredFeature?: string;
}

export function ProtectedRoute({ 
  children, 
  requiresAuth = true, 
  requiresSubscription = false,
  requiredFeature 
}: ProtectedRouteProps) {
  const { user, canListItems, canAccessFeature } = useAuth();
  const location = useLocation();

  // Redirect to login if authentication is required but user is not logged in
  if (requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check subscription requirements
  if (requiresSubscription && user && !canListItems()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need a premium subscription to access this feature. Upgrade your plan to start listing items.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/subscription'}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific feature access
  if (requiredFeature && user && !canAccessFeature(requiredFeature)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Premium Feature
          </h2>
          <p className="text-gray-600 mb-6">
            This feature requires a premium or enterprise subscription. Upgrade your plan to unlock advanced capabilities.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/subscription'}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>View Plans</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
