# Asana Refinement

This skill provides async requirements refinement triggered by `@claude refine` comments on Asana tasks.

## Directory Layout

- `design-async.md` — system prompt for worker sessions (the actual design logic)
- `repo-map.json` — maps Asana project names to local repo paths
- `refinements/<task_gid>.json` — per-task state files tracking active refinements
- `SKILL.md` — skill metadata (not user-invocable; workers are spawned by asana_watch)

## How It Works

The asana_watch orchestrator spawns worker sessions using `design-async.md` as the system prompt.
Workers communicate with users via Asana comments (prefixed `**[Claude]**`).
State files in `refinements/` map task GIDs to session IDs for answer routing.
