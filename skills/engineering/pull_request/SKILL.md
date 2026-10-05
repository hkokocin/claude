---
name: pull_request
description: Commit, push, and open a PR for the current task on its branch. Determines commit type (Feature/Fix/Chore), writes a descriptive commit message, and creates a pull request with implementation context.
---
# Pull Request

Package the current work into a commit, push it, and open a pull request.

## Step 1: Context & Branch

1. Read the conversation history to identify:
   - The **task description** (what was implemented/fixed/changed)
   - The **commit type**: `Feature` (new behaviour), `Fix` (bug fix), or `Chore` (refactor, config, docs, tests)
   - Key **decisions** made during implementation
2. Run `git status`. If there are no changes (staged, unstaged, or untracked), stop — nothing to push.
3. Stay on the current branch. An atui Agent already works on a branch named after its Task Id; never rename it or move the work to another branch.
4. Only on `main` (a session started by hand): fetch origin and create `<type>/<short-slug>` (e.g. `feature/user-auth`) from `origin/main` with `--no-track`.

## Step 2: Commit

1. Stage all changed and new files. Exclude secrets (`.env`, credentials).
2. Commit message following @shared/commit_message.md

## Step 3: Push & PR

1. Push with `git push -u origin HEAD`.
   - this triggers the project's quality gates (`pre-push` hook). Do NOT use `--no-verify`.
   - the hook may run the full test suite. Set the command timeout to 5 minutes to avoid premature failure.
2. Check if a PR already exists for this branch (`gh pr view`).
   - **PR exists**: report the PR URL. The push already updated it.
   - **No PR**: create one with `gh pr create`:
     - **Title**: the commit message
     - **Body**:
       ```
       ## Summary
       <1-3 sentences explaining what this change does and why>

       ## Decisions
       <Bullet list of notable implementation decisions or trade-offs. Omit section if none.>
       ```
3. Create PR as draft if it does not yet exist.
4. Return the PR URL to the user.

## Constraints
- NEVER commit `.env` files or secrets.
- On error (auth failure, push rejected), stop and report.
