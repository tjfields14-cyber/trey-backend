# System Dashboard

The backend includes a comprehensive system dashboard with daily analysis capabilities and scheduling.

## Features

- **Real-time Overview**: Current system statistics and trends
- **Daily Analysis**: Automated analysis of API usage patterns
- **Scheduling**: Configurable time for daily analysis runs
- **Historical Data**: Stored daily analysis reports
- **Recommendations**: AI-generated insights and recommendations

## API Endpoints

### Dashboard Overview
```
GET /trey/dashboard/overview
```

Returns current system statistics including:
- Total users and requests
- Response times and error rates
- Today's vs yesterday comparison
- Top endpoints and performance metrics

### Daily Analysis
```
POST /trey/dashboard/analyze-now
```

Runs daily analysis immediately and returns results.

### Get Historical Analyses
```
GET /trey/dashboard/analyses?days=7
```

Returns stored daily analysis reports.

### Schedule Management

#### Set Schedule
```
POST /trey/dashboard/schedule
```

Body:
```json
{
  "time": "02:00"
}
```

#### Cancel Schedule
```
POST /trey/dashboard/cancel-schedule
```

#### Get Schedule Status
```
GET /trey/dashboard/schedule-status
```

## Daily Analysis Features

The daily analysis includes:

- **Performance Metrics**: Response times, error rates, request volumes
- **Peak Hour Analysis**: Identifies busiest times
- **Endpoint Analysis**: Top-performing and problematic endpoints
- **Error Pattern Detection**: Common errors and their frequencies
- **Recommendations**: Automated suggestions for improvements

## Scheduling

- **Default Time**: 2:00 AM (configurable via `DAILY_ANALYSIS_TIME` env var)
- **Format**: HH:MM (24-hour format)
- **Automatic**: Runs daily at scheduled time
- **Manual**: Can trigger analysis anytime via API

## Database Tables

### daily_analyses
```sql
CREATE TABLE daily_analyses (
  id SERIAL PRIMARY KEY,
  analysis_date DATE UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Get Dashboard Overview
```bash
curl http://localhost:3000/trey/dashboard/overview
```

### Schedule Daily Analysis for 3 AM
```bash
curl -X POST http://localhost:3000/trey/dashboard/schedule \
  -H "Content-Type: application/json" \
  -d '{"time": "03:00"}'
```

### Run Analysis Now
```bash
curl -X POST http://localhost:3000/trey/dashboard/analyze-now
```

### Get Last 30 Days of Analyses
```bash
curl "http://localhost:3000/trey/dashboard/analyses?days=30"
```

## Configuration

Set the default analysis time in your environment:
```bash
DAILY_ANALYSIS_TIME=02:00
```

## Migration

Run migrations to create the daily analyses table:
```bash
npm run migrate
```

## Analysis Output Example

```json
{
  "date": "2024-01-15",
  "summary": {
    "totalRequests": 1250,
    "totalErrors": 12,
    "avgResponseTime": 245,
    "peakHour": 14,
    "peakRequests": 180
  },
  "topEndpoints": [
    {
      "endpoint": "/trey/ask",
      "total_requests": 450,
      "avg_response_time": 320
    }
  ],
  "recommendations": [
    {
      "type": "performance",
      "message": "Slow endpoints detected: /trey/ask. Consider optimization."
    }
  ]
}
```

## Monitoring

The dashboard provides insights into:
- System health and performance
- Usage patterns and trends
- Error rates and problematic areas
- Capacity planning and scaling needs
- Automated recommendations for improvements