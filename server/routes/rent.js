import express from 'express';
import {
  getTenantPayments,
  getOwnerPayments,
  createRentPayment,
  updateRentPayment,
  getPaymentStats,
  uploadPaymentProof,
  verifyPaymentReceipt,
} from '../controllers/rentController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Protected routes
router.get('/tenant', protect, authorize('tenant'), getTenantPayments);
router.get('/owner', protect, authorize('owner'), getOwnerPayments);
router.get('/stats', protect, getPaymentStats);
router.post('/', protect, authorize('owner'), createRentPayment);
router.post('/:id/upload-proof', protect, authorize('tenant'), upload.single('paymentProof'), uploadPaymentProof);
router.put('/:id/verify-receipt', protect, authorize('owner'), verifyPaymentReceipt);
router.put('/:id', protect, updateRentPayment);

export default router;
