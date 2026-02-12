/**
 * Workshop API Client
 * Handles all workshop-related API calls
 */

import { apiClient } from './client';
import { BookingResponse, ExtensionResponse } from './bookings';

/**
 * Workshop order (booking from workshop perspective)
 */
export interface WorkshopOrder extends BookingResponse {
  // Bookings assigned to the workshop
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated response
 */
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Extension creation data
 */
export interface CreateExtensionData {
  description: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }>;
  images?: string[];
  videos?: string[];
}

/**
 * Workshops API
 */
export const workshopsApi = {
  /**
   * Get all orders for the authenticated workshop
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: WorkshopOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const endpoint = `/api/workshops/orders${query ? `?${query}` : ''}`;

    const response = await apiClient.get<PaginatedResponse<WorkshopOrder>>(endpoint);
    return {
      orders: response.data,
      pagination: response.pagination
    };
  },

  /**
   * Get a single order by ID
   */
  async getOrder(id: string): Promise<WorkshopOrder> {
    const response = await apiClient.get<ApiResponse<WorkshopOrder>>(
      `/api/workshops/orders/${id}`
    );
    return response.data;
  },

  /**
   * Update order status
   */
  async updateStatus(id: string, status: string): Promise<WorkshopOrder> {
    const response = await apiClient.put<ApiResponse<WorkshopOrder>>(
      `/api/workshops/orders/${id}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Create extension for an order
   */
  async createExtension(bookingId: string, data: CreateExtensionData): Promise<ExtensionResponse> {
    const response = await apiClient.post<ApiResponse<ExtensionResponse>>(
      `/api/workshops/orders/${bookingId}/extensions`,
      data
    );
    return response.data;
  }
};
