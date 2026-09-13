---
name: anchor-cards
description: Write and repair Anchor flashcards — one Markdown file per card with `id` and `deck` in frontmatter, a `<!-- back -->` marker, and `[[id]]` references. Use when creating cards, turning notes or a document into cards, editing or fixing an existing card, reviewing a card vault, or acting on feedback copied out of the Anchor study app. Anchor 形式の暗記カード（フラッシュカード）を作る・直すとき。
---

# Anchor cards

This skill is the **procedure**. It states no format rules: those are in
`${CLAUDE_PLUGIN_ROOT}/SPEC.md`, the only normative document.

## 0. Read the rules first

1. Read `${CLAUDE_PLUGIN_ROOT}/SPEC.md` in full before writing or editing a card in this session.
2. Read the vault's `AGENTS.md` / `CLAUDE.md` (and any skill the vault ships) for **vault-specific**
   conventions: where cards go, deck names, tags, house style, the lint command. Those may add
   conventions; they never override `SPEC.md`.

Never answer a format question from memory.

## Things that cannot be undone

1. Changing an existing `id`, or reusing the id of a deleted card — the history is orphaned or
   attached to the wrong question.
2. Deleting a card file — report that a deletion is needed; never perform it.
3. Splitting a card to silence a warning — half the history is abandoned.
4. Writing anything under `data/`.

## Writing

1. **Look first.** List ids in use (`^id: ` across `*.md`) and search for an existing card on the
   topic. If one exists, edit it and keep its id.
2. **Decide what each card asks** before anything gets an id (SPEC §12). One card, one question.
3. **Mint an id** per card — a ULID:
   ```bash
   python3 -c "import os,time;a='0123456789ABCDEFGHJKMNPQRSTVWXYZ';n=int(time.time()*1000)<<80|int.from_bytes(os.urandom(10),'big');print(''.join(a[(n>>s)&31] for s in range(125,-1,-5)))"
   ```
   Check it is not already in use.
4. **Write the file** following SPEC §2–§9. Copy the layout of neighbouring cards in the vault.
5. **Lint** the vault (the command in the vault's `CLAUDE.md`, or
   `node ${CLAUDE_PLUGIN_ROOT}/lint/anchor-lint.mjs <vault>`). Fix every error. The plugin hook also
   lints each card after it is written; silence from the hook is not proof, so run the linter.

## Repairing

| Change | `id` |
|---|---|
| reword, retitle, fix, reformat, add hint/note, shorten, extract shared text to an `ask: false` card | keep |
| change what the card asks | new card; the old file is deleted **by a person** — report it |

## Report

For each card: path, `id`, `deck`, and the lint result (or say plainly that no linter ran).
