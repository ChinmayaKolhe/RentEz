import express from 'express';
import {
  createLease,
  getActiveLeases,
  getLeaseDetails,
  terminateLease,
} from '../controllers/leaseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Owner routes
router.post('/', protect, authorize('owner'), createLease);
router.put('/:id/terminate', protect, authorize('owner'), terminateLease);

// Common routes
router.get('/active', protect, getActiveLeases);
router.get('/:id', protect, getLeaseDetails);

export default router;
