## TL;DR
Task files (`docs/tasks`) are never committed to PEAT-AI repos. git ignores them there through a conditional git config in zde, and /task leaves an ignored file uncommitted.

## Specification
- PEAT repo = a repo whose remote URL is `git@github.com:PEAT-AI/…` or `https://github.com/PEAT-AI/…`.
- zde `dotfiles/common/.config/git/config`: `includeIf "hasconfig:remote.*.url:…PEAT-AI/**"` (ssh and https) includes `config.peat`, which sets `core.excludesFile = ~/.config/git/ignore.peat`. `ignore.peat` repeats the global `ignore` (excludesFile replaces it) plus `docs/tasks/`. Local only: no `.gitignore` commit in PEAT repos. Test: `tests/test_git_conf.sh`.
- claude `skills/engineering/task/SKILL.md`: if git ignores the Specification file, leave it uncommitted (no longer ask the user).
- Already committed: no PEAT main has `docs/tasks`. Open PRs Dingo 1249 (dingo/2) and terraform 8097 (terraform/1) were asked to `git rm --cached` their Task file.
- No separate rule file in `rules/`.
