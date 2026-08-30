# Vault templates

Copy `AGENTS.md`, `CLAUDE.md` and `.gitignore` into the root of your card vault (the Git repo holding
your `.md` cards), then commit them.

`AGENTS.md` is the vault's working summary of the format — Cursor, Codex and most agent tools read it
on their own. Claude Code only auto-loads `CLAUDE.md`, whose first line is `@AGENTS.md`, so it picks
up the same page plus a few Claude-specific notes. Keep format rules in `AGENTS.md` only, so the two
can never drift apart.

Neither file is normative. `SPEC.md` at the root of this repository is the sole normative source;
`AGENTS.md` covers what an agent hits daily and ends with a pointer back to `SPEC.md` for everything
else.

**Before committing `CLAUDE.md`, put your vault's real lint command in it.** It ships with
`anchor-lint .`; `CLAUDE.md` is the only file that names the command, and `AGENTS.md`, the plugin
skill and the plugin commands all point there for it — so changing it in one place is enough. This
`README.md` is for you, not for the vault: leave it here.

The agent tools named above are other companies' products, named only to say which file each of them
reads. Anchor is an independent format and is not affiliated with, sponsored by, or endorsed by any
of them.
