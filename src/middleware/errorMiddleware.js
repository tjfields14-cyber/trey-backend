/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { pool } from '../db/index.js';

/**
 * Global error handler
 */
export function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Database errors
  if (err.code && err.code.startsWith('42')) {
    // PostgreSQL syntax/schema errors
    return res.status(500).json({
      error: 'Database configuration error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    // Database connection errors
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Database connection failed'
    });
  }

  // OpenAI API errors
  if (err.message && err.message.includes('OpenAI API error')) {
    return res.status(502).json({
      error: 'External service error',
      message: 'AI service temporarily unavailable'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Token expired'
    });
  }

  // Validation errors (handled by express-validator)
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.array()
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: 'Server error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(app) {
  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Close database connections
      await pool.end();
      console.log('Database connections closed.');

      // Close HTTP server
      app.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);

    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}