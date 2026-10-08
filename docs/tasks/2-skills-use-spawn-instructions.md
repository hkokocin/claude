TL;DR: The dev-process skills in ~/.claude stop putting process instructions into a Task's Specification. "Where to start", "what the Parent needs from you" and "this Task was handed over" are passed as the spawner's instructions (`spawn(task, model=None, instructions=…)`, new in atui: the Briefing shows them under `Instructions from <spawner>:` and the audit log records them). The Specification is TL;DR plus requirements, nothing else.

## Context

- atui's Subtask "Spawn instructions" (atui Project) added the `instructions` parameter to `spawn`; it is merged and installed when this Task starts. Read `task("atui/<its number>")` for what it does, and docs/tasks/tasks-feature.md plus ARCHITECTURE.md in the atui repo for the model: a Task is the projection of a unit of work, the spawner knows where the work stands and says so in its instructions, the new Agent takes the Task at check-in and sets the status of the step it starts.
- The skills live in the claude repo (hkokocin/claude, synced into ~/.claude): task, develop, orchestrator, refinement; grep all skills for "Approved by", "approved", "start /develop" and "Specification also says".

## Requirements

1. **task skill**: the Specification is TL;DR first, then the requirements written for Agents. Remove the approval line and its rule. Everything else (status per step, Artifacts, filing) stays.
2. **develop skill**, Breakdown: the Parent spawns each Friend with instructions, e.g. `spawn("<project>/<number>", instructions="The Specification is approved; start /develop at /implementation. Send me (<parent project>/<number>) one message when your change is merged (or passed the dev test where there is one): the commit and anything I should know.")`. Starting later: an Agent starts where its instructions in the Briefing say; without instructions it starts at /refinement.
3. **orchestrator skill**, Spawning an Agent: `specification` is requirements only (goal, context and links, what done means); the entry step (`/develop`, or the skill the user named) and, for a Friend, what the Parent needs and a Handover note go into `instructions`. Update the tool list and the Handover paragraph accordingly. A Task that already exists is only spawned, with instructions.
4. **refinement skill** and any other skill that mentions the approval line or where to start: align them.
5. Keep wording consistent with the atui glossary (CONTEXT.md): Tasks not tickets, type not kind, Briefing, Friend, Parent, Handover.

## Out of scope

- Changes in atui itself.
- daily_sync and other skills that don't touch the dev process.

## Acceptance test

In a sandbox Project (agree it with the user in your session; geolearner was used before): run a breakdown-shaped flow on a throwaway Task: create a Subtask with a requirements-only Specification, spawn a Friend on it with instructions, verify in the Friend's session that it started at the step the instructions name and that `audit` of the Subtask shows the instructions; the Friend's Specification contains no approval line. Then cancel the throwaway Tasks and retire their Agents.

## Done

Pull request merged into main of hkokocin/claude (squash, with the user's consent), synced into ~/.claude, acceptance test passed.
