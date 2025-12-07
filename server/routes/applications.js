import express from 'express';
import {
  applyForProperty,
  getMyApplications,
  getReceivedApplications,
  getPropertyApplications,
  updateApplicationStatus,
  getApplicationStats,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tenant routes
router.post('/', protect, authorize('tenant'), applyForProperty);
router.get('/my-applications', protect, authorize('tenant'), getMyApplications);

// Owner routes
router.get('/received', protect, authorize('owner'), getReceivedApplications);
router.get('/property/:propertyId', protect, authorize('owner'), getPropertyApplications);
router.put('/:id/status', protect, authorize('owner'), updateApplicationStatus);

// Common routes
router.get('/stats', protect, getApplicationStats);

export default router;
