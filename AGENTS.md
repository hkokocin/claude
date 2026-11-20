# Claude config

This repo holds the user's Claude Code config. `sync.sh` projects it into `~/.claude` with symlinks: entities live here in category directories (`skills/<category>/<name>/`, `rules/`, `agents/`, `shared/`), the user-level `CLAUDE.md` and `AGENTS.md` in `global/`. Edit them here, never through `~/.claude`. A new, moved or deleted entity takes effect with the next sync.

## Syncing

`sync.sh` links `~/.claude` to the checkout it runs in, and a worktree's links dangle once the worktree is removed. So sync only from the main checkout `~/projects/tools/claude`:
- In the main checkout: run `./sync.sh` after committing.
- In a worktree (atui Agents): once the change is on `main`, pull the main checkout fast-forward and run its `sync.sh`. If the pull fails (e.g. uncommitted changes there), tell the user instead of forcing it.

To try a config without touching the live one, run `sync.sh` with `CLAUDE_CONFIG_DIR` and `XDG_CONFIG_HOME` set to other directories; the second keeps atui's `resources.toml` link pointing at the main checkout.

## Committing

- At the start of a task (also after /clear): if `git status` shows uncommitted changes, offer a commit message for them before going on.
- When a change is done, or the user sounds satisfied with it ("looks good", "perfect"), commit it without asking and show the commit message.

## Expected setup

The instructions rely on the global git setting `branch.autoSetupMerge=simple` (in the zde dotfiles): a branch created from `origin/main` then doesn't track `origin/main`, so a bare `git push` can't land on main.
