import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { foodItemsService } from '../services/foodItems';
import type { CreateFoodItemRequest, FoodCategory, ListingType, FoodCondition } from '../types/foodItem';
import { FOOD_CATEGORIES, FOOD_CONDITIONS, QUANTITY_UNITS } from '../types/foodItem';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateFoodItemRequest>({
    title: '',
    description: '',
    category: 'other' as FoodCategory,
    type: 'donation' as ListingType,
    price: undefined,
    originalPrice: undefined,
    quantity: 1,
    unit: 'pieces',
    condition: 'good' as FoodCondition,
    expiryDate: '',
    images: [],
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    pickupAvailable: true,
    deliveryAvailable: false,
    deliveryRadius: undefined,
    deliveryCost: undefined,
    contactInfo: {
      name: '',
      phone: '',
      email: '',
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
  });

  useEffect(() => {
    // Check authentication and subscription
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const subscriptionPlan = user['custom:subscription_plan'];
      
      if (!subscriptionPlan || subscriptionPlan === 'free') {
        alert('You need an active subscription to add items. Please upgrade your plan.');
        navigate('/profile');
        return;
      }

      // Pre-fill contact info from user profile
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          name: `${user.given_name || ''} ${user.family_name || ''}`.trim(),
          email: user.email || '',
          phone: user.phone_number || '',
        },
      }));
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user?.sub) {
        throw new Error('User not authenticated');
      }

      await foodItemsService.createFoodItem(formData, user.sub);
      alert('Item added successfully!');
      navigate('/my-items');
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Step 1: Basic Info
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Fresh Organic Apples"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Describe your item, its condition, any special notes..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {FOOD_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as ListingType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="donation">Donation (Free)</option>
            <option value="sale">For Sale</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            required
            min="0.1"
            step="0.1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit *
          </label>
          <select
            required
            value={formData.unit}
            onChange={(e) => handleInputChange('unit', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {QUANTITY_UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition *
          </label>
          <select
            required
            value={formData.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {FOOD_CONDITIONS.map(cond => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expiry Date *
        </label>
        <input
          type="date"
          required
          value={formData.expiryDate}
          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  // Step 2: Pricing (if for sale)
  const renderPricing = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pricing Information</h2>
      
      {formData.type === 'sale' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price * ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price ($)
              <span className="text-sm text-gray-500"> (optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.originalPrice || ''}
              onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            🎉 Free Donation
          </h3>
          <p className="text-green-700">
            Thank you for donating! This item will be listed as free for anyone who needs it.
          </p>
        </div>
      )}
    </div>
  );

  // Step 3: Images
  const renderImages = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Photos</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (Max 5)
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Add clear photos of your item. Good photos help attract more interest!
        </p>
      </div>

      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 4: Location & Contact
  const renderLocationContact = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Location & Contact</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <input
            type="text"
            required
            value={formData.location.address}
            onChange={(e) => handleInputChange('location.address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.location.city}
              onChange={(e) => handleInputChange('location.city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zip Code *
            </label>
            <input
              type="text"
              required
              value={formData.location.zipCode}
              onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.pickupAvailable}
              onChange={(e) => handleInputChange('pickupAvailable', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Pickup Available</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.deliveryAvailable}
              onChange={(e) => handleInputChange('deliveryAvailable', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Delivery Available</span>
          </label>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.contactInfo.name}
                onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dietary Information</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'vegetarian', label: 'Vegetarian' },
              { key: 'vegan', label: 'Vegan' },
              { key: 'glutenFree', label: 'Gluten Free' },
              { key: 'organic', label: 'Organic' },
              { key: 'halal', label: 'Halal' },
              { key: 'kosher', label: 'Kosher' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.dietaryInfo as any)[key]}
                  onChange={(e) => handleInputChange(`dietaryInfo.${key}`, e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">Step {currentStep} of 4</div>
            <div className="text-sm text-gray-500">
              {['Basic Info', 'Pricing', 'Photos', 'Location & Contact'][currentStep - 1]}
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderPricing()}
          {currentStep === 3 && renderImages()}
          {currentStep === 4 && renderLocationContact()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Item...' : 'Add Item'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;
