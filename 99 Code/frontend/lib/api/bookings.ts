/**
 * Bookings API Client
 * Handles all booking-related API calls
 */

import { apiClient } from './client';

/**
 * Vehicle data for booking creation
 */
export interface BookingVehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  saveVehicle?: boolean;
}

/**
 * Schedule data for pickup/delivery
 */
export interface BookingSchedule {
  date: string;
  timeSlot: string;
}

/**
 * Address data
 */
export interface BookingAddress {
  street: string;
  city: string;
  postalCode: string;
}

/**
 * Customer data for booking creation
 */
export interface BookingCustomerData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * Complete booking creation request
 */
export interface CreateBookingRequest {
  customer: BookingCustomerData;
  vehicle: BookingVehicleData;
  services: string[]; // Service IDs: ["inspection", "oil", "brakes", "ac"]
  pickup: BookingSchedule & BookingAddress;
  delivery: {
    date: string;
    timeSlot: string;
  };
  customerNotes?: string;
}

/**
 * Booking response
 */
export interface BookingResponse {
  id: string;
  bookingNumber: string;
  status: string;
  serviceType: string;
  services?: Array<{
    type: string;
    price: number;
  }>;
  totalPrice: string;
  priceBreakdown?: any;
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostalCode: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
  };
  jockey?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
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
 * Extension data
 */
export interface ExtensionResponse {
  id: string;
  bookingId: string;
  description: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  images: string[];
  videos: string[];
  status: string;
  paymentIntentId?: string;
  createdAt: string;
  approvedAt?: string;
  declinedAt?: string;
  paidAt?: string;
}

/**
 * Bookings API
 */
export const bookingsApi = {
  /**
   * Create a new booking
   */
  async create(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await apiClient.post<ApiResponse<BookingResponse>>(
      '/api/bookings',
      data
    );
    return response.data;
  },

  /**
   * Get all bookings for the authenticated user
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    bookings: BookingResponse[];
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
    const endpoint = `/api/bookings${query ? `?${query}` : ''}`;

    const response = await apiClient.get<PaginatedResponse<BookingResponse>>(endpoint);
    return {
      bookings: response.data,
      pagination: response.pagination
    };
  },

  /**
   * Get a single booking by ID
   */
  async getById(id: string): Promise<BookingResponse> {
    const response = await apiClient.get<ApiResponse<BookingResponse>>(
      `/api/bookings/${id}`
    );
    return response.data;
  },

  /**
   * Update a booking
   */
  async update(id: string, data: {
    customerNotes?: string;
  }): Promise<BookingResponse> {
    const response = await apiClient.put<ApiResponse<BookingResponse>>(
      `/api/bookings/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancel(id: string, reason?: string): Promise<BookingResponse> {
    const response = await apiClient.delete<ApiResponse<BookingResponse>>(
      `/api/bookings/${id}`
    );
    return response.data;
  },

  /**
   * Get booking status
   */
  async getStatus(id: string): Promise<{
    bookingNumber: string;
    status: string;
    statusHistory: Array<{ status: string; timestamp: string }>;
    currentLocation?: string;
    estimatedDelivery?: string;
  }> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/bookings/${id}/status`
    );
    return response.data;
  },

  /**
   * Get booking extensions
   */
  async getExtensions(id: string): Promise<ExtensionResponse[]> {
    const response = await apiClient.get<ApiResponse<ExtensionResponse[]>>(
      `/api/bookings/${id}/extensions`
    );
    return response.data;
  },

  /**
   * Authorize payment for extension (create PaymentIntent with manual capture)
   */
  async authorizeExtensionPayment(extensionId: string): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
  }> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/payment/authorize-extension`,
      { extensionId }
    );
    return response.data;
  },

  /**
   * Approve an extension (after payment authorization)
   */
  async approveExtension(extensionId: string, paymentIntentId: string): Promise<{
    extension: ExtensionResponse;
  }> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/extensions/${extensionId}/approve`,
      { paymentIntentId }
    );
    return response.data;
  },

  /**
   * Decline an extension
   */
  async declineExtension(
    extensionId: string,
    reason?: string
  ): Promise<ExtensionResponse> {
    const response = await apiClient.post<ApiResponse<ExtensionResponse>>(
      `/api/extensions/${extensionId}/decline`,
      { reason }
    );
    return response.data;
  }
};
