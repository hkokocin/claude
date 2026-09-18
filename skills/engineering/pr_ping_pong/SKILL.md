---
name: pr_ping_pong
description: Make a PR ready for user review.
---
# Review Loop

Watch the current branch's PR for review comments and CI failures, process them, push fixes, and repeat. Run the following loop up to 3 times:

1. Identify the PR. If no PR exists, stop and tell the user.
2. Request a review by Copilot
3. Wait for Copilot review to come in.
  * if there are comments run the /review_comments skill. Do not ask for approval but make reasonable decisions. Sum the important changes up at the end of the loop - nits are not worth mentioning.
  * else stop the review loop
4. Make sure changes have been pushed and go back to 2.
