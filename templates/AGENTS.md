# Anchor vault — for agents writing cards here

This repository is an **Anchor card vault**: one Markdown file is one flashcard.

**Before writing or editing any card, read the format specification:**
<https://raw.githubusercontent.com/topo122/anchor-card-format/main/SPEC.md>
(also shipped as `SPEC.md` inside the `anchor` Claude Code plugin). It is the only place the format
is written down; this file deliberately repeats none of it. Do not write cards from memory.

## Never

- Never change an existing `id`, and never reuse the id of a deleted card.
- Never delete a card file — report that a deletion is needed and let a person do it.
- Never write anything under `data/` (the review log is the only copy of the history).
- Never split a card to silence a lint warning.

## This vault

<!-- Fill these in for your vault. Vault-specific conventions only — not format rules. -->

- Where new cards go:
- Deck naming:
- Tag conventions:
- Lint command: see `CLAUDE.md`

After writing, run the lint command and fix every error before reporting the work as done.
