---
name: merge
description: Use when the current branch is behind main or its pull request has conflicts, to merge main with approved resolutions.
---
# Merge Main

Merge the latest `origin/main` into the current feature branch, never on main itself. Merge only: no rebase or force-push.

1. **Merge.** Without conflicts, commit the merge and stop; no test run is needed.
2. **Analyse conflicts.** Group the conflicting hunks by logical change (the same feature, refactor or fix, across files) and name each group by its domain concept (e.g. "User authentication rework"), not by file or line. Recommend a resolution per group (ours, theirs or a combination) with the reason in domain language. Wait for the user's approval.
3. **Finalise.** Resolve as approved, review the involved files for coherence, run the quality gates (linter, type checker, full test suite) and fix issues, then commit the merge.

Tell the user about every test you change. If the merge leaves failures you can't fix, stop and report.
