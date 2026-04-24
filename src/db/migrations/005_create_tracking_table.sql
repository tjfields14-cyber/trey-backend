-- Create tracking table for API usage
CREATE TABLE IF NOT EXISTS api_tracking (
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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_api_tracking_user_id ON api_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tracking_endpoint ON api_tracking(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_tracking_created_at ON api_tracking(created_at);