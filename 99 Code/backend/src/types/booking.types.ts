/**
 * Booking Types
 * Type definitions for booking-related operations
 */

import { ServiceType, BookingStatus, ExtensionStatus } from '@prisma/client';

/**
 * Vehicle data for booking creation
 * Can either reference an existing vehicle or create a new one
 */
export interface BookingVehicleData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate?: string;
  saveVehicle?: boolean; // Whether to save this vehicle for future use
}

/**
 * Service selection for booking
 */
export interface BookingService {
  type: ServiceType;
  price: number;
}

/**
 * Pickup and delivery scheduling
 */
export interface BookingSchedule {
  date: string; // ISO date string
  timeSlot: string; // Format: "HH:MM-HH:MM"
}

/**
 * Address information
 */
export interface BookingAddress {
  street: string;
  city: string;
  postalCode: string;
}

/**
 * Complete booking creation DTO from frontend
 */
export interface CreateBookingDto {
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
 * Internal service mapping
 * Maps frontend service IDs to ServiceType enum and pricing
 */
export interface ServiceMapping {
  id: string;
  type: ServiceType;
  basePrice: number;
  name: string;
}

/**
 * Extension creation DTO
 */
export interface CreateExtensionDto {
  description: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  images?: string[];
  videos?: string[];
}

/**
 * Booking response with relations
 */
export interface BookingResponse {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  serviceType: ServiceType;
  services?: BookingService[];
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
    licensePlate?: string;
  };
  jockey?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * Extension response
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
  status: ExtensionStatus;
  createdAt: string;
  approvedAt?: string;
  declinedAt?: string;
}
