import { STATES, setState } from "./stateMachine.js";

export function generateResponse(intent, message) {
  switch (intent) {
    case "error":
      setState(STATES.CONCERN);
      return "No worries — errors are just clues. Paste the full error message or the code around it and we’ll walk through it.";

    case "confusion":
      setState(STATES.CONCERN);
      return "That's okay. Tell me which part is confusing — the idea, the syntax, or what the code is actually doing when it runs?";

    case "loops":
      setState(STATES.ENGAGED);
      return (
        "Loops just repeat a block of code until a condition changes.\n" +
        "- Tell me: are you using a for loop or while loop?\n" +
        "- And what do you WANT it to do (in plain English)?\n" +
        "Then I’ll help you write or fix the exact loop."
      );

    case "coding":
      setState(STATES.THINKING);
      return "Cool, coding mode. Tell me the language you’re using and what you want the code to do.";

    case "success":
      setState(STATES.CELEBRATION);
      return "Nice work! You're leveling up. If you tell me what you just finished, I can suggest the next skill to practice.";

    case "question":
      setState(STATES.ENGAGED);
      return "Good question. Ask it exactly how it’s in your head — I’ll translate it into code steps with you.";

    default:
      setState(STATES.NEUTRAL);
      return "I'm here. What do you want to work on next — loops, functions, errors, or something in Chapterhouse?";
  }
}
