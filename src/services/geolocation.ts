// 🌍 Geolocation Service for Food Surplus Platform
// Converts addresses to coordinates and enables location-based features

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates: Coordinates;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formattedAddress?: string;
}

export interface GeolocationResult {
  success: boolean;
  data?: LocationData;
  error?: string;
  accuracy?: 'high' | 'medium' | 'low';
  source?: 'browser' | 'geocoding' | 'user_input';
}

export class GeolocationService {
  private readonly GEOCODING_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  private readonly MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
  
  // 🎯 Method 1: Get user's current location via browser
  async getCurrentLocation(): Promise<GeolocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: 'Geolocation is not supported by this browser',
          source: 'browser'
        });
        return;
      }

      console.log('🌍 Requesting current location...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          console.log(`✅ Current location obtained: ${coordinates.lat}, ${coordinates.lng}`);

          // Reverse geocode to get address
          try {
            const addressData = await this.reverseGeocode(coordinates);
            resolve({
              success: true,
              data: {
                ...addressData,
                coordinates
              },
              accuracy: 'high',
              source: 'browser'
            });
          } catch (error) {
            // Still return coordinates even if reverse geocoding fails
            resolve({
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
            });
          }
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          resolve({
            success: false,
            error: this.getGeolocationErrorMessage(error.code),
            source: 'browser'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }

  // 🎯 Method 2: Convert address to coordinates (Geocoding)
  async geocodeAddress(address: string): Promise<GeolocationResult> {
    try {
      console.log(`🔍 Geocoding address: ${address}`);

      // Try Google Maps Geocoding API first
      if (this.GEOCODING_API_KEY) {
        const result = await this.geocodeWithGoogle(address);
        if (result.success) return result;
      }

      // Fallback to Mapbox Geocoding API
      if (this.MAPBOX_API_KEY) {
        const result = await this.geocodeWithMapbox(address);
        if (result.success) return result;
      }

      // Fallback to free OpenStreetMap Nominatim API
      return await this.geocodeWithNominatim(address);

    } catch (error) {
      console.error('🚨 Geocoding failed:', error);
      return {
        success: false,
        error: `Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        source: 'geocoding'
      };
    }
  }

  // 🎯 Method 3: Reverse geocoding - convert coordinates to address
  async reverseGeocode(coordinates: Coordinates): Promise<LocationData> {
    try {
      console.log(`🔄 Reverse geocoding: ${coordinates.lat}, ${coordinates.lng}`);

      // Try Google Maps first
      if (this.GEOCODING_API_KEY) {
        try {
          return await this.reverseGeocodeWithGoogle(coordinates);
        } catch (error) {
          console.warn('Google reverse geocoding failed, trying Nominatim...');
        }
      }

      // Fallback to Nominatim
      return await this.reverseGeocodeWithNominatim(coordinates);

    } catch (error) {
      console.error('🚨 Reverse geocoding failed:', error);
      throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 🔧 Google Maps Geocoding API
  private async geocodeWithGoogle(address: string): Promise<GeolocationResult> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.GEOCODING_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      
      const locationData: LocationData = {
        address: result.formatted_address,
        coordinates: { lat: location.lat, lng: location.lng },
        city: this.extractComponent(result.address_components, 'locality') || 'Unknown',
        state: this.extractComponent(result.address_components, 'administrative_area_level_1') || 'Unknown',
        zipCode: this.extractComponent(result.address_components, 'postal_code') || 'Unknown',
        country: this.extractComponent(result.address_components, 'country') || 'Unknown',
        formattedAddress: result.formatted_address
      };

      console.log('✅ Google geocoding successful');
      return {
        success: true,
        data: locationData,
        accuracy: 'high',
        source: 'geocoding'
      };
    }

    throw new Error(`Google geocoding failed: ${data.status}`);
  }

  // 🔧 Mapbox Geocoding API
  private async geocodeWithMapbox(address: string): Promise<GeolocationResult> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.MAPBOX_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.features?.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      
      const locationData: LocationData = {
        address: feature.place_name,
        coordinates: { lat, lng },
        city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text || 'Unknown',
        state: feature.context?.find((c: any) => c.id.startsWith('region'))?.text || 'Unknown',
        zipCode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || 'Unknown',
        country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text || 'Unknown',
        formattedAddress: feature.place_name
      };

      console.log('✅ Mapbox geocoding successful');
      return {
        success: true,
        data: locationData,
        accuracy: 'high',
        source: 'geocoding'
      };
    }

    throw new Error('Mapbox geocoding failed: No results found');
  }

  // 🔧 Free OpenStreetMap Nominatim API (Fallback)
  private async geocodeWithNominatim(address: string): Promise<GeolocationResult> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RecapFoodSurplus/1.0 (Food surplus reduction platform)'
      }
    });
    
    const data = await response.json();

    if (data?.length > 0) {
      const result = data[0];
      
      const locationData: LocationData = {
        address: result.display_name,
        coordinates: { 
          lat: parseFloat(result.lat), 
          lng: parseFloat(result.lon) 
        },
        city: result.address?.city || result.address?.town || result.address?.village || 'Unknown',
        state: result.address?.state || result.address?.county || 'Unknown',
        zipCode: result.address?.postcode || 'Unknown',
        country: result.address?.country || 'Unknown',
        formattedAddress: result.display_name
      };

      console.log('✅ Nominatim geocoding successful');
      return {
        success: true,
        data: locationData,
        accuracy: 'medium',
        source: 'geocoding'
      };
    }

    throw new Error('Nominatim geocoding failed: No results found');
  }

  // 🔧 Google Reverse Geocoding
  private async reverseGeocodeWithGoogle(coordinates: Coordinates): Promise<LocationData> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${this.GEOCODING_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      
      return {
        address: result.formatted_address,
        coordinates,
        city: this.extractComponent(result.address_components, 'locality') || 'Unknown',
        state: this.extractComponent(result.address_components, 'administrative_area_level_1') || 'Unknown',
        zipCode: this.extractComponent(result.address_components, 'postal_code') || 'Unknown',
        country: this.extractComponent(result.address_components, 'country') || 'Unknown',
        formattedAddress: result.formatted_address
      };
    }

    throw new Error(`Google reverse geocoding failed: ${data.status}`);
  }

  // 🔧 Nominatim Reverse Geocoding
  private async reverseGeocodeWithNominatim(coordinates: Coordinates): Promise<LocationData> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RecapFoodSurplus/1.0 (Food surplus reduction platform)'
      }
    });
    
    const data = await response.json();

    if (data && data.display_name) {
      return {
        address: data.display_name,
        coordinates,
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        state: data.address?.state || data.address?.county || 'Unknown',
        zipCode: data.address?.postcode || 'Unknown',
        country: data.address?.country || 'Unknown',
        formattedAddress: data.display_name
      };
    }

    throw new Error('Nominatim reverse geocoding failed');
  }

  // 🔧 Helper method to extract address components
  private extractComponent(components: any[], type: string): string | null {
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || null;
  }

  // 🔧 Geolocation error message helper
  private getGeolocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Location access denied by user. Please enable location permissions in your browser settings.';
      case 2:
        return 'Location information is unavailable. Please check your internet connection.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unknown geolocation error occurred.';
    }
  }

  // 🎯 Calculate distance between two coordinates (Haversine formula)
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // 🎯 Get nearby food items within radius
  filterItemsByRadius(
    items: any[], 
    userLocation: Coordinates, 
    radiusKm: number = 10
  ): any[] {
    return items.filter(item => {
      if (!item.location?.lat || !item.location?.lng) return false;
      
      const distance = this.calculateDistance(
        userLocation,
        { lat: item.location.lat, lng: item.location.lng }
      );
      
      return distance <= radiusKm;
    });
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
