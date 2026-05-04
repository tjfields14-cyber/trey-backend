/**
 * Validation Middleware
 * Input validation using Joi
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}

/**
 * Validation rules for different endpoints
 */
export const validations = {
  // Trey ask endpoint
  askTrey: [
    body('question')
      .optional()
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Question must be 1-2000 characters'),
    body('message')
      .optional()
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be 1-2000 characters')
  ],

  // Review analysis
  analyzeReview: [
    body('review')
      .isString()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Review must be 1-5000 characters')
  ],

  // Admin insert instructions
  insertInstructions: [
    body('filename')
      .matches(/\.instructions\.md$/)
      .withMessage('Filename must end with .instructions.md'),
    body('content')
      .isString()
      .isLength({ min: 1, max: 50000 })
      .withMessage('Content must be 1-50000 characters')
  ],

  // Schedule analysis
  scheduleAnalysis: [
    body('time')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in HH:MM format (24-hour)')
  ],

  // Login
  login: [
    body('username')
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage('Username is required'),
    body('password')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Password is required')
  ]
};