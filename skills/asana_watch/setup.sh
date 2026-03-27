#!/usr/bin/env zsh
set -euo pipefail

SKILL_DIR="${0:A:h}"

# --- Prerequisites ---
check_cmd() {
  command -v "$1" &>/dev/null || { echo "ERROR: $1 not found. Install with: $2"; exit 1; }
}

check_cmd bun "brew install oven-sh/bun/bun"
check_cmd cloudflared "brew install cloudflared"
check_cmd claude "https://code.claude.com/docs/en/getting-started"

# --- Environment ---
: "${ASANA_PAT:?Set ASANA_PAT to your Asana Personal Access Token}"
: "${ASANA_PROJECT_GID:?Set ASANA_PROJECT_GID to the project GID to watch}"

# --- Dependencies ---
if [[ ! -d "$SKILL_DIR/node_modules" ]]; then
  echo "Installing dependencies..."
  (cd "$SKILL_DIR" && bun install --no-summary)
fi

# --- Launch ---
echo "Starting Asana Watch channel..."
echo "  Project: $ASANA_PROJECT_GID"
[[ -n "${ASANA_USER_GID:-}" ]] && echo "  User filter: $ASANA_USER_GID"
echo ""

exec claude \
  --dangerously-load-development-channels server:asana-webhook \
  --mcp-config "$SKILL_DIR/.mcp.json"
