---
name: test_plan
description: Design a test plan from the approved specification. The specification and test plan are the handoff artifact to /build.
disable-model-invocation: true
---
# Test Plan Phase

Design a test plan for the specification approved in `/refinement`. The specification and test plan are the handoff artifact — they must fully describe the target behaviour so `/build` can write tests and implement from them alone.

## Step 0: Gather Context

1. Read the conversation history to extract the approved **specification** from `/refinement` (requirements, decisions, glossary terms).
2. If no specification is found, stop and tell the user to run `/refinement` first.

## Step 1: Draft the Test Plan

Launch a subagent to draft the test plan. The subagent cannot see this conversation — compose the prompt from the specification and the Testplan Standards below.

The subagent must:
1. Analyze existing tests so as not to plan duplicate tests, and to match the project's test structure.
2. Design test classes and methods following the Testplan Standards.
3. Return the test plan, plus a list of existing tests that already cover parts of the specification.

Keep the main context clean of implementation details — only the test plan itself comes back.

## Step 2: Review with the User

Present the test plan to the user and iterate until approved. Raise open questions one at a time.

**CRITICAL: The specification and test plan will be the ONLY artifacts handed off to `/build`. Test names and structure must document the target behaviour completely. Someone reading only the test plan must understand every requirement.**

## Testplan Standards

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

**Scope**
- Prefer one happy-path test that asserts the entire response model over many granular per-field tests.
- Group by feature: one test class per endpoint/feature/component.
- Test at the right level: API behaviour at API level, service logic at service level.
- Make sure not to duplicate existing tests. If existing requirements change existing test needs to be changed. Those changes have to be part of the test plan.
- Don't test logging, configuration.

## Done

Once the test plan is approved, report readiness for `/build`.
