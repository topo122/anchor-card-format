# Anchor Card Format v2 — Specification

Status: **v2, in use.** This document is the **single source of truth** for the card format. Every
other document — the README, `llms.txt`, the vault templates, the plugin skill and commands, any
app's own notes, any vault's `CLAUDE.md` / `AGENTS.md` — may *point* here but MUST NOT restate the
rules. Where anything disagrees with this file, this file is right.

The key words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are used as in RFC 2119.

This document describes the format exactly as the Anchor apps read it (iOS, Android, macOS) and as
the reference linter checks it. Those implementations are held to one another by a shared test corpus
that runs in CI; a behaviour change in the format changes this file first.

---

## 1. Model

- A **vault** is a Git repository you own.
- A **card** is one Markdown file in it. One file, one card.
- **Cards are written by people and AI agents. Apps MUST NOT create, modify or delete card files.**
  Apps read cards and append a review log next to them (§10).
- A card's **`id`** is the only link between the card and its review history.

---

## 2. A whole card

```markdown
---
id: stat-sd-reading
deck: Statistics/Basics
tags: [descriptive]
---

# What standard deviation tells you

Two datasets have the same mean. Which single number says which one is more spread out?

<!-- back -->

**Definition** [[stat-sd-def]]

It has the same unit as the data, so it reads as "typically this far from the mean".

<!-- hint -->

Its size depends on the unit, so compare spreads across units with SD ÷ mean.

<!-- note -->

Source: any introductory statistics text.
```

The syntax is: a frontmatter block, a `# Title`, up to three marker lines, and `[[id]]` references.
Nothing else in the body is syntax.

---

## 3. Which files are cards

A file is read as a v2 card when **all** of these hold (paths are vault-relative, `/`-separated):

1. The file name ends in `.md`, is not `INDEX.md`, and does not start with `_`.
2. The file is inside **at least one directory** (files at the vault root are never cards — that is
   where `README.md`, `INDEX.md`, `CLAUDE.md` and `AGENTS.md` live).
3. No directory on the path starts with `_` or `.` (`_drafts/`, `.github/` are never read).
4. **The first line of the file, trimmed, is exactly `---`.**

Depth and file names are otherwise free. Apps MAY additionally decline to sync parts of a vault they
consider out of scope (large reference material, audio); such files are simply not cards to that app.

Files that fail rule 4 are not v2 cards. (The apps also read an older, heading-based **v1** layout
for vaults that predate v2. v1 is legacy, is not specified here, and MUST NOT be used for new cards.)

### Rationale

The first-line test is one condition, visible in any editor, and cannot collide with an ordinary note.

---

## 4. Frontmatter

Frontmatter is the lines between the first `---` and the next line that, trimmed, is `---`.
**If there is no closing `---`, the file yields no card** (it is unclear where syntax ends).
The body starts on the line after the closing `---`; later `---` lines are ordinary body text.

Frontmatter is **not YAML**. Each line is read like this:

- Trimmed blank lines and lines starting with `#` are ignored.
- Otherwise the line is split at its **first `:`**: the key is the trimmed text before it, the value
  the trimmed text after it. Lines without `:` are ignored.
- A value wrapped in a matching pair of `"` or `'` has the pair removed. No escapes are processed.
- A list is written **inline only**: `key: [a, b, c]`. Elements are split on `,`, trimmed, dequoted;
  empty elements are dropped. The block form (`- a` on following lines) is **not read**.
- If a key appears twice, the last one wins. Writers MUST NOT repeat keys.

### Rationale

Three independent implementations must read the same bytes the same way. A YAML library in each
would disagree on edge cases (`no`, dates, block scalars); four lines of rules do not.

---

## 5. Keys

| Key | Required | Meaning |
|---|---|---|
| `id` | **yes** | The card's permanent identity (§6). |
| `deck` | yes for writers | The study group, `/`-separated (§7). |
| `tags` | no | Inline list of strings, for filtering. |
| `ask` | no | `false` (case-insensitive) means the card is **never scheduled**; it exists to be pulled into other cards with `[[id]]`. Any other value, or no key, means `true`. |

