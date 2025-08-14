/**
 * 🔐 BULLETPROOF ENVIRONMENT VALIDATOR
 * Validates all required environment variables for secure deployment
 */

interface RequiredEnvVars {
  VITE_AWS_REGION: string;
  VITE_S3_BUCKET: string;
  VITE_AWS_USER_POOLS_ID: string;
  VITE_AWS_USER_POOLS_WEB_CLIENT_ID: string;
  VITE_AWS_COGNITO_IDENTITY_POOL_ID: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

export class EnvironmentValidator {
  private static readonly requiredVars: (keyof RequiredEnvVars)[] = [
    'VITE_AWS_REGION',
    'VITE_S3_BUCKET',
    'VITE_AWS_USER_POOLS_ID',
    'VITE_AWS_USER_POOLS_WEB_CLIENT_ID',
    'VITE_AWS_COGNITO_IDENTITY_POOL_ID'
  ];

  /**
   * Validates all required environment variables
   */
  static validate(): ValidationResult {
    const missingVars: string[] = [];
    const warnings: string[] = [];

    // Check for required variables
    for (const varName of this.requiredVars) {
      const value = import.meta.env[varName];
      
      if (!value) {
        missingVars.push(varName);
      } else if (this.isPlaceholderValue(value)) {
        warnings.push(`${varName} appears to be a placeholder value`);
      }
    }

    // Security checks
    this.performSecurityChecks(warnings);

    return {
      isValid: missingVars.length === 0,
      missingVars,
      warnings
    };
  }

  /**
   * Checks if a value appears to be a placeholder
   */
  private static isPlaceholderValue(value: string): boolean {
    const placeholderPatterns = [
      /^your-/i,
      /^replace-/i,
      /^example/i,
      /^placeholder/i,
      /^xxx/i,
      /^todo/i,
      /^change-me/i
    ];

    return placeholderPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Performs additional security validation
   */
  private static performSecurityChecks(warnings: string[]): void {
    // Check if we're in development mode with missing production configs
    if (import.meta.env.DEV) {
      warnings.push('Running in development mode - ensure production environment variables are configured in AWS Amplify');
    }

    // Validate AWS region format
    const region = import.meta.env.VITE_AWS_REGION;
    if (region && !/^[a-z]{2}-[a-z]+-\d+$/.test(region)) {
      warnings.push('AWS region format appears invalid (expected format: us-west-2)');
    }

    // Validate Cognito User Pool ID format
    const userPoolId = import.meta.env.VITE_AWS_USER_POOLS_ID;
    if (userPoolId && !/^[a-z]{2}-[a-z]+-\d+_[a-zA-Z0-9]+$/.test(userPoolId)) {
      warnings.push('Cognito User Pool ID format appears invalid');
    }

    // Validate Identity Pool ID format
    const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID;
    if (identityPoolId && !/^[a-z]{2}-[a-z]+-\d+:[0-9a-f-]+$/.test(identityPoolId)) {
      warnings.push('Cognito Identity Pool ID format appears invalid');
    }
  }

  /**
   * Returns environment info for debugging
   */
  static getEnvironmentInfo(): object {
    return {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      configuredVars: this.requiredVars.filter(
        varName => !!import.meta.env[varName]
      )
    };
  }

  /**
   * Validates and throws error if environment is invalid (for startup validation)
   */
  static validateOrThrow(): void {
    const result = this.validate();
    
    if (!result.isValid) {
      const errorMessage = [
        '🔐 ENVIRONMENT VALIDATION FAILED',
        '================================',
        '',
        'Missing required environment variables:',
        ...result.missingVars.map(v => `  ❌ ${v}`),
        '',
        'Please ensure all environment variables are configured in AWS Amplify:',
        '1. Go to AWS Amplify Console',
        '2. Select your app → Environment variables',
        '3. Add all missing variables',
        '4. Redeploy your application',
        '',
        'For setup instructions, see: AMPLIFY_ENV_SETUP.md'
      ].join('\n');
      
      throw new Error(errorMessage);
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ Environment Warnings:', result.warnings);
    }
  }
}

// Auto-validate in production builds
if (import.meta.env.PROD) {
  try {
    EnvironmentValidator.validateOrThrow();
  } catch (error) {
    console.error(error);
    // In production, we might want to show a user-friendly error page
    // instead of breaking the entire app
  }
}
