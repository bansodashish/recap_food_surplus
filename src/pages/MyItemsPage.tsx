import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { foodItemsService } from '../services/foodItems';
import type { FoodItem } from '../types/foodItem';
import { FOOD_CATEGORIES } from '../types/foodItem';

const MyItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved' | 'completed'>('all');

  useEffect(() => {
    const loadUserItems = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const userItems = await foodItemsService.getUserFoodItems(user.sub);
        setItems(userItems);
      } catch (error) {
        console.error('Error loading user items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserItems();
  }, [navigate]);

  const handleStatusChange = async (itemId: string, status: FoodItem['status']) => {
    try {
      await foodItemsService.updateItemStatus(itemId, status);
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await foodItemsService.deleteFoodItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      alert('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getCategoryIcon = (category: string) => {
    const cat = FOOD_CATEGORIES.find(c => c.value === category);
    return cat?.icon || '📦';
  };

  const getStatusBadge = (status: FoodItem['status']) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
            <Link
              to="/add-item"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              + Add New Item
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Items' },
              { key: 'available', label: 'Available' },
              { key: 'reserved', label: 'Reserved' },
              { key: 'completed', label: 'Completed' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {label} ({items.filter(item => key === 'all' || item.status === key).length})
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                📦
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                ✅
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {items.filter(item => item.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                👁️
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {items.reduce((sum, item) => sum + item.viewCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                🌱
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CO₂ Saved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {items.reduce((sum, item) => sum + item.sustainabilityMetrics.co2Saved, 0)} kg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No items yet' : `No ${filter} items`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start sharing food surplus by adding your first item.'
                : `You don't have any ${filter} items at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/add-item"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Image */}
                <div className="h-48 bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {getCategoryIcon(item.category)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title}
                    </h3>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{item.quantity} {item.unit}</span>
                    <span>Expires: {formatDate(item.expiryDate)}</span>
                  </div>

                  {item.type === 'sale' && (
                    <div className="text-lg font-semibold text-green-600 mb-3">
                      ${item.price}
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="mr-4">👁️ {item.viewCount} views</span>
                    <span>❤️ {item.interestedUsers.length} interested</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {item.status === 'available' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item.id, 'reserved')}
                          className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded text-sm hover:bg-yellow-600"
                        >
                          Mark Reserved
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'completed')}
                          className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    
                    {item.status === 'reserved' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item.id, 'available')}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
                        >
                          Make Available
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'completed')}
                          className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600"
                        >
                          Complete
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItemsPage;
