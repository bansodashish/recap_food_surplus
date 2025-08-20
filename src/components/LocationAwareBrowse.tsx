// 🌍 Location-Aware Food Listing Component
import React, { useState, useEffect } from 'react';
import { geolocationService, type Coordinates, type GeolocationResult } from '../services/geolocation';
import type { FoodItem } from '../types';

interface LocationAwareBrowseProps {
  allItems: FoodItem[];
  onItemsFiltered: (items: FoodItem[]) => void;
}

// Extended FoodItem type with distance information
interface FoodItemWithDistance extends FoodItem {
  distance?: number;
}

interface LocationSettings {
  enabled: boolean;
  userLocation?: Coordinates;
  radius: number; // kilometers
  showDistance: boolean;
}

export const LocationAwareBrowse: React.FC<LocationAwareBrowseProps> = ({
  allItems,
  onItemsFiltered
}) => {
  const [locationSettings, setLocationSettings] = useState<LocationSettings>({
    enabled: false,
    radius: 10,
    showDistance: true
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyItems, setNearbyItems] = useState<FoodItemWithDistance[]>([]);

  // Enable location-based filtering
  const enableLocationFilter = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      console.log('🌍 Enabling location-based food filtering...');
      const result: GeolocationResult = await geolocationService.getCurrentLocation();

      if (result.success && result.data?.coordinates) {
        setLocationSettings(prev => ({
          ...prev,
          enabled: true,
          userLocation: result.data!.coordinates
        }));

        console.log('✅ Location enabled for food filtering');
        filterItemsByLocation(result.data.coordinates, locationSettings.radius);
      } else {
        setLocationError(result.error || 'Could not get your location');
      }
    } catch (error) {
      setLocationError('Location service error');
      console.error('🚨 Location enable failed:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Filter items by location
  const filterItemsByLocation = (userCoords: Coordinates, radius: number) => {
    const filtered = geolocationService.filterItemsByRadius(
      allItems,
      userCoords,
      radius
    );

    // Add distance information to items
    const itemsWithDistance = filtered.map(item => ({
      ...item,
      distance: geolocationService.calculateDistance(
        userCoords,
        { lat: item.location.lat, lng: item.location.lng }
      )
    })).sort((a, b) => a.distance - b.distance); // Sort by distance

    setNearbyItems(itemsWithDistance);
    onItemsFiltered(itemsWithDistance);

    console.log(`✅ Found ${itemsWithDistance.length} items within ${radius}km`);
  };

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    setLocationSettings(prev => ({ ...prev, radius: newRadius }));
    
    if (locationSettings.enabled && locationSettings.userLocation) {
      filterItemsByLocation(locationSettings.userLocation, newRadius);
    }
  };

  // Disable location filtering
  const disableLocationFilter = () => {
    setLocationSettings(prev => ({ ...prev, enabled: false }));
    setNearbyItems([]);
    onItemsFiltered(allItems); // Show all items again
    console.log('📍 Location filtering disabled');
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🌍 Location-Based Food Discovery
      </h3>

      {!locationSettings.enabled ? (
        // Location not enabled
        <div className="space-y-4">
          <p className="text-gray-600">
            Find food items near you! Enable location to see nearby surplus food opportunities.
          </p>
          
          <button
            onClick={enableLocationFilter}
            disabled={isLoadingLocation}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Location...
              </>
            ) : (
              <>
                📍 Find Food Near Me
              </>
            )}
          </button>

          {locationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">⚠️ {locationError}</p>
              <p className="text-xs text-red-600 mt-1">
                Please enable location permissions in your browser to use this feature.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Location enabled - show controls
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-medium">✅ Location Active</span>
              <button
                onClick={disableLocationFilter}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Disable
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Found {nearbyItems.length} items nearby
            </div>
          </div>

          {/* Radius Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Radius: {locationSettings.radius}km
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="50"
                value={locationSettings.radius}
                onChange={(e) => handleRadiusChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex space-x-2">
                {[5, 10, 25].map(radius => (
                  <button
                    key={radius}
                    onClick={() => handleRadiusChange(radius)}
                    className={`px-2 py-1 text-xs rounded ${
                      locationSettings.radius === radius
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {radius}km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {nearbyItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-md">
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">{nearbyItems.length}</div>
                <div className="text-xs text-green-600">Items Found</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">
                  {nearbyItems.filter(item => item.listingType === 'donate').length}
                </div>
                <div className="text-xs text-green-600">Free Items</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">
                  {nearbyItems.length > 0 ? formatDistance(Math.min(...nearbyItems.map(item => item.distance || 0))) : '-'}
                </div>
                <div className="text-xs text-green-600">Closest Item</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">
                  {new Set(nearbyItems.map(item => item.location.city)).size}
                </div>
                <div className="text-xs text-green-600">Cities</div>
              </div>
            </div>
          )}

          {/* No items found */}
          {nearbyItems.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">
                🔍 No food items found within {locationSettings.radius}km of your location.
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Try increasing the search radius or check back later for new listings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          🔒 Your location is used only to find nearby food items and is not stored or shared with other users.
        </p>
      </div>
    </div>
  );
};

// Higher-order component to add distance information to food items
export const withLocationDistance = (
  WrappedComponent: React.ComponentType<any>
) => {
  return function LocationEnhancedComponent(props: any) {
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

    useEffect(() => {
      // Try to get user location on mount
      geolocationService.getCurrentLocation().then(result => {
        if (result.success && result.data?.coordinates) {
          setUserLocation(result.data.coordinates);
        }
      }).catch(console.warn);
    }, []);

    // Add distance calculation to props
    const enhancedProps = {
      ...props,
      userLocation,
      calculateDistance: userLocation 
        ? (itemLocation: Coordinates) => 
            geolocationService.calculateDistance(userLocation, itemLocation)
        : null
    };

    return <WrappedComponent {...enhancedProps} />;
  };
};
