---
name: squash_and_merge_pr
description: Squash-merge a PR with a release-note-quality commit message. Checks mergeability, drafts a prefixed title with key requirements, and waits for user approval before merging.
---
# Squash and Merge PR

Squash-merge the current branch's PR into main with a clean, release-note-quality commit message.

## Step 1: Check preconditions are met Identify the PR

* check if the branch can be merged. If not tell the user why (e.g. merge conficts, missing approval)
1. Run `gh pr view --json number,title,body,headRefName,baseRefName` to get the current branch's PR.
2. If no PR exists for this branch, stop and tell the user.

## Step 2: Check Mergeability

1. Run `gh pr checks` to verify all status checks pass.
2. Run `gh pr view --json mergeable,mergeStateStatus,reviewDecision` to check:
   - **Merge conflicts**: if `mergeable` is not `MERGEABLE`, stop and report.
   - **Review approval**: if `reviewDecision` is `CHANGES_REQUESTED` or required approvals are missing, stop and report.
   - **Blocked status**: if `mergeStateStatus` is `BLOCKED`, stop and explain why.
3. If the PR cannot be merged, report the specific reason and stop.

## Step 3: Draft Commit Message

The commit message must read like a release note entry.

1. Ingest the changes made in the PR
2. Follow @shared/commit_message.md

## Step 4: User Approval

1. Present the drafted title and body to the user.
2. **Wait for explicit approval** before proceeding. Accept edits.

## Step 5: Merge

1. Squash-merge using: `gh pr merge --squash --subject "<title>" --body "<body>"`
2. Confirm the merge succeeded and report the merge commit.
3. Do NOT delete the remote branch — GitHub handles that via repo settings.
4. Do NOT switch branches or pull locally.

## Constraints
- NEVER merge without user approval of the commit message.
- NEVER force-merge or bypass checks.
- NEVER delete branches.
- On error, stop and report.
