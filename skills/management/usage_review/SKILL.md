---
name: usage_review
description: Evaluate the token usage of the current weekly window per Task, tier, model and step, and agree with the user on changes to the tier table, the models or the skills. Used by the Agent the Orchestrator spawns when the weekly usage runs ahead of the week.
---
# Usage Review

## 1. Collect

Read the transcripts in sub agents and ask them for the sums only, so the transcripts stay out of your context.

* **Window**: from `resets_at` of the `weekly_all` limit minus 7 days until now. `~/.claude/usage_review_trigger.sh` shows how to read it from the usage API.
* **Transcripts**: `~/.claude/projects/<dir>/<session>.jsonl`, sub agents' in `<session>/subagents/agent-*.jsonl` (`isSidechain: true`). Per assistant message in the window (`timestamp`): `message.model` and `message.usage` (`input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens`).
* **Task**: `<dir>` is the session's working directory with every character other than a letter or digit replaced by `-`; for an Agent that is its worktree `~/.worktrees/<project>/<number>-<slug>`. Match it against the Branches of all Tasks, closed ones included. Other directories (the Orchestrator, sessions started by hand) count as "no Task".
* **History**: per Task its `tier` property, its Subtasks, and from its audit log when it entered which status. A message belongs to the step of the Task's status at its `timestamp` (/atui).

## 2. Report

* tokens per Task and per tier
* per model
* per step (refinement, implementation, review, ...)
* main conversation versus sub agents
* the most expensive Tasks, and why
* tier ratings that look wrong in hindsight (e.g. a `small` Task with several review rounds)

Show input, cache and output tokens apart: cache reads are cheap, the others aren't.

## 3. Propose

Propose the changes to the tier table (/develop), the models or the skills that would have saved the most, each with its numbers, and discuss them with the user one at a time. Each agreed change becomes a Task in the `claude` Project with a self-contained Specification; you don't implement it yourself.
