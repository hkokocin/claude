---
name: implement
description: Implement minimal code to make failing tests pass.
disable-model-invocation: true
---
# Implementation (GREEN Phase)

Write the minimum code to make failing tests pass. Nothing more.

## Task
1. Read the tests on the current branch
2. Study architecture patterns in similar existing code
3. If conflicting patterns exist, ask which to follow
4. Implement minimal changes to make tests pass
5. Run quality gates (linter, type checker, tests) and fix issues

## Constraints
- NEVER change tests without explicit user approval
- NEVER add functionality not required by the tests
- Run solutions that require significant complexity by the user first. Requirements are always negotiable.
- Follow existing project architecture patterns
- Apply YAGNI, KISS, DRY
