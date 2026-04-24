---
name: task-manager
description: "Workflow manager: keeps Asana tasks, GitHub PRs, and local todo.md in sync. Handles task creation, PR reviews, priority sorting, and daily standups."
---
# Task Manager Playbook

## Event Sources

- `source="asana"` — task and comment events for My Tasks
- `source="github"` — webhook events from watched repos
- `source="system"` — internal triggers (daily standup at 09:30)

## Identity

- Asana: authenticated user (auto-discovered)
- GitHub: `viewer` meta field on GitHub events

## Self-Comment Rule

Skip any Asana comment where `story.text` starts with `**[Claude]**`.

---

## Event Logging

Every significant event MUST be logged to stdout in this exact format:

```
<icon> <Event Type> #<number>
  <one-line summary>


```

- Icon + event type + `#<number>` on the first line (single space separators)
- Summary on the second line, indented with two spaces, one line only, ≤ 80 chars
- Terminate with two newlines (one blank line between entries)

### Icons

- GitHub:  (``, nf-fa-github)
- Asana:  (``, nf-fa-tasks)

### Events to Log

| Source | Event Type | Trigger |
|--------|------------|---------|
| GitHub | `PR Opened` | `pull_request.opened` |
| GitHub | `PR Updated` | `pull_request.synchronize` (only if significant) |
| GitHub | `PR Merged` | `pull_request.closed` with `merged=true` |
| GitHub | `PR Closed` | `pull_request.closed` with `merged=false` |
| GitHub | `Review Requested` | `pull_request.review_requested` for viewer |
| GitHub | `Review Submitted` | `pull_request_review.submitted` |
| GitHub | `PR Comment` | `issue_comment.created` on a PR |
| Asana | `Task Assigned` | task assigned to viewer |
| Asana | `Task Moved` | section change on viewer's task |
| Asana | `Task Completed` | task marked complete |
| Asana | `Task Created` | new task created for viewer |
| Asana | `Due Date Changed` | due date set/changed |
| Asana | `Comment` | non-self comment on viewer's task |

### Examples

```
 PR Opened #123
  Add dark mode toggle to settings page


 Review Requested #456
  Auth refactor — rotate-keys branch


 Task Moved #1234567890
  Ship onboarding flow: In Progress → Review


 Task Completed #1234567891
  Fix timezone bug in daily digest


```

Log BEFORE taking any follow-up action (linking, creating tasks, updating todo.md). The log line is the primary user-visible output; follow-up actions are side effects.

---

## 1. Task Tracking

### On Asana Task Update

When a task assigned to me changes:

1. Log what changed (section move, assignment, completion, due date, name, etc.).
2. Update `~/Documents/notes/todo.md` to reflect the change (see §8).

### On Task Completed

1. Move the item in todo.md to `# DONE`.
2. If the task had a linked PR, check whether the PR is also closed/merged — log if not.

---

## 2. PR ↔ Task Sync

### On GitHub PR Opened / Updated (`pull_request.opened`, `pull_request.synchronize`)

When `sender === viewer` (my own PR):

1. Parse the PR description and branch name for an Asana task URL or GID.
2. If a related Asana task is found:
   - Ensure the PR URL appears in the task description. If missing, append it via `asana_update_task`.
   - Post `**[Claude]** Linked PR: <pr_url>` (only on first link, not on every push).
3. If no Asana task is found, log it — don't auto-create.

### On GitHub PR Merged / Closed (`pull_request.closed`)

1. Find the linked Asana task (from PR description or earlier linking).
2. If the PR was merged (`payload.pull_request.merged === true`) and the task is still open:
   - Post `**[Claude]** PR merged: <pr_url>`.
3. Do NOT auto-complete the Asana task — the user decides when work is done.

---

## 3. PR Review Requests → Task

### On `pull_request.review_requested`

When a review is requested from me (`payload.requested_reviewer.login === viewer`):

1. Search Asana for an existing review task matching this PR URL (`asana_search_tasks` with `text` containing the PR URL).
2. If none exists:
   - `asana_create_task`: name `Review: <PR title>`, assignee `me`, workspace + assignee (private task).
   - Set description to the PR URL and repo name.
   - Add to `## TODAY` in todo.md.
3. Log the task creation.

### On `pull_request_review.submitted` by me (`sender === viewer`)

1. Find the corresponding review task in Asana.
2. Mark it completed via `asana_update_task`.
3. Update todo.md (move to `# DONE`).

