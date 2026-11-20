# Where the flow with atui Agents breaks: session analysis

## Method and coverage

- **Sessions:** 302 atui Agent sessions on 293 Tasks, 2026-10-20 to 2026-11-20. They are all the `~/.claude/projects/-Users-hendrik--worktrees-*/*.jsonl` files whose first prompt is "You are the atui Agent …".
- **Messages in the data:**
  - 951 messages the user typed in a session, in 84 sessions.
  - 2644 messages delivered from the Stream, 1252 of them from the user: 503 replied, 322 chose, 181 posted, 81 resolved and 58 accepted.
  - 637 unique user posts and replies, on 74 Tasks.
- **Read-only atui calls:**
  - `tasks(open=true/false)`.
  - `threads(state="open")` on 6 recently finished Tasks: groundhog/4, agrigate/1, onca/7, awui/82, falcon/3 and atui/78.
  - Nothing was posted or reacted to.
- **Split around 11-04 13:46:** #29 made the Stream the only channel for every wait on the user. Several counts are given before and after it.
- **Limits:**
  - The Stream data covers what was delivered into sessions plus the 6 sampled Tasks. Posts that were never delivered are invisible.
  - "Open after the user acted" (D) is checked on the sample only, and the thread content was not read in full.
  - The categories come from keyword and regex matching plus manual reading of about 150 examples. Treat the counts as ±10–20%.
- **Scripts and data:** `extract.py`, `delivered.py`, `cat.py`, `ctx2.py`, `timelines.txt`, `human.json`, `delivered.json` and `stream_posts.json`, all in this directory.

## Headline

The move to the Stream worked.

| | User messages typed in sessions per week |
|---|---|
| w43 | 346 |
| w44 | 447 |
| w45 | 119 |
| w46 | 16 |
| w47 | 23 |

Before #29 there were 881 such messages, and only 70 after. The friction that is left falls into four groups:

1. **The agent's state is invisible** (C, A): background waits, dead sessions, questions asked only in the session.
2. **Things that can't go through the Stream by design** (B): secrets, `!` shell commands, permission changes.
3. **Agents don't read the Stream at start** (E).
4. **Threads are never closed** (D).

---

## A. The user had to step in or ask "status?"

### A1 "status?" nudges on the Stream
- **Count:** 12 posts after #29, plus about 8 related nudges ("are we done?", "is this done?", "what is 43 waiting for?"). Before #29 there were 19 status asks typed in sessions.
- **Examples:**
  - atui/78 thread 9538, 2026-11-20 16:07: "what are you waiting for?". The agent replied "Sorry, I asked only in my session". Its Phase had read "root cause told, waiting on fix choice" since 13:43, which is 2h24m of a wait that only the session could see.
  - terraform-beaver/3 8951, 11-19 13:22: "did you do anthing?". The reply was "The answer is in my session", and the Phase was "Answer presented to user".
  - awui/82 8555, 11-19 06:35: "status?". The Phase was "Friend 1/10 builds awui/84" and had not changed for 8.5h, across a night.
- **Probable causes:**
  - The question or result went into the session's final text, not into a `post`.
  - A Phase that says "waiting on X" carries no link to the thread that holds X.
  - Phases go stale across sleep and wake.

### A2 Restarting dead or stuck sessions
- **Count:** 38 API errors or expired-login stops in 20 sessions, 11 of them after #29. The user also typed recovery prompts: "looks like this session is crashed and was restored…" 3 times, plus "continue", "retry" and "please try again".
- **Examples:**
  - onca/7 8025, 11-18 07:53: the session sat on "Login reached its time limit · Please run /login" after the wake.
  - agrigate/1, onca/8 and onca/9, 11-18 06:55–07:33: the same login expiry in 3 sessions at once.
  - agrigate/2, 11-16: "please try again" after classifier errors.
- **Cause:** atui shows such a session as "waiting", just like an agent waiting on the user.

