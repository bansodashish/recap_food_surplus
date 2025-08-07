# AWS Cognito Setup Guide for Recap Food Surplus

This document provides comprehensive instructions for setting up AWS Cognito User Pool and integrating it with the Recap Food Surplus application for authentication and subscription management.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Cognito User Pool Creation](#aws-cognito-user-pool-creation)
3. [User Pool Configuration](#user-pool-configuration)
4. [App Client Configuration](#app-client-configuration)
5. [Custom Attributes Setup](#custom-attributes-setup)
6. [User Management](#user-management)
7. [Integration with Application](#integration-with-application)
8. [Testing Authentication](#testing-authentication)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Node.js and npm/yarn installed
- Access to AWS Console

### AWS CLI Setup
```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (e.g., eu-west-1), and output format (json)
```

## AWS Cognito User Pool Creation

### Step 1: Create User Pool via AWS Console

1. **Navigate to AWS Cognito Console**
   - Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
   - Select your preferred region (we used `eu-west-1`)

2. **Create User Pool**
   ```bash
   # Alternative: Create via AWS CLI
   aws cognito-idp create-user-pool \
     --pool-name "recap-food-surplus-users" \
     --policies '{
       "PasswordPolicy": {
         "MinimumLength": 8,
         "RequireUppercase": true,
         "RequireLowercase": true,
         "RequireNumbers": true,
         "RequireSymbols": false
       }
     }' \
     --auto-verified-attributes email \
     --verification-message-template '{
       "EmailMessage": "Your verification code is {####}",
       "EmailSubject": "Verify your Recap Food account"
     }' \
     --region eu-west-1
   ```

3. **Note the User Pool ID**
   - Example: `eu-west-1_In6BAFcN1`
   - Save this for later configuration

### Step 2: Configure User Pool Settings

#### Sign-up Configuration
- **Required attributes**: email, name
- **Optional attributes**: phone_number, address
- **Auto-verified attributes**: email
- **Allow users to sign themselves up**: Yes

#### Password Policy
```json
{
  "MinimumLength": 8,
  "RequireUppercase": true,
  "RequireLowercase": true,
  "RequireNumbers": true,
  "RequireSymbols": false
}
```

## User Pool Configuration

### Step 3: Custom Attributes Setup

Create custom attributes for subscription management:

```bash
# Add custom attributes via AWS CLI
aws cognito-idp add-custom-attributes \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --custom-attributes '[
    {
      "Name": "subscription_plan",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "subscription_status", 
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "subscription_expires",
      "AttributeDataType": "String", 
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "stripe_customer_id",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "company",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "city",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    },
    {
      "Name": "country",
      "AttributeDataType": "String",
      "Required": false,
      "Mutable": true
    }
  ]' \
  --region eu-west-1
```

## App Client Configuration

### Step 4: Create App Client

```bash
# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --client-name "recap-food-surplus-client" \
  --generate-secret false \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --supported-identity-providers COGNITO \
  --callback-urls "http://localhost:5173/,https://dev.d32bae3bedjy92.amplifyapp.com/" \
  --logout-urls "http://localhost:5173/,https://dev.d32bae3bedjy92.amplifyapp.com/" \
  --region eu-west-1
```

**Important Settings:**
- **App client ID**: `1sh3gt6g7eupf69i8c1ht8ang0` (example from our setup)
- **Generate client secret**: No (for public clients like React apps)
- **Auth flows**: Enable User Password Auth, User SRP Auth, Refresh Token Auth
- **OAuth flows**: Authorization code grant
- **OAuth scopes**: email, openid, profile

### Step 5: Update Application Configuration

Create/update the AWS Exports configuration file:

```typescript
// src/aws-exports.ts
const awsconfig = {
  Auth: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_In6BAFcN1',
    userPoolWebClientId: '1sh3gt6g7eupf69i8c1ht8ang0',
    mandatorySignIn: false,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
};

export default awsconfig;
```

## User Management

### Creating Users

#### Method 1: Admin Create User (for testing)
```bash
# Create a test user with temporary password
aws cognito-idp admin-create-user \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username ashish.bansal@gmail.com \
  --user-attributes Name=email,Value=ashish.bansal@gmail.com Name=name,Value="Ashish Bansal" Name=email_verified,Value=true Name=custom:subscription_plan,Value=free Name=custom:subscription_status,Value=active \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region eu-west-1
```

#### Method 2: Set Permanent Password
```bash
# Set permanent password for admin-created user
aws cognito-idp admin-set-user-password \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username ashish.bansal@gmail.com \
  --password "Banty12345" \
  --permanent \
  --region eu-west-1
```

#### Method 3: Confirm User Account
```bash
# Confirm user account (if using temporary password flow)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username ashish.bansal@gmail.com \
  --region eu-west-1
```

### User Attribute Management

#### Update User Subscription Plan
```bash
# Update user's subscription plan to premium
aws cognito-idp admin-update-user-attributes \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username bansod.ashish1125@gmail.com \
  --user-attributes Name=custom:subscription_plan,Value=premium Name=custom:subscription_status,Value=active \
  --region eu-west-1
```

#### Get User Details
```bash
# Retrieve user information and attributes
aws cognito-idp admin-get-user \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username bansod.ashish1125@gmail.com \
  --region eu-west-1
```

#### List All Users
```bash
# List all users in the user pool
aws cognito-idp list-users \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --region eu-west-1
```

## Integration with Application

### Step 6: Install Dependencies

```bash
# Install AWS Amplify dependencies
npm install aws-amplify @aws-amplify/ui-react

# Install Stripe dependencies (for payment integration)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 7: Configure Amplify in Application

```typescript
// src/main.tsx
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
```

### Step 8: Authentication Service Implementation

The application includes a comprehensive authentication service (`src/services/auth.ts`) that handles:

- **User Sign Up**: With custom attributes for profile information
- **Email Verification**: Confirmation code handling
- **Sign In**: User authentication with error handling
- **User Profile Management**: Update user attributes including subscription data
- **Subscription Management**: Update subscription plans and status

### Step 9: Authentication Context

The `AuthContext` (`src/contexts/AuthContext.tsx`) provides:

- **User State Management**: Current user information with subscription details
- **Authentication Methods**: Sign in, sign up, sign out
- **Profile Updates**: Update user profile and subscription information
- **Permission Checks**: Feature access based on subscription plan

## Testing Authentication

### Test User Credentials

1. **Primary Test User:**
   - Email: `bansod.ashish1125@gmail.com`
   - Password: `Anty12345`
   - Subscription: Premium (for testing subscription features)

2. **Secondary Test User:**
   - Email: `ashish.bansal@gmail.com`
   - Password: `Banty12345`
   - Subscription: Free (default)

### Testing Steps

1. **Sign Up Flow:**
   ```bash
   # Navigate to the application
   https://dev.d32bae3bedjy92.amplifyapp.com/signup
   
   # Fill in registration form
   # Check email for verification code
   # Complete email verification
   ```

2. **Sign In Flow:**
   ```bash
   # Navigate to login page
   https://dev.d32bae3bedjy92.amplifyapp.com/login
   
   # Use test credentials
   # Verify successful authentication
   # Check user profile shows correct subscription plan
   ```

3. **Subscription Update Flow:**
   ```bash
   # Navigate to subscription page
   https://dev.d32bae3bedjy92.amplifyapp.com/subscription
   
   # Select premium plan
   # Complete Stripe payment flow (test mode)
   # Verify Cognito attributes are updated
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. User Not Confirmed Error
```bash
# Problem: UserNotConfirmedException when trying to sign in
# Solution: Confirm the user account

aws cognito-idp admin-confirm-sign-up \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username user@example.com \
  --region eu-west-1
```

#### 2. Invalid Password Error
```bash
# Problem: Password doesn't meet policy requirements
# Solution: Set a compliant password

aws cognito-idp admin-set-user-password \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --username user@example.com \
  --password "CompliantPassword123!" \
  --permanent \
  --region eu-west-1
```

#### 3. Custom Attributes Not Showing
```bash
# Problem: Custom attributes not appearing in user data
# Solution: Verify custom attributes exist and have correct names

aws cognito-idp describe-user-pool \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --region eu-west-1
```

#### 4. App Client Configuration Issues
```bash
# Problem: Authentication fails due to app client misconfiguration
# Solution: Update app client settings

aws cognito-idp update-user-pool-client \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --client-id 1sh3gt6g7eupf69i8c1ht8ang0 \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region eu-west-1
```

### Debugging Steps

1. **Check User Pool Configuration:**
   ```bash
   aws cognito-idp describe-user-pool --user-pool-id eu-west-1_In6BAFcN1 --region eu-west-1
   ```

2. **Verify App Client Settings:**
   ```bash
   aws cognito-idp describe-user-pool-client --user-pool-id eu-west-1_In6BAFcN1 --client-id 1sh3gt6g7eupf69i8c1ht8ang0 --region eu-west-1
   ```

3. **Check User Status:**
   ```bash
   aws cognito-idp admin-get-user --user-pool-id eu-west-1_In6BAFcN1 --username user@example.com --region eu-west-1
   ```

4. **Enable CloudWatch Logging:**
   - Enable detailed logging in Cognito User Pool settings
   - Monitor authentication attempts in CloudWatch logs

## Security Best Practices

### 1. Password Policies
- Minimum 8 characters
- Require uppercase, lowercase, and numbers
- Consider requiring symbols for production

### 2. MFA Configuration
```bash
# Enable MFA for enhanced security
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id eu-west-1_In6BAFcN1 \
  --mfa-configuration ON \
  --sms-mfa-configuration '{
    "SmsConfiguration": {
      "SnsCallerArn": "arn:aws:iam::ACCOUNT-ID:role/service-role/CognitoSNSRole"
    }
  }' \
  --region eu-west-1
```

### 3. Rate Limiting
- Configure account takeover protection
- Set up risk-based authentication
- Enable adaptive authentication

### 4. Monitoring and Alerts
- Set up CloudWatch alarms for failed authentication attempts
- Monitor user registration patterns
- Track subscription plan changes

## Production Deployment Checklist

- [ ] Update callback URLs for production domain
- [ ] Configure custom domain for Cognito (optional)
- [ ] Set up proper IAM roles and policies
- [ ] Enable CloudTrail logging
- [ ] Configure backup and recovery procedures
- [ ] Set up monitoring and alerting
- [ ] Test all authentication flows thoroughly
- [ ] Validate subscription management functionality
- [ ] Ensure Stripe integration works correctly
- [ ] Verify email delivery for verification codes

## Environment Variables

Ensure these environment variables are set:

```bash
# Application Environment Variables
VITE_AWS_REGION=eu-west-1
VITE_AWS_USER_POOL_ID=eu-west-1_In6BAFcN1
VITE_AWS_USER_POOL_WEB_CLIENT_ID=1sh3gt6g7eupf69i8c1ht8ang0
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=https://api.your-domain.com
```

## Support and Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Stripe Documentation](https://stripe.com/docs)
- [React Authentication Best Practices](https://auth0.com/blog/complete-guide-to-react-user-authentication/)

---

**Note:** This guide is specific to the Recap Food Surplus application setup. Adjust configurations based on your specific requirements and security policies.

**Last Updated:** August 7, 2025
**Version:** 1.0
**Author:** Development Team
