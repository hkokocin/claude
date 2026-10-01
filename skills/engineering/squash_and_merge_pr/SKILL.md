---
name: squash_and_merge_pr [l]
description: Squash-merge a PR with a release-note-quality commit message. Checks mergeability, drafts a prefixed title with key requirements, and merges with --admin once the user has approved in the session.
---
# Squash and Merge PR

Squash-merge the current branch's PR into main with a clean, release-note-quality commit message.

## Step 1: Identify the PR and the user's consent

1. Run `gh pr view --json number,title,body,headRefName,baseRefName` to get the current branch's PR. If an argument is given, use that PR number.
2. If no PR exists for this branch, stop and tell the user.
3. The user must have approved the merge in this session. Their consent in the session is the review approval; a GitHub review approval is not required. Without consent in the session, stop and ask.

## Step 2: Check Mergeability

1. Run `gh pr checks` to verify all status checks pass. If checks are still running, wait until they finished.
2. Run `gh pr view --json mergeable,mergeStateStatus,reviewDecision` to check:
   - **Merge conflicts**: if `mergeable` is not `MERGEABLE`, stop and report.
   - **Changes requested**: if `reviewDecision` is `CHANGES_REQUESTED`, stop and report.
   - **Missing GitHub review**: `reviewDecision: REVIEW_REQUIRED` and `mergeStateStatus: BLOCKED` are expected and are not blockers. The user approved in the session; `--admin` bypasses this missing GitHub review on purpose.
   - **Failing or pending checks**: it is **NEVER** ok to bypass CI checks with `--admin`.
3. If the PR cannot be merged, report the specific reason and stop.

## Step 3: Draft Commit Message

The commit message must read like a release note entry.

1. Ingest the changes made in the PR
2. Follow @shared/commit_message.md
3. Append the PR number to the title in parentheses, e.g. `Feature: Add SSO login via SAML (#144)`.

## Step 4: Merge

1. Squash-merge with `--admin`, which bypasses the missing GitHub review that the user replaced with their consent in this session:
   `gh pr merge <number> --squash --admin --subject "<title>" --body "<body>"`
2. Run the merge as a single standalone command: no pipe to `tail`, no `$(cat <<EOF)`, no chained `git` commands. Only a pure `gh pr` command is resolved by the allow rule before the permission classifier; any extra segment sends the whole call to the classifier.
3. Confirm with a separate `gh pr view <number> --json state,mergeCommit` and report the merge commit.
4. Do NOT delete the remote branch — GitHub handles that via repo settings.
5. Do NOT switch branches or pull locally.

## Constraints
- NEVER merge without the user's consent in the session.
- NEVER use `--admin` to bypass failing or pending CI checks; it only bypasses the missing GitHub review.
- NEVER delete branches.
- On error, stop and report.
