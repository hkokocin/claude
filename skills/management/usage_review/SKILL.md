---
name: usage_review
description: Evaluate the token usage of the current weekly window per Task, tier, model and step, and agree with the user on changes to the tier table, the models or the skills. Spawned by the Orchestrator when the weekly usage runs ahead of the week.
---
# Usage Review

## 1. Collect

Do the reading in sub agents, so the transcripts stay out of your context; give them the paths and the fields below and ask for the sums only.

* **Window**: the current weekly window, from its `resets_at` minus 7 days until now. `resets_at` of the `weekly_all` limit comes from the usage API, read as `~/.claude/usage_review_trigger.sh` does.
* **Transcripts**: `~/.claude/projects/<dir>/<session>.jsonl`, the sub agents' in `<session>/subagents/agent-*.jsonl` (`isSidechain: true`). Per assistant message of the window (`timestamp`): `message.model` and the tokens in `message.usage`: `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens`.
* **Task**: the directory is the session's working directory with every character other than a letter or digit replaced by `-`; for an Agent that is its worktree `~/.worktrees/<project>/<number>-<slug>`. Match it against the Branches of `tasks(open=False)` to get the Task `<project>/<number>`. Other directories (the Orchestrator, sessions started by hand) count as "no Task".
* **History**: `task()` of each Task for its `tier` property and Subtasks, `audit()` for when it entered which Phase. A message belongs to the step (Phase) the Task was in at its `timestamp`.

## 2. Report

Present to the user:
* tokens per Task and per tier
* per model
* per step (refinement, implementation, review, ...)
* main conversation versus sub agents
* the Tasks that cost the most, and why
* tier ratings that look wrong in hindsight (e.g. a `small` Task that took several review rounds)

Show input, cache and output tokens apart; cache reads are cheap, the others aren't.

## 3. Propose

Propose changes to the tier table (/develop), the models or the skills that would have saved the most, each with the numbers behind it. Discuss them with the user one at a time. Every change the user agrees to becomes a Task in the `claude` Project (`create_task("claude", title, tldr, specification)`), with a TL;DR and a self-contained Specification; you don't implement it yourself.
