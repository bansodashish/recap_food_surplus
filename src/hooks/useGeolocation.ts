// 🌍 Custom React Hook for Geolocation Services
import { useState, useEffect, useCallback } from 'react';
import { geolocationService, type Coordinates, type GeolocationResult } from '../services/geolocation';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoRequest?: boolean;
}

interface UseGeolocationState {
  location: GeolocationResult | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  isSupported: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [state, setState] = useState<UseGeolocationState>({
    location: null,
    isLoading: false,
    error: null,
    hasPermission: false,
    isSupported: 'geolocation' in navigator
  });

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) return false;

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const hasPermission = result.state === 'granted';
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
      return false;
    }
  }, []);

  // Request current location
  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await geolocationService.getCurrentLocation();
      setState(prev => ({
        ...prev,
        location: result,
        isLoading: false,
        error: result.success ? null : result.error || 'Location request failed',
        hasPermission: result.success
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown location error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Geocode an address
  const geocodeAddress = useCallback(async (address: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await geolocationService.geocodeAddress(address);
      setState(prev => ({
        ...prev,
        location: result,
        isLoading: false,
        error: result.success ? null : result.error || 'Geocoding failed'
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Geocoding error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Calculate distance to a point
  const calculateDistance = useCallback((targetCoords: Coordinates): number | null => {
    if (!state.location?.success || !state.location.data?.coordinates) {
      return null;
    }
    return geolocationService.calculateDistance(state.location.data.coordinates, targetCoords);
  }, [state.location]);

  // Filter items by radius
  const filterItemsByRadius = useCallback((items: any[], radiusKm: number = 10) => {
    if (!state.location?.success || !state.location.data?.coordinates) {
      return items;
    }
    return geolocationService.filterItemsByRadius(items, state.location.data.coordinates, radiusKm);
  }, [state.location]);

  // Auto-request location on mount if enabled
  useEffect(() => {
    if (options.autoRequest && state.isSupported) {
      checkPermission().then(hasPermission => {
        if (hasPermission) {
          requestLocation();
        }
      });
    }
  }, [options.autoRequest, state.isSupported, checkPermission, requestLocation]);

  return {
    ...state,
    requestLocation,
    geocodeAddress,
    calculateDistance,
    filterItemsByRadius,
    checkPermission,
    // Convenience getters
    coordinates: state.location?.data?.coordinates || null,
    address: state.location?.data?.address || null,
    accuracy: state.location?.accuracy || null
  };
};

// Hook for watching location changes
export const useLocationWatch = (options: UseGeolocationOptions = {}) => {
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locations, setLocations] = useState<GeolocationResult[]>([]);
  const [isWatching, setIsWatching] = useState(false);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || isWatching) return;

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        try {
          const addressData = await geolocationService.reverseGeocode(coordinates);
          const result: GeolocationResult = {
            success: true,
            data: { ...addressData, coordinates },
            accuracy: 'high',
            source: 'browser'
          };

          setLocations(prev => [...prev, result]);
        } catch (error) {
          console.warn('Reverse geocoding failed during location watch:', error);
          const result: GeolocationResult = {
            success: true,
            data: {
              address: `${coordinates.lat}, ${coordinates.lng}`,
              coordinates,
              city: 'Unknown',
              state: 'Unknown',
              zipCode: 'Unknown',
              country: 'Unknown'
            },
            accuracy: 'medium',
            source: 'browser'
          };
          setLocations(prev => [...prev, result]);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 60000
      }
    );

    setWatchId(id);
    setIsWatching(true);
  }, [isWatching, options]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    locations,
    isWatching,
    startWatching,
    stopWatching,
    currentLocation: locations[locations.length - 1] || null
  };
};

// Hook for distance calculations
export const useDistanceCalculator = (userLocation?: Coordinates) => {
  const calculateDistance = useCallback((targetLocation: Coordinates): number => {
    if (!userLocation) return 0;
    return geolocationService.calculateDistance(userLocation, targetLocation);
  }, [userLocation]);

  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }, []);

  const sortByDistance = useCallback((items: any[], getLocationFn: (item: any) => Coordinates) => {
    if (!userLocation) return items;

    return [...items].sort((a, b) => {
      const distanceA = calculateDistance(getLocationFn(a));
      const distanceB = calculateDistance(getLocationFn(b));
      return distanceA - distanceB;
    });
  }, [userLocation, calculateDistance]);

  return {
    calculateDistance,
    formatDistance,
    sortByDistance,
    hasUserLocation: !!userLocation
  };
};
