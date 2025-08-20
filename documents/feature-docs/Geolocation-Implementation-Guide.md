# 🌍 Geolocation Setup Guide for AWS Amplify

## Overview
This guide shows how to implement geolocation services in your TypeScript food surplus platform hosted on AWS Amplify. Users can register with their address, which gets converted to coordinates for location-based features.

## 🎯 What You'll Get
- ✅ Address to coordinates conversion (geocoding)
- ✅ Current location detection via browser
- ✅ Distance calculations between users and food items
- ✅ Location-based food item filtering
- ✅ Multiple geocoding API fallbacks for reliability
- ✅ Privacy-compliant location handling

## 📦 Required Dependencies

Add these to your `package.json`:

```bash
# These APIs are already included in modern browsers
# No additional packages needed for basic geolocation!

# Optional: For enhanced maps UI (choose one)
npm install @googlemaps/react-wrapper  # Google Maps
npm install react-map-gl mapbox-gl      # Mapbox
```

## 🔑 API Keys Setup

### Option 1: Google Maps (Recommended for Production)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Geocoding API
   - Maps JavaScript API (if using maps UI)
4. Create API key in Credentials section
5. Add to your `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Option 2: Mapbox (Alternative)
1. Sign up at [Mapbox](https://account.mapbox.com/)
2. Get your access token
3. Add to `.env`:

```env
VITE_MAPBOX_API_KEY=your_mapbox_api_key_here
```

### Option 3: OpenStreetMap Nominatim (Free Fallback)
- No API key required
- Automatically used as fallback
- Rate limited but reliable for testing

## 🚀 AWS Amplify Environment Setup

### Development Environment
Add to your local `.env`:
```env
# Geolocation APIs
VITE_GOOGLE_MAPS_API_KEY=your_dev_google_key
VITE_MAPBOX_API_KEY=your_dev_mapbox_key
```

### Production Environment in Amplify
1. Go to Amplify Console > Your App > Environment Variables
2. Add these variables:
   ```
   VITE_GOOGLE_MAPS_API_KEY = your_production_google_key
   VITE_MAPBOX_API_KEY = your_production_mapbox_key
   ```

## 📝 Database Schema Updates

### User Table Update
Add location fields to your user model:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    // New geolocation fields
    coordinates?: {
      lat: number;
      lng: number;
    };
    formattedAddress?: string;
    locationAccuracy?: 'high' | 'medium' | 'low';
    locationSource?: 'browser' | 'geocoding' | 'user_input';
  };
  // ... other fields
}
```

### Food Item Table Update
Your existing schema already supports coordinates:
```typescript
location: {
  address: string;
  lat: number;    // ✅ Already exists
  lng: number;    // ✅ Already exists
  city: string;
  zipCode: string;
}
```

## 🔧 Implementation Steps

### Step 1: Import Geolocation Service
```typescript
import { geolocationService } from '../services/geolocation';
import { useGeolocation } from '../hooks/useGeolocation';
```

### Step 2: Enhanced Registration Form
Replace your registration form with the enhanced version:

```typescript
import { EnhancedRegistrationForm } from '../components/EnhancedRegistrationForm';

// Use in your routes
<Route path="/register" element={<EnhancedRegistrationForm />} />
```

### Step 3: Location-Aware Browse Page
Add location filtering to your browse page:

```typescript
import { LocationAwareBrowse } from '../components/LocationAwareBrowse';

function BrowsePage() {
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);

  return (
    <div>
      <LocationAwareBrowse 
        allItems={allItems}
        onItemsFiltered={setFilteredItems}
      />
      {/* Render filteredItems */}
    </div>
  );
}
```