Unknown keys are ignored by apps. Writers SHOULD NOT invent keys that are meant to change behaviour.

---

## 6. `id`

- MUST match `^[A-Za-z0-9][A-Za-z0-9-]{2,63}$` — 3 to 64 ASCII letters, digits and hyphens, not
  starting with a hyphen. **Case-sensitive.** Underscores are not allowed.
- **A file whose `id` is missing or malformed yields no card.** This is the one breakage readers do
  not recover from: without a key the review cannot be recorded, and inventing one would mix
  histories.
- The `id` is written to the review log **exactly as written** (§10). Implementations MUST NOT
  change its case or otherwise normalise it.
- A fresh **ULID** (26 characters, uppercase) is the recommended id for new cards; a readable slug
  (`stat-sd-01`) is equally valid. Both may coexist in one vault.
- **Never change an existing `id`, and never reuse the id of a deleted card.** Changing it orphans the
  history; reusing it attaches old history to a different question. Renaming, moving and rewriting
  the file are all safe.
- If two files carry the same `id`, readers keep **the first in ascending path order** and the linter
  reports `duplicate-id` (error).

---

## 7. `deck`

- `deck: A/B/C` — split on `/`, each part trimmed, empty parts dropped.
- The deck is **independent of the directory** the file sits in. Moving a file does not change its
  deck; editing `deck:` does. (The review history is keyed by `id`, so neither affects history.)
- If `deck` is absent or empty, readers fall back to the file's **directory path** (`Statistics/Basics/x.md`
  → `Statistics/Basics`). This fallback exists so that nothing is silently lost; the linter reports
  `missing-deck` (error), and writers MUST write `deck`.

---

## 8. Body

### 8.1 Title

The **title** is the first body line that, trimmed, starts with `# ` (one `#` and a space) and has
text after it. Writers MUST put it first, before any marker. When a card has no title, readers use
the file name without `.md` and the linter reports `missing-title` (warn).

The title line itself belongs to no face. It is shown with the card; **never put the answer in it.**

### 8.2 Markers and faces

There are exactly three markers. A line is a marker when, **trimmed**, it is exactly one of:

| Marker | Starts | Shown |
|---|---|---|
| *(none — the start of the body)* | **front** | the question |
| `<!-- back -->` | **back** | after the learner reveals the answer |
| `<!-- hint -->` | **hint** | with the back, after reveal: the way to reach the answer, a common trap |
| `<!-- note -->` | **note** | with the back, after reveal: context, caveats, sources |

- Text before the first marker is the front (minus the title line).
- Each marker switches the face for the lines that follow, until the next marker. Order is free;
  writers SHOULD use front → back → hint → note or front → hint → back → note.
- Leading and trailing blank lines of each face are removed; interior blank lines are kept.
- **`---`, emoji, tables, headings and code fences are ordinary body text.** They never split faces.
- Any other `<!-- ... -->` line is ordinary text.
- **A card with no `<!-- back -->`, or nothing after it, has an empty back.** Readers still load it;
  the linter reports `empty-back` (error). This applies to `ask: false` cards too — the back is what
  `[[id]]` pulls in.

### 8.3 Rendering

The body is Markdown. Apps render a common subset (paragraphs, emphasis, lists, quotes, tables, code);
anything they do not understand is shown as text. Apps MUST NOT execute HTML or scripts from a card.

---

## 9. References — `[[id]]`

A reference writes shared text once — typically a definition in an `ask: false` card — and shows it
inside every card that needs it.

