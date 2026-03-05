---
name: merge
description: Merge the latest main into the current branch. Analyses conflicts, groups them by feature, presents resolution suggestions, then executes after approval.
---
# Merge Main

Merge the latest version of `origin/main` into the current feature branch. Refuse to run on main.

## Workflow

### Step 1: Merge

1. Fetch origin and merge `origin/main` into the current branch.
2. If no conflicts: commit the merge and stop. Do NOT run tests.

### Step 2: Analyse Conflicts

1. Read all conflicted files.
2. **Group conflict hunks by logical change** — hunks from the same feature, refactor, or fix belong together, even across files. Name groups by domain concept (e.g. "User authentication rework"), not by file or line number.
3. For each group, recommend a resolution (ours, theirs, or combination) and explain why in domain language.
4. **Wait for approval** before resolving.

### Step 3: Finalise (only after conflict resolution)

1. Resolve conflicts per the approved plan.
2. Run quality gates: linter, type checker, full test suite. Fix issues.
3. Commit the merge.

## Constraints
- NEVER force-push or rewrite history.
- NEVER modify tests without telling the user.
- If the merge introduces unfixable failures, stop and report.
