export type FoodCategory = 
  | 'fruits'
  | 'vegetables' 
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'grains'
  | 'beverages'
  | 'prepared-food'
  | 'pantry'
  | 'other';

export type ListingType = 'donation' | 'sale';

export type FoodCondition = 'excellent' | 'good' | 'fair';

export interface Location {
  address: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FoodItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: FoodCategory;
  type: ListingType;
  price?: number; // Only for sale items
  originalPrice?: number;
  quantity: number;
  unit: string; // kg, lbs, pieces, etc.
  condition: FoodCondition;
  expiryDate: Date;
  images: string[]; // S3 URLs
  location: Location;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryRadius?: number; // in km
  deliveryCost?: number;
  contactInfo: {
    name: string;
    phone?: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'both';
  };
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    organic: boolean;
    halal: boolean;
    kosher: boolean;
  };
  sustainabilityMetrics: {
    co2Saved: number;
    waterSaved: number;
    moneySaved: number;
  };
  status: 'available' | 'reserved' | 'completed' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // When the listing expires
  viewCount: number;
  interestedUsers: string[]; // User IDs who showed interest
}

export interface CreateFoodItemRequest {
  title: string;
  description: string;
  category: FoodCategory;
  type: ListingType;
  price?: number;
  originalPrice?: number;
  quantity: number;
  unit: string;
  condition: FoodCondition;
  expiryDate: string;
  images: File[];
  location: Location;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryRadius?: number;
  deliveryCost?: number;
  contactInfo: {
    name: string;
    phone?: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'both';
  };
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    organic: boolean;
    halal: boolean;
    kosher: boolean;
  };
}

export interface FoodItemFilters {
  category?: FoodCategory;
  type?: ListingType;
  location?: string;
  maxDistance?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  condition?: FoodCondition;
  dietaryRestrictions?: string[];
  availableToday?: boolean;
}

export const FOOD_CATEGORIES: { value: FoodCategory; label: string; icon: string }[] = [
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'vegetables', label: 'Vegetables', icon: '🥕' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'meat', label: 'Meat & Fish', icon: '🥩' },
  { value: 'bakery', label: 'Bakery', icon: '🍞' },
  { value: 'grains', label: 'Grains & Cereals', icon: '🌾' },
  { value: 'beverages', label: 'Beverages', icon: '🧃' },
  { value: 'prepared-food', label: 'Prepared Food', icon: '🍽️' },
  { value: 'pantry', label: 'Pantry Items', icon: '🥫' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const FOOD_CONDITIONS: { value: FoodCondition; label: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent', description: 'Perfect condition, fresh' },
  { value: 'good', label: 'Good', description: 'Minor imperfections, still fresh' },
  { value: 'fair', label: 'Fair', description: 'Approaching expiry but safe to consume' },
];

export const QUANTITY_UNITS = [
  'kg', 'lbs', 'pieces', 'grams', 'ounces', 'liters', 'gallons', 'cups', 'bags', 'boxes', 'cans'
];
