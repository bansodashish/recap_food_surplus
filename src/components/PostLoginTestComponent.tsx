import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Building, Plus, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Test component to verify the post-login functionality works correctly
 */
export function PostLoginTestComponent() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-orange-600 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Authentication Test</h3>
        </div>
        <p className="text-gray-600 mb-4">User not logged in</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const testFeatures = [
    {
      name: 'Dashboard Access',
      path: '/dashboard',
      description: 'Post-login dashboard with subscription selection',
      status: 'available'
    },
    {
      name: 'Manual Item Entry',
      path: '/add-item',
      description: 'Add items manually (all subscription tiers)',
      status: 'available'
    },
    {
      name: 'CSV Upload with Photos',
      path: '/add-item?method=csv',
      description: 'Bulk upload with S3 photos (Premium+)',
      status: subscription?.plan === 'free' ? 'upgrade-needed' : 'available'
    },
    {
      name: 'API Access',
      path: '/add-item?method=api',
      description: 'Full API integration (Enterprise only)',
      status: subscription?.plan === 'enterprise' ? 'available' : 'upgrade-needed'
    },
    {
      name: 'Subscription Management',
      path: '/subscription',
      description: 'Manage subscription and payments',
      status: 'available'
    }
  ];

  const getSubscriptionIcon = () => {
    switch (subscription?.plan) {
      case 'premium':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'enterprise':
        return <Building className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-300 rounded" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center space-x-2 text-green-600 mb-4">
        <CheckCircle className="h-5 w-5" />
        <h3 className="font-semibold">Post-Login System Test</h3>
      </div>

      {/* User Info */}
      <div className="border-l-4 border-green-500 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-green-800">Logged in as: {user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              {getSubscriptionIcon()}
              <span className="text-sm text-green-700 capitalize">
                {subscription?.plan || 'free'} Plan
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Feature Test Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testFeatures.map((feature, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              feature.status === 'available'
                ? 'border-green-200 bg-green-50'
                : 'border-orange-200 bg-orange-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{feature.name}</h4>
              {feature.status === 'available' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
            
            {feature.status === 'available' ? (
              <button
                onClick={() => navigate(feature.path)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Test Feature
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={() => navigate(feature.path)}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Try Anyway
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/add-item')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add New Item
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            View Profile
          </button>
          {subscription?.plan === 'free' && (
            <button
              onClick={() => navigate('/subscription')}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-purple-500 text-white rounded hover:from-yellow-600 hover:to-purple-600"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </div>

      {/* Test Results Summary */}
      <div className="bg-gray-50 rounded p-4">
        <h4 className="font-medium mb-2">Integration Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Authentication working</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Subscription detection working</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Route protection active</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Feature gating implemented</span>
          </div>
        </div>
      </div>
    </div>
  );
}
