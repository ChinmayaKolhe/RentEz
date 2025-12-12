import express from 'express';
import {
  createReview,
  getPropertyReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addOwnerResponse,
  getMyReviews
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/property/:propertyId', getPropertyReviews);

// Protected routes - Tenant
router.post('/', protect, authorize('tenant'), upload.array('images', 5), createReview);
router.get('/my-reviews', protect, authorize('tenant'), getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Protected routes - All authenticated users
router.post('/:id/helpful', protect, markHelpful);

// Protected routes - Owner
router.post('/:id/response', protect, authorize('owner'), addOwnerResponse);

export default router;
