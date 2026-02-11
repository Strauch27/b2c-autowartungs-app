/**
 * Jockey API Client
 * Handles all jockey-related API calls
 */

import { apiClient } from './client';

/**
 * Jockey assignment data structure
 */
export interface JockeyAssignment {
  id: string;
  bookingId: string;
  jockeyId: string;
  type: 'PICKUP' | 'RETURN';
  status: 'ASSIGNED' | 'EN_ROUTE' | 'AT_LOCATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledTime: string;
  arrivedAt?: string;
  departedAt?: string;
  completedAt?: string;

  // Customer info
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerPostalCode: string;

  // Vehicle info
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;

  // Handover data
  handoverData?: {
    photos?: string[];
    customerSignature?: string;
    ronjaSignature?: string;
    notes?: string;
    mileage?: number;
  };

  // Relations (from include)
  booking?: {
    id: string;
    bookingNumber: string;
    status: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
    vehicle: {
      id: string;
      brand: string;
      model: string;
      licensePlate: string;
    };
  };

  createdAt: string;
  updatedAt: string;
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
 * Get assignments params
 */
export interface GetAssignmentsParams {
  status?: 'all' | 'ASSIGNED' | 'EN_ROUTE' | 'AT_LOCATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  limit?: number;
}

/**
 * Update status params
 */
export interface UpdateStatusParams {
  status: 'ASSIGNED' | 'EN_ROUTE' | 'AT_LOCATION' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

/**
 * Handover data
 */
export interface HandoverData {
  photos?: string[];
  customerSignature?: string;
  ronjaSignature?: string;
  notes?: string;
  mileage?: number;
}

/**
 * Jockeys API
 */
export const jockeysApi = {
  /**
   * Get all assignments for logged-in jockey
   */
  async getAssignments(params?: GetAssignmentsParams): Promise<{ assignments: JockeyAssignment[] }> {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `/api/jockeys/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get<ApiResponse<{ assignments: JockeyAssignment[] }>>(url);
    return response.data;
  },

  /**
   * Get single assignment
   */
  async getAssignment(id: string): Promise<{ assignment: JockeyAssignment }> {
    const response = await apiClient.get<ApiResponse<{ assignment: JockeyAssignment }>>(
      `/api/jockeys/assignments/${id}`
    );
    return response.data;
  },

  /**
   * Update assignment status
   */
  async updateStatus(id: string, params: UpdateStatusParams): Promise<{ assignment: JockeyAssignment }> {
    const response = await apiClient.patch<ApiResponse<{ assignment: JockeyAssignment }>>(
      `/api/jockeys/assignments/${id}/status`,
      params
    );
    return response.data;
  },

  /**
   * Save handover data
   */
  async saveHandover(id: string, data: HandoverData): Promise<{ assignment: JockeyAssignment }> {
    const response = await apiClient.post<ApiResponse<{ assignment: JockeyAssignment }>>(
      `/api/jockeys/assignments/${id}/handover`,
      data
    );
    return response.data;
  },

  /**
   * Complete assignment (shortcut for status + handover)
   */
  async completeAssignment(id: string, handoverData?: HandoverData): Promise<{ assignment: JockeyAssignment }> {
    const response = await apiClient.post<ApiResponse<{ assignment: JockeyAssignment }>>(
      `/api/jockeys/assignments/${id}/complete`,
      { handoverData }
    );
    return response.data;
  },
};
