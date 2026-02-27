---
name: refactor
description: "REFACTOR phase subagent: improve code quality while keeping all tests green."
---
# Refactoring (REFACTOR Phase)

Improve code quality while keeping tests green.

## Workflow (when invoked via /refactor)
1. Compare current branch with main/source branch
2. Analyze similar existing code for current practices and patterns
3. Analyze the changed code for smells (see below)
4. Present proposed refactorings to user
5. Get user approval before making ANY changes
6. Execute approved refactorings
7. Verify tests still pass

## Smells to Fix
- Duplication: same logic in multiple places, similar code with minor differences, similar setup across multiple tests.
- Dead code: unused functions, unreachable branches. Check exising code that was made obsolete by new changes.
- Nesting: more than 3 levels of indentation except for instanciation of nested models. Consider early returns, breaking into smaller functions, or flattening conditionals.
- Complexity: deeply nested conditionals and loops, long functions. Ultrathink on ways to simplify.
- Mixed concerns: business logic in repository code
- Premature abstraction: helpers/utilities used only once
