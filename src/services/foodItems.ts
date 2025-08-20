import type { FoodItem, CreateFoodItemRequest, FoodItemFilters } from '../types/foodItem';
import { secureS3Service as s3Service } from './bulletproofS3Service';
import { localStorageService } from './localStorage';

// Mock API base URL - replace with your actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export class FoodItemsService {
  /**
   * Get user's item count for subscription limit checking (includes local items)
   */
  async getUserItemCount(userId: string): Promise<number> {
    // In demo mode, only use local storage
    if (DEMO_MODE) {
      console.log('🎭 Demo mode: Using local storage for user item count');
      return localStorageService.getUserItemCount(userId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/user/${userId}/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        // Fallback: get all user items and count them
        const items = await this.getUserFoodItems(userId);
        return items.length;
      }

      const { count } = await response.json();
      
      // Add local items count
      const localCount = localStorageService.getUserItemCount(userId);
      return count + localCount;
    } catch (error) {
      console.error('Error getting user item count from API, using local storage:', error);
      // Fallback to local storage only
      return localStorageService.getUserItemCount(userId);
    }
  }

  /**
   * Check if user can add more items based on subscription limits
   */
  async canUserAddItems(userId: string, itemCount: number, maxItems: number): Promise<{ canAdd: boolean; currentCount: number; remainingItems: number }> {
    try {
      const currentCount = await this.getUserItemCount(userId);
      const remainingItems = maxItems === -1 ? Number.MAX_SAFE_INTEGER : Math.max(0, maxItems - currentCount);
      const canAdd = maxItems === -1 || currentCount + itemCount <= maxItems;

      return {
        canAdd,
        currentCount,
        remainingItems: maxItems === -1 ? Number.MAX_SAFE_INTEGER : remainingItems
      };
    } catch (error) {
      console.error('Error checking user limits:', error);
      return { canAdd: false, currentCount: 0, remainingItems: 0 };
    }
  }

  /**
   * Create a new food item listing with subscription limit checking
   */
  async createFoodItem(itemData: CreateFoodItemRequest, userId: string): Promise<FoodItem> {
    try {
      // Upload images to S3
      let imageUrls: string[] = [];
      if (itemData.images && itemData.images.length > 0) {
        imageUrls = await s3Service.uploadMultipleImages(itemData.images, userId);
      }

      // Calculate sustainability metrics (mock calculation)
      const sustainabilityMetrics = this.calculateSustainabilityMetrics(
        itemData.quantity,
        itemData.originalPrice || itemData.price || 0
      );

      // Prepare the item data
      const foodItemData = {
        ...itemData,
        userId,
        images: imageUrls,
        expiryDate: new Date(itemData.expiryDate),
        sustainabilityMetrics,
        status: 'available' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        viewCount: 0,
        interestedUsers: [],
      };

      // In demo mode, save to local storage instead of API
      if (DEMO_MODE) {
        console.log('🎭 Demo mode: Saving item to local storage');
        const savedItem = await localStorageService.storeItemLocally(itemData, userId);
        return savedItem;
      }

      // Make API call to create item
      const response = await fetch(`${API_BASE_URL}/api/food-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(foodItemData),
      });

      if (!response.ok) {
        throw new Error('Failed to create food item');
      }

      const createdItem: FoodItem = await response.json();
      return createdItem;
    } catch (error) {
      console.error('Error creating food item:', error);
      
      // Clean up uploaded images if item creation fails
      if (itemData.images && itemData.images.length > 0) {
        try {
          const imageUrls = await s3Service.uploadMultipleImages(itemData.images, userId);
          await Promise.all(imageUrls.map(url => s3Service.deleteImage(url)));
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded images:', cleanupError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Add basic filters to query params
   */
  private addBasicFilters(queryParams: URLSearchParams, filters: FoodItemFilters): void {
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.type) queryParams.set('type', filters.type);
    if (filters.location) queryParams.set('location', filters.location);
    if (filters.maxDistance) queryParams.set('maxDistance', filters.maxDistance.toString());
    if (filters.condition) queryParams.set('condition', filters.condition);
    if (filters.availableToday) queryParams.set('availableToday', 'true');
  }

  /**
   * Add price range filters to query params
   */
  private addPriceFilters(queryParams: URLSearchParams, filters: FoodItemFilters): void {
    if (filters.priceRange) {
      queryParams.set('minPrice', filters.priceRange.min.toString());
      queryParams.set('maxPrice', filters.priceRange.max.toString());
    }
  }

  /**
   * Add dietary restriction filters to query params
   */
  private addDietaryFilters(queryParams: URLSearchParams, filters: FoodItemFilters): void {
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      queryParams.set('dietaryRestrictions', filters.dietaryRestrictions.join(','));
    }
  }

  /**
   * Build query parameters for filtering
   */
  private buildQueryParams(filters?: FoodItemFilters): URLSearchParams {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      this.addBasicFilters(queryParams, filters);
      this.addPriceFilters(queryParams, filters);
      this.addDietaryFilters(queryParams, filters);
    }

    return queryParams;
  }

  /**
   * Get food items with optional filters
   */
  async getFoodItems(filters?: FoodItemFilters): Promise<FoodItem[]> {
    // In demo mode, use local storage
    if (DEMO_MODE) {
      console.log('🎭 Demo mode: Getting items from local storage');
      return localStorageService.getAllLocalItems();
    }

    try {
      const queryParams = this.buildQueryParams(filters);

      const response = await fetch(`${API_BASE_URL}/api/food-items?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const items: FoodItem[] = await response.json();
      return items.map(item => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        expiresAt: new Date(item.expiresAt),
      }));
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }
  }

  /**
   * Get food items by user ID with localStorage fallback
   */
  async getUserFoodItems(userId: string): Promise<FoodItem[]> {
    // In demo mode, use local storage
    if (DEMO_MODE) {
      console.log('🎭 Demo mode: Getting user items from local storage');
      return localStorageService.getUserLocalItems(userId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user food items from API');
      }

      const items: FoodItem[] = await response.json();
      return items.map(item => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        expiresAt: new Date(item.expiresAt),
      }));
    } catch (error) {
      console.error('API failed, falling back to local storage:', error);
      
      // Fallback to local storage
      const localItems = localStorageService.getUserLocalItems(userId);
      console.log(`Found ${localItems.length} items in local storage for user ${userId}`);
      
      // Convert LocalFoodItem to FoodItem format
      return localItems.map(localItem => ({
        ...localItem,
        // Remove local-specific fields
        syncedToAPI: undefined,
        lastSync: undefined,
        localId: undefined,
      } as FoodItem));
    }
  }

  /**
   * Get a single food item by ID
   */
  async getFoodItemById(itemId: string): Promise<FoodItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food item');
      }

      const item: FoodItem = await response.json();
      return {
        ...item,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        expiresAt: new Date(item.expiresAt),
      };
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
    }
  }

  /**
   * Update a food item
   */
  async updateFoodItem(itemId: string, updates: Partial<CreateFoodItemRequest>): Promise<FoodItem> {
    try {
      // Handle image updates if provided
      let imageUrls: string[] | undefined;
      if (updates.images && updates.images.length > 0) {
        // Get current item to delete old images
        const currentItem = await this.getFoodItemById(itemId);
        imageUrls = await s3Service.uploadMultipleImages(updates.images, currentItem.userId);
        
        // Delete old images
        if (currentItem.images && currentItem.images.length > 0) {
          await Promise.all(currentItem.images.map(url => s3Service.deleteImage(url)));
        }
      }

      const updateData = {
        ...updates,
        ...(imageUrls && { images: imageUrls }),
        updatedAt: new Date(),
      };

      const response = await fetch(`${API_BASE_URL}/api/food-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update food item');
      }

      const updatedItem: FoodItem = await response.json();
      return {
        ...updatedItem,
        expiryDate: new Date(updatedItem.expiryDate),
        createdAt: new Date(updatedItem.createdAt),
        updatedAt: new Date(updatedItem.updatedAt),
        expiresAt: new Date(updatedItem.expiresAt),
      };
    } catch (error) {
      console.error('Error updating food item:', error);
      throw error;
    }
  }

  /**
   * Delete a food item
   */
  async deleteFoodItem(itemId: string): Promise<void> {
    try {
      // Get item to delete associated images
      const item = await this.getFoodItemById(itemId);

      const response = await fetch(`${API_BASE_URL}/api/food-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete food item');
      }

      // Delete associated images
      if (item.images && item.images.length > 0) {
        await Promise.all(item.images.map(url => s3Service.deleteImage(url)));
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      throw error;
    }
  }

  /**
   * Mark user as interested in a food item
   */
  async expressInterest(itemId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/${itemId}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to express interest');
      }
    } catch (error) {
      console.error('Error expressing interest:', error);
      throw error;
    }
  }

  /**
   * Update item status
   */
  async updateItemStatus(itemId: string, status: FoodItem['status']): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/food-items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  }

  /**
   * Calculate sustainability metrics (simplified calculation)
   */
  private calculateSustainabilityMetrics(quantity: number, value: number) {
    return {
      co2Saved: Math.round(quantity * 2.5), // kg CO2 saved (estimate)
      waterSaved: Math.round(quantity * 150), // liters water saved (estimate)
      moneySaved: Math.round(value * 0.8), // Money saved for recipient
    };
  }

  /**
   * Search food items by text
   */
  async searchFoodItems(query: string, filters?: FoodItemFilters): Promise<FoodItem[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('q', query);
      
      if (filters) {
        if (filters.category) queryParams.set('category', filters.category);
        if (filters.type) queryParams.set('type', filters.type);
        if (filters.location) queryParams.set('location', filters.location);
        if (filters.maxDistance) queryParams.set('maxDistance', filters.maxDistance.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/food-items/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search food items');
      }

      const items: FoodItem[] = await response.json();
      return items.map(item => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        expiresAt: new Date(item.expiresAt),
      }));
    } catch (error) {
      console.error('Error searching food items:', error);
      throw error;
    }
  }
}

// Singleton instance
export const foodItemsService = new FoodItemsService();
