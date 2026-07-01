#!/usr/bin/env bash
#
# sync.sh — project this config repo into the live Claude config dir.
#
# The repo organises entities into arbitrary, possibly multi-level, category
# subdirectories. Claude Code only discovers entities one level deep, so this
# script flattens each entity type into $TARGET via symlinks:
#
#   dir-based  (skills/)  leaf = nearest directory containing SKILL.md
#                         -> $TARGET/skills/<name>       -> repo leaf dir
#   file-based (agents/, rules/, shared/, commands/, output-styles/)
#                         leaf = a regular file
#                         -> $TARGET/<coll>/<basename>   -> repo leaf file
#   standalone (CLAUDE.md, settings.json, statusline.sh)
#                         -> $TARGET/<name>              -> repo file
#
# Only symlinks are created, and only dangling symlinks are pruned. Real files
# and real directories in $TARGET (runtime state, settings.local.json, ...) are
# never touched. Basename collisions within a collection abort the run.
#
# Compatible with bash 3.2 and BSD (macOS) find.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"

DIR_COLLECTIONS="skills"
FILE_COLLECTIONS="agents rules shared commands output-styles"
STANDALONE="CLAUDE.md settings.json statusline.sh"

fail() { printf 'sync: %s\n' "$*" >&2; exit 1; }

# link SRC -> DST, managing only symlinks; never clobber a real path.
link() {
  src="$1"; dst="$2"
  if [ -e "$dst" ] && [ ! -L "$dst" ]; then
    fail "refusing to overwrite real path: $dst"
  fi
  mkdir -p "$(dirname "$dst")"
  ln -sfn "$src" "$dst"
  printf '  link %s -> %s\n' "$dst" "$src"
}

# nearest dirs containing SKILL.md, without descending into a match
leaf_dirs() {
  find "$1" -type d -exec sh -c 'test -e "$1/SKILL.md"' _ {} \; -prune -print
}

assert_no_collisions() {
  coll="$1"; names="$2"
  dupes="$(printf '%s\n' "$names" | sed '/^$/d' | sort | uniq -d)"
  [ -z "$dupes" ] || fail "collision in $coll (duplicate names):
$dupes"
}

sync_dir_collection() {
  coll="$1"; root="$REPO/$coll"
  [ -d "$root" ] || return 0
  printf '[%s] (dir-based)\n' "$coll"
  leaves="$(leaf_dirs "$root")"
  assert_no_collisions "$coll" "$(printf '%s\n' "$leaves" | sed '/^$/d' | while read -r l; do basename "$l"; done)"
  printf '%s\n' "$leaves" | sed '/^$/d' | while read -r leaf; do
    link "$leaf" "$TARGET/$coll/$(basename "$leaf")"
  done
}

sync_file_collection() {
  coll="$1"; root="$REPO/$coll"
  [ -d "$root" ] || return 0
  printf '[%s] (file-based)\n' "$coll"
  files="$(find "$root" -type f ! -name '.DS_Store' -print)"
  assert_no_collisions "$coll" "$(printf '%s\n' "$files" | sed '/^$/d' | while read -r f; do basename "$f"; done)"
  printf '%s\n' "$files" | sed '/^$/d' | while read -r f; do
    link "$f" "$TARGET/$coll/$(basename "$f")"
  done
}

sync_standalone() {
  name="$1"
  [ -e "$REPO/$name" ] || return 0
  printf '[%s] (standalone)\n' "$name"
  link "$REPO/$name" "$TARGET/$name"
}

# remove only dangling symlinks under managed collection dirs; this reclaims
# links left behind by a delete, rename, or re-categorization.
prune_collection() {
  coll="$1"; dir="$TARGET/$coll"
  [ -d "$dir" ] || return 0
  find "$dir" -maxdepth 1 -type l | while read -r lnk; do
    if [ ! -e "$lnk" ]; then
      printf '  prune %s\n' "$lnk"
      rm "$lnk"
    fi
  done
}

printf 'sync: repo=%s target=%s\n' "$REPO" "$TARGET"
for c in $DIR_COLLECTIONS;  do sync_dir_collection  "$c"; done
for c in $FILE_COLLECTIONS; do sync_file_collection "$c"; done
for s in $STANDALONE;       do sync_standalone      "$s"; done
printf 'prune:\n'
for c in $DIR_COLLECTIONS $FILE_COLLECTIONS; do prune_collection "$c"; done
printf 'sync: done\n'
