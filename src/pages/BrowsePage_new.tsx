import { useState } from 'react';
import { Search, Filter, MapPin, Clock, Star, Heart } from 'lucide-react';

// Mock data for food items
const mockFoodItems = [
  {
    id: '1',
    title: 'Fresh Organic Vegetables',
    category: 'Produce',
    location: '2.5 km away',
    timeLeft: '4 hours left',
    price: 'Free',
    originalPrice: '$15',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 24,
    donor: 'Green Market',
    verified: true
  },
  {
    id: '2',
    title: 'Bakery Bread & Pastries',
    category: 'Bakery',
    location: '1.2 km away',
    timeLeft: '2 hours left',
    price: '$3',
    originalPrice: '$12',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    rating: 4.9,
    reviews: 18,
    donor: 'Corner Bakery',
    verified: true
  },
  {
    id: '3',
    title: 'Restaurant Meals',
    category: 'Prepared',
    location: '3.1 km away',
    timeLeft: '1 hour left',
    price: '$5',
    originalPrice: '$20',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 32,
    donor: 'Bella Vista Restaurant',
    verified: true
  },
  {
    id: '4',
    title: 'Dairy Products Bundle',
    category: 'Dairy',
    location: '0.8 km away',
    timeLeft: '6 hours left',
    price: 'Free',
    originalPrice: '$18',
    image: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&h=300&fit=crop',
    rating: 4.6,
    reviews: 15,
    donor: 'Local Dairy Farm',
    verified: true
  },
  {
    id: '5',
    title: 'Fresh Fruits Mix',
    category: 'Produce',
    location: '1.8 km away',
    timeLeft: '3 hours left',
    price: '$2',
    originalPrice: '$10',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 28,
    donor: 'Fruit Express',
    verified: true
  },
  {
    id: '6',
    title: 'Gourmet Sandwiches',
    category: 'Prepared',
    location: '2.2 km away',
    timeLeft: '45 minutes left',
    price: '$4',
    originalPrice: '$16',
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
    rating: 4.5,
    reviews: 22,
    donor: 'Artisan Deli',
    verified: true
  }
];

const categories = ['All', 'Produce', 'Bakery', 'Prepared', 'Dairy', 'Frozen', 'Pantry'];

export function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = mockFoodItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.donor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Available Food</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover fresh food items available for pickup or delivery in your area
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for food items, restaurants, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Additional Filters Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>

            {/* Extended Filters (when shown) */}
            {showFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option>Within 5 km</option>
                      <option>Within 10 km</option>
                      <option>Within 25 km</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option>Any Price</option>
                      <option>Free Only</option>
                      <option>Under $5</option>
                      <option>Under $10</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option>Available Now</option>
                      <option>Today</option>
                      <option>This Week</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {filteredItems.length} items found
          </h2>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Sort by: Nearest</option>
            <option>Sort by: Price (Low to High)</option>
            <option>Sort by: Price (High to Low)</option>
            <option>Sort by: Time Left</option>
            <option>Sort by: Rating</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                </div>
                {item.price === 'Free' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                      FREE
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center ml-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="font-medium">{item.donor}</span>
                  {item.verified && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="mr-4">{item.location}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{item.timeLeft}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-600">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-200">
            Load More Items
          </button>
        </div>
      </div>
    </div>
  );
}
