---
name: review_loop
description: Poll for PR review comments, process actionable ones, push fixes, and repeat. Stops after 30 minutes or when no actionable comments remain.
---
# Review Loop

Watch the current branch's PR for review comments, process them, push fixes, and repeat.

## Step 1: Identify the PR

1. Run `gh pr view --json number,url,headRefName` to find the PR for the current branch.
2. If no PR exists, stop and tell the user.
3. Note the PR number for subsequent steps.

## Step 2: Poll for comments (loop, max 30 minutes total)

Use `/loop 2m` to repeat the following cycle. Stop the loop after 30 minutes total (15 iterations).

### Each iteration:

1. Fetch unresolved review comments: `gh api repos/{owner}/{repo}/pulls/{number}/comments --jq '[.[] | select(.position != null or .line != null)]'`
2. Also check for PR review comments via `gh pr view {number} --comments`
3. **No comments found** → stop the loop. Report "No review comments found."
4. **Comments found** → proceed to Step 3.

## Step 3: Process comments

1. Run the `/review_comments` skill to analyse and triage the comments.
2. If `/review_comments` determines **no comments are actionable** → stop the loop. Report "No actionable comments."
3. If actionable comments were processed and code was changed → proceed to Step 4.

## Step 4: Push changes

1. Run `git push` to push the commits created by `/review_comments`.
2. Report which comments were addressed and what was pushed.
3. Return to Step 2 to wait for the next round of comments.

## Stop conditions (any one triggers exit)

- 30 minutes elapsed since the loop started.
- A poll finds zero unresolved comments.
- Comments exist but none are actionable.

## Constraints
- NEVER force-push.
- NEVER push secrets or `.env` files.
- On error, stop the loop and report.
