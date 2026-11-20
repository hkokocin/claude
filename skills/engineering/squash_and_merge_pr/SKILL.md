---
name: squash_and_merge_pr
description: Squash-merge a PR with a release-note-quality commit message. Used for every pull request merge. Checks mergeability, drafts a prefixed title with key requirements, and merges with --admin once the user has approved in the session.
---
# Squash and Merge PR

Every pull request is merged through this skill: squash-merged into main with a release-note-quality commit message. Use the given PR number, else the current branch's PR; without a PR, stop and tell the user.

## Consent

Merge only with the user's consent in this session. That consent is the review approval; a GitHub review approval isn't needed. It counts as consent:
* the user approves the merge in the session,
* the user chooses "Merge" on the merge Decision on an atui Task's Stream (/user_review),
* under Autopilot (/autopilot), the user's approval of the Parent Task's Specification, for its Friends' pull requests.

Without consent, stop and ask.

## Mergeability

* CI checks must all pass; wait for running ones.
* Stop and report on merge conflicts or requested changes.
* A missing GitHub review (`REVIEW_REQUIRED`, merge state `BLOCKED`) is expected and no blocker: the admin flag bypasses it on purpose, because the user's consent replaced it. The admin flag never bypasses failing or pending CI checks.

## Commit message

A release note entry following @shared/commit_message.md, with the PR number appended to the title, e.g. `Feature: Add SSO login via SAML (#144)`.

## Merge

Squash-merge with `--admin`, passing title and body as subject and body. Run it as one standalone `gh pr merge` command, without pipes, `$(cat <<EOF)` or chained commands: only a pure `gh pr` command matches the allow rule, anything more sends the call to the permission classifier. Then confirm the state and merge commit in a separate call and report the merge commit.

Leave the remote branch to GitHub's settings and stay on the local branch (no switch, no pull). On an error, stop and report it.
