# Auto-commit for config repo

This repo holds the Claude config and is projected into `~/.claude` via
symlinks by `sync.sh`. Edit entities here, in their category subdirectories;
never edit the symlinks under `~/.claude` directly. New or moved entities
become live after the next sync.

## Sync after a change was implemented
- Sync only from the main checkout `~/projects/tools/claude`, never from a
  worktree: `sync.sh` links `~/.claude` to the checkout it runs in, and a
  worktree's links dangle once it is removed.
- Working in the main checkout: run `./sync.sh` after committing.
- Working in a worktree (atui Agents): once the change is on `main`, run
  `git -C ~/projects/tools/claude pull --ff-only && ~/projects/tools/claude/sync.sh`.
  If the pull fails (e.g. uncommitted changes there), tell the user instead of
  forcing it.

## On task start (including after /clear)
- Run `git status` to check for uncommitted changes.
- If uncommitted changes exist, draft a commit message and offer to commit before proceeding.

## On task completion
- Automatically commit all changes without asking.
- Present the commit message inline so the user sees what was committed.

## When the user sounds satisfied
- If the user confirms, approves, or sounds happy with a change (e.g. "looks good", "perfect", "nice"), treat that as task completion and commit.

## Commit message format
Follow @shared/commit_message.md
