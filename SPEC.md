# Anchor Card Format v2 — Specification

Status: **v2, in use.** Last changed 2026-10-24: references in the note are inlined (§9), card links
(§8.3), statute files (§14). This document is the **single source of truth** for the card format. Every
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
| `<!-- hint -->` | **hint** | with the front, before reveal: a nudge toward the answer. Apps MAY keep it visible after reveal. References in it are shown as links, not inlined |
| `<!-- note -->` | **note** | with the back, after reveal: context, caveats, sources |

- Text before the first marker is the front (minus the title line).
- Each marker switches the face for the lines that follow, until the next marker. Order is free;
  writers SHOULD use front → back → hint → note or front → hint → back → note.
- Leading and trailing blank lines of each face are removed; interior blank lines are kept.
- **`---`, emoji, tables, headings and code fences are ordinary body text.** They never split faces.
- Any other `<!-- ... -->` line stays in its face as ordinary text. Whether it is displayed differs
  between apps, so writers SHOULD NOT put other HTML comments in cards. In particular, a comment
  cannot limit what a reference inlines: `[[id]]` always inlines the whole back (§9).
- **A card with no `<!-- back -->`, or nothing after it, has an empty back.** Readers still load it;
  the linter reports `empty-back` (error). This applies to `ask: false` cards too — the back is what
  `[[id]]` pulls in.

### 8.3 Rendering

The body is Markdown. Apps render a common subset (paragraphs, emphasis, lists, quotes, tables, code);
anything they do not understand is shown as text or dropped. Apps MUST NOT execute scripts from a
card; writers SHOULD NOT rely on raw HTML.

A Markdown link whose target is a relative path to another card file (`[0511b](../norms/0511b.md)`)
opens that card. Apps MAY show it on top of the current card, so that closing it returns to the same
card in the same state (revealed or not).

---

## 9. References — `[[id]]`

A reference writes shared text once — typically a definition in an `ask: false` card — and shows it
inside every card that needs it.

- Syntax: `[[id]]`, where `id` matches §6. It may appear anywhere in a line.
- Where a reference stands decides what it shows:

  | Face | A reference is shown as |
  |---|---|
  | back | the referenced card's back, inlined (below) |
  | note | the same as in the back |
  | front, hint | a link to the referenced card — **not inlined while the card is asked**, so the answer is not shown before reveal. Screens that show the back anyway (browsing a card) MAY inline references in the hint |

- A back or note line containing references is rendered as:
  1. the line with every `[[id]]` removed and spaces collapsed — omitted if nothing is left
     (so `**Definition** [[stat-sd-def]]` keeps `**Definition**` as a label);
  2. then, for each reference in order, the **back** of the referenced card;
  3. if a referenced id does not resolve, the text *reference not found: `id`* (localised) —
     never silently dropped.
- When a reference is followed by more text on its line (it sits mid-sentence), apps MAY keep a
  name for it in place — the text inside the brackets, or the referenced card's title when that text
  is a bare ULID — so the sentence still reads.
- Apps SHOULD mark where inlined text begins and ends and which card it came from, and MAY open the
  referenced card from that mark (§8.3).
- **One level only.** References inside the inlined back are not expanded again; apps MAY show them
  as links.
- The stored files are never modified by expansion.
- Brackets whose content is not a valid id (`[[0511b 相殺権の濫用]]`, with a space) are not a
  reference. Apps MAY resolve such text to a card by its title — the whole title, then the title's
  leading code (`0511b`), preferring the same subject, and never guessing between two candidates — and
  otherwise show it as written, never as *reference not found*. Writers SHOULD write `[[id]]`; only
  ids are checked by the linter.
- The linter checks the references in the back: an unresolved one is `broken-ref` (error), and more
  than two in one back is `many-refs` (warn).

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
under `data/` other than `data/statutes/`. Log lines for deleted cards stay.

Apps also **read**, and never write, `data/statutes/*.json` — statute text for the optional statute
lookup (§14). Those files belong to the vault's owner and the tools they run.

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
| `invalid-statute-file` | error | a `.json` file directly in `data/statutes/` is not a statute file apps can read (§14.2) |
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

## 14. Statutes (optional — Japanese law)

A vault for studying Japanese law can carry the text of the statutes it cites. Apps then turn an
article number in a card (`95条1項`) into something the learner can hover or tap to see that article
on top of the card — with its paragraph or item highlighted, the previous and next article, and where
it sits in the statute's parts and chapters — without leaving the card or flipping it.

**Apps know no laws.** Which statutes exist, how they are abbreviated and which cards they apply to all
come from the vault's files. A vault without `data/statutes/` sees no change, and apps do not fetch
statute text over the network.

### 14.1 Files

A statute file is `data/statutes/<name>.json`, exactly that depth (`data/statutes/old/x.json` is not
one). It is UTF-8 JSON:

| Key | Required | Meaning |
|---|---|---|
| `format` | **yes** | The number `1`. |
| `law` | **yes** | The statute's name as cards write it (`刑法`). Unique in the vault. |
| `articles` | **yes** | Article key → article (below). |
| `aliases` | no | Other spellings used in cards (`["刑訴法", "刑訴"]`). |
| `subjects` | no | Vault top-level directories whose cards default to this statute. Absent: `[law]`. |
| `paths` | no | Regular expressions matched against a card's vault-relative path, to choose a default for cards no subject decides (`^過去問/[^/]+/(令\|平)[0-9]+刑[-−]`). |
| `source` | no | Where the text came from (`name`, `enforced`, `fetched`, …), shown under the text. |
| `order` | no | Article keys in statute order, for previous / next. Absent: keys sorted by number. |
| `toc` | no | Parts, chapters, sections: `[{title, from, to, children}]`, where `from` / `to` are the first and last article key inside. A part with no articles (`第1章　削除`) has neither. |
| `divisions` | no | Hand-written subdivisions for the generator to insert into `toc`. Apps ignore it. |

