# Structuring and writing instructions for AI coding agents: state of practice, 2025–2026

Research date: 2026-11-20. All sources were fetched on that date by five research agents unless marked otherwise.

Labels used throughout:

- **[DOC]** documented fact from official vendor documentation
- **[VENDOR]** vendor guidance or a vendor's own measurement (not independently confirmed)
- **[MEASURED]** measured evidence from a paper or a reproducible experiment
- **[OPINION]** practitioner opinion
- **[UNVERIFIED]** not confirmed at the primary source

Claude Code docs pages carry no publication date; they are "live page, fetched 2026-11-20". Several facts are tied to Claude Code versions up to about v2.1.323.

---

## Key takeaways

1. **Claude Code has three loading classes, and they cost differently.** Always loaded: CLAUDE.md from the working directory upward, user and managed CLAUDE.md, unscoped rules, the first 200 lines / 25KB of auto-memory `MEMORY.md`, output style, skill and subagent descriptions, MCP tool names and server instructions. Loaded lazily: subdirectory CLAUDE.md and `paths`-scoped rules (when Claude reads, writes or edits a matching file). Loaded on demand: skill bodies, skill supporting files, MCP tool schemas. [DOC]
2. **`@imports` organise but do not save context.** They are expanded eagerly, up to four hops deep. [DOC]
3. **CLAUDE.md is advisory.** It is delivered as a user message after the system prompt, "there's no guarantee of strict compliance", and contradicting instructions are resolved arbitrarily. Anything with zero exceptions belongs in a hook, a deny rule or a managed setting. [DOC]
4. **Path-scoped rules and nested CLAUDE.md do not survive compaction** except by being re-triggered; project-root CLAUDE.md, unscoped rules and auto memory are re-injected. Invoked skills are re-attached with a 5,000-token cap each and 25,000 combined. [DOC]
5. **Plugins cannot ship CLAUDE.md or rules.** Instructions in a plugin must be written as skills. Plugins can package skills, agents, hooks, MCP and LSP servers, output styles, workflows, monitors, `bin/` executables and evals. [DOC]
6. **Anthropic's size targets:** under 200 lines per CLAUDE.md, under 500 lines per SKILL.md, about 100 tokens of metadata per skill, references one level deep. Skill descriptions are truncated at 1,536 characters and the whole listing gets 1% of the context window. [DOC]
7. **The industry has converged on two cross-tool units:** AGENTS.md as the always-on file (Linux Foundation stewardship, 60k+ repos) and SKILL.md as the on-demand unit. Claude Code reads AGENTS.md natively since v2.1.277 when no CLAUDE.md exists. Slash commands and prompt files are being folded into skills in Claude Code, Codex, Cursor and VS Code. [DOC]
8. **There is no shared standard for glob-scoped rules.** The key is `paths` (Claude Code, Cline), `globs` (Cursor), `applyTo` (Copilot) or `fileMatchPattern` (Kiro). [DOC]
9. **Write only what the agent cannot derive from the repo.** Repository overviews and architecture descriptions are the most common content of real files and the content measured to be unhelpful. [MEASURED + VENDOR]
10. **Context files are not a free win.** The ETH Zurich study found no general improvement in task success and 20%+ higher inference cost; LLM-generated files were slightly negative, developer-written ones slightly positive (not significant). [MEASURED]
11. **Agents follow these files closely, which is why stale content hurts.** In a synthetic test, agents followed a stale instruction file over the code in 90% of choices; 23% of sampled repos had stale references in their context files. [MEASURED, preprints]
12. **Emphasis should be dialled back for current models.** Anthropic says CAPS, "CRITICAL", "MUST" cause over-triggering and over-application; an instruction containing "never" is treated as absolute. No controlled independent study exists on this; it is vendor guidance, and Anthropic's own examples are not fully consistent. [VENDOR]
13. **State scope and reason, phrase positively.** Current Claude models follow literally and do not silently generalise. "Ask for approval before deleting files" works better than "never delete files". [VENDOR]
14. **Goals, constraints and gotchas over step-by-step scripts, except on fragile paths.** Anthropic says skills written for older models are "often too prescriptive" for the newest ones and can degrade output. [VENDOR]
15. **Cautions accumulate and keep being obeyed.** Prune rules whose reason no longer holds; over-broad approval lists made a current model withhold about half of routine requests in Anthropic's test. [VENDOR, measured in-house]
16. **Skills often fail to trigger on their own.** Vercel measured 56% non-invocation; an always-present 8KB index in AGENTS.md scored 100% vs 53–79% for skills. Small or undisclosed samples. [MEASURED, vendor/practitioner]
17. **Curated skills help, self-generated ones do not.** SkillsBench: +16 pp on average for curated skills, smallest gain in software engineering (+4.5 pp), no benefit from self-generated skills, 2–3 focused modules beat exhaustive bundles. [MEASURED, preprint]
18. **Instruction-following degrades with instruction count and context length**, with earlier instructions favoured. The often-quoted "150–200 instructions" budget comes from a keyword-inclusion benchmark on 2025 models, not from coding rules. [MEASURED, with a weak transfer]
19. **Testing exists for skills and plugins, not for plain CLAUDE.md.** `claude plugin eval` (v2.1.269+) runs cases with and without the plugin but loads no user or project CLAUDE.md. `/doctor prompt-audit` is the built-in check for plain instruction files. [DOC]
20. **Process that must be deterministic belongs in code.** Hooks for single rules, Claude Code Dynamic Workflows (a script decides what runs next) for step order, files and git for state. Harness assumptions go stale as models improve. [DOC + VENDOR]
21. **Output formatting:** lead with the outcome, write for a low-context reader, prefer clear over compressed, match prompt style to desired output style. Output styles do not apply to non-fork subagents. [VENDOR + DOC]

---

## 1. Structure: mechanisms and loading semantics

### 1.1 Claude Code

