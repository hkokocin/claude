---
name: task
description: How the dev process keeps its atui Task up to date - layout of the Specification, the status per step and Artifacts. Used by the /develop steps.
---
# Task

The Task is the atui Task the Agent was spawned on (`task()` shows it, with its Branch, Artifacts and Subtasks); a Friend's Task is its Subtask. It goes through the tools of the `atui` MCP server, which default to the Agent's own Task. Without a Task (e.g. a session started by hand), skip everything here.

## Specification

The Specification is markdown on the Task (`update_task(specification=…)`). Replace it as a whole; don't keep requirements anywhere else that might contradict it. It lives only on the Task, never in the repo.

1. **TL;DR** first: 2-4 sentences for human readers.
2. **Specification** below it: the requirements, written for Agents.

Nothing else: where to start, what the Parent needs and that the Task was handed over go into the spawner's Instructions (/orchestrator).

With a breakdown, each Subtask holds its own TL;DR and specification, and the Parent Task keeps only the TL;DR.

## Status

Set the Task's status at the start of each step (`update_task(status=…)`):

| Step | Status |
|---|---|
| /refinement | `refinement` |
| /implementation, /review | `implementation` |
| /user_review | `review` |
| /finish | `on-dev` |

`done` is the user's call. A handed-over Task is set to `cancelled` (see Handover in /orchestrator).

With a breakdown, each Friend moves its own Subtask through all statuses; the Parent Task only moves to `refinement`, to `implementation` when the first Friend starts, and to `on-dev` after the last Friend merged.

## Artifacts

Attach every Artifact to the Task as soon as it exists: `attach(type, url, title)`, with the type `github` for a pull request, `figma` for a design, `google-doc` for a document, `asana` or `sentry` for a ticket or issue, otherwise `other`. A file in the worktree is attached with its path and `internal=True`. The link a Task was spawned from is already attached.

