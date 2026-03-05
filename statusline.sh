#!/usr/bin/env bash

# ANSI colors
YELLOW="\033[33m"
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m"

input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name')
context_left=$(echo "$input" | jq -r '.context_window.remaining_percentage // 0')

pct=${context_left%.*}
pct=${pct:-0}

# Bar color: green >50%, yellow >20%, red otherwise
if [ "$pct" -gt 50 ]; then BAR_COLOR="$GREEN"
elif [ "$pct" -gt 20 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$RED"; fi

BAR_WIDTH=10
FILLED=$((pct * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=$(printf "%${FILLED}s" | tr ' ' '█')$(printf "%${EMPTY}s" | tr ' ' '░')

# Git: branch name and diff stats vs fork point (fallback to main)
branch=""
added=0
removed=0
if git rev-parse --git-dir > /dev/null 2>&1; then
  branch=$(git branch --show-current 2>/dev/null)
  base=$(git merge-base HEAD origin/main 2>/dev/null || echo "origin/main")
  diff_stat=$(git diff --numstat "$base" HEAD 2>/dev/null)
  if [ -n "$diff_stat" ]; then
    added=$(echo "$diff_stat" | awk '{ s += $1 } END { print s+0 }')
    removed=$(echo "$diff_stat" | awk '{ s += $2 } END { print s+0 }')
  fi
fi

if [ -n "$branch" ]; then
  printf '%b[%s]%b %s %b+%d%b %b-%d%b | 󰄉  %b%s%b %d%%\n' \
    "$YELLOW" "$model" "$RESET" \
    "$branch" \
    "$GREEN" "$added" "$RESET" \
    "$RED" "$removed" "$RESET" \
    "$BAR_COLOR" "$BAR" "$RESET" "$pct"
else
  printf '%b[%s]%b 󰄉 %b%s%b %d%%\n' \
    "$YELLOW" "$model" "$RESET" \
    "$BAR_COLOR" "$BAR" "$RESET" "$pct"
fi
