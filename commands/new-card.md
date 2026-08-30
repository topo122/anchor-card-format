---
description: Write new Anchor cards from material — mints a fresh id, files it in the directory that is its deck, lints the result.
argument-hint: [topic, pasted text, or a path to read from]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, AskUserQuestion
---

# New Anchor card

Material: **$ARGUMENTS**

If that is empty, the material is whatever we were just discussing. If it names a file, read the
file. If it is a topic with nothing behind it, ask what should be memorised before writing anything —
a card invented from nothing is worse than no card.

## 1. Load the rules

Use the `anchor-cards` skill and follow the reading order it gives: the vault's `AGENTS.md` first
(vault-specific things — layout, deck naming, which lint command), then `llms.txt`, then `SPEC.md`
for anything they do not answer. This command adds no format rules of its own; do not write a card
from memory.

## 2. Find the vault and copy its shape

```bash
grep -rh '^id: ' --include='*.md' . | sort   # every id already in use
```

Use **Grep**/**Glob** rather than shelling out where you can; a vault can hold 20k cards.

Open two or three existing cards near the target deck and copy their layout, frontmatter style, and
tone. Default layout is `<Deck>/<Subdeck>/<id>.md`: the directory path **is** the deck, and there is
no `deck:` key to override it. Follow the vault if it differs.

Before writing, check whether a card for this already exists (`grep -rli '<keyword>' --include='*.md' .`).
If one does, **edit that card and keep its id** — do not add a near-duplicate. Two cards with the
same title and front are flagged `duplicate-content`, and the vault gets two schedules for one fact.

## 3. Decide what each card asks

One card asks one thing. Split the material into questions *before* anything gets an id — after that,
splitting a card costs its review history.

Pick the shape per card using the table in the `anchor-cards` skill: basic · title-only · `reverse:
true` · `ask: false` (text several cards share, pulled in with `![[id]]`).

An enumeration is not one card with holes in it: if the learner must produce the whole set, the set
is one back; if each entry stands on its own, write one card per entry and put the shared framing in
an `ask: false` card the others reference.

If the material needs type-in answers, image occlusion, audio, `![[id|label]]`, or reference depth
beyond one level: **stop and say so**. Those are not expressible and must not be flattened into
prose.

## 4. Mint one id per card

```bash
python3 -c "import os,time;a='0123456789ABCDEFGHJKMNPQRSTVWXYZ';n=int(time.time()*1000)<<80|int.from_bytes(os.urandom(10),'big');print(''.join(a[(n>>s)&31] for s in range(125,-1,-5)))"
```

Fallbacks if there is no python3: `LC_ALL=C tr -dc '0123456789ABCDEFGHJKMNPQRSTVWXYZ' </dev/urandom | head -c 26; echo`
(random, not time-sortable) or `uuidgen`.

Mint one per card and check every one against the ids from step 2. A duplicate id breaks **both**
cards — neither is scheduled. Never reuse the id of a deleted card.

## 5. Write the files

Start from the skeleton and the region table in the vault's `AGENTS.md` (§2), and check what you
wrote against its §3 before moving on. Copy a neighbouring card's frontmatter style rather than
inventing one.

## 6. Lint and report

Run the vault's linter over the files you wrote — the command is the one the vault's `CLAUDE.md`
names. Fix every error before reporting: an error card is dropped from the study queue and stops
resolving as a `![[id]]` target.

Report, in a few lines:

- each file path, its id, and its deck
- how many study items each card produces (one, or two with `reverse: true`)
- the lint result — or, if no linter is installed here, say that plainly and state that you
  hand-checked instead. Never report an unchecked card as verified.
