import { body, param, query } from 'express-validator';

// Auth validators
export const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['owner', 'tenant'])
    .withMessage('Role must be either owner or tenant'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Property validators
export const createPropertyValidator = [
  body('title').trim().notEmpty().withMessage('Property title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('address.street').trim().notEmpty().withMessage('Street address is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.zipCode').trim().notEmpty().withMessage('Zip code is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be [longitude, latitude]'),
  body('rent').isNumeric().withMessage('Rent must be a number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive integer'),
  body('area').isNumeric().withMessage('Area must be a number'),
];

// Rent payment validators
export const createRentPaymentValidator = [
  body('propertyId').isMongoId().withMessage('Invalid property ID'),
  body('tenantId').isMongoId().withMessage('Invalid tenant ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
];

// MongoDB ObjectId validator
export const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];
