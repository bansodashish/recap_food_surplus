import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Building, Users } from 'lucide-react';

export function SubscriptionPage() {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for small-scale surplus getting started',
      features: [
        'Up to 5 active listings',
        'Basic search visibility',
        'Standard messaging',
        'Community access',
        'Basic sustainability tracking',
        'Limited to 5 listings per month',
        'Standard search ranking',
        'No analytics dashboard',
        'No priority support'
      ],
      activeFeatures: [
        'Up to 5 active listings',
        'Basic search visibility',
        'Standard messaging',
        'Community access',
        'Basic sustainability tracking'
      ],
      limitedFeatures: [
        'Limited to 5 listings per month',
        'Standard search ranking',
        'No analytics dashboard',
        'No priority support'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false,
      planId: 'free' as const,
      icon: Users
    },
    {
      name: 'Premium',
      price: { monthly: 49, yearly: 490 }, // £49/month, £490/year (2 months free)
      description: 'For growing businesses with regular inventory',
      features: [
        'Unlimited listings',
        'Enhanced search visibility',
        'Priority messaging',
        'Advanced analytics dashboard',
        'Sustainability insights & reporting',
        'Featured listing badges',
        'Email support',
        'Commission-free transactions*'
      ],
      activeFeatures: [
        'Unlimited listings',
        'Enhanced search visibility',
        'Priority messaging',
        'Advanced analytics dashboard',
        'Sustainability insights & reporting',
        'Featured listing badges',
        'Email support',
        'Commission-free transactions*'
      ],
      limitedFeatures: [],
      buttonText: 'Start Premium Trial',
      buttonVariant: 'primary' as const,
      popular: true,
      planId: 'premium' as const,
      icon: Crown
    },
    {
      name: 'Enterprise',
      price: { monthly: 199, yearly: 1990 }, // £199/month, £1990/year
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Premium',
        'API access & integrations',
        'Enhanced branding options',
        'Custom account manager',
        'Dedicated account manager',
        'Priority customer support',
        'Advanced KYC verification',
        'Custom reporting & analytics',
        'White label solutions',
        'Bulk listing management',
        'Advanced security features'
      ],
      activeFeatures: [
        'Everything in Premium',
        'API access & integrations',
        'Enhanced branding options',
        'Custom account manager',
        'Dedicated account manager',
        'Priority customer support',
        'Advanced KYC verification',
        'Custom reporting & analytics',
        'White label solutions',
        'Bulk listing management',
        'Advanced security features'
      ],
      limitedFeatures: [],
      buttonText: 'Contact Sales',
      buttonVariant: 'secondary' as const,
      popular: false,
      planId: 'enterprise' as const,
      icon: Building
    }
  ];

  const handleSelectPlan = async (planId: 'free' | 'premium' | 'enterprise') => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planId === user.subscriptionPlan) {
      return;
    }

    setIsLoading(true);
    try {
      if (planId === 'enterprise') {
        // Handle enterprise contact sales
        window.open('mailto:sales@recapfood.com?subject=Enterprise Plan Inquiry', '_blank');
        return;
      }

      if (planId === 'premium') {
        // In real implementation, this would integrate with Stripe
        console.log('Redirecting to Stripe payment...');
        // For now, just update the subscription
        await updateSubscription(planId);
      } else {
        await updateSubscription(planId);
      }
      
      navigate('/profile');
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Scale your surplus inventory management with plans designed for businesses of all sizes
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const price = plan.price[billingCycle];
            const isCurrentPlan = user?.subscriptionPlan === plan.planId;
            
            return (
              <div
                key={plan.planId}
                className={`bg-white rounded-2xl shadow-sm border-2 p-8 relative ${
                  plan.popular 
                    ? 'border-primary-500 ring-2 ring-primary-100' 
                    : 'border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-green-200 border-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">Free</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">£{price}</span>
                        <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.activeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitedFeatures.map((feature, index) => (
                    <div key={`limited-${index}`} className="flex items-start opacity-60">
                      <div className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-3 h-3 border border-gray-400 rounded-sm" />
                      </div>
                      <span className="text-gray-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSelectPlan(plan.planId)}
                  disabled={isLoading || isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : plan.buttonVariant === 'secondary'
                      ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                      : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                  } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Transaction Fees Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Future Transaction Fees</h3>
          <p className="text-blue-800 text-sm">
            Currently, all transactions are commission-free as we're in beta. In future phases, when payment and logistics integration is enabled, small commission fees may apply to help 
            maintain platform quality and security. Premium subscribers will continue to enjoy reduced fees.
          </p>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
            <p className="text-gray-600">Compare all features across our pricing tiers</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Features</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Free</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Premium</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Active Listings</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">5</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Search Visibility</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Basic</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Enhanced</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Priority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Analytics Dashboard</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Basic</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓ Full Access</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓ Custom Reports</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Sustainability Insights</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Basic</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓ Full Access</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓ Custom Reports</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">API Access</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Priority Support</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Email</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Dedicated Manager</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Branding</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✗</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
