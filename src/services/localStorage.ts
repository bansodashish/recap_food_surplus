// Local Storage Service for Food Items with S3 integration
import type { FoodItem, CreateFoodItemRequest } from '../types/foodItem';
import { s3Service } from './s3';

const STORAGE_KEY = 'foodItems';

export interface LocalFoodItem extends Omit<FoodItem, 'id'> {
  id: string;
  localId: string;
  syncedToAPI: boolean;
  lastSync?: string;
}

class LocalStorageService {
  // Generate unique local ID
  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Store item locally with S3 integration
  async storeItemLocally(itemData: CreateFoodItemRequest, userId: string): Promise<LocalFoodItem> {
    try {
      // Upload images to S3
      let imageUrls: string[] = [];
      if (itemData.images && itemData.images.length > 0) {
        console.log(`Uploading ${itemData.images.length} images to S3...`);
        imageUrls = await s3Service.uploadMultipleImages(itemData.images, userId);
        console.log('Images uploaded to S3:', imageUrls);
      }

      // Create local item with S3 image URLs
      const localItem: LocalFoodItem = {
        id: this.generateLocalId(),
        localId: this.generateLocalId(),
        ...itemData,
        userId,
        images: imageUrls,
        expiryDate: new Date(itemData.expiryDate),
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        viewCount: 0,
        interestedUsers: [],
        syncedToAPI: false,
        sustainabilityMetrics: {
          co2Saved: Math.round(Math.random() * 10 * 100) / 100,
          waterSaved: Math.round(Math.random() * 50 * 100) / 100,
          moneySaved: Math.round(Math.random() * 5 * 100) / 100,
        }
      };

      // Store in localStorage
      this.saveLocalItem(localItem);
      
      console.log('Item stored locally with S3 images:', localItem);
      return localItem;
    } catch (error) {
      console.error('Error storing item locally:', error);
      throw error;
    }
  }

  // Save single item to localStorage
  private saveLocalItem(item: LocalFoodItem): void {
    const existingItems = this.getAllLocalItems();
    const updatedItems = existingItems.filter(i => i.id !== item.id);
    updatedItems.push(item);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  }

  // Get all locally stored items
  getAllLocalItems(): LocalFoodItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const items = JSON.parse(stored);
      return items.map((item: any) => ({
        ...item,
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        expiresAt: new Date(item.expiresAt),
      }));
    } catch (error) {
      console.error('Error reading local items:', error);
      return [];
    }
  }

  // Get items for specific user
  getUserLocalItems(userId: string): LocalFoodItem[] {
    const allItems = this.getAllLocalItems();
    return allItems.filter(item => item.userId === userId);
  }

  // Delete local item (and cleanup S3 images)
  async deleteLocalItem(itemId: string): Promise<void> {
    try {
      const allItems = this.getAllLocalItems();
      const itemToDelete = allItems.find(item => item.id === itemId);
      
      if (itemToDelete) {
        // Cleanup S3 images
        if (itemToDelete.images && itemToDelete.images.length > 0) {
          await Promise.all(
            itemToDelete.images.map(url => s3Service.deleteImage(url).catch((err: unknown) => 
              console.warn('Failed to delete S3 image:', url, err)
            ))
          );
        }
        
        // Remove from localStorage
        const updatedItems = allItems.filter(item => item.id !== itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Error deleting local item:', error);
      throw error;
    }
  }

  // Get user item count
  getUserItemCount(userId: string): number {
    return this.getUserLocalItems(userId).length;
  }

  // Clear all local items
  clearAllLocalItems(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Get storage statistics
  getStorageStats(): {
    totalItems: number;
    totalSize: string;
    itemsWithS3Images: number;
  } {
    const items = this.getAllLocalItems();
    const totalItems = items.length;
    const itemsWithS3Images = items.filter(item => item.images && item.images.length > 0).length;
    
    const storageData = localStorage.getItem(STORAGE_KEY) || '';
    const totalSize = `${Math.round(storageData.length / 1024)}KB`;
    
    return {
      totalItems,
      totalSize,
      itemsWithS3Images,
    };
  }
}

export const localStorageService = new LocalStorageService();
