# API Tracking System

The backend includes a comprehensive API tracking system for monitoring usage, performance, and analytics.

## Features

- **Request Tracking**: Automatically tracks all API requests with metadata
- **Performance Monitoring**: Records response times and status codes
- **User Analytics**: Tracks usage by user ID
- **Data Cleanup**: Automatic cleanup of old tracking data
- **Statistics API**: Get aggregated statistics and insights

## Database Schema

```sql
CREATE TABLE api_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  status_code INTEGER,
  response_time_ms INTEGER,
  request_body TEXT,
  response_body TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Get Tracking Statistics
```
GET /trey/tracking/stats
```

Query parameters:
- `userId`: Filter by specific user
- `endpoint`: Filter by API endpoint
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

Response:
```json
{
  "stats": [
    {
      "total_requests": 150,
      "avg_response_time": 245.67,
      "min_response_time": 120,
      "max_response_time": 1200,
      "error_count": 5,
      "endpoint": "/trey/ask",
      "method": "POST"
    }
  ]
}
```

### Cleanup Old Data
```
POST /trey/tracking/cleanup
```

Body:
```json
{
  "daysOld": 30
}
```

## Configuration

The tracking middleware can be configured in `src/app.js`:

```javascript
app.use(createTrackingMiddleware({
  trackRequestBody: false,    // Track request bodies (sensitive data)
  trackResponseBody: false,   // Track response bodies (large data)
  excludeEndpoints: ['/health'] // Skip tracking for these endpoints
}));
```

## Migration

Run migrations to create the tracking table:

```bash
npm run migrate
```

## Usage Examples

### Track User Activity
```javascript
// The middleware automatically tracks all requests
// Data is stored in api_tracking table
```

### Get User Statistics
```bash
curl "http://localhost:3000/trey/tracking/stats?userId=tammy"
```

### Monitor Performance
```bash
curl "http://localhost:3000/trey/tracking/stats?endpoint=/trey/ask"
```

### Cleanup Old Data
```bash
curl -X POST "http://localhost:3000/trey/tracking/cleanup" \
  -H "Content-Type: application/json" \
  -d '{"daysOld": 30}'
```

## Security Notes

- Request/response bodies are not tracked by default to avoid storing sensitive data
- IP addresses and user agents are tracked for analytics
- Consider GDPR compliance when storing user data
- Use cleanup functionality to manage data retention