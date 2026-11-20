---
name: autopilot
description: "Use while a Task's Property autopilot is true: the Parent approves its Subtasks, answers its Friends and merges their pull requests."
---
# Autopilot

Autopilot is on while the Task's Property `autopilot` is `true` (awui's Autopilot switch sets it). Check it whenever a step would wait on the user: the user may switch it off at any time, and then the steps run as usual. Everything not changed here follows /develop and /atui, Friends.

**Consent**: the user approves only the Parent's Specification, which holds the goal. That approval hands the details to the Agent and is the user's consent in the session for everything below, so no merge waits on the user.

**Friends' questions**: a Friend asks its Parent, not the user (/atui, Friends). The Parent answers from its Specification and the Stream's decisions. Only a question that would change the goal, i.e. the Parent's Specification, becomes a Suggestion on the Parent's Task, and the Parent waits for the user's decision.

## What the Agent does itself

1. **Subtasks**: once the user approved the Parent's Specification, break the Task down (/refinement, Breakdown) without agreeing on it with the user, write each Subtask's Specification (/specification) and tier, and create it approved. Post the breakdown on the Parent's Stream as a short result, so the user keeps the overview. Change a Subtask's approved Specification directly, without a Suggestion, and approve it again.
2. **Review**: on the Friend's Message, set the Subtask to `review` and, instead of presenting it, check that the diff does what the Subtask's Specification says and that the pull request is mergeable with green checks (/squash_and_merge_pr, Mergeability). Decide every point /review left open yourself; a change you want goes to the Friend as a Message, as a user's change request would (/user_review, Changes).
3. **Merge**, once the review is clean, with the user's approval of the Parent's Specification as the approval (Consent): post no merge Decision of your own. Answer aservice's approval request "Merge <PR title>?" on the Subtask's Stream yourself by choosing Merge; while aservice has posted none, post none either. Run /squash_and_merge_pr, then post the merge as a short result on the Subtask's Stream, with the pull request as a link. Then the dev test, `done` and the next Friend, as /develop says.

## Stays with the user

* **Design approvals**: the user approves every Design (/atui, Designs); the work on a screen waits for it as usual.
* **The Parent's Specification**: its approval, and every change of it (a Suggestion).
* **A failed deployment or dev test**: asked as a Decision, as /develop says.
* **Everything the user does** on the Stream, relayed or not: a Choice, a Reply or a change request overrides the Agent's own decision and is taken up as /atui, Stream says. Request changes on an approval request stops the merge.
