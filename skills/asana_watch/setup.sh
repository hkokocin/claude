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
check_cmd gh "brew install gh"

# --- Environment ---
: "${ASANA_PAT:?Set ASANA_PAT to your Asana Personal Access Token}"

if [[ -z "${GITHUB_WATCH_REPOS:-}" ]]; then
  echo "NOTE: GITHUB_WATCH_REPOS not set. GitHub webhooks will be skipped."
  echo "      Set to comma-separated owner/repo values to enable (e.g. acme/api,acme/web)."
fi

# --- Dependencies ---
if [[ ! -d "$SKILL_DIR/node_modules" ]]; then
  echo "Installing dependencies..."
  (cd "$SKILL_DIR" && bun install --no-summary)
fi

# --- Launch ---
echo "Starting Event Watch channel (Asana + GitHub)..."
echo ""

cd "$SKILL_DIR"
exec claude \
  --dangerously-load-development-channels server:webhook-channel
