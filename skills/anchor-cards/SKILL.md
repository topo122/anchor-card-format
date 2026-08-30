---
name: anchor-cards
description: Write and repair Anchor Card Format v2 flashcards — one Markdown file per card, `id:` in frontmatter, a `<!-- back -->` marker, `![[id]]` references to shared `ask: false` cards. Use when creating cards, turning notes or a document into cards, editing or fixing an existing card, reviewing a card vault, or acting on feedback copied out of the Anchor study app. Anchor 形式の暗記カード（フラッシュカード）を作る・直すとき。
---

# Anchor cards

A **vault** is a Git repo of Markdown files; one file is one card. You write cards.
Study apps only *read* cards and *append* to `data/reviews/<YYYY-MM-DD>.jsonl`.

This skill is the **procedure**, plus the short list of actions that cannot be undone. It states no
*syntax* of its own — for that, read the documents in the order below and never answer a format
question from memory.

## Where the rules are

1. **`AGENTS.md` at the vault root** — the vault's own page. It wins for anything **vault-specific**:
   directory layout, deck naming, tag conventions, and which lint command this vault uses (which its
   `CLAUDE.md` names). It is a working summary, **not** a complete statement of the format: reverse
   items, the `back-too-long` counting rules, diagnostics and many edge cases are not in it. If the
   vault has no `AGENTS.md`, start at step 2 instead — and say so in your report, since nothing then
   pins down this vault's layout or lint command.
2. **`${CLAUDE_PLUGIN_ROOT}/llms.txt`** — the whole format compressed, with `SPEC.md` section numbers.
   Go here for any format rule `AGENTS.md` does not state.
3. **`${CLAUDE_PLUGIN_ROOT}/SPEC.md`** — the **sole normative source**. Consult it for edge cases and
   exact wording. If any other document — this skill, `llms.txt`, `AGENTS.md`, a README — disagrees
   with it, `SPEC.md` is right and the other document has a bug.

## Four mistakes that cannot be undone

1. **Changing an existing `id`, or reusing the id of a deleted card.** The id is the only key to that
   card's review history: change it and the history is silently orphaned, reuse it and the old
   history silently attaches to a different question. Nothing in the vault can detect or undo either.
2. **Deleting a card file.** Deleting a card requires human confirmation (`SPEC.md` §14). Report that
   a deletion is needed; never perform it.
3. **Splitting one card into two to silence a warning.** The second card needs a new id, so half the
   history is abandoned. Shorten the card, or move shared text into an `ask: false` card.
4. **Writing anything under `data/`.** `data/reviews/*.jsonl` and `data/insights.json` are the two
   paths the apps own. The log is append-only and the only copy of the history — never edit, sort,
   prune, or `git rm` anything there.

Everything else in this format is recoverable by editing a file. These are not.

## Writing a card

### 1. Look before you write

```bash
grep -rh '^id: ' --include='*.md' .        # every id in the vault — yours must be new
grep -rli 'bayes' --include='*.md' .       # does a card for this already exist?
```

In Claude Code use **Grep**/**Glob** instead of shelling out; a vault can hold 20k cards.

A duplicate id breaks **both** cards: neither is scheduled. Two cards with the same title + front is
a `duplicate-content` warning — edit the existing card and keep its id rather than adding a near
duplicate.

Then open a neighbouring card and copy its layout. Default is `<Deck>/<Subdeck>/<id>.md` — the
**directory path is the deck**, and there is no `deck:` key that could override it. If this vault
does something else, follow the vault.

### 2. Mint an id

A fresh ULID: 26 chars, time-sortable, so file order is creation order.

```bash
python3 -c "import os,time;a='0123456789ABCDEFGHJKMNPQRSTVWXYZ';n=int(time.time()*1000)<<80|int.from_bytes(os.urandom(10),'big');print(''.join(a[(n>>s)&31] for s in range(125,-1,-5)))"
```

No python3? `LC_ALL=C tr -dc '0123456789ABCDEFGHJKMNPQRSTVWXYZ' </dev/urandom | head -c 26` (random,
not sortable), or `uuidgen`. Check every minted id against step 1, and never reuse the id of a
deleted card.

### 3. Pick the shape

| The material is | Shape | Then |
|---|---|---|
| a question with one answer | basic | title + front + `back` |
| a term whose meaning you must recall | title-only | title is the question, front absent — this is normal, not a defect |
| a pair you must recall in both directions | `reverse: true` | adds one reversed item |
| a set the learner must produce whole | one card | the whole set is the `back`; do not scatter it |
| several facts, each recallable on its own | one card each | plus an `ask: false` card for whatever they share |
| text several cards need to share | `ask: false` | never studied; other cards pull it in with `![[id]]` |

One card asks one thing. If you cannot say what a card asks in a sentence, it is two cards — decide
that *before* it has an id and a history.

### 4. Write it

Start from the skeleton in `AGENTS.md` §2 (or a neighbouring card) and follow `AGENTS.md` §3 as you
write. Two things that are worth re-reading there every time, because they are the usual cause of a
rejected card: the **title/marker** rules (§3 — byte-exact marker lines, `# Title` first, the answer
never in the title) and the **`ask: false`** shape (§2 — with no `<!-- back -->` the whole body after
the title is the `back` and the `front` is absent).

If a rule you need is not in `AGENTS.md`, go to `llms.txt`, then `SPEC.md`. Do not improvise.

### 5. Lint before you report

Run the vault's linter over what you touched — the command is the one the vault's `CLAUDE.md` names.
Exit 0 = clean, 1 = at least one error. **Fix every error**: an error card is dropped from the study
queue and stops resolving as a `![[id]]` target, so an unlinted card can silently never be studied.

This plugin also lints each card right after you write it, but **only when a linter is installed**,
and it checks that file alone — vault-wide rules (`ref-unresolved`, `id-duplicate`,
`duplicate-content`) are not evaluated there. It is deliberately silent otherwise, so no output is
not evidence of a clean card. If nothing linted, say so in your report and hand-check against
`AGENTS.md`.

## Repairing a card

| The change | The id |
|---|---|
| reword, retitle, fix a typo, reformat, add a hint or note | **keep it** |
| shorten a long back, extract shared text into an `ask: false` card | **keep it** |
| change *what the card asks* | new id, and the old file must be deleted — **report it, do not do it** (`SPEC.md` §14) |

Prefer the smallest edit that fixes the actual complaint. A card that is hard to answer is usually
one that asks two things at once, or has a back that is a paragraph where it should be a line.

## Stop and ask instead of approximating

Type-in answers, image occlusion, audio, cloze deletions, reference depth beyond one level, and
`![[id|label]]` are not expressible. When the material needs one of them, stop and ask the human. Do
not flatten it into prose, and do not invent frontmatter keys with meaning — `x-` is the reserved
prefix for your own metadata.

## Checklist

- [ ] read `AGENTS.md` before writing, and `llms.txt` / `SPEC.md` for anything it does not cover
- [ ] id is fresh, never seen in this vault (including deleted cards), and untouched on every
      existing card
- [ ] file at `<Deck>/<Subdeck>/<id>.md`, matching the layout of its neighbours, with no `deck:` key
- [ ] each card asks exactly one thing, and the title does not contain the answer
- [ ] linter run and every error fixed, or the absence of a linter stated in the report
- [ ] nothing under `data/` was touched, and no card file was deleted
