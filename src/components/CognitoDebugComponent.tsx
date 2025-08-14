import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { signUp, getCurrentUser } from 'aws-amplify/auth';
import awsExports from '../aws-exports';

// Ensure Amplify is configured
Amplify.configure(awsExports);

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const CognitoDebugComponent: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('TestPass123!');
  const [testName, setTestName] = useState('Test User');

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Configuration Check
    try {
      addResult({
        test: 'Configuration Check',
        status: 'pass',
        message: 'AWS configuration loaded successfully',
        details: {
          userPoolId: awsExports.aws_user_pools_id,
          clientId: awsExports.aws_user_pools_web_client_id,
          region: awsExports.aws_project_region
        }
      });
    } catch (error: any) {
      addResult({
        test: 'Configuration Check',
        status: 'fail',
        message: `Configuration error: ${error.message}`
      });
    }

    // Test 2: Network Connectivity
    try {
      console.log('Testing Cognito connectivity...');
      await getCurrentUser();
      addResult({
        test: 'Network Connectivity',
        status: 'pass',
        message: 'Already authenticated - Cognito connection working'
      });
    } catch (error: any) {
      if (error.name === 'UserUnAuthenticatedException' || error.message?.includes('not authenticated')) {
        addResult({
          test: 'Network Connectivity',
          status: 'pass',
          message: 'Cognito connection working (not authenticated, as expected)'
        });
      } else {
        addResult({
          test: 'Network Connectivity',
          status: 'fail',
          message: `Connection failed: ${error.message}`,
          details: error
        });
      }
    }

    // Test 3: Password Policy Validation
    const passwordTests = [
      { password: 'abc', expected: 'fail', reason: 'Too short' },
      { password: 'abcdefgh', expected: 'fail', reason: 'No uppercase/numbers' },
      { password: 'Abcdefgh', expected: 'fail', reason: 'No numbers' },
      { password: 'Abcdefg1', expected: 'pass', reason: 'Meets all requirements' },
      { password: 'TestPass123!', expected: 'pass', reason: 'Meets all requirements with special chars' }
    ];

    passwordTests.forEach(test => {
      const hasMinLength = test.password.length >= 8;
      const hasUppercase = /[A-Z]/.test(test.password);
      const hasLowercase = /[a-z]/.test(test.password);
      const hasNumbers = /\d/.test(test.password);
      
      const meetsPolicy = hasMinLength && hasUppercase && hasLowercase && hasNumbers;
      
      addResult({
        test: `Password Policy: "${test.password}"`,
        status: meetsPolicy === (test.expected === 'pass') ? 'pass' : 'warning',
        message: `${test.reason} - ${meetsPolicy ? 'Valid' : 'Invalid'}`,
        details: { hasMinLength, hasUppercase, hasLowercase, hasNumbers }
      });
    });

    setIsRunning(false);
  };

  const testActualSignup = async () => {
    if (!testEmail || !testPassword || !testName) {
      addResult({
        test: 'Actual Signup Test',
        status: 'fail',
        message: 'Please fill in all test fields'
      });
      return;
    }

    setIsRunning(true);
    
    try {
      console.log('🔄 Testing actual signup...');
      console.log('Email:', testEmail);
      console.log('Password length:', testPassword.length);
      console.log('Name:', testName);

      const result = await signUp({
        username: testEmail,
        password: testPassword,
        options: {
          userAttributes: {
            email: testEmail,
            name: testName,
          },
        },
      });

      addResult({
        test: 'Actual Signup Test',
        status: 'pass',
        message: `Signup successful! User ID: ${result.userId}`,
        details: {
          userId: result.userId,
          nextStep: result.nextStep,
          fullResult: result
        }
      });

    } catch (error: any) {
      console.error('Signup error details:', error);
      
      addResult({
        test: 'Actual Signup Test',
        status: 'fail',
        message: `Signup failed: ${error.name} - ${error.message}`,
        details: {
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.code,
          statusCode: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId,
          fullError: error
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const generateTestEmail = () => {
    const timestamp = Date.now();
    setTestEmail(`test-${timestamp}@example.com`);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-2xl max-h-96 overflow-y-auto z-50">
      <h3 className="text-lg font-bold mb-4 text-gray-900">🔍 Cognito Debug Panel</h3>
      
      {/* Test Controls */}
      <div className="mb-4 space-y-3">
        <button
          onClick={runComprehensiveDiagnostic}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? '⏳ Running...' : '🩺 Run Diagnostics'}
        </button>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test email"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={generateTestEmail}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Generate
            </button>
          </div>
          
          <input
            type="text"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Test password"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Test name"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>

        <button
          onClick={testActualSignup}
          disabled={isRunning}
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {isRunning ? '⏳ Testing...' : '🧪 Test Real Signup'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded text-sm ${
              result.status === 'pass' ? 'bg-green-50 border border-green-200' :
              result.status === 'fail' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start">
              <span className="mr-2">
                {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'}
              </span>
              <div className="flex-1">
                <div className="font-medium">
                  {result.test}
                </div>
                <div className={`${
                  result.status === 'pass' ? 'text-green-700' :
                  result.status === 'fail' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {result.message}
                </div>
                {result.details && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs text-gray-600">Details</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-gray-500 text-sm">
          Click "Run Diagnostics" to check your Cognito setup, or "Test Real Signup" to test actual account creation.
        </div>
      )}
    </div>
  );
};

export default CognitoDebugComponent;
