@AGENTS.md

# Claude Code notes for this vault

## Lint — the command lives here and nowhere else

```bash
node <path-to>/anchor-card-format/lint/anchor-lint.mjs .   # exit 1 = at least one error
```

With the `anchor` plugin installed, cards are also linted right after each write. Replace the line
above with the command this vault really uses. If there is no linter, say so in your report.

## Working here

- Creating and editing cards is normal work — do it without asking. Deleting one is not.
- `data/` is never yours to write.
- Commit the cards you write; Git history is their backup.