An **article key** is the article number in ASCII digits, with each `の` branch joined by `_`:
`95` is 95条, `19_2` is 19条の2. An article is
`{caption, paragraphs: [{num, text, items: [{title, text, sub: [...]}]}]}`; `items` and `sub` are
optional.

### 14.2 Reading

- A file that is not JSON, or lacks `format: 1`, `law` or `articles`, is ignored as if absent; the
  linter reports `invalid-statute-file`. Nothing else breaks.
- An invalid expression in `paths` is dropped. Keys in `order` that are not in `articles` are dropped.
- Two files with the same `law`, or claiming the same subject: the first in file-name order wins.

### 14.3 Which numbers become links

An article number is `第?N条` followed optionally by `のN` branches, `第?N項` and `第?N号`, where N is
ASCII or full-width digits (`95条`, `第19条の2`, `９５条１項`, `177条2項3号`). Its statute is:

1. **The statute named right before it**, by `law` or an alias, longest name first. Spaces and `*`
   between the name and the number are allowed: `民法110条`, `刑訴法197条1項`, `**民法** 110条`.
2. Otherwise **the card's default statute**: the one whose `subjects` contain the first directory of
   the card's path, else the first whose `paths` match the path. Text inlined from another card by
   `[[id]]` uses that card's subject instead.
3. Otherwise none. In a card with no default, only numbers with a statute name are links.

Inside a blockquote, a line containing `📍` whose first word is a known statute name (or such a name
followed by `第`, as in `憲法第三章`) sets the statute for the rest of that blockquote. If the first
word names a statute the vault does not have — it ends in 法, 律, 令, 則, 例 or 約 — numbers in that
blockquote are not linked to the default.

A number is **not** a link when:

- the text right before it names a statute the vault does not have: it ends in 法, 律, 令, 則, 約, 典
  or 例 (`会社法356条` without a 会社法 file, `同法95条`, `規則3条`), or is such a word followed by a
  parenthetical (`理容師法（以下「法」という）12条`);
- it refers to repealed or past text: `旧民法95条`, `改正前民法…`, `旧395条`;
- it counts or points rather than names: preceded by 前, 次, 同, 本 or 各 (`前2条の罪`);
- the article is not in the file. For `177条の3つの要件`, when `177_3` does not exist but `177` does,
  only `177条` is a link;
- it is on a line containing `📜` and is followed by a caption in parentheses (optionally after 本文,
  前段, 後段, ただし書, 柱書, N項 or N号) that shares no two consecutive characters with the article's
  `caption` — it is quoting another statute (`5条本文（過失運転致死傷）` in a 刑法 card);
- it is inside a link, inline code, a code block or `[[…]]`.

A number that does not resolve stays plain text. Apps never show a link that opens nothing.

### 14.4 Producing the files

The files are generated, not typed. [`tools/fetch_statutes.py`](tools/fetch_statutes.py) (Python 3,
standard library only) builds them from the e-Gov 法令 API v2:

```console
$ python3 tools/fetch_statutes.py --out <vault>/data/statutes 民法 刑法 憲法
```

- It takes the main provisions only, not supplementary provisions (附則).
- By default it turns kanji numerals into Arabic ones where they count something — `三年以下` becomes
  `3年以下`, `第一項` becomes `第1項` — and leaves words like `第三者` and `一部` alone, so the text
  reads like the cards that quote it. `--kanji-numerals keep` keeps the original.
- `aliases`, `subjects`, `paths` and `divisions` are the owner's to edit; regenerating keeps them.
  After editing `divisions`, `--reapply` rebuilds `toc` without network access. Each division must
  cover its parent's range with no gap or overlap, or generation stops.
- Statutes are amended. Regenerate and commit to follow them; `source.enforced` says which version a
  file holds.

### 14.5 Writing law cards (guidance)

- Write article numbers in Arabic numerals (`95条1項`), as the generated text does.
- Name the statute whenever it is not the card's default: `憲法31条` in a card under `刑法/`.
- Repeat the name for every article of another statute. In `刑事訴訟法199条・210条` under `刑法/`,
  `210条` has no name before it and resolves to 刑法210条; write `刑事訴訟法199条、刑事訴訟法210条`.
- When the card must hold the wording, quote it as a blockquote: a `📍` line saying where the article
  sits, then a `📜` line with the text, separated by an empty `>` line.

  ```markdown
  > 📍 第2編　罪 › 第5章　公務の執行を妨害する罪（95〜96条の6）
  >
  > 📜 **95条1項（公務執行妨害）**：公務員が職務を執行するに当たり、これに対して暴行又は脅迫を加えた者は、3年以下の拘禁刑又は50万円以下の罰金に処する。
  ```

- Put the article the question asks about on the front; an article first needed for the answer goes
  on the back.
- A norm (規範) used by several problems is one card, referenced as `**規範** [[id]]` from each
  problem card (§9). Fix the norm in that one card.

---

## Trademarks and independence

Anchor is an independent format and is not affiliated with, sponsored by, or endorsed by any other
flashcard application or note-taking tool named or implied here.
