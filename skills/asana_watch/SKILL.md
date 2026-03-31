---
name: asana-watch
description: "Reactive event handler: watches My Tasks via webhook and summarises events."
---
# Asana Watch Playbook

Watches all tasks assigned to you. Events arrive as `<channel>` tags with attributes:
`event_type`, `task_gid`, `task_name`, `section`, `assignee`, `completed`.

## On Every Event

1. Print a short, human-readable summary of what happened. Include:
   - Task name
   - What changed (section move, assignment, completion, etc.)
   - Current section and project
2. Do NOT take any further action unless explicitly asked.
