import { useState } from 'react';
import { Search, Filter, MapPin, Clock } from 'lucide-react';

export function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - in real app, this would come from API
  const foodItems = [
    {
      id: '1',
      title: 'Fresh Organic Apples',
      category: 'fruits',
      price: 8.99,
      discountedPrice: 4.50,
      location: 'Downtown Market',
      distance: '0.8 km',
      expiresIn: '2 days',
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Homemade Vegetable Soup',
      category: 'prepared',
      price: 12.00,
      discountedPrice: 6.00,
      location: 'Green Kitchen',
      distance: '1.2 km',
      expiresIn: '1 day',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'Fresh Bread Loaves',
      category: 'grains',
      price: 5.50,
      discountedPrice: 2.75,
      location: 'City Bakery',
      distance: '0.5 km',
      expiresIn: '3 hours',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Food Items</h1>
          <p className="text-gray-600">Find fresh food and meals at discounted prices near you</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="fruits">Fruits</option>
              <option value="vegetables">Vegetables</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="grains">Grains</option>
              <option value="prepared">Prepared Food</option>
            </select>

            <button className="flex items-center px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-600">
                      ${item.discountedPrice}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${item.price}
                    </span>
                  </div>
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {Math.round((1 - item.discountedPrice / item.price) * 100)}% off
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {item.location} • {item.distance}
                  </div>
                  <div className="flex items-center text-orange-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Expires in {item.expiresIn}
                  </div>
                </div>

                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Items
          </button>
        </div>
      </div>
    </div>
  );
}
