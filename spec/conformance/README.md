# spec/conformance/ — the conformance corpus

**Not a specification.** SPEC.md is the only normative source for the Anchor
Card Format; this directory is the machine gate that keeps independent
implementations from drifting apart (SPEC.md §2). Where the corpus and SPEC.md
disagree, SPEC.md is right and the corpus has a bug — fix the corpus.

Generated, never hand-edited:

```
node lint/tools/build-conformance.js
```

The inputs come from `lint/test/cases.js`, the same list the rule tests use, so
a rule cannot be added without gaining a corpus case.

## Case shapes

- **Single-file case** — `NNN-name.md` (input, linted as a one-file vault whose
  only path is that file name) plus `NNN-name.json` holding
  `{"card": <Card>|null, "diagnostics": [...]}`.
- **Vault case** — directory `NNN-name/` (a whole vault) plus `NNN-name.json`
  holding `{"cards": {...}, "items": {...}, "diagnostics": [...]}`.

Comparison is structural: parse both sides as JSON and compare as JSON values.
Strings must match code point for code point, an absent key differs from
`null`, and array order is significant.

## Not covered here

The 1 MiB card-size boundary (SPEC.md §20) has no fixture: it would be a
megabyte of padding checked into the repository. Both sides of that boundary are
checked in `lint/test/vault.test.js` instead.
