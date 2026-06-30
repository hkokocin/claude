-
globs:
  - "**/*.py"
---
# TDD Workflow

IMPORTANT: Always follow Red-Green-Refactor. Tests come before implementation.

## The Cycle
1. **refine** — Clarify requirements (WHAT, not HOW)
2. **test** — Write failing tests. Confirm they fail for the right reason.
3. **implement** — Write minimal code to make tests pass. Nothing more.
4. **refactor** — Refactor while keeping tests green.

## Rules
- NEVER write or modify production code without a failing test that proves the need.
- When asked to add behavior: write the test FIRST, run it, confirm it fails for the right reason, THEN implement.
- If a test already exists and passes, the behavior is already implemented — stop.
- Always check for existing tests as to not duplicate tests.

## Test approach
- test names read like documentation: behaviour focussed, natural language
- there should be no implementation details in test names
- prefer one happy-path test that asserts the entire response model over many granular per-field tests
- group tests in classes

## Scope
- don't test logging
