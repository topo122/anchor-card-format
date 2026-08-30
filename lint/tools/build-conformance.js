#!/usr/bin/env node
// Regenerate spec/conformance/ from the shared case list (SPEC.md §2).
//
//   node lint/tools/build-conformance.js
//
// The corpus is checked in, and lint/test/conformance.test.js fails if what is
// on disk no longer matches what the implementation produces. Regenerating is
// therefore a deliberate act: run this only after changing SPEC.md and the
// implementation together, and read the diff.

import fs from 'node:fs';
import path from 'node:path';

import { lintFiles } from '../src/index.js';
import {
  canonicalJson,
  CORPUS_DIR,
  corpusCases,
  expectedValue,
} from './conformance.js';

const README = `# spec/conformance/ — the conformance corpus

**Not a specification.** SPEC.md is the only normative source for the Anchor
Card Format; this directory is the machine gate that keeps independent
implementations from drifting apart (SPEC.md §2). Where the corpus and SPEC.md
disagree, SPEC.md is right and the corpus has a bug — fix the corpus.

Generated, never hand-edited:

\`\`\`
node lint/tools/build-conformance.js
\`\`\`

The inputs come from \`lint/test/cases.js\`, the same list the rule tests use, so
a rule cannot be added without gaining a corpus case.

## Case shapes

- **Single-file case** — \`NNN-name.md\` (input, linted as a one-file vault whose
  only path is that file name) plus \`NNN-name.json\` holding
  \`{"card": <Card>|null, "diagnostics": [...]}\`.
- **Vault case** — directory \`NNN-name/\` (a whole vault) plus \`NNN-name.json\`
  holding \`{"cards": {...}, "items": {...}, "diagnostics": [...]}\`.

Comparison is structural: parse both sides as JSON and compare as JSON values.
Strings must match code point for code point, an absent key differs from
\`null\`, and array order is significant.

## Not covered here

The 1 MiB card-size boundary (SPEC.md §20) has no fixture: it would be a
megabyte of padding checked into the repository. Both sides of that boundary are
checked in \`lint/test/vault.test.js\` instead.
`;

fs.rmSync(CORPUS_DIR, { recursive: true, force: true });
fs.mkdirSync(CORPUS_DIR, { recursive: true });

const cases = corpusCases();
for (const c of cases) {
  for (const file of c.files) {
    const target = path.join(CORPUS_DIR, c.kind === 'single' ? file.path : path.join(c.name, file.path));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.bytes);
  }
  const result = lintFiles(c.files.map((f) => ({ ...f })));
  const expected = expectedValue(c.kind, result, c.files);
  fs.writeFileSync(path.join(CORPUS_DIR, `${c.name}.json`), canonicalJson(expected), 'utf8');
}

fs.writeFileSync(path.join(CORPUS_DIR, 'README.md'), README, 'utf8');
console.log(`wrote ${cases.length} cases to spec/conformance/`);
