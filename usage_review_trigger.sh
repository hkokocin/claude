#!/usr/bin/env bash
#
# usage_review_trigger.sh — SessionStart / UserPromptSubmit hook of the
# Orchestrator session. When the weekly usage runs ahead of the week (weekly_all
# at 50 percent or more while less than half of its 7-day window has elapsed),
# it prints one line telling the Orchestrator to spawn a usage review, once per
# window. Otherwise, and when the usage can't be read, it prints nothing.
#
# For checking the condition by hand:
#   USAGE_REVIEW_USAGE_JSON  the usage API response to use instead of the API
#   USAGE_REVIEW_NOW         the current time, ISO 8601 (e.g. 2026-10-07T16:00:00Z)

[ "${ATUI_ROLE:-}" = "orchestrator" ] || exit 0

STATE="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/usage_review_trigger.state"

usage="${USAGE_REVIEW_USAGE_JSON:-}"
if [ -z "$usage" ]; then
  if [ "$(uname)" = "Darwin" ]; then
    credentials="$(security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null)"
  else
    credentials="$(cat "$HOME/.claude/.credentials.json" 2>/dev/null)"
  fi
  token="$(printf '%s' "$credentials" | python3 -c 'import json, sys; print(json.load(sys.stdin)["claudeAiOauth"]["accessToken"])' 2>/dev/null)" || exit 0
  usage="$(curl -sf --max-time 5 https://api.anthropic.com/api/oauth/usage -H "Authorization: Bearer $token" -H "anthropic-beta: oauth-2025-04-20" 2>/dev/null)" || exit 0
fi

# prints the resets_at of the weekly_all window when it runs ahead of the week
ahead="$(printf '%s' "$usage" | USAGE_REVIEW_NOW="${USAGE_REVIEW_NOW:-}" python3 -c '
import json, os, sys
from datetime import datetime, timedelta, timezone

now = os.environ["USAGE_REVIEW_NOW"]
now = datetime.fromisoformat(now) if now else datetime.now(timezone.utc)
for limit in json.load(sys.stdin)["limits"]:
    if limit["kind"] == "weekly_all":
        elapsed = timedelta(days=7) - (datetime.fromisoformat(limit["resets_at"]) - now)
        if limit["percent"] >= 50 and elapsed < timedelta(days=3.5):
            print(limit["resets_at"])
' 2>/dev/null)" || exit 0

[ -n "$ahead" ] || exit 0
[ "$(cat "$STATE" 2>/dev/null)" = "$ahead" ] && exit 0
printf '%s\n' "$ahead" > "$STATE"
echo "The weekly usage runs ahead of the week: create a Task \"Usage review\" in the claude Project and spawn an Agent on it with the Instructions \"Start with /usage_review\"."
