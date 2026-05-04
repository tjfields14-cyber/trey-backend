// app/backend/src/trey/mind/treyMind.js

import { callChatCompletion } from "../../services/aiService.js";
import {
  buildAgentPrompt,
  buildTimeSummary,
  isTimeStatusQuestion
} from "../agentDefinition.js";
import { classifyIntent } from "./intentEngine.js";
import { getMemory, setMemory } from "./memoryEngine.js";
import { generateResponse } from "./responseEngine.js";
import { getState, setState, STATES } from "./stateMachine.js";

/**
 * Trey Brain Class
 * Central coordinator for all brain engines.
 */
class TreyBrain {
  constructor() {
    this.state = getState();
  }

  async processMessage(userMessage, timeState = null) {
    const message = (userMessage || "").trim();

    if (!message) {
      setState(STATES.NEUTRAL);
      return {
        state: STATES.NEUTRAL,
        intent: "empty",
        reply: "You didn't say anything, but I'm here when you're ready."
      };
    }

    // 1. Classify intent
    const intent = classifyIntent(message);

    // 2. Check memory for context
    const context = getMemory('stm', 'last_topic') || '';

    // 3. Special case: Time status (handled separately)
    if (intent === 'time_status' || isTimeStatusQuestion(message)) {
      const reply = buildTimeSummary(timeState);
      setMemory('stm', 'last_topic', 'time_status');
      return {
        state: getState(),
        intent,
        reply
      };
    }

    // 4. Generate response using engines
    let reply;
    if (intent === 'unknown' || intent === 'statement') {
      // Fall back to AI for general conversation
      const prompt = buildAgentPrompt(message, timeState);
      reply = (await callChatCompletion(prompt)).trim();
    } else {
      // Use rule-based response
      reply = generateResponse(intent, message);
    }

    // 5. Update memory
    setMemory('stm', 'last_topic', intent);
    setMemory('mtc', 'conversation_count', (getMemory('mtc', 'conversation_count') || 0) + 1);

    return {
      state: getState(),
      intent,
      reply
    };
  }
}

// Singleton brain instance
const brain = new TreyBrain();

/**
 * Core Trey entry point.
 * Now uses the integrated brain.
 */
export async function askTrey(userMessage, timeState = null) {
  return await brain.processMessage(userMessage, timeState);
}
