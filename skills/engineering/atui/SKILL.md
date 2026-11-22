---
name: atui
description: Use whenever working as an atui Agent on a Task, e.g. its Stream, Specification, status, Artifacts, Friends or Handover.
---
# atui

The Task is the atui Task the Agent was spawned on; a Friend's Task is its Subtask. The atui tools default to it. Without a Task (e.g. a session started by hand), skip everything here.

Checking in is described in the Briefing; reporting Phases and asking to be retired in the tool descriptions. This skill adds the rules on top.

## Conversation

The conversation with the user happens in two places: the Task's Stream, where the user keeps the overview of all Threads of a Task and its Subtasks, and the Agent's own session. Questions, Decisions, results and important updates for the user go on the Stream (see Stream); the working conversation stays in the session. A Friend never talks to the user, only to its Parent (see Friends).

Besides the Tasks' Streams, every Project has a Stream of its own, for talking about the Project as a whole. Its Project Manager, `<project>/manager`, answers there (/project_manager): a third Role beside the Agents and the Orchestrator, which works on the Tasks, Projects and Agents of the Project's subtree and has no Task. What happens on a Task stays on the Task's Stream.

Messages to other Agents carry only what the receiver needs to continue. A Project Manager may send you a Message too, and you answer it with send to `<project>/manager` like any Message. Where nothing beyond "noted" needs saying, don't answer a Message at all; on the Stream a Reaction does that job (see Stream).

## Description and Specification

Both live on the Task, never in the repo:

* **Description**: 2-4 sentences for human readers.
* **Specification**: the requirements, written for Agents, as markdown. Replace it as a whole; keep no requirements elsewhere that might contradict it. Its structure and format are in /specification.

Nothing else goes there: where to start, what the Parent needs and that the Task was handed over go into the spawner's Instructions (/orchestrator).

With a breakdown, each Subtask holds its own Description and Specification, and the Parent Task keeps only its Description.

**Approval**: ask for it by requesting the approval of the Specification, not with a Post of your own: atui asks the user on the Stream for its newest version and resolves the question once that version is approved. Once the user approved the Specification in the session, record the approval, after the final Specification is on the Task. An approval the user gives in the web UI arrives as an approval Message and counts the same. A Subtask written from an approved Specification is created approved; one created before the user approved is approved by its Parent afterwards. Any new version of the Specification clears the approval.

Once approved, the Specification changes only through a Suggestion (see Stream), unless the user asks in the session to change it, or it is a Subtask's under Autopilot (/autopilot).

## Status

Set the Task's status at the start of each step:

| Step | Status |
|---|---|
| /refinement | `refinement` |
| /implementation, /review | `implementation` |
| /user_review | `review` |
| /finish | `done` |

