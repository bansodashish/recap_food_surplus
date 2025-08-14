import React, { useState } from 'react';
import { signIn, signUp, getCurrentUser } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';

interface AuthDebugResult {
  step: string;
  success: boolean;
  error?: string;
  details?: any;
}

interface AuthDebugProps {
  onClose?: () => void;
}

const AuthDebugComponent: React.FC<AuthDebugProps> = ({ onClose }) => {
  const [results, setResults] = useState<AuthDebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [credentials, setCredentials] = useState({
    email: 'bansod.ashish@gmail.com',
    password: 'anty12345'
  });

  const addResult = (step: string, success: boolean, error?: string, details?: any) => {
    setResults(prev => [...prev, { step, success, error, details }]);
  };

  const runComprehensiveTest = async () => {
    setResults([]);
    setIsRunning(true);

    try {
      // Step 1: Check Amplify configuration
      addResult('Checking Amplify Configuration', true, undefined, {
        configured: !!Amplify.getConfig(),
        config: Amplify.getConfig()
      });

      // Step 2: Test direct sign-in
      try {
        console.log('Attempting sign-in with:', { username: credentials.email });
        const signInResult = await signIn({
          username: credentials.email,
          password: credentials.password
        });
        addResult('Direct Sign-In Test', true, undefined, signInResult);

        // If sign-in successful, try to get current user
        try {
          const currentUser = await getCurrentUser();
          addResult('Get Current User', true, undefined, currentUser);
        } catch (userError: any) {
          addResult('Get Current User', false, userError.message, userError);
        }

      } catch (signInError: any) {
        addResult('Direct Sign-In Test', false, signInError.message, {
          name: signInError.name,
          code: signInError.code,
          fullError: signInError
        });

        // If user doesn't exist, suggest creating account
        if (signInError.name === 'UserNotFoundException') {
          addResult('Analysis', true, undefined, {
            recommendation: 'User does not exist in this User Pool. You may need to create an account first.'
          });
        } else if (signInError.name === 'NotAuthorizedException') {
          addResult('Analysis', true, undefined, {
            recommendation: 'Invalid credentials or user pool configuration issue.'
          });
        }
      }

    } catch (error: any) {
      addResult('Configuration Error', false, error.message, error);
    } finally {
      setIsRunning(false);
    }
  };

  const tryCreateAccount = async () => {
    try {
      addResult('Creating Test Account', true, 'Starting...');
      const result = await signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
            name: 'Test User'
          }
        }
      });
      addResult('Account Creation', true, undefined, result);
    } catch (error: any) {
      addResult('Account Creation', false, error.message, {
        name: error.name,
        code: error.code,
        details: error
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🔍 Authentication Debug Tool</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="debug-email" className="block text-sm font-medium mb-1">Email:</label>
          <input
            id="debug-email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="debug-password" className="block text-sm font-medium mb-1">Password:</label>
          <input
            id="debug-password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={runComprehensiveTest}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isRunning ? '🔄 Testing...' : '🔍 Run Diagnosis'}
          </button>
          
          <button
            onClick={tryCreateAccount}
            disabled={isRunning}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            📝 Try Create Account
          </button>
        </div>

        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={`${result.step}-${index}`}
              className={`p-3 rounded border-l-4 ${
                result.success 
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              <div className="font-medium">
                {result.success ? '✅' : '❌'} {result.step}
              </div>
              {result.error && (
                <div className="text-sm mt-1 opacity-90">
                  Error: {result.error}
                </div>
              )}
              {result.details && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer opacity-75">Show Details</summary>
                  <pre className="text-xs mt-1 bg-black bg-opacity-10 p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>This tool helps diagnose authentication issues. Check the console for additional logs.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugComponent;
