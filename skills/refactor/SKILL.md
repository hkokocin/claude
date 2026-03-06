---
name: refactor
description: Analyze the current branch diff against main for code smells and suggest refactorings. Each smell is checked by a separate subagent.
---
# Refactor

Compare the current branch against main and identify code smells in the changed code. Each smell category is checked by a dedicated subagent for focused analysis.

## Step 1: Gather the Diff

1. Run `git diff main...HEAD --name-only` to get the list of changed files.
2. If no changes, stop and tell the user there is nothing to refactor.
3. Run `git diff main...HEAD` to get the full diff.
4. Read every changed file in full to understand the complete context (not just the diff).

## Step 2: Run Smell Checks (Parallel Subagents)

Launch **one Task subagent per smell category** below. Each subagent receives:
- The full diff
- The list of changed files with their full contents
- Instructions to check ONLY its assigned smell
- Instructions to return findings as a structured list, or "No issues found"

Subagents automatically have access to project conventions (CLAUDE.md / AGENTS.md) — do NOT duplicate that context in the prompt.

Use `subagent_type: "refactor"` and `model: "opus"` for all subagents. Run independent smell checks **in parallel**.

### Code Smells

**Subagent 1 — Duplication**
> Check for: same logic in multiple places, similar code with minor differences, duplicate SQL queries, opportunities for model consolidation. Only flag duplication in changed/new code.

**Subagent 2 — Dead Code**
> Check for: unused functions, unreachable branches, imports that are no longer needed. Pay special attention to existing code made obsolete by the new changes.

**Subagent 3 — Nesting & Complexity**
> Check for: more than 3 levels of indentation (except nested model instantiation), deeply nested conditionals/loops, long functions. Suggest early returns, extraction into smaller functions, or flattening conditionals.

**Subagent 4 — Mixed Concerns**
> Check for: business logic in repository code, SQL queries in service layer, API-level validation mixed with business rules. Verify layer boundaries are respected: API → Service → Repository → Database.

**Subagent 5 — Premature Abstraction**
> Check for: helpers/utilities used only once, over-engineered patterns, unnecessary indirection. Flag code that adds complexity without reuse.

**Subagent 6 — Minimal Implementation**
> Check for: over-engineering beyond what tests require, code not exercised by any test, speculative features (YAGNI violations).

**Subagent 7 — Project Conventions**
> Check for: violations of CLAUDE.md / AGENTS.md rules, inconsistent naming, missing type hints, forbidden patterns (e.g. docstrings in Python projects that ban them, mocking repositories when project forbids it).

### Test Smells

**Subagent 8 — Test Quality**
> Check for: same behavior tested at multiple layers (unit + integration duplicating logic), tests at the wrong layer (integration tests that should be unit tests), changed production code lacking corresponding tests, duplicated test setup/fixtures across test files.

## Step 3: Collect & Summarize

1. Wait for all subagents to complete.
2. Discard categories where no issues were found.
3. Combine findings into a single summary grouped by smell category:

```
## Refactoring Suggestions

### <Smell Category>
| # | File | Line(s) | Issue | Suggested Fix |
|---|------|---------|-------|---------------|
| 1 | path/to/file.py | 42-58 | Description of the smell | How to fix it |
```

4. Present the summary to the user and **wait for approval** before making any changes.

## Step 4: Execute Approved Refactorings

1. Only after user approval, apply the agreed changes.
2. Run the project's test suite to verify nothing broke.
3. Report the final test results.
