# Anchor Card Format v2 — Normative Specification

Status: **final for v2**. This document is the **sole normative source** for the
format. An implementation, a tool, a template, or a document that disagrees with
it is wrong. `spec/conformance/` holds a machine-checkable corpus derived from
these rules (§2); the corpus is a gate, not a second specification.

The key words MUST, MUST NOT, REQUIRED, SHALL, SHOULD, SHOULD NOT, MAY, and
OPTIONAL are to be interpreted as described in RFC 2119.

---

## 1. Model and scope

Anchor is a spaced-repetition format. A **vault** is the user's own Git
repository. A **card** is one Markdown file in that vault. Apps read cards and
append a learning log; **apps MUST NOT create, modify, or delete card files.**
Cards are written by AI agents and by hand.

This document defines four things and nothing else:

1. Which files in a vault are cards (§5).
2. How the bytes of a card file map to a **Card** value (§6–§12).
3. How a Card value maps to **study items** and their rendered front/back (§13–§15).
4. What a **linter** reports (§17) and what a client does with the report (§18).

Scheduling algorithms, UI, sync transport, and the review log's scheduler fields
are out of scope, except where §19 pins them down to keep clients interoperable.

### Rationale

Several independent implementations must produce identical results from
identical bytes. Everything in this document exists to remove a place where two
implementations could reasonably differ; anything that does not do that has been
left out.

---

## 2. Conformance

An implementation is conforming if, for every card file, it produces the Card
value, the rendered items, and the diagnostic list this document specifies.

Because prose alone cannot hold implementations in different languages together,
the rules of §5–§18 are also expressed as a corpus at `spec/conformance/`. The
corpus is **derived from this document and answerable to it**: where the two
disagree, this document is right and the corpus has a bug that MUST be fixed in
the corpus.

- **Single-file case**: `NNN-name.md` (input) plus `NNN-name.json` (expected),
  where the expected value is
  `{"card": <Card>|null, "diagnostics": [<Diagnostic>, ...]}`.
- **Vault case**: directory `NNN-name/` (a whole vault) plus `NNN-name.json`,
  where the expected value is
  `{"cards": {<vault-relative path>: <Card>}, "items": {<item id>: <Item>}, "diagnostics": [...]}`.

Comparison is **structural**, not textual: both sides are parsed as JSON and
compared as JSON values. Strings MUST match exactly, code point for code point.
An absent key and a `null` value are different. Array order is significant.

Corpus `.json` files MUST be stored canonically so they diff cleanly: UTF-8, LF
line endings, object keys sorted ascending by Unicode code point, two-space
indentation, no escaping of non-ASCII characters, exactly one trailing newline.

Every rule in §5–§18 MUST have at least one corpus case, and every boundary in
§20 that a fixture can express MUST have a case on each side (the 1 MiB file
size is checked by implementation tests rather than a megabyte fixture). Every
implementation MUST run this corpus in CI; a single failure blocks merge.

### Rationale

Regex dialects, whitespace conventions and default string comparisons differ by
language, and a specification cannot make them agree by asserting that they do;
the corpus is the mechanical check that they have not drifted. Structural
comparison keeps implementations from arguing about JSON formatting instead of
semantics. The corpus is a gate rather than a second canon because two normative
documents drift apart the moment one is edited alone.

---

## 3. Bytes, lines, and text

**Encoding.** Card files MUST be UTF-8. A single leading BOM (`EF BB BF`) MUST
be removed before any other processing; a second BOM is ordinary text. Invalid
UTF-8 MUST NOT be replaced with U+FFFD: the file is reported as
`encoding-invalid` and is not a card.

**Line splitting.** Exactly three sequences terminate a line: `CR LF`, `LF`,
`CR`. Implementations MUST NOT use their standard library's line splitter — the
usual ones split on more characters than this. U+000B, U+000C, U+0085, U+2028,
U+2029 and the ASCII file/group separators are **ordinary characters** inside a
line. After splitting, all line terminators are LF; every string this
specification produces uses LF. A final line terminator produces no extra empty
line.

**Whitespace.** "ASCII space" means U+0009 (TAB) or U+0020 (SPACE) — and nothing
else. Where this document says *trim*, it means removing leading and trailing
ASCII spaces only. NBSP (U+00A0), U+3000, U+FEFF and every other space-like code
point are **content** and MUST NOT be trimmed. A **blank line** is a line
consisting only of ASCII spaces (possibly zero of them).

**Unicode normalization.** Vault-relative paths, `id`, deck segments and `tags`
MUST be normalized to NFC before use or comparison. `title`, `front`, `hint`,
`back` and `note` MUST NOT be normalized — the user's bytes are preserved.

