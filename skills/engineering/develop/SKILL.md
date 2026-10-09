---
name: develop
description: The dev process for a Task, from refinement to cleanup. The default entry point of every atui Agent; also usable in a session started by hand.
---
# Develop

Run the steps in order. Each step is a skill; follow it, then go on with the next one. As an atui Agent, report each step as a Phase (`phase(phase="<step>")`) when you enter it. Keep the Task and its Stream up to date as /task describes: whatever matters beyond the session is posted on the Task as well as told in the session.

1. **/refinement**: specification and tier, approved by the user. It may break the Task down into Subtasks.
2. **/implementation**: TDD, where the tier says.
3. **/review**: automated review and testing until clean.
4. **/user_review**: the user tries it; merge on approval.
5. **dev test**: wait for the automatic deployment of the merge commit to dev (`gh run list --commit <sha>`, then `gh run watch`). Then run a /acceptance_test on dev, where the tier says. If the deployment or the test fails, tell the user, post it on the Task and wait.
6. **/finish**: curl collection and Task status. A Friend then sends its Parent the Message its Instructions ask for; never before /finish, because the Parent may retire it as soon as the Message arrives.
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

Pass the model per launch with the Agent tool's `model` parameter (`sonnet`, `opus`). Without a `tier` property (e.g. a session started by hand), use `large`.

## Breakdown into Subtasks

When /refinement broke the Task down, you don't run steps 2-6 yourself. For each Subtask, one at a time:
1. Spawn a Friend on its Subtask, which /refinement created with the approved specification, and tell it in its Instructions where to start and what you need: `spawn("<project>/<number>", instructions="The Specification is approved; start /develop at /implementation. Once your change passed the dev test and you ran /finish, send me (<parent project>/<number>) one Message: the commit and anything I should know.")`. Where there is no dev test, say "is merged" instead. With the first Friend, set your own Task to `implementation` (/task).
2. Wait for its Message that its change passed the dev test (or is merged, where there is none), then spawn the Friend for the next Subtask.

After the last Friend's change passed the dev test (or is merged), run /finish for the Parent Task, then /cleanup.

## Starting later

An Agent starts where the Instructions in its Briefing say (e.g. a Friend's Subtask from a breakdown starts at /implementation); without Instructions it starts at /refinement.
