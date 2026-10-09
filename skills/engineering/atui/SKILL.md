---
name: atui
description: How an atui Agent works with its Task - the conversation, Messages, the Specification, the status per step, Artifacts, Asana, the Stream, Friends and Handover. Used by the /develop steps and by every Agent that spawns a Friend.
---
# atui

The Task is the atui Task the Agent was spawned on (`task()` shows it, with its Branch, Properties, Artifacts and Subtasks); a Friend's Task is its Subtask. It goes through the tools of the `atui` MCP server, which default to the Agent's own Task. Without a Task (e.g. a session started by hand), skip everything here except Asana.

Checking in, reporting Phases and asking to be retired are described in the Briefing and not repeated here.

## Conversation

The conversation about the Task happens in the Agent's own session: present results and ask questions there, and wait there for the user. Never through the Orchestrator: it doesn't relay them. A Friend is the exception: it never talks to the user, only to its Parent (see Friends).

* **Messages** from other Agents or the Orchestrator arrive as `atui message from <sender>`. Answer them with `send(to="<sender>", text)`: the Orchestrator is `orchestrator`, an Agent `<project>/<number>`.
* Send a Message of your own only when your Task says to coordinate with or inform another Agent, or to your Parent when your work is done or something it depends on changes: what it needs to continue, not a report of your conversation with the user.
* **Delivered Threads** are answered with `reply`, never with `send` (see Stream).
* Don't answer a Message just to acknowledge it.

## TL;DR and Specification

Both live on the Task, never in the repo, set with `update_task(tldr=…, specification=…)`, or when creating the Task with `create_task(project, title, tldr, specification)`:

* **TL;DR**: 2-4 sentences for human readers, the `tldr` field of the Task; `task()` shows it above the Specification.
* **Specification**: the requirements, written for Agents, as markdown. Replace it as a whole; don't keep requirements anywhere else that might contradict it.

Nothing else: where to start, what the Parent needs and that the Task was handed over go into the spawner's Instructions (/orchestrator).

With a breakdown, each Subtask holds its own TL;DR and Specification, and the Parent Task keeps only its TL;DR.

Once the approved Specification is on the Task, it is not replaced with `update_task` any more: a change is proposed as a Suggestion (see Stream), unless the user asks in the session to change it.

## Status

Set the Task's status at the start of each step (`update_task(status=…)`):

| Step | Status |
|---|---|
| /refinement | `refinement` |
| /implementation, /review | `implementation` |
| /user_review | `review` |
| /finish | `on-dev`, or `done` where there is no dev system |

`done` is the user's call, except in repos without a dev system (the user's own, owner `hkokocin`): there the merge to main finishes the Task, and whoever merged it sets `done`. A handed-over Task is set to `cancelled` (see Handover).

A Friend sets its Subtask to `implementation`; its Parent sets the Subtask to `review` when it presents the Friend's pull request and, after the dev test, to `on-dev`, or to `done` where there is no dev system (`update_task(status=…, task="<project>/<number>")`). The Parent Task moves to `refinement`, to `implementation` when the first Friend starts, and to `on-dev` after the last Friend's change passed the dev test, or to `done` where there is no dev system.

## Artifacts

Attach every Artifact to the Task as soon as it exists: `attach(type, url, title)`, with the type `github` for a pull request, `figma` for a design, `google-doc` for a document, `asana` or `sentry` for a ticket or issue, otherwise `other`. A file in the worktree is attached with its path and `internal=True`. The link a Task was spawned from is already attached.

## Asana

Whether a Task needs an Asana task depends on the owner of its repo (`gh repo view --json owner -q .owner.login`):
* `PEAT-AI`: an Asana task must exist, unless the user explicitly dismisses it.
* `hkokocin`: no Asana task is ever created.
* any other owner: ask the user.

A Task spawned from an Asana link already has it attached. Otherwise /refinement creates it before the Specification is approved, asking the user for the Asana project when it isn't clear, and attaches it with type `asana`.

After approval, the Asana task's description holds the TL;DR and the Specification (`update_tasks`). Keep it in sync: an accepted Suggestion or a change the user asks for in the session is written to the Asana task as well.