**Regular expressions.** This document contains no `\d`, `\w`, `\s`, or `\b`,
and implementations MUST NOT use them: their meaning differs per language.
Character classes are written out (`[0-9]`, `[A-Za-z0-9_-]`, `[ \t]`). Where a
pattern is anchored, matching MUST use a whole-string API — in some languages
`$` also matches before a trailing newline.

**String ordering.** Where this document requires an order (vault scan order,
diagnostic order), strings MUST be compared as **UTF-8 byte sequences**, not
with the language's default string comparison.

### Rationale

Every item in this section is a place where the target languages disagree by
default. Fixing the smallest possible whitespace set (TAB and SPACE) means an
invisible NBSP changes content rather than silently changing structure — a
visible error beats a silent reinterpretation.

---

## 4. What a conforming parser must implement — honestly

A conforming parser is a **line scanner**. It implements, in this order:

1. BOM removal, UTF-8 validation, line splitting (§3).
2. Frontmatter extraction and the frontmatter subset parser (§6). ~60 lines. No YAML library.
3. A **fenced-code state machine** (§10). ~20 lines. This is the only Markdown
   block structure the parser knows.
4. Title detection (§8), marker scanning (§9), reference scanning (§11) — all
   line-oriented, all suppressed inside fences.
5. Item derivation and reference expansion (§11, §13).

A conforming parser MUST NOT implement CommonMark, MUST NOT track inline code
spans, HTML blocks, block quotes, lists, or indented code blocks, and MUST NOT
use a YAML library. Consequences that follow from this and are intentional:

- An indented `    <!-- back -->` is body text, because markers require column 0.
- A marker inside a block quote (`> <!-- back -->`) is body text, for the same reason.
- A marker inside an inline code span on its own line — `` `<!-- back -->` `` —
  is body text, because the line is not exactly `<!-- back -->`.
- A four-space indented code block is **not** a code block to Anchor; a marker
  inside it is still body text only because of the column-0 rule.

Total parser size is expected to be 300–450 lines per implementation. That is
the price of the guarantees in §2, and it is paid on purpose.

### Rationale

The one Markdown construct that genuinely needs an exception is the fenced code
block, because a card that teaches Anchor or Markdown must be able to show a
marker. Everything else is handled by making the syntax anchor to column 0 and
to whole lines, which costs no parser machinery at all.

---

## 5. Which files are cards

Given a vault root, an implementation MUST walk it and consider a file a
**card candidate** when all of the following hold, evaluated on the NFC-normalized
vault-relative path with `/` separators:

- The file name ends with `.md` (lowercase only; `.MD`, `.markdown` do not count).
- No path segment begins with `_` or `.`.
- The path is not a symbolic link, and no traversed directory is a symbolic link.

A candidate over 1 MiB (§20) is `file-too-large` (error) and is not read further;
it produces no Card value.

A card candidate **is a card** if and only if its frontmatter (§6) contains an
`id` key. A candidate without frontmatter, or with frontmatter but no `id`, is
**not a card**, is skipped silently, and MUST NOT produce an error — with one
exception: if such a file contains a line that is exactly `<!-- back -->`
outside a fence, that is `id-missing` (error), because the author clearly meant
to write a card.

Files that are not cards MUST NOT be reachable by `![[id]]` (§11): they have no id.

Clients MUST make the list of skipped `.md` files inspectable (a settings screen
or a `--verbose` listing). They MUST NOT report it as a problem.

**Vault scan order** is ascending UTF-8 byte order of the vault-relative path.
This order determines the order of new cards in the study queue and the order of
diagnostics (§17).

### Rationale

Requiring `id` to make a card replaces three separate ignore rules with one
positive test, so a README never generates errors and a real card never
disappears silently. The `_`/`.` prefix rule remains because it is how users
already park drafts, references and app data.

---

## 6. Frontmatter

Frontmatter is **not YAML.** It is a fixed line-oriented subset that every
implementation hand-writes.

A card file MUST begin (after BOM removal) with a line that is exactly `---`.
Frontmatter ends at the next line that is exactly `---`. Neither delimiter may
carry leading or trailing ASCII spaces. `...` is not a terminator. `----` is not
a delimiter. If no terminator is found, the result is `frontmatter-unterminated`
(error) and the file is not a card. The body begins on the line after the
terminator; no later `---` line has any special meaning.

Inside frontmatter, each line MUST be one of:

| Form | Meaning |
|---|---|
| blank line | ignored |
| `# ...` (a `#` in column 0) | comment, ignored |
| `key: value` | scalar entry |
| `key:` followed by one or more `  - item` lines (exactly two leading spaces) | list entry |
| `key: [a, b, c]` | list entry, flow form |

