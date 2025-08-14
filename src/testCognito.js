// Quick test script to validate Cognito configuration
// Run this in browser console at http://localhost:5173

import { signUp } from 'aws-amplify/auth';

async function testCognitoSignup() {
  try {
    console.log('🔧 Testing Cognito signup...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPass123!';
    const testName = 'Test User';
    
    console.log('📝 Attempting signup with:', { testEmail, testName });
    
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
    
    console.log('✅ Signup successful!', result);
    return result;
  } catch (error) {
    console.error('❌ Signup failed:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });
    throw error;
  }
}

// Export for use in console
window.testCognitoSignup = testCognitoSignup;
