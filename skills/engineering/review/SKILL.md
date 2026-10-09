---
name: review
description: Review and test a change automatically until it is clean - draft PR, Claude reviews and acceptance tests, a Copilot review for large Tasks, as deep and as many rounds as the Task's tier says.
---
# Review

The Task's tier (/develop) decides the depth:
* **Claude review**: `small` one sub agent with `model: "sonnet"` that reviews the Standards and the Spec axis of /two_axis_review in one pass; `medium` and `large` /two_axis_review, its sub agents launched with `model: "opus"`.
* **Copilot review**: `large` only.
* **Rounds**: `small` 1, `medium` 2 at most, `large` 3 at most.
* The local /acceptance_test runs where its tier says.

1. Open a draft pull request with /pull_request.
2. **First round**, in parallel:
   * `large` only: request a Copilot review, only this once per pull request; the monthly credits don't allow more
   * the Claude review against the merge-base with `origin/main`; the spec is the Task's Specification
   * /acceptance_test, local
3. Fix the findings worth fixing with /implementation. Copilot comments go through /review_comments without asking for approval.
4. **Next rounds**: the Claude review and /acceptance_test again, without Copilot. Stop once a round finds nothing worth fixing, or after the tier's rounds.
5. Push with /pull_request, mark the pull request ready, and sum up the important changes; whatever is still open goes to the user in /user_review. Post the review result on the Task (/atui): what was fixed and what is still open.
