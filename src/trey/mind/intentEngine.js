export function detectIntent(text) {
  text = (text || "").toLowerCase();

  // Strong error / failure signal
  if (text.includes("error") || text.includes("failed") || text.includes("doesn't work")) {
    return "error";
  }

  // Feeling stuck / confused
  if (text.includes("confused") || text.includes("stuck") || text.includes("lost") || text.includes("help")) {
    return "confusion";
  }

  // Success / celebration
  if (text.includes("i did it") || text.includes("done") || text.includes("finished") || text.includes("it works")) {
    return "success";
  }

  // Coding topics
  if (
    text.includes("loop") ||
    text.includes("for loop") ||
    text.includes("while loop") ||
    text.includes("for(") ||
    text.includes("while(")
  ) {
    return "loops";
  }

  if (text.includes("code") || text.includes("bug") || text.includes("function")) {
    return "coding";
  }

  // Questions
  if (text.includes("how do i") || text.trim().endsWith("?")) {
    return "question";
  }

  // Default
  return "conversation";
}

