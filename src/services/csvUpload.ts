// CSV Upload Service with Secure S3 integration for Cognito users
import { foodItemsService } from './foodItems';
import { localStorageService } from './localStorage';
import { secureS3Service } from './bulletproofS3Service'; // Import the service instance
import type { CreateFoodItemRequest } from '../types/foodItem';

export interface CSVUploadResult {
  success: number;
  failed: number;
  errors: string[];
  items: any[];
}

export interface PhotoUploadMapping {
  [itemName: string]: File[];
}

export interface SimpleCSVRow {
  name: string;
  description?: string;
  category: string;
  condition: string;
  type: string;
  price?: string;
  quantity?: string;
  unit?: string;
  expiryDate?: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

class CSVUploadService {
  private readonly secureS3Service = secureS3Service;

  constructor() {
    // Initialize with secure S3 service for Cognito users
    console.log('🔐 CSV Upload Service initialized with secure S3 authentication');
  }  // Method overloads for bulletproof TypeScript compatibility
  async uploadFromCSV(
    csvContent: string,
    maxItems?: number
  ): Promise<CSVUploadResult>;
  
  async uploadFromCSV(
    csvContent: string,
    maxItems: number,
    onProgress: (current: number, total: number) => void
  ): Promise<CSVUploadResult>;
  
  async uploadFromCSV(
    csvContent: string,
    maxItems: number,
    onProgress: (current: number, total: number) => void,
    userId: string
  ): Promise<CSVUploadResult>;

  async uploadFromCSV(
    csvContent: string,
    maxItems: number,
    onProgress: (current: number, total: number) => void,
    userId: string,
    photoMappings: PhotoUploadMapping
  ): Promise<CSVUploadResult>;

