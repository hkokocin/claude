---
paths:
  - "**/CLAUDE.md"
  - "**/AGENTS.md"
  - "**/SKILL.md"
  - "**/rules/**"
  - "**/agents/**"
  - "**/.claude/**"
---
# Writing agent instructions

Instructions cost context every time they load and are followed closely, also when stale. So each lives where it is needed and says only what the agent can't find out itself.

## Layers

| Layer | Loads | Holds |
|---|---|---|
| User AGENTS.md (`~/.claude`) | always | work philosophy with the why, interaction, stack-agnostic coding rules; at most ~100 lines |
| User `paths:` rules (`~/.claude/rules`) | when a matching file is read or edited | stack specifics (e.g. `*.py`), cross-repo knowledge (e.g. the Terraform layout), this file |
| Repo AGENTS.md | in that repo | only what the agent can't derive from the repo |
| Subdir AGENTS.md | when a file in that dir is touched | only where the dir has rules of its own |
| Skills | on demand | processes and tools; the entry skill (e.g. /develop) holds the step table (goal, start and end, status, approval), step skills only their instructions |
| Hooks and settings | never in context | rules that allow no exception |

- Nothing above the repo level: atui Agents run in `~/.worktrees/<project>/…`, so a file like `~/projects/AGENTS.md` never reaches them. Cross-repo knowledge goes into a user-level `paths:` rule.
- Every `CLAUDE.md` contains only `@AGENTS.md`; the content lives in `AGENTS.md`, which other agents read too.
- `@imports` are expanded at load, so they organise but don't save context.
- A rule file's only frontmatter field is `paths:`. If its YAML doesn't parse, the rule loads always.
- `paths:` rules are summarised away by a compaction and come back only when a matching file is touched again; a rule that must survive compaction has no `paths:`.

## Writing principles

1. Say the goal and the why; leave the how to the agent unless it is non-obvious or fragile.
2. No CLI or tool recipes. Name the action ("create a PR", "post it as a Decision"); how a tool works belongs in its own description.
3. Plain wording, without ALWAYS, NEVER, IMPORTANT or capitals: current models over-apply emphasised rules. A rule that really allows no exception becomes a hook or a setting.
4. Say what to do. Where a caution could spread, name what needs no approval.
5. Only what the agent can't derive from the code, the docs or its tools.
6. One home per rule: a skill links to another skill instead of repeating it.
7. A skill's description says when to use it, precisely enough that it triggers.
