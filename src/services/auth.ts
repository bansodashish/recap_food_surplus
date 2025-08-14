import { 
  signUp, 
  confirmSignUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  resendSignUpCode,
  updateUserAttributes,
  updatePassword,
  fetchUserAttributes
} from 'aws-amplify/auth';

export interface AuthUser {
  username: string;
  email: string;
  email_verified: boolean;
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  address?: string;
  // Subscription-related attributes
  'custom:subscription_plan'?: 'free' | 'premium' | 'enterprise';
  'custom:subscription_status'?: 'active' | 'cancelled' | 'past_due';
  'custom:subscription_expires'?: string;
  'custom:stripe_customer_id'?: string;
  // Profile attributes
  'custom:company'?: string;
  'custom:city'?: string;
  'custom:country'?: string;
}

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface BasicSignUpParams {
  username: string;
  password: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
}

export interface SignInParams {
  username: string;
  password: string;
}

export interface ConfirmSignUpParams {
  username: string;
  code: string;
}

export interface ResetPasswordParams {
  username: string;
  code: string;
  newPassword: string;
}

class AuthService {
  // Sign up a new user - Basic version without custom attributes
  async signUp({ username, password, email, name, phone, address }: BasicSignUpParams) {
    try {
      const userAttributes: Record<string, string> = {
        email,
      };

      // Add optional standard attributes if provided
      if (name) userAttributes.name = name;
      if (phone) userAttributes.phone_number = phone;
      if (address) userAttributes.address = address;

      const result = await signUp({
        username,
        password,
        options: {
          userAttributes,
        },
      });
      
      return result;
    } catch (error: any) {
      console.error('Signup error:', error.name, error.message);

      // Provide user-friendly error messages
      let userFriendlyMessage = 'Failed to create account';
      
      switch (error.name) {
        case 'UsernameExistsException':
          userFriendlyMessage = 'An account with this email already exists. Please use a different email or try signing in.';
          break;
        case 'InvalidPasswordException':
          userFriendlyMessage = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.';
          break;
        case 'InvalidParameterException':
          if (error.message?.includes('email')) {
            userFriendlyMessage = 'Please enter a valid email address.';
          } else {
            userFriendlyMessage = 'Please check that all required fields are filled correctly.';
          }
          break;
        case 'TooManyRequestsException':
          userFriendlyMessage = 'Too many attempts. Please wait a few minutes before trying again.';
          break;
        case 'CodeDeliveryFailureException':
          userFriendlyMessage = 'Unable to send confirmation email. Please check your email address and try again.';
          break;
        case 'LimitExceededException':
          userFriendlyMessage = 'Account creation limit exceeded. Please contact support if this continues.';
          break;
        case 'NotAuthorizedException':
          userFriendlyMessage = 'Authentication service configuration error. Please contact support.';
          break;
        case 'ResourceNotFoundException':
          userFriendlyMessage = 'Authentication service temporarily unavailable. Please try again in a few minutes.';
          break;
        default:
          if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
            userFriendlyMessage = 'Network connection error. Please check your internet connection and try again.';
          } else if (error.message?.includes('User Pool') || error.message?.includes('Client')) {
            userFriendlyMessage = 'Authentication service temporarily unavailable. Please try again in a few minutes.';
          }
      }

      // Create a new error with the user-friendly message but preserve original error details
      const enhancedError = new Error(userFriendlyMessage);
      (enhancedError as any).originalError = error;
      (enhancedError as any).name = error.name;
      (enhancedError as any).code = error.code;
      
      throw enhancedError;
    }
  }

  // Sign up with custom attributes (use after adding custom attributes to Cognito)
  async signUpWithCustomAttributes({ username, password, email, name, phone, company, address, city, country }: SignUpParams) {
    try {
      const userAttributes: Record<string, string> = {
        email,
        'custom:subscription_plan': 'free',
        'custom:subscription_status': 'active',
      };

      // Add optional attributes if provided
      if (name) userAttributes.name = name;
      if (phone) userAttributes.phone_number = phone;
      if (company) userAttributes['custom:company'] = company;
      if (address) userAttributes.address = address;
      if (city) userAttributes['custom:city'] = city;
      if (country) userAttributes['custom:country'] = country;

      const result = await signUp({
        username,
        password,
        options: {
          userAttributes,
        },
      });
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Confirm sign up with verification code
  async confirmSignUp({ username, code }: ConfirmSignUpParams) {
    try {
      return await confirmSignUp({ username, confirmationCode: code });
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  }

  // Sign in user
  async signIn({ username, password }: SignInParams) {
    try {
      // First, try to check if there's already a signed-in user
      try {
        const existingUser = await getCurrentUser();
        if (existingUser) {
          console.log('Found existing signed-in user, signing out first...');
          await signOut();
        }
      } catch (error) {
        // No existing user, which is fine
        console.log('No existing user found, proceeding with sign-in');
      }

      const result = await signIn({ username, password });
      return result;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Handle the "already signed in" error specifically
      if (error.name === 'AlreadyAuthenticatedException' || 
          error.message?.includes('already signed in') ||
          error.message?.includes('already a signed in user')) {
        console.log('User already signed in, clearing session and retrying...');
        try {
          await signOut();
          // Retry the sign-in after clearing the session
          const result = await signIn({ username, password });
          return result;
        } catch (retryError) {
          console.error('Error on sign-in retry:', retryError);
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Clear all cached authentication data
  async clearAuthCache(): Promise<void> {
    try {
      // Sign out to clear Amplify cache
      await signOut();
      
      // Clear localStorage items that might contain auth data
      localStorage.removeItem('amplify-auth-session');
      localStorage.removeItem('amplify-last-auth-user');
      localStorage.removeItem('amplify-cognito-identity-id');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('amplify-auth-session');
      sessionStorage.removeItem('amplify-last-auth-user');
      
      console.log('Authentication cache cleared successfully');
    } catch (error) {
      console.log('Note: Error during cache clear (this is often normal):', error);
      // Don't throw here as we want to clear cache even if sign out fails
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Add retry logic for getCurrentUser
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const user = await getCurrentUser();
          const attributes = await fetchUserAttributes();
          
          // Validate that we have essential user data
          if (!user.username || !attributes.email) {
            throw new Error('Essential user data missing');
          }
          
          const authUser: AuthUser = {
            username: user.username,
            email: attributes.email || '',
            email_verified: attributes.email_verified === 'true',
            sub: attributes.sub || '',
            name: attributes.name || attributes.given_name || attributes.email.split('@')[0],
            given_name: attributes.given_name,
            family_name: attributes.family_name,
            phone_number: attributes.phone_number,
            address: attributes.address,
            'custom:subscription_plan': (attributes['custom:subscription_plan'] as 'free' | 'premium' | 'enterprise') || 'free',
            'custom:subscription_status': (attributes['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
            'custom:subscription_expires': attributes['custom:subscription_expires'],
            'custom:stripe_customer_id': attributes['custom:stripe_customer_id'],
            'custom:company': attributes['custom:company'],
            'custom:city': attributes['custom:city'],
            'custom:country': attributes['custom:country']
          };
          
          console.log('✅ Successfully retrieved user data:', authUser);
          return authUser;
        } catch (attemptError) {
          attempts++;
          console.warn(`Attempt ${attempts} failed to get user data:`, attemptError);
          
          if (attempts < maxAttempts) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          } else {
            throw attemptError;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user after all attempts:', error);
      
      // If we can't get user data but there's a session, return minimal user data
      try {
        const user = await getCurrentUser();
        if (user?.username) {
          console.log('⚠️ Returning minimal user data as fallback');
          return {
            username: user.username,
            email: user.username, // Use username as email fallback
            email_verified: false,
            sub: user.userId || 'unknown',
            name: user.username.split('@')[0],
            'custom:subscription_plan': 'free',
            'custom:subscription_status': 'active'
          };
        }
      } catch (fallbackError) {
        console.error('Fallback user retrieval also failed:', fallbackError);
      }
      
      return null;
    }
  }

  // Get user attributes
  async getUserAttributes() {
    try {
      return await fetchUserAttributes();
    } catch (error) {
      console.error('Error getting user attributes:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Get access token
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Forgot password
  async forgotPassword(username: string) {
    try {
      return await resetPassword({ username });
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  }

  // Reset password with code
  async forgotPasswordSubmit({ username, code, newPassword }: ResetPasswordParams) {
    try {
      return await confirmResetPassword({ 
        username, 
        confirmationCode: code, 
        newPassword 
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Resend confirmation code
  async resendSignUp(username: string) {
    try {
      return await resendSignUpCode({ username });
    } catch (error) {
      console.error('Error resending sign up code:', error);
      throw error;
    }
  }

  // Update user attributes
  async updateUserAttributes(attributes: Record<string, string>) {
    try {
      return await updateUserAttributes({ userAttributes: attributes });
    } catch (error) {
      console.error('Error updating user attributes:', error);
      throw error;
    }
  }

  // Update user profile with comprehensive information
  async updateUserProfile(profileData: {
    name?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
  }) {
    try {
      const attributes: Record<string, string> = {};
      
      // Map profile data to Cognito attributes
      if (profileData.name) attributes.name = profileData.name;
      if (profileData.phone) attributes.phone_number = profileData.phone;
      if (profileData.company) attributes['custom:company'] = profileData.company;
      if (profileData.address) attributes.address = profileData.address;
      if (profileData.city) attributes['custom:city'] = profileData.city;
      if (profileData.country) attributes['custom:country'] = profileData.country;

      return await this.updateUserAttributes(attributes);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string) {
    try {
      return await updatePassword({ oldPassword, newPassword });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Subscription Management Methods
  async updateSubscriptionPlan(plan: 'free' | 'premium' | 'enterprise', stripeCustomerId?: string) {
    try {
      const attributes: Record<string, string> = {
        'custom:subscription_plan': plan,
        'custom:subscription_status': 'active'
      };
      
      if (stripeCustomerId) {
        attributes['custom:stripe_customer_id'] = stripeCustomerId;
      }
      
      // Set expiry date (1 month for premium, 1 year for enterprise)
      const expiryDate = new Date();
      if (plan === 'premium') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan === 'enterprise') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      
      if (plan !== 'free') {
        attributes['custom:subscription_expires'] = expiryDate.toISOString();
      }
      
      return await this.updateUserAttributes(attributes);
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  }

  async cancelSubscription() {
    try {
      return await this.updateUserAttributes({
        'custom:subscription_status': 'cancelled'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async checkSubscriptionStatus(): Promise<{
    plan: string;
    status: string;
    expires?: Date;
    isActive: boolean;
  }> {
    try {
      const attributes = await fetchUserAttributes();
      const plan = attributes['custom:subscription_plan'] || 'free';
      const status = attributes['custom:subscription_status'] || 'active';
      const expiresStr = attributes['custom:subscription_expires'];
      
      const expires = expiresStr ? new Date(expiresStr) : undefined;
      const isActive = status === 'active' && (!expires || expires > new Date());
      
      return {
        plan,
        status,
        expires,
        isActive
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        plan: 'free',
        status: 'active',
        isActive: true
      };
    }
  }
}

export const authService = new AuthService();