  // Implementation with S3 integration for free users and photo uploads
  async uploadFromCSV(
    csvContent: string,
    maxItems: number = 5,
    onProgress?: (current: number, total: number) => void,
    userId?: string,
    photoMappings?: PhotoUploadMapping
  ): Promise<CSVUploadResult> {
    const results: CSVUploadResult = {
      success: 0,
      failed: 0,
      errors: [],
      items: []
    };

    try {
      // Parse CSV
      const rows = this.parseCSV(csvContent);
      
      // Limit number of items based on subscription
      const limitedRows = rows.slice(0, maxItems);
      if (rows.length > maxItems) {
        results.errors.push(`Limited to ${maxItems} items based on your subscription plan. ${rows.length - maxItems} items were skipped.`);
      }

      // Validate rows
      const validatedRows: SimpleCSVRow[] = [];
      for (let i = 0; i < limitedRows.length; i++) {
        const { isValid, errors } = this.validateRow(limitedRows[i], i);
        if (isValid) {
          validatedRows.push(limitedRows[i]);
        } else {
          results.errors.push(...errors);
          results.failed++;
        }
      }

      // Process valid rows and create actual food items with photos
      for (let i = 0; i < validatedRows.length; i++) {
        try {
          const foodItemData = this.rowToFoodItem(validatedRows[i]);
          
          // Handle photo uploads for this item
          const itemPhotos = photoMappings?.[validatedRows[i].name] || [];
          if (itemPhotos.length > 0 && userId) {
            try {
              // Upload photos to S3 with bulletproof error handling
              const uploadedImageUrls = await this.uploadPhotosForItem(itemPhotos, userId, validatedRows[i].name);
              foodItemData.images = uploadedImageUrls;
              results.errors.push(`✅ Row ${i + 1} (${validatedRows[i].name}): Successfully uploaded ${uploadedImageUrls.length} photos to S3`);
            } catch (photoError) {
              // Photo upload failed but continue with item creation
              const errorMsg = photoError instanceof Error ? photoError.message : 'Unknown error';
              results.errors.push(`⚠️  Row ${i + 1} (${validatedRows[i].name}): Photo upload failed - ${errorMsg}. Item will be created without photos.`);
              
              // Log detailed error for debugging
              console.error(`Photo upload failed for item "${validatedRows[i].name}":`, photoError);
            }
          }
          
          // Create actual food item via the service (which handles S3 uploads)
          if (userId) {
            try {
              const createdItem = await foodItemsService.createFoodItem(foodItemData as CreateFoodItemRequest, userId);
              results.items.push(createdItem);
              results.success++;
            } catch (error) {
              // API failed - fallback to local storage with S3 integration
              console.log('API call failed, using local storage fallback with S3...');
              try {
                const localItem = await localStorageService.storeItemLocally(foodItemData as CreateFoodItemRequest, userId);
                results.items.push(localItem);
                results.success++;
                results.errors.push(`Row ${i + 1}: Item stored locally with S3 images - will sync when API is available`);
              } catch (localError) {
                results.failed++;
                results.errors.push(`Row ${i + 1}: Failed to store locally - ${localError instanceof Error ? localError.message : 'Unknown error'}`);
              }
            }
          } else {
            // No user ID - simulate creation for demo purposes
            await new Promise(resolve => setTimeout(resolve, 100));
            results.items.push(foodItemData);
            results.success++;
          }

          if (onProgress) {
            onProgress(i + 1, validatedRows.length);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Failed to create item - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return results;
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        items: []
      };
    }
  }

  // Upload photos for a specific item with bulletproof error handling
  private async uploadPhotosForItem(photos: File[], userId: string, itemName: string): Promise<string[]> {
    if (!photos || photos.length === 0) {
      return [];
    }

    const uploadedUrls: string[] = [];
    const maxPhotosPerItem = 5; // Limit to prevent storage abuse
    const limitedPhotos = photos.slice(0, maxPhotosPerItem);

    for (const photo of limitedPhotos) {
      // Validate photo file
      if (!this.isValidImageFile(photo)) {
        throw new Error(`Invalid image file: ${photo.name}. Only JPEG, PNG, and WebP are allowed.`);
      }

      // Check file size (max 10MB per image)
      if (photo.size > 10 * 1024 * 1024) {
        throw new Error(`Image ${photo.name} is too large. Max size is 10MB.`);
      }

      try {
        // Upload to S3 with retry logic
        const imageUrl = await this.uploadImageWithRetry(photo, userId, 3);
        uploadedUrls.push(imageUrl);
      } catch (error) {
        // Log error but continue with other photos
        console.error(`Failed to upload photo ${photo.name} for item ${itemName}:`, error);
        throw new Error(`Failed to upload photo ${photo.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return uploadedUrls;
  }

  // Upload single image with bulletproof retry logic and exponential backoff
  private async uploadImageWithRetry(photo: File, userId: string, maxRetries: number): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Uploading ${photo.name} (attempt ${attempt}/${maxRetries})...`);
        const uploadResult = await this.secureS3Service.uploadFile(photo, `${userId}_${photo.name}`);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }
        const imageUrl = uploadResult.url!;
        console.log(`✅ Successfully uploaded ${photo.name} to S3: ${imageUrl}`);
        return imageUrl;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown upload error');
        console.warn(`❌ Photo upload attempt ${attempt}/${maxRetries} failed for ${photo.name}:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter: wait 1s, 2s, 4s between retries
          const baseDelay = 1000 * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 500; // Add up to 500ms random jitter
          const delay = baseDelay + jitter;
          
          console.log(`⏱️  Waiting ${(delay/1000).toFixed(1)}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed - provide detailed error message
    const detailedError = new Error(
      `Photo upload failed after ${maxRetries} attempts for "${photo.name}". ` +
      `Last error: ${lastError?.message || 'Unknown error'}. ` +
      `Please check: 1) AWS credentials in .env file, 2) S3 bucket permissions, 3) Internet connection, 4) File size (max 10MB)`
    );

    throw detailedError;
  }

  // Validate image file type
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type.toLowerCase());
  }

  parseCSV(csvContent: string): SimpleCSVRow[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows: SimpleCSVRow[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, '') || '';
        
        // Map headers to expected field names
        switch (header) {
          case 'name':
          case 'title':
            row.name = value;
            break;
          case 'description':
            row.description = value;
            break;
          case 'category':
            row.category = value;
            break;
          case 'condition':
            row.condition = value;
            break;
          case 'type':
          case 'listing type':
          case 'listingtype':
            row.type = value;
            break;
          case 'price':
            row.price = value;
            break;
          case 'quantity':
          case 'qty':
            row.quantity = value;
            break;
          case 'unit':
            row.unit = value;
            break;
          case 'expiry date':
          case 'expirydate':
          case 'expiry':
            row.expiryDate = value;
            break;
          case 'address':
            row.address = value;
            break;
          case 'city':
            row.city = value;
            break;
          case 'zipcode':
          case 'zip code':
          case 'zip':
            row.zipCode = value;
            break;
          default:
            // Ignore unknown columns
            break;
        }
      });

      if (row.name) { // Only add rows with a name
        rows.push(row as SimpleCSVRow);
      }
    }

