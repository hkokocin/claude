---
name: autopilot
description: Supervise a Task's whole dev process without waiting on the user - the Parent writes and approves its Subtasks' Specifications, answers its Friends and reviews and merges their pull requests itself. Applies while the Task's Property autopilot is true; used by /develop, /refinement, /user_review and /squash_and_merge_pr.
---
# Autopilot

Autopilot is on while the Task's Property `autopilot` is `true` (awui's Autopilot switch sets it). Check it whenever a step would wait on the user: the user may switch it off at any time, and from then on the steps run as usual. Everything not changed here follows /develop and /atui, Friends.

**Consent**: the user approves only the Parent's Specification, which holds the goal. That approval hands the details to the Agent and is the user's consent in the session for everything below, so no merge waits on the user.

**Friends' questions**: a Friend asks its Parent, not the user (/atui, Friends). The Parent answers from its Specification and the Stream's decisions. Only a question that would change the goal, i.e. the Parent's Specification, becomes a Suggestion on the Parent's Task, and the Parent waits for the user's decision.

## /refinement: the Subtasks

* **Goal**: approved Subtasks without the user going through each.
* **Starts / ends**: starts once the user approved the Parent's Specification; ends with every Subtask created approved, with its tier.
* **Status**: as in /refinement.
* **Approval**: the Agent approves the Subtasks' Specifications itself; the breakdown is not agreed on with the user.
* **Instructions**: break the Task down (/refinement, Breakdown), write each Subtask's Specification (/specification) and tier, and create it approved. Post the breakdown on the Parent's Stream as a short result, so the user keeps the overview. A change to a Subtask's approved Specification is made directly, without a Suggestion, and approved again.

## /user_review: the Parent reviews

* **Goal**: the Friend's pull request does what its Subtask's Specification says, without presenting it to the user.
* **Starts / ends**: starts on the Friend's Message; ends with the merge.
* **Status**: the Subtask is set to `review`.
* **Approval**: none from the user; the Agent decides every point /review left open itself.
* **Instructions**: check that the diff does what the Subtask's Specification says, and that the pull request is mergeable with green checks (/squash_and_merge_pr, Mergeability). A change the Agent wants goes to the Friend as a Message, as a user's change request would (/user_review, Changes).

## /squash_and_merge_pr: the Parent merges

* **Goal**: merge the Friend's pull request without a merge Decision for the user.
* **Starts / ends**: starts once the review above is clean; ends with the merge posted on the Subtask's Stream. Then the dev test, `done` and the next Friend, as /develop says.
* **Status**: unchanged.
* **Approval**: the user's approval of the Parent's Specification (Consent).
* **Instructions**: post no merge Decision of your own. Answer aservice's approval request "Merge <PR title>?" on the Subtask's Stream yourself by choosing Merge; while aservice has posted none, post none either. Run /squash_and_merge_pr, then post the merge as a short result on the Subtask's Stream, with the pull request as a link.

## Stays with the user

* **Design approvals**: the user approves every Design (/atui, Designs); the work on a screen waits for it as usual.
* **The Parent's Specification**: its approval, and every change of it (a Suggestion).
* **A failed deployment or dev test**: asked as a Decision, as /develop says.
* **Everything the user does** on the Stream, relayed or not: a Choice, a Reply or a change request overrides the Agent's own decision and is taken up as /atui, Stream says. Request changes on an approval request stops the merge.
