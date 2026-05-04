/**
 * Intent Engine
 * Classifies user messages into intents for the Trey brain.
 */

const INTENTS = {
  QUESTION: 'question',
  STATEMENT: 'statement',
  COMMAND: 'command',
  TIME_STATUS: 'time_status',
  ERROR: 'error',
  CONFUSION: 'confusion',
  SUCCESS: 'success',
  CODING: 'coding',
  LOOPS: 'loops',
  UNKNOWN: 'unknown'
};

export function classifyIntent(message) {
  const text = (message || '').toLowerCase().trim();

  if (!text) return INTENTS.UNKNOWN;

  // Time-related keywords
  const timeKeywords = ['time', 'status', 'session', 'idle', 'gap', 'last', 'since'];
  if (timeKeywords.some(k => text.includes(k))) {
    return INTENTS.TIME_STATUS;
  }

  // Error-related
  if (text.includes('error') || text.includes('fail') || text.includes('bug')) {
    return INTENTS.ERROR;
  }

  // Confusion
  if (text.includes('confus') || text.includes('understand') || text.includes('help')) {
    return INTENTS.CONFUSION;
  }

  // Success
  if (text.includes('done') || text.includes('finish') || text.includes('work')) {
    return INTENTS.SUCCESS;
  }

  // Coding
  if (text.includes('code') || text.includes('function') || text.includes('variable')) {
    return INTENTS.CODING;
  }

  // Loops
  if (text.includes('loop') || text.includes('for') || text.includes('while')) {
    return INTENTS.LOOPS;
  }

  // Commands
  if (text.startsWith('/') || text.includes('do ') || text.includes('run ')) {
    return INTENTS.COMMAND;
  }

  // Questions
  if (text.includes('?') || text.startsWith('what') || text.startsWith('how') || text.startsWith('why')) {
    return INTENTS.QUESTION;
  }

  // Default to statement
  return INTENTS.STATEMENT;
}
