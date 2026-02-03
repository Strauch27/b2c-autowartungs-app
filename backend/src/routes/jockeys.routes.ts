/**
 * Jockey Routes
 * Handles all jockey-related API endpoints
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireJockey } from '../middleware/rbac';
import {
  getAssignments,
  getAssignment,
  updateAssignmentStatus,
  saveHandoverData,
  completeAssignment,
} from '../controllers/jockeys.controller';

const router = Router();

// All routes require authentication as JOCKEY
router.use(authenticate, requireJockey);

// Get all assignments for logged-in jockey
router.get('/assignments', getAssignments);

// Get single assignment
router.get('/assignments/:id', getAssignment);

// Update assignment status
router.patch('/assignments/:id/status', updateAssignmentStatus);

// Save handover data
router.post('/assignments/:id/handover', saveHandoverData);

// Complete assignment (status + handover)
router.post('/assignments/:id/complete', completeAssignment);

export default router;
