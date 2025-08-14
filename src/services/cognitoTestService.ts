import { Amplify } from 'aws-amplify';
import { signUp, getCurrentUser } from 'aws-amplify/auth';
import awsExports from '../aws-exports';

export interface CognitoTestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

class CognitoTestService {
  constructor() {
    // Ensure Amplify is configured
    Amplify.configure(awsExports);
  }

  // Test basic Amplify configuration
  async testAmplifyConfig(): Promise<CognitoTestResult> {
    try {
      console.log('🔧 Testing Amplify Configuration...');
      console.log('User Pool ID:', awsExports.aws_user_pools_id);
      console.log('Client ID:', awsExports.aws_user_pools_web_client_id);
      console.log('Region:', awsExports.aws_cognito_region);
      
      if (!awsExports.aws_user_pools_id || !awsExports.aws_user_pools_web_client_id) {
        return {
          success: false,
          message: 'Missing required Cognito configuration',
          error: 'User Pool ID or Client ID not configured'
        };
      }

      return {
        success: true,
        message: 'Amplify configuration looks correct',
        details: {
          userPoolId: awsExports.aws_user_pools_id,
          clientId: awsExports.aws_user_pools_web_client_id,
          region: awsExports.aws_cognito_region
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Amplify configuration error',
        error: error.message
      };
    }
  }

  // Test Cognito connection
  async testCognitoConnection(): Promise<CognitoTestResult> {
    try {
      console.log('🔐 Testing Cognito Connection...');
      
      // Try to get current user (this will fail if not authenticated, but tests connection)
      try {
        await getCurrentUser();
      } catch (error: any) {
        // This is expected if no user is signed in
        if (error.name === 'UserUnAuthenticatedException' || error.message.includes('not authenticated')) {
          return {
            success: true,
            message: 'Cognito connection working (no user authenticated, as expected)',
            details: { connectionStatus: 'healthy' }
          };
        } else {
          return {
            success: false,
            message: 'Cognito connection error',
            error: error.message
          };
        }
      }
      
      return {
        success: true,
        message: 'Cognito connection successful',
        details: { connectionStatus: 'authenticated' }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to connect to Cognito',
        error: error.message
      };
    }
  }

  // Test signup with detailed error handling
  async testSignUp(email: string, password: string, name: string): Promise<CognitoTestResult> {
    try {
      console.log('📝 Testing SignUp Process...');
      console.log('Email:', email);
      console.log('Password Length:', password.length);
      console.log('Name:', name);

      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      return {
        success: true,
        message: 'SignUp successful! Check email for confirmation code.',
        details: {
          userId: result.userId,
          nextStep: result.nextStep
        }
      };
    } catch (error: any) {
      console.error('SignUp error details:', error);
      
      let userFriendlyMessage = 'Failed to create account';
      let technicalDetails = error.message;

      // Handle specific Cognito errors
      switch (error.name) {
        case 'UsernameExistsException':
          userFriendlyMessage = 'An account with this email already exists';
          break;
        case 'InvalidPasswordException':
          userFriendlyMessage = 'Password does not meet requirements (minimum 8 characters, uppercase, lowercase, number)';
          break;
        case 'InvalidParameterException':
          userFriendlyMessage = 'Invalid email address or missing required fields';
          break;
        case 'UserLambdaValidationException':
          userFriendlyMessage = 'Account validation failed - please check your information';
          break;
        case 'CodeDeliveryFailureException':
          userFriendlyMessage = 'Unable to send confirmation email - please try again';
          break;
        case 'TooManyRequestsException':
          userFriendlyMessage = 'Too many attempts - please wait a few minutes before trying again';
          break;
        case 'LimitExceededException':
          userFriendlyMessage = 'Account creation limit exceeded - please contact support';
          break;
        case 'NotAuthorizedException':
          userFriendlyMessage = 'Not authorized to create account - please check your credentials';
          break;
        case 'UserNotConfirmedException':
          userFriendlyMessage = 'Account exists but not confirmed - check your email for confirmation code';
          break;
        case 'NetworkError':
          userFriendlyMessage = 'Network connection error - please check your internet connection';
          break;
        default:
          if (error.message.includes('Network Error')) {
            userFriendlyMessage = 'Network connection error - please try again';
          } else if (error.message.includes('User Pool') || error.message.includes('Client')) {
            userFriendlyMessage = 'Authentication service configuration error';
          }
      }

      return {
        success: false,
        message: userFriendlyMessage,
        error: technicalDetails,
        details: {
          errorName: error.name,
          errorCode: error.code,
          statusCode: error.$metadata?.httpStatusCode
        }
      };
    }
  }

  // Comprehensive diagnostic test
  async runFullDiagnostics(): Promise<CognitoTestResult[]> {
    const results: CognitoTestResult[] = [];
    
    console.log('🩺 Running Cognito Diagnostics...');
    
    // Test 1: Configuration
    results.push(await this.testAmplifyConfig());
    
    // Test 2: Connection
    results.push(await this.testCognitoConnection());
    
    console.log('📋 Diagnostic Results:', results);
    return results;
  }

  // Get user-friendly error message for signup failures
  getUserFriendlySignUpError(error: any): string {
    if (!error) return 'Unknown error occurred';
    
    switch (error.name) {
      case 'UsernameExistsException':
        return 'An account with this email already exists. Please use a different email or try signing in.';
      case 'InvalidPasswordException':
        return 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.';
      case 'InvalidParameterException':
        return 'Please check that your email address is valid and all required fields are filled.';
      case 'TooManyRequestsException':
        return 'Too many attempts. Please wait a few minutes before trying again.';
      case 'CodeDeliveryFailureException':
        return 'Unable to send confirmation email. Please check your email address and try again.';
      case 'LimitExceededException':
        return 'Account creation limit exceeded. Please contact support if this continues.';
      case 'NetworkError':
        return 'Network connection error. Please check your internet connection and try again.';
      default:
        if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
          return 'Network connection error. Please check your internet connection and try again.';
        }
        if (error.message?.includes('User Pool') || error.message?.includes('Client')) {
          return 'Authentication service temporarily unavailable. Please try again in a few minutes.';
        }
        return `Account creation failed: ${error.message || 'Unknown error'}`;
    }
  }
}

export const cognitoTestService = new CognitoTestService();
export default cognitoTestService;
