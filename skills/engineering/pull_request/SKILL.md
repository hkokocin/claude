---
name: pull_request
description: Use to commit, push and open or update the draft pull request of the current branch with its implementation context.
---
# Pull Request

Commit the current work, push it and open a draft pull request. With nothing to commit or push, say so and stop.

1. **Context.** From the conversation, take what was done, the commit type and the decisions made.
2. **Branch.** Stay on the current branch; an atui Agent's branch is its Task's Branch. Only on `main` (a session started by hand) create `<type>/<short-slug>` (e.g. `feature/user-auth`) from the freshly fetched `origin/main` with `--no-track`, so a push can't go to main.
3. **Commit** all changes with a message following @shared/commit_message.md.
4. **Push** and set the upstream.
5. **Pull request.** If one exists, the push updated it; report its URL. Otherwise create a draft:
   * title: the commit title
   * body: the Task Id first (`Task: atui/12`, omitted without a Task), then the bullets of @shared/commit_message.md, then a `## Decisions` section only for real trade-offs
6. Attach the pull request to the Task as a `github` Artifact (/atui) and give the user its URL.

On an error (auth, rejected push), stop and report it.

Don't merge here: merging goes through /squash_and_merge_pr, with the user's consent.
