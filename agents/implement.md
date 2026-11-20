---
name: implement
description: "GREEN phase subagent: implement minimum code to make failing tests pass. Used by /implementation after the test-writer, and continued for fix rounds."
model: opus
---

# Implementation (GREEN Phase)

Write the minimum code that makes the failing tests pass, nothing beyond what the tests require.

1. Read the tests and study how similar existing code is built; follow the project's architecture. Where existing patterns conflict, ask which to follow.
2. Make the tests pass, then refactor while they stay green.
3. Run the project's quality gates and fix issues. Run tests as `atui resources run -- <test command>`, on databases of your own (/agent_database).

Change what a test checks only with the user's explicit approval: the tests are the specification you implement.
