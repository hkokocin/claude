---
name: pull_request
description: "Use to commit, push and open or update the pull request of the current branch: determines the type (Feature/Fix/Chore), writes the message and a description with the implementation context."
---
# Pull Request

Package the current work into a commit, push it and open a draft pull request. With nothing to commit or push, say so and stop.

1. **Context.** From the conversation, take what was done, the commit type and the decisions made.
2. **Branch.** Stay on the current branch; an atui Agent's branch is its Task's Branch, keep its name. Only on `main` (a session started by hand) create `<type>/<short-slug>` (e.g. `feature/user-auth`) from the freshly fetched `origin/main` without tracking it (`--no-track`), so a push can't go to main.
3. **Commit** all changes with a message following @shared/commit_message.md.
4. **Push** and set the upstream.
5. **Pull request.** If one exists, the push updated it; report its URL. Otherwise create a draft:
   * title: the commit title
   * body: the Task Id first (`Task: atui/12`, omitted without a Task), then the bullets of @shared/commit_message.md, then a `## Decisions` section only for real trade-offs
6. Attach the pull request to the Task as a `github` Artifact (/atui) and give the user its URL.

On an error (auth, rejected push), stop and report it.

Merging is not part of this skill: a pull request is merged only through /squash_and_merge_pr, with the user's consent.
