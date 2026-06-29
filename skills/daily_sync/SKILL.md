---
name: daily-sync
description: Generate a daily standup summary from Claude conversations supported by data from Asana, GitHub, and Google Calendar.
---

# Daily Sync

## Step 1: Date range

"Yesterday" = 10:00 yesterday to 10:00 today. On Monday, start 10:00 last Friday.

## Step 2: Gather data (query all sources in parallel)

* Claude conversations — the main source.
* GitHub activity of "hkokocin": pull requests (own or reviewed), deployment actions.
* Asana: tasks in the "my tasks" board and tasks finished by me.
* Google Calendar meetings — exclude the daily sync and any event with no participants but me.

## Step 3: Compile the summary

Print exactly this shape to chat:

```
YESTERDAY:
* [TASK_STATE] [PROJECT] <title> (DEVELOPMENT_STATE)
* [PROJECT] <title>
  * [X] Get survey by id (PROD)
* [MEETING] <title>

TODAY:
* <[TASK_STATE] title> (DEVELOPMENT_STATE)

BLOCKERS:
* [TASK_STATE] <title> (DEVELOPMENT_STATE)
```

**Sections**
* YESTERDAY: one bullet per meaningful session, past tense, ordered by team relevance (your judgment).
* TODAY: synthesize next actions from WIP signals — uncommitted changes, unpushed branches, open PRs without merges, sessions that ended mid-task, open todos. Phrase action-oriented ("Open PR for the X refactor").
* BLOCKERS: unresolved external dependencies — failing CI on an open PR, waiting on review, missing access, decisions owed by someone else. Be blunt. Open PRs alone are not blockers. Omit if none.
* Omit any section with no bullets.

**Meetings**
* Append meetings at the end of YESTERDAY and TODAY with the `[MEETING]` prefix.
* Exclude the "Daily Backend Sync".

**Bullets**
* One bullet per task, prefixed with `[repo]` (e.g. `* [Groundhog] Added targetings CRUD endpoints`). Group work on the same project together.
* Keep them short and scannable. Describe outcomes with concrete verbs — no transcripts, no hedging ("worked on improving"). Strip noise (side questions, quick research).
* Topic first; deployments and similar go last.
* If an Asana task exists, use its title. For a subtask, make the parent task the root bullet and the task a sub-bullet (only go up one level).

**TASK_STATE checkbox**
* `[ ]` Todo · `[O]` Doing · `[X]` Done

**DEVELOPMENT_STATE** — append to each bullet except parent tasks:
* `(IMPL)` being implemented; no PR or draft PR
* `(PR)` implementation done; non-draft PR exists
* `(DEV)` deployed to dev
* `(PROD)` deployed to prod

### Sample

```
YESTERDAY:
* [Groundhog] Provide groundhog admin endpoints
  * [X] Get survey by id (PROD)
  * [X] Delete survey (DEV)
  * [X] Implemented "Update Survey: restrict edits that change results for existing responses" (PR)
  * [O] Implemented "Targetings CRUD" (IMPL)
* [Ape] Don't fail requests if cache is unavailable

TODAY:
* [Groundhog] Provide groundhog admin endpoints
  * [O] Finish "Targetings CRUD"
  * [ ] Switch to auto generating ids
  * [ ] Create the scheduler for the translation sync
* [Ape] Don't fail requests if cache is unavailable
* [Deploys] Land the three scheduled-deploy workflow changes and the Dingo consumer.
* [MEETING] Development Framework — Timo demoing a skills-based dev workflow to discuss adopting (10:15)
* [MEETING] 1:1 with Timothe (11:00)

BLOCKERS:
* Six pull requests are open and waiting on review (Groundhog targetings, Ape cache fix, three deploy-workflow changes, Dingo scheduled deploy) — nothing merges until those are looked at.
```

## Step 4: Archive

Write the same markdown to `~/Documents/notes/standup/<YYYY-MM-DD>.md` (create the directory if missing, overwrite today's file).
