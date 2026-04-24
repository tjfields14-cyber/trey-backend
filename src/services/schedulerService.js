/**
 * Scheduler Service
 * Handles scheduled tasks like daily analysis
 */

import { performDailyAnalysis, storeDailyAnalysis } from "./dashboardService.js";

class SchedulerService {
  constructor() {
    this.scheduledTasks = new Map();
    this.isRunning = false;
  }

  /**
   * Schedule daily analysis
   * @param {string} timeString - Time in HH:MM format (24-hour)
   */
  scheduleDailyAnalysis(timeString = '02:00') {
    const [hours, minutes] = timeString.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }

    // Clear existing schedule
    this.cancelDailyAnalysis();

    const taskId = 'daily-analysis';
    const task = {
      timeString,
      hours,
      minutes,
      timeoutId: null,
      intervalId: null
    };

    // Calculate next run time
    const nextRun = this.calculateNextRun(hours, minutes);
    const delay = nextRun - Date.now();

    console.log(`Scheduling daily analysis for ${timeString}, next run at ${nextRun.toISOString()}`);

    // Schedule the first run
    task.timeoutId = setTimeout(() => {
      this.runDailyAnalysis();

      // Schedule subsequent runs every 24 hours
      task.intervalId = setInterval(() => {
        // Recalculate next run to handle daylight saving time changes
        const nextRunTime = this.calculateNextRun(hours, minutes);
        const now = Date.now();
        const timeUntilNext = nextRunTime - now;

        // If we're more than 1 hour past the scheduled time, run immediately
        if (timeUntilNext < -3600000) {
          console.log('Detected missed schedule, running analysis now');
          this.runDailyAnalysis();
        } else if (timeUntilNext < 60000) { // Within 1 minute
          this.runDailyAnalysis();
        }
        // Otherwise, the interval will trigger at the right time
      }, 60 * 60 * 1000); // Check every hour to handle DST and drift
    }, delay);

    this.scheduledTasks.set(taskId, task);
  }

  /**
   * Cancel daily analysis schedule
   */
  cancelDailyAnalysis() {
    const task = this.scheduledTasks.get('daily-analysis');
    if (task) {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      if (task.intervalId) {
        clearInterval(task.intervalId);
      }
      this.scheduledTasks.delete('daily-analysis');
      console.log('Daily analysis schedule cancelled');
    }
  }

  /**
   * Run daily analysis
   */
  async runDailyAnalysis() {
    if (this.isRunning) {
      console.log('Daily analysis already running, skipping...');
      return;
    }

    this.isRunning = true;
    try {
      console.log('Running scheduled daily analysis...');
      const analysis = await performDailyAnalysis();
      await storeDailyAnalysis(analysis);
      console.log('Scheduled daily analysis completed');
    } catch (error) {
      console.error('Scheduled daily analysis failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get current schedule status
   * @returns {Object} - Schedule status
   */
  getScheduleStatus() {
    const task = this.scheduledTasks.get('daily-analysis');
    if (!task) {
      return { scheduled: false };
    }

    const nextRun = this.calculateNextRun(task.hours, task.minutes);
    return {
      scheduled: true,
      timeString: task.timeString,
      nextRun: nextRun.toISOString()
    };
  }

  /**
   * Calculate next run time
   * @param {number} hours - Target hours
   * @param {number} minutes - Target minutes
   * @returns {Date} - Next run time
   */
  calculateNextRun(hours, minutes) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If target time has passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    return target;
  }

  /**
   * Run analysis immediately (for testing)
   */
  async runNow() {
    await this.runDailyAnalysis();
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();