# Anchor vault — how to write cards here

This repo is a **card vault**: one Markdown file = one flashcard (Anchor Card Format v2).
You write and edit card files. Study apps only *read* cards and *append* to `data/reviews/<YYYY-MM-DD>.jsonl`.

This page is the part of the format you hit every day — deliberately short, because it is read at the
start of every session. It is **not** the whole format: the complete and only normative rules are in
`SPEC.md` (see the last line of this file). When something here is not enough, go there rather than
guessing.

## Never

- **Never change an existing `id`, and never reuse the id of a deleted card.** The id is the only key
  to a card's review history: changing it orphans that history, reusing it silently attaches the old
  history to a different question. Nothing in the vault can detect or undo either.
- **Never delete a card file.** Deleting a card requires human confirmation (`SPEC.md` §14). Report
  that a deletion is needed and stop there.
- **Never write inside `data/`.** `data/reviews/*.jsonl` (append-only review log) and
  `data/insights.json` are app-owned and read-only for you. Do not edit, sort, or prune them —
  entries for deleted cards are kept on purpose.
- **Never split a card in two to silence a warning**, and never look for a way to suppress a lint
  rule: there is none, per card or per vault.

## 1. Before you write — check what already exists

```bash
# every id in the vault. Your new id must not appear here:
# a duplicate id breaks BOTH cards (neither is scheduled).
grep -rh '^id: ' --include='*.md' . | sort

# does a card for this topic already exist? (two cards with the same
# title + front are flagged `duplicate-content`)
grep -rli 'bayes' --include='*.md' .

# mint a fresh id — ULID, 26 chars, time-sortable
python3 -c "import os,time;a='0123456789ABCDEFGHJKMNPQRSTVWXYZ';n=int(time.time()*1000)<<80|int.from_bytes(os.urandom(10),'big');print(''.join(a[(n>>s)&31] for s in range(125,-1,-5)))"
```

Then copy the layout of a neighbouring card. Default layout is `<Deck>/<Subdeck>/<id>.md`: the
**directory path is the deck**. There is no `deck:` key and no other way to override it — moving the
file is the only way to change a card's deck. If this vault already uses a different layout, follow
that one.

## 2. The shape of a card

````markdown
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAB
tags: [inference, exam]
---

# Ubiquitous

Used in what register?

<!-- hint -->
Latin *ubique*.

<!-- back -->
Present or found everywhere.

<!-- note -->
Seen in exam prose.
````

| Region | Starts | Ends | Missing |
|---|---|---|---|
| front | line after the title | first `hint`/`back` marker, or EOF | fine — a title-only question is normal |
| hint | after `<!-- hint -->` | `back` marker or EOF | fine (empty = warn) |
| back | after `<!-- back -->` | `note` marker or EOF | error, **unless `ask: false`** |
| note | after `<!-- note -->` | EOF | fine (empty = warn) |

**`ask: false` with no `<!-- back -->`** — the reference-card shape, and the one case where the table
above does not apply as written: the whole body after the title is the **`back`**, and **`front` is
absent**. That is deliberate, because `![[id]]` pulls in the target's `back` and nothing else; text
sitting in a `front` would never be inlined anywhere.

````markdown
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAC
ask: false
---

# Elements of a mistake of fact

1. …
2. …
````

Leading/trailing blank lines of each region are stripped; interior blank lines are kept.

## 3. The rules you trip over

**File** — `.md`, lowercase extension, no path segment starting with `_` or `.`, under 1 MiB. A file
is a card **iff** its frontmatter has `id`; every other `.md` (README, notes) is skipped silently.
*Exception, and the reason the examples on this page are fenced: a non-card file containing a line
that is exactly the back marker is an `id-missing` error.*

**Frontmatter is a fixed subset, NOT YAML.** Exactly `---` on the first line, ending at the next
exactly-`---` line. Allowed lines only: blank · `# comment` · `key: value` · `key:` followed by
`  - item` lines (exactly two spaces) · `key: [a, b]`. Values are **always strings** — `011`,
`2026-08-31`, `no` stay strings. Anything richer than that (block scalars, anchors, merge keys,
nested maps, tab indent, duplicate or uppercase keys) is an **error**, never ignored.

