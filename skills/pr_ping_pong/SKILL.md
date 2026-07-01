---
name: pr_ping_pong
description: Make a PR ready for user review.
---
# Review Loop

Watch the current branch's PR for review comments and CI failures, process them, push fixes, and repeat.

1. Identify the PR. If no PR exists, stop and tell the user.
2. Check the pr status every 1 minutes
  a) run /review_comments skill
  b) check ci status - if a check failed analyse and fix the error
3. Make sure changes have been pushed and go back to 2.

**Stop conditions:** 30 minutes elapsed since the the last push.

## Constraints
- NEVER force-push.
- NEVER push secrets or `.env` files.
