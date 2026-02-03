/**
 * Services Routes
 * Handles service catalog and pricing endpoints
 */

import { Router } from 'express';
import {
  listServices,
  getServicePrice,
  getBrands,
  getModels
} from '../controllers/services.controller';

const router = Router();

/**
 * GET /api/services
 * Get all available service types
 * No authentication required (public endpoint)
 */
router.get('/', listServices);

/**
 * GET /api/services/brands
 * Get all available brands
 * No authentication required (public endpoint)
 */
router.get('/brands', getBrands);

/**
 * GET /api/services/brands/:brand/models
 * Get all available models for a specific brand
 * No authentication required (public endpoint)
 */
router.get('/brands/:brand/models', getModels);

/**
 * GET /api/services/:type/price
 * Get price for a specific service type
 * Query params:
 * - brand: string (required)
 * - model: string (required)
 * - year: number (required)
 * - mileage: number (required)
 * No authentication required (public endpoint for price calculator)
 */
router.get('/:type/price', getServicePrice);

export default router;
