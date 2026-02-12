/**
 * Bookings Routes
 * Handles all booking-related endpoints for customers
 */

import { Router } from 'express';
import {
  listBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingStatus,
  getBookingExtensions,
  approveExtension,
  declineExtension,
  respondToExtension
} from '../controllers/bookings.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireCustomer } from '../middleware/rbac';

const router = Router();

/**
 * POST /api/bookings
 * Create new booking (supports both authenticated and guest checkout)
 * Body:
 * - customer: { email, firstName, lastName, phone } (required for guest checkout)
 * - vehicle: { brand, model, year, mileage } (required)
 * - services: string[] (required)
 * - pickup: { date, timeSlot, street, city, postalCode } (required)
 * - delivery: { date, timeSlot } (required)
 * - customerNotes: string (optional)
 */
router.post('/', optionalAuthenticate, createBooking);

/**
 * All other routes require authentication and customer role
 */
const authRequired = [authenticate, requireCustomer];

/**
 * GET /api/bookings
 * Get all bookings for authenticated customer
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - status: BookingStatus (optional)
 */
router.get('/', authRequired, listBookings);

/**
 * GET /api/bookings/:id
 * Get single booking by ID
 */
router.get('/:id', authRequired, getBooking);

/**
 * PUT /api/bookings/:id
 * Update booking
 * Customers can only update customerNotes
 * Body:
 * - customerNotes: string (optional)
 */
router.put('/:id', authRequired, updateBooking);

/**
 * DELETE /api/bookings/:id
 * Cancel booking
 * Body:
 * - reason: string (optional)
 * Only allowed for bookings in PENDING_PAYMENT, CONFIRMED, or JOCKEY_ASSIGNED status
 */
router.delete('/:id', authRequired, cancelBooking);

/**
 * GET /api/bookings/:id/status
 * Get current booking status with history
 */
router.get('/:id/status', authRequired, getBookingStatus);

/**
 * GET /api/bookings/:id/extensions
 * Get all extensions for a booking
 */
router.get('/:id/extensions', authRequired, getBookingExtensions);

/**
 * POST /api/bookings/:id/extensions/:extensionId/approve
 * Approve an extension and create payment intent
 */
router.post('/:id/extensions/:extensionId/approve', authRequired, approveExtension);

/**
 * POST /api/bookings/:id/extensions/:extensionId/decline
 * Decline an extension
 * Body:
 * - reason: string (optional)
 */
router.post('/:id/extensions/:extensionId/decline', authRequired, declineExtension);

/**
 * POST /api/bookings/:id/extensions/:extensionId/respond
 * Respond to an extension with per-item accept/reject
 * Body:
 * - acceptedItemIndices: number[] (indices of accepted items)
 */
router.post('/:id/extensions/:extensionId/respond', authRequired, respondToExtension);

export default router;
