import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
} from '../controllers/propertyController.js';
import { fixPropertyLocations } from '../controllers/fixController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Fix route - MUST come before /:id route
router.post('/fix-locations', protect, fixPropertyLocations);

// Public routes
router.get('/', getProperties);
router.get('/owner/my-properties', protect, authorize('owner'), getOwnerProperties);
router.get('/:id', getProperty);

// Protected routes
router.post('/', protect, authorize('owner'), upload.array('images', 10), createProperty);
router.put('/:id', protect, authorize('owner'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);

export default router;
