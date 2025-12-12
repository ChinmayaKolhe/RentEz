import express from 'express';
import {
  getOwnerOverview,
  getRevenueBreakdown,
  getPropertyPerformance
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and owner-only
router.get('/owner/overview', protect, authorize('owner'), getOwnerOverview);
router.get('/owner/revenue', protect, authorize('owner'), getRevenueBreakdown);
router.get('/owner/properties', protect, authorize('owner'), getPropertyPerformance);

export default router;
