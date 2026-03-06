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
   **Code smells:**
   1. **Duplication**: same logic in multiple places, similar code with minor differences. Pay special attention to duplicate SQL queries and opportunities for model consolidation.
   2. **Dead code**: unused functions, unreachable branches. Check existing code that was made obsolete by new changes.
   3. **Nesting**: more than 3 levels of indentation except for instantiation of nested models. Consider early returns, breaking into smaller functions, or flattening conditionals.
   4. **Complexity**: deeply nested conditionals and loops, long functions. Ultrathink on ways to simplify.
   5. **Mixed concerns**: business logic in repository code.
   6. **Premature abstraction**: helpers/utilities used only once.
   7. **Minimal implementation**: check for over-engineering beyond what the tests require. Flag code that isn't exercised by any test.
   8. **Project instructions**: verify adherence to CLAUDE.md and project conventions.
   **Test smells:**
   9. **Test duplication**: same behavior tested at multiple layers (e.g. unit + integration testing identical logic).
   10. **Test placement**: are tests at the right layer? Can integration tests be converted to unit tests?
   11. **Test coverage**: identify changed production code that lacks corresponding tests.
   12. **Test setup duplication**: similar setup/fixtures repeated across multiple tests.
4. Combine findings into a single summary grouped by smell type. Only include smells where issues were actually found.
5. Get user approval before making ANY changes
6. Execute approved refactorings
7. Verify tests still pass
