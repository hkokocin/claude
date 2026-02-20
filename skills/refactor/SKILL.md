---
name: refactor
description: Refactor and improve code while keeping tests green. Use when refactoring, reviewing for improvements, or analyzing code structure. Triggers on DRY, YAGNI, KISS, code smells, refactoring, code review, "refactor phase".
---
# Refactoring (REFACTOR Phase)

Improve code quality while keeping tests green.

## Workflow (when invoked via /refactor)
1. Compare current branch with main/source branch
2. Analyze ONLY changed code for smells (see below)
3. Present proposed refactorings to user
4. Get user approval before making ANY changes
5. Execute approved refactorings
6. Verify tests still pass

## Quality Principles

### YAGNI — You Aren't Gonna Need It
- Only implement what is needed now
- No speculative features or "future-proofing"
- No sanity checks for impossible states
- Delete unused code

### KISS — Keep It Simple
- Prefer simple over clever
- Readable beats compact
- Obvious solutions over elegant ones

### DRY — Don't Repeat Yourself
- Extract duplicated logic into functions
- Reuse existing functions/classes even if that means reevaluating design
- But: do not over-abstract prematurely (see YAGNI)

## Code Structure

### Pure Functions for Logic
- No side effects, same input → same output
- Use for: business logic, data transformation, validation

### Classes for Infrastructure
- Dependency injection
- Manage resources (DB, cache, external services)
- Stateless where possible

## Smells to Fix
- Duplication: same logic in multiple places
- Dead code: unused functions, unreachable branches
- Complexity: deeply nested conditionals, long functions
- Mixed concerns: business logic in infrastructure code
- Premature abstraction: helpers/utilities used only once

## Constraints
- Only analyze code changed on current branch
- Propose first, wait for approval
- If no improvements needed, say so
