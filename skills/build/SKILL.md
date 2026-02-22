---
name: build
description: Implement failing tests (GREEN) and refactor. Reads tests from the current branch as specification. Runs 2 sequential subagents.
disable-model-invocation: true
---
# Build Phase

Implement code to pass the failing tests on the current branch, then refactor. Uses 2 sequential Task subagents for context isolation.

The test suite IS the specification. Tests written by `/design` fully describe the target behaviour.

**CRITICAL: Stop on failure. Do NOT proceed to the next step if the current step fails.**

## Step 0: Discover Failing Tests

1. Run the project's test suite to identify the failing tests on the current branch.
2. Read the failing test files to understand the target behaviour.
3. Store the test file paths and the test output for embedding in subagent prompts.

If there are no failing tests, stop and tell the user — there is nothing to implement.

## Step 1: Implement (GREEN)

1. Read `agents/implement.md` (relative to `~/.claude/`).
2. Build the subagent prompt by prepending the dynamic context:
   - `## Failing Tests` — the test runner output showing which tests fail
   - `## Test Files` — the full content of each failing test file
3. Append the body of `agents/implement.md` after the dynamic context.
4. Launch a Task subagent (`general-purpose`) with the composed prompt. The subagent cannot see this skill or conversation history — all context must be in the prompt.

**After the subagent returns:** Verify it reports all tests passing. If it reports failures, stop and report the issue.

## Step 2: Refactor

1. Read `agents/refactor.md` (relative to `~/.claude/`).
2. Launch a Task subagent (`general-purpose`) with the body of `agents/refactor.md` as the prompt.

**After the subagent returns:** Verify it reports all tests still passing.

## Step 3: Report Results

Summarize to the user:
- **GREEN**: files created/modified and test results
- **REFACTOR**: improvements applied (or "none needed")
- Final test suite status
