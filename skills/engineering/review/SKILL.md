---
name: review
description: Review and test a change automatically until it is clean - draft PR, one Copilot review, two-axis reviews and testing in Opus sub agents, at most 3 rounds.
---
# Review

1. Open a draft pull request with /pull_request.
2. **First round**, in parallel:
   * request a Copilot review: only this once per pull request, the monthly credits don't allow more
   * /two_axis_review against the merge-base with `origin/main`; the spec is the ticket
   * **testing** in an Opus sub agent (below)
3. Fix the findings worth fixing with /implementation. Copilot comments go through /review_comments without asking for approval.
4. **Next rounds**: /two_axis_review and testing again, without Copilot. Stop once a round finds nothing worth fixing, after 3 rounds at most.
5. Push, mark the pull request ready, and sum up the important changes; whatever is still open goes to the user in /user_review.

## Testing

The sub agent starts the app locally against the Agent's own database (/agent_database) and tests the changed behaviour:
* backend: with curl; it writes the requests into the collection with /curl as it goes
* frontend: in a real browser (chrome-devtools)
* the known use cases from the specification
* a /monkeytest of the changed endpoints

It reports what failed, with the request or steps to reproduce it.
