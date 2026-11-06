---
name: atui
description: How an atui Agent works with its Task - the conversation, Messages, the Specification, the status per step, Artifacts, the Stream, Friends and Handover. Used by the /develop steps and by every Agent that spawns a Friend.
---
# atui

The Task is the atui Task the Agent was spawned on (`task()` shows it, with its Branch, Properties, Artifacts and Subtasks); a Friend's Task is its Subtask. It goes through the tools of the `atui` MCP server, which default to the Agent's own Task. Without a Task (e.g. a session started by hand), skip everything here.

Checking in, reporting Phases and asking to be retired are described in the Briefing and not repeated here.

## Conversation

The conversation with the user happens in two places: the Task's Stream, where the user keeps the overview of all Threads of a Task and its Subtasks, and the Agent's own session. Questions, Decisions, results and important updates for the user go on the Stream (see Stream); the working conversation stays in the session. What is decided in the session is recorded on the Stream: a Choice on its Decision with `choose`, or an Answer on its Thread. Never ask or report through the Orchestrator: it doesn't relay them. A Friend is the exception: it never talks to the user, only to its Parent, and relays to its Parent what the user does on its Subtask (see Friends).

* **Messages** from other Agents or the Orchestrator arrive as `atui message from <sender>`. Answer them with `send(to="<sender>", text)`: the Orchestrator is `orchestrator`, an Agent `<project>/<number>`.
* Send a Message of your own only when your Task says to coordinate with or inform another Agent, or to your Parent when your work is done or something it depends on changes: what it needs to continue, not a report of your conversation with the user.
* **Delivered Threads** are answered with `reply`, never with `send`, or with a Reaction where it says enough (see Stream).
* Don't answer a Message just to acknowledge it: where nothing beyond "noted" needs saying, say nothing. It is the same rule as on the Stream, where a Reaction does it (see Stream).

## Description and Specification

Both live on the Task, never in the repo, set with `update_task(description=…, specification=…)`, or when creating the Task with `create_task(project, title, description, specification)`:

* **Description**: 2-4 sentences for human readers, the `description` field of the Task; `task()` shows it above the Specification.
* **Specification**: the requirements, written for Agents, as markdown. Replace it as a whole; don't keep requirements anywhere else that might contradict it.

The structure and format of the Specification are in /specification.

Nothing else: where to start, what the Parent needs and that the Task was handed over go into the spawner's Instructions (/orchestrator).

With a breakdown, each Subtask holds its own Description and Specification, and the Parent Task keeps only its Description.

**Approval**: `task()` shows whether the Specification is approved. Once the user approved it in the session, record it with `approve()`, after the final Specification is on the Task; `unapprove()` withdraws it. The user may approve in the web UI instead; the Task's Agent then gets an approval Message, which counts the same. A Subtask written from an approved Specification is created approved: `create_task(..., approved=true)`; one created before the user approved is approved by its Parent afterwards with `approve(task="<project>/<number>")`. Any new version of the Specification clears the approval.

Once the approved Specification is on the Task, it is not replaced with `update_task` any more: a change is proposed as a Suggestion (see Stream), unless the user asks in the session to change it, or it is a Subtask's under Autopilot (/autopilot).

## Status

Set the Task's status at the start of each step (`update_task(status=…)`):

| Step | Status |
|---|---|
| /refinement | `refinement` |
| /implementation, /review | `implementation` |
| /user_review | `review` |
| /finish | `done` |

