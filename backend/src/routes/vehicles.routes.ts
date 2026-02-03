/**
 * Vehicles Routes
 * Handles all vehicle-related endpoints for customers
 */

import { Router } from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicles.controller';
import { authenticate } from '../middleware/auth';
import { requireCustomer } from '../middleware/rbac';

const router = Router();

/**
 * All routes require authentication and customer role
 */
router.use(authenticate);
router.use(requireCustomer);

/**
 * GET /api/vehicles
 * Get all vehicles for authenticated customer
 */
router.get('/', listVehicles);

/**
 * GET /api/vehicles/:id
 * Get single vehicle by ID
 * Query params:
 * - includeBookings: boolean - Include booking history
 */
router.get('/:id', getVehicle);

/**
 * POST /api/vehicles
 * Create new vehicle
 * Body:
 * - brand: string (required)
 * - model: string (required)
 * - year: number (required)
 * - mileage: number (required)
 * - licensePlate: string (optional)
 * - vin: string (optional)
 */
router.post('/', createVehicle);

/**
 * PATCH /api/vehicles/:id
 * Update vehicle
 * Body: any of the vehicle fields
 */
router.patch('/:id', updateVehicle);

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle (only if no active bookings)
 */
router.delete('/:id', deleteVehicle);

export default router;
