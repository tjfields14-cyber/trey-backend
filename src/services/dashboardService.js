/**
 * Dashboard Service
 * Provides system dashboard data and daily analysis
 */

import { getTrackingStats } from "./trackingService.js";
import { pool } from "../db/index.js";

/**
 * Get dashboard overview data
 * @returns {Promise<Object>} - Dashboard data
 */
export async function getDashboardOverview() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's stats
    const todayStats = await getTrackingStats({
      startDate: today,
      endDate: now
    });

    // Get yesterday's stats for comparison
    const yesterdayStats = await getTrackingStats({
      startDate: yesterday,
      endDate: today
    });

    // Get total users
    const userQuery = `
      SELECT COUNT(DISTINCT user_id) as total_users
      FROM api_tracking
      WHERE user_id IS NOT NULL AND user_id != 'anonymous'
    `;
    const userResult = await pool.query(userQuery);
    const totalUsers = userResult.rows[0]?.total_users || 0;

    // Get system health
    const healthQuery = `
      SELECT
        COUNT(*) as total_requests_today,
        AVG(response_time_ms) as avg_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors_today,
        MAX(created_at) as last_request
      FROM api_tracking
      WHERE created_at >= $1
    `;
    const healthResult = await pool.query(healthQuery, [today]);
    const health = healthResult.rows[0] || {};

    // Calculate trends
    const totalRequestsToday = health.total_requests_today || 0;
    const totalRequestsYesterday = yesterdayStats.reduce((sum, stat) => sum + parseInt(stat.total_requests), 0);

    const requestTrend = totalRequestsYesterday > 0
      ? ((totalRequestsToday - totalRequestsYesterday) / totalRequestsYesterday * 100).toFixed(1)
      : 0;

    return {
      overview: {
        totalUsers,
        totalRequestsToday,
        avgResponseTime: Math.round(health.avg_response_time || 0),
        errorsToday: health.errors_today || 0,
        lastRequest: health.last_request,
        requestTrend: parseFloat(requestTrend)
      },
      todayStats,
      yesterdayStats
    };
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    throw error;
  }
}

/**
 * Perform daily analysis
 * @returns {Promise<Object>} - Daily analysis results
 */
export async function performDailyAnalysis() {
  try {
    console.log('Starting daily analysis...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

    // Get yesterday's detailed stats
    const dailyStats = await getTrackingStats({
      startDate: yesterdayStart,
      endDate: yesterdayEnd
    });

    // Analyze peak hours
    const hourlyQuery = `
      SELECT
        EXTRACT(hour from created_at) as hour,
        COUNT(*) as requests,
        AVG(response_time_ms) as avg_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors
      FROM api_tracking
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY EXTRACT(hour from created_at)
      ORDER BY hour
    `;
    const hourlyResult = await pool.query(hourlyQuery, [yesterdayStart, yesterdayEnd]);
    const hourlyStats = hourlyResult.rows;

    // Find peak hour
    const peakHour = hourlyStats.reduce((peak, hour) =>
      hour.requests > peak.requests ? hour : peak,
      { hour: 0, requests: 0 }
    );

    // Analyze top endpoints
    const topEndpoints = dailyStats
      .sort((a, b) => b.total_requests - a.total_requests)
      .slice(0, 5);

    // Analyze error patterns
    const errorQuery = `
      SELECT
        endpoint,
        status_code,
        COUNT(*) as count
      FROM api_tracking
      WHERE created_at >= $1 AND created_at < $2 AND status_code >= 400
      GROUP BY endpoint, status_code
      ORDER BY count DESC
      LIMIT 10
    `;
    const errorResult = await pool.query(errorQuery, [yesterdayStart, yesterdayEnd]);
    const errorPatterns = errorResult.rows;

    const analysis = {
      date: yesterday.toISOString().split('T')[0],
      summary: {
        totalRequests: dailyStats.reduce((sum, stat) => sum + parseInt(stat.total_requests), 0),
        totalErrors: dailyStats.reduce((sum, stat) => sum + parseInt(stat.error_count), 0),
        avgResponseTime: dailyStats.length > 0
          ? Math.round(dailyStats.reduce((sum, stat) => sum + parseFloat(stat.avg_response_time), 0) / dailyStats.length)
          : 0,
        peakHour: peakHour.hour,
        peakRequests: peakHour.requests
      },
      topEndpoints,
      hourlyStats,
      errorPatterns,
      recommendations: generateRecommendations(dailyStats, hourlyStats, errorPatterns)
    };

    console.log('Daily analysis completed');
    return analysis;
  } catch (error) {
    console.error('Error performing daily analysis:', error);
    throw error;
  }
}

/**
 * Generate recommendations based on analysis
 * @param {Array} dailyStats - Daily statistics
 * @param {Array} hourlyStats - Hourly statistics
 * @param {Array} errorPatterns - Error patterns
 * @returns {Array} - Recommendations
 */
function generateRecommendations(dailyStats, hourlyStats, errorPatterns) {
  const recommendations = [];

  // Check for high error rates
  const totalRequests = dailyStats.reduce((sum, stat) => sum + parseInt(stat.total_requests), 0);
  const totalErrors = dailyStats.reduce((sum, stat) => sum + parseInt(stat.error_count), 0);
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  if (errorRate > 5) {
    recommendations.push({
      type: 'error',
      message: `High error rate detected: ${errorRate.toFixed(1)}%. Review error patterns and fix issues.`
    });
  }

  // Check for slow endpoints
  const slowEndpoints = dailyStats.filter(stat => parseFloat(stat.avg_response_time) > 1000);
  if (slowEndpoints.length > 0) {
    recommendations.push({
      type: 'performance',
      message: `Slow endpoints detected: ${slowEndpoints.map(s => s.endpoint).join(', ')}. Consider optimization.`
    });
  }

  // Check for peak hour capacity
  if (hourlyStats.length > 0) {
    const avgRequestsPerHour = hourlyStats.reduce((sum, hour) => sum + parseInt(hour.requests), 0) / hourlyStats.length;
    const maxRequestsPerHour = Math.max(...hourlyStats.map(h => parseInt(h.requests)));

    if (maxRequestsPerHour > avgRequestsPerHour * 2) {
      recommendations.push({
        type: 'capacity',
        message: 'Significant peak hour traffic detected. Consider load balancing or scaling.'
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'System performance is healthy. No immediate actions required.'
    });
  }

  return recommendations;
}

/**
 * Store daily analysis result
 * @param {Object} analysis - Analysis result
 */
export async function storeDailyAnalysis(analysis) {
  try {
    const query = `
      INSERT INTO daily_analyses (analysis_date, data)
      VALUES ($1, $2)
      ON CONFLICT (analysis_date)
      DO UPDATE SET data = EXCLUDED.data, created_at = NOW()
    `;

    await pool.query(query, [analysis.date, JSON.stringify(analysis)]);
    console.log('Daily analysis stored:', analysis.date);
  } catch (error) {
    console.error('Error storing daily analysis:', error);
    throw error;
  }
}

/**
 * Get stored daily analyses
 * @param {number} days - Number of days to retrieve
 * @returns {Promise<Array>} - Daily analyses
 */
export async function getDailyAnalyses(days = 7) {
  try {
    const query = `
      SELECT analysis_date, data, created_at
      FROM daily_analyses
      ORDER BY analysis_date DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [days]);
    return result.rows.map(row => ({
      date: row.analysis_date,
      ...row.data,
      stored_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting daily analyses:', error);
    throw error;
  }
}