---
name: pr_ping_pong
description: Make a PR ready for user review.
---
# Review Loop

Watch the current branch's PR for review comments and CI failures, process them, push fixes, and repeat. Run the following loop up to 3 times:

1. Identify the PR. If no PR exists, stop and tell the user.
2. Request a review by Copilot and launch a /two_axis_review in parallel
3. Wait for Copilot review to come in. If there are comments run the /review_comments skill. Do not ask for approval but make reasonable decisions. Sum the important changes up at the end of the loop - nits are not worth mentioning. Do the same for the findings of the two axis review
4. After issues of both reviews are resolved run another /two_axis_review and a local /monkeytest in parallel.
5. Resolve the findings, then mark the pr ready for review and report.
