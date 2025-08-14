import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Heart, 
  TrendingUp, 
  Star,
  MapPin,
  Calendar,
  Eye,
  BarChart3,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  type: 'SALE' | 'DONATION' | 'REQUEST';
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
  location: string;
  expiryDate: string;
  views: number;
  price?: string;
}

interface UserStats {
  activeListings: number;
  donationsMade: number;
  itemsSold: number;
  rating: number;
  sustainabilityScore: number;
}

export const PostLoginDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [userStats] = useState<UserStats>({
    activeListings: 12,
    donationsMade: 4,
    itemsSold: 0,
    rating: 4.8,
    sustainabilityScore: 85
  });

  // Mock data for recent listings - in a real app, this would come from an API
  const [recentListings] = useState<Listing[]>([
    {
      id: '1',
      title: 'Premium Yogurt Varieties',
      type: 'SALE',
      status: 'ACTIVE',
      location: 'Bristol',
      expiryDate: '2025-01-21',
      views: 16,
      price: '1.45'
    },
    {
      id: '2',
      title: 'Frozen Berry Mix',
      type: 'DONATION',
      status: 'ACTIVE',
      location: 'Glasgow',
      expiryDate: '2025-03-15',
      views: 64
    },
    {
      id: '3',
      title: 'Fresh Herb Collection',
      type: 'SALE',
      status: 'ACTIVE',
      location: 'Canterbury',
      expiryDate: '2025-01-19',
      views: 84,
      price: '8.50'
    },
    {
      id: '4',
      title: 'Pastries & Desserts',
      type: 'SALE',
      status: 'ACTIVE',
      location: 'Oxford',
      expiryDate: '2025-01-15',
      views: 65,
      price: '2.95'
    },
    {
      id: '5',
      title: 'Organic Free-Range Chicken',
      type: 'DONATION',
      status: 'ACTIVE',
      location: 'Manchester',
      expiryDate: '2025-01-18',
      views: 42
    }
  ]);

  useEffect(() => {
    // In a real app, fetch user stats and listings from API
    // fetchUserStats();
    // fetchRecentListings();
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SALE':
        return 'bg-blue-100 text-blue-800';
      case 'DONATION':
        return 'bg-green-100 text-green-800';
      case 'REQUEST':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = ['Overview', 'My Listings', 'My Requests', 'Messages', 'Impact Metrics'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your listings and track your sustainability impact</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.activeListings}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Donations Made</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.donationsMade}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Sold</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.itemsSold}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.rating}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* Recent Listings */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <span className="text-xl font-bold text-green-600">{userStats.sustainabilityScore}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Sustainability Score</p>
                      <div className="flex items-center">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Gold</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
                              {listing.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                              {listing.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Expires: {listing.expiryDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{listing.views} views</span>
                            </div>
                          </div>
                        </div>
                        {listing.price && (
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">£{listing.price}</p>
                          </div>
                        )}
                        {listing.type === 'DONATION' && !listing.price && (
                          <div className="text-right">
                            <p className="text-sm text-green-600 font-medium">FREE</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/add-item')}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Add New Listing</span>
                    </button>
                    <button
                      onClick={() => navigate('/request')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Request Item</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('Impact Metrics')}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Activity className="h-5 w-5" />
                      <span>View ESG Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'My Listings' && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Your listings will appear here</p>
                <button
                  onClick={() => navigate('/add-item')}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Your First Listing
                </button>
              </div>
            )}

            {activeTab === 'My Requests' && (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Your requests will appear here</p>
                <button
                  onClick={() => navigate('/request')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Make Your First Request
                </button>
              </div>
            )}

            {activeTab === 'Messages' && (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Messages will appear here</p>
              </div>
            )}

            {activeTab === 'Impact Metrics' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-100 mb-4">
                    <span className="text-4xl font-bold text-green-600">{userStats.sustainabilityScore}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Sustainability Score</h3>
                  <div className="flex items-center justify-center mt-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Gold Level</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Environmental Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CO₂ Saved</span>
                        <span className="text-sm font-medium">45.2 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Waste Reduced</span>
                        <span className="text-sm font-medium">28.7 kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Water Saved</span>
                        <span className="text-sm font-medium">156 L</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Community Impact</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">People Helped</span>
                        <span className="text-sm font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Value Shared</span>
                        <span className="text-sm font-medium">£342</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Community Rating</span>
                        <span className="text-sm font-medium">4.8/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
