# Anchor Card Format

Markdown flashcards: one card is one Markdown file in a Git repository you own. AI agents and people
write the cards; the Anchor apps (iOS, Android, macOS) only read them and append a review log next to
them. Nothing is locked inside an app, so there is nothing to export.

```markdown
---
id: stat-sd-reading
deck: Statistics/Basics
---

# What standard deviation tells you

Two datasets have the same mean. Which single number says which one is more spread out?

<!-- back -->

**Definition** [[stat-sd-def]]

It has the same unit as the data.
```

## The rules live in one place

**[`SPEC.md`](SPEC.md) is the only document that states the format.** Everything else in this
repository — this README, `llms.txt`, the templates, the plugin — points to it and adds no rules.
If you find a rule written anywhere else, that copy is a bug.

## Lint

Node.js 20 or newer, no install:

```console
$ node lint/anchor-lint.mjs path/to/your/vault
```

Exit `1` if any card has an error. `lint/anchor-lint.mjs` is **generated** from the apps' own parser
and lint (so the linter can never read a card differently from the apps); do not edit it by hand.
Messages are currently in Japanese.

## Plugin for Claude Code (optional)

```
/plugin marketplace add topo122/anchor-card-format
/plugin install anchor@anchor-format
```

Adds the `anchor-cards` skill (the writing procedure), `/anchor:new-card`, `/anchor:fix-card`, and a
hook that lints a card right after it is written.

Without the plugin, copy [`templates/`](templates/) into your vault root: `AGENTS.md` tells any agent
to read `SPEC.md` before writing.

## Repository

| Path | What |
|---|---|
| [`SPEC.md`](SPEC.md) | The specification. Single source of truth. |
| [`llms.txt`](llms.txt) | Index for AI readers (links only). |
| [`lint/`](lint/) | Reference linter (generated). |
| [`templates/`](templates/) | `AGENTS.md`, `CLAUDE.md`, `.gitignore` for a vault root. |
| [`examples/`](examples/) | Lint-clean cards in four subjects. |
| [`skills/`](skills/), [`commands/`](commands/), [`hooks/`](hooks/) | The Claude Code plugin. |

## License

`SPEC.md` and `llms.txt`: CC BY 4.0 ([`LICENSE-SPEC`](LICENSE-SPEC)). Everything else: MIT ([`LICENSE`](LICENSE)).
