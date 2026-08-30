# Anchor Card Format v2

A spaced-repetition flashcard format in which one card is one Markdown file in a Git repository you own.

## Why it exists

Your cards are plain Markdown in your own repo — readable, diffable, greppable, and yours whether or not any particular tool still exists.
AI agents write and repair the cards; you edit them in any text editor; a study app only *reads* the cards and *appends* a review log next to them.
Apps never create, modify, or delete a card file, and the format has no proprietary database and no application-specific package — there is nothing to export, because nothing was ever taken away from you.
The specification is strict enough that independent implementations produce byte-identical results from byte-identical input, so moving between them changes nothing about your cards or your history.

## A whole card

```markdown
---
id: 01JD8N2K4P7QW3ZR5T9V6X0YAB
tags: [statistics, inference]
---

# Bayes' rule

What does it compute, and from what three quantities?

<!-- hint -->
Start from the definition of conditional probability.

<!-- back -->
The posterior `P(A|B)`, from the likelihood `P(B|A)`, the prior `P(A)` and the
evidence `P(B)`:

`P(A|B) = P(B|A) * P(A) / P(B)`

<!-- note -->
The evidence is the normalising constant; it is what makes the posterior a
distribution.
```

That is the entire syntax: a frontmatter block with an `id`, an H1 title, and up to three marker
lines — `<!-- hint -->`, `<!-- back -->`, `<!-- note -->`. There is no fourth marker.

A few consequences worth knowing before you read further:

- **The directory a card sits in is its deck.** There is no `deck:` key, and no way to override the
  derived value; moving the file is how you move the card.
- **The `id` is the only key to that card's review history.** Never change it, never reuse the id of
  a deleted card. Renaming, moving, and rewriting the file are all safe.
- **`ask: false`** makes a card a reference card: it is never asked, and exists to be pulled into
  other cards' backs by a line that is exactly `![[id]]`. That is how shared text is written once
  instead of copied into five cards.

The full rules are in [`SPEC.md`](SPEC.md).

## Using it

1. **Set the vault up.** Copy [`templates/`](templates/)'s `AGENTS.md`, `CLAUDE.md` and `.gitignore`
   into the root of your card repo and commit them. `AGENTS.md` is the rulebook agents read.
2. **Have an agent write cards.** Point it at your material; it writes one file per card, files each
   one in the directory that is its deck, and keeps the ids it was given.
3. **Lint before you commit.** `anchor-lint` is the gate; a card with an error is not studied.

## Linting

Zero dependencies, Node.js 20 or newer:

```console
$ node lint/bin/anchor-lint.js examples
0 errors, 0 warnings, 0 info
29 cards, 0 in error, 0 unresolved references, 4 skipped .md files, 0 orphan log entries
```

```console
$ node lint/bin/anchor-lint.js path/to/your/vault --strict     # exit 1 on warnings too
$ node lint/bin/anchor-lint.js path/to/your/vault --format json
```

Exit codes: `0` clean, `1` lint failure, `2` bad usage. The rule set is closed — 16 errors, 12
warnings, 1 info — and there is no way to suppress a rule. A rule that fires on a correct card is a
bug in the rule.

## Plugin for Claude Code (optional)

```
/plugin marketplace add topo122/anchor-card-format
/plugin install anchor@anchor-format
```

It adds a card-authoring skill, `/anchor:new-card`, `/anchor:fix-card`, and a hook that lints every
card file right after it is written.

**The plugin is entirely optional.** `AGENTS.md` in your vault root covers what an agent hits every
day and points at [`SPEC.md`](SPEC.md) for the rest, so any agent that reads it can write valid cards
without installing anything. The plugin only saves you from re-explaining the rules.

## What is in this repository

| Path | What it is |
| --- | --- |
| [`SPEC.md`](SPEC.md) | The normative specification. The **sole** source of truth — anything here that disagrees with it is wrong, including this README. |
| [`llms.txt`](llms.txt) | The same rules compressed for AI writers and implementers. Explicitly non-authoritative. |
| [`lint/`](lint/) | `anchor-lint`: the linter and reference parser. Zero dependencies. |
| [`templates/`](templates/) | Files to copy into your vault root — `AGENTS.md`, `CLAUDE.md`, `.gitignore`. |
| [`examples/`](examples/) | Working cards in four subjects, each directory with a README explaining why the cards are cut the way they are. |
| [`skills/`](skills/), [`commands/`](commands/), [`hooks/`](hooks/) | The plugin above: authoring skill, two commands, lint-on-write hook. |
| [`spec/conformance/`](spec/conformance/) | A machine-checkable corpus derived from `SPEC.md`. Every implementation runs it in CI; one failure blocks a merge. |

## Non-goals

Frozen for v2 — these will not be added:

- **No cloze deletions.** There is no in-card deletion syntax and no `#c<N>` item ids. An enumeration
  is one card per question plus one `ask: false` reference card.
- **No compatibility with another flashcard application's package format**, imported or exported.
  Anchor takes no code and no file format from any other product.
- **No server.** The backend is a Git host.
- **No in-app card editing.** Apps write exactly two paths — the review log and a derived insights
  file — and nothing else.
- **No lint suppression, no `deck:` key, no analytics.**

The complete list is [`SPEC.md` §22](SPEC.md).

## License

Two licenses, split by what the file is:

- **The specification** — [`SPEC.md`](SPEC.md) and [`llms.txt`](llms.txt) — is licensed
  **CC BY 4.0**. See [`LICENSE-SPEC`](LICENSE-SPEC). Implement it, quote it, fork it; keep the
  attribution.
- **Everything else** — [`lint/`](lint/), [`templates/`](templates/), [`examples/`](examples/),
  [`skills/`](skills/), [`commands/`](commands/), [`hooks/`](hooks/),
  [`spec/conformance/`](spec/conformance/) — is licensed **MIT**. See [`LICENSE`](LICENSE).

## Trademarks

Anki and Obsidian are trademarks of their respective owners. This project is not affiliated with,
sponsored by, or endorsed by either of them.
