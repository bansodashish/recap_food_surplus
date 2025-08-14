import React, { useState } from 'react';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  details?: any;
}

const AWSInfrastructureDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const USER_POOL_ID = 'eu-west-1_Y2tRumZ22';
  const CLIENT_ID = 'flshpq7e5kdqa00fre30g0t9p';
  const REGION = 'eu-west-1';

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: Check Amplify Configuration
      diagnosticResults.push({
        test: 'Amplify Configuration',
        status: 'info',
        message: 'Checking current Amplify configuration...',
        details: {
          userPoolId: USER_POOL_ID,
          clientId: CLIENT_ID,
          region: REGION
        }
      });

      // Test 2: Network Connectivity to AWS
      try {
        const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser'
          },
          body: JSON.stringify({})
        });

        diagnosticResults.push({
          test: 'AWS Cognito Connectivity',
          status: response.status === 400 ? 'pass' : 'warning',
          message: response.status === 400 
            ? 'Successfully connected to AWS Cognito service' 
            : `Unexpected response: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText
          }
        });
      } catch (error: any) {
        diagnosticResults.push({
          test: 'AWS Cognito Connectivity',
          status: 'fail',
          message: 'Cannot connect to AWS Cognito service',
          details: {
            error: error.message,
            name: error.name
          }
        });
      }

      // Test 3: Test SignUp API Call (to check if User Pool exists)
      try {
        const { signUp } = await import('aws-amplify/auth');
        
        // This will fail but tell us WHY it fails
        await signUp({
          username: 'diagnostic-test-user',
          password: 'DiagnosticTest123!',
          options: {
            userAttributes: {
              email: 'diagnostic@test.com'
            }
          }
        });

        diagnosticResults.push({
          test: 'User Pool Access',
          status: 'warning',
          message: 'Unexpected success - test user should not have been created',
          details: 'This diagnostic user should be deleted'
        });

      } catch (error: any) {
        let status: 'pass' | 'fail' | 'warning' = 'fail';
        let message = 'Unknown error';

        if (error.name === 'UsernameExistsException') {
          status = 'pass';
          message = 'User Pool is accessible and functioning';
        } else if (error.name === 'InvalidParameterException') {
          status = 'pass';
          message = 'User Pool is accessible, parameter validation working';
        } else if (error.name === 'NotAuthorizedException') {
          status = 'fail';
          message = 'User Pool Client authentication flows not properly configured';
        } else if (error.name === 'ResourceNotFoundException') {
          status = 'fail';
          message = 'User Pool or Client not found - Infrastructure issue';
        } else if (error.message?.includes('Network')) {
          status = 'fail';
          message = 'Network connectivity issue to AWS';
        } else {
          message = `Error: ${error.name} - ${error.message}`;
          status = 'warning';
        }

        diagnosticResults.push({
          test: 'User Pool Access',
          status,
          message,
          details: {
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
            httpStatusCode: error.$metadata?.httpStatusCode,
            awsErrorType: error.__type
          }
        });
      }

      // Test 4: Environment Variables Check
      const envVars = {
        VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION,
        VITE_AWS_USER_POOLS_ID: import.meta.env.VITE_AWS_USER_POOLS_ID,
        VITE_AWS_USER_POOLS_WEB_CLIENT_ID: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID
      };

      const missingEnvVars = Object.entries(envVars)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);

      diagnosticResults.push({
        test: 'Environment Variables',
        status: missingEnvVars.length === 0 ? 'pass' : 'warning',
        message: missingEnvVars.length === 0 
          ? 'All environment variables are set'
          : `Missing environment variables: ${missingEnvVars.join(', ')}`,
        details: envVars
      });

      // Test 5: Check what changed (infrastructure drift detection)
      const configurationAnalysis = {
        expectedConfig: {
          userPoolId: USER_POOL_ID,
          clientId: CLIENT_ID,
          region: REGION
        },
        currentConfig: {
          userPoolId: import.meta.env.VITE_AWS_USER_POOLS_ID || USER_POOL_ID,
          clientId: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID || CLIENT_ID,
          region: import.meta.env.VITE_AWS_REGION || REGION
        }
      };

      const configMismatches = [];
      if (configurationAnalysis.expectedConfig.userPoolId !== configurationAnalysis.currentConfig.userPoolId) {
        configMismatches.push('User Pool ID mismatch');
      }
      if (configurationAnalysis.expectedConfig.clientId !== configurationAnalysis.currentConfig.clientId) {
        configMismatches.push('Client ID mismatch');
      }
      if (configurationAnalysis.expectedConfig.region !== configurationAnalysis.currentConfig.region) {
        configMismatches.push('Region mismatch');
      }

      diagnosticResults.push({
        test: 'Configuration Drift Detection',
        status: configMismatches.length === 0 ? 'pass' : 'fail',
        message: configMismatches.length === 0 
          ? 'Configuration matches expected values'
          : `Configuration drift detected: ${configMismatches.join(', ')}`,
        details: configurationAnalysis
      });

    } catch (error: any) {
      diagnosticResults.push({
        test: 'Diagnostic Framework',
        status: 'fail',
        message: `Diagnostic failed: ${error.message}`,
        details: error
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const toggleDetails = (testName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border-2 border-red-300 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          🔍 AWS Infrastructure Diagnostic
        </h2>
        <p className="text-gray-600">
          Since the integration was working before, let's check what changed in your AWS infrastructure.
        </p>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <strong>Current Configuration:</strong>
          <ul className="mt-2 text-sm">
            <li><strong>User Pool ID:</strong> {USER_POOL_ID}</li>
            <li><strong>Client ID:</strong> {CLIENT_ID}</li>
            <li><strong>Region:</strong> {REGION}</li>
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Infrastructure Diagnostic'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Diagnostic Results:</h3>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 border-2 rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{result.test}</h4>
                  <p className="mt-1">{result.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded uppercase ${
                    result.status === 'pass' ? 'bg-green-100 text-green-800' :
                    result.status === 'fail' ? 'bg-red-100 text-red-800' :
                    result.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {result.status}
                  </span>
                  {result.details && (
                    <button
                      onClick={() => toggleDetails(result.test)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showDetails[result.test] ? 'Hide' : 'Show'} Details
                    </button>
                  )}
                </div>
              </div>
              
              {result.details && showDetails[result.test] && (
                <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Review the diagnostic results above</li>
              <li>2. If "User Pool Access" fails with NotAuthorizedException, check AWS Console authentication flows</li>
              <li>3. If "Resource Not Found", verify your AWS resources still exist</li>
              <li>4. If "Configuration Drift", update your environment variables</li>
              <li>5. Contact support if infrastructure issues persist</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AWSInfrastructureDiagnostic;
