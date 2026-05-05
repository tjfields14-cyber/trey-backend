/**
 * Simple validation script for tracking middleware
 * This script validates that the middleware can be imported and instantiated
 */

import { createTrackingMiddleware } from './src/middleware/trackingMiddleware.js';

console.log('Testing tracking middleware import...');

try {
  // Test middleware creation
  const middleware = createTrackingMiddleware({
    trackRequestBody: false,
    trackResponseBody: false,
    excludeEndpoints: ['/health', '/auth/login']
  });

  console.log('✓ Middleware function created successfully');

  // Test that it's a function
  if (typeof middleware === 'function') {
    console.log('✓ Middleware is a function');
  } else {
    console.error('✗ Middleware is not a function');
    process.exit(1);
  }

  // Test middleware with mock req/res objects
  const mockReq = {
    path: '/test',
    method: 'GET',
    body: { test: 'data' },
    query: {},
    ip: '127.0.0.1',
    get: (header) => header === 'User-Agent' ? 'test-agent' : null
  };

  const mockRes = {
    statusCode: 200,
    send: function(data) { return this; },
    json: function(data) { return this; },
    on: function(event, callback) {
      if (event === 'finish') {
        // Simulate finish event
        setTimeout(callback, 10);
      }
    }
  };

  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };

  // Call middleware
  await middleware(mockReq, mockRes, mockNext);

  if (nextCalled) {
    console.log('✓ Middleware calls next() correctly');
  } else {
    console.error('✗ Middleware did not call next()');
    process.exit(1);
  }

  console.log('✓ All validation tests passed!');

} catch (error) {
  console.error('✗ Validation failed:', error.message);
  process.exit(1);
}