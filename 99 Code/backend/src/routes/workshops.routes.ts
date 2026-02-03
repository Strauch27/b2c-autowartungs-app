import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireWorkshop } from '../middleware/rbac';
import {
  getWorkshopOrders,
  getWorkshopOrder,
  createExtension,
  updateBookingStatus
} from '../controllers/workshops.controller';

const router = Router();

// All workshop routes require authentication and WORKSHOP role
router.use(authenticate, requireWorkshop);

// Get all orders
router.get('/orders', getWorkshopOrders);

// Get single order
router.get('/orders/:id', getWorkshopOrder);

// Create extension for an order
router.post('/orders/:bookingId/extensions', createExtension);

// Update order status
router.put('/orders/:id/status', updateBookingStatus);

export default router;
