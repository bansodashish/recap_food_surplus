import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due';
  subscriptionExpiry?: Date;
  createdAt: Date;
  avatar?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, profileData?: { phone?: string; company?: string; address?: string; city?: string; country?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  updateProfile: (profileData: { name?: string; phone?: string; company?: string; address?: string; city?: string; country?: string }) => Promise<void>;
  canListItems: () => boolean;
  getItemListingLimits: () => { maxItems: number; canUploadCSV: boolean; hasAPIAccess: boolean };
  canAccessFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check with AWS Cognito for current user
      const cognitoUser = await authService.getCurrentUser();
      console.log('🔍 Cognito user data:', cognitoUser);
      if (cognitoUser) {
        const user: User = {
          id: cognitoUser.sub,
          email: cognitoUser.email,
          name: cognitoUser.name || cognitoUser.given_name || cognitoUser.email.split('@')[0],
          subscriptionPlan: cognitoUser['custom:subscription_plan'] || 'free',
          subscriptionStatus: (cognitoUser['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
          subscriptionExpiry: cognitoUser['custom:subscription_expires'] 
            ? new Date(cognitoUser['custom:subscription_expires'])
            : undefined,
          createdAt: new Date(),
          phone: cognitoUser.phone_number,
          company: cognitoUser['custom:company'],
          address: cognitoUser.address,
          city: cognitoUser['custom:city'],
          country: cognitoUser['custom:country'],
        };
        console.log('👤 Setting user state:', user);
        setUser(user);
      } else {
        console.log('❌ No authenticated user found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting sign in process...');
      
      // Step 1: Use AWS Cognito for authentication
      await authService.signIn({ username: email, password });
      console.log('✅ Authentication successful');
      
      // Step 2: Get the authenticated user data with retry logic
      let cognitoUser = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !cognitoUser) {
        try {
          cognitoUser = await authService.getCurrentUser();
          if (cognitoUser) break;
        } catch (error) {
          console.warn(`User data attempt ${attempts + 1} failed:`, error);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Retrying user data retrieval (attempt ${attempts + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      if (cognitoUser) {
        const user: User = {
          id: cognitoUser.sub,
          email: cognitoUser.email,
          name: cognitoUser.name || cognitoUser.given_name || cognitoUser.email.split('@')[0],
          subscriptionPlan: cognitoUser['custom:subscription_plan'] || 'free',
          subscriptionStatus: (cognitoUser['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
          subscriptionExpiry: cognitoUser['custom:subscription_expires'] 
            ? new Date(cognitoUser['custom:subscription_expires'])
            : undefined,
          createdAt: new Date(),
          phone: cognitoUser.phone_number,
          company: cognitoUser['custom:company'],
          address: cognitoUser.address,
          city: cognitoUser['custom:city'],
          country: cognitoUser['custom:country'],
        };
        console.log('👤 Setting user state after sign in:', user);
        setUser(user);
        
        // Small delay to ensure state has propagated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsLoading(false);
      } else {
        console.warn('⚠️ Could not retrieve user data, creating minimal user profile');
        
        // Create a minimal user profile as fallback
        const fallbackUser: User = {
          id: 'temp-' + Date.now(),
          email: email,
          name: email.split('@')[0],
          subscriptionPlan: 'free',
          subscriptionStatus: 'active',
          createdAt: new Date(),
        };
        
        setUser(fallbackUser);
        setIsLoading(false);
        
        // Try to get full user data in background
        setTimeout(async () => {
          try {
            const retryUser = await authService.getCurrentUser();
            if (retryUser) {
              const fullUser: User = {
                id: retryUser.sub,
                email: retryUser.email,
                name: retryUser.name || retryUser.given_name || retryUser.email.split('@')[0],
                subscriptionPlan: retryUser['custom:subscription_plan'] || 'free',
                subscriptionStatus: (retryUser['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
                subscriptionExpiry: retryUser['custom:subscription_expires'] 
                  ? new Date(retryUser['custom:subscription_expires'])
                  : undefined,
                createdAt: new Date(),
                phone: retryUser.phone_number,
                company: retryUser['custom:company'],
                address: retryUser.address,
                city: retryUser['custom:city'],
                country: retryUser['custom:country'],
              };
              console.log('✅ Updated user data from background retry:', fullUser);
              setUser(fullUser);
            }
          } catch (backgroundError) {
            console.warn('Background user data update failed:', backgroundError);
          }
        }, 3000);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('Sign in error:', error);
      
      // Handle specific error cases with more user-friendly messages
      if (error.name === 'AlreadyAuthenticatedException' || 
          error.message?.includes('already signed in') ||
          error.message?.includes('already a signed in user')) {
        // Try to clear cache and retry
        try {
          await authService.clearAuthCache();
          // Retry the sign in
          await authService.signIn({ username: email, password });
          const cognitoUser = await authService.getCurrentUser();
          if (cognitoUser) {
            const user: User = {
              id: cognitoUser.sub,
              email: cognitoUser.email,
              name: cognitoUser.name || cognitoUser.given_name || cognitoUser.email.split('@')[0],
              subscriptionPlan: cognitoUser['custom:subscription_plan'] || 'free',
              subscriptionStatus: (cognitoUser['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
              subscriptionExpiry: cognitoUser['custom:subscription_expires'] 
                ? new Date(cognitoUser['custom:subscription_expires'])
                : undefined,
              createdAt: new Date(),
              phone: cognitoUser.phone_number,
              company: cognitoUser['custom:company'],
              address: cognitoUser.address,
              city: cognitoUser['custom:city'],
              country: cognitoUser['custom:country'],
            };
            setUser(user);
            return; // Success after retry
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          throw new Error('Please refresh the page and try again. If the problem persists, clear your browser cache.');
        }
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please confirm your email address before signing in.');
      } else if (error.name === 'UserNotFoundException') {
        throw new Error('User not found. Please check your email or sign up for a new account.');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password. Please try again.');
      } else {
        throw new Error(error.message || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, profileData?: { phone?: string; company?: string; address?: string; city?: string; country?: string }) => {
    setIsLoading(true);
    try {
      console.log('🔄 AuthContext: Starting signup process...', { email, name });
      
      // Use AWS Cognito for user registration - Basic version without custom attributes
      await authService.signUp({
        username: email,
        password,
        email,
        name,
        phone: profileData?.phone,
        address: profileData?.address
      });
      
      console.log('✅ AuthContext: Signup successful');
      // After successful signup, the user needs to verify their email
      // The actual sign-in will happen after email verification
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up error:', {
        message: error.message,
        name: error.name,
        originalError: error.originalError
      });
      
      // Pass through the detailed error message from auth service
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null); // Still clear the user state locally
    }
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    if (user) {
      try {
        await authService.updateSubscriptionPlan(plan);
        
        // Refresh user data from Cognito
        const updatedCognitoUser = await authService.getCurrentUser();
        if (updatedCognitoUser) {
          const updatedUser: User = {
            ...user,
            subscriptionPlan: updatedCognitoUser['custom:subscription_plan'] || plan,
            subscriptionStatus: (updatedCognitoUser['custom:subscription_status'] as 'active' | 'cancelled' | 'past_due') || 'active',
            subscriptionExpiry: updatedCognitoUser['custom:subscription_expires'] 
              ? new Date(updatedCognitoUser['custom:subscription_expires'])
              : undefined,
          };
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }
    }
  };

  const updateProfile = async (profileData: { name?: string; phone?: string; company?: string; address?: string; city?: string; country?: string }) => {
    if (user) {
      try {
        await authService.updateUserProfile(profileData);
        
        // Refresh user data from Cognito
        const updatedCognitoUser = await authService.getCurrentUser();
        if (updatedCognitoUser) {
          const updatedUser: User = {
            ...user,
            name: updatedCognitoUser.name || updatedCognitoUser.given_name || user.name,
            phone: updatedCognitoUser.phone_number,
            company: updatedCognitoUser['custom:company'],
            address: updatedCognitoUser.address,
            city: updatedCognitoUser['custom:city'],
            country: updatedCognitoUser['custom:country'],
          };
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    }
  };

  const canListItems = () => {
    // All users can list items, but free users have limits
    return !!user;
  };

    const getItemListingLimits = () => {
    if (!user) return { maxItems: 0, canUploadCSV: false, hasAPIAccess: false };
    
    const limits = {
      free: { maxItems: 5, canUploadCSV: true, hasAPIAccess: false }, // Temporarily enabled for testing
      premium: { maxItems: -1, canUploadCSV: true, hasAPIAccess: false }, // -1 means unlimited
      enterprise: { maxItems: -1, canUploadCSV: true, hasAPIAccess: true } // -1 means unlimited
    }[user.subscriptionPlan || 'free'];

    return limits;
  };

  const canAccessFeature = (feature: string) => {
    if (!user) return false;
    
    const { subscriptionPlan } = user;
    
    const features = {
      free: ['browse', 'request'],
      premium: ['browse', 'request', 'list_items', 'basic_analytics', 'priority_messaging'],
      enterprise: ['browse', 'request', 'list_items', 'advanced_analytics', 'priority_support', 'api_access', 'custom_branding']
    };
    
    return features[subscriptionPlan]?.includes(feature) || false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateSubscription,
    updateProfile,
    canListItems,
    getItemListingLimits,
    canAccessFeature,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
