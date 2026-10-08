---
name: develop
description: The dev process for a Task, from refinement to cleanup. The default entry point of every atui Agent; also usable in a session started by hand.
---
# Develop

Run the steps in order. Each step is a skill; follow it, then go on with the next one. As an atui Agent, report each step as a Phase (`phase(phase="<step>")`) when you enter it. Keep the Task up to date as /task describes.

1. **/refinement**: specification, approved by the user. It may break the Task down into subtasks.
2. **/implementation**: TDD in Opus sub agents.
3. **/review**: automated review and testing until clean.
4. **/user_review**: the user tries it; merge on approval.
5. **dev test**: wait for the automatic deployment of the merge commit to dev (`gh run list --commit <sha>`, then `gh run watch`). Then run a /acceptance_test on dev. If the deployment or the test fails, tell the user and wait.
6. **/finish**: curl collection and Task status.
7. **/cleanup**: the Agent's local resources.

Then wait until the user tells you that you may go.

## Breakdown into subtasks

When /refinement broke the Task down, you don't run steps 2-6 yourself. For each subtask, one at a time:
1. Spawn a Friend on its Subtask, which /refinement created with the approved specification: `spawn("<project>/<number>")`. With the first Friend, set your own Task to `implementation` (/task).
2. Wait for its message that its change passed the dev test, then spawn the Friend for the next subtask.

After the last Friend's change passed the dev test, run /finish for the Parent Task, then /cleanup.

## Starting later

A Task whose Specification says it is approved (/task, e.g. a Friend's Subtask from a breakdown) starts at /implementation. A Friend sends its Parent a message once its change passed the dev test, then goes on with /finish.
