import express from "express";
import treyMind from "../mind/treyMind.js";

const router = express.Router();

/**
 * Primary Trey endpoint
 *
 * URL: POST /kb/ask
 * Body:
 * {
 *   "question": "text here",
 *   "mode": "auto" | "online" | "offline" (optional)
 * }
 *
 * For now, this uses treyMind (local logic).
 * Later we can plug in aiService / OpenAI here.
 */
router.post("/ask", (req, res) => {
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
    const result = treyMind(userMessage);
    return res.json({
      source: "treyMind",
      question: userMessage,
      answer: result
    });
  } catch (err) {
    console.error("Trey route error:", err);
    return res.status(500).json({
      error: "Trey failed to process the request.",
      details: err.message
    });
  }
});

export default router;
