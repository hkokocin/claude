# Auto-commit for config repo

This repo IS the ~/.claude config directory.

## On task start (including after /clear)
- Run `git status` to check for uncommitted changes.
- If uncommitted changes exist, draft a commit message and offer to commit before proceeding.

## On task completion
- Automatically commit all changes without asking.
- Present the commit message inline so the user sees what was committed.

## When the user sounds satisfied
- If the user confirms, approves, or sounds happy with a change (e.g. "looks good", "perfect", "nice"), treat that as task completion and commit.

## Commit message format
Follow @shared/commit_message.md
