import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Calendar, Clock, DollarSign, Heart, Plus, Minus } from 'lucide-react';
import { authService } from '../services/auth';
import { foodItemsService } from '../services/foodItems';
import type { CreateFoodItemRequest } from '../types/foodItem';
import { FOOD_CATEGORIES } from '../types/foodItem';

export function DonatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 1,
    expirationDate: '',
    location: '',
    pickupTime: '',
    price: '',
    isDonation: true
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const categories = FOOD_CATEGORIES.map(cat => cat.label);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, 4 - imageFiles.length);
      
      // Store actual File objects
      setImageFiles(prev => [...prev, ...fileArray]);
      
      // Create preview URLs
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPreviewImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    // Remove from both arrays
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Cleanup the removed preview URL
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Map category name back to value
      const categoryValue = FOOD_CATEGORIES.find(cat => cat.label === formData.category)?.value || 'other';

      const itemData: CreateFoodItemRequest = {
        title: formData.title,
        description: formData.description,
        category: categoryValue as any,
        type: formData.isDonation ? 'donation' : 'sale',
        price: formData.isDonation ? undefined : parseFloat(formData.price) || undefined,
        quantity: formData.quantity,
        unit: 'pieces',
        condition: 'good',
        expiryDate: formData.expirationDate,
        images: imageFiles,
        location: {
          address: formData.location,
          city: '',
          zipCode: '',
          country: 'US',
        },
        pickupAvailable: true,
        deliveryAvailable: false,
        contactInfo: {
          name: `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.email,
          email: user.email,
          phone: user.phone_number || '',
          preferredContact: 'email',
        },
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          organic: false,
          halal: false,
          kosher: false,
        },
      };

      await foodItemsService.createFoodItem(itemData, user.sub);
      
      // Success message and redirect
      alert('🎉 Success! Your food donation has been listed successfully. It will appear in your profile under "My Items".');
      navigate('/my-items');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Share Your Surplus</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help reduce food waste by sharing your excess food with the community. Every donation makes a difference!
          </p>
        </div>

        {/* Donation Type Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How would you like to share?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, isDonation: true, price: '' }))}
              className={`p-6 border-2 rounded-lg transition-colors duration-200 ${
                formData.isDonation
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Heart className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold text-lg mb-2">Donate for Free</h3>
              <p className="text-sm text-gray-600">
                Share your surplus food with those in need at no cost
              </p>
            </button>
            
            <button
              onClick={() => setFormData(prev => ({ ...prev, isDonation: false }))}
              className={`p-6 border-2 rounded-lg transition-colors duration-200 ${
                !formData.isDonation
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-lg mb-2">Sell at Discount</h3>
              <p className="text-sm text-gray-600">
                Sell your surplus food at reduced prices to avoid waste
              </p>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Food Photos */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Add Photos of Your Food
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {previewImages.map((image, index) => (
                <div key={`image-${index}`} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Food ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {previewImages.length < 4 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200">
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500">Add up to 4 photos to showcase your food items</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Fresh Organic Apples, Homemade Pasta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the food items, ingredients, preparation method, allergens, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity/Servings *
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border-t border-b border-gray-300 text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!formData.isDonation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per item ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Best Before Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Pickup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Address or general area"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Pickup Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  placeholder="e.g., 9 AM - 6 PM, Weekends only"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (formData.isDonation ? 'Creating Donation...' : 'Creating Listing...')
                : (formData.isDonation ? 'Share Your Donation' : 'List for Sale')
              }
            </button>
          </div>
        </form>

        {/* Impact Message */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for helping reduce food waste! 🌱
          </h3>
          <p className="text-gray-600">
            Your contribution helps build a more sustainable community and ensures good food doesn't go to waste.
          </p>
        </div>
      </div>
    </div>
  );
}
