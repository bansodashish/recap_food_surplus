// Modern Amplify v6 Configuration Format
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_Y2tRumZ22',
      userPoolClientId: '1sh3gt6g7eupf69i8c1ht8ang0',
      identityPoolId: 'eu-west-1:c12d8304-37ee-4a49-bedb-32b3c4c2d078',
      loginWith: {
        email: true,
        username: false,
        phone: false
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        }
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false
      }
    }
  },
  Storage: {
    S3: {
      bucket: 'bansoash-poc',
      region: 'eu-west-1',
    }
  }
};

export default amplifyConfig;
