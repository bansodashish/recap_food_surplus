import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { foodItemsService } from '../services/foodItems';
import { CSVUploadModalWithPhotos } from '../components/CSVUploadModalWithPhotos';
import { APIAccessPanel } from '../components/APIAccessPanel';
import type { CreateFoodItemRequest, FoodCategory, ListingType, FoodCondition } from '../types/foodItem';
import { FOOD_CATEGORIES, FOOD_CONDITIONS, QUANTITY_UNITS } from '../types/foodItem';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, getItemListingLimits } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showCSVPhotosUpload, setShowCSVPhotosUpload] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'csv-photos' | 'api'>('manual');
  
  const limits = getItemListingLimits();
  
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

  const handleCSVPhotosUploadComplete = (results: { success: number; failed: number; errors: string[] }) => {
    setShowCSVPhotosUpload(false);
    
    if (results.success > 0) {
      const message = user?.subscriptionPlan === 'free' 
        ? `Successfully uploaded ${results.success} items with photos to S3 storage! Your food items are now available to browse.`
        : `Successfully uploaded ${results.success} items with photos!`;
      alert(message);
      navigate('/my-items');
    }
    
    if (results.errors.length > 0) {
      alert(`Upload completed with ${results.errors.length} errors:\n${results.errors.slice(0, 5).join('\n')}`);
    }
  };

  useEffect(() => {
    // Check authentication but allow free users to list items
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Remove subscription restriction - free users can now list items with limits
      console.log('User authenticated:', user.email);

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
        {/* Upload Method Selector */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Food Items</h2>
          <p className="text-gray-600 mb-4">
            Your {limits.maxItems === -1 ? 'unlimited' : `${limits.maxItems} item`} limit for {user?.subscriptionPlan || 'free'} plan
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manual Entry */}
            <button
              onClick={() => setUploadMethod('manual')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                uploadMethod === 'manual' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-200'
              }`}
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h3 className="font-medium">Manual Entry</h3>
              </div>
              <p className="text-sm text-gray-600">Add items one by one with full details</p>
            </button>

            {/* CSV Upload with Photos */}
            <button
              onClick={() => setUploadMethod('csv-photos')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                uploadMethod === 'csv-photos' 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-200 hover:border-teal-200'
              }`}
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium">CSV + Photos</h3>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">New</span>
              </div>
              <p className="text-sm text-gray-600">Upload items with photos (up to 5 per item)</p>
            </button>

            {/* API Access */}
            <button
              onClick={() => setUploadMethod('api')}
              disabled={!limits.hasAPIAccess}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                uploadMethod === 'api' 
                  ? 'border-teal-500 bg-teal-50' 
                  : limits.hasAPIAccess
                    ? 'border-gray-200 hover:border-teal-200'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className={`font-medium ${!limits.hasAPIAccess ? 'text-gray-400' : ''}`}>
                  API Access {!limits.hasAPIAccess && '(Premium+)'}
                </h3>
              </div>
              <p className={`text-sm ${!limits.hasAPIAccess ? 'text-gray-400' : 'text-gray-600'}`}>
                Programmatic uploads via REST API
              </p>
            </button>
          </div>
        </div>

        {/* Render based on selected method */}
        {uploadMethod === 'csv-photos' && (
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-medium text-green-800">CSV Upload with Photo Support</h4>
              </div>
              <p className="text-sm text-green-700">
                Upload your CSV file and add up to 5 photos per item with secure S3 storage.
                Perfect for showcasing your food items with visual appeal!
              </p>
            </div>
            <button
              onClick={() => setShowCSVPhotosUpload(true)}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-teal-700 hover:to-blue-700 font-medium transition-all"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Open Enhanced CSV Upload with Photos
              </div>
            </button>
          </div>
        )}

        {uploadMethod === 'api' && limits.hasAPIAccess && (
          <div className="mb-8">
            <APIAccessPanel />
          </div>
        )}

        {uploadMethod === 'manual' && (
          <>
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
        </>
        )}

        {/* CSV Upload with Photos Modal */}
        {showCSVPhotosUpload && (
          <CSVUploadModalWithPhotos
            onUploadComplete={handleCSVPhotosUploadComplete}
            onClose={() => setShowCSVPhotosUpload(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AddItemPage;