The Agent that finishes the work sets `done`, in every repo, once the dev test passed. Repos without a dev system (the user's own, owner `hkokocin`) have no dev test: there it is set right after the merge. A handed-over Task is set to `cancelled` (see Handover).

**A closed status retires the Agent**: setting `done` or `cancelled` (any closed status) makes atui retire the Task's living Agent, never forced. So set it on your own Task only as your very last act, after everything else is done and pushed. A Parent that sets a Subtask to `done` retires the Subtask's Friend this way. If the retire is refused for unsaved work, atui asks the user with a Retire Decision (see Stream).

A Friend sets its Subtask to `implementation`; its Parent sets the Subtask to `review` when it presents the Friend's pull request and to `done` after the dev test passed, or after the merge where there is no dev system (`update_task(status=…, task="<project>/<number>")`). The Parent Task moves to `refinement`, to `implementation` when the first Friend starts, and to `done` after the last Friend's change passed the dev test, or after its merge where there is no dev system.

## Artifacts

Attach every Artifact to the Task as soon as it exists: `attach(type, url, title)`, with the type `github` for a pull request, `figma` for a design, `google-doc` for a document, `asana` or `sentry` for a ticket or issue, otherwise `other`. A file in the worktree is attached with its path and `internal=True`. The link a Task was spawned from is already attached.

Each Task holds only its own Artifacts:
* **Own work**: attach the Artifacts of your own work to your own Task only: its pull request, the ticket created for it, its designs and documents.
* **A Subtask's Artifacts** stay on the Subtask: a Parent never attaches a Subtask's pull request, ticket or design to its own Task, whether a Friend works the Subtask or it is in another Project. Presenting a Friend's pull request, the Parent links it in the session and on the Stream instead.
* **Shared sources**: a source a Subtask shares with its Parent, the document or ticket the requirements come from, is attached to both (/specification).

## Stream

The Task's Stream is where the user keeps the overview of the Task in the web UI, so it holds everything important about the Task without mirroring the session. Every Thread the Agent posts has a title: `post(body, title=…)`. On it go:
* **Decisions** for the user: every choice is asked as a Decision, never as a plain question listing options. The body gives the context as you would give it in the CLI and the question; the options are each a title and its trade-off, with the recommendation marked: `post(body, title=…, question=True, options=[{"title": …, "detail": …, "recommended": True}, …], multiple=…)`, `multiple=True` when several may be chosen. The user chooses on the options; the Choice arrives as a delivered Thread (`chose:`). Nobody resolves a Decision, the Agent neither: choosing is its end (only `github` resolves its approval requests). The user may choose again (Change); the newest Choice counts. The approval of a pull request is asked as one too: "Merge <PR title>?" (see Approval requests). A choice the user made in the session is recorded on its Decision with `choose(thread, options)`, the 0-based indexes of the chosen options. When the user settles a Decision in its Replies with an answer none of its options names, append that answer as an option with `edit(thread, options=[…])`, the whole list with its options unchanged and the new one last, shaped as in `post`, record it with `choose`, and say so in your Reply on that Thread.
* **Questions** without options: `post(body, title=…, question=True)`. One the work is blocked on is also named in the session.
* **Results**, and what was decided with the user, each as it is made: a short Post, or the Answer on the Thread it settles.
* **Important updates**: a blocker, a deviation from the Specification, the result of a review.

**Waiting on the user**: whenever you wait on the user, an open Decision or question on the Task's Stream says what for, and the session names it too, for as long as the work can't go on without it, e.g. a failed deployment or dev test (/develop), a missing tier, a blocked merge. If nothing on the Stream asks it yet, post it before you wait. Waiting on a Friend or another Agent is no wait on the user. A Friend asks its Parent instead.

**Delivered Threads**: what others do on the Task arrives in the session as a Message `On <task> thread <id>, <who> posted a question: …` (or `posted:`, `replied:`, `replied with a decision:`, `resolved it:`, `reopened it:`, `chose:`, `edited it:`, `deleted it`, `deleted a Reply`, `approved:`, `moved thread <id> here`). Where an answer is due (see below), give it on the Thread with `reply(thread, body)`, never with `send`, which would start a new Message instead of answering the Thread. A Reply that settles a question Thread is its **Answer**: `reply(thread, body, decision=True)`. `approved:` is the user's ✅ on a message: it approves what that message proposes, as if the user had said so. The user resolves a topic's Thread once it is done; don't answer a resolve. A Parent gets the Threads of its Friend's Subtask relayed by the Friend and takes them up the same way (see Friends, Relay).

**A Reaction instead of a message**: never post or reply on the Stream where a Reaction says enough. What would only acknowledge, confirm receipt, record, agree or thank is a 👍 on what it would answer instead (`react(thread, "👍", reply=…)`): the user's Post or Reply, the Thread of a Choice, or the approved message. Typical cases:
* a Choice on a Decision (`chose:`);
* an approval (`approved:`);
* a thank-you or praise;
* a "test" or another message that needs no answer;
* a delivered edit that changes nothing for you.

A message is due only when it carries something the user doesn't know yet: a result, a consequence of the decision (e.g. the Subtasks it created), a question, a disagreement, or a correction of your reading. It says just that, without a preamble acknowledging the choice.

**Taking up a Post or Reply** of the user: put 👀 on it (`react(thread, "👀", reply=…)`) and title its Thread (`title(thread, title)`) unless it has a fitting title, both before working on it; take 👀 back (`unreact(thread, "👀", reply=…)`) after your Reply, or, when you find nothing to say, put 👍 in its place (`react(thread, "👍", reply=…)`) instead of a Reply. Topics can arrive while you work on another: take each up the same way and answer each on its own Thread.
* **A batch** of small requests in one Post: restate each, build them all and answer once in one Reply when done, with what you checked and what you didn't.
* **An ambiguous request** is read in the context of its Thread, acted on, and the reading stated in the Reply so the user can correct it.
* **A stray Post**: a new Post of the user that continues the topic of an existing Thread is moved into it with `move(thread, into)` before you take it up: it becomes the newest Reply of that Thread, and its own Thread is gone. Take up that Reply (👀, no new title) and answer there, saying that you moved it. When it isn't clear which topic it continues, leave it where it is and ask on its own Thread instead.

**Suggestions**: a change to the approved Specification is proposed with `suggest(text, replacement, body)`: `text` the text to replace, exactly as it is in the Specification, `replacement` the new text (empty deletes it), `body` why. The user accepts or rejects it in the web UI; wait for the decision (`On <task> thread <id>, <who> accepted it: …` or `… rejected it: …`) and go on with the Specification as it is then. Never accept your own Suggestions.

**Events**: an event Thread from `github` (`On <task> thread <id>, github posted: …`) tells about the Task's pull request as it happens: a review, a comment, checks, a push, a merge. You still look yourself where your steps say so; the event only tells you earlier. It names who caused it: Agents act on GitHub under the user's identity, so your own pushes, comments and merges come back naming the user. Recognise your own doing and move on. What to do, by kind:
* a review or comment by someone else: take it up as /review_comments says while in /review or /user_review; otherwise tell the user in the session.
* failed checks: look at the failing job and fix it while in /implementation, /review or /user_review; otherwise tell the user in the session.
* green checks, a review requested, a push, an edit, ready for review: note it only.
* merged outside your session: tell the user in the session and go on as /finish says after a merge; closed without a merge: tell the user and wait.

A Friend tells its Parent instead of the user. Never reply or react to an event Thread just to acknowledge it. The approval request is a Decision from `github` too, but no event Thread (see Approval requests).

**System events**: an event Thread from `atui` tells what happened to the machine or to the Agent's session: the machine went to sleep, woke up, went offline or came back online, or atui restored the session after the machine restarted. Only woke, online and restored are delivered, as `On <task> thread <id>, atui posted: The machine woke up …`, `… is back online …` or `… posted: atui restored the session of **<agent>** after the machine restarted. …`, restored only to the Agent that was restored; asleep and offline are on the Stream for the user only. On a delivered one, catch up and carry on:
* look again at what you were waiting on or working with, since GitHub events of the gap are lost: the Task's pull request (reviews, comments, checks, merge state), CI runs and the deployment; on restored also at your last reported Phase and your step, to tell whether you were interrupted;
* restart background waits that broke (`gh run watch`, Monitors);
* then carry on with the step you were in. On restored, only if you were interrupted: otherwise end your turn without a message. An Agent waiting on the user keeps waiting.

Never reply or react to the event Thread, a restored one included. What you found that the user needs to know goes on the Stream as usual. A Friend handles it the same way and doesn't relay it, since it comes from `atui`.

**Approval requests**: aservice asks for the user's approval of the Task's pull request itself once it becomes ready for review: a Decision from `github`, "Merge <pull request title>?", with the options Merge and Request changes, on every Task the pull request is attached to. Its Choices and Replies reach the Task's Agent and its Parent's Agent too; on a Friend's Subtask, what the user does on every other Thread reaches the Parent through the Friend's relay (see Friends, Relay). Agents post no merge Decision of their own while aservice does (/user_review).
* A Choice of Merge is the user's approval: the Agent that merges (the Task's own Agent, or the Parent for a Friend's Subtask) runs /squash_and_merge_pr. Under Autopilot the Parent chooses Merge on its Friends' requests itself (/autopilot).
* Request changes: the user's Reply on it says what; it goes through /implementation as /user_review says, for a Friend's Subtask passed on by the Parent as a Message to the Friend (see Friends). Once the fix is pushed, say so on the request's Thread; the user chooses again on the same Decision.
* Resolved by `github`: the pull request was merged or closed on GitHub; after a merge go on as /finish says, after a close tell the user and wait.

**Retire Decision**: when the retire that a closed status queued is refused for unsaved work, atui posts a Decision from `atui` on the closed Task, "Retire <project>/<number>?", with the command's message, and resolves it once the Agent is retired or the Task is reopened. On a Choice of:
* **Save**: commit and push what is worth keeping (ask on that Thread when you can't tell what is), then `request_retire()`.
* **Retire anyway** or **Keep the Agent**: nothing; atui retires you forced, or you stay.

## Designs

A **Design** is a Task's design of one screen, named after it (e.g. "Task Page"; unique per Task). It starts with up to three **Drafts**, letters A, B and C. A letter that was asked for and has no Draft yet is **pending**. Once the user accepts a Draft, it becomes **version 1**. The Agent publishes further versions, and the user approves one of them (**Approval**). The user **accepts**, **replaces** or **explores** a Draft, and may **reopen** an accepted Design that isn't approved: its current version becomes its letter's Draft again. /refinement proposes the Designs; `task()` shows each one with its Drafts and pending letters, or its version and Approval.

* **Propose a Draft**: `propose_draft(design, letter, title, path)` creates the Design with its first Draft. `title` is a few words naming the idea of the layout. `path` is the absolute path of the HTML file. A variant of an explored Draft also gets `variant_of="<letter>"`. A letter that already has a current Draft, or a Design already accepted, is refused.
* **Publish a version** of an accepted Design: `publish_design_version(design, path)`. A new version clears the Approval.
* **Threads on a Design**: `post(body, title=…, design="<name>")`, or `draft="<letter>"` too, for a Thread on one Draft, e.g. what a Draft tries out.
* **A Draft or version** is one self-contained HTML page, built with the project's design system: its colours, type, spacing and components, taken from the project's code (CSS variables, Tailwind config, component styles). The Service serves it with a sandbox CSP and no network. So the page inlines all of its CSS and scripts, and its fonts and images as `data:` URLs; anything it loads from elsewhere doesn't show. It holds realistic content from the domain, no lorem ipsum.
* **Files**: write Drafts and versions to your scratchpad, never into the repo, one file per Draft or version, e.g. `<scratchpad>/designs/task-page/v2.html`.
* **Read a Draft or version**: `design(design, version=<n>)` or `design(design, draft="<letter>")` saves its HTML to a file and returns the path, e.g. to start the next version from the current one. A Friend reads its Parent's Designs with `task="<parent project>/<number>"`.

**Messages about a Design**: what the user does on a Design reaches you as `On <task> design "<name>", <who> <what>`. Answer each by doing it, not with a Message or a Reply:

| `<what>` | What you do |
|---|---|
| `asked to replace draft B.` | Propose a new Draft for B with an idea of its own, distinct from the remaining Drafts and from the replaced one. |
| `explored draft A: draft variants of it for B and C.` | Propose a variant of A for each pending letter, with `variant_of="A"`. Each keeps A's idea and varies it in its own way (e.g. density, navigation, emphasis). |
| `reopened version 2: draft new drafts for B and C.` | The reopened version is now a Draft of its letter again. Treat it like a Replace of B and C: a new, distinct Draft for each pending letter. |
| `accepted draft A; it is version 1.` | Nothing. |
| `proposed draft A.` / `published version 2.` | Nothing: another Agent's doing, e.g. a Parent's. |
| `approved version 2.` / `unapproved version 2.` | Nothing beyond what /develop says about Approval. |

**Changes on a Design's Threads**: a Thread on a Design or a Draft arrives as an ordinary delivered Thread (see Stream). The Message doesn't name the Design; `thread(id)` does (`design: <name> · Draft <letter>`). `task()` tells whether the Design is still drafting or accepted. Take it up as any Post:
* on an accepted Design, a change the user asks for is made in a new version: write it to a new file, starting from the current version (`design(design, version=<n>)`). Publish it and reply on the Thread with the version and what changed;
* on a Draft, answer on its Thread. A Draft is never changed: the user replaces or explores it to get new ones, and what the Thread asks goes into those.

**Approval** of a Design works as the Specification's does. The user approves its current version in the Design mode of the web UI, and you get `approved version N.`, which counts the same. Once the user approved it in the session, record it with `approve_design(design)`. `unapprove_design(design)` withdraws it.

## Friends

A Friend is an Agent spawned by another Agent, its Parent, on a Subtask of the Parent's Task (`create_task` and `spawn`, see Spawning an Agent in /orchestrator). The user never talks to a Friend; the Parent does. The user may still act on the Subtask's Stream, e.g. choose on a Decision the Parent posted there; the Friend relays it to the Parent (see Relay).

**When**: `small` and `medium` Tasks are implemented in the Agent's own conversation. A `large` Task is always implemented by a Friend: one for the whole Task, or one per Subtask of a breakdown. Every Subtask is worked by a Friend. Work in another repo is always a Subtask (see Work in other Projects).

**The Parent** runs /refinement with the user, creates the Subtask(s) with the approved Specification, approved (`create_task(..., approved=true)`), and the `tier` property, and spawns the Friend on Opus with Instructions to start at /implementation and what it needs: `spawn("<project>/<number>", model="opus", instructions="The Specification is approved; start /develop at /implementation. Once /review is clean, send me (<parent project>/<number>) the one Message /develop describes, then wait for my Messages.")`. Where the Friend builds a screen of a Design, the Instructions also name each such Design and its approved version. The Designs stay on the Parent's Task, and the Friend reads them from there (see Designs). Their Messages reach only the Parent, so the Parent passes a Reopen or a newly approved version of such a Design on to the Friend as a Message. On the Friend's Message it sets the Subtask to `review` and (under Autopilot, as /autopilot says instead) presents the Message to the user in its own session (/user_review), with the pull request as a link in the session and on the Stream, never attached to its own Task (see Artifacts), relays the user's change requests to the Friend as Messages and records them on the Subtask's Stream, where the user's answers come back to it through the Friend's relay. On the user's approval it squash-merges (/squash_and_merge_pr), runs the dev test, sets the Subtask to `done` once it passed (right after the merge where there is no dev system), which retires the Friend; the Orchestrator removes the Friend's resources with /cleanup, as for every retired Agent. With a breakdown, the next Friend is spawned only then; a part the user locked in during the refinement gets its Friend right away (/refinement). The steps are in /develop.

**The Friend** runs /implementation and /review, keeps the curl collection current, starts the app for the user review in its own tmux `app` window and sends its Parent one Message: the pull request URL, the app URL, the curl file, what to try, what /review left open and which database the app runs on (/develop). Then it waits for Messages from its Parent and answers them, and relays what the user does on its Subtask (see Relay). It never talks to the user, and the user never talks to it.

**Relay**: what the user does on the Subtask's Stream is meant for the Parent, but atui delivers it to the Friend, the Subtask's Agent.
* **The Friend** forwards every delivered Message about its Subtask whose actor is `user` (`On <task> thread <id>, user …`, `On <task> design "<name>", user …`: a Post, question, Reply, Choice, approval, edit, resolve, Specification approval, anything) to its Parent unchanged: `send(to="<parent project>/<number>", text=<the Message as received>)`. It doesn't relay Messages about `github`'s Threads, the Threads `thread(id)` shows posted by `github` (aservice delivers the Choices and Replies on its approval requests to the Parent itself), nor Messages from Agents or `atui`. It does nothing else with a relayed Message: no Reply, no Reaction, no 👀, no title, no action on its contents; it acts only on its Parent's Messages.
* **The Parent** takes a relayed Message (from its Friend, starting `On <subtask> thread <id>, user …` or `design "<name>"`) as a delivered Thread of the Subtask, exactly as Stream says: Reaction, 👀 and title, `reply(thread, …)` on that Thread, never `send`, and acts on it; e.g. a Choice of Merge on the merge Decision runs /squash_and_merge_pr. It doesn't answer the Friend about it.

**Retire**: in the Friends flow, setting the Subtask to `done` retires the Friend (see Status). Retire a Friend whose Subtask stays open only with `retire(agent)`, only your own Friends, and only when the user asked for it or agreed to it.

## Handover

An Agent that finds its Task belongs to another Project creates a Subtask there (`create_task(<other project>, title, description, specification)`) with its Task and everything it learned, spawns a Friend on it on Opus (`model="opus"`) with Instructions saying that the Task was handed over and where to start, and then, as its last act, sets its own Task to `cancelled` (`update_task(status="cancelled")`), which retires it without waiting for the user. A Friend that got a Task handed over is not bound by the Friends flow: it works with the user from /refinement on like any Agent, since its Parent is gone. If your own Task was handed over to you, ask the user before handing it over again.

## Work in other Projects

If the Task needs work in another Project as well, create a Subtask there for that part, spawn a Friend on it on Opus and keep working on your own part. The Friend follows the Friends flow above: it sends you its one Message, and setting its Subtask to `done` after the merge retires it. Never ask it for reports.