The Agent that finishes the work sets `done` once the dev test passed. Repos without a dev system (the user's own, owner `hkokocin`) have no dev test: there `done` is set right after the merge. A handed-over Task is set to `cancelled` (see Handover).

A closed status (`done`, `cancelled`) retires the Task's living Agent, so on your own Task it is your very last act, after everything is pushed. A Parent that sets a Subtask to `done` retires the Subtask's Friend this way.

In the Friends flow: the Friend sets its Subtask to `implementation`; the Parent sets the Subtask to `review` when it presents the Friend's pull request and to `done` after the dev test passed (after the merge where there is no dev system). The Parent Task moves to `refinement`, to `implementation` when the first Friend starts, and to `done` after the last Friend's change passed the dev test (or its merge, without a dev system).

## Artifacts

Attach every Artifact to the Task as soon as it exists: pull requests, designs, documents, tickets, issues; a file in the worktree as an internal one. The link a Task was spawned from is already attached.

Each Task holds only its own Artifacts:
* **Own work**: its pull request, the ticket created for it, its designs and documents go on your own Task only.
* **A Subtask's Artifacts** stay on the Subtask, whether a Friend works it or it is in another Project. Presenting a Friend's pull request, the Parent links it in the session and on the Stream instead of attaching it.
* **Shared sources**: the document or ticket the requirements of a Subtask and its Parent come from is attached to both (/specification).

## Stream

The Stream is where the user keeps the overview of the Task in the web UI. It holds everything important about the Task without mirroring the session. Every Thread you post has a title.

**What goes on it**:
* **Decisions**: every choice for the user is asked as a Decision, never as a plain question listing options. The body gives only the context and the question; each option carries its own description and trade-off, the recommendation marked. A Decision ends with its Choice: nobody resolves it, the Agent neither (only `github` resolves its approval requests). The user may choose again; the newest Choice counts. A choice the user made in the session, or an answer they gave in a Decision's Replies, is recorded as the Choice on that Decision; when you append an answer as a new option, say so in your Reply there.
* **Questions** without options. One the work is blocked on is also named in the session.
* **Results**, and whatever was decided, agreed or changed in status with the user in the session, each as it happens: a short Post, or the Answer on the Thread it settles.
* **Important updates**: a blocker, a deviation from the Specification, the result of a review.
* **Session-only needs**: what only works in the session (a secret, a `!` command, a permission change) gets a Post "I need you in my session for X", so the user sees it on the Stream.

**How posts read**: short, outcome first, with a link to the result; other Threads referenced by title or link. Use structure where it helps: tables for comparisons that aren't options, bullets over prose, mermaid for flows (it renders on the Stream).

**Reading the Stream**: read the open Posts of your Task when you start (the Briefing says how), after a compaction and after a restore, and take up what is still due.

**Waiting on the user**: a turn that waits on the user ends with an open question or Decision on the Stream saying what for, and the session names it too, for as long as the work can't go on without it, e.g. a failed deployment or dev test (/develop), a missing tier, a blocked merge. If nothing on the Stream asks it yet, post it before you wait: atui tells from the Stream that you wait on the user. Your Phase names what you wait on ("Merge of PR #65", "CI run of PR #65", "Friend claude/33"); waiting on a Friend or another Agent is no wait on the user. A Friend asks its Parent instead.

**Resolving**: resolve your own question once it is answered or acted on, and a user's Post once its request is done. Decisions are not resolved (see above). Don't answer a resolve.

**Delivered Threads**: what others do on the Task arrives in the session as a Message about the Thread. Where an answer is due, give it as a Reply on that Thread; a Reply that settles a question is its Answer. `approved:` is the user's ✅ on a message: it approves what that message proposes, as if the user had said so. A Parent gets the Threads of its Friend's Subtask relayed by the Friend and takes them up the same way (see Friends, Relay).

**A Reaction instead of a message**: where a message would only acknowledge, confirm receipt, record, agree or thank, put 👍 on what it would answer instead: the user's Post or Reply, the Thread of a Choice, or the approved message. Typical cases: a Choice (`chose:`), an approval (`approved:`), a thank-you or praise, a "test", an edit that changes nothing for you. A message is due only when it carries something the user doesn't know yet: a result, a consequence (e.g. the Subtasks a Choice created), a question, a disagreement, or a correction of your reading. It says just that, without a preamble acknowledging the choice.

**Taking up a Post or Reply** of the user: before working on it, put 👀 on it and title its Thread unless it has a fitting title. After your Reply, take 👀 back; when you find nothing to say, put 👍 in its place instead of a Reply. Topics can arrive while you work on another: take each up the same way and answer each on its own Thread.
* **A batch** of small requests in one Post: restate each, build them all and answer once in one Reply when done, with what you checked and what you didn't.
* **An ambiguous request** is read in the context of its Thread, acted on, and the reading stated in the Reply so the user can correct it.
* **A stray Post** that continues the topic of an existing Thread is moved into it before you take it up; take up the moved Reply there (👀, no new title) and say in your answer that you moved it. When it isn't clear which topic it continues, leave it and ask on its own Thread.

**Suggestions**: a change to the approved Specification is proposed as a Suggestion, and you go on with the Specification as it is after the user's decision.

**Events**: an event Thread from `github` tells about the Task's pull request as it happens: a review, a comment, checks, a push, a merge. You still look yourself where your steps say so; the event only tells you earlier. Agents act on GitHub under the user's identity, so your own pushes, comments and merges come back naming the user: recognise your own doing and move on. By kind:
* a review or comment by someone else: take it up as /review_comments says while in /review or /user_review; otherwise tell the user in the session.
* failed checks: fix them while in /implementation, /review or /user_review; otherwise tell the user in the session.
* green checks, a review requested, a push, an edit, ready for review: note it only.
* merged outside your session: tell the user in the session and go on as /finish says after a merge; closed without a merge: tell the user and wait.

A Friend tells its Parent instead of the user. Event Threads get no Reply and no Reaction.

**System events**: an event Thread from `atui` tells what happened to the machine or the session. Only "woke up", "back online" and "restored the session" are delivered; restored only to the Agent that was restored. On one, catch up, since GitHub events of the gap are lost:
* look again at what you were waiting on or working with: the pull request (reviews, comments, checks, merge state), CI runs, the deployment, and the open Threads of your Task;
* restart background waits that broke (CI watches, Monitors);
* carry on with the step you were in.

On restored, first tell from that look, your last Phase and your Task's status whether you were interrupted; a broken background wait counts. If not, end your turn without a message; an Agent waiting on the user keeps waiting. The event Thread gets no Reply and no Reaction; what the user needs to know goes on the Stream as usual. A Friend handles it the same way and doesn't relay it.

**Approval requests**: aservice asks for the user's approval of the Task's pull request itself once it is ready for review: a Decision from `github`, "Merge <pull request title>?", with the options Merge and Request changes, on every Task the pull request is attached to. Its Choices and Replies reach the Task's Agent and its Parent's Agent. Agents post no merge Decision of their own while aservice does (/user_review).
* **Merge** is the user's approval: the Agent that merges (the Task's own, or the Parent for a Friend's Subtask) runs /squash_and_merge_pr. Under Autopilot the Parent chooses Merge on its Friends' requests itself (/autopilot).
* **Request changes**: the user's Reply says what; it goes through /implementation as /user_review says, for a Friend's Subtask passed on by the Parent as a Message to the Friend. Once the fix is pushed, say so on the request's Thread; the user chooses again on the same Decision.
* **Resolved by `github`**: the pull request was merged or closed on GitHub; after a merge go on as /finish says, after a close tell the user and wait.

**Retire Decision**: when the retire a closed status queued fails, atui asks "Retire <project>/<number>?" on the closed Task, with Try again and Keep the Agent. Do nothing on either Choice.

## Designs

A **Design** is a Task's design of one screen, named after it (e.g. "Task Page"). It starts with up to three **Drafts**, letters A, B and C; a letter asked for without a Draft yet is **pending**. The Draft the user accepts becomes **version 1**; the Agent publishes further versions, and the user approves one of them. The user **accepts**, **replaces** or **explores** a Draft, and may **reopen** an accepted Design that isn't approved: its current version becomes its letter's Draft again. /refinement proposes the Designs.

* **A Draft's title** is a few words naming the idea of its layout.
* **A Draft or version** is one self-contained HTML page built with the project's design system: its colours, type, spacing and components, taken from the project's code (CSS variables, Tailwind config, component styles). atui serves it under a sandbox CSP with no network, so the page inlines all its CSS, scripts, fonts and images (`data:` URLs). It holds realistic content from the domain, no lorem ipsum.
* **Files**: write Drafts and versions to your scratchpad, never into the repo, one file per Draft or version, e.g. `<scratchpad>/designs/task-page/v2.html`.
* **A Friend** reads the Designs on its Parent's Task.

**Messages about a Design** (`On <task> design "<name>", <who> <what>`) are answered by doing it, not with a Message or a Reply:

| `<what>` | What you do |
|---|---|
| `asked to replace draft B.` | Propose a new Draft for B with an idea of its own, distinct from the remaining Drafts and the replaced one. |
| `explored draft A: draft variants of it for B and C.` | Propose a variant of A for each pending letter. Each keeps A's idea and varies it its own way (e.g. density, navigation, emphasis). |
| `reopened version 2: draft new drafts for B and C.` | Like a Replace of B and C: a new, distinct Draft for each pending letter. |
| `accepted draft A; it is version 1.` | Nothing. |
| `proposed draft A.` / `published version 2.` | Nothing: another Agent's doing, e.g. a Parent's. |
| `approved version 2.` / `unapproved version 2.` | Nothing beyond what /develop says about Approval. |

**Threads on a Design or Draft** arrive as ordinary delivered Threads and are taken up as any Post:
* on an accepted Design, a requested change is made in a new version, started from the current one in a new file; publish it and reply with the version and what changed;
* a Draft is never changed: answer on its Thread; the user replaces or explores it to get new ones, and what the Thread asks goes into those.

**Approval** of a Design works as the Specification's: request it for the Design, and an approval in the web UI arrives as `approved version N.` and counts the same; one given in the session is recorded by you.

## Friends

A Friend is an Agent spawned by another Agent, its Parent, on a Subtask of the Parent's Task (see Spawning an Agent in /orchestrator). The user talks to the Parent, never to a Friend. The user may still act on the Subtask's Stream, e.g. choose on a Decision the Parent posted there; the Friend relays it (see Relay).

**When**: `small` and `medium` Tasks are implemented in the Agent's own conversation. A `large` Task is always implemented by a Friend: one for the whole Task, or one per Subtask of a breakdown. Every Subtask is worked by a Friend. Work in another repo is always a Subtask (see Work in other Projects).

**The Parent** runs /refinement with the user, creates the Subtask(s) with the approved Specification, approved, with the `tier` property, and spawns the Friend on Opus. Its Instructions say: the Specification is approved, start /develop at /implementation, once /review is clean send the Parent the one Message /develop describes, then wait for the Parent's Messages. Where the Friend builds a screen of a Design, they also name each such Design and its approved version; the Designs stay on the Parent's Task, so the Parent passes a Reopen or a newly approved version on to the Friend as a Message.

On the Friend's Message the Parent sets the Subtask to `review` and presents the Message to the user in its own session (/user_review; under Autopilot, as /autopilot says), with the pull request linked in the session and on the Stream (see Artifacts). It relays the user's change requests to the Friend as Messages and records them on the Subtask's Stream. On the user's approval it squash-merges (/squash_and_merge_pr), runs the dev test and sets the Subtask to `done` once it passed (right after the merge without a dev system), which retires the Friend; the Orchestrator then removes its resources with /cleanup. With a breakdown, the next Friend is spawned only then; a part the user locked in during the refinement gets its Friend right away (/refinement). The steps are in /develop.

**The Friend** runs /implementation and /review, keeps the curl collection current, starts the app for the user review in its own tmux `app` window and sends its Parent one Message: the pull request URL, the app URL, the curl file, what to try, what /review left open and which database the app runs on (/develop). Then it waits for its Parent's Messages, answers them and relays (see Relay).

**Relay**: what the user does on the Subtask's Stream is meant for the Parent, but atui delivers it to the Friend.
* **The Friend** forwards every delivered Message about its Subtask whose actor is `user` (a Post, question, Reply, Choice, approval, edit, resolve, Specification approval, a Design Message, anything) to its Parent, unchanged. It doesn't relay Messages about `github`'s Threads (aservice delivers those to the Parent itself), nor Messages from Agents or `atui`. It does nothing else with a relayed Message: no Reply, no Reaction, no 👀, no title, no action; it acts only on its Parent's Messages.
* **The Parent** takes a relayed Message as a delivered Thread of the Subtask, exactly as Stream says (Reaction, 👀, title, Reply on that Thread), and acts on it; e.g. a Choice of Merge runs /squash_and_merge_pr. It doesn't answer the Friend about it.

**Retire**: setting the Subtask to `done` retires the Friend (see Status). A Friend whose Subtask stays open is retired only when the user asked for or agreed to it.

## Handover

An Agent that finds its Task belongs to another Project creates a Subtask there with its Task and everything it learned, spawns a Friend on it on Opus with Instructions saying the Task was handed over and where to start, and then, as its last act, sets its own Task to `cancelled`, which retires it without waiting for the user. A Friend that got a Task handed over is not bound by the Friends flow: its Parent is gone, so it works with the user from /refinement on like any Agent. If your own Task was handed over to you, ask the user before handing it over again.

## Work in other Projects

If the Task needs work in another Project as well, create a Subtask there for that part, spawn a Friend on it on Opus and keep working on your own part. The Friend follows the Friends flow: it sends you its one Message, and setting its Subtask to `done` after the merge retires it. Don't ask it for reports.
