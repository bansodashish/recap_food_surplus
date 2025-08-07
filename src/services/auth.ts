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
  // Subscription-related attributes
  'custom:subscription_plan'?: 'free' | 'premium' | 'enterprise';
  'custom:subscription_status'?: 'active' | 'cancelled' | 'past_due';
  'custom:subscription_expires'?: string;
  'custom:stripe_customer_id'?: string;
}

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  name?: string;
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
  // Sign up a new user
  async signUp({ username, password, email, name }: SignUpParams) {
    try {
      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            ...(name && { name }),
          },
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
      const result = await signIn({ username, password });
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
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

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const authUser: AuthUser = {
        username: user.username,
        email: attributes.email || '',
        email_verified: attributes.email_verified === 'true',
        sub: attributes.sub || '',
        name: attributes.name,
        given_name: attributes.given_name,
        family_name: attributes.family_name,
        'custom:subscription_plan': (attributes['custom:subscription_plan'] as 'free' | 'premium' | 'enterprise') || 'free',
        'custom:subscription_status': (attributes['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
        'custom:subscription_expires': attributes['custom:subscription_expires'],
        'custom:stripe_customer_id': attributes['custom:stripe_customer_id']
      };
      
      return authUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
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
