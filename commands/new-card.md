---
description: Write new Anchor cards from material — mints ids, writes one file per card, lints the result.
argument-hint: [topic, pasted text, or a path to read from]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, AskUserQuestion
---

# New Anchor card

Material: **$ARGUMENTS**

If that is empty, the material is what we were just discussing. If it names a file, read it. If it is
a bare topic with nothing behind it, ask what should be memorised — a card invented from nothing is
worse than no card.

Follow the `anchor-cards` skill end to end: read `SPEC.md` and the vault's own conventions first,
look for existing cards, decide the questions before minting ids, write, lint, report.
This command adds no rules of its own.

If the material needs something `SPEC.md` §13 lists as not in v2, stop and say so.
