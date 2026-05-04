# Repository Agents

This repository includes project-specific Copilot agents for the Trey backend and frontend integration.

## Trey Agent

- File: `.github/agents/trey.agent.md`
- Purpose: Enables Copilot to focus on Trey AI routing, prompt behavior, and backend integration.
- Applies to: `src/**`, `package.json`
- Primary runtime files:
  - `src/trey/agentDefinition.js`
  - `src/trey/mind/treyMind.js`
  - `src/trey/routes/treyRoute.js`
  - `src/services/aiService.js`

## Word Processor Output Agent

- File: `.github/agents/word-processor.agent.md`
- Purpose: Focuses on word processor-style output and request/response formatting.
- Applies to: `src/**`, `package.json`

## Frontend Connector Agent

- File: `.github/agents/connector.agent.md`
- Purpose: Guides frontend-backend integration, API clients, and data fetching.
- Applies to: `src/**`, `package.json`

## Admin Instruction Manager Agent

- File: `.github/agents/admin.agent.md`
- Purpose: Manages creation and updates of instruction files for admin and coding guidelines.
- Applies to: `**/*.instructions.md`, `.github/instructions/**`, `AGENTS.md`, `.claude/rules/**`

## How to use

1. Open relevant files (e.g., `src/trey/` for Trey agent, API-related files for connector agent).
2. Invoke Copilot or the specialized agent if your editor supports it.
3. Ask about specific integration points or behaviors.

## Notes

- `AGENT.md` documents the runtime agent definition and the current backend integration.
- `.github/agents/*.agent.md` provide project-specific agent guidance for Copilot.
