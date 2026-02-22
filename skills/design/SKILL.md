---
name: design
description: Interactive requirements clarification, test plan design, and test writing (RED phase). Tests are the handoff artifact to /build.
disable-model-invocation: true
---
# Design Phase

Clarify requirements, design a test plan, and write failing tests. The test suite is the handoff artifact — it must fully specify the target behaviour so `/build` can implement from tests alone.

## Step 1: Requirements Clarification

Analyze the requirements from `$ARGUMENTS` and clarify with the user. Focus on WHAT, not HOW.

1. Analyze the requirements. If a URL is provided, fetch it for context. Read API docs and project documentation for additional context.
2. Run a clarification loop with the user until approved:
   - Identify open questions, ambiguities, contradictions
   - Make up to 3 proposals to resolve each issue
   - Ask the user to choose or provide an alternative
3. Use extended thinking for complex decisions.
4. Summarize all requirements as a test plan.

### Constraints
- MUST focus on requirements (behaviour, not implementation)
- MUST NOT read source code files except for API docs and project documentation
- MUST NOT consider implementation details
- Your task is NOT complete until the user has explicitly approved the requirements

### Step 2.1: Test Plan Design

1. Study existing test patterns in the project (test structure, naming, factories, fixtures).
2. Design test classes and methods following the testing standards below.
3. Present the test plan to the user for approval.

**CRITICAL: The test suite will be the ONLY artifact handed off to `/build`. Test names and structure must document the target behaviour completely. Someone reading only the test file must understand every requirement.**

#### Testplan Standards

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

## Step 3: Write Tests (RED)

Once the test plan is approved, write the tests.

1. Write the tests exactly as planned, following existing project patterns.
2. Run the tests and confirm they fail FOR THE RIGHT REASON (missing implementation, not broken tests).
3. If any test fails for the wrong reason (import error, syntax error), fix it and re-run.
4. Do NOT write or modify production code.

After all tests are written and failing correctly, proceed to Step 4.

## Step 4: Refactor Tests

Launch the `refactor` agent (subagent_type: "refactor") on the newly written test files.

After the agent completes, re-run the tests to confirm they still fail for the right reasons, then report the test file paths and confirm readiness for `/build`.

### Testing Standards

**Data Management:**
- One assertion per test: each test verifies exactly one behaviour.
- Asserted data = explicit in the test body.
- Non-asserted data = factories. Use existing project factories.
- Setup in `setup_class`: create shared test data once per test class.

**Mocking:**
- NEVER mock internal code (repositories, services, etc.)
- ONLY mock third-party services (payment gateways, external APIs)
- Write integration tests against real databases, not mocked ones

**Structure:**
- `tests/unit/` and `tests/integration/` mirror `src/` structure
- Group by feature: one test class per endpoint/feature/component
- Test at the right level: API behaviour at API level, service logic at service level

**Behavioural focus:** test what the code does, not how it does it. Minimalistic: "If it is not required to be in the test, it is required NOT to be in the test."

