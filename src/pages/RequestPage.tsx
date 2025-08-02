import { useState } from 'react';
import { MapPin, Users, Heart, Search, AlertCircle, CheckCircle } from 'lucide-react';

export function RequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity: '',
    urgency: '',
    location: '',
    description: '',
    contactMethod: 'app'
  });

  const categories = [
    'Fruits & Vegetables',
    'Bakery Items', 
    'Prepared Meals',
    'Dairy Products',
    'Meat & Seafood',
    'Pantry Items',
    'Beverages',
    'Baby Food',
    'Other'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - Within a week', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'medium', label: 'Medium - Within 2-3 days', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'high', label: 'High - Within 24 hours', color: 'text-red-600 bg-red-50 border-red-200' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Request submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Request Food Items</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let the community know what food items you need. We'll help connect you with generous donors in your area.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Food Requests Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Submit Request</h3>
              <p className="text-sm text-gray-600">Describe what food items you need and when you need them</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Community Responds</h3>
              <p className="text-sm text-gray-600">Local donors and organizations see your request and offer help</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Connect & Collect</h3>
              <p className="text-sm text-gray-600">Coordinate pickup or delivery with donors through our platform</p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tell Us What You Need</h2>
            
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Need fresh vegetables for family of 4"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 kg, 5 items, enough for 4 people"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              How urgent is this request? *
            </label>
            <div className="space-y-3">
              {urgencyLevels.map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium border ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Location (for nearby donors) *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your city or neighborhood"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">We only share your general area with potential donors</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any specific requirements, dietary restrictions, or additional context that would help donors..."
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How should donors contact you?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="app"
                  checked={formData.contactMethod === 'app'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Through the app (recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="contactMethod"
                  value="email"
                  checked={formData.contactMethod === 'email'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">Via email</span>
              </label>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Privacy & Safety</p>
                <p>Your personal information is kept private. Only your general location and request details are visible to potential donors. We'll facilitate all communication through our secure platform.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg"
            >
              Submit Food Request
            </button>
          </div>
        </form>

        {/* Support Message */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 text-center">
          <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Community Support
          </h3>
          <p className="text-gray-600">
            Our community is here to help. Most food requests receive responses within 24 hours.
            Thank you for being part of our mission to reduce food waste!
          </p>
        </div>
      </div>
    </div>
  );
}
