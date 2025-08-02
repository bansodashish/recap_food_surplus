import type { FoodItem, APIResponse, PaginatedResponse, SearchFilters, User, SustainabilityMetrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Food Items
  async getFoodItems(
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<APIResponse<PaginatedResponse<FoodItem>>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.listingType && { listingType: filters.listingType }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
    });

    return this.request<PaginatedResponse<FoodItem>>(`/food-items?${queryParams}`);
  }

  async getFoodItem(id: string): Promise<APIResponse<FoodItem>> {
    return this.request<FoodItem>(`/food-items/${id}`);
  }

  async createFoodItem(item: Partial<FoodItem>): Promise<APIResponse<FoodItem>> {
    return this.request<FoodItem>('/food-items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<APIResponse<FoodItem>> {
    return this.request<FoodItem>(`/food-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFoodItem(id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/food-items/${id}`, {
      method: 'DELETE',
    });
  }

  // Image Upload
  async uploadImage(file: File): Promise<APIResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request<{ url: string }>('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set Content-Type for FormData
    });
  }

  // Search
  async searchFoodItems(
    query: string,
    filters?: SearchFilters
  ): Promise<APIResponse<FoodItem[]>> {
    const queryParams = new URLSearchParams({
      q: query,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.listingType && { listingType: filters.listingType }),
    });

    return this.request<FoodItem[]>(`/search?${queryParams}`);
  }

  // Sustainability Metrics
  async getSustainabilityMetrics(): Promise<APIResponse<SustainabilityMetrics>> {
    return this.request<SustainabilityMetrics>('/sustainability/metrics');
  }

  // User Profile
  async getUserProfile(): Promise<APIResponse<User>> {
    return this.request<User>('/user/profile');
  }

  async updateUserProfile(updates: Partial<User>): Promise<APIResponse<User>> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiService = new APIService();
