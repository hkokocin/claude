---
name: document
description: Document project decisions and changes.
disable-model-invocation: true
---
# Documentation

Summarize project decisions made during the current task.

## Task
1. Review the changes made on current branch
2. Create `./docs/YYYY_MM_DD_task_title.md` with this structure:

```
# [Task Title]

[1-2 sentences overview]

## Requirements
- Requirement 1
- Requirement 2

## Behavioural (Domain) Decisions
- Decision 1: Rationale
- Decision 2: Rationale

## Implementation Decisions
- Technical choice 1: Why
- Technical choice 2: Why
```

3. Read existing documentation in `./docs/`
4. Update any sections that are affected by the changes
