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
- Title: `<Type>: <concise imperative description>` where Type is `Feature`, `Fix`, or `Chore`.
- Body: 0–5 bullet points covering the most significant changes, written from a user/product perspective.
- End with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.
