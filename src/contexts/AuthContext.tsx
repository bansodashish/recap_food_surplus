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
      // Use AWS Cognito for authentication
      await authService.signIn({ username: email, password });
      
      // Get the authenticated user data
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
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, profileData?: { phone?: string; company?: string; address?: string; city?: string; country?: string }) => {
    setIsLoading(true);
    try {
      // Use AWS Cognito for user registration
      await authService.signUp({
        username: email,
        password,
        email,
        name,
        phone: profileData?.phone,
        company: profileData?.company,
        address: profileData?.address,
        city: profileData?.city,
        country: profileData?.country
      });
      
      // After successful signup, the user needs to verify their email
      // The actual sign-in will happen after email verification
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to create account');
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
    return user?.subscriptionPlan === 'premium' || user?.subscriptionPlan === 'enterprise';
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
    canAccessFeature,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
