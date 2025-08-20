// 🔍 Cognito Identity Pool Configuration Test Component
import React, { useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import { ultraSecureS3Service } from '../services/ultraSecureS3Service';

interface ConfigStatus {
  userAuthenticated: boolean;
  hasCredentials: boolean;
  credentialsValid: boolean;
  s3Configured: boolean;
  identityPoolId?: string;
  userPoolId?: string;
  error?: string;
}

export const CognitoConfigTest: React.FC = () => {
  const [status, setStatus] = useState<ConfigStatus>({
    userAuthenticated: false,
    hasCredentials: false,
    credentialsValid: false,
    s3Configured: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string>('');

  const runConfigTest = async () => {
    setIsLoading(true);
    setStatus({
      userAuthenticated: false,
      hasCredentials: false,
      credentialsValid: false,
      s3Configured: false
    });

    try {
      // Test 1: Check if user is authenticated
      console.log('🔍 Testing user authentication...');
      const currentUser = await getCurrentUser();
      
      const newStatus: ConfigStatus = {
        userAuthenticated: !!currentUser,
        hasCredentials: false,
        credentialsValid: false,
        s3Configured: false,
        userPoolId: currentUser?.username || 'Unknown'
      };

      if (!currentUser) {
        setStatus({ ...newStatus, error: 'User not authenticated' });
        setIsLoading(false);
        return;
      }

      // Test 2: Check if we can get credentials
      console.log('🔍 Testing credential retrieval...');
      const session = await fetchAuthSession({ forceRefresh: true });
      
      newStatus.hasCredentials = !!session.credentials;
      newStatus.identityPoolId = session.identityId || 'Unknown';
      
      if (!session.credentials) {
        setStatus({ ...newStatus, error: 'No credentials available from session' });
        setIsLoading(false);
        return;
      }

      // Test 3: Validate credentials format
      console.log('🔍 Testing credential validity...');
      const creds = session.credentials;
      newStatus.credentialsValid = !!(
        creds.accessKeyId && 
        creds.secretAccessKey && 
        creds.sessionToken &&
        creds.expiration &&
        new Date(creds.expiration) > new Date()
      );

      if (!newStatus.credentialsValid) {
        setStatus({ ...newStatus, error: 'Credentials are invalid or expired' });
        setIsLoading(false);
        return;
      }

      // Test 4: Test S3 service initialization
      console.log('🔍 Testing S3 service...');
      const healthCheck = await ultraSecureS3Service.healthCheck();
      newStatus.s3Configured = healthCheck.status === 'healthy';

      if (healthCheck.status !== 'healthy') {
        setStatus({ ...newStatus, error: `S3 service unhealthy: ${healthCheck.message}` });
        setIsLoading(false);
        return;
      }

      setStatus(newStatus);
      
    } catch (error) {
      console.error('Configuration test failed:', error);
      setStatus({
        userAuthenticated: false,
        hasCredentials: false,
        credentialsValid: false,
        s3Configured: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testS3Upload = async () => {
    if (!testFile) {
      setUploadResult('❌ Please select a test file first');
      return;
    }

    setUploadResult('🔄 Testing S3 upload...');
    
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUploadResult('❌ User not authenticated');
        return;
      }

      const result = await ultraSecureS3Service.uploadImage(testFile, currentUser.userId);
      
      if (result.success) {
        setUploadResult(`✅ Upload successful! URL: ${result.url}`);
      } else {
        setUploadResult(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      setUploadResult(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    runConfigTest();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => (
    <span className={`text-lg ${success ? 'text-green-500' : 'text-red-500'}`}>
      {success ? '✅' : '❌'}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🔍 AWS Cognito Identity Pool Configuration Test
        </h2>
        <button
          onClick={runConfigTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '🔄 Testing...' : '🔄 Re-test'}
        </button>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon success={status.userAuthenticated} />
            <span className="font-medium">User Authentication</span>
          </div>
          <p className="text-sm text-gray-600">
            {status.userAuthenticated ? `Authenticated as: ${status.userPoolId}` : 'Not authenticated'}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon success={status.hasCredentials} />
            <span className="font-medium">AWS Credentials</span>
          </div>
          <p className="text-sm text-gray-600">
            {status.hasCredentials ? `Identity: ${status.identityPoolId}` : 'No credentials available'}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon success={status.credentialsValid} />
            <span className="font-medium">Credentials Valid</span>
          </div>
          <p className="text-sm text-gray-600">
            {status.credentialsValid ? 'Credentials are valid and not expired' : 'Invalid or expired credentials'}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <StatusIcon success={status.s3Configured} />
            <span className="font-medium">S3 Service</span>
          </div>
          <p className="text-sm text-gray-600">
            {status.s3Configured ? 'S3 service is healthy' : 'S3 service not configured'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {status.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">❌ Configuration Issue</h3>
          <p className="text-red-700">{status.error}</p>
        </div>
      )}

      {/* S3 Upload Test */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">🧪 S3 Upload Test</h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTestFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={testS3Upload}
            disabled={!testFile || !status.s3Configured}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            🚀 Test Upload
          </button>
        </div>

        {uploadResult && (
          <div className="p-3 bg-gray-50 border rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{uploadResult}</pre>
          </div>
        )}
      </div>

      {/* Configuration Details */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">📋 Configuration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User Pool ID:</strong> eu-west-1_Y2tRumZ22
          </div>
          <div>
            <strong>Client ID:</strong> flshpq7e5kdqa00fre30g0t9p
          </div>
          <div>
            <strong>Identity Pool ID:</strong> eu-west-1:096130a0-347a-446d-9749-79c95b856163
          </div>
          <div>
            <strong>S3 Bucket:</strong> bansoash-poc
          </div>
          <div>
            <strong>Region:</strong> eu-west-1
          </div>
          <div>
            <strong>Environment:</strong> {import.meta.env.VITE_APP_ENV || 'development'}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="border-t pt-6 mt-6 text-sm text-gray-600">
        <h3 className="text-lg font-medium mb-2 text-gray-900">🆘 Need Help?</h3>
        <ul className="space-y-1">
          <li>• Check the <code>AWS_COGNITO_IDENTITY_POOL_SETUP.md</code> guide</li>
          <li>• Run <code>./verify-cognito-config.sh</code> script</li>
          <li>• Ensure Identity Pool accepts your User Pool as authentication provider</li>
          <li>• Verify IAM roles have S3 permissions</li>
        </ul>
      </div>
    </div>
  );
};

export default CognitoConfigTest;
