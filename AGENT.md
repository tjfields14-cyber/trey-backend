# Trey Agent Definition

This repository includes a runtime agent named **Trey** for the Fractured backend and Chapterhouse project.

## Purpose

- Provide a consistent AI assistant persona for the backend.
- Answer developer and author questions about the project.
- Summarize chapter text while preserving tone.
- Report temporal session status and help manage conversational context.

## Runtime files

- `src/trey/mind/treyMind.js` — current Trey request handling and prompt builder.
- `src/trey/agentDefinition.js` — canonical agent definition, capabilities, and prompt template.
- `src/trey/routes/treyRoute.js` — HTTP endpoint for `/kb/ask`.

## How to use

1. Set `OPENAI_API_KEY` in the environment.
2. Start the server: `npm start`.
3. Call Trey via POST `/kb/ask` with JSON body:
   - `{ "question": "..." }`
   - or legacy `{ "message": "..." }`

## Agent capabilities

- Answer questions about the backend architecture and chapter management.
- Offer summaries for chapter text.
- Provide a concise, supportive assistant response.
- Return current agent metadata through `/kb/definition`.

## Extension ideas

- Add a `/kb/summary` endpoint for batch chapter summarization.
- Add user session support instead of the hard-coded `tammy` user.
- Turn `agentDefinition.js` into a reusable module for multiple agent personas.
