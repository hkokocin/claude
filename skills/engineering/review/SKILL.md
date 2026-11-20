---
name: review
description: Use when a change is implemented and needs automated review and testing before the user sees it: draft PR, Claude reviews and acceptance tests, a Copilot review for large Tasks, as deep and as many rounds as the Task's tier says.
---
# Review

## Goal

A change that is clean before the user sees it: reviewed against the Specification and the repo's standards, and acceptance tested.

## Starts / ends

Starts after /implementation. Ends when a round finds nothing worth fixing or the tier's rounds are used up, with the pull request ready for review.

## Status

Stays `implementation`.

## Approval

None. Copilot comments go through /review_comments without asking.

## Instructions

The tier sets the depth (/develop, Tiers): the Claude review (`small`: one Sonnet sub agent covering both axes of /two_axis_review in one pass; `medium` and `large`: /two_axis_review on Opus), the Copilot review (`large` only), the local /acceptance_test and the number of rounds.

1. Open a draft pull request with /pull_request.
2. **First round**, in parallel:
   * `large` only: request a Copilot review, once per pull request; the monthly credits don't allow more;
   * the Claude review against the merge-base with `origin/main`, with the Task's Specification as the spec;
   * the local /acceptance_test.
3. Fix the findings worth fixing with /implementation.
4. **Next rounds**: the Claude review and /acceptance_test again, without Copilot, until a round finds nothing worth fixing or the tier's rounds are used up.
5. Push with /pull_request, mark the pull request ready and sum up the important changes. Post the result on the Stream: what was fixed and what is still open; the open points go to the user in /user_review.
