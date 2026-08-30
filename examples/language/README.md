# language — worked examples

Nine cards for an English speaker learning Japanese: a reversed vocabulary card,
four one-question grammar and reading cards, and a four-file group showing how a
conjugation table is written now that the format has no cloze. **These are
formatting samples.** The grammar in them is ordinary textbook material, but the
directory exists to demonstrate a file format, not to teach Japanese. This file
has no frontmatter, so it is not a card, only a skipped `.md` file.

## Files

| File | Asks |
|---|---|
| `01M1AJMAQGD6F745JFQWG9GGKD.md` | 建物 — vocabulary, `reverse: true`, no front region |
| `01M1AJRGGRDN3HC0DCGVMWKS98.md` | Why が and not は when a subject is first introduced |
| `01M1AJWPA07JAD0RKTWF1KT15Y.md` | The negative of 知っています |
| `01M1AK0W386K48CH3F9TMRBRJD.md` | あげる or くれる for a gift to the speaker (has a hint) |
| `01M1AK51WGRD851ZRB6W56496K.md` | Readings of 一人, 二人, 三人 |
| `01M1AK97PVJA1Q063702FFQ5JN.md` | How the te-form is built — `ask: false`, reference target only |
| `01M1AK97Q2G26C1H25FH27D33M.md` | Godan う / つ / る → って |
| `01M1AK97Q9HGYEWXTPTP3ZBDA9.md` | Godan む / ぶ / ぬ → んで |
| `01M1AK97QG9SFKMPRCGCJQYSFC.md` | Godan く / ぐ / す → いて, いで, して (has a hint) |

Filenames are ULIDs, so byte order is authoring order, and that is the order new
cards enter the queue (SPEC §5, §21). The deck is `language`, taken from the
directory name; there is no `deck:` key that could say otherwise (SPEC §7).

## How a conjugation table is written here

A te-form table is the textbook case for cloze: one grid, a deletion over every
cell. This format has no cloze deletions and will never add them (SPEC §22), so
the table is written the way SPEC §21 prescribes — **one question per row, plus
one `ask: false` card for the framing every row shares.**

`01M1AK97PVJA1Q063702FFQ5JN.md` is that framing card. It holds what is true of
the whole table: the te-form comes off the dictionary form, ichidan verbs and the
two irregulars are handled separately, and every godan rule doubles as a rule for
the plain past. It is `ask: false`, so it is never scheduled and exists only as a
`![[id]]` target. The three godan cards are ordinary cards that pull it in.

**Rows, not cells.** Each card asks for a whole group — う/つ/る → って — because
that group is what you have to produce in one go when you meet an unfamiliar
verb, and because the three endings in a group are one fact, not three. Between
groups it is the opposite: knowing んで tells you nothing about いで, the groups
are learned and forgotten independently, so they get independent cards and
therefore independent schedules. That is the same test SPEC §21 states — a set
you must produce whole is one card; facts recallable on their own are one card
each — applied twice, in opposite directions, in the same table.

What this buys over one cloze grid:

1. The shared framing is corrected in one place, and all three cards change with
   it. Copied into three files, the copies drift.
2. A row you keep failing comes back sooner on its own, instead of being dragged
   through the schedule of the rows you already know.
3. Adding the ichidan rule or the irregulars as their own cards later is a new
   file each, touching nothing that exists and disturbing no review history.

One placement detail worth copying: the `![[id]]` line goes **inside the back**.
References expand only there (SPEC §11) — put one in the front and the linter
reports `ref-in-front`, put one after `<!-- note -->` and it silently stays
literal text, because a note is not a back.

## What this deck deliberately does not do

1. It puts no reference on the vocabulary or reading cards. A word's meaning
   already fits on its own card, and a reference there would paste the same
   paragraph into every review of every word that touched it. Indirection is
   worth it when several cards genuinely share a passage, and not before.
2. It puts no hint on the reversed card — a hint is shown on the front side of
   every item a card produces, so a reading hint would hand over the answer in
   the English-to-Japanese direction (SPEC §13).
3. It writes no `$` math and no images.

The reversed card shows why the title is the only place its Japanese can live:
the title is hidden on the reversed front and revealed on its back (SPEC §8).
