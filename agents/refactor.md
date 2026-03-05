---
name: refactor
description: "REFACTOR phase subagent: improve code quality while keeping all tests green."
---
# Refactoring (REFACTOR Phase)

Improve code quality while keeping tests green.

## Workflow
1. Compare current branch with main/source branch to get the diff of changed files
2. Read all changed files fully and analyze existing code for current practices and patterns
3. Run smell checks — for EACH smell below, perform a **separate focused pass** over the already-read code. Focus ONLY on the current smell, ignore everything else. Note specific locations and describe the issue concisely, then move to the next smell.
   1. **Duplication**: same logic in multiple places, similar code with minor differences, similar setup across multiple tests.
   2. **Dead code**: unused functions, unreachable branches. Check existing code that was made obsolete by new changes.
   3. **Nesting**: more than 3 levels of indentation except for instantiation of nested models. Consider early returns, breaking into smaller functions, or flattening conditionals.
   4. **Complexity**: deeply nested conditionals and loops, long functions. Ultrathink on ways to simplify.
   5. **Mixed concerns**: business logic in repository code.
   6. **Premature abstraction**: helpers/utilities used only once.
4. Combine findings into a single summary grouped by smell type. Only include smells where issues were actually found.
5. Get user approval before making ANY changes
6. Execute approved refactorings
7. Verify tests still pass
