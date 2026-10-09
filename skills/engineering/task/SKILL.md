---
name: task
description: How the dev process keeps its atui Task up to date - layout of the Specification, the status per step, Artifacts and the Stream. Used by the /develop steps.
---
# Task

The Task is the atui Task the Agent was spawned on (`task()` shows it, with its Branch, Artifacts and Subtasks); a Friend's Task is its Subtask. It goes through the tools of the `atui` MCP server, which default to the Agent's own Task. Without a Task (e.g. a session started by hand), skip everything here.

## Specification

The Specification is markdown on the Task (`update_task(specification=…)`). Replace it as a whole; don't keep requirements anywhere else that might contradict it. It lives only on the Task, never in the repo.

1. **TL;DR** first: 2-4 sentences for human readers.
2. **Specification** below it: the requirements, written for Agents.

Nothing else: where to start, what the Parent needs and that the Task was handed over go into the spawner's Instructions (/orchestrator).

With a breakdown, each Subtask holds its own TL;DR and specification, and the Parent Task keeps only the TL;DR.

Once the user approved the Specification, it is not written with `update_task` any more: a change is proposed as a Suggestion (see Stream), unless the user asks in the session to change it.

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

## Stream

The Task's Stream is a second channel next to the session: the user reads it in the web UI, so it holds everything important about the Task, not a mirror of the session. Post on it with `post(body)`:
* **decisions** taken with the user, each as it is made: a short Post, or a Reply with the decision flag on the Thread it answers (`reply(thread, body, decision=True)`)
* **important updates**: a blocker, a deviation from the Specification, the result of a review, a failed deployment or dev test
* **questions that can wait** for an answer in the web UI: `post(body, question=True)`. A question the work is blocked on is asked in the session.

With `text` a Post is anchored to that text of the Specification (`occurrence` picks one when it occurs more than once). `threads()` lists the Stream, `thread(id)` shows one Thread with its Replies.

**Delivered Threads**: what others post, reply, resolve or reopen on the Task arrives in the session as `On <task> thread <id>, user posted a question: …` (or `replied`, `resolved`, `reopened`). Answer on the Thread with `reply(thread=<id>, body)`, never with `send`: `send` is for Messages to other Agents only. Mark the Reply that settles the Thread with `decision=True`.

**Suggestions**: a change to the approved Specification is proposed with `suggest(text, replacement, body)`: `text` is the text to replace, exactly as it is in the Specification, `replacement` the new text (empty deletes it) and `body` why. The user accepts or rejects it in the web UI. Wait for the decision, which arrives as `On <task> thread <id>, user accepted it: …` or `… rejected it: …`; after an acceptance read the new Specification with `task()`. Never accept your own Suggestions.
