## TL;DR
Task files (`docs/tasks`) are never committed to PEAT-AI repos. git ignores them there through a machine-local git config, and /task leaves an ignored file uncommitted.

## Specification
- PEAT repo = a repo whose remote URL is `git@github.com:PEAT-AI/…` or `https://github.com/PEAT-AI/…`.
- Machine-local, not versioned (the user's choice; not in zde): `~/.gitconfig` has `includeIf "hasconfig:remote.*.url:…PEAT-AI/**"` (ssh and https) including `~/.config/git/config.peat`, which sets `core.excludesFile = ~/.config/git/ignore.peat`. `ignore.peat` repeats the global `~/.config/git/ignore` (excludesFile replaces it) plus `docs/tasks/`. No `.gitignore` commit in PEAT repos.
- claude `skills/engineering/task/SKILL.md`: if git ignores the Specification file, leave it uncommitted (no longer ask the user).
- Already committed: no PEAT main has `docs/tasks`. The open PRs Dingo 1249 (dingo/2) and terraform 8097 (terraform/1) removed their Task file with `git rm --cached`.
- No separate rule file in `rules/`.
