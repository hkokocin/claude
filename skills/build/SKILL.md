---
name: build
description: Write tests (RED), implement (GREEN), and refactor. Takes the specification and test plan from /design and runs 3 sequential subagents.
disable-model-invocation: true
---
# Build Phase

Write failing tests, implement code to pass them, then refactor. Uses 3 sequential Task subagents for context isolation.

The specification and test plan from `/design` fully describe the target behaviour.

**CRITICAL: Stop on failure. Do NOT proceed to the next step if the current step fails.**

## Step 0: Gather Context

1. Read the conversation history to extract the approved **specification** and **test plan** from `/design`.
2. If no specification or test plan is found, stop and tell the user to run `/design` first.

## Step 1: Write Tests (RED)

1. Build the subagent prompt with the dynamic context:
   - `## Specification` — the approved requirements from `/design`
   - `## Test Plan` — the approved test plan from `/design` (test classes, methods, and structure)
2. Launch a Task subagent (`test-writer`) with the composed prompt. The subagent cannot see this skill or conversation history — all context must be in the prompt.

**After the subagent returns:** Run the tests and confirm they fail for the right reasons (missing implementation, not broken tests). If tests fail for the wrong reason, stop and report the issue.

## Step 2: Implement (GREEN)

1. Read the failing test files written in Step 1.
2. Build the subagent prompt with the dynamic context:
   - `## Failing Tests` — the test runner output showing which tests fail
   - `## Test Files` — the full content of each failing test file
3. Launch a Task subagent (`implement`) with the composed prompt. The subagent cannot see this skill or conversation history — all context must be in the prompt.

**After the subagent returns:** Verify it reports all tests passing. If it reports failures, stop and report the issue.

## Step 3: Refactor

1. Launch a Task subagent (`refactor`) with a prompt summarizing the files that were created/modified in Steps 1 and 2.

**After the subagent returns:** Verify it reports all tests still passing.

## Step 4: Report Results

Summarize to the user:
- **RED**: test files created and failure reasons
- **GREEN**: files created/modified and test results
- **REFACTOR**: improvements applied (or "none needed")
- Final test suite status
