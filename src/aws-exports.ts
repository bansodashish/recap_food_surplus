// AWS Amplify Configuration for TypeScript
export interface AmplifyConfig {
  aws_project_region: string;
  aws_cognito_identity_pool_id?: string;
  aws_cognito_region: string;
  aws_user_pools_id: string;
  aws_user_pools_web_client_id: string;
  oauth?: object;
  aws_cognito_username_attributes: string[];
  aws_cognito_social_providers: string[];
  aws_cognito_signup_attributes: string[];
  aws_cognito_mfa_configuration: string;
  aws_cognito_mfa_types: string[];
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: number;
    passwordPolicyCharacters: string[];
  };
  aws_cognito_verification_mechanisms: string[];
}

const awsmobile: AmplifyConfig = {
  aws_project_region: "eu-west-1",
  aws_cognito_region: "eu-west-1",
  aws_user_pools_id: "eu-west-1_L44aHDwEX",
  aws_user_pools_web_client_id: "DocumentChatbotUsers",
  oauth: {},
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ["EMAIL"]
};

export default awsmobile;
