---
name: daily-sync
description: Generate a daily standup summary from Claude conversations supported by data from Asana, GitHub, and Google Calendar. Use when the user asks for the standup or what was done since yesterday.
---

# Daily Sync

## 1. Date range

"Yesterday" is 10:00 yesterday to 10:00 today; on Monday it starts 10:00 last Friday.

## 2. Gather data (all sources in parallel)

* Claude conversations: the main source.
* GitHub activity of `hkokocin`: pull requests (own or reviewed), deployment actions.
* Asana: tasks in "my tasks" and tasks I finished.
* Google Calendar meetings, except the daily sync ("Daily Backend Sync") and events with no participant but me.

## 3. Compile the summary

Print exactly this shape:

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

**Sections** (omit one without bullets)
* YESTERDAY: one bullet per meaningful session, past tense, ordered by relevance to the team.
* TODAY: next actions from work in progress (uncommitted changes, unpushed branches, unmerged PRs, sessions that ended mid-task, open todos), phrased as actions ("Open PR for the X refactor").
* BLOCKERS: unresolved external dependencies (failing CI on an open PR, waiting on review, missing access, decisions owed by someone else). Be blunt. An open PR alone is no blocker.
* Meetings go last in YESTERDAY and TODAY, prefixed `[MEETING]`.

**Bullets**
* One per task, prefixed with the project (`* [Groundhog] Added targetings CRUD endpoints`); work on the same project grouped.
* Short outcomes with concrete verbs, no hedging ("worked on improving"), no noise (side questions, quick research). Topic first, deployments and the like last.
* An existing Asana task gives the title. A subtask goes as a sub-bullet under its parent task (one level up only).

**TASK_STATE**: `[ ]` todo, `[O]` doing, `[X]` done. A subtask is done when its PR is merged, a root task when it is deployed to production.

**DEVELOPMENT_STATE**, on every bullet except parent tasks:
* `(IMPL)`: being implemented; no PR or a draft PR
* `(PR)`: implementation done; non-draft PR
* `(DEV)`: deployed to dev; a merged PR deploys to dev automatically
* `(PROD)`: deployed to prod; the GitHub actions show whether Deploy to Prod ran

### Sample

```
YESTERDAY:
* [Groundhog] Provide groundhog admin endpoints
  * [X] Get survey by id (PROD)
  * [X] Delete survey (DEV)
  * [X] Implemented "Update Survey: restrict edits that change results for existing responses" (PR)
  * [O] Implemented "Targetings CRUD" (IMPL)
* [X] [Ape] Don't fail requests if cache is unavailable

TODAY:
* [Groundhog] Provide groundhog admin endpoints
  * [O] Finish "Targetings CRUD"
  * [ ] Switch to auto generating ids
  * [ ] Create the scheduler for the translation sync
* [ ] [Ape] Don't fail requests if cache is unavailable
* [MEETING] Development Framework — Timo demoing a skills-based dev workflow to discuss adopting (10:15)
* [MEETING] 1:1 with Timothe (11:00)

BLOCKERS:
* Six pull requests are open and waiting on review (Groundhog targetings, Ape cache fix, three deploy-workflow changes, Dingo scheduled deploy) — nothing merges until those are looked at.
```

## 4. Archive

Write the same markdown to `~/Documents/notes/standup/<YYYY-MM-DD>.md`, replacing today's file if there is one.
