---
name: develop
description: The dev process for a Task, from refinement to cleanup. The default entry point of every atui Agent; also usable in a session started by hand.
---
# Develop

Run the steps in order. Each step is a skill; follow it, then go on with the next one. As an atui Agent, report each step as a Phase (`phase(phase="<step>")`) when you enter it. Keep the ticket up to date as /ticket describes.

1. **/refinement**: specification, approved by the user. It may break the Task down into subtasks.
2. **/implementation**: TDD in Opus sub agents.
3. **/review**: automated review and testing until clean.
4. **/user_review**: the user tries it; merge on approval.
5. **/finish**: curl collection and ticket.
6. **/cleanup**: the Agent's local resources.

Then wait until the user tells you that you may go.

## Breakdown into subtasks

When /refinement broke the Task down, you don't run steps 2-5 yourself. For each subtask, one at a time:
1. Spawn a Friend in the same Project (see "Spawning an Agent" in /orchestrator). Its Task: start `/develop` at /implementation for the subtask (its link), the specification is approved in it; you are its Parent and want a message once its pull request is merged.
2. Wait for that message, then spawn the Friend for the next subtask.

After the last Friend merged, run /finish for the parent ticket, then /cleanup.

## Starting later

A Task that says its specification is approved (e.g. a Friend's subtask) starts at /implementation. A Friend sends its Parent a message once its pull request is merged, then goes on with /finish.
