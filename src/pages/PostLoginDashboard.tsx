import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { foodItemsService } from '../services/foodItems';
import type { FoodItem } from '../types/foodItem';
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

export const PostLoginDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'Overview');
  const [userItems, setUserItems] = useState<FoodItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Calculate dynamic user stats based on actual items
  const userStats = React.useMemo(() => {
    const activeListings = userItems.filter(item => item.status === 'available').length;
    const donationsMade = userItems.filter(item => item.type === 'donation' && item.status === 'completed').length;
    const itemsSold = userItems.filter(item => item.type === 'sale' && item.status === 'completed').length;
    const totalCO2Saved = userItems.reduce((total, item) => 
      total + (item.sustainabilityMetrics?.co2Saved || 0), 0
    );
    
    return {
      activeListings,
      donationsMade,
      itemsSold,
      rating: 4.8, // This would come from user reviews in real app
      sustainabilityScore: Math.min(100, Math.round(totalCO2Saved * 10)) // Scale CO2 to score
    };
  }, [userItems]);

  // Load user's food items and calculate stats
  useEffect(() => {
    const loadUserItems = async () => {
      if (!user) return;
      
      setLoadingItems(true);
      try {
        const items = await foodItemsService.getUserFoodItems(user.id);
        setUserItems(items);
        
        // Update user stats based on actual data
        const activeCount = items.filter(item => item.status === 'available').length;
        const donationCount = items.filter(item => item.type === 'donation').length;
        const saleCount = items.filter(item => item.type === 'sale' && item.status === 'completed').length;
        
        // Calculate total sustainability impact
        const totalCO2Saved = items.reduce((total, item) => 
          total + (item.sustainabilityMetrics?.co2Saved || 0), 0
        );
        
        console.log('📊 User stats calculated:', {
          activeListings: activeCount,
          donationsMade: donationCount,
          itemsSold: saleCount,
          totalCO2Saved: Math.round(totalCO2Saved * 100) / 100
        });
        
      } catch (error) {
        console.error('Error loading user items:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    loadUserItems();
  }, [user]);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams();
    if (tab !== 'Overview') {
      params.set('tab', tab);
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

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
                  onClick={() => handleTabChange(tab)}
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
                      onClick={() => navigate('/donate')}
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
                      onClick={() => handleTabChange('Impact Metrics')}
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
              <div>
                {loadingItems ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading your listings...</p>
                  </div>
                ) : userItems.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Your Food Listings</h3>
                      <button
                        onClick={() => navigate('/donate')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Add New Item
                      </button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {userItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                          {/* Image Gallery */}
                          {item.images && item.images.length > 0 && (
                            <div className="relative mb-4">
                              <img 
                                src={item.images[0]} 
                                alt={item.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              {item.images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                  +{item.images.length - 1} more
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Item Details */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                            </div>
                            
                            {/* Item Info Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-700">Category:</span>
                                <span className="text-gray-600 capitalize">{item.category}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-700">Type:</span>
                                <span className="text-gray-600 capitalize">{item.type}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-700">Quantity:</span>
                                <span className="text-gray-600">{item.quantity}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-700">Condition:</span>
                                <span className="text-gray-600 capitalize">{item.condition}</span>
                              </div>
                            </div>
                            
                            {/* Location and Dates */}
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{item.location.address || item.location.city}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">
                                  Expires: {item.expiryDate instanceof Date ? item.expiryDate.toLocaleDateString() : new Date(item.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">
                                  Created: {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status and Metrics */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'available' 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.status === 'reserved'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status.toUpperCase()}
                                </span>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Eye className="h-3 w-3" />
                                  <span>{item.viewCount || 0} views</span>
                                </div>
                              </div>
                              {item.sustainabilityMetrics && (
                                <div className="text-xs text-green-600 font-medium">
                                  CO₂: {item.sustainabilityMetrics.co2Saved}kg saved
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                              <button
                                onClick={() => navigate(`/my-items`)}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => {
                                  if (item.images && item.images.length > 0) {
                                    window.open(item.images[0], '_blank');
                                  }
                                }}
                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No listings yet</p>
                    <p className="text-sm text-gray-500 mb-4">Start by adding your first food item</p>
                    <button
                      onClick={() => navigate('/donate')}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Your First Listing
                    </button>
                  </div>
                )}
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
