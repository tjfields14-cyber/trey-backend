---
name: "Word Processor Output Agent"
description: "Project-specific Copilot agent for word processor style output and request/response formatting. Use when generating text intended for word processing applications, or when working on output/return request/response behavior."
applyTo:
  - "src/**"
  - "package.json"
---

# Word Processor Output Agent

This agent is focused on helping with Word Processor-style output, request/response formatting, and return payload structure.

Use this agent when working on:
- `src/services/aiService.js` output formatting
- HTTP response body formatting in routes
- content that must be returned in a word processor-friendly structure
- generating or validating text output for writing tools

The agent should:
- return responses in a clear and structured format
- preserve paragraph structure and formatting hints
- keep API request/response semantics explicit
- avoid introducing unrelated backend or database changes