- Syntax: `[[id]]`, where `id` matches §6. It may appear anywhere in a line.
- **Only references in the back are expanded.** Elsewhere they are shown as written.
- A back line containing references is rendered as:
  1. the line with every `[[id]]` removed and spaces collapsed — omitted if nothing is left
     (so `**Definition** [[stat-sd-def]]` keeps `**Definition**` as a label);
  2. then, for each reference in order, the **back** of the referenced card;
  3. if a referenced id does not resolve, the text *reference not found: `id`* (localised) —
     never silently dropped.
- **One level only.** References inside the inlined back are not expanded again.
- The stored files are never modified by expansion.
- The linter reports an unresolved reference as `broken-ref` (error) and more than two references in
  one back as `many-refs` (warn).

### Rationale

Copying one definition onto ten cards means ten edits every time it changes, and one of them always
stays stale. The `[[...]]` spelling matches wiki-links, so vaults shared with note-taking tools read
naturally.

---

## 10. What apps write

Apps write **only** these paths, and never a card:

| Path | Content |
|---|---|
| `data/reviews/YYYY-MM-DD.jsonl` | The review log. **Append-only**, one JSON object per line, split by day. Every line has at least `card_id` (the `id`, verbatim), `review_time` (Unix ms) and `review_rating` (1–4). Merging two copies of a day takes the union of lines, keyed by `card_id` + `review_time`. |
| `data/insights.json` | Derived study statistics (weak cards etc.) for people and agents to read. |
| `data/fsrs.json` | Scheduler parameters. |

The scheduling state of a card is recomputed from its log lines; it is not stored anywhere else.
**The log is the only copy of the history.** Writers MUST NOT edit, sort, prune or delete anything
under `data/`. Log lines for deleted cards stay.

---

## 11. Lint

The reference linter checks a vault and exits `1` if there is at least one **error**, else `0`.
Warnings and info never fail. Rules:

| Rule | Level | Fires when |
|---|---|---|
| `unterminated-frontmatter` | error | the first `---` has no closing `---` |
| `missing-id` | error | frontmatter has no `id` |
| `invalid-id` | error | `id` does not match §6 |
| `duplicate-id` | error | two files share an `id` |
| `missing-deck` | error | no `deck` (the directory is being used instead) |
| `empty-back` | error | the back has no non-blank line |
| `broken-ref` | error | a `[[id]]` in the back resolves to no card |
| `long-back` | warn | the back has more than **12** non-blank lines — an essay, not a flashcard. A vault MAY pin its existing long cards in a baseline file; a card not on the baseline then fails as **error** |
| `many-refs` | warn | more than **2** references in the back |
| `front-not-a-question` | warn | the front is a single line of at most 20 characters with no sentence punctuation — a topic, not a question |
| `missing-title` | warn | no `# Title` |
| `note-without-source` | info | the note gives no source (`Source`, `出典`, a URL, …) |

Thresholds are part of the format. Fix a card that trips one by splitting the *question* before the
card has history, or by moving shared text into an `ask: false` card — not by changing an `id`.

---

## 12. Writing cards (guidance)

- **One card asks one thing.** If the answer has independent halves, it is two cards. Decide this
  before the card gets an id and a history.
- A set the learner must produce whole is **one** card whose back is the set. Facts recallable on
  their own are one card each, with their shared framing in an `ask: false` card they reference.
- Use a reference only when the same text belongs on three or more cards.
- The front must be answerable on its own. "Standard deviation" is a topic; "What does standard
  deviation tell you that the mean does not?" is a question.
- Put the source in the note. A fact you cannot trace cannot be checked.
- Write the content in the language you study in. Only the keys and markers are English.
- Changing *what a card asks* is a new card: new `id`, and the old file is deleted **by a person**.

---

## 13. Not in v2

Cloze deletions, type-in answers, image occlusion, audio, reversed cards, block-form lists in
frontmatter, reference depth beyond one, and in-app card editing are not part of v2. When material
needs one of them, stop and ask rather than approximating it in prose.

---

## Trademarks and independence

Anchor is an independent format and is not affiliated with, sponsored by, or endorsed by any other
flashcard application or note-taking tool named or implied here.
