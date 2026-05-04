export const TREY_AGENT_DEFINITION = {
  name: "Trey",
  version: "1.0",
  description:
    "Trey is a personal assistant agent for the Fractured backend and Chapterhouse project. " +
    "Trey helps authors and developers answer questions, summarize chapters, and track session temporal state.",
  capabilities: [
    "Answer questions about the Fractured backend, chapter storage, and AI-powered summary generation.",
    "Provide friendly time-state status updates for the current session.",
    "Help keep responses concise, supportive, and focused on moving the project forward.",
    "Surface the current agent prompt behavior and persona for debugging or extension."
  ],
  survey: [
    {
      question: "What is Trey?",
      answer:
        "Trey is an AI assistant built into this backend. It uses OpenAI to answer questions about the project, " +
        "summarize chapter text, and report temporal session state."
    },
    {
      question: "Where is Trey’s runtime logic?",
      answer: "Runtime request handling and prompt building are in src/trey/mind/treyMind.js."
    },
    {
      question: "How do I call Trey?",
      answer: "Send POST /kb/ask with { question: '...' } or { message: '...' }."
    }
  ]
};

export function buildAgentPrompt(userMessage, timeState) {
  let temporalContext = "Temporal context: not yet available for this user.";

  if (timeState) {
    const active = timeState.total_active_minutes ?? 0;
    const idle = timeState.total_idle_minutes ?? 0;
    const lastGap = timeState.last_gap_minutes ?? 0;
    const ticks = timeState.ticks ?? 0;
    const cycles = timeState.session_cycles ?? 0;

    temporalContext = `Temporal context for this user:\n- Total active minutes this session: ${active}\n- Total idle minutes this session: ${idle}\n- Last gap between messages (minutes): ${lastGap}\n- Internal tick counter: ${ticks}\n- Session cycles so far: ${cycles}`;
  }

  return `You are Trey, a personal assistant AI for the Fractured / Chapterhouse project.\n` +
    `You speak clearly, supportively, and stay focused on the user’s current task.\n\n` +
    `${temporalContext}\n\n` +
    `User message:\n"${userMessage}"\n\n` +
    `Respond as Trey in a natural, concise way that moves the work forward.`;
}

export function isTimeStatusQuestion(message) {
  const text = (message || "").toLowerCase();
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

export function buildTimeSummary(timeState) {
  if (!timeState) {
    return "I don’t have any temporal data yet, but I’m online and listening.";
  }

  const active = timeState.total_active_minutes ?? 0;
  const idle = timeState.total_idle_minutes ?? 0;
  const lastGap = timeState.last_gap_minutes ?? 0;
  const ticks = timeState.ticks ?? 0;
  const cycles = timeState.session_cycles ?? 0;

  return `I’m tracking our time: about ${active} active minute(s), ${idle} idle minute(s), last gap ~${lastGap} minute(s), tick counter ${ticks}, and ${cycles} session cycle(s) so far.`;
}
