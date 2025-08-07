import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Crown, ArrowRight } from 'lucide-react';
import { subscriptionService } from '../services/subscription';
import { useAuth } from '../contexts/AuthContext';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan') as 'premium' | 'enterprise';

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId || !planId) {
        setStatus('error');
        setError('Missing payment session information');
        return;
      }

      try {
        await subscriptionService.handlePaymentSuccess(sessionId, planId);
        setStatus('success');
        
        // Refresh the page after a short delay to update user state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Payment processing failed');
      }
    };

    handlePaymentSuccess();
  }, [sessionId, planId]);

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Unknown';
    }
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const goToSubscription = () => {
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Processing Your Payment
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we confirm your subscription...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    Welcome to {getPlanDisplayName(planId)}!
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  Your subscription has been activated and you now have access to all premium features.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={goToProfile}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                >
                  View My Profile
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                
                <button
                  onClick={goToSubscription}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Manage Subscription
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Error
              </h1>
              <p className="text-red-600 mb-6">
                {error}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={goToSubscription}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Go Home
                </button>
              </div>
            </>
          )}

          {/* Subscription Benefits Reminder */}
          {status === 'success' && planId && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Your {getPlanDisplayName(planId)} Benefits:
              </h3>
              <div className="text-left space-y-2">
                {planId === 'premium' && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited listings
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Enhanced search visibility
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Advanced analytics dashboard
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Priority messaging
                    </div>
                  </>
                )}
                {planId === 'enterprise' && (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Everything in Premium
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      API access & integrations
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Dedicated account manager
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      White label solutions
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
