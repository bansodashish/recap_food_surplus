import React, { createContext, useContext, useEffect, useState } from 'react';

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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
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
      // In real implementation, this would check with AWS Cognito
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock implementation - replace with AWS Cognito
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Mock implementation - replace with AWS Cognito
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        createdAt: new Date(),
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionPlan: plan,
        subscriptionStatus: 'active' as const,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
    canListItems,
    canAccessFeature,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
