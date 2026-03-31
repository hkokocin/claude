#!/usr/bin/env zsh
set -a && source ~/.env && set +a
exec bun /Users/hendrik/.claude/skills/asana_watch/channel-server.ts