## Stream

The Task's Stream is a second channel next to the session: the user reads it in the web UI, so it holds everything important about the Task without mirroring the session. Post on it with `post(body)`:
* **decisions** taken with the user, each as it is made: a short Post, or a Reply marked as a Decision (`reply(thread, body, decision=True)`) on the Thread it answers
* **important updates**: a blocker, a deviation from the Specification, the result of a review, a failed deployment or dev test
* **questions that can wait** for an answer in the web UI: `post(body, question=True)`. A question the work is blocked on is asked in the session.

**Delivered Threads**: what others post, reply, resolve or reopen on the Task arrives in the session as a Message `On <task> thread <id>, <who> posted a question: …` (or `posted:`, `replied:`, `replied with a decision:`, `resolved it:`, `reopened it:`). Answer on the Thread with `reply(thread, body)`, never with `send`, which would start a new Message instead of answering the Thread. A Reply that settles the Thread is a Decision.

**Suggestions**: a change to the approved Specification is proposed with `suggest(text, replacement, body)`: `text` the text to replace, exactly as it is in the Specification, `replacement` the new text (empty deletes it), `body` why. The user accepts or rejects it in the web UI; wait for the decision (`On <task> thread <id>, <who> accepted it: …` or `… rejected it: …`) and go on with the Specification as it is then. Never accept your own Suggestions.

## Friends

A Friend is an Agent spawned by another Agent, its Parent, on a Subtask of the Parent's Task (`create_task` and `spawn`, see Spawning an Agent in /orchestrator). The user never talks to a Friend; the Parent does.

**When**: `small` and `medium` Tasks are implemented in the Agent's own conversation. A `large` Task is always implemented by a Friend: one for the whole Task, or one per Subtask of a breakdown. Every Subtask is worked by a Friend. Work in another repo is always a Subtask (see Work in other Projects).

**The Parent** runs /refinement with the user, creates the Subtask(s) with the approved Specification and the `tier` property, and spawns the Friend on Opus with Instructions to start at /implementation and what it needs: `spawn("<project>/<number>", model="opus", instructions="The Specification is approved; start /develop at /implementation. Once /review is clean, send me (<parent project>/<number>) the one Message /develop describes, then wait for my Messages.")`. On the Friend's Message it sets the Subtask to `review` and presents the Message to the user in its own session (/user_review), relays the user's change requests to the Friend as Messages and posts them on the Subtask as decisions. On the user's approval it squash-merges (/squash_and_merge_pr), runs the dev test, sets the Subtask to `on-dev` (`done` where there is no dev system) and retires the Friend; the Orchestrator removes the Friend's resources with /cleanup, as for every retired Agent. With a breakdown, the next Friend is spawned only then. The steps are in /develop.

**The Friend** runs /implementation and /review, keeps the curl collection current, starts the app for the user review in its own tmux `app` window and sends its Parent one Message: the pull request URL, the app URL, the curl file, what to try, what /review left open and which database the app runs on (/develop). Then it waits for Messages from its Parent and answers them. It never talks to the user, and the user never talks to it.

**Retire** only your own Friends, with `retire(agent)`, and only when the user asked for it or agreed to it; in the Friends flow the user's approval of the pull request is that agreement.

## Handover

An Agent that finds its Task belongs to another Project creates a Subtask there (`create_task(<other project>, title, tldr, specification)`) with its Task and everything it learned, spawns a Friend on it on Opus (`model="opus"`) with Instructions saying that the Task was handed over and where to start, sets its own Task to `cancelled` (`update_task(status="cancelled")`) and calls `request_retire()` without waiting for the user. A Friend that got a Task handed over is not bound by the Friends flow: it works with the user from /refinement on like any Agent, since its Parent is gone. If your own Task was handed over to you, ask the user before handing it over again.

## Work in other Projects

If the Task needs work in another Project as well, create a Subtask there for that part, spawn a Friend on it on Opus and keep working on your own part. The Friend follows the Friends flow above: it sends you its one Message and you retire it after the merge. Never ask it for reports.