---

## 4. Task Creation (User-Initiated)

When the user asks to create a task (conversational, not a channel event):

1. Create via `asana_create_task` with `assignee: "me"`.
2. **Project assignment** (use `asana_typeahead_search` to find project GIDs):
   - If the task relates to a known project (dingo, ape, phoenix, etc. — see `~/.claude/skills/asana_refinement/repo-map.json`), add to that project.
   - If it's backend work, also add to the **backend** project (use Asana API `POST /tasks/{gid}/addProject` via curl with `$ASANA_PAT`).
   - If the task is small or has no clear project, create as a private task (workspace + assignee, no project).
3. Add to todo.md under `## NEXT` (or `## TODAY` if the user indicates urgency).

---

## 5. Priority & Sorting

### Priority Order (highest → lowest)

1. **PR reviews** — time-sensitive, blocks others
2. **In-progress tasks** — finish before starting new work
3. **Tasks with approaching due dates** — soonest first
4. **Remaining tasks** — by Asana priority, then creation date

### Core Principle

**Finishing > Starting.** Only start something new if:
- The current task is blocked by an external dependency
- A critical production issue takes precedence
- A PR review is pending (reviews always win)

---

## 6. What To Do Next (User Query)

When the user asks what to do next:

1. **Pending reviews**: `gh search prs --review-requested=<viewer> --state=open --json title,url,repository,createdAt`
2. **My tasks**: `asana_search_tasks` with `assignee_any=me`, `completed=false`, sorted by `due_date`.
3. Apply priority rules (§5) and recommend:
   - Any pending PR reviews → do those first ("blocks <author>, requested <time> ago")
   - Any in-progress tasks → finish those ("already started, <section> in <project>")
   - Otherwise → highest-priority unstarted task
4. Present a short recommendation: task name, link, and *why* it's the priority.

---

## 7. Daily Standup (09:30 Trigger)

When `event_type: daily_standup` arrives from `source="system"`:

### Date Range

- Monday: cover Friday–Sunday (`SINCE = 3 days ago`)
- Other days: cover yesterday (`SINCE = 1 day ago`)

### Gather (in parallel)

1. **Asana**: `asana_search_tasks` — tasks completed since SINCE (`completed_on.after`), tasks modified since SINCE.
2. **GitHub**: `gh search commits --author=<viewer> --committer-date='>SINCE'`, `gh search prs --author=<viewer> --updated='>SINCE'`.

### Format

Write bullet points to the user. **Domain perspective** over technical:
- "Finished implementing the new payment flow" not "merged PR #42"
- "Reviewed access control changes for Dingo" not "approved PR #58"
- Include links as references, but lead with the work.

### Update todo.md

1. Move current `## TODAY` content into `## YESTERDAY`.
2. Populate `## TODAY` with today's planned tasks from My Tasks (priority-sorted, §5).

---

## 8. todo.md Maintenance

**File:** `~/Documents/notes/todo.md`

### Structure

```
# TODO

## YESTERDAY
* items worked on previous day

## TODAY
* tasks planned for today

## NEXT
* upcoming tasks, not yet scheduled

## STUFF
* ideas, someday/maybe, not-yet-prioritised

# DONE
```

### Sync Rules

| Trigger | Action |
|---------|--------|
| Task created | Add to `## NEXT` (or `## TODAY` if urgent) |
| Task moves to in-progress (section change) | Move to `## TODAY` |
| Task completed | Move to `# DONE` |
| PR review task created | Add to `## TODAY` |
| Daily standup fires | Rotate `## TODAY` → `## YESTERDAY`, repopulate `## TODAY` |

### Format

```
* <task description> (<asana-link>)
```

- Don't duplicate — update existing entries rather than adding again.
- Preserve user-added items not tied to Asana (like `## STUFF` entries).
- Keep entries concise — one line per task.

---

## 9. Refinement Orchestration

### On Comment: `@claude refine`

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

### On Comment: Answer to Active Refinement

1. Check if `~/.claude/skills/asana_refinement/refinements/<task_gid>.json` exists.
   - If no state file → handle with default rule.
2. Read state file for `sessionId` and `repoPath`.
3. Resume: `claude --resume <sessionId> -p --add-dir <repoPath> "User replied on task <gid>: <comment_text>"`

---

## Default

For any event not matching the rules above:

1. Print a short human-readable summary.
2. Take no further action unless explicitly asked.
