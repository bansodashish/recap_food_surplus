// AWS Amplify Configuration for TypeScript - Complete Configuration with Identity Pool
const awsmobile = {
  aws_project_region: "eu-west-1",
  aws_cognito_region: "eu-west-1",
  aws_user_pools_id: "eu-west-1_Y2tRumZ22",
  aws_user_pools_web_client_id: "flshpq7e5kdqa00fre30g0t9p", // Updated to current Client ID
  
  // 🔑 Identity Pool Configuration for S3 Access
  aws_cognito_identity_pool_id: "eu-west-1:c12d8304-37ee-4a49-bedb-32b3c4c2d078",
  
  // 📦 Storage Configuration
  aws_user_files_s3_bucket: "bansoash-poc",
  aws_user_files_s3_bucket_region: "eu-west-1",
  
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL", "NAME"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: ["REQUIRES_LOWERCASE", "REQUIRES_NUMBERS", "REQUIRES_UPPERCASE"]
  },
  aws_cognito_verification_mechanisms: ["EMAIL"],
  
  // 🔐 Authentication Configuration
  Auth: {
    region: "eu-west-1",
    userPoolId: "eu-west-1_Y2tRumZ22",
    userPoolWebClientId: "flshpq7e5kdqa00fre30g0t9p", // Updated to current Client ID
    identityPoolId: "eu-west-1:c12d8304-37ee-4a49-bedb-32b3c4c2d078",
  },
  
  // 📦 Storage Configuration
  Storage: {
    region: "eu-west-1",
    bucket: "bansoash-poc",
    identityPoolId: "eu-west-1:c12d8304-37ee-4a49-bedb-32b3c4c2d078",
  }
};

export default awsmobile;
