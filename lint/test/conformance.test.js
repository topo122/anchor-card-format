// The conformance corpus gate — SPEC.md §2.
//
// Every case in spec/conformance/ is replayed against this implementation and
// compared structurally. The corpus is generated from cases.js by
// lint/tools/build-conformance.js and checked in, so this test fails whenever
// behaviour changes without the corpus being regenerated on purpose.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { lintFiles, RULES } from '../src/index.js';
import { NOT_IN_CORPUS } from './cases.js';
import {
  canonicalJson,
  CORPUS_DIR,
  corpusCases,
  expectedValue,
  readCase,
} from '../tools/conformance.js';

const cases = corpusCases();

test('the corpus exists on disk', () => {
  assert.ok(fs.existsSync(CORPUS_DIR), 'spec/conformance/ is missing — run lint/tools/build-conformance.js');
  assert.ok(cases.length > 0);
});

for (const c of cases) {
  test(`corpus ${c.name}`, () => {
    const onDisk = readCase(c.name);
    assert.equal(onDisk.kind, c.kind);
    const result = lintFiles(onDisk.files);
    const actual = expectedValue(onDisk.kind, result, onDisk.files);

    const expectedPath = path.join(CORPUS_DIR, `${c.name}.json`);
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

    // Structural comparison (§2): an absent key and a null value differ, and
    // array order is significant, which deepStrictEqual already enforces.
    assert.deepStrictEqual(actual, expected);
  });
}

test('the expected files are stored canonically', () => {
  for (const c of cases) {
    const file = path.join(CORPUS_DIR, `${c.name}.json`);
    const text = fs.readFileSync(file, 'utf8');
    assert.equal(text, canonicalJson(JSON.parse(text)), `${c.name}.json is not canonical`);
    assert.ok(!text.includes('\r'), `${c.name}.json must use LF`);
  }
});

test('every rule in the table has a corpus case, or a stated reason not to', () => {
  const covered = new Set();
  for (const c of cases) {
    const match = /^\d\d\d-(.+)-(fires|clean)$/.exec(c.name);
    if (match !== null) covered.add(match[1]);
  }
  const missing = Object.keys(RULES).filter((rule) => !covered.has(rule) && !NOT_IN_CORPUS.has(rule));
  assert.deepEqual(missing, []);
});
