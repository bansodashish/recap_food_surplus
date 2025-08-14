import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Leaf } from 'lucide-react';
import { bulletproofAuth } from '../services/bulletproofAuth';

interface FormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  confirmationCode: string;
}

type AuthState = 'signin' | 'confirm' | 'processing';

export function BulletproofLoginPage() {
  const [authState, setAuthState] = useState<AuthState>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '', 
    password: '', 
    name: '',
    confirmPassword: '',
    confirmationCode: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Debug logging to confirm which login page is loading
  useEffect(() => {
    console.log('🛡️ BulletproofLoginPage loaded successfully');
    console.log('Current auth state:', authState);
    console.log('Form has sign-up capability:', true);
  }, [authState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (type: 'error' | 'success' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-800 border border-red-200';
      case 'success':
        return 'bg-green-50 text-green-800 border border-green-200';
      default:
        return 'bg-blue-50 text-blue-800 border border-blue-200';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />;
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await bulletproofAuth.bulletproofSignIn(formData.email, formData.password);
      
      if (result.success && result.isSignedIn) {
        showMessage('success', 'Successfully signed in!');
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        showMessage('info', 'Please confirm your account. Check your email for confirmation code.');
        setAuthState('confirm');
      } else {
        // Check if it's a session-related error that user can resolve
        if (result.error?.includes('refresh the page') || 
            result.error?.includes('already signed in') ||
            result.strategy === 'cache_clear_retry_failed') {
          setMessage({ 
            type: 'error', 
            text: `${result.error || 'Sign in failed'} - Try clearing your session manually.`
          });
        } else {
          showMessage('error', result.error || 'Sign in failed');
        }
      }
    } catch (error: any) {
      // Handle any unexpected errors
      const errorMessage = error.message || 'Sign in failed';
      if (errorMessage.includes('already signed in') || errorMessage.includes('refresh')) {
        setMessage({ 
          type: 'error', 
          text: `${errorMessage} - Try clearing your session manually.`
        });
      } else {
        showMessage('error', `Sign in failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    setIsLoading(true);
    try {
      // Clear all authentication cache
      await bulletproofAuth.bulletproofSignOut();
      
      // Clear browser storage
      localStorage.removeItem('amplify-auth-session');
      localStorage.removeItem('amplify-last-auth-user');
      localStorage.removeItem('amplify-cognito-identity-id');
      sessionStorage.removeItem('amplify-auth-session');
      sessionStorage.removeItem('amplify-last-auth-user');
      
      showMessage('success', 'Session cleared successfully! Please try signing in again.');
      setMessage(null);
      
      // Small delay then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error clearing session:', error);
      showMessage('info', 'Session cleared. Please refresh the page and try again.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await bulletproofAuth.bulletproofConfirmSignUp(formData.email, formData.confirmationCode);
      
      if (result.success) {
        showMessage('success', 'Account confirmed successfully!');
        setAuthState('signin');
      } else {
        showMessage('error', result.error || 'Confirmation failed');
      }
    } catch (error: any) {
      showMessage('error', `Confirmation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await bulletproofAuth.bulletproofResendConfirmation(formData.email);
      
      if (result.success) {
        showMessage('success', 'Confirmation code resent to your email!');
      } else {
        showMessage('error', result.error || 'Failed to resend code');
      }
    } catch (error: any) {
      showMessage('error', `Failed to resend code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runDiagnostic = async () => {
    setIsLoading(true);
    showMessage('info', 'Running comprehensive diagnostic...');

    try {
      const result = await bulletproofAuth.runComprehensiveDiagnostic();
      
      const diagnosticMessage = `
Diagnostic Results:
✅ Configuration Valid: ${result.configurationValid}
✅ User Pool Reachable: ${result.userPoolReachable}
${result.issues.length > 0 ? '❌ Issues: ' + result.issues.join(', ') : ''}
${result.recommendations.length > 0 ? '💡 Recommendations: ' + result.recommendations.join(', ') : ''}
      `.trim();

      showMessage(result.issues.length === 0 ? 'success' : 'error', diagnosticMessage);
      console.log('🔍 Full Diagnostic Results:', result);
    } catch (error: any) {
      showMessage('error', `Diagnostic failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (authState) {
      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Confirm Your Account</h3>
            <p className="text-sm text-gray-600">
              Please enter the confirmation code sent to {formData.email}
            </p>
            
            <div>
              <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
                Confirmation Code
              </label>
              <input
                id="confirmationCode"
                name="confirmationCode"
                type="text"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter 6-digit code"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmSignUp}
                disabled={isLoading}
                className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {isLoading ? '⏳ Confirming...' : 'Confirm Account'}
              </button>
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>

            <button
              onClick={() => setAuthState('signin')}
              className="w-full text-teal-600 hover:text-teal-700 text-sm"
            >
              ← Back to Sign In
            </button>
          </div>
        );

      default: // signin
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Welcome Back</h3>
            <p className="text-sm text-gray-600">
              Sign in to your account to continue reducing food waste
            </p>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                <Lock className="inline w-4 h-4 mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? '⏳ Signing In...' : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="w-full mt-4 bg-gray-50 text-teal-600 py-3 px-4 rounded-md border border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-colors font-medium flex items-center justify-center"
            >
              <User className="mr-2 h-4 w-4" />
              Don't have an account? Sign up here
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
            <Leaf className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            FoodSurplus
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Reduce food waste • Connect communities
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          
          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-md ${getMessageStyles(message.type)}`}>
              <div className="flex items-start">
                {getMessageIcon(message.type)}
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-line">{message.text}</div>
                  
                  {/* Show clear session button for session-related errors */}
                  {message.type === 'error' && 
                   message.text.includes('session') && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={handleClearSession}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {isLoading ? 'Clearing...' : 'Clear Session & Retry'}
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Refresh Page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {renderForm()}

          {/* Debug Section */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <button
                  onClick={runDiagnostic}
                  disabled={isLoading}
                  className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                >
                  🔍 Run Comprehensive Diagnostic
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default BulletproofLoginPage;
