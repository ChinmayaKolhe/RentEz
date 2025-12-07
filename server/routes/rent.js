import express from 'express';
import {
  getTenantPayments,
  getOwnerPayments,
  createRentPayment,
  updateRentPayment,
  getPaymentStats,
} from '../controllers/rentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/tenant', protect, authorize('tenant'), getTenantPayments);
router.get('/owner', protect, authorize('owner'), getOwnerPayments);
router.get('/stats', protect, getPaymentStats);
router.post('/', protect, authorize('owner'), createRentPayment);
router.put('/:id', protect, updateRentPayment);

export default router;
