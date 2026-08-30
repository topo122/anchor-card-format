// One passing case and one failing case for every rule in SPEC.md §17.
// The last test in this file fails if a rule is added without a case.
// The cases themselves live in cases.js, which also feeds spec/conformance/.

import assert from 'node:assert/strict';
import test from 'node:test';

import { RULES } from '../src/index.js';
import { CASES } from './cases.js';
import { CLEAN_CARD, f, has, lint, REFERENCE_CARD } from './helpers.js';

for (const testCase of CASES) {
  test(`${testCase.rule}: fires on the failing case`, () => {
    const result = lint(testCase.bad);
    assert.ok(
      has(result, testCase.rule),
      `expected ${testCase.rule}, got [${result.diagnostics.map((d) => d.rule).join(', ')}]`,
    );
    assert.equal(result.diagnostics.find((d) => d.rule === testCase.rule).severity, RULES[testCase.rule].severity);
  });

  test(`${testCase.rule}: silent on the passing case`, () => {
    const result = lint(testCase.good);
    assert.ok(
      !has(result, testCase.rule),
      `expected no ${testCase.rule}, got [${result.diagnostics.map((d) => d.rule).join(', ')}]`,
    );
  });
}

test('every rule in the table has a case on each side', () => {
  const covered = new Set(CASES.map((c) => c.rule));
  const missing = Object.keys(RULES).filter((rule) => !covered.has(rule));
  assert.deepEqual(missing, []);
});

test('the passing cases of the whole-card rules are completely clean', () => {
  const clean = lint([f('Cards/CARD0001.md', CLEAN_CARD), f('Cards/CARD0002.md', REFERENCE_CARD)]);
  assert.deepEqual(clean.diagnostics, []);
  assert.equal(clean.counts.cards, 2);
  assert.equal(clean.counts.cardsInError, 0);
});

test('rules deliberately absent from the spec are not implemented', () => {
  for (const forbidden of ['front-noun-phrase', 'note-no-source', 'text-in-three-cards']) {
    assert.ok(!Object.prototype.hasOwnProperty.call(RULES, forbidden));
  }
});
