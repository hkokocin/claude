---
name: design
description: Interactive requirements clarification and test plan design via subagents. The approved specification and test plan are the handoff artifact to /build.
disable-model-invocation: true
---
# Design Phase

Orchestrate requirements clarification and test plan design. The main session stays lean — heavy analysis happens in subagents, you just relay questions and collect answers.

**CRITICAL: Stop on failure. Do NOT proceed to the next step if the current step fails.**

## Step 1: Requirements Clarification

Run a clarification loop using the `refine` subagent.

### First iteration
1. Build the subagent prompt with:
   - `## Requirements` — the raw requirements from `$ARGUMENTS` (include any URLs or context the user provided)
2. Launch a Task subagent (`refine`). The subagent cannot see this conversation — all context must be in the prompt.
3. Present the subagent's **Spec Draft** and **Open Questions** to the user.

### Subsequent iterations (while questions remain)
1. Collect the user's answers.
2. Build a new subagent prompt with:
   - `## Requirements` — the original requirements
   - `## Prior Q&A` — all questions and answers so far
   - `## Current Spec Draft` — the latest spec draft
3. Launch a new `refine` subagent with the composed prompt.
4. Present the updated **Spec Draft** and **Open Questions** to the user.

### Loop exit
When the user approves the specification (either no open questions remain, or the user explicitly approves), proceed to Step 2.

## Step 2: Test Plan Design

1. Build the subagent prompt with:
   - `## Specification` — the approved specification from Step 1
2. Launch a Task subagent (`test-planner`). The subagent cannot see this conversation — all context must be in the prompt.
3. Present the **Test Plan** to the user for approval.
4. If the user requests changes, incorporate feedback and relaunch the subagent.

## Done

Once both the specification and test plan are approved, report readiness for `/build`.
