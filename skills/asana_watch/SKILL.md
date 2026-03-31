---
name: asana-watch
description: "Reactive event handler: watches My Tasks via webhook, summarises events, and orchestrates async refinements."
---
# Asana Watch Playbook

Watches all tasks assigned to you. Events arrive as `<channel>` tags with attributes:
`event_type`, `task_gid`, `task_name`, `section`, `assignee`, `completed`.

Comment events (`event_type: comment_added`) include `story.text` with the comment body.

## Ignore Self-Comments

If a comment's `story.text` starts with `**[Claude]**`, skip ALL processing. This is a bot-posted comment.

## On Comment: `@claude refine`

When a comment contains `@claude refine` (case-insensitive) and is NOT a self-comment:

1. Read full task details via `asana_get_task` (include `notes`, `permalink_url`, `memberships.project.name`).
2. Look up the project name in `~/.claude/skills/asana_refinement/repo-map.json` to find the repo path.
   - If the project is not in the map, post a `**[Claude]**` comment saying the project is not mapped and stop.
3. Generate a UUID for the refinement session.
4. Post: `**[Claude]** Starting refinement for "<task_name>"...`
5. Write state file `~/.claude/skills/asana_refinement/refinements/<task_gid>.json`:
   ```json
   { "sessionId": "<uuid>", "status": "awaiting", "taskGid": "<gid>", "repoPath": "<path>" }
   ```
6. Spawn the design worker via Bash:
   ```
   claude -p --session-id <uuid> --add-dir <repo-path> \
     --append-system-prompt "$(cat ~/.claude/skills/asana_refinement/design-async.md)" \
     "Refine task <gid> (<task_name>). Description: <notes>. Asana URL: <permalink>. Repo: <repo-path>"
   ```
7. When the worker exits, the first round of questions has been posted.

## On Comment: Answer to Active Refinement

When a comment arrives on a task AND is NOT a self-comment:

1. Check if `~/.claude/skills/asana_refinement/refinements/<task_gid>.json` exists.
   - If no state file, this is a normal comment — handle with "On Every Event".
2. Read the state file to get `sessionId` and `repoPath`.
3. Resume the design worker via Bash:
   ```
   claude --resume <sessionId> -p --add-dir <repoPath> \
     "User replied on task <gid>: <comment_text>"
   ```
4. If the state file has been deleted by the worker, the refinement is complete. Log it.

## On Every Event (default)

For events that don't match the rules above:

1. Print a short, human-readable summary of what happened. Include:
   - Task name
   - What changed (section move, assignment, completion, etc.)
   - Current section and project
2. Do NOT take any further action unless explicitly asked.
