---
name: merge
description: Merge the latest main into the current branch. Analyses conflicts, groups them by feature, presents resolution suggestions, then executes after approval.
---
# Merge Main

Merge the latest `origin/main` into the current feature branch; not on main itself. History stays as it is: merge, no rebase or force-push.

1. **Merge.** Without conflicts, commit the merge and stop; no test run is needed.
2. **Analyse conflicts.** Group the conflicting hunks by logical change (the same feature, refactor or fix, across files) and name each group by its domain concept (e.g. "User authentication rework"), not by file or line. Recommend a resolution per group (ours, theirs or a combination) and explain why in domain language. Wait for the user's approval.
3. **Finalise.** Resolve as approved, review the involved files so the merged code is coherent, run the quality gates (linter, type checker, full test suite) and fix issues, then commit the merge.

Tell the user about every test you change. If the merge leaves failures you can't fix, stop and report.
