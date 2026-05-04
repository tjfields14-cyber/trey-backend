-- Create daily analyses table
CREATE TABLE IF NOT EXISTS daily_analyses (
  id SERIAL PRIMARY KEY,
  analysis_date DATE UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_daily_analyses_date ON daily_analyses(analysis_date);