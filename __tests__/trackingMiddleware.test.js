/**
 * Tracking Middleware Tests
 */

import { jest } from '@jest/globals';
import { createTrackingMiddleware } from '../src/middleware/trackingMiddleware.js';

// Mock the tracking service
jest.mock('../src/services/trackingService.js', () => ({
  trackApiRequest: jest.fn().mockResolvedValue()
}));

import { trackApiRequest } from '../src/services/trackingService.js';

describe('Tracking Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      path: '/test',
      method: 'GET',
      body: { test: 'data' },
      query: {},
      ip: '127.0.0.1',
      get: jest.fn((header) => header === 'User-Agent' ? 'test-agent' : null)
    };

    mockRes = {
      statusCode: 200,
      send: jest.fn(function(data) { return this; }),
      json: jest.fn(function(data) { return this; }),
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          // Simulate finish event after a short delay
          setTimeout(callback, 1);
        }
      })
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should create middleware function', () => {
    const middleware = createTrackingMiddleware();
    expect(typeof middleware).toBe('function');
  });

  test('should call next() for non-excluded endpoints', async () => {
    const middleware = createTrackingMiddleware({
      excludeEndpoints: ['/health']
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test('should skip tracking for excluded endpoints', async () => {
    const middleware = createTrackingMiddleware({
      excludeEndpoints: ['/test']
    });

    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(trackApiRequest).not.toHaveBeenCalled();
  });

  test('should track API request on response finish', async () => {
    const middleware = createTrackingMiddleware();

    await middleware(mockReq, mockRes, mockNext);

    // Wait for the finish event
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(trackApiRequest).toHaveBeenCalledWith({
      userId: 'anonymous',
      endpoint: '/test',
      method: 'GET',
      statusCode: 200,
      responseTimeMs: expect.any(Number),
      requestBody: null,
      responseBody: '',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });
  });

  test('should extract userId from request body', async () => {
    mockReq.body.userId = 'user123';
    const middleware = createTrackingMiddleware();

    await middleware(mockReq, mockRes, mockNext);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(trackApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user123' })
    );
  });

  test('should extract userId from query params', async () => {
    mockReq.query.userId = 'queryUser';
    const middleware = createTrackingMiddleware();

    await middleware(mockReq, mockRes, mockNext);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(trackApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'queryUser' })
    );
  });

  test('should handle response body tracking', async () => {
    const middleware = createTrackingMiddleware({
      trackResponseBody: true
    });

    // Mock res.json to capture response
    mockRes.json = jest.fn(function(data) {
      // Simulate capturing response body
      return this;
    });

    await middleware(mockReq, mockRes, mockNext);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Should have called trackApiRequest (exact assertion depends on implementation)
    expect(trackApiRequest).toHaveBeenCalled();
  });

  test('should handle tracking errors gracefully', async () => {
    trackApiRequest.mockRejectedValue(new Error('Tracking failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const middleware = createTrackingMiddleware();

    await middleware(mockReq, mockRes, mockNext);
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalledWith('Tracking middleware error:', 'Tracking failed');
    consoleSpy.mockRestore();
  });

  test('should limit response body size', async () => {
    const middleware = createTrackingMiddleware({
      trackResponseBody: true
    });

    const largeData = 'x'.repeat(15000);
    mockRes.send = jest.fn(function(data) {
      // Simulate capturing large response body
      return this;
    });

    await middleware(mockReq, mockRes, mockNext);

    // Trigger send with large data
    mockRes.send(largeData);

    await new Promise(resolve => setTimeout(resolve, 10));

    const callArgs = trackApiRequest.mock.calls[0][0];
    expect(callArgs.responseBody.length).toBeLessThanOrEqual(10007); // 10000 + '...[truncated]'.length
    expect(callArgs.responseBody).toContain('[truncated]');
  });
});