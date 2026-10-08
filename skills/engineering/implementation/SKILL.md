---
name: implementation
description: Implement an approved specification, or the fixes of a review, with TDD in two Opus sub agents.
---
# Implementation

Set the Task's status to `implementation` (/task). Follow the TDD rules. The main conversation hands over and checks results; the sub agents write the code.

1. **Red**: launch the `test-writer` sub agent with the specification (or the findings to fix) and the relevant existing tests. It writes failing tests and confirms they fail for the right reason. A fix that changes no behaviour (e.g. a rename) needs no new test.
2. **Green and refactor**: launch the `implement` sub agent with the failing tests, their output and the specification. It makes them pass, refactors while they stay green and runs the Project's quality gates.
3. Check that the quality gates pass, then /commit.

Tests run against the Agent's own database (/agent_database). The sub agents don't see this conversation: put everything they need into their prompts.
