// src/utils/timeService.js

import { pool } from "../db/index.js";

/**
 * updateTemporalState(userId)
 *
 * Updates temporal awareness tracking for Trey:
 *  - last message time
 *  - gap between messages
 *  - active minutes
 *  - idle minutes
 *  - heartbeat ticks
 *  - session cycles
 */
export async function updateTemporalState(userId) {
  const query = `
    UPDATE trey_temporal_state
    SET 
      last_gap_minutes = EXTRACT(EPOCH FROM (NOW() - last_message_at)) / 60,
      total_idle_minutes = total_idle_minutes + 
        CASE 
          WHEN NOW() - last_message_at > INTERVAL '5 minutes' 
          THEN EXTRACT(EPOCH FROM (NOW() - last_message_at)) / 60 
          ELSE 0 
        END,
      total_active_minutes = total_active_minutes + 
        CASE 
          WHEN NOW() - last_message_at <= INTERVAL '5 minutes' 
          THEN EXTRACT(EPOCH FROM (NOW() - last_message_at)) / 60 
          ELSE 0 
        END,
      ticks = ticks + 1,
      session_cycles = session_cycles + 
        CASE 
          WHEN NOW() - session_start_at > INTERVAL '60 minutes' 
          THEN 1 
          ELSE 0 
        END,
      last_message_at = NOW(),
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
}
