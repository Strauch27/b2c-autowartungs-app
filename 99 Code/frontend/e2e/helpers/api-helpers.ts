/**
 * API Helper for E2E Tests
 * Enables API-driven test setup for fast, stable E2E testing
 */

import { Page } from '@playwright/test';

const API_BASE = process.env.API_URL || 'http://localhost:5001/api';

export class ApiHelper {
  private token: string | null = null;

  constructor(private baseUrl: string = API_BASE) {}

  /**
   * Login and store token
   */
  async login(role: 'customer' | 'jockey' | 'workshop', credentials?: { email?: string; username?: string; password?: string }): Promise<string> {
    const defaults: Record<string, { email?: string; username?: string; password: string; endpoint: string }> = {
      customer: { email: 'kunde@test.de', password: 'password123', endpoint: '/auth/customer/login' },
      jockey: { username: 'jockey1', password: 'password123', endpoint: '/auth/jockey/login' },
      workshop: { username: 'werkstatt1', password: 'password123', endpoint: '/auth/workshop/login' },
    };

    const config = defaults[role];
    const body = role === 'customer'
      ? { email: credentials?.email || config.email, password: credentials?.password || config.password }
      : { username: credentials?.username || config.username, password: credentials?.password || config.password };

    const res = await fetch(`${this.baseUrl}${config.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error(`Login failed for ${role}: ${data.message || 'Unknown error'}`);
    }

    this.token = data.token;
    return data.token;
  }

  /**
   * Set token manually (e.g., from page context)
   */
  setToken(token: string): void {
    this.token = token;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  /**
   * Create a booking via API
   */
  async createBooking(data: {
    customer?: { email: string; firstName: string; lastName: string; phone: string };
    vehicle: { brand: string; model: string; year: number; mileage: number };
    services: string[];
    pickup: { date: string; timeSlot: string; street: string; city: string; postalCode: string };
    delivery: { date: string; timeSlot: string };
    customerNotes?: string;
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/bookings`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Create booking failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/bookings/${id}`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) throw new Error(`Get booking failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Get customer bookings
   */
  async getBookings(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/bookings`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) throw new Error(`Get bookings failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/bookings/${id}`, {
      method: 'DELETE',
      headers: this.headers,
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Cancel booking failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Update booking status (workshop)
   */
  async updateBookingStatus(bookingNumber: string, status: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/workshops/orders/${bookingNumber}/status`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Update status failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Get jockey assignments
   */
  async getAssignments(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/jockeys/assignments`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) throw new Error(`Get assignments failed: ${json.error?.message || json.message}`);
    return json.data.assignments;
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(assignmentId: string, status: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/jockeys/assignments/${assignmentId}/status`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Update assignment status failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Complete assignment
   */
  async completeAssignment(assignmentId: string, handoverData?: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/jockeys/assignments/${assignmentId}/complete`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ handoverData }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Complete assignment failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Get workshop orders
   */
  async getWorkshopOrders(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/workshops/orders`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) throw new Error(`Get workshop orders failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Create extension for a booking
   */
  async createExtension(bookingId: string, data: {
    description: string;
    items: Array<{ name: string; price: number; quantity: number }>;
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/workshops/orders/${bookingId}/extensions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Create extension failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Approve extension
   */
  async approveExtension(bookingId: string, extensionId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/bookings/${bookingId}/extensions/${extensionId}/approve`, {
      method: 'POST',
      headers: this.headers,
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Approve extension failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Decline extension
   */
  async declineExtension(bookingId: string, extensionId: string, reason?: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/bookings/${bookingId}/extensions/${extensionId}/decline`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Decline extension failed: ${json.error?.message || json.message}`);
    return json.data;
  }

  /**
   * Confirm demo payment
   */
  async confirmDemoPayment(paymentIntentId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/demo/payment/confirm`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ paymentIntentId }),
    });
    const json = await res.json();
    return json;
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/auth/me`, { headers: this.headers });
    const json = await res.json();
    if (!json.success) throw new Error(`Get me failed: ${json.message}`);
    return json.user;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      const json = await res.json();
      return json.status === 'ok';
    } catch {
      return false;
    }
  }
}
