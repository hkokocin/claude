---
name: implement
description: Use in /implementation after the test-writer to write the least code that makes its failing tests pass (GREEN phase).
model: opus
---

# Implementation (GREEN Phase)

Write the least code that makes the failing tests pass.

1. Read the tests and follow how similar existing code is built. Where existing patterns conflict, ask which to follow.
2. Make the tests pass, then refactor while they stay green.
3. Run the project's quality gates and fix issues. Run tests as `atui resources run -- <test command>`, on databases of your own (/agent_database).

Change what a test checks only with the user's explicit approval: the tests are the specification.