- A **key** MUST match `[a-z][a-z0-9-]*` and MUST start at column 0. Keys are
  case-sensitive; an uppercase key is `frontmatter-syntax` (error).
- A **value** is everything after the first `:` (which MUST be followed by an
  ASCII space or end of line), trimmed. It is **always a string**. No type
  inference: `2026-08-31` is the string `2026-08-31`, `011` is the string `011`,
  `no` is the string `no`.
- If a value's first and last characters are the same `"` or `'` and its length
  is at least 2, that pair is removed. No escape sequences are processed: the
  value `"a\nb"` yields the four characters `a`, `\`, `n`, `b`.
- In the flow form, elements are split on `,` and trimmed; an element MUST NOT
  contain `,`, `[`, or `]`. In the block form, the item text after `- ` is
  trimmed and dequoted by the same rule.
- Duplicate keys are `frontmatter-syntax` (error).
- Anything else — nested maps, block scalars (`|`, `>`), anchors/aliases
  (`&`, `*`), merge keys (`<<`), tab indentation, `- ` items with other
  indentation — is `frontmatter-syntax` (error). These MUST NOT be silently
  ignored.

```
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAB
tags: [inference, exam-2026]
ask: true
x-source: Casella & Berger, ch. 7
---
```

```
<!-- INVALID: block scalar, nested map, tab indent, duplicate key -->
---
id: card-one
note: |
  multi-line
meta:
  author: k
	tags: [a]
id: card-two
---
```

### Rationale

`ask: no` is `false` under YAML 1.1 and the string `"no"` under YAML 1.2;
`id: 2026-08-31` is a date object to one library and a string to another; some
target languages have no standard YAML at all. The handful of keys this format
needs do not require any of YAML's power, so the format drops YAML rather than
drop determinism.

---

## 7. Fields

| Key | Required | Type | Default |
|---|---|---|---|
| `id` | yes | string | — |
| `tags` | no | list | `[]` |
| `ask` | no | `true`/`false` | `true` |
| `reverse` | no | `true`/`false` | `false` |
| `format` | no | `2` | `2` |
| anything else | no | preserved, ignored | — |

**`id`.** MUST match `[A-Za-z0-9][A-Za-z0-9_-]{2,63}` as a whole string: 3–64
characters, ASCII only, case-sensitive. `#` is reserved for derived item ids
(§13) and MUST NOT appear in `id`. Trailing and doubled hyphens are legal.
Anything else is `id-invalid` (error). Ids MUST NOT be lowercased or otherwise
repaired: two spellings of one id must never exist.

The id is the only key between a card and its history. **An id MUST NOT be
changed, and the id of a deleted card MUST NOT be reused** (§14). Renaming,
moving, or rewriting the file is safe.

If two cards share an id, **all** of them are `id-duplicate` (error): none is
scheduled, and `![[id]]` for that id does not resolve.

