---
description: Admin-level instructions for managing project instructions and guidelines
applyTo:
  - "**/*.instructions.md"
  - ".github/instructions/**"
  - "AGENTS.md"
---

# Admin Instructions

These instructions apply to the creation, management, and administration of instruction files within the project.

## Guidelines for Instruction Files

- Always include a clear `description` in the YAML frontmatter
- Use specific `applyTo` patterns to avoid unnecessary context loading
- Follow established naming conventions (e.g., `filename.instructions.md`)
- Keep instructions focused and actionable
- Test instructions after creation to ensure they work as intended

## Admin Operations

When inserting new instructions:

1. Determine the appropriate scope (workspace vs user-level)
2. Choose the correct location (`.github/instructions/` for workspace)
3. Create the file with proper frontmatter
4. Add content following the project's patterns
5. Update AGENTS.md if creating a new agent
6. Validate syntax and functionality

## Best Practices

- Use descriptive filenames that indicate the purpose
- Include examples in instruction content when helpful
- Keep instructions concise but comprehensive
- Regularly review and update instructions as the project evolves
- Ensure instructions align with overall project goals