// app/backend/src/trey/routes/treyRoute.js

import express from "express";
import { updateTemporalState } from "../../utils/timeService.js";
import { askTrey } from "../mind/treyMind.js";
import { TREY_AGENT_DEFINITION } from "../agentDefinition.js";
import { analyzeReview, getLogicKey } from "../../services/reviewAnalysis.js";
import { getTrackingStats, cleanupOldTracking } from "../../services/trackingService.js";
import { getDashboardOverview, performDailyAnalysis, getDailyAnalyses } from "../../services/dashboardService.js";
import { schedulerService } from "../../services/schedulerService.js";
import { requireAuth, authenticateUser, generateToken } from "../../services/authService.js";
import { validations, handleValidationErrors } from "../../middleware/validationMiddleware.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Authentication routes
/**
 * Login endpoint
 * POST /auth/login
 *
 * Body:
 *  { "username": "...", "password": "..." }
 */
router.post("/auth/login",
  validations.login,
  handleValidationErrors,
  (req, res) => {
  const { username, password } = req.body;

  const user = authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const token = generateToken(user);

  return res.json({
    message: "Login successful",
    token,
    user: { id: user.id, role: user.role }
  });
});

router.get("/definition", (req, res) => {
  return res.json({
    status: "ok",
    definition: TREY_AGENT_DEFINITION
  });
});

/**
 * Trey KB endpoint
 * POST /kb/ask
 *
 * Body can be:
 *  { "question": "..." }
 *  or legacy:
 *  { "message": "..." }
 */
