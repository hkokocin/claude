---
name: pull_request
description: Branch, commit, push, and open a PR for the current task. Determines commit type (Feature/Fix/Chore), writes a descriptive commit message, and creates a pull request with implementation context.
---
# Pull Request

Package the current work into a branch, commit, push, and open a pull request.

## Step 1: Context & Branch

1. Read the conversation history to identify:
   - The **task description** (what was implemented/fixed/changed)
   - The **commit type**: `Feature` (new behaviour), `Fix` (bug fix), or `Chore` (refactor, config, docs, tests)
   - Key **decisions** made during implementation
2. Run `git status`. If there are no changes (staged, unstaged, or untracked), stop — nothing to push.
3. Derive the branch name: `<type>/<short-slug>` (e.g. `feature/user-auth`, `fix/null-pointer`). Lowercase, hyphens, no special characters.
4. If already on a branch that matches the derived name, continue.
5. Otherwise, fetch origin and create the branch from `origin/main`.

## Step 2: Commit

1. Stage all changed and new files. Exclude secrets (`.env`, credentials).
2. Commit with message: `<Type>: <concise imperative description>` (e.g. `Feature: Add user authentication endpoint`). 

## Step 3: Push & PR

1. Push with `-u` to set upstream tracking. Do NOT use `--no-verify`.
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
3. Return the PR URL to the user.

## Constraints
- NEVER commit `.env` files or secrets.
- On error (auth failure, push rejected), stop and report.
