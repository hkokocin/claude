---
name: review
description: Use when an implemented change needs automated review and testing before the user sees it, as deep as the Task's tier says.
---
# Review

The tier sets which reviews run, on which model, and how many rounds (/develop, Tiers).

1. Open a draft pull request with /pull_request.
2. **First round**, in parallel:
   * `large` only: request a Copilot review, once per pull request; the monthly credits don't allow more;
   * the Claude review against the merge-base with `origin/main`, with the Task's Specification as the spec;
   * the local /acceptance_test.
3. Fix the findings worth fixing with /implementation. Copilot comments go through /review_comments without asking.
4. **Next rounds**: the Claude review and /acceptance_test again, without Copilot, until a round finds nothing worth fixing or the tier's rounds are used up.
5. Push with /pull_request, mark the pull request ready and sum up the important changes. Post the result on the Stream: what was fixed and what is still open; the open points go to the user in /user_review.
