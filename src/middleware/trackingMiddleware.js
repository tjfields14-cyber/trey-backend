/**
 * Tracking Middleware
 * Safe middleware for tracking API requests
 */

import { trackApiRequest } from "../services/trackingService.js";

/**
 * Tracking middleware for Express
 * @param {Object} options - Configuration options
 * @param {boolean} options.trackRequestBody - Whether to track request body
 * @param {boolean} options.trackResponseBody - Whether to track response body
 * @param {Array<string>} options.excludeEndpoints - Endpoints to exclude from tracking
 */
export function createTrackingMiddleware(options = {}) {
  const {
    trackRequestBody = false,
    trackResponseBody = false,
    excludeEndpoints = ['/health', '/auth/login']
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();

    // Skip tracking for excluded endpoints
    if (excludeEndpoints.includes(req.path)) {
      return next();
    }

    // Capture request body before it might be modified
    const requestBody = trackRequestBody && req.body ? JSON.stringify(req.body) : null;

    // Extract user ID from various sources
    const userId = req.body?.userId ||
                   req.query?.userId ||
                   (req.user ? req.user.userId : null) ||
                   'anonymous';

    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    let responseBody = '';
    let statusCode = 200;

    // Override response methods to capture response data safely
    res.json = function(data) {
      if (trackResponseBody) {
        try {
          responseBody = JSON.stringify(data);
          // Limit size to prevent memory issues
          if (responseBody.length > 10000) {
            responseBody = responseBody.substring(0, 10000) + '...[truncated]';
          }
        } catch (e) {
          responseBody = '[unserializable]';
        }
      }
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      if (trackResponseBody && typeof data === 'string') {
        responseBody = data.length > 10000 ? data.substring(0, 10000) + '...[truncated]' : data;
      } else if (trackResponseBody && typeof data === 'object') {
        try {
          responseBody = JSON.stringify(data);
          if (responseBody.length > 10000) {
            responseBody = responseBody.substring(0, 10000) + '...[truncated]';
          }
        } catch (e) {
          responseBody = '[unserializable]';
        }
      }
      return originalSend.call(this, data);
    };

    // Track when response finishes
    res.on('finish', async () => {
      try {
        statusCode = res.statusCode;
        const responseTime = Date.now() - startTime;

        const trackingData = {
          userId,
          endpoint: req.path,
          method: req.method,
          statusCode,
          responseTimeMs: responseTime,
          requestBody,
          responseBody,
          ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        };

        // await trackApiRequest(...);
      } catch (error) {
        // Don't let tracking errors break the response
        console.error('Tracking middleware error:', error.message);
      }
    });

    next();
  };
}
