---
name: user_review
description: Let the user try the change on a locally running instance and merge it once they approve - the Agent's own change, or a Friend's that the Parent presents.
---
# User Review

## Goal

The user tries the change on a running instance and decides on the merge; the change is merged once they approve.

## Starts / ends

Starts after /review on your own change, or, as a Parent, on a Friend's Message (/atui, Friends). Ends with the merge and the app stopped, or when `github` resolves the merge Decision.

## Status

`review`, on the Task whose pull request it is (a Friend's Subtask for a Friend's change).

## Approval

The merge waits for the user's approval: the newest Choice on the merge Decision is Merge, or they approve in the session, which you record as that Choice before merging. Under Autopilot, the Parent reviews and merges a Friend's change itself (/autopilot).

## Instructions

1. **Start the app** (own change) locally on a free port. As an atui Agent, in a new detached window `app` of your own tmux session, so the user sees its logs.
   * backend against the dev database, frontend against the dev services;
   * a branch that brings migrations never touches dev: it runs on databases of its own (/agent_database), seeded with some data.

   A Friend starts its app the same way, in its own session, before it sends its Message.
2. **Present** it to the user: the pull request, the app URL, the curl file for backend work, what to try, what /review left open and which database it runs on. For a Friend's change, relay its Message.
3. **Merge Decision**, on the Stream of the Task whose pull request it is, so the waiting approval shows as an action for the user. aservice posts it when the pull request becomes ready for review (/atui, Approval requests): find the open Decision "Merge <PR title>?" from `github` and tell the user it is on the Stream. Only while there is none (aservice gets no events until the Relay is connected), post it yourself: a Decision titled "Merge <PR title>?" with the options Merge (recommended) and Request changes, its body what you tell the user, with the pull request and the app as links. When the user said in the session that you merge a Friend's pull requests on your own, post none for them.
   * **Every question on the Stream**: each point the user must decide before the merge, each open point from /review that needs a choice and each change you recommend before the merge is its own Decision, the recommendation marked, on the same Stream, posted before you ask it in the session. Points that need no choice stay in the merge Decision's body. Any other question for the user is posted as a Question first (/atui, Stream). The merge Decision's body names those Decisions ("Decide threads <id>, … first"); on aservice's request, whose body and options are fixed, say so in a Reply on it.
   * **One recommendation**: the Stream recommends what you recommend in the session. When you recommend a change before the merge, your own merge Decision recommends Request changes; on aservice's request, say so in your Reply.
4. **Changes** the user asks for (the Choice Request changes and their Replies on that Thread, or their words in the session) are recorded on the Stream (/atui, Stream) and go through /implementation and a local /acceptance_test again. For a Friend's change, send them to the Friend as a Message and post them on its Subtask; the user's answers reach you through the Friend's relay (/atui, Friends, Relay). Once the changes are pushed (by the Friend: once it reports them pushed), say so on the merge Decision's Thread and tell the user; they choose again on the same Decision.
5. **On approval**: /squash_and_merge_pr, then stop the app. A Friend's app stops when the Friend is retired. When `github` resolves the merge Decision, the pull request was merged or closed on GitHub: after a merge, stop the app and go on as after an approved merge; after a close, tell the user and wait.
