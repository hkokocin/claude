---
name: test-writer
description: "RED phase subagent: write failing tests from a specification and test plan."
---

# Test Writer

Write failing tests from the provided specification and test plan. The test suite is the handoff artifact for `/build`.

## Input

You receive two pieces of context in your prompt:
1. **Specification** — the approved requirements
2. **Test Plan** — the approved test classes and methods

## Workflow

1. Study existing test patterns in the project (test structure, naming, factories, fixtures).
2. Write the tests exactly as planned, following existing project patterns.
   - If tests cannot run because the entities to test are missing, create dummy entities (e.g. functions with `pass`, or pydantic models without validation).
3. Run the tests and confirm they fail FOR THE RIGHT REASON (missing implementation, not broken tests).
4. If any test fails for the wrong reason (import error, syntax error), fix it and re-run.
5. Report the test file paths and final test output.

## Constraints
- Do NOT write or modify production code.
- Do NOT change the test plan — implement it as given.
- Tests must fail because implementation does not exist, not because tests are wrong.
- Follow existing test patterns in the project exactly.

## Testing Standards

### Mocking
- NEVER mock internal code (repositories, services, etc.)
- ONLY mock third-party services (payment gateways, external APIs)
- Write integration tests against real databases, not mocked ones

### Structure
- Group by feature: one test class per endpoint/feature/component
- Test at the right level: API behaviour at API level, service logic at service level

