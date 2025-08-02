export interface FoodItem {
  id: string;
  title: string;
  description: string;
  category: 'fruits' | 'vegetables' | 'dairy' | 'meat' | 'grains' | 'beverages' | 'prepared' | 'other';
  originalPrice: number;
  discountedPrice?: number;
  expiryDate: string;
  quantity: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'pieces' | 'packs';
  images: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    zipCode: string;
  };
  seller: {
    id: string;
    name: string;
    rating: number;
    avatar?: string;
  };
  status: 'available' | 'reserved' | 'sold' | 'expired';
  listingType: 'sell' | 'donate';
  createdAt: string;
  updatedAt: string;
  sustainabilityScore?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  rating: number;
  totalListings: number;
  totalDonations: number;
  joinedAt: string;
  preferences: {
    notifications: boolean;
    categories: string[];
    maxDistance: number;
  };
}

export interface Transaction {
  id: string;
  foodItemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  type: 'purchase' | 'donation';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentIntentId?: string;
  deliveryInfo?: {
    address: string;
    estimatedDelivery: string;
    trackingNumber?: string;
    carrier?: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface SustainabilityMetrics {
  totalFoodSaved: number; // in kg
  co2Reduced: number; // in kg CO2
  waterSaved: number; // in liters
  moneySaved: number; // in USD
  mealsProvided: number;
  wasteReduction: number; // percentage
  impactScore: number; // 0-100
  monthlyData: {
    month: string;
    foodSaved: number;
    co2Reduced: number;
    transactions: number;
  }[];
}

export interface DeliveryRequest {
  id: string;
  transactionId: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedCost: number;
  status: 'requested' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  location?: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
  listingType?: 'sell' | 'donate' | 'both';
  sortBy?: 'price' | 'distance' | 'expiry' | 'created' | 'rating';
  sortOrder?: 'asc' | 'desc';
}
