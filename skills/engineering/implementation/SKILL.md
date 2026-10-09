---
name: implementation
description: Implement an approved specification, or the fixes of a review, with TDD - in the main conversation or in two sub agents, depending on the Task's tier.
---
# Implementation

Entered from /develop, set the Task's status to `implementation` (/task); fixes from /review or /user_review keep the status. Follow the TDD rules.

Where it runs depends on the Task's tier (/develop):
* `small`: in the main conversation; you write the tests and the code yourself, in the same steps.
* `medium`: in the `test-writer` and `implement` sub agents, launched with `model: "sonnet"`.
* `large`: in the same sub agents, launched with `model: "opus"`.

With sub agents, the main conversation hands over and checks results; the sub agents write the code.

1. **Red**: write failing tests from the specification (or the findings to fix), next to the relevant existing tests, and confirm they fail for the right reason; with sub agents, the `test-writer` does it. A fix that changes no behaviour (e.g. a rename) needs no new test.
2. **Green and refactor**: make them pass, refactor while they stay green and run the Project's quality gates; with sub agents, the `implement` sub agent does it, given the failing tests, their output and the specification.
3. Check that the quality gates pass, then /commit.

Tests run against the Agent's own database (/agent_database). The sub agents don't see this conversation: put everything they need into their prompts.

When the Specification turns out wrong or incomplete while implementing, don't deviate from it quietly: propose the change as a Suggestion on the Task (/task) and tell the user in the session.
