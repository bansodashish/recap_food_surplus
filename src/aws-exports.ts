// AWS Amplify Configuration for TypeScript
const awsmobile = {
  aws_project_region: "eu-west-1",
  aws_cognito_region: "eu-west-1",
  aws_user_pools_id: "eu-west-1_In6BAFcN1",
  aws_user_pools_web_client_id: "1sh3gt6g7eupf69i8c1ht8ang0",
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
  aws_cognito_verification_mechanisms: ["EMAIL"]
};

export default awsmobile;
