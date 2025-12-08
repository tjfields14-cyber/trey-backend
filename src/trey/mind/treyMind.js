// app/backend/src/trey/mind/treyMind.js

import { callChatCompletion } from "../../services/aiService.js";

/**
 * Simple classifier for "time awareness" style questions.
 * We keep this lightweight so it doesn’t depend on any other engines.
 */
function isTimeStatusQuestion(message) {
  const text = message.toLowerCase();

  const keywords = [
    "time-state",
    "time state",
    "time status",
    "time report",
    "temporal state",
    "session time",
    "how long",
    "since we last talked",
    "since we last spoke",
    "idle",
    "gap",
    "last message",
    "time check",
    "time summary"
  ];

  return keywords.some((word) => text.includes(word));
}

/**
 * Format the temporal state into a friendly one-sentence summary.
 */
function buildTimeSummary(timeState) {
  if (!timeState) {
    return "I don’t have any temporal data yet, but I’m online and listening.";
  }

  const active = timeState.total_active_minutes ?? 0;
  const idle = timeState.total_idle_minutes ?? 0;
  const lastGap = timeState.last_gap_minutes ?? 0;
  const ticks = timeState.ticks ?? 0;
  const cycles = timeState.session_cycles ?? 0;

  // You can change the wording however you like.
  return (
    `I’m tracking our time: about ${active} active minute(s), ` +
    `${idle} idle minute(s), last gap ~${lastGap} minute(s), ` +
    `tick counter ${ticks}, and ${cycles} session cycle(s) so far.`
  );
}

/**
 * Core Trey entry point.
 *
 * @param {string} userMessage  – the user’s question/text
 * @param {object|null} timeState – row from trey_temporal_state, or null
 *
 * Returns an object:
 * {
 *   state: "neutral" | ...,
 *   intent: "conversation" | "time_status" | ...,
 *   reply: "text"
 * }
 */
export async function askTrey(userMessage, timeState = null) {
  const message = (userMessage || "").trim();

  if (!message) {
    return {
      state: "neutral",
      intent: "empty",
      reply: "You didn’t say anything, but I’m here when you’re ready."
    };
  }

  // ─────────────────────────────────────────────
  // 1) SPECIAL CASE: Time / temporal status questions
  // ─────────────────────────────────────────────
  if (isTimeStatusQuestion(message)) {
    const reply = buildTimeSummary(timeState);

    return {
      state: "neutral",
      intent: "time_status",
      reply
    };
  }

  // ─────────────────────────────────────────────
  // 2) GENERAL CASE: Normal Trey conversation
  //    (we still *include* temporal context so
  //     the model can reason about time if needed)
  // ─────────────────────────────────────────────

  let temporalContext = "";

  if (timeState) {
    const active = timeState.total_active_minutes ?? 0;
    const idle = timeState.total_idle_minutes ?? 0;
    const lastGap = timeState.last_gap_minutes ?? 0;
    const ticks = timeState.ticks ?? 0;
    const cycles = timeState.session_cycles ?? 0;

    temporalContext = `
Temporal context for this user:
- Total active minutes this session: ${active}
- Total idle minutes this session: ${idle}
- Last gap between messages (minutes): ${lastGap}
- Internal tick counter: ${ticks}
- Session cycles so far: ${cycles}
`;
  }

  const prompt = `
You are Trey, a personal assistant AI for the Fractured / Chapterhouse project.
You speak clearly, supportively, and stay focused on the user’s current task.

${temporalContext || "Temporal context: not yet available for this user."}

User message:
"${message}"

Respond as Trey in a natural, concise way that moves the work forward.
`.trim();

  const replyText = (await callChatCompletion(prompt)).trim();

  return {
    state: "neutral",
    intent: "conversation",
    reply: replyText
  };
}
