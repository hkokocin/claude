---
name: design
description: Interactive requirements clarification and test plan design. The approved specification and test plan are the handoff artifact to /build.
disable-model-invocation: true
---
# Design Phase

Clarify requirements and design a test plan. The specification and test plan are the handoff artifact — they must fully describe the target behaviour so `/build` can write tests and implement from them alone.

## Step 0: Pre Flight Checks

* check if the asana ticket is assigned to me. If not assign it.
* ensure that the current branch is up to date with origin main.

## Step 1: Requirements Clarification

Analyze the requirements from `$ARGUMENTS` and clarify with the user. Focus on WHAT, not HOW.

1. Analyze the requirements. If a URL is provided, fetch it for context. Read API docs and project documentation for additional context.
2. Run a clarification loop with the user until approved:
   - Identify open questions, ambiguities, contradictions
   - Make up to 3 proposals to resolve each issue
   - Ask the user to choose or provide an alternative
   - Don't ask multiple questions at once - I might have to ask questions back and doing clarifications is easiest to do one question at a time for humans.
3. Use extended thinking for complex decisions.
4. Summarize all requirements as a specification for the test plan design.

### Constraints
- MUST focus on requirements (behaviour, not implementation)
- MUST NOT read source code files except for API docs and project documentation directly.
  - If a task requires to extract domain logic from code, launch a sub-agent that does the investigation and returns a summary of domain logic only to keep the main context clean of implementation details.
- MUST NOT consider implementation details
- Your task is NOT complete until the user has explicitly approved the requirements

## Step 2: Test Plan Design

Launch a subagent to create the test plan:

0. Analyze already existing tests as not to plan duplicate tests. 
1. Design test classes and methods following the testing standards below.
2. Present the test plan to the user for approval.

**CRITICAL: The specification and test plan will be the ONLY artifacts handed off to `/build`. Test names and structure must document the target behaviour completely. Someone reading only the test plan must understand every requirement.**

### Testplan Standards

Tests are documentation: the sum of all test names reads like a specification of the system.

**Naming** — Test names describe behaviour, not implementation:
```
class TestGetUser:
    def test_it_returns_user_data
    def test_it_returns_404_if_user_not_found
    def test_it_rejects_unauthenticated_requests
```
Test names describe requirements in a non-technical way.
- DON'T: `test_it_returns_422_when_translations_list_is_empty`
- DO: `test_it_rejects_products_without_translations`

Keep the happy path test name simple:
- DON'T: `test_it_creates_a_product_with_translations`
- DO: `test_it_creates_a_product`

**Scope** — prefer one happy-path test that asserts the entire response model over many granular per-field tests. Don't add a test whose assertion the happy-path test already covers.

## Done

Once both the specification and test plan are approved, report readiness for `/build`.
