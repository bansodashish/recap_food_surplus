import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: any;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const InfrastructureDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveDiagnostics = async () => {
    setResults([]);
    setIsRunning(true);

    try {
      // 1. Check Amplify Configuration
      addResult({
        category: 'Configuration',
        test: 'Amplify Config Load',
        status: 'info',
        message: 'Checking current Amplify configuration...',
        details: Amplify.getConfig(),
        severity: 'high'
      });

      const config = Amplify.getConfig();
      
      // 2. User Pool ID Check
      const expectedUserPoolId = 'eu-west-1_Y2tRumZ22';
      const actualUserPoolId = config.Auth?.Cognito?.userPoolId;
      
      addResult({
        category: 'AWS Cognito',
        test: 'User Pool ID',
        status: actualUserPoolId === expectedUserPoolId ? 'pass' : 'fail',
        message: actualUserPoolId === expectedUserPoolId 
          ? `User Pool ID matches: ${actualUserPoolId}`
          : `User Pool ID MISMATCH! Expected: ${expectedUserPoolId}, Got: ${actualUserPoolId}`,
        details: { expected: expectedUserPoolId, actual: actualUserPoolId },
        severity: 'critical'
      });

      // 3. User Pool Client ID Check
      const expectedClientId = '1sh3gt6g7eupf69i8c1ht8ang0';
      const actualClientId = config.Auth?.Cognito?.userPoolClientId;
      
      addResult({
        category: 'AWS Cognito',
        test: 'User Pool Client ID',
        status: actualClientId === expectedClientId ? 'pass' : 'fail',
        message: actualClientId === expectedClientId 
          ? `Client ID matches: ${actualClientId}`
          : `Client ID MISMATCH! Expected: ${expectedClientId}, Got: ${actualClientId}`,
        details: { expected: expectedClientId, actual: actualClientId },
        severity: 'critical'
      });

      // 4. Region Check
      const expectedRegion = 'eu-west-1';
      const actualRegion = config.Auth?.Cognito?.region;
      
      addResult({
        category: 'AWS Region',
        test: 'Region Configuration',
        status: actualRegion === expectedRegion ? 'pass' : 'fail',
        message: actualRegion === expectedRegion 
          ? `Region matches: ${actualRegion}`
          : `Region MISMATCH! Expected: ${expectedRegion}, Got: ${actualRegion}`,
        details: { expected: expectedRegion, actual: actualRegion },
        severity: 'critical'
      });

      // 5. Network Connectivity Test
      try {
        const response = await fetch(`https://cognito-idp.${actualRegion}.amazonaws.com/`, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        
        addResult({
          category: 'Network',
          test: 'AWS Cognito Endpoint Connectivity',
          status: 'pass',
          message: `Successfully reached AWS Cognito endpoint in ${actualRegion}`,
          severity: 'medium'
        });
      } catch (error: any) {
        addResult({
          category: 'Network',
          test: 'AWS Cognito Endpoint Connectivity',
          status: 'fail',
          message: `Failed to reach AWS Cognito endpoint: ${error.message}`,
          details: error,
          severity: 'high'
        });
      }

      // 6. Test Auth Session (if user exists)
      try {
        const session = await fetchAuthSession();
        addResult({
          category: 'Authentication',
          test: 'Current Auth Session',
          status: session.tokens ? 'pass' : 'warning',
          message: session.tokens ? 'Valid auth session found' : 'No active auth session',
          details: {
            hasTokens: !!session.tokens,
            hasAccessToken: !!session.tokens?.accessToken,
            hasIdToken: !!session.tokens?.idToken
          },
          severity: 'medium'
        });
      } catch (error: any) {
        addResult({
          category: 'Authentication',
          test: 'Current Auth Session',
          status: 'warning',
          message: `No auth session: ${error.message}`,
          details: error,
          severity: 'low'
        });
      }

      // 7. Test Current User (if logged in)
      try {
        const user = await getCurrentUser();
        addResult({
          category: 'Authentication',
          test: 'Current User',
          status: 'pass',
          message: `Current user found: ${user.username}`,
          details: user,
          severity: 'low'
        });
      } catch (error: any) {
        addResult({
          category: 'Authentication',
          test: 'Current User',
          status: 'info',
          message: 'No current user (not logged in)',
          severity: 'low'
        });
      }

      // 8. Environment Variables Check
      const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        REACT_APP_AWS_PROJECT_REGION: process.env.REACT_APP_AWS_PROJECT_REGION,
        REACT_APP_AWS_COGNITO_REGION: process.env.REACT_APP_AWS_COGNITO_REGION,
        REACT_APP_AWS_USER_POOLS_ID: process.env.REACT_APP_AWS_USER_POOLS_ID,
        REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID: process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID,
      };

      addResult({
        category: 'Environment',
        test: 'Environment Variables',
        status: 'info',
        message: 'Environment variables status',
        details: envVars,
        severity: 'medium'
      });

      // 9. Configuration Completeness Check
      const requiredFields = [
        'Auth.Cognito.userPoolId',
        'Auth.Cognito.userPoolClientId', 
        'Auth.Cognito.region'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = field.split('.').reduce((obj: any, key) => obj?.[key], config);
        return !value;
      });

      addResult({
        category: 'Configuration',
        test: 'Required Fields',
        status: missingFields.length === 0 ? 'pass' : 'fail',
        message: missingFields.length === 0 
          ? 'All required configuration fields present'
          : `Missing required fields: ${missingFields.join(', ')}`,
        details: { missing: missingFields, required: requiredFields },
        severity: 'critical'
      });

    } catch (error: any) {
      addResult({
        category: 'System',
        test: 'Diagnostic Execution',
        status: 'fail',
        message: `Diagnostic failed: ${error.message}`,
        details: error,
        severity: 'critical'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  useEffect(() => {
    runComprehensiveDiagnostics();
  }, []);

  const criticalFailures = results.filter(r => r.status === 'fail' && r.severity === 'critical');

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50">
      <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg">
        <h3 className="font-bold">🔧 INFRASTRUCTURE DIAGNOSTIC</h3>
        <p className="text-sm">Something changed in your AWS setup!</p>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        {isRunning && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm mt-2">Running diagnostics...</p>
          </div>
        )}

        {criticalFailures.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded">
            <h4 className="font-bold text-red-900 mb-2">🚨 CRITICAL FAILURES FOUND:</h4>
            {criticalFailures.map((result, index) => (
              <div key={index} className="text-sm text-red-800 mb-1">
                • {result.test}: {result.message}
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <details key={index} className={`border rounded p-2 ${getSeverityColor(result.severity)}`}>
                <summary className="cursor-pointer font-medium text-sm">
                  {getStatusIcon(result.status)} [{result.category}] {result.test}
                </summary>
                <div className="mt-2 text-xs">
                  <p className="mb-1">{result.message}</p>
                  {result.details && (
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}

        <button
          onClick={runComprehensiveDiagnostics}
          disabled={isRunning}
          className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Re-run Diagnostics'}
        </button>
      </div>
    </div>
  );
};

export default InfrastructureDiagnostic;
