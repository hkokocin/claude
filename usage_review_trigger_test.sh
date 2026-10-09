#!/usr/bin/env bash
#
# Fixture checks for usage_review_trigger.sh. Run: ./usage_review_trigger_test.sh

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
failures=0

# usage JSON with weekly_all at <percent>, resetting at 2026-10-12T16:00:00Z
usage() {
  printf '{"limits":[{"kind":"session","percent":90,"resets_at":"2026-10-09T15:50:00+00:00"},{"kind":"weekly_all","percent":%s,"resets_at":"2026-10-12T16:00:00.328034+00:00"}]}' "$1"
}

# the window started 2026-10-05T16:00Z: day 2 is 2026-10-07, day 5 is 2026-10-10
DAY_2="2026-10-07T16:00:00Z"
DAY_5="2026-10-10T16:00:00Z"

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

fresh() { config="$(mktemp -d)"; }

fresh
out="$(run orchestrator "$(usage 50)" "$DAY_2")"
case "$out" in *"Usage review"*"Start with /usage_review"*) fired=yes ;; *) fired=no ;; esac
check "fires at 50 percent on day 2" yes "$fired"
check "fires with one line" 1 "$(printf '%s' "$out" | grep -c .)"
check "stays silent for the same window twice" "" "$(run orchestrator "$(usage 60)" "$DAY_2")"

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
