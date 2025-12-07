import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected routes - Owner only
router.post('/', protect, authorize('owner'), upload.array('images', 10), createProperty);
router.put('/:id', protect, authorize('owner'), upload.array('images', 10), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty);
router.get('/owner/my-properties', protect, authorize('owner'), getOwnerProperties);

export default router;
