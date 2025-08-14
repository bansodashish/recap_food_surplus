import React, { useState } from 'react';
import { cognitoTestService } from '../services/cognitoTestService';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

const CognitoTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSignupForm, setTestSignupForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  const runDiagnostics = async () => {
    setIsRunningTests(true);
    setResults([]);
    
    try {
      console.log('🩺 Starting Cognito diagnostics...');
      const diagnosticResults = await cognitoTestService.runFullDiagnostics();
      setResults(diagnosticResults);
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      setResults([{
        success: false,
        message: 'Failed to run diagnostics',
        error: error.message
      }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testSignUp = async () => {
    if (!testSignupForm.email || !testSignupForm.password || !testSignupForm.name) {
      alert('Please fill in all fields');
      return;
    }

    setIsRunningTests(true);
    
    try {
      const result = await cognitoTestService.testSignUp(
        testSignupForm.email,
        testSignupForm.password,
        testSignupForm.name
      );
      
      setResults(prev => [...prev, result]);
    } catch (error: any) {
      setResults(prev => [...prev, {
        success: false,
        message: 'Test signup failed',
        error: error.message
      }]);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Cognito Diagnostics
          </h1>
          
          <div className="space-y-6">
            {/* Configuration Test */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                1. Run Basic Diagnostics
              </h2>
              <button
                onClick={runDiagnostics}
                disabled={isRunningTests}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isRunningTests ? 'Running Tests...' : 'Test Configuration & Connection'}
              </button>
            </div>

            {/* SignUp Test */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                2. Test SignUp Process
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="email"
                  placeholder="Test email"
                  value={testSignupForm.email}
                  onChange={(e) => setTestSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Test password (min 8 chars)"
                  value={testSignupForm.password}
                  onChange={(e) => setTestSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Test name"
                  value={testSignupForm.name}
                  onChange={(e) => setTestSignupForm(prev => ({ ...prev, name: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={testSignUp}
                disabled={isRunningTests || !testSignupForm.email || !testSignupForm.password || !testSignupForm.name}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {isRunningTests ? 'Testing SignUp...' : 'Test SignUp'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                ⚠️ This will attempt to create a real account. Use a test email you control.
              </p>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Test Results
                </h2>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={`result-${index}-${result.message.slice(0, 10)}`}
                      className={`border rounded-md p-4 ${
                        result.success 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-xl mr-2">
                          {result.success ? '✅' : '❌'}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            result.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {result.message}
                          </p>
                          
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1 font-mono">
                              Error: {result.error}
                            </p>
                          )}
                          
                          {result.details && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                Show Details
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. First run the basic diagnostics to check configuration</li>
                <li>2. If basic tests pass, try the signup test with a real email</li>
                <li>3. Check the browser console (F12) for detailed error logs</li>
                <li>4. If signup fails, the error details will help identify the issue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitoTestPage;
