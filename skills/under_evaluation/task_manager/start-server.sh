#!/usr/bin/env zsh
set -a && source ~/.env && set +a
exec bun /Users/hendrik/.claude/skills/task_manager/channel-server.ts
