---
name: user_review
description: Let the user try the change on a locally running instance and merge it once they approve - the Agent's own change, or a Friend's that the Parent presents.
---
# User Review

Two cases: your own change, where you start the app yourself, or a Friend's change (/atui, Friends), where the Friend started the app and sent you its Message.

1. Set the Task's status to `review` (/atui); for a Friend's change, its Subtask (`task="<project>/<number>"`).
2. **Own change**: start the app locally on a free port. As an atui Agent, start it in a new window `app` of your tmux session (`tmux new-window -d -t "=$(tmux display-message -p '#S'):" -n app '<command>'`), so the user sees its logs.
   * backend: against the **dev** database; frontend: against the **dev** services
   * a branch that brings migrations never touches dev: it runs against the Agent's own database (/agent_database), seeded with some data

   A Friend starts its app the same way, in its own session, before it sends its Message.
3. Tell the user: the pull request, the URL, the curl file for backend work, what to try, what /review left open, and which database it runs on. For a Friend's change, relay its Message.
4. Wait for the user's approval. Changes they ask for are posted on the Task as decisions (/atui) and go through /implementation and a local /acceptance_test again; for a Friend's change, send them to the Friend as a Message and post them on its Subtask, and tell the user once the Friend reports them pushed.
5. On approval: /squash_and_merge_pr, then stop the app. A Friend's app stops when you retire the Friend after the dev test (/cleanup).