### Step 4: Add Distance to Food Items
```typescript
import { useDistanceCalculator } from '../hooks/useGeolocation';

function FoodItemCard({ item }: { item: FoodItem }) {
  const { location } = useGeolocation();
  const { calculateDistance, formatDistance } = useDistanceCalculator(
    location?.data?.coordinates
  );

  const distance = calculateDistance({
    lat: item.location.lat,
    lng: item.location.lng
  });

  return (
    <div className="food-item-card">
      <h3>{item.title}</h3>
      {distance > 0 && (
        <span className="distance">📍 {formatDistance(distance)} away</span>
      )}
    </div>
  );
}
```

## 🔒 Privacy & Security Considerations

### 1. User Consent
```typescript
// Always request permission first
const handleLocationRequest = async () => {
  const confirmed = window.confirm(
    'Allow location access to find nearby food opportunities?'
  );
  
  if (confirmed) {
    await requestLocation();
  }
};
```

### 2. Data Storage
```typescript
// Only store necessary location data
const sanitizeLocationData = (location: LocationData) => ({
  coordinates: location.coordinates,
  city: location.city,
  state: location.state,
  zipCode: location.zipCode,
  // Don't store full address for privacy
});
```

### 3. Error Handling
```typescript
// Graceful degradation when location fails
const { location, error } = useGeolocation();

if (error) {
  // Show all items without location filtering
  return <AllItemsView items={allItems} />;
}
```

## 📱 Mobile Considerations

### iOS Safari
Add to your `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Required for location services on iOS -->
```

### Android Chrome
Location requires HTTPS in production. AWS Amplify provides this automatically.

## 🧪 Testing Your Implementation

### 1. Test Location Detection
```typescript
// Add to your dev tools console
import { geolocationService } from './src/services/geolocation';

// Test current location
geolocationService.getCurrentLocation().then(console.log);

// Test address geocoding
geolocationService.geocodeAddress('123 Main St, New York, NY').then(console.log);
```

### 2. Test Different Scenarios
- ✅ Location permission granted
- ❌ Location permission denied
- 🌐 No internet connection
- 📱 Mobile device vs desktop
- 🔒 HTTPS vs HTTP (dev vs prod)

## 🚀 Deployment Checklist

### Before Deploying to Amplify:
- [ ] API keys added to Amplify environment variables
- [ ] Location permissions handled gracefully
- [ ] Fallback geocoding services configured
- [ ] Privacy policy updated with location usage
- [ ] Mobile responsiveness tested
- [ ] Error states handled properly

### Post-Deployment Testing:
- [ ] Location detection works on production domain
- [ ] Geocoding APIs respond correctly
- [ ] Distance calculations are accurate
- [ ] Performance is acceptable (< 2s for location)

## 🎯 Advanced Features (Optional)

### 1. Location History
```typescript
// Track user's location over time for better recommendations
const { locations, startWatching } = useLocationWatch();
```

### 2. Geofencing
```typescript
// Notify users when they're near food opportunities
const isNearFood = locations.some(location => 
  calculateDistance(userLocation, location) < 0.5 // 500m
);
```

### 3. Route Optimization
```typescript
// Help users plan pickup routes
const optimizeRoute = (userLocation: Coordinates, foodItems: FoodItem[]) => {
  // Implement traveling salesman algorithm
};
```

## 🆘 Troubleshooting

### Common Issues:

**"Location not supported"**
- Check if running on HTTPS (required for production)
- Verify browser compatibility

**"Geocoding failed"**
- Check API key validity
- Verify API quotas not exceeded
- Test fallback to Nominatim

**"Permission denied"**
- Provide clear explanation to users
- Offer manual address entry
- Show graceful fallback UI

**"Slow performance"**
- Implement debouncing for address input
- Cache geocoding results
- Use lower accuracy for faster results

## 📊 Analytics & Monitoring

Track geolocation usage:
```typescript
// Log location feature usage
analytics.track('location_requested', {
  success: result.success,
  accuracy: result.accuracy,
  source: result.source
});
```

This implementation provides a robust, privacy-compliant geolocation system for your food surplus platform on AWS Amplify!