router.post("/ask",
  requireAuth(),
  validations.askTrey,
  handleValidationErrors,
  async (req, res) => {
  // Accept both "question" and legacy "message"
  const userMessage =
    req.body?.question ||
    req.body?.message ||
    "";

  if (!userMessage.trim()) {
    return res.status(400).json({
      error: "No question provided."
    });
  }

  try {
    const userId = req.user.userId; // Use authenticated user ID

    // ⏱️ 1. Time Module heartbeat (updates trey_temporal_state row)
    const timeState = await updateTemporalState(userId);

    // 🧠 2. Ask Trey (we can pass timeState if treyMind supports it)
    const answer = await askTrey(userMessage, timeState);

    // 📤 3. Return combined result
    return res.json({
      source: "treyMind",
      question: userMessage,
      answer,
      time: timeState   // <-- this is your temporal state block
    });
  } catch (err) {
    console.error("Trey /kb/ask error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Dashboard Overview
 * GET /dashboard/overview
 */
router.get("/dashboard/overview",
  requireAuth(['admin']),
  async (req, res) => {
  try {
    const dashboardData = await getDashboardOverview();

    return res.json(dashboardData);
  } catch (err) {
    console.error("Dashboard overview error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Run Daily Analysis Now
 * POST /dashboard/analyze-now
 */
router.post("/dashboard/analyze-now",
  requireAuth(['admin']),
  async (req, res) => {
  try {
    const analysis = await performDailyAnalysis();

    return res.json({
      message: "Daily analysis completed",
      analysis
    });
  } catch (err) {
    console.error("Daily analysis error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Get Daily Analyses
 * GET /dashboard/analyses
 *
 * Query params:
 *  - days: Number of days to retrieve (default: 7)
 */
router.get("/dashboard/analyses",
  requireAuth(['admin']),
  async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const analyses = await getDailyAnalyses(days);

    return res.json({
      analyses
    });
  } catch (err) {
    console.error("Get analyses error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Schedule Daily Analysis
 * POST /dashboard/schedule
 *
 * Body:
 *  { "time": "02:00" }
 */
router.post("/dashboard/schedule",
  requireAuth(['admin']),
  validations.scheduleAnalysis,
  handleValidationErrors,
  (req, res) => {
  try {
    const timeString = req.body?.time || "02:00";

    schedulerService.scheduleDailyAnalysis(timeString);

    const status = schedulerService.getScheduleStatus();

    return res.json({
      message: "Daily analysis scheduled",
      schedule: status
    });
  } catch (err) {
    console.error("Schedule error:", err);
    return res.status(400).json({
      error: err.message
    });
  }
});

/**
 * Cancel Daily Analysis Schedule
 * POST /dashboard/cancel-schedule
 */
router.post("/dashboard/cancel-schedule",
  requireAuth(['admin']),
  (req, res) => {
  try {
    schedulerService.cancelDailyAnalysis();

    return res.json({
      message: "Daily analysis schedule cancelled"
    });
  } catch (err) {
    console.error("Cancel schedule error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Get Schedule Status
 * GET /dashboard/schedule-status
 */
router.get("/dashboard/schedule-status",
  requireAuth(['admin']),
  (req, res) => {
  try {
    const status = schedulerService.getScheduleStatus();

    return res.json({
      schedule: status
    });
  } catch (err) {
    console.error("Schedule status error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Get Tracking Statistics
 * GET /tracking/stats
 *
 * Query params:
 *  - userId: Filter by user ID
 *  - endpoint: Filter by endpoint
 *  - startDate: ISO date string
 *  - endDate: ISO date string
 */
router.get("/tracking/stats", async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      endpoint: req.query.endpoint,
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null
    };

    const stats = await getTrackingStats(filters);

    return res.json({
      stats
    });
  } catch (err) {
    console.error("Tracking stats error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Cleanup Old Tracking Data
 * POST /tracking/cleanup
 *
 * Body:
 *  { "daysOld": 30 }
 */
router.post("/tracking/cleanup", async (req, res) => {
  try {
    const daysOld = req.body?.daysOld || 30;

    const deletedCount = await cleanupOldTracking(daysOld);

    return res.json({
      message: `Cleaned up ${deletedCount} old tracking records.`,
      deletedCount
    });
  } catch (err) {
    console.error("Tracking cleanup error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Admin: List Instructions
 * GET /admin/list-instructions
 */
router.get("/admin/list-instructions", (req, res) => {
  try {
    const instructionsDir = path.join(process.cwd(), '.github', 'instructions');
    
    if (!fs.existsSync(instructionsDir)) {
      return res.json({
        instructions: []
      });
    }

    const files = fs.readdirSync(instructionsDir)
      .filter(file => file.endsWith('.instructions.md'))
      .map(file => ({
        filename: file,
        path: path.join(instructionsDir, file)
      }));

    return res.json({
      instructions: files
    });
  } catch (err) {
    console.error("List instructions error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Admin: Insert New Instructions
 * POST /admin/insert-instructions
 *
 * Body:
 *  { "filename": "example.instructions.md", "content": "..." }
 */
router.post("/admin/insert-instructions",
  requireAuth(['admin']),
  validations.insertInstructions,
  handleValidationErrors,
  (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({
      error: "Filename and content are required."
    });
  }

  // Basic validation for .instructions.md files
  if (!filename.endsWith('.instructions.md')) {
    return res.status(400).json({
      error: "Filename must end with .instructions.md"
    });
  }

  try {
    // Ensure .github/instructions directory exists
    const instructionsDir = path.join(process.cwd(), '.github', 'instructions');
    if (!fs.existsSync(instructionsDir)) {
      fs.mkdirSync(instructionsDir, { recursive: true });
    }

    // Write the file
    const filePath = path.join(instructionsDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');

    return res.json({
      message: "Instruction file created successfully.",
      filename,
      path: filePath
    });
  } catch (err) {
    console.error("Insert instructions error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Get Logic Key
 * GET /logic-key
 */
router.get("/logic-key", (req, res) => {
  try {
    const logicKey = getLogicKey();

    return res.json({
      logicKey
    });
  } catch (err) {
    console.error("Logic key error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

/**
 * Review Analysis endpoint
 * POST /analyze-review
 *
 * Body:
 *  { "review": "..." }
 */
router.post("/analyze-review",
  requireAuth(),
  validations.analyzeReview,
  handleValidationErrors,
  (req, res) => {
  const review = req.body.review;

  try {
    const counterArgument = analyzeReview(review);

    return res.json({
      review,
      counterArgument
    });
  } catch (err) {
    console.error("Review analysis error:", err);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

export default router;
