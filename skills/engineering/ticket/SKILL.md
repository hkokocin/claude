---
name: ticket
description: How the dev process keeps its Asana ticket up to date - layout of the description, the My Tasks column per step, links to artifacts. Used by the /develop steps.
---
# Ticket

The Task's ticket is the Asana task it was spawned for. With a breakdown, a Friend's ticket is its subtask. Without a ticket (e.g. a plain request), skip everything here.

## Description

Write the description, don't add comments that might contradict it.

1. **TL;DR** first: 2-4 sentences for human readers.
2. **Specification** below it: the approved requirements, written for Agents.

With a breakdown, the parent ticket holds only the TL;DR and each subtask holds its own TL;DR and specification.

## Column

Keep the ticket in the user's My Tasks column of its step:

| Step | Column |
|---|---|
| /refinement | Refinement 💬 |
| /implementation, /review | Implementation 🚀 |
| /user_review | Review 👀 |
| merged | On Dev 📦 |

Move it by setting `assignee_section` (`update_tasks`) to the column's section GID. Find the GIDs by name: read `assignee_section.project.gid` of any task from `get_my_tasks`, then `get_project(<that gid>, include_sections=true)`. A subtask is assigned to the user (`assignee: "me"`) so it shows up in My Tasks.

With a breakdown, each Friend moves its own subtask through all columns; the parent ticket only moves to Refinement 💬, to Implementation 🚀 when the first Friend starts, and to On Dev 📦 after the last Friend merged.

## Links

Attach every artifact to the ticket as soon as it exists: design, specification documents, the pull request. The pull request links back to the ticket (see /pull_request).
