#!/bin/sh
# anchor-lint.sh — PostToolUse hook for the `anchor` plugin.
#
# After Claude writes or edits a Markdown file whose first line is `---` (an
# Anchor v2 card, SPEC.md §3), lint the vault it belongs to and feed back the
# ERRORS for that file. Everything else exits 0 in silence.
#
# The rules are not here: they are SPEC.md, and the linter is the reference
# implementation bundled at lint/anchor-lint.mjs.
#
#   0  nothing to say (not a card / no node / clean / warnings only)
#   2  this card has lint errors; stderr goes back to Claude to fix
#
#   ANCHOR_LINT_DISABLE=1           turn the hook off
#   ANCHOR_LINT_BASELINE=<file>     long-back baseline for this vault (SPEC.md §11)

set -u
[ "${ANCHOR_LINT_DISABLE:-0}" = "1" ] && exit 0
command -v node >/dev/null 2>&1 || exit 0

payload=$(cat 2>/dev/null) || exit 0
file=$(printf '%s\n' "$payload" | sed -n 's/.*"file_path"[ ]*:[ ]*"\([^"]*\)".*/\1/p' | head -n 1)
case "$file" in *.md) ;; *) exit 0 ;; esac
[ -f "$file" ] || exit 0
[ "$(head -n 1 "$file" | tr -d ' \r')" = "---" ] || exit 0

dir=$(dirname "$file")
root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null) || exit 0
rel=${file#"$root"/}

out=$(ANCHOR_LINT_QUIET=0 node "${CLAUDE_PLUGIN_ROOT}/lint/anchor-lint.mjs" "$root" 2>&1)
errors=$(printf '%s\n' "$out" | grep -F "✖ $rel" || true)
[ -n "$errors" ] || exit 0

{
  echo "Anchor lint: $rel has errors (rules: SPEC.md). Fix them before moving on:"
  printf '%s\n' "$errors"
} >&2
exit 2
