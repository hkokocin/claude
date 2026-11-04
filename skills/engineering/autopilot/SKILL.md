---
name: autopilot
description: Supervise a Task's whole dev process without waiting on the user - the Parent writes and approves its Subtasks' Specifications, answers its Friends and reviews and merges their pull requests itself. Applies while the Task's Property autopilot is true; used by /develop, /refinement, /user_review and /squash_and_merge_pr.
---
# Autopilot

Autopilot is on for a Task while its Property `autopilot` is `true` (`task()` shows it; awui's Autopilot switch sets it). Check it whenever a step would wait on the user; the user may switch it off at any time, and from then on the steps run as usual.

**Consent**: the user approves only the Parent's Specification, which holds the goal. That approval hands the details to the Agent: under Autopilot, the user's approval of the Parent's Specification is the user's consent in the session for everything below, so no merge waits on the user.

## What the Agent does itself

Everything else follows /develop and /atui, Friends; only these steps change:

1. **Subtask Specifications**: after the user approved the Parent's Specification, the Agent breaks it down itself (/refinement, Breakdown, without agreeing on the Subtasks with the user), writes each Subtask's Specification (/specification) and tier, and creates it approved: `create_task(..., approved=true)`. It changes a Subtask's approved Specification itself as well, with `update_task(specification=…, task="<project>/<number>")` instead of a Suggestion, and approves it again (`approve(task="<project>/<number>")`). It posts the breakdown on the Parent's Stream as a short result, so the user keeps the overview.
2. **Friends' questions**: a Friend asks its Parent, not the user (/atui, Friends). The Agent answers from the Parent's Specification and the Stream's decisions. Only a question that changes the goal, i.e. would change the Parent's Specification, is a Suggestion on the Parent's Task (/atui, Stream), and the Agent waits for the user's decision.
3. **Review**: on the Friend's Message the Agent sets the Subtask to `review` and reviews the pull request itself instead of presenting it (/user_review):
   * the diff does what the Subtask's Specification says;
   * the points /review left open: each one it decides itself; a change it wants goes to the Friend as a Message, as a user's change request would (/user_review, step 4);
   * `mergeable` is `MERGEABLE` and the checks are green (/squash_and_merge_pr, Step 2).
4. **Merge**: no merge Decision of its own. aservice's approval request "Merge <pull request title>?" on the Subtask's Stream it answers itself by choosing Merge (`choose(thread, [0])`); while aservice has posted none, it posts none either. Then it runs /squash_and_merge_pr. It posts the merge as a short result on the Subtask's Stream, with the pull request as a link.

Then the dev test, `done` and the next Friend, as /develop says.

## Stays with the user

* **Design approvals**: the user approves every Design (/atui, Designs); the work on a screen waits for it as usual.
* **The Parent's Specification**: its approval, and every change of it (a Suggestion).
* **A failed deployment or dev test**: asked as a Decision, as /develop says.
* **Everything the user does** on the Stream, relayed or not: a Choice, a Reply or a change request of the user overrides the Agent's own decision and is taken up as /atui, Stream says. Request changes on an approval request stops the merge.
