-- Create temporal state table for Trey
CREATE TABLE IF NOT EXISTS trey_temporal_state (
  user_id VARCHAR(255) PRIMARY KEY,
  last_message_at TIMESTAMP DEFAULT NOW(),
  session_start_at TIMESTAMP DEFAULT NOW(),
  total_idle_minutes INTEGER DEFAULT 0,
  total_active_minutes INTEGER DEFAULT 0,
  ticks INTEGER DEFAULT 0,
  session_cycles INTEGER DEFAULT 0,
  last_gap_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_trey_temporal_state_user_id ON trey_temporal_state(user_id);
CREATE INDEX IF NOT EXISTS idx_trey_temporal_state_updated_at ON trey_temporal_state(updated_at);