---
name: commit
description: Commit current changes with a well-crafted commit message.
---
# Commit

Commit all current changes (staged, unstaged, untracked) with a message following @shared/commit_message.md, then show the user the message. With nothing to commit, say so and stop.

Leave secrets (`.env`, credentials) out of the commit. On an error, stop and report it.
