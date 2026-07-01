---
name: commit
description: Commit current changes with a well-crafted commit message.
---
# Commit

Commit the current work with a descriptive commit message.

## Steps

1. Run `git status`. If there are no changes (staged, unstaged, or untracked), stop — nothing to commit.
2. Run `git diff` and `git diff --cached` to understand the changes.
3. Stage all changed and new files. Exclude secrets (`.env`, credentials).
4. Commit following @shared/commit_message.md
5. Present the commit message to the user.

## Constraints
- NEVER commit `.env` files or secrets.
- On error, stop and report.
