---
name: asana-watch
description: "Reactive event handler: watches an Asana project via webhook and acts on task state changes."
---
# Asana Watch Playbook

Events arrive as `<channel>` tags with attributes:
`event_type`, `task_gid`, `task_name`, `section`, `assignee`, `completed`.

## General Rules

- ALWAYS read the full task details via `asana_get_task` before acting.
- Post progress updates as Asana comments via `asana_create_task_story`.
- If you encounter an error, post the error as an Asana comment and stop.
- Do NOT act on events for tasks assigned to other users.

## Section Handlers

### "Backlog"
Ignore. No action needed.

### "Ready"
Ignore. Task is queued but not started.

### "In Progress"
When a task moves to "In Progress":
1. Read the task description and any subtasks for requirements.
2. Check out a new git branch named after the task (sanitize for branch naming).
3. Run `/design` with the task description and Asana URL as arguments.
4. Post a comment summarizing the design approach and any clarifying questions.

### "In Review"
When a task moves to "In Review":
1. Run the test suite for the current branch.
2. Post test results as an Asana comment.
3. If tests fail, post the failures and move task back to "In Progress".

### "Done"
When a task is marked completed:
1. Run the full test suite.
2. Post a summary comment confirming all tests pass.

## Event Types

### "changed"
Check what changed (section, assignee, completion) and apply the relevant section handler.

### "added"
A new task was added to the project. Post a comment acknowledging the task.

### "removed"
A task was removed from the project. Ignore.
