---
name: daily-sync
description: Generate a daily standup summary from Asana, GitHub, and Mattermost.
---
# Daily Sync

Generate a standup summary by pulling activity from Asana, GitHub, and Mattermost.

## Step 1: Determine Date Range

Compute the SINCE date. On Monday, cover the whole weekend (last Friday). Otherwise, use yesterday.

```bash
if [ "$(date +%u)" -eq 1 ]; then
  SINCE=$(date -v-3d +%Y-%m-%d)
else
  SINCE=$(date -v-1d +%Y-%m-%d)
fi
TODAY=$(date +%Y-%m-%d)
```

Store SINCE and TODAY for use in all subsequent queries.

## Step 2: Gather Data

Query all three sources **in parallel** using separate tool calls in a single turn.

### GitHub (gh CLI)

Run these commands (all use `--json` for structured output):

1. **My commits:**
   ```
   gh search commits --author=hkokocin --committer-date='>SINCE' --limit 50 --json repository,sha,commit
   ```

2. **PRs I authored (recently active):**
   ```
   gh search prs --author=hkokocin --updated='>SINCE' --limit 20 --json title,state,url,repository,updatedAt,reviewDecision
   ```

3. **Pending review requests for me:**
   ```
   gh search prs --review-requested=hkokocin --state=open --limit 20 --json title,url,repository,createdAt
   ```

4. **PRs I reviewed:**
   ```
   gh search prs --reviewed-by=hkokocin --updated='>SINCE' --limit 20 --json title,state,url,repository
   ```

### Asana (MCP tools)

Use the Asana MCP tools. If authentication is needed, prompt the user.

1. **Tasks completed since SINCE:**
   Use `asana_search_tasks` with `completed_on.after=SINCE` and `assignee.any=me`.
   Request fields: `name`, `permalink_url`, `completed_at`, `memberships.project.name`, `memberships.section.name`, `notes`.

2. **My incomplete tasks (for "today" section):**
   Use `asana_search_tasks` with `assignee.any=me`, `completed=false`, sorted by `due_on`.
   Request fields: `name`, `permalink_url`, `due_on`, `memberships.project.name`, `memberships.section.name`, `tags.name`, `notes`.

3. **Blocker detection:** From the incomplete tasks, flag any that:
   - Are in a section whose name contains "blocked" (case-insensitive)
   - Have a tag whose name contains "blocked" (case-insensitive)
   - Are past their `due_on` date

### Mattermost (REST API)

Read config from `~/.claude/skills/daily_sync/config.json`. The PAT is in the env var named by `token_env_var`.

If the config file is missing or the env var is unset, **skip Mattermost** and note it in the output.

When configured:

1. **Get my user info:**
   ```
   curl -s -H "Authorization: Bearer $PAT" "$SERVER/api/v4/users/me"
   ```

2. **Get my team memberships:**
   ```
   curl -s -H "Authorization: Bearer $PAT" "$SERVER/api/v4/users/{user_id}/teams"
   ```

3. **Search my posts since SINCE** (for each team):
   ```
   curl -s -H "Authorization: Bearer $PAT" -X POST "$SERVER/api/v4/teams/{team_id}/posts/search" \
     -d '{"terms": "from:{username}", "is_or_search": false, "time_zone_offset": 0, "after_date": "SINCE_AS_UNIX_MS", "before_date": "TODAY_AS_UNIX_MS"}'
   ```

4. **Get channel names** for any channels referenced in the posts:
   ```
   curl -s -H "Authorization: Bearer $PAT" "$SERVER/api/v4/channels/{channel_id}"
   ```

Summarise the topics discussed — don't list every message verbatim.

## Step 3: Cross-Reference & Group

1. Extract GitHub PR URLs (`github.com/.*/pull/\d+`) from Asana task `notes` fields.
2. Extract Asana task URLs from GitHub PR descriptions.
3. Group related items into **topics/stories** — e.g. if an Asana task links to a PR, present them together.
4. Items that don't cross-reference go into an "Other" group.

## Step 4: Identify Blockers

| Signal | Source | Label |
|---|---|---|
| PR open > 3 days, no review | GitHub (`createdAt`, no `reviewDecision`) | Awaiting review |
| PR with `CHANGES_REQUESTED` | GitHub (`reviewDecision`) | Changes requested |
| Review requested for me > 2 days ago | GitHub (pending reviews, `createdAt`) | Blocking others |
| Task in "Blocked" section or tag | Asana | Blocked task |
| Task past `due_on` | Asana | Overdue |

## Step 5: Format Output

Present the standup in this format:

```
# Daily Standup — YYYY-MM-DD

## What I did yesterday
### [Topic/Story Name]
- Completed: "Task title" (link)
- Merged PR: "PR title" (link)
- Discussed in #channel: summary of key points

### Other
- Committed: "commit message" in repo-name
- Reviewed PR: "PR title" (link)

## What I will do today
- [ ] Continue: "Unfinished task" (link) — due DATE
- [ ] Address review on: "PR title" (link)
- [ ] Review PR: "PR title" (link) — requested N days ago

## Blockers
- **Awaiting review**: PR "title" (link) — open N days
- **Changes requested**: PR "title" (link)
- **Blocked**: Asana task "title" (link)
- **Overdue**: Asana task "title" (link) — due DATE
```

If a section is empty, include it with "None" so the standup format is always complete.

## Constraints

- **Read-only** — never modify tasks, PRs, or posts.
- Never log, print, or expose credentials or tokens.
- If a source fails or is unavailable, report the error inline and continue with remaining sources.
- Keep the output concise — summarise Mattermost discussions, don't quote every message.
