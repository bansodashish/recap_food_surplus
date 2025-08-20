// 🌍 Enhanced User Registration with Geolocation
import React, { useState, useEffect, useCallback } from 'react';
import { geolocationService, type GeolocationResult, type Coordinates } from '../services/geolocation';

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: Coordinates;
    formattedAddress?: string;
  };
}

interface LocationState {
  isLoading: boolean;
  hasPermission: boolean;
  currentLocation?: GeolocationResult;
  error?: string;
}

export const EnhancedRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [locationState, setLocationState] = useState<LocationState>({
    isLoading: false,
    hasPermission: false
  });

  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // 🎯 Request current location on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationState(prev => ({
          ...prev,
          hasPermission: result.state === 'granted'
        }));
      } catch (error) {
        console.warn('Could not check location permission:', error);
      }
    }
  };

  // 🌍 Get user's current location
  const handleGetCurrentLocation = async () => {
    setLocationState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const result = await geolocationService.getCurrentLocation();
      
      if (result.success && result.data) {
        setLocationState(prev => ({
          ...prev,
          currentLocation: result,
          hasPermission: true,
          isLoading: false
        }));

        // Auto-fill address fields
        setFormData(prev => ({
          ...prev,
          address: {
            street: result.data!.address,
            city: result.data!.city,
            state: result.data!.state,
            zipCode: result.data!.zipCode,
            country: result.data!.country,
            coordinates: result.data!.coordinates,
            formattedAddress: result.data!.formattedAddress
          }
        }));

        console.log('✅ Location obtained and address auto-filled');
      } else {
        setLocationState(prev => ({
          ...prev,
          error: result.error || 'Failed to get location',
          isLoading: false
        }));
      }
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        error: 'Location service error',
        isLoading: false
      }));
    }
  };

  // 🔍 Geocode manually entered address
  // Handle address field changes
  const handleAddressChange = useCallback((field: keyof RegistrationData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
    
    // Trigger geocoding when street address changes
    if (field === 'street') {
      debounceGeocode(value);
    }
  }, []);

  // Debounced geocoding to avoid too many API calls
  const debounceGeocode = (() => {
    let timeout: number;
    return (address: string) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        geocodeUserAddress(address);
      }, 1000);
    };
  })();

  const geocodeUserAddress = async (address: string) => {
    setIsGeocodingAddress(true);

    try {
      const fullAddress = `${address}, ${formData.address.city}, ${formData.address.state}, ${formData.address.country}`;
      const result = await geolocationService.geocodeAddress(fullAddress);

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            coordinates: result.data!.coordinates,
            formattedAddress: result.data!.formattedAddress
          }
        }));

        console.log('✅ Address geocoded successfully');
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that we have coordinates
    if (!formData.address.coordinates) {
      alert('Please provide a valid address or allow location access for better service.');
      return;
    }

    try {
      console.log('🚀 Registering user with location data:', {
        ...formData,
        locationAccuracy: locationState.currentLocation?.accuracy,
        locationSource: locationState.currentLocation?.source
      });

      // Here you would call your user registration API
      // await registerUser(formData);
      
      alert('Registration successful! Location data saved.');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🌍 Join Recap Food Surplus</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Location Information</h3>
          
          {/* Current Location Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locationState.isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locationState.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  🌍 Use Current Location
                </>
              )}
            </button>
            
            {locationState.currentLocation?.success && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ Location detected: {locationState.currentLocation.data?.city}, {locationState.currentLocation.data?.state}
                  <br />
                  <span className="text-xs">
                    Accuracy: {locationState.currentLocation.accuracy} | 
                    Source: {locationState.currentLocation.source}
                  </span>
                </p>
              </div>
            )}
            
            {locationState.error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">⚠️ {locationState.error}</p>
              </div>
            )}
          </div>

          {/* Manual Address Entry */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
                {isGeocodingAddress && <span className="text-blue-500 ml-2">🔍 Locating...</span>}
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="United States"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Coordinates Display */}
            {formData.address.coordinates && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600">
                  📍 Coordinates: {formData.address.coordinates.lat.toFixed(6)}, {formData.address.coordinates.lng.toFixed(6)}
                  {formData.address.formattedAddress && (
                    <>
                      <br />
                      <span className="text-xs">Formatted: {formData.address.formattedAddress}</span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            🌱 Create Account & Start Reducing Food Waste
          </button>
        </div>
      </form>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          🔒 <strong>Privacy Notice:</strong> Your location data is used to connect you with nearby food opportunities and is stored securely. You can update your location preferences anytime in your account settings.
        </p>
      </div>
    </div>
  );
};
