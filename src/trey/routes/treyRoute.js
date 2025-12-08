// app/backend/src/trey/routes/treyRoute.js

import express from "express";
import { updateTemporalState } from "../../utils/timeService.js";
import { askTrey } from "../mind/treyMind.js";

const router = express.Router();

/**
 * Trey KB endpoint
 * POST /kb/ask
 *
 * Body can be:
 *  { "question": "..." }
 *  or legacy:
 *  { "message": "..." }
 */
router.post("/ask", async (req, res) => {
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
    const userId = "tammy"; // later we can make this dynamic

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

export default router;
