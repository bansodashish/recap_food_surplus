import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, RotateCcw } from 'lucide-react';
import { authService } from '../services/auth';

export function ConfirmSignUpPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!code.trim()) {
      setError('Please enter the confirmation code');
      setIsLoading(false);
      return;
    }

    try {
      await authService.confirmSignUp({ username: email, code: code.trim() });
      setSuccess('Account confirmed successfully! You can now sign in.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Confirmation error:', err);
      
      // Handle specific error types
      if (err.name === 'CodeMismatchException') {
        setError('Invalid confirmation code. Please check and try again.');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Confirmation code has expired. Please request a new one.');
      } else if (err.name === 'UserNotFoundException') {
        setError('User not found. Please check your email and try again.');
      } else {
        setError('Failed to confirm account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);

    try {
      await authService.resendSignUp(email);
      setSuccess('New confirmation code sent to your email!');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Failed to resend confirmation code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access</h2>
            <p className="text-gray-600 mb-6">
              This page requires an email parameter. Please sign up first.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Email</h2>
            <p className="text-gray-600">
              We've sent a 6-digit confirmation code to
            </p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Confirmation Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  'Confirming...'
                ) : (
                  <>
                    Confirm Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Resend Code */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-3">Didn't receive the code?</p>
              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Sign In
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Having trouble?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The code expires in 10 minutes</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
