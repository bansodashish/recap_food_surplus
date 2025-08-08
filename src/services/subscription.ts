import { loadStripe } from '@stripe/stripe-js';
import { authService } from './auth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';

export interface SubscriptionPricing {
  plan: SubscriptionPlan;
  monthly: number;
  yearly: number;
  stripePriceMonthly?: string;
  stripePriceYearly?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPricing[] = [
  {
    plan: 'free',
    monthly: 0,
    yearly: 0,
  },
  {
    plan: 'premium',
    monthly: 49,
    yearly: 490, // 2 months free
    stripePriceMonthly: 'price_premium_monthly', // Replace with your Stripe price IDs
    stripePriceYearly: 'price_premium_yearly',
  },
  {
    plan: 'enterprise',
    monthly: 199,
    yearly: 1990, // 2 months free
    stripePriceMonthly: 'price_enterprise_monthly',
    stripePriceYearly: 'price_enterprise_yearly',
  },
];

class SubscriptionService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Create Stripe checkout session
  async createCheckoutSession(
    planId: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly',
    userId: string
  ) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.plan === planId);
    if (!plan || planId === 'free') {
      throw new Error('Invalid plan selected');
    }

    const priceId = billingCycle === 'monthly' 
      ? plan.stripePriceMonthly 
      : plan.stripePriceYearly;

    if (!priceId) {
      throw new Error('Price ID not configured for this plan');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getAccessToken()}`,
        },
        body: JSON.stringify({
          priceId,
          userId,
          planId,
          billingCycle,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create customer portal session (for managing subscription)
  async createCustomerPortalSession(userId: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getAccessToken()}`,
        },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/subscription`,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;

    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  // Get plan features and limits
  getPlanLimits(plan: SubscriptionPlan) {
    const limits = {
      free: {
        maxListings: 5,
        maxPhotosPerListing: 3,
        analytics: false,
        prioritySupport: false,
        bulkOperations: false,
        aiRecommendations: false,
      },
      premium: {
        maxListings: 50,
        maxPhotosPerListing: 10,
        analytics: true,
        prioritySupport: false,
        bulkOperations: true,
        aiRecommendations: true,
      },
      enterprise: {
        maxListings: -1, // Unlimited
        maxPhotosPerListing: 20,
        analytics: true,
        prioritySupport: true,
        bulkOperations: true,
        aiRecommendations: true,
      },
    };

    return limits[plan];
  }

  // Check if user can access feature
  canAccessFeature(userPlan: SubscriptionPlan, feature: string): boolean {
    const limits = this.getPlanLimits(userPlan);
    return limits[feature as keyof typeof limits] === true;
  }

  // Check if user has reached listing limit
  canCreateListing(userPlan: SubscriptionPlan, currentListings: number): boolean {
    const limits = this.getPlanLimits(userPlan);
    return limits.maxListings === -1 || currentListings < limits.maxListings;
  }

  // Get pricing for display
  getPlanPricing(plan: SubscriptionPlan) {
    return SUBSCRIPTION_PLANS.find(p => p.plan === plan);
  }

  // Handle successful payment and update Cognito
  async handlePaymentSuccess(sessionId: string, planId: SubscriptionPlan) {
    try {
      // Update user's subscription in Cognito
      await authService.updateSubscriptionPlan(planId);
      
      // Optionally store Stripe session/customer info
      const sessionData = await this.getCheckoutSession(sessionId);
      
      if (sessionData?.customer) {
        await authService.updateUserAttributes({
          'custom:stripe_customer_id': sessionData.customer as string,
          'custom:subscription_expires': this.calculateExpirationDate().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Get checkout session details
  async getCheckoutSession(sessionId: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/subscription/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await authService.getAccessToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw error;
    }
  }

  // Calculate subscription expiration date (1 year from now for yearly, 1 month for monthly)
  private calculateExpirationDate(billingCycle: 'monthly' | 'yearly' = 'yearly'): Date {
    const now = new Date();
    if (billingCycle === 'yearly') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  // Process subscription upgrade/downgrade
  async upgradeSubscription(newPlan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly' = 'yearly') {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (newPlan === 'free') {
        // Downgrade to free plan
        await authService.updateSubscriptionPlan('free');
        return { success: true };
      }

      // For premium/enterprise, redirect to Stripe checkout
      return await this.createCheckoutSession(newPlan, billingCycle, currentUser.sub);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      // Update subscription status in Cognito
      await authService.updateUserAttributes({
        'custom:subscription_status': 'cancelled'
      });

      // Optionally call Stripe API to cancel subscription
      // This would require backend API call
      const response = await fetch(`${this.apiBaseUrl}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await authService.getAccessToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
