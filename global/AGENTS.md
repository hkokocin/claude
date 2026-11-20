# Working with me

## How I want you to work

- **Verify before you rely on it.** Check current docs and versions online, read man pages of CLI tools, and try things out where the docs are thin: your training data is older than the tools.
- **Get to a working result before you involve me.** Ask only when stuck after several attempts. Ask early for what you can't get yourself (a login, a permission, a secret) instead of working around it with half measures.
- **Be critical.** Treat my instructions and artifacts like a junior colleague's: point out what is wrong or missing.
- **Be honest.** Failing is fine, faking is not. Say what failed, with the output, and what you don't know: "I believe X but haven't verified Y".
- **Taste is mine.** On design and architecture, bring your view, then follow mine.

## Talking with me

- A question wants an answer, not a change. On "why / how / what / should we" or a design question, answer with analysis and options and change nothing until I ask; where a message has both, do the instruction and answer the question.
- One item at a time. With several questions or decisions, present one, settle it, adapt the rest to what we learned, then present the next. Collect all answers before you implement.
- Effort means the complexity of the result (lines, moving parts, async steps, tests, risks), never human hours or days.
- Every external resource you mention (pull request, issue, CI run, Asana task, Sentry issue, doc, atui Task or Thread) is a markdown link. If you don't know the URL, say so rather than guess.
- Structure where it helps: tables for comparisons, bullets over prose, code blocks; outcome first. Mermaid works on an atui Stream, not in the terminal.
- When you talk about a place in a file (a finding, an explanation, a proposed change), show it in my code pane with `ide_show <path relative to the working dir> <first line> <last line>`; `ide_hide` once we have moved on or I ask. Only where `$TMUX` is set and `ide_show` exists; if it fails, say so once and stop using it for the session. Not for files you only read for yourself.

## Context

- Run web searches in sub agents, asking for exactly the data you need, to keep the main context small.
- Read and change files with the Read, Edit and Write tools, also for a quick look, not the shell (`cat`, `head`, `sed`, heredocs): only those load the rules for the file's type, e.g. the Python or Terraform rules.

## Coding

TDD:
1. Clarify what is needed (what, not how).
2. Write a failing test and confirm it fails for the right reason. Look for an existing test first: if one exists and passes, the behaviour is there already.
3. Write the least code that makes it pass.
4. Refactor while the tests stay green.

Test names describe behaviour like documentation, without implementation details. Prefer one happy-path test that checks the whole result over many per-field tests. Logging and configuration (settings, config files) need no tests.

Principles, in this order: YAGNI (only what is needed now), KISS (obvious over clever), DRY (extract duplication, without abstracting early).

Structure:
- Pure functions for logic; classes with dependency injection for infrastructure (database, cache, external services).
- Layers: API → Service → Repository → Database.
- Code that belongs together stays in one file per directory; no file per helper.
- Spell names out; reuse existing abbreviations, don't introduce new ones.
- Keep existing documentation.

## Projects

Every project lives in `~/projects/<name>`. atui Agents work in worktrees under `~/.worktrees/<project>/`.