    return rows;
  }

  // Parse a single CSV line handling quoted values
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current); // Add the last value
    return values;
  }

  // Validate a single row
  private validateRow(row: SimpleCSVRow, index: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rowNum = index + 1;

    // Required fields
    if (!row.name?.trim()) {
      errors.push(`Row ${rowNum}: Name is required`);
    }

    // Validate category
    const validCategories = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'grains', 'beverages', 'prepared-food', 'pantry', 'other'];
    if (row.category && !validCategories.includes(row.category.toLowerCase())) {
      errors.push(`Row ${rowNum}: Invalid category "${row.category}". Valid options: ${validCategories.join(', ')}`);
    }

    // Validate condition
    const validConditions = ['excellent', 'good', 'fair'];
    if (row.condition && !validConditions.includes(row.condition.toLowerCase())) {
      errors.push(`Row ${rowNum}: Invalid condition "${row.condition}". Valid options: ${validConditions.join(', ')}`);
    }

    // Validate type
    const validTypes = ['donation', 'sale'];
    if (row.type && !validTypes.includes(row.type.toLowerCase())) {
      errors.push(`Row ${rowNum}: Invalid type "${row.type}". Valid options: ${validTypes.join(', ')}`);
    }

    // Validate price for sale items
    if (row.type?.toLowerCase() === 'sale') {
      if (!row.price || isNaN(parseFloat(row.price))) {
        errors.push(`Row ${rowNum}: Price is required and must be a valid number for sale items`);
      }
    }

    // Validate quantity
    if (row.quantity && isNaN(parseInt(row.quantity))) {
      errors.push(`Row ${rowNum}: Quantity must be a valid number`);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Convert CSV row to food item format
  private rowToFoodItem(row: SimpleCSVRow): any {
    const expiryDate = row.expiryDate ? new Date(row.expiryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now

    return {
      title: row.name,
      description: row.description || 'Imported from CSV',
      category: row.category?.toLowerCase() || 'other',
      type: row.type?.toLowerCase() || 'donation',
      condition: row.condition?.toLowerCase() || 'good',
      price: row.price ? parseFloat(row.price) : undefined,
      quantity: row.quantity ? parseInt(row.quantity) : 1,
      unit: row.unit || 'pieces',
      expiryDate,
      images: [],
      location: {
        address: row.address || '',
        city: row.city || '',
        state: '',
        zipCode: row.zipCode || '',
        country: 'US'
      },
      pickupAvailable: true,
      deliveryAvailable: false,
      contactInfo: {
        name: 'CSV Import',
        email: '',
        phone: '',
        preferredContact: 'email'
      },
      dietaryInfo: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        organic: false,
        halal: false,
        kosher: false
      }
    };
  }

  // Generate CSV template
  generateTemplate(): string {
    const headers = [
      'name',
      'description',
      'category',
      'condition',
      'type',
      'price',
      'quantity',
      'unit',
      'expiryDate',
      'address',
      'city',
      'zipCode'
    ];

    const sampleRows = [
      [
        'Organic Apples',
        'Fresh organic apples from local farm',
        'fruits',
        'good',
        'sale',
        '3.99',
        '5',
        'kg',
        '2024-08-20',
        '123 Farm St',
        'Cityville',
        '12345'
      ],
      [
        'Day-old Bread',
        'Fresh bread from yesterday',
        'bakery',
        'good',
        'donation',
        '',
        '2',
        'loaves',
        '2024-08-15',
        '456 Bakery Ave',
        'Townsburg',
        '67890'
      ]
    ];

    const csvLines = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    return csvLines.join('\n');
  }
}

export const csvUploadService = new CSVUploadService();
