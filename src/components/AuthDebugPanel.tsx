import React, { useState, useEffect } from 'react';
import { getCurrentUser, signUp } from 'aws-amplify/auth';
import awsExports from '../aws-exports';

const AuthDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Show configuration on load
    const config = {
      userPoolId: awsExports.aws_user_pools_id,
      clientId: awsExports.aws_user_pools_web_client_id,
      region: awsExports.aws_project_region,
      identityPoolId: awsExports.aws_cognito_identity_pool_id
    };
    
    setDebugInfo(`🔧 AWS Configuration:
User Pool ID: ${config.userPoolId}
Client ID: ${config.clientId}
Region: ${config.region}
Identity Pool ID: ${config.identityPoolId}

Configuration looks ${config.userPoolId && config.clientId ? '✅ VALID' : '❌ INVALID'}`);
  }, []);

  const testConnection = async () => {
    setTestResult('🔄 Testing connection...');
    
    try {
      // Test 1: Try to get current user (should fail gracefully if not authenticated)
      try {
        await getCurrentUser();
        setTestResult('✅ Already authenticated');
        return;
      } catch (error: any) {
        if (error.name === 'UserUnAuthenticatedException') {
          setTestResult('✅ Connection OK (not authenticated, as expected)');
        } else {
          setTestResult(`❌ Connection error: ${error.message}`);
          return;
        }
      }

      // Test 2: Try a test signup (will fail if user exists, but shows connection works)
      const testEmail = `test-connection-${Date.now()}@example.com`;
      const testPassword = 'TestPass123!';
      
      try {
        const result = await signUp({
          username: testEmail,
          password: testPassword,
          options: {
            userAttributes: {
              email: testEmail,
              name: 'Test User',
            },
          },
        });
        
        setTestResult(`✅ Test signup successful! Check email ${testEmail} for confirmation. NextStep: ${result.nextStep?.signUpStep}`);
      } catch (signupError: any) {
        if (signupError.name === 'UsernameExistsException') {
          setTestResult('✅ Connection working (test email already exists)');
        } else {
          setTestResult(`❌ Signup test failed: ${signupError.name} - ${signupError.message}`);
        }
      }
    } catch (error: any) {
      setTestResult(`❌ Test failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-md shadow-lg z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Auth Debug Panel</h3>
      
      <details className="mb-2">
        <summary className="cursor-pointer text-xs">Show Configuration</summary>
        <pre className="text-xs mt-1 whitespace-pre-wrap">{debugInfo}</pre>
      </details>
      
      <button
        onClick={testConnection}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs mr-2"
      >
        Test Connection
      </button>
      
      {testResult && (
        <div className="mt-2 text-xs">
          <div className="font-medium">Test Result:</div>
          <div className="whitespace-pre-wrap">{testResult}</div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugPanel;
