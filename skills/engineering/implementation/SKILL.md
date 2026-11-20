---
name: implementation
description: Use when an approved Specification, or the findings of a review, are to be built with TDD, where the Task's tier says.
---
# Implementation

When it starts and what a wrong Specification needs: /develop, Steps. Follow the TDD cycle. Where it runs depends on the tier (/develop, Tiers): `small` in the main conversation, writing tests and code yourself; `medium` and `large` in the `test-writer` and `implement` sub agents, on the tier's model. With sub agents, the main conversation hands over and checks results; the sub agents write the code and, not seeing this conversation, get everything they need in their prompts.

Before you change code, bring the Task's branch up to date with the remote main, so you build on the current code: the branch may be older than main, e.g. after a respawn or when main moved during a long Task.

1. **Red**: failing tests from the Specification (or the findings), next to the related existing tests, failing for the right reason; with sub agents, the `test-writer` writes them. A fix that changes no behaviour (e.g. a rename) needs no new test.
2. **Green and refactor**: make them pass and refactor while they stay green; with sub agents, the `implement` sub agent, given the failing tests, their output and the Specification.
3. The quality gates pass, then /commit.

Tests run as `atui resources run -- <test command>`, so each run gets databases of its own and doesn't clash with other Agents or the user's dev stack (/agent_database). Tell the sub agents so.

**Designs**: the UI builds the approved version of each Design of the Task (a Friend: those named in its Instructions, read from the Parent's Task, /atui, Designs). Save its HTML, read it and pass the path to the sub agents. Build its layout, content and texts with the project's own components and styles; the CSS inlined in the HTML is a reference, not code to copy.

## Fix rounds with sub agents

Keep one `test-writer` and one `implement` sub agent per Task and continue them for the fixes of /review and /user_review, so they don't read everything again:
* Note both agent ids when you launch them, and on every hand-over to an agent (launch or message) the HEAD sha at that moment.
* A fix round continues them with a message instead of a new launch: the `test-writer` gets the findings (and the Specification change, if any), the `implement` sub agent the failing tests and their output. The roles stay separate: the `test-writer` writes no production code, the `implement` sub agent doesn't change what a test checks.
* Start every follow-up with "Re-read `git status` and `git diff <the sha noted for this agent>`" (new files are untracked), since the other agent changed files in between, and end it with "Report this round's result". A resumed agent may hand back its previous report: check the result yourself (tests, diff).
* Launch fresh ones only when none exists for the Task (none launched in this session, or its id was lost to /clear, a restart or compaction) or the Specification was rewritten.
