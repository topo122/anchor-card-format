#!/bin/sh
# anchor-lint.sh — PostToolUse hook for the `anchor` plugin.
#
# After Claude writes or edits a file, lint it if (and only if) it is an Anchor
# card and this machine actually has a linter. Everything else exits 0 in
# silence. A vault with no linter installed, a repo that has nothing to do with
# Anchor, a machine without python3 or jq: all of them must behave exactly as if
# this hook did not exist. Silence is the contract.
#
# This hook reports; it never states format rules. The linter's own output
# already opens with the invariants (SPEC.md §17) and carries the fix text for
# every rule, so nothing here duplicates them — the output below is the
# linter's, with one line of context added.
#
# Exit codes:
#   0  nothing to say (not a card / no linter / clean / warnings only)
#   2  the card has lint ERRORS; stderr is fed back to Claude to fix them
#
# Escape hatches:
#   ANCHOR_LINT_DISABLE=1        turn this hook off entirely
#   ANCHOR_LINT="cmd with args"  use this command instead of autodetection;
#                                the card's path is appended as the last argument
#
# POSIX sh + awk only. No bashisms, no jq/python3 requirement.

set -u

[ "${ANCHOR_LINT_DISABLE:-0}" = "1" ] && exit 0

payload=$(cat 2>/dev/null) || exit 0
[ -n "$payload" ] || exit 0

# ---------------------------------------------------------------- file path --
# The hook payload is JSON on stdin; we want tool_input.file_path. Try a real
# JSON parser first, fall back to a regex that is good enough for a file path.
file=""
if command -v jq >/dev/null 2>&1; then
  file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || file=""
fi
if [ -z "$file" ] && command -v python3 >/dev/null 2>&1; then
  file=$(printf '%s' "$payload" | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    raise SystemExit(0)
p = (d.get("tool_input") or {}).get("file_path")
if isinstance(p, str):
    sys.stdout.write(p)' 2>/dev/null) || file=""
fi
if [ -z "$file" ]; then
  file=$(printf '%s\n' "$payload" |
    sed -n 's/.*"file_path"[ ]*:[ ]*"\([^"]*\)".*/\1/p' | head -n 1) || file=""
fi

[ -n "$file" ] || exit 0
case "$file" in
  *.md) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# ----------------------------------------------------------- is it a card? --
