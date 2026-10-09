#!/usr/bin/env bash
#
# Fixture checks for usage_review_trigger.sh. Run: ./usage_review_trigger_test.sh

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
failures=0

# usage JSON with weekly_all at <percent>, resetting at <resets_at> (default 2026-10-12T16:00Z)
usage() {
  printf '{"limits":[{"kind":"session","percent":90,"resets_at":"2026-10-09T15:50:00+00:00"},{"kind":"weekly_all","percent":%s,"resets_at":"%s"}]}' "$1" "${2:-2026-10-12T16:00:00.328034+00:00}"
}

# the window started 2026-10-05T16:00Z: day 2 is 2026-10-07, day 5 is 2026-10-10, half of it 2026-10-09T04:00Z
DAY_2="2026-10-07T16:00:00Z"
DAY_5="2026-10-10T16:00:00Z"
BEFORE_HALF="2026-10-09T03:59:00Z"
AFTER_HALF="2026-10-09T04:00:01Z"
NEXT_WINDOW_RESETS_AT="2026-10-19T16:00:00Z"
NEXT_WINDOW_DAY_2="2026-10-14T16:00:00Z"

configs=""
trap 'rm -rf $configs' EXIT

run() {
  ATUI_ROLE="$1" USAGE_REVIEW_USAGE_JSON="$2" USAGE_REVIEW_NOW="$3" CLAUDE_CONFIG_DIR="$config" "$HERE/usage_review_trigger.sh"
}

check() {
  name="$1"; expected="$2"; actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf 'ok   %s\n' "$name"
  else
    printf 'FAIL %s\n  expected: %s\n  actual:   %s\n' "$name" "$expected" "$actual"
    failures=$((failures + 1))
  fi
}

fresh() { config="$(mktemp -d)"; configs="$configs $config"; }

fresh
out="$(run orchestrator "$(usage 50)" "$DAY_2")"
case "$out" in *"Usage review"*"Start with /usage_review"*) fired=yes ;; *) fired=no ;; esac
check "fires at 50 percent on day 2" yes "$fired"
check "fires with one line" 1 "$(printf '%s' "$out" | grep -c .)"
check "stays silent for the same window twice" "" "$(run orchestrator "$(usage 60)" "$DAY_2")"

check "fires again in the next window" yes "$(run orchestrator "$(usage 50 "$NEXT_WINDOW_RESETS_AT")" "$NEXT_WINDOW_DAY_2" | grep -q "Usage review" && echo yes || echo no)"

fresh
check "fires just before half of the window" yes "$(run orchestrator "$(usage 50)" "$BEFORE_HALF" | grep -q "Usage review" && echo yes || echo no)"

fresh
check "stays silent just after half of the window" "" "$(run orchestrator "$(usage 50)" "$AFTER_HALF")"

fresh
check "stays silent at 50 percent on day 5" "" "$(run orchestrator "$(usage 50)" "$DAY_5")"

fresh
check "stays silent at 49 percent on day 2" "" "$(run orchestrator "$(usage 49)" "$DAY_2")"

fresh
check "stays silent outside the Orchestrator" "" "$(run agent "$(usage 50)" "$DAY_2")"

fresh
out="$(run orchestrator "not json" "$DAY_2")"; status=$?
check "stays silent when the usage can't be read" "" "$out"
check "exits 0 when the usage can't be read" 0 "$status"

exit "$failures"
