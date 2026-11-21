---
name: develop
description: Use as the entry point of every atui Agent, or in a session started by hand when the user wants a change built end to end.
---
# Develop

Takes a Task from an idea to a change that is merged, tested on dev and `done`. Start where the Instructions in the Briefing say (a Friend at /implementation); without Instructions at /refinement, or at /implementation when the Specification is already approved. Where the Task has an Asana task, it follows every status change (/asana).

As an atui Agent, load /atui before the first step, also when you start at a later one: it says how you work with your Task, beginning with reading its open Threads. Report your Phase whenever it changes. Keep the Task and its Stream up to date (/atui).

## Steps

Run them in order; each sets its own status (/atui, Status).

| Step | Goal | Starts / ends | Status | Needs the user's approval |
|---|---|---|---|---|
| /refinement | Specification, Designs for changed screens, tier; maybe Subtasks | starts the Task; ends once the Specification and every Design are approved and the tier is set | `refinement` | the Specification (simple Tasks too), every Design, the tier (or an override), a breakdown |
| /implementation | code that does what the Specification (or a review's findings) asks, tests first | once the Specification and every Design are approved, or with the findings of /review or /user_review; ends committed, tests and quality gates green | `implementation`; fix rounds from /review or /user_review keep it | none; a wrong or incomplete Specification becomes a Suggestion (/atui, Stream), not a quiet deviation |
| /review | clean before the user sees it | after /implementation; ends with the pull request ready, once a round finds nothing worth fixing or the tier's rounds are used | stays `implementation` | none |
| /user_review | the user tries the change and decides on the merge | after /review, or as a Parent on a Friend's Message; ends with the merge and the app stopped, or when `github` resolves the merge Decision | `review`, on the Task whose pull request it is (a Friend's: its Subtask) | the merge |
| Dev test | the merge commit works on dev | after the merge; ends when it passed or the user chose | unchanged | on failure, how to go on |
| /finish | curl collection matches main, Task `done` | after the dev test passed (after the merge without a dev system); a Parent once its last Friend's change got there | `done`, the last act: it retires the Agent | none |

**Approval**: the Specification and each Design count as approved once you recorded the user's approval in the session, an approval Message arrived, or the Task shows it approved; a Friend's Designs are those named in its Instructions. Until all are, an Agent stays in /refinement and no Friend is spawned. Missing something to start, e.g. the tier: ask it as a Decision (/atui, Stream), e.g. the three tiers with the recommended one marked, and wait. During the implementation a cleared approval (unapproved, or a new version of the Specification or a Design) changes nothing; a newer approved version may pause the work to adapt the plan; a reopened Design pauses the work on its screen until a version of it is approved again.

### Dev test

Wait for the deployment of the merge commit to dev, then run /acceptance_test on dev, where the tier says. If the deployment or the test fails, ask it as a Decision (/atui, Waiting on the user), e.g. "Dev test of <PR title> failed", with the options Fix it (back to /implementation) and Finish anyway, the recommendation marked, and wait for the Choice. A repo without a dev system (/atui, Status says which) has no dev test: the merge finishes the Task.

### Tiers

/refinement rates the Task `small`, `medium` or `large` and stores it as the Task's `tier` property. The tier decides where each step runs and how deep the review goes:

| Step | small | medium | large |
|---|---|---|---|
| Implementation | main conversation, TDD by the Agent itself | `test-writer` and `implement` sub agents on Sonnet | sub agents on Opus |
| Copilot review | no | no | yes, once |
| Claude review | one Sonnet sub agent, both axes in one pass | /two_axis_review, Opus sub agents | /two_axis_review, Opus sub agents |
| Local acceptance test | main conversation, no monkeytest | Sonnet sub agent | Opus sub agent |
| Review rounds | 1 | 2 at most | 3 at most |
| Dev acceptance test | main conversation | Sonnet sub agent | Opus sub agent |

Pass the model per sub agent launch. A session started by hand, without a `tier`, uses `large`, in its own conversation (no Task, no Friends). An Agent whose Task has no `tier` asks for it (Approval).

### Friends

`small` and `medium` Tasks run the steps after /refinement in the Agent's own conversation. A `large` Task, and every Subtask of a breakdown, is implemented by Friends (/atui, Friends).

**As the Parent**, after /refinement, for the whole Task or each Subtask, one at a time (under Autopilot as /autopilot changes it):
1. Create the Subtask with the approved Specification, approved, with its `tier`, and spawn its Friend on Opus, with Instructions to start at /implementation, what it needs and the approved Designs it builds (/atui, Friends). With the first Friend, set your own Task to `implementation`.
2. On the Friend's Message: /user_review with the Friend's app; change requests go to the Friend as Messages. What the user does on the Subtask's Stream reaches you through the Friend's relay (/atui, Friends, Relay). On approval, merge.
3. The dev test for the merge commit, where the Subtask's tier says; once it passed (or right after the merge without a dev system), set the Subtask to `done`, which retires the Friend.
4. With a breakdown, spawn the next Friend.

After the last Friend's change passed the dev test (or is merged, without a dev system), run /finish for your own Task.

**As a Friend**: run /implementation and /review, keep the curl collection current (/curl), start the app as /user_review describes, and send your Parent one Message: the pull request URL, the app URL, the curl file, what to try, what /review left open and which database the app runs on. Relay what the user does on your Subtask to your Parent (/atui, Friends, Relay). Then wait for your Parent's Messages: a change request goes through /implementation and a local /acceptance_test, pushed with /pull_request; answer your Parent's Message once it is pushed. You don't talk to the user and run neither /user_review, the dev test nor /finish: your Parent setting your Subtask to `done` retires you.