### A3 Telling agents about things that happened elsewhere
- **Count:** at least 6 posts like "#42 is merged", "160 is merged", "agrigate/10's pr has been merged" (groundhog/4 7739) or "deploy to prod successful" (7991).
- **Causes:**
  - GitHub events that happen during sleep are lost, as every wake event says.
  - Merges done in the GitHub UI or by teammates don't reach the agent.

## B. What was said only in the session

| Kind | Count | Examples |
|---|---|---|
| Secrets and tokens pasted ("paste them here only, not on the Stream") | 45 in 25 sessions, 18 in 10 after #29 | groundhog/4–11, agriverse/41, 44, 49, 51 |
| Shell commands the user had to run with `!` | 19, 10 in 4 sessions after #29 | falcon/3 9192 asks to run `aws --profile production s3 cp …` "with `!` in my session"; onca/8; terraform/4 |
| Permission or settings changes | refused when they came from the Stream | terraform/10, session ac1fbcd6, 11-20 13:28: "Your Choice reaches me only as a Message relayed by another session, and I don't change my own permission settings…". The user had to retype it in the session. |
| Classifier blocks on prod writes | several | terraform/4, 11-11 09:33: ECR push to prod |
| Results of research Tasks | ≥2 | falcon/1, session 551bae22, 11-16 19:34: "there is nothing on stream"; terraform-beaver/3 |
| Questions asked only in the session | ≥6 after #29 | atui/78, atui/72, zde/15, agriverse/44, terraform-beaver/3, and agrigate/10 7732 ("don't forget to write on stream") |
| Clipboard paste loops | 1 large | agriverse/48: about 25 rounds of "pasted, next" |

- **Cause:**
  - The harness treats relayed peer messages as non-consent, which is right for permissions.
  - Secrets must not land on the Stream.
  - Agents also still end their turn with a question in plain text, out of habit.

## C. Waits nobody could see

- **Count:** at least 9 clear cases after #29. In the `tasks()` output, the waiting reason "done" can't tell these apart:

  | What the agent waited on | Cases |
  |---|---|
  | a CI watch or script in the background | groundhog/4 7586, 11-16 15:23: "are you merging?". The CI watch was in the background and mentioned only in the session. |
  | a Friend | awui/82 8555 |
  | the user, without saying so on the Stream | atui/78 9538, zde/15 9498 |
  | nothing at all | atui/77 9509, 11-20 15:08: "Nothing; I paused … when I should have gone straight on". |
  | a Decision that didn't exist | groundhog/4 7757: "merge (there is no such decision on agrigate/16)" |
  | a hold the agent didn't announce | groundhog/4 7304, 11-16 11:25: "why don't you merge?". The agent held the PR on purpose without saying so. |

- **Cause:** the briefing says "atui sees whether you are working or waiting". But an idle session that waits on a background job, on a Friend, on the user or on nothing looks identical in atui.

## D. Threads left open after the user acted

- **Result in all 6 sampled Tasks:** after `done` and retire, every thread is still `open`. That includes event threads (Phase, sleep and wake, status), the agents' questions and the user's posts. Nothing gets resolved at the end of a Task.

| Task | Agent question threads still open | User posts still open |
|---|---|---|
| groundhog/4 | 8 (7424, 7426, 7524, 7590, 7696, 7707, 7852, 7872) | 10 |
| agrigate/1 | 6 (8282, 8283, 8303, 8592, 8702, 8724) | 0 |
| falcon/3 | 4 (8998, 9115, 9192, 9196) | 0 |
| awui/82 | 2 (8725, 8749) | 4 |
| onca/7 | 1 (8815) | 3 |
| atui/78 | 1 (9539) | 2 |
| **Total** | **22** | **19** |

- **Duplicates:** agrigate/1 8303 re-asks 8293 ("No approval request from GitHub has appeared … so I'm asking here instead"), and both stay open.
- **Unconfirmed:** I did not read every thread, so I don't know how many of the 22 got an answer inside the thread. All of these Tasks reached done, which suggests most were answered.
- **Noise:**
  - Sleep and wake events are posted to every open Task's Stream. Each sleep cycle appears 2× per Task.
  - Phase events are separate open threads, about 30 on groundhog/4 alone.

## E. Spawned agents missed Stream posts

