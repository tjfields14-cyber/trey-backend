import { detectIntent } from "./intentEngine.js";
import { generateResponse } from "./responseEngine.js";
import { setMemory } from "./memoryEngine.js";
import { getState } from "./stateMachine.js";

export default function treyMind(userMessage) {
  const intent = detectIntent(userMessage);

  setMemory("stm", "lastMessage", userMessage);

  const reply = generateResponse(intent, userMessage);

  return {
    state: getState(),
    intent,
    reply
  };
}
