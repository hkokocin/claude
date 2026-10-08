---
name: develop
description: The dev process for a Task, from refinement to cleanup. The default entry point of every atui Agent; also usable in a session started by hand.
---
# Develop

Run the steps in order. Each step is a skill; follow it, then go on with the next one. As an atui Agent, report each step as a Phase (`phase(phase="<step>")`) when you enter it. Keep the Task up to date as /task describes.

1. **/refinement**: specification, approved by the user. It may break the Task down into Subtasks.
2. **/implementation**: TDD in Opus sub agents.
3. **/review**: automated review and testing until clean.
4. **/user_review**: the user tries it; merge on approval.
5. **dev test**: wait for the automatic deployment of the merge commit to dev (`gh run list --commit <sha>`, then `gh run watch`). Then run a /acceptance_test on dev. If the deployment or the test fails, tell the user and wait.
6. **/finish**: curl collection and Task status.
7. **/cleanup**: the Agent's local resources.

Then wait until the user tells you that you may go.

## Breakdown into Subtasks

When /refinement broke the Task down, you don't run steps 2-6 yourself. For each Subtask, one at a time:
1. Spawn a Friend on its Subtask, which /refinement created with the approved specification, and tell it in its Instructions where to start and what you need: `spawn("<project>/<number>", instructions="The Specification is approved; start /develop at /implementation. Send me (<parent project>/<number>) one message when your change passed the dev test: the commit and anything I should know.")`. Where there is no dev test, say "is merged" instead. With the first Friend, set your own Task to `implementation` (/task).
2. Wait for its message that its change passed the dev test (or is merged, where there is none), then spawn the Friend for the next Subtask.

After the last Friend's change passed the dev test (or is merged), run /finish for the Parent Task, then /cleanup.

## Starting later

An Agent starts where the Instructions in its Briefing say (e.g. a Friend's Subtask from a breakdown starts at /implementation); without Instructions it starts at /refinement. A Friend sends its Parent the message its Instructions ask for, then goes on with /finish.