**Deck.** A card's deck is its vault-relative **directory path**, split on `/`;
a card at the vault root has the empty deck (a client displays the empty deck
under the repository's own name). Segments are NFC-normalized. Deck comparison
is exact and case-sensitive: `Stats` and `stats` are two decks. A full-width `／`
inside a directory name is an ordinary character, not a separator.

There is **no frontmatter key for the deck** and no way to override the derived
value: moving the file is the only way to change a card's deck. A key named
`deck` is an unknown key like any other — preserved in `extra`, given no meaning
(`unknown-key`, info).

**`tags`.** Each tag is an arbitrary non-empty string (any script, any case)
after NFC and trimming; a tag MUST NOT contain `,`. An empty tag is
`tag-invalid` (error). Order is preserved, duplicates are kept and reported as
`tag-duplicate` (warn). A scalar `tags: foo` is `frontmatter-syntax` (error) —
write `tags: [foo]`.

**`ask`.** `false` means the card is never scheduled; it exists only to be
included by `![[id]]`. It is **not** a way to pause a card — pausing is a log
event (§19). Only the exact unquoted tokens `true` and `false` are accepted;
anything else is `frontmatter-syntax` (error).

**`reverse`.** `true` adds a reversed study item (§13).

**`format`.** If present it MUST be `2`; any other value is `format-unsupported`
(error), which is how a v2 parser refuses a later card instead of misreading it.
Any construct v2 cannot express arrives under a higher number, never as an
extension of v2 (§22).

**Unknown keys** are preserved in the Card's `extra` object and otherwise
ignored (`unknown-key`, info). The `x-` prefix is reserved for agent metadata
and MUST never be given meaning by this format. This behavior is frozen: future
versions MUST NOT turn unknown keys into errors.

### Rationale

Opaque ids (§21) let an agent mint an id without reading the vault, which is why
no id ledger file exists. Taking the deck from the directory removes both the
duplication of one `deck:` line across thousands of files and the question of
which of two answers wins. One rule, no precedence.

---

## 8. Title

After frontmatter, skip blank lines. The first non-blank line MUST be an ATX H1:
column 0, exactly one `#`, then one or more ASCII spaces, then at least one
non-space character. Otherwise: `title-missing` (error).

The **title** is that line with the leading `#` and following ASCII spaces
removed, then trimmed. A closing sequence is **not** removed: the title of
`# Bayes' rule #` is `Bayes' rule #`. Inline markup is kept raw; rendering is
the client's job. Setext headings (`Title` / `=====`) are not titles. Later `#`
lines are ordinary body text.

The title MUST be displayed with both the front and the back of a study item,
with one exception: for reversed items (`#r`, §13) the title MUST be hidden on
the front side and shown on the back. Card authors MUST NOT put the answer in
the title of a non-reversed card.

```
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAB
---

# Ubiquitous
```

```
<!-- INVALID: setext title, and body before the title -->
---
id: bad-title-card
---
See below.
Ubiquitous
==========
```

### Rationale

ATX-only with no leading indent and no closing-sequence stripping is the version
of "the first line is a title" that line scanners in different languages can
agree on without lookahead. Titles are always visible so that a vocabulary card
can consist of a title alone (§9), and reversed items get the single exception
that makes that safe.

---

## 9. Markers and regions

Exactly three lines are markers. Each MUST be the **entire line**, byte for
byte, with no leading or trailing ASCII spaces:

```
<!-- hint -->
<!-- back -->
<!-- note -->
```

Markers are recognized only outside fences (§10). Each MUST appear at most once
(`marker-duplicate`, error) and they MUST appear in that relative order
(`marker-order`, error).

A line that is not a marker but becomes `<!--back-->`, `<!--hint-->` or
`<!--note-->` after removing all ASCII spaces and lowercasing is
`marker-malformed` (error). Examples: `<!--back-->`, `<!-- Back -->`,
`<!--  back  -->`, `<!-- back -->` with a trailing space.

Any other `<!-- ... -->` line is ordinary body text (`marker-unknown`, warn) and
renderers MUST display it literally (§15). This behavior is frozen, so a v2
client shown a v2.1 marker degrades to showing a line, not to losing content.

Regions are cut from the body (title line excluded):

| Region | From | To |
|---|---|---|
| `front` | line after the title | the first of `<!-- hint -->`, `<!-- back -->`, or EOF |
| `hint` | after `<!-- hint -->` | `<!-- back -->` or EOF |
| `back` | after `<!-- back -->` | `<!-- note -->` or EOF |
| `note` | after `<!-- note -->` | EOF |

Marker lines belong to no region. Each region's leading and trailing blank lines
are removed; interior blank lines are kept exactly. A region whose marker is
absent is **absent** in the Card value (not an empty string). A region whose
marker is present but whose content is empty after trimming is also absent, and
reported: an empty `hint` or `note` is `empty-region` (warn); an empty `back` is
`back-empty` (error).

`<!-- back -->` is REQUIRED unless `ask: false`; otherwise `back-missing`
(error). When `ask: false` and no `<!-- back -->` is present, the whole body
after the title is the `back` and the `front` is absent — this is the normal
shape of a reference-only card.

`front` MAY be absent. A card whose front is empty is asked by its title alone,
which is the standard shape of a vocabulary or term card.

```
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAB
---

# Ubiquitous

<!-- hint -->
Latin *ubique*.

<!-- back -->
Present or found everywhere.

<!-- note -->
Common in exam prose about distributions.
```

```
<!-- INVALID: note before back, and a duplicated hint -->
# Bad order

<!-- note -->
context
<!-- hint -->
h1
<!-- hint -->
h2
<!-- back -->
answer
```

### Rationale

Byte-exact markers plus a near-miss error is the only combination that never
silently swallows an author's mistake: a marker either works or it says so. One
canonical order removes the "is a note before back part of the front?" question
entirely instead of answering it. Three markers and no fourth keeps the parser
to one comparison per line.

---

## 10. Fenced code

A **fence opener** is a line of: zero to three SPACE characters (TAB is not
allowed), then three or more identical `` ` `` or `~` characters, then any text.
While a fence is open, the scanner interprets nothing: no markers, no
references, no near-miss detection, no `$` counting. The fence closes on the
first line of: zero to three SPACE characters, then at least as many of the
**same** fence character as the opener, then only ASCII spaces to end of line.
Fences do not nest. A fence left open at EOF extends to EOF and is
`fence-unterminated` (warn).

Fence lines themselves are ordinary content of whichever region they fall in.
Frontmatter (§6) is extracted before this scan, so a fence can never affect it.

````
# How Anchor cards are written

<!-- back -->
The answer side starts after this line:

```markdown
<!-- back -->
```

The line inside the fence above is content, not a marker.
````

### Rationale

This is the one exception to "no Markdown structure in the parser", and it buys
the ability to write a card *about* Anchor or Markdown — which agents do
constantly — without inventing an escape syntax. Excluding indented code blocks
and inline code keeps the state machine to a single boolean plus the opener's
length and character.

---

## 11. References — `![[id]]`

A **reference** is a line whose entire content, after trimming, is `![[` + an id
+ `]]`, where the id matches the `id` pattern of §7. Nothing else is a
reference:

- `![[id]]` inside a sentence is ordinary text (`ref-inline`, warn) and is never expanded.
- `![[ id ]]`, `![[id|label]]`, `![[id#heading]]`, `[[id]]` (no `!`) are ordinary
  text. A line that is `![[` + anything + `]]` but whose inner text is not a
  valid id is `ref-not-an-id` (warn) and stays literal, so `x[[1]]` in R code and
  `[[a, b]]` in prose never produce diagnostics at all.
- References inside fences are ordinary text.

References are expanded **only in `back`**. In `front`, `hint` and `note` they
stay literal; a reference in `front` is `ref-in-front` (warn) because it can leak
the answer to the question side.

Expansion is one level deep. When card A's back contains a reference to card B:

- If B exists, is a card, and has no error diagnostic, the reference line is
  replaced by exactly these lines: an empty line, `> ` + B's title, an empty
  line, B's `back` (leading/trailing blank lines already stripped), an empty
  line.
- Any reference inside B's back is **left exactly as written**. It is not
  expanded, not removed, and not turned into anything else. The same back
  therefore looks different when B is studied on its own — this is intended and
  MUST NOT be smoothed over.
- If B does not exist, is not a card, or has an error, the reference line is left
  exactly as written and `ref-unresolved` (warn) is emitted. The parse output
  MUST NOT contain any natural-language message; the client renders its own,
  in its own locale, as an affordance around that line (§15).
- A reference to the card's own id is `ref-self` (error).

Only B's `back` is inserted. B's title appears only in the `> ` line; B's
`front`, `hint` and `note` are never inserted.

After all replacements, the expanded back's leading and trailing blank lines are
removed. No other whitespace collapsing is performed.

```
# Mistake of fact — elements

<!-- back -->
Three elements must be shown:

![[01JD8N2K4P7QW3ZR5T9V6X0YAB]]

...and the mistake must be material.
```

```
<!-- INVALID as a reference (all of these stay literal) -->
See ![[01JD8N2K4P7QW3ZR5T9V6X0YAB]] for the definition.
![[ 01JD8N2K4P7QW3ZR5T9V6X0YAB ]]
[[01JD8N2K4P7QW3ZR5T9V6X0YAB]]
```

### Rationale

References are why this format exists: a fact several cards depend on is written
once, in one `ask: false` card, so correcting it corrects every card that uses it.

Whole-line-only matching solves four reported problems with one rule: R's
`x[[1]]`, the layout of a multi-line block dropped into the middle of a
sentence, the "is this a link or a transclusion?" ambiguity, and the cost of
scanning inline text. The `!` prefix is the embed syntax several Markdown note
editors already use, so a vault laid out as `<deck>/<id>.md` (§21) transcludes
correctly when opened in one of them.

---

## 12. The Card value

```json
{
  "id": "01JD8N2K4P7QW3ZR5T9V6X0YAB",
  "deck": ["Statistics", "Fundamentals"],
  "tags": ["inference"],
  "ask": true,
  "reverse": false,
  "title": "Ubiquitous",
  "front": "Used in what register?",
  "hint": "Latin *ubique*.",
  "back": "Present or found everywhere.",
  "note": "Seen in exam prose.",
  "extra": {"x-source": "Casella & Berger, ch. 7"},
  "items": ["01JD8N2K4P7QW3ZR5T9V6X0YAB"]
}
```

`id`, `deck`, `tags`, `ask`, `reverse`, `title`, `extra` and `items` are always
present (`deck`, `tags` and `extra` may be empty). `front`, `hint`, `back` and
`note` are present only when the corresponding region exists and is non-empty
(§9); they are never `null`. Region strings are unexpanded: references appear as
written. `extra` values are strings or arrays of strings.

A file with an error diagnostic still yields a Card value where possible (so a
linter can point at it), but that Card is excluded at runtime (§18). Where the
error prevents a Card from existing at all (`encoding-invalid`,
`frontmatter-unterminated`, `id-missing`, `id-invalid`, `title-missing`), the
single-file expected value is `{"card": null, "diagnostics": [...]}`.

### Rationale

Fixing the shape, and in particular fixing "absent, never null", removes the
last free variable between implementations that each have a different default
for missing values.

---

## 13. Study items

An **item id** is `<id>` or `<id>#r`. Derivation, in order:

1. `ask: false` → the card produces **no** items.
2. Otherwise → item `<id>`, plus item `<id>#r` when `reverse: true`.

Rendering, per item (all region text after reference expansion, §11):

| Item | Front side | Back side |
|---|---|---|
| `<id>` | title + `front` | title + `back` |
| `<id>#r` | `back`, title hidden | title + `front` |

`hint` is shown on the front side of every item; `note` is shown only after
grading. The `Item` value used by the corpus is
`{"front": "...", "back": "...", "hint": "...", "note": "..."}` with `hint` and
`note` absent when the regions are absent.

### Rationale

`#` is reserved in ids (§7) so that a derived item id can never collide with a
card id; defining the separator once means a later format version can add an
item kind without changing the log format. Reverse hides the title because the
title is the answer for the reverse direction of a vocabulary card — the single
case that makes "the title is always visible" unsafe.

---

## 14. Deleted, renamed, and rewritten cards

- Deleting a card MUST NOT delete its log entries; the entries become **orphans**
  and are reported as a count (§18). Clients MUST NOT prune them.
- **The id of a deleted card MUST NOT be reused.** Reusing it silently attaches
  the old card's history to a different question, and nothing in the vault can
  detect or undo that. Ids SHOULD therefore be random (§21).
- Rewording, reformatting, fixing a typo, adding a hint or note, or extracting
  content into a reference card → **keep the id**.
- Changing what the card asks → a new card with a new id, and the old file is
  deleted. **Deleting a card file requires human confirmation.** An agent MUST
  report that a new id plus deletion of the old file is required, and MUST NOT
  delete the file itself: the deletion discards review history that cannot be
  reconstructed from anything else in the vault.

### Rationale

The id is the only join key with history, so the one act that destroys history
with no editing step to undo it — deleting the file — is the one act an agent
may propose but not perform.

---

## 15. Rendering

These rules bind clients, not the parser, but they are normative because a card
that renders differently on two devices is a broken card.

- **Raw HTML** in card text MUST be escaped and shown as text. No HTML is
  executed or laid out; `<script>` is never live.
- **HTML comments** that are not markers (§9) MUST be displayed literally, so a
  card teaching HTML shows its example instead of losing it.
- **Math.** `$...$` (inline) and `$$...$$` (display) delimit math spans. A math
  span's content MUST NOT be passed through inline Markdown transformation. A
  literal dollar sign MUST be written `\$`. Clients that cannot typeset math
  MUST show the span's source in a monospaced run — they MUST NOT let a Markdown
  renderer mangle it. An odd number of unescaped `$` in a region outside fences
  is `odd-dollar` (warn).
- **Images.** `![alt](path)` is permitted with a **relative path only**, resolved
  against the card file's directory. Remote URLs MUST NOT be fetched; they are
  rendered as a plain link. When the file is not available locally the client
  MUST show a visible placeholder naming the path — never nothing. A line that is
  exactly `![[id]]` is a reference (§11), never an image.
- **Code fences** are rendered as code blocks with the opener's info string as
  the language.
- Any text a client puts on screen that is not card content (unresolved
  references, error banners, deck names for the empty deck) is client UI in the
  client's locale. Such text MUST NOT be inserted into card text.

### Rationale

"Written but silently dropped" is the worst failure mode for study material, so
every unsupported construct degrades to visible source or a visible placeholder.
Math gets a protected span because a Markdown renderer turns `\\` into `\` and
`x_{i}` into emphasis, producing a *different but plausible* formula — an error
the learner memorizes.

---

## 16. Diagnostics

```json
{"rule": "ref-unresolved", "severity": "warn", "path": "Stats/01J...md", "line": 12, "column": 1}
```

`line` is 1-based. `column` is a 1-based **UTF-8 byte offset** within the line.
`severity` is `error`, `warn`, or `info`. Diagnostics are sorted by `path`
(UTF-8 byte order), then `line`, then `column`, then `rule`.

Rule ids are normative and stable. Message text is not normative and MAY be
localized; two implementations agreeing on rule ids is the conformance
requirement.

---

## 17. Lint rules

This is the complete rule set. An implementation MUST NOT add a rule, and MUST
NOT offer a way to suppress one.

Errors — the card is excluded at runtime (§18):

| Rule | Fires when |
|---|---|
| `encoding-invalid` | not valid UTF-8 |
| `file-too-large` | over 1 MiB |
| `frontmatter-unterminated` | opening `---` with no closing `---` |
| `frontmatter-syntax` | unsupported construct, duplicate key, bad `ask`/`reverse` value |
| `format-unsupported` | `format` present and not `2` |
| `id-missing` | `<!-- back -->` present but no frontmatter `id` |
| `id-invalid` | `id` fails the §7 pattern |
| `id-duplicate` | two or more cards share an id |
| `tag-invalid` | empty tag, or a tag containing `,` |
| `title-missing` | first non-blank line after frontmatter is not an ATX H1 |
| `marker-duplicate` | `hint`/`back`/`note` marker appears twice |
| `marker-order` | markers out of `hint` → `back` → `note` order |
| `marker-malformed` | near-miss marker line (§9) |
| `back-missing` | no `<!-- back -->` and not `ask: false` |
| `back-empty` | `<!-- back -->` present, content empty |
| `ref-self` | a reference to the card's own id |

Warnings — the card is still studied:

| Rule | Fires when |
|---|---|
| `ref-unresolved` | reference target missing, not a card, or in error |
| `ref-in-front` | reference syntax in `front` |
| `ref-inline` | reference syntax not alone on its line |
| `ref-not-an-id` | `![[...]]` alone on a line whose contents are not a valid id |
| `ref-too-many` | more than 16 distinct references in one card |
| `marker-unknown` | an unrecognized `<!-- word -->` line |
| `fence-unterminated` | a fence open at EOF |
| `empty-region` | `hint` or `note` marker with empty content |
| `back-too-long` | `back` (unexpanded) exceeds 1200 characters, counting all characters including blank lines but excluding fenced blocks, table rows, and reference lines |
| `tag-duplicate` | the same tag twice |
| `odd-dollar` | odd count of unescaped `$` in a region outside fences |
| `duplicate-content` | two or more cards share the same `title` + `front` after NFC and blank-line stripping |

Info: `unknown-key`.

Every diagnostic message SHOULD name one repair and SHOULD name the repair that
is forbidden. Linter output SHOULD open with the two invariants an automated
fixer breaks most often:

> Never change an existing `id`. Never split one card into two to silence a
> warning — both destroy review history. Shorten, or move shared text into an
> `ask: false` card and reference it.

**Rules deliberately not in this list**, and which implementations MUST NOT add:

- "front is only a noun phrase" — undecidable without a morphological analyzer,
  wrong for the most common card shape (a vocabulary term), and it drives
  automated fixers to rewrite correct cards into worse ones.
- "note has no source" — it rewards an LLM for inventing a citation, which is
  the worst possible defect in study material.
- "the same text appears in three or more cards" — not decidable from one card
  and not worth a vault-wide index; it is authoring guidance (§21).

### Rationale

A warning that fires on correct cards trains everyone to ignore the whole
linter, taking the sixteen errors down with it. The three deleted rules each
fired on a correct, common card shape; two of them actively pushed an AI writer
toward a worse card.

There is no suppression mechanism for the same reason: a rule that fires on a
correct card is a defect in the rule, and the fix belongs in the rule, where
every vault gets it.

---

## 18. Runtime behavior

- A card with any **error** diagnostic MUST be excluded from the study queue and
  MUST NOT resolve as a `![[id]]` target. Its log entries MUST be kept.
- A vault MUST NOT be rejected as a whole because some cards have errors.
- Clients MUST surface the counts — cards in error, unresolved references,
  orphan log entries, skipped `.md` files — somewhere reachable, in the client's
  locale.
- A CLI linter MUST exit 1 when any error exists, 0 otherwise, and MUST exit 1
  on warnings when `--strict` is given. It MUST offer `--format json` emitting
  the §16 objects.

### Rationale

Card-level exclusion is the only granularity where one broken file cannot take a
study session down with it, and keeping the log means fixing the card restores
the schedule.

---

## 19. Paths the apps write

Apps MUST NOT create, modify, or delete card files (§1). Exactly two paths are
writable by an app, and an app MUST NOT write any other path. Agents and humans
MUST treat both as read-only. Being `.jsonl` and `.json`, neither is ever a card
candidate (§5).

**`data/reviews/<YYYY-MM-DD>.jsonl` — the review log.** UTF-8, LF, one JSON
object per line; apps write it and read it back.

- **Append-only.** Merging two copies is the union of their lines with exactly
  identical lines de-duplicated; line order carries no meaning. This is what
  makes a three-way sync conflict-free without a server.
- Every entry has `item` (an item id from §13, `#` included), `at` (RFC 3339,
  UTC), and `event`. `event` is `review` (scheduler fields alongside),
  `suspend`, or `unsuspend`. For one item, the latest `suspend`/`unsuspend` by
  `at` wins; a suspended item is not scheduled.
- An entry whose item id has no matching card is an **orphan** and MUST be kept.

**`data/insights.json` — the weakness ranking.** UTF-8, one JSON object,
rewritten whole. An app writes its derived ranking of the learner's weak items
here for the learner and their agents to read; **no app reads it back** and
nothing here depends on its contents. It is therefore fully regenerable: losing
it costs nothing, and a merge conflict is resolved by taking either side. Its
internal schema is out of scope.

### Rationale

Pausing a card is the one thing a learner needs to do from the phone, and the
app is not allowed to write cards — so pausing is a log event. That also frees
`ask` to mean exactly one thing. Naming the writable set instead of one path is
what makes "apps do not touch cards" checkable, and the two paths differ
precisely in whether losing the file costs anything.

---

## 20. Limits

| Limit | Value | On breach |
|---|---|---|
| Card file size | 1 MiB | `file-too-large` (error), file skipped |
| `id` length | 3–64 characters | `id-invalid` (error) |
| Distinct references per card | 16 | `ref-too-many` (warn); all still expand |
| Vault size implementations MUST handle | 20,000 cards | — |

A sync transport MUST NOT require one network request per card file; at 20,000
cards that alone exhausts a typical Git host's hourly API quota. Transports
SHOULD fetch trees or archives in bulk.

### Rationale

The scale ceiling is a transport requirement, not a grammar requirement, so the
format keeps one card per file — the property that makes agent edits, diffs and
merges legible — instead of inventing a multi-card file syntax to work around a
fixable fetch strategy.

---

## 21. Authoring guidance (non-normative unless marked)

- **Ids SHOULD be ULIDs** (26 characters, Crockford base32) or UUIDv7 — a
  recommendation, not a requirement: any string matching §7 is legal, including
  a meaningful slug. Random ids collide with negligible probability, so an agent
  never has to read the vault to mint one, and an opaque id never tempts anyone
  to rename it when the content changes.
- **Do not write a `deck:` key** — there is none; the directory a card sits in is
  its deck (§7). The default layout is `<deck segment>/<deck segment>/<id>.md`,
  which also lets `![[id]]` resolve in Markdown editors that support embeds.
  Follow the vault if it already uses another layout.
- New cards enter the queue in vault scan order (§5), so file names do carry
  ordering meaning even though the format places no constraint on them.
- Keep a card to one question. Prefer shortening a back over splitting a card:
  splitting mints a new id and abandons the original's history.
- **Enumerations and shared text are written as one question per card plus an
  `ask: false` reference card.** A set the learner must produce whole ("name all
  three elements") is one card whose back is the set; facts each recallable on
  their own are one card each. When several cards need the same passage, put it
  in one `ask: false` card and reference it with `![[id]]` from the others. That
  is why the format needs no in-card deletion syntax.
- Do not put the answer in the title of a non-reversed card (§8, normative).
- When converting from another system and a construct cannot be expressed here,
  **stop and ask a human**. Do not flatten it into prose — a silently
  down-converted card is memorized as if it were correct.

---

## 22. Non-goals

Frozen for v2. These MUST NOT be added by an implementation:

- In-app card editing. Agents and humans write cards; apps write only §19.
- A server. The backend is a Git host.
- **Cloze deletions.** v2 has no in-card deletion syntax and no `#c<N>` item ids;
  an enumeration is one card per question plus an `ask: false` reference card
  (§21). If cloze is ever needed it arrives under `format: 3` (§7).
- A `deck:` key, or any other way to override the deck a card's directory gives
  it (§7).
- Lint suppression of any kind: no per-card comment, no per-deck config file (§17).
- `.apkg` or any other application-specific package format, imported or exported.
- Type-in answers, image occlusion, and audio: **they are not expressible**. A
  converter that meets one MUST stop and ask a human (§21).
- Analytics or tracking SDKs.
- App-defined vocabulary inside card content: no deck name, tag, marker word, or
  message text invented by the app ever appears in a card (§15).
- Reference depth beyond one level, and reference labels (`![[id|label]]`): the
  target's title is the label.

### Rationale

Each was rejected because it either duplicates something the vault (Git) already
does, or adds a second way to express something the format already expresses
once. The `format` key (§7) exists so a later version can reopen any of them
without a v2 reader misreading a card it was not built for.

---

## Trademarks and independence

Anchor is an independent format, not affiliated with, sponsored by, or endorsed
by any other flashcard, note-taking, or AI product, and it takes no code or file
format from one. Where it describes a convention another product also uses — the
`![[...]]` embed line is the only one — that says what the bytes mean here, and
claims no compatibility. Product names elsewhere in this repository are the
trademarks of their owners.
