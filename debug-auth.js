// Debug script to test AWS Cognito authentication
const { Amplify } = require('aws-amplify');
const { signIn, getCurrentUser } = require('@aws-amplify/auth');

// Import configuration from the TypeScript file (we'll use require for CommonJS)
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Authentication Debug...');

// Read and parse the aws-exports.ts file
const awsExportsPath = path.join(__dirname, 'src', 'aws-exports.ts');
const awsExportsContent = fs.readFileSync(awsExportsPath, 'utf8');

// Extract configuration values using regex
const userPoolId = awsExportsContent.match(/aws_user_pools_id:\s*"([^"]+)"/)?.[1];
const clientId = awsExportsContent.match(/aws_user_pools_web_client_id:\s*"([^"]+)"/)?.[1];
const region = awsExportsContent.match(/aws_project_region:\s*"([^"]+)"/)?.[1];
const identityPoolId = awsExportsContent.match(/aws_cognito_identity_pool_id:\s*"([^"]+)"/)?.[1];

const awsConfig = {
  aws_project_region: region,
  aws_cognito_region: region,
  aws_user_pools_id: userPoolId,
  aws_user_pools_web_client_id: clientId,
  aws_cognito_identity_pool_id: identityPoolId,
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL", "NAME"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_verification_mechanisms: ["EMAIL"]
};

console.log('📋 Extracted Configuration:');
console.log('User Pool ID:', userPoolId);
console.log('Client ID:', clientId);
console.log('Region:', region);
console.log('Identity Pool:', identityPoolId);

// Configure Amplify
Amplify.configure(awsConfig);

// Test credentials
const testCredentials = {
  username: 'bansod.ashish@gmail.com',
  password: 'anty12345'
};

async function testAuthentication() {
  try {
    console.log('🔐 Testing authentication...');
    const result = await signIn(testCredentials);
    console.log('✅ Sign-in successful!', result);
    
    // Try to get current user
    const user = await getCurrentUser();
    console.log('👤 Current user:', user);
    
  } catch (error) {
    console.error('❌ Authentication failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Check if it's a specific Cognito error
    if (error.name === 'NotAuthorizedException') {
      console.error('🚨 Invalid credentials - check username/password or User Pool configuration');
    } else if (error.name === 'UserNotFoundException') {
      console.error('🚨 User not found - check if user exists in User Pool');
    } else if (error.name === 'InvalidParameterException') {
      console.error('🚨 Invalid parameters - check User Pool Client ID configuration');
    } else {
      console.error('🚨 Unknown authentication error');
    }
  }
}

testAuthentication();