# A file is a card iff its frontmatter has an `id` key (SPEC.md §5). Anything
# else — README, notes, a blog post that happens to use YAML frontmatter — is
# skipped silently, exactly as a conforming client skips it. Frontmatter is
# `---` on the very first line (after an optional BOM) up to the next line that
# is exactly `---`.
#
# One deliberate addition: a file that opens with `---` and never closes it is
# also sent to the linter. Strictly it is not a card, but it is the shape of a
# card whose terminator was fumbled — `frontmatter-unterminated` is exactly the
# error worth catching one second after it is written, and no well-formed
# non-card file looks like this.
bom=$(printf '\357\273\277')
is_card=$(awk -v bom="$bom" '
  BEGIN { card = 0; fm = 0; closed = 0 }
  {
    line = $0
    sub(/\r$/, "", line)
    if (NR == 1) {
      if (index(line, bom) == 1) line = substr(line, length(bom) + 1)
      if (line != "---") exit
      fm = 1
      next
    }
    if (line == "---") { closed = 1; exit }
    if (line == "id:" || line ~ /^id:[ \t]/) { card = 1; exit }
  }
  END {
    if (fm && !closed && !card) card = 1
    print card + 0
  }
' "$file" 2>/dev/null) || exit 0
[ "$is_card" = "1" ] || exit 0

# -------------------------------------------------------------- the linter --
# Candidates, in order. The published binary is `anchor-lint`, so it comes
# first; an `anchor` wrapper with a `lint` subcommand is accepted after it for
# vaults that ship one. Nothing found => exit 0, print nothing.
project="${CLAUDE_PROJECT_DIR:-.}"
lint_from_env=""

if [ -n "${ANCHOR_LINT:-}" ]; then
  # shellcheck disable=SC2086
  set -- $ANCHOR_LINT
  if [ "$#" -gt 0 ] && command -v "$1" >/dev/null 2>&1; then
    lint_from_env=1
  else
    set --
  fi
fi

if [ -z "$lint_from_env" ]; then
  if command -v anchor-lint >/dev/null 2>&1; then
    set -- anchor-lint
  elif command -v anchor >/dev/null 2>&1; then
    set -- anchor lint
  elif [ -x "$project/bin/anchor-lint" ]; then
    set -- "$project/bin/anchor-lint"
  elif [ -x "$project/bin/anchor" ]; then
    set -- "$project/bin/anchor" lint
  elif [ -x "$project/scripts/anchor-lint" ]; then
    set -- "$project/scripts/anchor-lint"
  elif [ -x "$project/node_modules/.bin/anchor-lint" ]; then
    set -- "$project/node_modules/.bin/anchor-lint"
  elif [ -x "$project/node_modules/.bin/anchor" ]; then
    set -- "$project/node_modules/.bin/anchor" lint
  else
    exit 0
  fi
fi

# ------------------------------------------------------------------- run it --
# One run over the single file that was just written. The linter prints every
# severity regardless of --strict (--strict only changes its exit code), so one
# pass is enough and the exit code is not needed to find warnings.
#
# Why a single file and not the vault root: this fires after every Write/Edit,
# and re-scanning a 20k-card vault each time is not a per-keystroke cost worth
# paying. The price is that three rules cannot be evaluated here, because they
# compare a card against the REST of the vault, and a one-file lint has no rest:
#
#   ref-unresolved     the `![[id]]` target lives in another file, so a correct
#                      reference is reported unresolved every time
#   id-duplicate       needs a second card carrying the same id
#   duplicate-content  needs a second card with the same title + front
#
# They are dropped from this hook's output rather than shown, since here they
# say nothing true about the card. The vault-wide lint that the vault's
# CLAUDE.md names is what evaluates them, and the skill and commands require it
# before work is reported as done.
out=$("$@" "$file" 2>&1)
rc=$?
[ "$rc" -le 1 ] || exit 0

vault_only='ref-unresolved id-duplicate duplicate-content'

# Split the linter's human output into diagnostic blocks — a
# `path:line:col  severity  rule` header plus its indented body — keep the ones
# whose rule survives the filter, and re-emit them under the linter's own
# banner. The first line of awk's output is a machine-readable count so the
# shell can decide what to do without recounting.
filtered=$(printf '%s\n' "$out" | awk -v vault_only="$vault_only" '
  BEGIN {
    n = split(vault_only, drops, " ")
    for (i = 1; i <= n; i++) drop[drops[i]] = 1
    keep = 0; errs = 0; warns = 0; parsed = 0; seen = 0; nb = 0; nh = 0
  }
  /^[^ ].*:[0-9]+:[0-9]+  (error|warn|info)  [a-z][a-z0-9-]*$/ {
    parsed++
    seen = 1
    f = split($0, parts, "  ")
    sev = parts[f - 1]
    rule = parts[f]
    keep = (rule in drop) ? 0 : 1
    if (keep) {
      if (sev == "error") errs++
      else if (sev == "warn") warns++
      body[++nb] = $0
    }
    next
  }
  {
    if ($0 ~ /^    /) { if (keep) body[++nb] = $0; next }
    if ($0 == "") { if (keep) body[++nb] = $0; keep = 0; next }
    keep = 0
    if (!seen) head[++nh] = $0   # the linter banner, printed before any block
  }
  END {
    printf "#ANCHOR#%d#%d#%d\n", errs, warns, parsed
    if (errs + warns > 0) {
      for (i = 1; i <= nh; i++) print head[i]
      if (nh > 0) print ""
      for (i = 1; i <= nb; i++) print body[i]
    }
  }
') || exit 0

counts=$(printf '%s\n' "$filtered" | head -n 1)
errs=$(printf '%s' "$counts" | cut -d'#' -f3)
warns=$(printf '%s' "$counts" | cut -d'#' -f4)
parsed=$(printf '%s' "$counts" | cut -d'#' -f5)
report=$(printf '%s\n' "$filtered" | tail -n +2)

for n in "$errs" "$warns" "$parsed"; do
  case "$n" in
    ''|*[!0-9]*) exit 0 ;;
  esac
done

# A custom ANCHOR_LINT whose output we could not parse at all: pass its own
# output through unchanged rather than swallow a real failure.
if [ "$parsed" -eq 0 ]; then
  [ "$rc" -eq 1 ] || exit 0
  [ -n "$out" ] || exit 0
  printf '%s\n' "$out" >&2
  exit 2
fi

scope="(single-file check: ref-unresolved, id-duplicate and duplicate-content need the whole vault and were not evaluated here — run the vault lint before reporting this done.)"

if [ "$errs" -gt 0 ]; then
  printf '%s\n\n%s is excluded from the study queue until the errors above are fixed.\n%s\n' \
    "$report" "$file" "$scope" >&2
  exit 2
fi

# Warnings are advisory — the card is still studied — so they go back as
# context, never as a blocking exit 2.
[ "$warns" -gt 0 ] || exit 0

printf '%s\n\n%s is still studied with the warnings above; fix or explain them.\n%s\n' \
  "$report" "$file" "$scope" |
awk '
  function esc(s,   i, c, o) {
    o = ""
    for (i = 1; i <= length(s); i++) {
      c = substr(s, i, 1)
      if (c == "\\") o = o "\\\\"
      else if (c == "\"") o = o "\\\""
      else if (c == "\t") o = o "\\t"
      else if (c == "\r") o = o "\\r"
      else o = o c
    }
    return o
  }
  { msg = (NR == 1) ? esc($0) : msg "\\n" esc($0) }
  END {
    printf "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"%s\"}}\n", msg
  }
'
exit 0