- **Count:**
  - Of 103 sessions after #29 that made atui calls, only 25 read threads within their first 12 atui calls, and only 29 ever called `threads()`.
  - 2 explicit complaints:
    - atui/74, session 603a78c8, 11-12 08:26: "read the stream". The agent had missed Post 6409 and asked "Which permission dialogs?".
    - agriverse-admin/25, session 35cf2e22, 11-12 07:59: "the one I posted on stream. this is the first time you did not read it."
- **Cause:** `task()` returns no threads, and the briefing names only "Specification, Artifacts and Subtasks". Posts made before the spawn are never delivered.

## F. Other recurring friction

- **Stream posts too long:**
  - atui/77 9558: "simplify the request on stream. It's too much information."
  - groundhog/4 7872 and agrigate/1 8592 are full reports.
- **Thread references without a title or link:**
  - onca/10 9300: "what is thread 9286?"
  - groundhog/4 also guessed the link "https://atui/groundhog/4/thread/7812 … that link is a guess".
- **Where to see the result:** awui/93 9242: "Where can I view the result?". The app URL was in the session and the merge Decision only.
- **Autopilot Parent didn't act:** atui/77 9692: "you are in auto mode. do you approve the suggestions of aservice/50?"
- **Design updates not visible:** atui/77 9579: "I don't see any changes. please present them as new B and C".
- **Friend relay lost (before #29):** awui/71 5104: "73 is waiting for pr approval. I guess it did not reach you?"
- **Promised approval requests that didn't arrive:** agrigate/1 8303. The aservice request for #9167 never appeared, and the agent fell back to a question.

---

## Suggestions, ranked

### Instruction changes (cheap, do first)

1. **End every turn that waits on the user with a `post` or a question on the Stream, and never with a question in the final text.** Add a check to the atui skill: "Before you stop, if your last text asks something, post it". This targets A1, B (questions) and C. **Impact: high.**
2. **Read the open threads at spawn and after every compaction or restore.** Change the briefing to: "Read the Specification, Artifacts, Subtasks **and `threads(state=open)`**". This targets E. **Impact: high.**
3. **Name the wait in the Phase:** "waiting: CI of #305 (bg)", "waiting: Friend awui/84", "waiting: you on thread 9539". Name the thread as a link or title, never a bare number. This targets C and the thread references in F.
4. **Resolve your own question thread once it is answered, and resolve or 👍 user posts once acted on. At done, sweep `threads(state=open)` and resolve what is settled.** This targets D.
5. **Keep Stream posts short:** about 5 lines of decision context, with details behind a link or in a follow-up reply. Always include where to see the result (URL). This targets F.
6. **For things that can't go through the Stream** (secrets, `!` commands, permission changes): post on the Stream "I need you in my session for X". That makes the wait visible even though the action happens in the session. This targets B.
7. **Under autopilot, the Parent checks its Friends' open Suggestions and Decisions on every wake.** This targets atui/77 9692.

### atui and awui features

1. **A waiting reason that tells the waits apart:** user, a Friend, a background job, an API error or login, or idle with nothing open. A session sitting on an API error or "Please run /login" should show as broken and notify. This targets A2 and C. **Impact: high.**
2. **Include the open threads in `task()`**, or deliver missed posts at spawn. This targets E.
3. **Auto-resolve at done or retire,** or at least hide event threads (Phase, sleep and wake) from the open set. Post sleep and wake once per Stream, not per Task. This targets D.
4. **A Stream nudge when an idle agent's last turn ended with a "?" and no open question** exists for it. This targets A1.
5. **Replay missed GitHub events after wake** (merges and approvals), so the user doesn't have to post "#42 is merged". This targets A3.
6. **Thread links and titles in references,** so `thread 9286` renders as a clickable title in awui. This targets F.
7. **A secure secret hand-off** (an awui form that writes into a vault or env file the agent can read) to replace pasting in the session. This targets B.
8. **Permission changes from the Stream:** a route the harness accepts as consent, for example an awui action that edits settings directly. Today the agent rightly refuses relayed consent. This targets B.
