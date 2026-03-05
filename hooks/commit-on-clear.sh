#!/bin/bash
# Hook: auto-commit before /clear wipes context
# Triggered by SessionStart with "clear" matcher

CWD=$(cat | jq -r '.cwd // "."')
cd "$CWD" || exit 0

# Nothing to commit? Exit silently.
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  exit 0
fi

claude -p "Look at the current git diff and untracked files. Commit all changes following @shared/commit_message.md. Do not ask questions. Just commit." --allowedTools 'Bash(git:*) Read' 2>/dev/null
