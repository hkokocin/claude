---
name: test_plan
description: Use after /atui:refinement when the user wants a test plan for the approved Specification, as the test-writer's hand-off.
disable-model-invocation: true
---
# Test Plan Phase

Design a test plan for the Specification approved in /refinement. With the Specification it fully describes the target behaviour: the `test-writer` and `implement` sub agents (/atui:implementation) work from them alone.

## Step 0: Gather Context

1. Take the approved Specification from the atui Task; in a session without a Task, from the conversation.
2. Without an approved Specification, stop and tell the user to run /atui:refinement first.

## Step 1: Draft the Test Plan

Let a subagent draft the test plan, with a prompt built from the specification and the Testplan Standards below. It:
1. Analyses existing tests, to avoid duplicates and match the project's test structure.
2. Designs test classes and methods following the Testplan Standards.
3. Returns only the test plan, plus the existing tests that already cover parts of the specification.

## Step 2: Review with the User

Present the test plan and iterate until approved, raising open questions one at a time.

Test names and structure document the target behaviour completely: someone reading only the test plan understands every requirement.

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
- Group by feature: one test class per endpoint/feature/component.
- Test at the right level: API behaviour at API level, service logic at service level.
- Don't duplicate existing tests. Where requirements change, the changes to existing tests are part of the test plan.

## Done

Once the test plan is approved, report that it is ready for /atui:implementation.
