/**
 * Review Analysis Service
 * Provides counter-arguments for product reviews based on keywords.
 */

// Logic Key: Array of { keywords: string[], argument: string }
const LOGIC_KEY = [
  {
    keywords: ["perfect", "amazing", "best", "love", "excellent"],
    argument: "Is this bias from a 'brand fan,' or does the product actually lack any measurable flaws?"
  },
  {
    keywords: ["bad", "terrible", "awful", "worst", "broke"],
    argument: "Is this a systemic product failure, or a 'vocal minority' experiencing a one-off shipping/lemon issue?"
  },
  {
    keywords: ["expensive", "pricey", "overpriced", "cost"],
    argument: "Does the price point provide long-term durability that justifies the high upfront cost?"
  },
  {
    keywords: ["cheap", "flimsy", "plastic"],
    argument: "Is the material choice a trade-off to keep the product lightweight and accessible?"
  },
  {
    keywords: ["hard", "difficult", "complex", "confusing"],
    argument: "Is the learning curve a result of the product's high customizability and professional features?"
  }
];

/**
 * Analyzes a review text and returns a counter-argument based on detected keywords.
 * @param {string} review - The review text to analyze.
 * @returns {string} - The counter-argument or default message.
 */
export function analyzeReview(review) {
  if (!review || typeof review !== 'string') {
    return '';
  }

  const text = review.toLowerCase().trim();

  if (!text) {
    return '';
  }

  for (const entry of LOGIC_KEY) {
    if (entry.keywords.some(keyword => text.includes(keyword))) {
      return entry.argument;
    }
  }

  // Default
  return "Is this reviewer's perspective based on objective testing or subjective personal preference?";
}

/**
 * Gets the logic key data.
 * @returns {Array} - The logic key array.
 */
export function getLogicKey() {
  return LOGIC_KEY;
}