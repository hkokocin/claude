--
name: test
description: Write failing behavioural tests following TDD. Use when writing tests, creating test strategy, or understanding test structure. Triggers on test writing, test organization, behavioral tests, assertions, "red phase".
---
# Test Writing (RED Phase)

Write failing tests before implementation. Tests are a specification of behaviour.

## Workflow (when invoked via /test)
1. Create a test plan for the planned change. 
  - The test plan shall list all planned test classes and methods as described in the "Naming" section below.
2. Get user approval on the test plan.
3. Write tests.
4. Run tests and confirm they fail FOR THE RIGHT REASON (missing implementation, not broken tests).
5. Do NOT write or modify production code.

## Testing Standards
- Tests are documentation: the sum of all test names reads like a specification of the system.
- Behavioural focus: test what the code does, not how it does it.
- Minimalistic: "If it is not required to be in the test, it is required NOT to be in the test."

## Naming
Test names describe behaviour, not implementation:
```
class TestGetUser:
    def test_it_returns_user_data
    def test_it_returns_404_if_user_not_found
    def test_it_rejects_unauthenticated_requests
```
Test names descibe requirements in a non technical way.
* DON'T: `test_it_returns_422_when_translations_list_is_empty`
* DO: `test_it_rejects_products_without_translations`
Keep the happy path test name simple:
* DON'T: `test_it_creates_a_product_with_translations`
* DO: `test_it_creates_a_product`

```
## Data Management
- One assertion per test: each test verifies exactly one behaviour.
- Asserted data = explicit in the test body.
- Non-asserted data = factories. Use existing project factories.
- Setup in `setup_class`: create shared test data once per test class.

## Mocking
- NEVER mock internal code (repositories, services, etc.)
- ONLY mock third-party services (payment gateways, external APIs)
- Use orchestrators (services) to separate logic from external dependencies
- Write integration tests against real databases, not mocked ones

## Structure
- `tests/unit/` and `tests/integration/` mirror `src/` structure
- Group by feature: one test class per endpoint/feature/component
- Test at the right level: API behaviour at API level, service logic at service level

## Constraints
- Do NOT stub implementations
- Ask questions about unclear requirements — do not guess
- Tests must fail because implementation does not exist, not because tests are wrong
- Follow existing test patterns in the project exactly
