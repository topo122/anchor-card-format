@AGENTS.md

# Claude Code notes for this vault

`AGENTS.md` above is this vault's format page and applies to every agent. This file adds only what is
Claude-Code-specific, plus the one thing `AGENTS.md` deliberately does not carry: the lint command.

## Lint — the command lives here and nowhere else

```bash
anchor-lint .                # exit 0 = clean, 1 = at least one error, 2 = bad usage
anchor-lint . --strict       # warnings fail too
anchor-lint . --format json  # machine-readable {rule, severity, path, line, column}
```

Run it after **every** batch of cards you add or edit, not once at the end of a long session, and
report the counts you got.

If `anchor-lint` is not on PATH, look for the linter this vault actually uses (`Makefile`,
`package.json` scripts, `tools/`, `scripts/`, `node_modules/.bin/`) and **replace the block above
with the real command** — every other document points here for it, so this is the only place to edit.
If there is genuinely no linter here yet, say so in your report and hand-check each card against
`AGENTS.md` §2–§3; never report an unchecked card as verified.

## Working in this repo

- Use **Grep** (`^id: `, `--glob '*.md'`) and **Glob** rather than shelling out; a vault can hold 20k
  cards. The `grep -rh '^id: '` and `grep -rli` snippets in `AGENTS.md` are the same two searches
  written for agent tools that have no Grep — they are the equivalent, not a second instruction, so
  run the Grep version here and do not treat the difference as a conflict.
- Creating and editing card files is the normal work here — do it without asking. **Deleting one is
  not**: report that a deletion is needed and let the human do it.
- `data/` is never yours to write: never edit, move, `git rm`, or reformat anything under it.
  `data/reviews/*.jsonl` and `data/insights.json` are committed on purpose — they are the review
  history and the only copy.
- Git history is the backup for cards. Commit the cards you write; do not rewrite history to "fix" an
  id.
- When a request needs a construct the format cannot express (type-in answers, image occlusion,
  audio, cloze deletions, reference depth > 1, `![[id|label]]`), stop and ask rather than
  approximating.
- Markers are byte-exact whole lines. When you quote one in a commit message, an issue, or any `.md`
  file in this vault, keep it inline in backticks or inside a code fence — a stray whole-line back
  marker in a non-card file is an `id-missing` error.
