export const STATES = {
  NEUTRAL: "neutral",
  THINKING: "thinking",
  ENGAGED: "engaged",
  ENCOURAGING: "encouraging",
  CONCERN: "concern",
  CELEBRATION: "celebration",
};

let currentState = STATES.NEUTRAL;

export function setState(newState) {
  currentState = newState;
  return currentState;
}

export function getState() {
  return currentState;
}
