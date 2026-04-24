/**
 * Tracking Service
 * Handles API usage tracking and analytics
 */

import { pool } from "../db/index.js";

/**
 * Track an API request
 * @param {Object} trackingData - The tracking data
 * @param {string} trackingData.userId - User identifier
 * @param {string} trackingData.endpoint - API endpoint
 * @param {string} trackingData.method - HTTP method
 * @param {number} trackingData.statusCode - Response status code
 * @param {number} trackingData.responseTimeMs - Response time in milliseconds
 * @param {string} trackingData.requestBody - Request body (optional)
 * @param {string} trackingData.responseBody - Response body (optional)
 * @param {string} trackingData.ipAddress - Client IP address
 * @param {string} trackingData.userAgent - User agent string
 */
export async function trackApiRequest(trackingData) {
  const {
    userId,
    endpoint,
    method,
    statusCode,
    responseTimeMs,
    requestBody,
    responseBody,
    ipAddress,
    userAgent
  } = trackingData;

  try {
    const query = `
      INSERT INTO api_tracking (
        user_id, endpoint, method, status_code, response_time_ms,
        request_body, response_body, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      userId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      requestBody,
      responseBody,
      ipAddress,
      userAgent
    ];

    await pool.query(query, values);
  } catch (error) {
    console.error('Error tracking API request:', error);
    // Don't throw error to avoid breaking the API
  }
}

/**
 * Get tracking statistics
 * @param {Object} filters - Optional filters
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.endpoint - Filter by endpoint
 * @param {Date} filters.startDate - Start date
 * @param {Date} filters.endDate - End date
 * @returns {Promise<Array>} - Tracking statistics
 */
export async function getTrackingStats(filters = {}) {
  try {
    let query = `
      SELECT
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        MIN(response_time_ms) as min_response_time,
        MAX(response_time_ms) as max_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        endpoint,
        method
      FROM api_tracking
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (filters.userId) {
      query += ` AND user_id = $${paramIndex}`;
      values.push(filters.userId);
      paramIndex++;
    }

    if (filters.endpoint) {
      query += ` AND endpoint = $${paramIndex}`;
      values.push(filters.endpoint);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      values.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      values.push(filters.endDate);
      paramIndex++;
    }

    query += `
      GROUP BY endpoint, method
      ORDER BY total_requests DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error getting tracking stats:', error);
    throw error;
  }
}

/**
 * Clean up old tracking data
 * @param {number} daysOld - Remove data older than this many days
 */
export async function cleanupOldTracking(daysOld = 30) {
  try {
    const query = `
      DELETE FROM api_tracking
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `;

    const result = await pool.query(query);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up tracking data:', error);
    throw error;
  }
}