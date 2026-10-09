---
name: develop
description: The dev process for a Task, from refinement to cleanup. The default entry point of every atui Agent; also usable in a session started by hand.
---
# Develop

Run the steps in order. Each step is a skill; follow it, then go on with the next one. As an atui Agent, report each step as a Phase (`phase(phase="<step>")`) when you enter it. Keep the Task and its Stream up to date as /atui describes: whatever matters beyond the session is posted on the Task as well as told in the session.

1. **/refinement**: specification and tier, approved by the user. It may break the Task down into Subtasks.
2. **/implementation**: TDD, where the tier says.
3. **/review**: automated review and testing until clean.
4. **/user_review**: the user tries it; merge on approval.
5. **dev test**: wait for the automatic deployment of the merge commit to dev (`gh run list --commit <sha>`, then `gh run watch`). Then run a /acceptance_test on dev, where the tier says. If the deployment or the test fails, tell the user, post it on the Task and wait.
6. **/finish**: curl collection and Task status.
7. **/cleanup**: the Agent's local resources. The Orchestrator runs it for every retired Agent as well.

Then wait until the user tells you that you may go.

## Tiers

/refinement rates the Task `small`, `medium` or `large` and stores it as the Task's `tier` property (`task()` shows it). The tier decides where each step runs and how deep the review goes:

| Step | small | medium | large |
|---|---|---|---|
| Implementation | main conversation, TDD by the Agent itself | `test-writer` and `implement` sub agents on Sonnet | sub agents on Opus |
| Copilot review | no | no | yes, once |
| Claude review | one Sonnet sub agent, both axes in one pass | /two_axis_review, Opus sub agents | /two_axis_review, Opus sub agents |
| Local acceptance test | main conversation, no monkeytest | Sonnet sub agent | Opus sub agent |
| Review rounds | 1 | 2 at most | 3 at most |
| Dev acceptance test | main conversation | Sonnet sub agent | Opus sub agent |

Pass the model per launch with the Agent tool's `model` parameter (`sonnet`, `opus`). Without a `tier` property (e.g. a session started by hand), use `large`; without a Task there are no Friends, so it runs in your own conversation.

## Friends

`small` and `medium` Tasks run steps 2-7 in your own conversation. A `large` Task is implemented by Friends, as are all Subtasks of a breakdown (/atui, Friends):

**As the Parent**, after /refinement, for the whole Task or for each Subtask, one at a time:
1. Create the Subtask with the approved Specification and its `tier` property (/refinement does) and spawn the Friend on Opus, with Instructions to start at /implementation and what you need (/atui). With the first Friend, set your own Task to `implementation`.
2. On the Friend's Message: /user_review, with the Friend's app; change requests go to the Friend as Messages. On approval, merge.
3. Step 5, the dev test, for the merge commit, where the Subtask's tier says. Then set the Subtask to `on-dev` and retire the Friend.
4. With a breakdown, spawn the next Friend.

After the last Friend's change passed the dev test (or is merged, where there is none), run /finish for your own Task, then /cleanup.

**As a Friend**: run /implementation and /review, keep the curl collection current (/curl), start the app as /user_review describes, and send your Parent one Message: the pull request URL, the app URL, the curl file, what to try, what /review left open and which database the app runs on. Then wait for your Parent's Messages: a change request goes through /implementation and a local /acceptance_test, pushed with /pull_request, and you answer your Parent's Message once it is pushed. You never talk to the user, and run neither /user_review, the dev test, /finish nor /cleanup; your Parent retires you after the merge.

## Starting later

An Agent starts where the Instructions in its Briefing say (e.g. a Friend starts at /implementation); without Instructions it starts at /refinement.
