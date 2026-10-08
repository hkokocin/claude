---
name: user_review
description: Let the user try the change on a locally running instance and merge it once they approve.
---
# User Review

1. Set the Task's status to `review` (/task).
2. Start the app locally on a free port. As an atui Agent, start it in a new window `app` of your tmux session (`tmux new-window -d -t "=$(tmux display-message -p '#S'):" -n app '<command>'`), so the user sees its logs.
   * backend: against the **dev** database; frontend: against the **dev** services
   * a branch that brings migrations never touches dev: it runs against the Agent's own database (/agent_database), seeded with some data
3. Tell the user: the URL, the curl file for backend work, what to try, what /review left open, and which database it runs on.
4. Wait for the user's approval. Changes they ask for go through /implementation and a local /acceptance_test again.
5. On approval: file the Specification again if it changed since the last push (/task), /squash_and_merge_pr, then stop the app.
