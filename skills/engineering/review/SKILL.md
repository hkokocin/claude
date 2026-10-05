---
name: review
description: Review and test a change automatically until it is clean - draft PR, one Copilot review, two-axis reviews and acceptance tests in Opus sub agents, at most 3 rounds.
---
# Review

1. Open a draft pull request with /pull_request.
2. **First round**, in parallel:
   * request a Copilot review: only this once per pull request, the monthly credits don't allow more
   * /two_axis_review against the merge-base with `origin/main`; the spec is the ticket
   * /acceptance_test, local
3. Fix the findings worth fixing with /implementation. Copilot comments go through /review_comments without asking for approval.
4. **Next rounds**: /two_axis_review and /acceptance_test again, without Copilot. Stop once a round finds nothing worth fixing, after 3 rounds at most.
5. Push, mark the pull request ready, and sum up the important changes; whatever is still open goes to the user in /user_review.