| Key | Meaning |
|---|---|
| `id` | required. `[A-Za-z0-9][A-Za-z0-9_-]{2,63}`, ASCII, no `#`. Fresh ULID or UUIDv7 recommended; a slug is legal. Never reuse a deleted id. |
| `tags` | list only. Non-empty strings, any script, no `,`. `tags: foo` (scalar) is an error. |
| `ask` | `true`/`false` literally. `false` = never studied, exists only as a `![[id]]` target. Not a pause switch. |
| `reverse` | `true` adds a second, reversed study item. |
| `format` | if present it must be `2`. |
| anything else | preserved and ignored; use `x-` for your own metadata. `deck` is one of these and does nothing. |

**Title** — the first non-blank line after the frontmatter must be `# Title`: column 0, one `#`, at
least one space, then text. Setext (`Title` / `====`) is not a title. The title is shown on **both**
sides, so **never put the answer in the title**. The one place it is hidden is the front of a
reversed *item* (`#r`); the same card's forward item still shows it, so the rule has no exception.

**Markers** — exactly three: `<!-- hint -->`, `<!-- back -->`, `<!-- note -->`. Byte-exact whole
lines, no leading or trailing spaces, each at most once, in that order. `<!--back-->`,
`<!-- Back -->`, or one trailing space is an **error**, not a near-miss. Any other `<!-- ... -->` line
is body text and is displayed literally.

**References** — a line whose entire content is `![[id]]` and nothing else. Expanded only inside
`back`, one level deep (the target's back is inlined under its title as a quote). In `front` it is a
warning (answer leak); `![[id|label]]`, `![[ id ]]` and mid-sentence `![[id]]` are literal text. Max
16 distinct references per card.

**Enumerations** — there is no in-card deletion syntax. A set the learner must produce whole is one
card whose back is the set; facts each recallable on their own are one card each, with anything they
share moved into an `ask: false` card the others reference.

**Fences** — ` ``` ` or `~~~`, 0–3 spaces of indent, closed by the same character. Inside a fence
*nothing* is interpreted: no markers, no references, no `$` counting. Four-space indented blocks are
**not** code to Anchor. Put any literal marker or reference syntax inside a fence.

**Text** — UTF-8, LF, no BOM. Math is `$...$` / `$$...$$` and a literal dollar must be `\$` (an odd
count of unescaped `$` warns). Images take relative paths only, resolved from the card's directory.
Raw HTML is escaped and shown as text.

**Length** — keep `back` under 1200 counted characters; fences, table rows and reference lines are
not counted. Fix a long back by **shortening** it or by extracting
shared text into an `ask: false` card. Never by splitting the card, never by changing an id.

## 4. After you write — lint (not optional)

Run the vault's linter over everything you touched before you report the work as done. **The exact
command is in `CLAUDE.md` at the vault root**, which is the only place it is written down. Exit 0 =
clean, exit 1 = at least one error.

Fix every **error**: an error card is dropped from the study queue and stops resolving as a `![[id]]`
target, so an unlinted card can silently never be studied. Fix warnings too, or state why you left
them.

If no linter is installed in this vault, say so explicitly in your report and walk §2–§3 against each
card you wrote — do not claim a card is verified when nothing verified it.

## 5. Editing an existing card

- Rewording, fixing a typo, reformatting, extracting part into a reference card → **keep the id**.
- Changing *what the card asks* → a new id plus deletion of the old file. **Report that; do not
  delete anything yourself** (`SPEC.md` §14).
- Deleting a card leaves its log entries as orphans. That is correct; leave them.

## 6. When it will not fit

Type-in answers, image occlusion, audio, cloze deletions, reference depth beyond one level and
`![[id|label]]` are not expressible in this format. **Stop and ask the human** instead of flattening
the material into prose, and never invent a frontmatter key with meaning (`x-` is yours).

---

**The complete rules are `SPEC.md`, the sole normative source for this format.** This page is a
working summary of it and adds no rules of its own; where the two differ, `SPEC.md` is right.
`SPEC.md` and `llms.txt` (the same rules compressed, with section numbers) live at
<https://github.com/topo122/anchor-card-format>, and ship inside the `anchor` plugin if it is
installed here.
