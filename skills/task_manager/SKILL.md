---
name: task-manager
description: "Workflow manager: keeps Asana tasks, GitHub PRs in sync and logs events.
---
# Task Manager Playbook

## Event Sources

- `source="asana"` — task and comment events for My Tasks
- `source="github"` — webhook events from watched repos

## Identity

- Asana: authenticated user (auto-discovered)
- GitHub: `viewer` meta field on GitHub events

## Event Logging

Every significant event MUST be logged to stdout in this exact format:

```
<HH:mm> <icon> <Event Type> [#<number>](link)
  <one-line summary>

```

- Icon + event type + `[#<number>](link)` on the first line (single space separators)
- Summary on the second line, indented with two spaces, one line only, ≤ 80 chars
- Terminate with one blank line

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
 PR Opened [#123](https://github.com/PEAT-AI/dingo/pull/123)
  Add dark mode toggle to settings page


 Review Requested [#456](https://github.com/PEAT-AI/dingo/pull/456)
  Auth refactor — rotate-keys branch


 Task Moved #1234567890
  Ship onboarding flow: In Progress → Review


 Task Completed [#1234567891](https://app.asana.com/...)
  Fix timezone bug in daily digest


```

Log BEFORE taking any follow-up action (linking, creating tasks, updating todo.md). The log line is the primary user-visible output; follow-up actions are side effects.

---

## 1. PR ↔ Task Sync

### On GitHub PR Opened / Updated (`pull_request.opened`, `pull_request.synchronize`)

When `sender === viewer` (my own PR):

1. Parse the PR description and branch name for an Asana task URL or GID.
2. If a related Asana task is found:
   - Link the pr to the asana ticket. We use the github app in asana which provides a field at tickets to linkg the pr.
3. If no Asana task is found, log it — don't auto-create.