Sources: [memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [sub-agents](https://code.claude.com/docs/en/sub-agents), [features overview](https://code.claude.com/docs/en/features-overview), [context window](https://code.claude.com/docs/en/context-window), [hooks](https://code.claude.com/docs/en/hooks), [mcp](https://code.claude.com/docs/en/mcp), [costs](https://code.claude.com/docs/en/costs), [output styles](https://code.claude.com/docs/en/output-styles), [plugins overview](https://code.claude.com/docs/en/plugins/overview). All [DOC].

#### CLAUDE.md

| Scope | Location | When it loads |
|---|---|---|
| Managed | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS), `/etc/claude-code/CLAUDE.md` (Linux), or the `claudeMd` managed-settings key | Launch |
| User | `~/.claude/CLAUDE.md` | Launch |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md`, plus every parent directory | Launch |
| Local | `./CLAUDE.local.md` (current, not deprecated) | Launch |
| Subdirectory | `<subdir>/CLAUDE.md` | Lazily |

- **Order.** "All discovered files are concatenated into context rather than overriding each other", ordered from the filesystem root down to the working directory. Within a directory, `CLAUDE.local.md` comes after `CLAUDE.md`.
- **Lazy loading of subdirectory files.** "Claude Code loads each one once Claude reads, writes, or edits another file in that subdirectory." A `cat` or `head` on a single file counts as a read.
- **Caps.** Launch-loaded files load whole up to 4 MiB. Lazily loaded files are cut at 40,000 characters on a 200K window (more on 1M windows), with a note to read the rest.
- **Size target.** "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." Claude Code warns at startup for over-length files and when the combined size passes a limit that the docs do not quantify.
- **Imports.** `@path/to/file`, relative to the importing file, "maximum depth of four hops". "Imported files are expanded and loaded into context alongside the CLAUDE.md that references them" and "don't reduce its context cost." Imports inside code spans and fences are skipped.
- **HTML comments** at block level are stripped before injection, so they are free maintainer notes.
- **AGENTS.md.** Read natively since v2.1.277. Default mode `claude-md-or-agents-md`: AGENTS.md is read only if no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the working directory or above. Other modes: `claude-md-and-agents-md`, `claude-md`, `managed-only`. The documented single-source pattern is `@AGENTS.md` inside CLAUDE.md; "Keeping the import never makes Claude read `AGENTS.md` twice." `AGENTS.override.md` and `.agents/` are not read.
- **Delivery and adherence.** "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance." `--append-system-prompt` is the route to system-prompt level.
- **Exclusion.** `claudeMdExcludes` takes glob patterns on absolute paths; it cannot exclude the managed file.
- **Compaction.** "Project-root CLAUDE.md survives compaction: after `/compact`, Claude re-reads it from disk and re-injects it." Nested files reload on demand. The docs do not say explicitly whether user, managed and parent-directory files are re-injected too. **Ambiguous.**

#### `.claude/rules/*.md`

- Discovered recursively. "Rules without `paths` frontmatter are loaded at launch with the same priority as `.claude/CLAUDE.md`."
- "A path-scoped rule loads when Claude uses the Read, Write, or Edit tool on a matching file." A single-file Bash read also triggers it.
- "`paths` is the only field Claude Code reads from a rule." If the YAML does not parse, the rule loads unscoped.
- User-level rules in `~/.claude/rules/` apply to every project and load before project rules; "Neither set overrides the other."
- Symlinks are supported. A target outside the working directory needs approval, "and after that only the ones without a `paths` field load."
- **Limitation.** Path-scoped rules "load into message history… so compaction summarizes them away… If a rule must persist across compaction, drop the `paths:` frontmatter."

#### Auto memory

- Stored at `~/.claude/projects/<project>/memory/`, shared by all worktrees of a repo.
- "The first 200 lines of `MEMORY.md`, or the first 25KB, whichever comes first, are loaded at the start of every conversation." Topic files are read on demand.
- Re-injected after compaction. Not loaded into subagents, except forks.

#### Skills

- **Locations.** Managed, `~/.claude/skills/`, `.claude/skills/`, nested `<subdir>/.claude/skills/` (loaded "the first time Claude reads or edits a file in that subdirectory"), plugin `skills/`, and the claude.ai account. Enterprise beats personal beats project. Plugin skills are namespaced `/plugin:skill`.
- **Commands.** "Custom commands have been merged into skills. Your existing `.claude/commands/` files keep working."
- **Frontmatter.** `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`, `compatibility`. Unknown fields are silently ignored in Claude Code; uploads to claude.ai accept only the open-spec fields.
- **What loads when.**

| Setting | Description in context | Body |
|---|---|---|
| Default | Yes, every request | On invocation |
| `disable-model-invocation: true` | No | Only when the user invokes it |
| `user-invocable: false` | Yes | When Claude invokes it |

- **Description budget.** "the combined `description` and `when_to_use` text is truncated at 1,536 characters." The total listing "scales at 1% of the model's context window". On overflow, the least-invoked skills lose their descriptions; names stay. Note the open spec caps `description` alone at 1,024 characters.
- **Lifecycle.** "the rendered `SKILL.md` content enters the conversation as a single message and stays there across later turns… does not re-read the skill file."
- **Compaction.** Claude Code "re-attaches the most recent invocation of each skill… keeping the first 5,000 tokens of each… combined budget of 25,000 tokens… older skills can be dropped entirely."
- **Dynamic context.** `` !`cmd` `` runs before the content is sent; a failing command aborts the invocation.
- **Ambiguous.** The skill `paths` field is described only as "Glob patterns for the files that activate this skill"; the docs do not say whether the description is hidden until a matching file is touched.

#### Subagents

- Files in `.claude/agents/`, `~/.claude/agents/`, plugin `agents/`, or `--agents`; required fields `name` and `description`.
- A non-fork subagent starts with its own prompt, the delegation message, every level of CLAUDE.md and rules, git status and any preloaded skills. It does **not** get the Claude Code system prompt, the conversation history, invoked skills, the output style or auto memory. Explore and Plan skip CLAUDE.md; `omitClaudeMd: true` does the same for custom agents.
- `skills` field: "The full content of each listed skill is injected", up to 32 names.
- `memory` field: per-agent `MEMORY.md` with the same 200 lines / 25KB rule.
- Cost: a startup warning appears "when your subagents' combined descriptions pass the 15,000-token limit".

#### Plugins

- Can contain: skills, legacy commands, agents, hooks, a JS hooks module, MCP servers, LSP servers, `bin/` executables, themes, output styles, channels, monitors, workflows, `userConfig`, dependencies, evals.
- **No CLAUDE.md or rules:** "To include instructions in a plugin, write them as a skill. Claude Code doesn't load a `CLAUDE.md` at the plugin root."
- Cost: "for each skill, agent, and command that Claude can invoke on its own, the name and description are in Claude's context on every turn."
- Verified CLI subcommands: `init`, `install`, `uninstall`, `enable`, `disable`, `update`, `list`, `details`, `configure`, `prune`, `validate [--strict] [--json]`, `eval`, `eval init`, `tag`, `test`, `marketplace add|list|remove|update`.

#### Hooks

- Hooks cost zero context unless they return some. Context can be injected through plain stdout on SessionStart, UserPromptSubmit, UserPromptExpansion and PostModelSwitch, or through `additionalContext` on those plus SubagentStart, PreToolUse, PostToolUse and Stop. The injection is capped at 10,000 characters.
- A SessionStart hook with the `compact` matcher re-injects context after compaction.
- `InstructionsLoaded` is observe-only; its `load_reason` values (`session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`) make it a way to audit what loaded.
- "An instruction like 'never edit `.env`' in CLAUDE.md or a skill is a request, not a guarantee. A `PreToolUse` hook that blocks the edit is enforcement."

#### MCP

- "Only tool names and server instructions load at session start." Tool search is on by default.
- Server instructions and upfront tool descriptions are truncated at 4,096 characters (2,048 before v2.1.296); tools loaded through search at 16,384.
- "Prefer CLI tools when available… more context-efficient than MCP servers."

#### Output styles

- Sent with every request. Custom styles replace the built-in software-engineering instructions unless `keep-coding-instructions: true` is set.
- Apply to the main conversation and forks, not to other subagents.

#### Context cost by feature (from the features overview)

| Feature | Loads | Cost |
|---|---|---|
| CLAUDE.md | Session start | Every request |
| Output styles | Session start | Every request |
| Skills | Descriptions at start, body when used | Low (descriptions every request) |
| MCP | Names at start, schemas on demand | Low until a tool is used |
| Subagents | When spawned | Isolated |
| Hooks | On trigger | Zero, unless the hook returns context |

Diagnostic commands: `/context` (live breakdown including loaded memory files), `/memory`, `/doctor` and `/doctor prompt-audit`, `/skill-doctor` (per-skill cost), `/usage`.

### 1.2 Other tools

All [DOC] from each tool's official docs, fetched 2026-11-20.

| Tool | Always-on file | Scopes | Glob-conditional | On-demand | Imports | Packaging | Size guidance |
|---|---|---|---|---|---|---|---|
| Codex CLI | AGENTS.md, `AGENTS.override.md` | `~/.codex`, root-to-cwd walk | No | Skills | No | Plugins (skills, MCP, hooks) | 32 KiB total; skill list 2% of context |
| Cursor | `.cursor/rules/*.mdc`, AGENTS.md (nested) | User (settings), team, project | `globs` | "Apply Intelligently", skills | No | Plugins, marketplaces | Under 500 lines per rule |
| GitHub Copilot | `copilot-instructions.md`, AGENTS.md (nearest wins) | Personal, repo, org | `applyTo`, `excludeAgent` | Skills, custom agents | Links, not guaranteed | VS Code plugins | 4,000-char code-review cap removed 2026-06-12 |
| Gemini CLI | GEMINI.md (configurable to AGENTS.md) | Global, ancestors, just-in-time subdirs | No | Skills | `@file` | Extensions | None |
| Aider | None automatic (`--read`) | Config file | No | No | No | No | None |
| Windsurf / Devin Desktop | `.devin/rules`, AGENTS.md | Global, workspace | `glob` | `model_decision`, skills | Not checked | Not checked | Not checked |
| Cline | `.clinerules/` | Global, workspace | `paths` | Not verified | Not checked | Not checked | Not checked |
| Amp | AGENTS.md | User, cwd upward, subtree on read | `globs` on imported files | Skills | `@` with globs | Not checked | Not checked |
| opencode | AGENTS.md, falls back to CLAUDE.md | Global, walk | Via `instructions` config | Skills | Config files, URLs | Not checked | Not checked |
| Kiro | `.kiro/steering`, AGENTS.md | Global, workspace | `fileMatch` | `auto`, `manual`, skills | `#[[file:]]` | Not checked | Not checked |

Sources: [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Codex skills](https://learn.chatgpt.com/docs/build-skills), [agents.md](https://agents.md), [Cursor rules](https://cursor.com/docs/context/rules), [Cursor skills](https://cursor.com/docs/context/skills), [Copilot repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), [Copilot support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support), [VS Code custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions), [Gemini CLI GEMINI.md](https://geminicli.com/docs/cli/gemini-md/), [Aider conventions](https://aider.chat/docs/usage/conventions.html), [Devin Desktop](https://docs.devin.ai/desktop/cascade/memories), [Cline rules](https://docs.cline.bot/customization/cline-rules), [Amp](https://ampcode.com/docs/customize/agents-md), [opencode rules](https://opencode.ai/docs/rules/), [Kiro steering](https://kiro.dev/docs/steering/), [Agent Skills spec](https://agentskills.io/specification.md).

Notable details:

- **Codex.** Files are joined root first, later files take precedence. `.rules` files are Starlark command policy, not prompt instructions. Custom prompts are deprecated: "Use skills for reusable prompts." Codex docs moved from `developers.openai.com/codex` to `learn.chatgpt.com/docs`.
- **agents.md spec.** Plain Markdown, no required fields, no imports, no globs, no size limits. "The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything." Stewarded by the Agentic AI Foundation under the Linux Foundation; "used by over 60k open-source projects".
- **Cursor.** Four rule types: Always, by glob, by description ("Apply Intelligently"), manual. Reads `.claude/skills` and `.codex/skills` for compatibility. Commands were converted to skills.
- **Copilot.** VS Code's own docs say "Don't rely on a universal precedence order." Support differs by surface. Prompt files run only in the Local harness, which "is deprecated and will be removed in February 2027."
- **Gemini CLI.** Scans for GEMINI.md in a directory and its ancestors whenever a tool touches a path. Free-tier users were moved to Antigravity CLI on 2026-06-18; that tool was not researched.
- **Zed** replaced "Rules" with skills and instructions.

### 1.3 Convergence trends

1. **AGENTS.md is the shared always-on file**, nested by directory with "nearest wins". Claude Code is now among the tools that read it natively.
2. **SKILL.md is the shared on-demand unit**: name and description first, body on demand. `.agents/skills` is read by Codex, Cursor, Copilot, Gemini and opencode; `.claude/skills` by Cursor, Copilot and opencode.
3. **Skills are replacing slash commands and prompt files** (Claude Code, Codex, Cursor, VS Code).
4. **The same four load modes recur**: always, by glob, by description, manual. The frontmatter key for globs is not standardised.
5. **Plugins and marketplaces are the sharing unit**, with tool-specific manifests.

---

## 2. Writing: what makes an instruction effective

### 2.1 Length

- [VENDOR] Claude Code [best practices](https://code.claude.com/docs/en/best-practices): "every line in it takes a little of Claude's attention on *every* task, whether it's relevant or not."
- [VENDOR] [Skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): "The context window is a public good." "Default assumption: Claude is already very smart. Only add context Claude doesn't already have." "Does this paragraph justify its token cost?"
- [VENDOR] Anthropic, [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (2025-09-29): "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome", and "minimal does not necessarily mean short."
- [VENDOR] OpenAI [Codex best practices](https://learn.chatgpt.com/guides/best-practices.md): "A short, accurate `AGENTS.md` is more useful than a long file full of vague rules."
- [VENDOR, UNVERIFIED at source] OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/) (2026-02-11; the page returned 403, content from a mirror): AGENTS.md as a roughly 100-line table of contents into `docs/`, after a single large AGENTS.md failed.
- [OPINION] HumanLayer, [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) (2025-11-25): under 300 lines, their own root file under 60. The "150–200 instructions" budget quoted there comes from IFScale, which tested keyword inclusion, not agent rules; the "~50 instructions in the system prompt" figure is the author's estimate.
- [OPINION] Philipp Schmid, [Writing a Good AGENTS.md](https://www.philschmid.de/writing-good-agents) (2026-02-24): "General consensus is <300 lines".

No study establishes an optimal line count. "Under 200 lines" is vendor guidance.

### 2.2 What to include and what to leave out

- [VENDOR] Include: exact test, typecheck and lint commands; "Places where the code is misleading"; "Decisions that aren't in the repo"; "Anything you've had to correct twice already".
- [VENDOR] Leave out: "Describe your architecture and file layout in `CLAUDE.md` → Claude reads the repo itself. Only write down what isn't in there." `/doctor` "cuts content Claude can derive from the codebase, such as directory layouts, dependency lists, and architecture overviews, and keeps pitfalls, rationale, and conventions that differ from tool defaults."
- [MEASURED] ETH Zurich: "repository overviews, although popular and recommended by model providers, are not helpful"; context files are "useful for specifying non-standard coding practices".
- [VENDOR] When to add a line: when "Claude makes the same mistake a second time", a code review catches something, or you type the same correction again.

### 2.3 Specificity and altitude

- [VENDOR] Aim for "the Goldilocks zone" between "hardcoding complex, brittle logic" and "vague, high-level guidance that fails to give the LLM concrete signals".
- [VENDOR] Write instructions "concrete enough to verify": "Use 2-space indentation" instead of "Format code properly".
- [VENDOR] The colleague test from the [prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices): "Think of Claude as a brilliant but new employee who lacks context on your norms."
- [OPINION] GitHub, [lessons from over 2,500 repositories](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) (2025-11-19): "Most agent files fail because they're too vague." Six areas: commands, testing, project structure, code style, git workflow, boundaries. This analyses repos without measuring outcomes.

### 2.4 Principles versus procedures

- [VENDOR] "Match the level of specificity to the task's fragility and variability."
  - High freedom (prose): "Multiple approaches are valid".
  - Low freedom (exact scripts): "Operations are fragile… A specific sequence must be followed."
- [VENDOR] Thariq Shihipar (Anthropic), [How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/) (2026): "Avoid railroading Claude… State the goal and the constraints, not every step." "The highest-signal content in any skill is the Gotchas section."
- [VENDOR] Fable 5 prompting page: "Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality."
- [VENDOR] [skill-creator](https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md): avoid "fiddly overfitty changes, or oppressively constrictive MUSTs."
- [MEASURED, guidance from agentskills.io] "If pass rates plateau despite adding more rules, the skill may be over-constrained — try removing instructions."

### 2.5 Examples

- [VENDOR] "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure." Make them diverse "so Claude doesn't pick up unintended patterns"; 3–5 is the suggested number.
- [VENDOR] "Positive examples… tend to be more effective than negative examples or instructions that tell the model what not to do."
- [OPINION] Disagreement: GitHub says "One real code snippet showing your style beats three paragraphs describing it"; HumanLayer and Schmid say "Prefer pointers over copies" because snippets go stale.

### 2.6 Emphasis words

- [VENDOR] Prompting guide: "Where you might have said 'CRITICAL: You MUST use this tool when...,' you can use more normal prompting such as 'Use this tool when...'" Newer models "might now overtrigger".
- [VENDOR] Claude Code best practices: "Older models sometimes needed the emphasis. Current ones follow a plainly worded line, and piling on emphasis mostly makes Claude over-apply the rule. If it's a rule that can't bend, turn it into a hook or a deny rule. If the line is getting lost in a long file, the file needs to be shorter."
- [VENDOR] skill-creator: "If you find yourself writing ALWAYS or NEVER in all caps, or using super rigid structures, that's a yellow flag."
- [VENDOR] "think hard", "be thorough", "don't be lazy" no longer raise effort and are "more likely to cause over-work than fix a stall."
- [VENDOR] OpenAI GPT-5 guide: maximising language such as "be THOROUGH" made GPT-5 overuse tools.
- **Inconsistency to note.** Anthropic's own skill best-practices page still shows "MUST filter" as an improvement and "ALWAYS use this exact template structure" in an example. The consensus is to reserve emphasis for rare, explained cases, not to ban it.
- **Evidence gap.** No controlled study isolates CAPS or "IMPORTANT" on current models. The closest measured result is that explicit framing plus a trailing reminder restored compliance to 90–100% in one preprint ([Mittal 2026](https://arxiv.org/abs/2603.23530)).

### 2.7 Positive versus negative phrasing

- [VENDOR] "Tell Claude what to do instead of what not to do".
- [VENDOR] "The model treats an instruction that contains 'never' as absolute." Prefer "ask for approval before deleting files" to "never delete files".
- [OPINION] Shrivu Shankar, [How I use every Claude Code feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature) (2025-11-02): "Don't Just Say 'Never.'" Always give the alternative.
- [OPINION] GitHub: three tiers of boundaries, "always do, ask first, never do".

### 2.8 Explaining why

- [VENDOR] "Providing context or motivation behind your instructions… Claude can generalize from the explanation."
- [VENDOR] "Give the reason, not only the request." "delete cautions whose reason no longer holds, and rewrite absolute rules with their scope and reason."
- [VENDOR] skill-creator: "explain to the model why things are important in lieu of heavy-handed musty MUSTs."

### 2.9 Guidance specific to newer models

The Anthropic prompting guide now covers the Claude 4.x and 5.x families up to Fable 5.2, with a page per model. All [VENDOR]; items marked * report Anthropic's own measurements.

- **Literal following.** Opus 4.8 "interprets prompts literally and explicitly… It does not silently generalize an instruction from one item to another." State the scope.
- **Brief instructions suffice.** "you can steer most behaviors with a brief instruction rather than enumerating each behavior by name."
- **Caution piles up.** Cautious lines accumulate in memory, notes and instruction files and are followed closely.
- **Approval lists are taken literally.*** A broad item made the model hold back about half of its routine requests. "Name the steps that need no approval"; "Telling the model to act more freely is too vague."
- **Framing has side effects.*** An ownership framing raised consolidation of duplicated code from under 10% to about 75% and raised output tokens by 70–80%.
- **Writing-style rules are obeyed to a fault.** A hard sentence-length limit "can make its prose choppy."
- **Delegation.** Some models over-use subagents, others under-use them; standing delegation instructions should be reviewed per model.
- **Review thresholds.** "only report high-severity issues" is followed faithfully and lowers recall; define the threshold concretely.
- **OpenAI.** [GPT-5 prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide): "contradictory or vague instructions can be more damaging to GPT-5 than to other models".

### 2.10 Skill descriptions

- [VENDOR] Third person, "both what the Skill does and when to use it".
- [VENDOR] Thariq: "the description field is not a summary, it's a description of when to trigger this skill."
- [VENDOR] skill-creator: "Claude has a tendency to 'undertrigger' skills… make the skill descriptions a little bit 'pushy'."
- **Tension.** The prompting guide warns that aggressive wording over-triggers. A reconciliation, which is an inference and not a sourced claim: name trigger contexts generously, without CAPS or MUST.

---

## 3. Context economy and failure modes

### 3.1 Effect of context files on success and cost

- [MEASURED, preprint; listed as an ICLR 2026 workshop paper] Gloaguen et al., [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) (v1 2026-02-12, v3 2026-09-29).
  - Context files do "not generally improve task success rates, while increasing inference cost by over 20% on average".
  - LLM-generated files: about −0.5 pp and −2 pp. Developer-written: about +2.4 pp. None significant on its own; the gap between the two is (p=0.038).
  - Mechanism: agents follow the files, which adds exploration and testing steps.
  - Caveats: Python only; the paper's "7%" and "4%" summary figures do not match its per-setting averages.
- [MEASURED, workshop] [Khatri 2026](https://arxiv.org/abs/2607.27250): context strategy "does not measurably move correctness on either agent". 17 tasks.
- [MEASURED, preprint] Lulla et al., [On the Impact of AGENTS.md Files](https://arxiv.org/abs/2601.20404): median runtime −28.6% and output tokens −16.6% with comparable completion, across 124 PRs. This points the opposite way from the ETH cost result; the setups differ and nothing reconciles them.

### 3.2 What real files look like

- [MEASURED, preprint] [Agent READMEs](https://arxiv.org/abs/2511.12884): 2,303 files; median 485 words for Claude Code files; reading ease "very difficult"; files "evolve like configuration code through frequent, small additions", with median additions of about 57 words per commit and deletions under 15. Architecture and system overview appear in 59–68% of files.
- [MEASURED, peer-reviewed] [Agentic coding manifests](https://arxiv.org/abs/2509.14744) (PROFES 2025): 253 CLAUDE.md files, dominated by commands, implementation notes and architecture.
- [MEASURED] [Harness Engineering for Agentic AI Coding Tools](https://arxiv.org/abs/2602.14690): across 2,853 repos, "Context Files dominate… often the sole mechanism"; "Few repositories adopt advanced mechanisms such as Skills and Subagents."
- [MEASURED, UNVERIFIED at source] Cursor rules studies ([arXiv 2512.18925](https://arxiv.org/abs/2512.18925)): rules often duplicate existing docs and are copied from templates.

### 3.3 Instruction count and context length

- [MEASURED, workshop] [IFScale](https://arxiv.org/abs/2507.11538) (2025-07): near-perfect at 10 instructions; best model 68% at 500; Claude Opus 4 at 94.6 / 67.9 / 44.6% for 100 / 250 / 500. Earlier instructions are favoured; omission is the main error. Keyword inclusion only, and no 2026 models.
- [MEASURED, preprint] [Mittal 2026](https://arxiv.org/abs/2603.23530): compliance "drops by 2-21% under concurrent task load"; formatting constraints can also damage the task itself.
- [MEASURED, vendor] Chroma, [Context Rot](https://www.trychroma.com/research/context-rot) (2025-07-14): performance fell with input length in every experiment across 18 models; "Even a single distractor reduces performance."
- [MEASURED, peer-reviewed] [NoLiMa](https://arxiv.org/abs/2502.05167) (ICML 2025): at 32K tokens, 11 models fall below half of their short-context baseline.
- [MEASURED, preprint] [LLMs Get Lost In Multi-Turn Conversation](https://arxiv.org/abs/2505.06120): "an average drop of 39%".

### 3.4 Skills

- [MEASURED, preprint] [SkillsBench](https://arxiv.org/abs/2602.12670): curated skills +16.2 pp (v4: 33.9% to 50.5%); software engineering +4.5 pp; 16 of 84 tasks negative; "Self-generated Skills provide no benefit on average"; "Focused Skills with 2--3 modules outperform comprehensive documentation."
- [MEASURED, vendor blog] Vercel, [AGENTS.md outperforms skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) (2026-01-27): baseline 53%, skill 53%, skill with explicit instruction 79%, 8KB index in AGENTS.md 100%. "In 56% of eval cases, the skill was never invoked." Model and task count undisclosed.
- [MEASURED, practitioner] Scott Spence, [skill activation evals](https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals) (2026-02-08): about 50–55% activation without a hook, 100% with a forced-evaluation hook. 22 prompts.
- [MEASURED, preprint] [Agent Skills in the Wild](https://arxiv.org/abs/2601.10338): "26.1% of skills contain at least one vulnerability", from 31,132 skills.

### 3.5 Tool definitions

- [VENDOR] Anthropic, [Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use) (2025-11-24): 58 tools at about 55K tokens; 134K seen internally; tool search cuts about 85% and raised accuracy (Opus 4.5: 79.5% to 88.1%).
- [VENDOR] Anthropic, [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) (2025-11-04): 150,000 to 2,000 tokens in a worked example.

### 3.6 Cost of static instruction files

- [DOC] Prompt caching: cached reads cost 0.1× base input for most models and less for the newest; a cache write costs 1.25× (5-minute TTL) or 2× (1-hour). Changing tool definitions invalidates everything after them.
- [DOC] Claude Code costs page: move workflow-specific instructions to skills because "those tokens are present even when you're doing unrelated work."
- **Gap.** No published measurement links CLAUDE.md size to cost. The ETH +20% comes from extra agent steps, not from the file's own tokens. With caching, the attention cost of a large always-on file likely matters more than its token price; that is an inference.

### 3.7 Known failure modes

| Failure mode | Evidence | Mitigation with a source |
|---|---|---|
| Contradictions across files or layers | [DOC] "Claude may pick one arbitrarily"; user and project rules do not override each other. [MEASURED] [Control Illusion](https://arxiv.org/abs/2502.15851) (AAAI-26): with conflicting system and user constraints, the system one was followed 9.6–45.8% of the time on older models | `/doctor prompt-audit`; single source per rule |
| Stale instructions | [MEASURED] [Xu & Wu 2026](https://arxiv.org/abs/2610.30571): stale file followed in 90.1% of choices; [Treude & Baltes 2026](https://arxiv.org/abs/2606.09090): stale references in 23.0% of repos | One sentence giving code precedence raised code-following from 4.2% to 91.4% (synthetic) |
| Instructions lost after compaction | [DOC] path-scoped rules, nested CLAUDE.md and conversation-only instructions are summarised away. GitHub issues report ignored rules in long sessions [UNVERIFIED status] | Unscoped rule, SessionStart `compact` hook, deny rule |
| Skills not triggering | Vercel 56%, Spence about 50% | Explicit pointer in the always-on file; forced-evaluation hook |
| Over-application of emphasised or absolute rules | [VENDOR] | Plain wording with scope and reason |
| Accumulating caution | [VENDOR] | Periodic pruning |
| Emphasis escalation | [VENDOR] "If you keep adding emphasis… that's a sign the line belongs in a hook" | Hook or deny rule |

The Control Illusion arXiv identifier above was not verified by the research agents; the paper title and venue were.

---

## 4. Maintenance

### 4.1 Keeping instructions current

- [DOC] Review periodically; add a line on the second occurrence of a mistake; prefer skills and path-scoped rules for anything not globally relevant.
- [DOC] `/doctor prompt-audit` (v2.1.283+): "Claude looks for problems such as instructions written for older models, references to files or commands that don't exist, and files that contradict each other." Covers CLAUDE.md, AGENTS.md, rules, skills, commands, subagents and output styles.
- [DOC] Auto memory reminds Claude near the limit to "merge or drop stale entries".
- [OPINION, via [InfoQ](https://www.infoq.com/news/2026/01/claude-code-creator-workflow)] Boris Cherny's team: one CLAUDE.md in git, about 2.5k tokens, a line added "anytime Claude does something incorrectly", updated through `@claude` on pull requests. The original thread was not reached.
- [UNVERIFIED] OpenAI's harness-engineering post reportedly describes CI that enforces doc freshness and a recurring "doc-gardening" agent.
- [UNVERIFIED] `/insights` and "auto dream" memory consolidation appear only in third-party write-ups.
- [MEASURED] Real files grow by addition and rarely shrink (section 3.2), which is the pattern the guidance warns against.

### 4.2 Testing and evaluating

- [DOC] [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) (v2.1.269+):
  - Cases in `evals/<case>/prompt.md` or `case.yaml`; six grader types (regex, tool_used, tool_order, file_exists, llm, baseline); "There are no custom-code graders."
  - "each case runs three times by default"; `--threshold` controls the exit code.
  - `--ablation with-without` reports the difference the plugin makes.
  - **Limitation:** "Nothing personal or project-level loads… Your user settings, hooks, CLAUDE.md files". Plain CLAUDE.md and rules cannot be tested in place.
  - It does not read skill-creator's `evals.json`.
- [DOC] `claude plugin validate --strict` for CI.
- [DOC] skill-creator: `evals/evals.json`; for each case "spawn two subagents in the same turn — one with the skill, one without"; grader, analyzer and optional blind comparator; description tuning with 20 should-trigger and should-not-trigger queries and a 60/40 train/test split.
- [VENDOR] Skill best practices: "Create evaluations BEFORE writing extensive documentation". The same page still says "There is not currently a built-in way to run these evaluations", which contradicts the plugin-eval page and is stale.
- [VENDOR] Anthropic, [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (2026-01-09): "20-50 simple tasks drawn from real failures is a great start"; grade the outcome, not the path; "Read the transcripts!"
- [VENDOR] OpenAI, [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills): 10–20 prompts, at least one should-not-trigger case, "Let real failures drive coverage."
- [UNVERIFIED] Third-party linters such as [agnix](https://github.com/agent-sh/agnix) and `skills-ref validate`.

### 4.3 Versioning and sharing

- [DOC] [Plugin versions](https://code.claude.com/docs/en/plugins/loading): a pinned `version` "keeps every user on the cached copy until its author changes the string… To let users track commits instead, leave version out". Auto-update is off by default for non-Anthropic marketplaces.
- [DOC] [Org distribution](https://code.claude.com/docs/en/plugins/org): `extraKnownMarketplaces` and `enabledPlugins` in managed settings or in `.claude/settings.json`; "Setting `enabledPlugins` in the repository doesn't install the plugin". Release channels: "host two marketplaces that point at different refs of the same plugins". Lockdown through `strictKnownMarketplaces` and related keys.
- [DOC] Cross-tool single source: `@AGENTS.md` in CLAUDE.md with Claude-specific lines below; `.claude/rules/` supports symlinks.
- [DOC] [`npx skills`](https://cdn.jsdelivr.net/gh/vercel-labs/skills@main/README.md) installs skills across agents and records a hash in `skills-lock.json`.

### 4.4 Avoiding drift and duplication

No measured study compares approaches. The documented and commonly recommended practices are: one source per rule, with other tools importing or symlinking it; packaging shared instructions as versioned skills; treating instruction files as code in review; and a periodic audit that removes what the repo or the model already covers.

---

## 5. Workflows and processes

- **Prose is guidance.** [DOC] "If something has to happen every time, make it a hook, a deny rule, or a managed setting. `CLAUDE.md` is for guidelines, and Claude is allowed to decide a guideline doesn't apply." A line such as "Always typecheck before you finish" "works most of the time, not every time".
- **Do not overdo hooks.** [DOC] "a hook is for a rule with *zero* exceptions." "If you ever find yourself at forty of them, most are probably preferences."
- **Procedures belong in skills.** [DOC] "A long release procedure sitting in a skill doesn't weigh on your unrelated bug fix." Side-effecting procedures get `disable-model-invocation: true`.
- **Patterns inside a skill.** [VENDOR] Checklists ("Copy this checklist and track your progress"), feedback loops ("Run validator → fix errors → repeat"), plan-validate-execute for destructive or batch work, and "Prefer scripts for deterministic operations."
- **Deterministic step order.** [DOC] Claude Code [Dynamic Workflows](https://code.claude.com/docs/en/workflows): "A workflow moves the plan into code." Who decides what runs next: Claude for skills and subagents, the lead agent for agent teams, the script for workflows. Constraint: "No mid-run user input… For sign-off between stages, run each stage as its own workflow."
- **Approval gates.** [VENDOR] Promote high-stakes actions to dedicated tools that the harness can gate ([Agent Harness Design](https://claude.com/resources/articles/harnessing-claudes-intelligence), 2026-04-02). In prose, name precisely which steps need approval and which do not, since lists are taken literally.
- **State lives in files.** [VENDOR] "Use structured formats for state data… JSON"; "Use git for state tracking". Anthropic's [long-running harness post](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (2025-11-26) kept the feature list in JSON because "the model is less likely to inappropriately change or overwrite JSON files compared to Markdown files".
- **Verification.** [VENDOR] Fresh-context verifier subagents "tend to outperform self-critique"; requiring each claim to be audited "against a tool result from this session" "nearly eliminated fabricated status reports" in Anthropic's testing.
- **Scaffolding goes stale.** [VENDOR] [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) (2026-03-24): "every component in a harness encodes an assumption about what the model can't do on its own", and these "can quickly go stale as models improve".
- **Own the control flow.** [OPINION] [12-factor agents](https://github.com/humanlayer/12-factor-agents): "Own your control flow", "Contact humans with tool calls".
- **Critique of heavy process prompts.** [OPINION] Birgitta Böckeler on [spec-driven development tools](https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) (2025-10-15): "like using a sledgehammer to crack a nut"; "I frequently saw the agent ultimately not follow all the instructions".
- **Block late, not early.** [OPINION] Shankar: check at commit time rather than at each write, so the agent can finish its plan.

Not researched: superpowers, BMAD, OpenSpec, GitHub Spec Kit details, the Claude Code agent-teams page.

---

## 6. Output formatting for agents talking to humans

- [VENDOR] "Match your prompt style to the output you want… removing markdown from your prompt can reduce the volume of markdown in the output."
- [VENDOR] Fable 5.2 page, "Make reports easy to follow": "Write for an intelligent but low-context reader… Put the key points in the first few sentences… Do not use a term or abbreviation that you made up during the work… keep bullets for lists of separate items." Measured in-house to make reports less dense.
- [VENDOR] "Lead with the outcome." "The way to keep output short is to be selective about what you include… not to compress the writing into fragments, abbreviations, arrow chains." "If you have to choose between short and clear, choose clear."
- [VENDOR] Newer models "might skip verbal summaries after tool calls"; ask for one if wanted.
- [DOC] Claude Code output styles: built-in Default, Proactive, Concise, Explanatory, Learning. "An output style gives Claude instructions to follow. It doesn't guarantee." They do not reach non-fork subagents, so a subagent's report format must be set in its own definition or prompt. The docs' example style uses Mermaid with "Keep diagrams under 15 nodes".
- [VENDOR, via search snippets] OpenAI Codex prompt: "Use structure only when it helps scanability"; "Formatting should make results easy to scan, but not feel mechanical".

No measured evidence was found on tables or diagrams in agent output.

---

## What could not be verified

- OpenAI's harness-engineering post (403; content from a mirror and secondary sources).
- Boris Cherny's original thread; Addy Osmani's piece (secondary summaries only).
- HumanLayer's claim that CLAUDE.md is wrapped in a "may or may not be relevant" reminder. The wrapper observed in a current session reads differently, so the claim may be outdated.
- `/insights`, auto dream, agnix details, `skills-ref validate`, whether `npx skills` symlinks or copies.
- Whether user-level and parent-directory CLAUDE.md files are re-injected after compaction; the semantics of the skill `paths` field; where the skill listing sits in Claude Code's prompt.
- The Codex hooks page and Codex system prompt (search snippets only); Zed nested files; Cline skills; Antigravity CLI.
- The arXiv identifier for the Control Illusion paper; the LongCodeBench and politeness-study numbers.
- Peer-review status of several papers: most measured evidence here is preprint or workshop level, with small samples, Python-only tasks or synthetic setups.

---

## Sources

### Anthropic, official docs (live pages, fetched 2026-11-20)

- Claude Code memory: https://code.claude.com/docs/en/memory
- Claude Code skills: https://code.claude.com/docs/en/skills
- Claude Code subagents: https://code.claude.com/docs/en/sub-agents
- Claude Code features overview: https://code.claude.com/docs/en/features-overview
- Claude Code context window: https://code.claude.com/docs/en/context-window
- Claude Code hooks: https://code.claude.com/docs/en/hooks
- Claude Code MCP: https://code.claude.com/docs/en/mcp
- Claude Code costs: https://code.claude.com/docs/en/costs
- Claude Code best practices: https://code.claude.com/docs/en/best-practices
- Claude Code output styles: https://code.claude.com/docs/en/output-styles
- Claude Code plugins overview: https://code.claude.com/docs/en/plugins/overview
- Plugin loading and versions: https://code.claude.com/docs/en/plugins/loading
- Plugin org distribution: https://code.claude.com/docs/en/plugins/org
- Plugin evals: https://code.claude.com/docs/en/plugin-evals
- Dynamic workflows: https://code.claude.com/docs/en/workflows
- Prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Skill authoring best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- skill-creator SKILL.md: https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md

### Anthropic, engineering posts

- Building effective agents (2024-12-19): https://www.anthropic.com/engineering/building-effective-agents
- Effective context engineering for AI agents (2025-09-29): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Code execution with MCP (2025-11-04): https://www.anthropic.com/engineering/code-execution-with-mcp
- Advanced tool use (2025-11-24): https://www.anthropic.com/engineering/advanced-tool-use
- Effective harnesses for long-running agents (2025-11-26): https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Demystifying evals for AI agents (2026-01-09): https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Harness design for long-running application development (2026-03-24): https://www.anthropic.com/engineering/harness-design-long-running-apps
- Agent Harness Design: 3 Patterns (2026-04-02): https://claude.com/resources/articles/harnessing-claudes-intelligence
- Lessons from building Claude Code: How we use skills (2026): https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/

### Other vendors and standards

- agents.md: https://agents.md
- Agent Skills: https://agentskills.io and https://agentskills.io/specification.md
- Evaluating skills: https://agentskills.io/skill-creation/evaluating-skills
- Codex AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Codex skills: https://learn.chatgpt.com/docs/build-skills
- Codex best practices: https://learn.chatgpt.com/guides/best-practices.md
- OpenAI harness engineering (2026-02-11, not reachable): https://openai.com/index/harness-engineering/
- OpenAI GPT-5 prompting guide: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
- OpenAI, Testing Agent Skills Systematically with Evals (about 2026-01-22): https://developers.openai.com/blog/eval-skills
- Cursor rules: https://cursor.com/docs/context/rules
- Cursor skills: https://cursor.com/docs/context/skills
- Copilot repository instructions: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- Copilot support matrix: https://docs.github.com/en/copilot/reference/custom-instructions-support
- Copilot code review changelog (2026-06-12): https://github.blog/changelog/2026-06-12-copilot-code-review-new-configurations-and-controls/
- VS Code custom instructions (2026-11-18): https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- Gemini CLI GEMINI.md (2026-06-18): https://geminicli.com/docs/cli/gemini-md/
- Aider conventions: https://aider.chat/docs/usage/conventions.html
- Devin Desktop rules: https://docs.devin.ai/desktop/cascade/memories
- Cline rules: https://docs.cline.bot/customization/cline-rules
- Zed instructions: https://zed.dev/docs/ai/instructions
- Junie guidelines (2026-11-19): https://junie.jetbrains.com/docs/guidelines-and-memory.html
- Amp AGENTS.md: https://ampcode.com/docs/customize/agents-md
- opencode rules: https://opencode.ai/docs/rules/
- Kiro steering (2026-10-21): https://kiro.dev/docs/steering/
- Vercel skills CLI: https://cdn.jsdelivr.net/gh/vercel-labs/skills@main/README.md

### Papers and measurements

- Gloaguen et al., Evaluating AGENTS.md (2026-02, v3 2026-09): https://arxiv.org/abs/2602.11988
- Khatri, Do Context Files Help Coding Agents? (2026): https://arxiv.org/abs/2607.27250
- Lulla et al., On the Impact of AGENTS.md Files (2026-01): https://arxiv.org/abs/2601.20404
- Chatlatanagulchai et al., Agent READMEs (2025-11): https://arxiv.org/abs/2511.12884
- Chatlatanagulchai et al., Agentic Coding Manifests (PROFES 2025): https://arxiv.org/abs/2509.14744
- Santos et al., Decoding the Configuration of AI Coding Agents (2025-11): https://arxiv.org/abs/2511.09268
- Galster et al., Harness Engineering for Agentic AI Coding Tools (2026-02): https://arxiv.org/abs/2602.14690
- Jiang and Nam, Beyond the Prompt: Cursor Rules (MSR 2026): https://arxiv.org/abs/2512.18925
- Treude and Baltes, stale context files (2026-06): https://arxiv.org/abs/2606.09090
- Xu and Wu, Stale Instruction Files Override the Code (2026-10): https://arxiv.org/abs/2610.30571
- Jaroslawicz et al., IFScale (2025-07): https://arxiv.org/abs/2507.11538
- Mittal, Prospective Memory Failures in LLMs (2026-03): https://arxiv.org/abs/2603.23530
- Chroma, Context Rot (2025-07-14): https://www.trychroma.com/research/context-rot
- Modarressi et al., NoLiMa (ICML 2025): https://arxiv.org/abs/2502.05167
- Laban et al., LLMs Get Lost In Multi-Turn Conversation (2025-05): https://arxiv.org/abs/2505.06120
- Li et al., SkillsBench (2026-02, v4 2026-06): https://arxiv.org/abs/2602.12670
- Liu et al., Agent Skills in the Wild (2026-01): https://arxiv.org/abs/2601.10338
- Geng et al., Control Illusion (AAAI-26): identifier not verified
- Vercel, AGENTS.md outperforms skills (2026-01-27): https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
- Scott Spence, skill activation evals (2026-02-08): https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals

### Practitioners

- HumanLayer, Writing a good CLAUDE.md (2025-11-25): https://www.humanlayer.dev/blog/writing-a-good-claude-md
- HumanLayer, 12-factor agents (2025): https://github.com/humanlayer/12-factor-agents
- Philipp Schmid, Writing a Good AGENTS.md (2026-02-24): https://www.philschmid.de/writing-good-agents
- GitHub blog, How to write a great agents.md (2025-11-19): https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
- Shrivu Shankar, How I use every Claude Code feature (2025-11-02): https://blog.sshh.io/p/how-i-use-every-claude-code-feature
- Birgitta Böckeler, spec-driven development tools (2025-10-15): https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- InfoQ on Boris Cherny's workflow (2026-01): https://www.infoq.com/news/2026/01/claude-code-creator-workflow
