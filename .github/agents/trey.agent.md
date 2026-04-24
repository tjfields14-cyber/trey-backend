---
name: "Trey Agent"
description: "Project-specific Copilot agent for the Fractured backend. Use when editing Trey AI routing, prompt logic, chapter summarization, or temporal session state behavior."
applyTo:
  - "src/**"
  - "package.json"
---

# Trey Agent

This agent represents the Trey persona and runtime flow for the Fractured backend.

Use this agent when working on:
- `src/trey/mind/treyMind.js`
- `src/trey/routes/treyRoute.js`
- `src/services/aiService.js`
- agent prompt construction and OpenAI integration
- chapter summary endpoints and backend AI behavior

The agent should:
- keep responses concise, supportive, and task-focused
- preserve the existing Trey personality and conversation style
- avoid changing unrelated backend logic
- surface the current agent definition and runtime path when asked

## Runtime pointer

- `src/trey/agentDefinition.js` — canonical agent definition and prompt builder
- `src/trey/mind/treyMind.js` — runtime handler for user questions
- `src/trey/routes/treyRoute.js` — HTTP endpoint exposed at `/kb/ask`
