// The Card value, study items and reference expansion.
// SPEC.md §11 (expansion), §12, §13.

import assert from 'node:assert/strict';
import test from 'node:test';

import { f, lint, lintOne, ruleIds } from './helpers.js';

const card = (lines, id = 'CARD0001') => ['---', `id: ${id}`, '---', '', ...lines].join('\n');

test('absent regions are absent keys, never null and never empty strings', () => {
  const result = lintOne(card(['# Ubiquitous', '', '<!-- back -->', 'Everywhere.']));
  const value = result.cards.get('Cards/CARD0001.md');
  assert.equal('front' in value, false);
  assert.equal('hint' in value, false);
  assert.equal('note' in value, false);
  assert.deepEqual(Object.keys(value).sort(), ['ask', 'back', 'deck', 'extra', 'id', 'items', 'reverse', 'tags', 'title']);
});

test('a card asked by its title alone is legal and normal', () => {
  const result = lintOne(card(['# Ubiquitous', '', '<!-- back -->', 'Everywhere.']));
  assert.deepEqual(ruleIds(result), []);
  assert.deepEqual(result.items.get('CARD0001'), {
    front: 'Ubiquitous',
    back: 'Ubiquitous\n\nEverywhere.',
  });
});

test('deck is the directory path and nothing overrides it', () => {
  const derived = lint([f('Statistics/Fundamentals/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.']))]);
  assert.deepEqual(derived.cards.get('Statistics/Fundamentals/CARD0001.md').deck, ['Statistics', 'Fundamentals']);

  const root = lint([f('CARD0001.md', card(['# T', '', '<!-- back -->', 'A.']))]);
  assert.deepEqual(root.cards.get('CARD0001.md').deck, []);

  // There is no `deck` key: it is an unknown key, kept in `extra` and ignored.
  const attempted = lint([
    f('Statistics/CARD0001.md', ['---', 'id: CARD0001', 'deck: Other/Place', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n')),
  ]);
  const value = attempted.cards.get('Statistics/CARD0001.md');
  assert.deepEqual(value.deck, ['Statistics']);
  assert.deepEqual(value.extra, { deck: 'Other/Place' });
  assert.deepEqual(ruleIds(attempted), ['unknown-key']);
});

test('reverse adds a second item whose front is the back with the title hidden', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', 'reverse: true', '---', '', '# Ubiquitous', '', 'Register?', '', '<!-- back -->', 'Everywhere.'].join('\n'),
  );
  const value = result.cards.get('Cards/CARD0001.md');
  assert.deepEqual(value.items, ['CARD0001', 'CARD0001#r']);
  assert.deepEqual(result.items.get('CARD0001#r'), {
    front: 'Everywhere.',
    back: 'Ubiquitous\n\nRegister?',
  });
});

test('ask: false yields a Card with a back and no items', () => {
  const result = lintOne(['---', 'id: CARD0001', 'ask: false', '---', '', '# Shared', '', 'Body text.', ''].join('\n'));
  assert.deepEqual(ruleIds(result), []);
  const value = result.cards.get('Cards/CARD0001.md');
  assert.equal('front' in value, false);
  assert.equal(value.back, 'Body text.');
  assert.deepEqual(value.items, []);
  assert.equal(result.items.size, 0);
});

test('hint is on the front side of every item and note rides along', () => {
  const result = lintOne(
    card(['# T', '', 'Q.', '', '<!-- hint -->', 'H.', '', '<!-- back -->', 'A.', '', '<!-- note -->', 'N.']),
  );
  assert.deepEqual(result.items.get('CARD0001'), {
    front: 'T\n\nQ.',
    back: 'T\n\nA.',
    hint: 'H.',
    note: 'N.',
  });
});

test('a reference expands into exactly blank, quoted title, blank, back, blank', () => {
  const result = lint([
    f('Cards/CARD0001.md', card(['# Elements', '', '<!-- back -->', 'Three elements:', '', '![[CARD0002]]', '', 'and material.'])),
    f('Cards/CARD0002.md', ['---', 'id: CARD0002', 'ask: false', '---', '', '# Shared', '', 'One.', '', 'Two.'].join('\n')),
  ]);
  assert.deepEqual(ruleIds(result), []);
  assert.equal(
    result.items.get('CARD0001').back,
    'Elements\n\nThree elements:\n\n\n> Shared\n\nOne.\n\nTwo.\n\n\nand material.',
  );
  // The stored region is unexpanded.
  assert.equal(result.cards.get('Cards/CARD0001.md').back, 'Three elements:\n\n![[CARD0002]]\n\nand material.');
});

test('expansion is one level deep: a reference inside the target stays literal', () => {
  const result = lint([
    f('a.md', card(['# A', '', '<!-- back -->', '![[CARD0002]]'], 'CARD0001')),
    f('b.md', ['---', 'id: CARD0002', 'ask: false', '---', '', '# B', '', 'Sees ![[CARD0003]] below.', '', '![[CARD0003]]'].join('\n')),
    f('c.md', ['---', 'id: CARD0003', 'ask: false', '---', '', '# C', '', 'Deepest.'].join('\n')),
  ]);
  const back = result.items.get('CARD0001').back;
  assert.ok(back.includes('![[CARD0003]]'), back);
  assert.ok(!back.includes('Deepest.'), back);
});

test('a card with an error keeps its Card value but is excluded from items and from resolution', () => {
  const result = lint([
    f('a.md', card(['# A', '', '<!-- back -->', '![[CARD0002]]'], 'CARD0001')),
    // CARD0002 has an error (empty back), so it must not resolve.
    f('b.md', card(['# B', '', 'Q.', '', '<!-- back -->', ''], 'CARD0002')),
  ]);
  assert.deepEqual(ruleIds(result), ['ref-unresolved', 'back-empty']);
  assert.equal(result.cards.size, 2);
  assert.equal(result.items.has('CARD0002'), false);
  assert.equal(result.items.get('CARD0001').back, 'A\n\n![[CARD0002]]');
  assert.equal(result.counts.cardsInError, 1);
});
