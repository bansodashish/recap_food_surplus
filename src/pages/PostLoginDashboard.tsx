import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Upload, 
  Zap, 
  Crown, 
  Users, 
  Building, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const PostLoginDashboard: React.FC = () => {
  const { user, updateSubscription } = useAuth();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'enterprise'>('free');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if this is a new user who hasn't selected a subscription yet
    if (user && !user.subscriptionPlan) {
      setIsNewUser(true);
      setShowSubscriptionModal(true);
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      icon: Users,
      features: [
        'Up to 5 active listings',
        'Basic search visibility',
        'Standard messaging',
        'Community access',
        'Basic sustainability tracking'
      ],
      limitations: [
        'Limited to 5 items total',
        'No CSV upload',
        'No API access'
      ],
      buttonText: 'Stay Free',
      color: 'gray'
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: 49,
      description: 'For growing businesses',
      icon: Crown,
      features: [
        'Unlimited listings',
        'Enhanced search visibility',
        'Priority messaging',
        'Advanced analytics',
        'CSV upload with photos',
        'Priority support'
      ],
      limitations: [
        'No API access'
      ],
      buttonText: 'Go Premium',
      color: 'yellow',
      popular: true
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations',
      icon: Building,
      features: [
        'Everything in Premium',
        'Full API access',
        'Custom integrations',
        'Dedicated account manager',
        'Custom reporting',
        'White label solutions'
      ],
      limitations: [],
      buttonText: 'Go Enterprise',
      color: 'purple'
    }
  ];

  const handlePlanSelect = async (planId: 'free' | 'premium' | 'enterprise') => {
    if (planId === 'free') {
      try {
        await updateSubscription(planId);
        setShowSubscriptionModal(false);
        // Redirect to add items
        navigate('/add-item');
      } catch (error) {
        console.error('Error updating subscription:', error);
      }
    } else {
      // For paid plans, redirect to subscription page for payment
      navigate('/subscription');
    }
  };

  const getAddItemButtonContent = () => {
    const limits = {
      free: { maxItems: 5, canUploadCSV: false, hasAPIAccess: false },
      premium: { maxItems: -1, canUploadCSV: true, hasAPIAccess: false },
      enterprise: { maxItems: -1, canUploadCSV: true, hasAPIAccess: true }
    }[user.subscriptionPlan || 'free'];

    return {
      title: user.subscriptionPlan === 'free' ? 'Add Items (5 max)' : 'Add Unlimited Items',
      methods: [
        {
          id: 'manual',
          name: 'Manual Entry',
          description: 'Add items one by one with detailed information',
          icon: PlusCircle,
          available: true,
          badge: null
        },
        {
          id: 'csv',
          name: 'CSV Upload + Photos',
          description: 'Bulk upload items with CSV file and photos to S3',
          icon: Upload,
          available: limits.canUploadCSV,
          badge: limits.canUploadCSV ? null : 'Premium+'
        },
        {
          id: 'api',
          name: 'API Integration',
          description: 'Integrate with your existing systems via REST API',
          icon: Zap,
          available: limits.hasAPIAccess,
          badge: limits.hasAPIAccess ? null : 'Enterprise Only'
        }
      ]
    };
  };

  const addItemContent = getAddItemButtonContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Current Plan: <span className="font-semibold capitalize">{user.subscriptionPlan}</span>
                {user.subscriptionPlan === 'free' && (
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upgrade →
                  </button>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/my-items')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                My Items
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <PlusCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold/Donated</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Environmental Impact</p>
                <p className="text-2xl font-bold text-gray-900">0 kg</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Add Items Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{addItemContent.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addItemContent.methods.map((method) => {
              const IconComponent = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => method.available ? navigate('/add-item', { state: { method: method.id } }) : setShowSubscriptionModal(true)}
                  disabled={!method.available}
                  className={`
                    relative p-6 border-2 rounded-lg text-left transition-all
                    ${method.available 
                      ? 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-75'
                    }
                  `}
                >
                  {method.badge && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      {method.badge}
                    </span>
                  )}
                  <IconComponent className={`h-8 w-8 mb-3 ${method.available ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="font-medium text-gray-900 mb-2">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  {!method.available && (
                    <div className="mt-3 flex items-center text-xs text-yellow-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Upgrade required
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8">
            <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activity yet. Start by adding your first item!</p>
            <button
              onClick={() => navigate('/add-item')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Item
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Selection Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {isNewUser ? 'Choose Your Plan' : 'Upgrade Your Account'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isNewUser 
                  ? 'Select a plan that fits your food surplus management needs'
                  : 'Unlock more features with a premium plan'
                }
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const IconComponent = plan.icon;
                  return (
                    <div
                      key={plan.id}
                      className={`
                        relative border-2 rounded-lg p-6 cursor-pointer transition-all
                        ${selectedPlan === plan.id 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                        ${plan.popular ? 'ring-2 ring-yellow-200' : ''}
                      `}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-full">
                          POPULAR
                        </span>
                      )}
                      
                      <div className="text-center mb-4">
                        <IconComponent className="h-12 w-12 mx-auto mb-2 text-gray-600" />
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">£{plan.price}</span>
                          {plan.price > 0 && <span className="text-gray-600">/month</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-green-700 mb-2">Included:</h4>
                          <ul className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {plan.limitations.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Limitations:</h4>
                            <ul className="space-y-1">
                              {plan.limitations.map((limitation, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                                  {limitation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              {!isNewUser && (
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
              <div className="flex space-x-3 ml-auto">
                <button
                  onClick={() => handlePlanSelect(selectedPlan)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {selectedPlan === 'free' ? 'Continue with Free' : `Select ${plans.find(p => p.id === selectedPlan)?.name}`}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
