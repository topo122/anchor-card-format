// The traps: the places where a "reasonable" implementation silently diverges.
// SPEC.md §3 (bytes), §4 (parser scope), §6, §8, §9, §10, §11.

import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';

import { f, has, lint, lintOne, ruleIds } from './helpers.js';

const CLEAN = [
  '---',
  'id: CARD0001',
  '---',
  '',
  '# Title',
  '',
  'Front text.',
  '',
  '<!-- back -->',
  'Answer.',
];

const cardOf = (result, path = 'Cards/CARD0001.md') => result.cards.get(path);

// ---- line terminators (§3) ------------------------------------------------

test('CRLF line endings parse exactly like LF', () => {
  const result = lintOne(`${CLEAN.join('\r\n')}\r\n`);
  assert.deepEqual(ruleIds(result), []);
  const card = cardOf(result);
  assert.equal(card.title, 'Title');
  assert.equal(card.front, 'Front text.');
  assert.equal(card.back, 'Answer.');
});

test('lone CR line endings parse exactly like LF', () => {
  const result = lintOne(`${CLEAN.join('\r')}\r`);
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).back, 'Answer.');
});

test('U+2028, U+000B and U+0085 are ordinary in-line characters', () => {
  const result = lintOne(CLEAN.join('\n').replace('Front text.', 'a\u2028b\u000bc\u0085d'));
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).front, 'a\u2028b\u000bc\u0085d');
});

test('a final line terminator adds no empty line', () => {
  const withNewline = lintOne(`${CLEAN.join('\n')}\n`);
  const withoutNewline = lintOne(CLEAN.join('\n'));
  assert.equal(cardOf(withNewline).back, cardOf(withoutNewline).back);
});

// ---- BOM (§3) --------------------------------------------------------------

test('one leading BOM is removed before anything else', () => {
  const result = lintOne(`\ufeff${CLEAN.join('\n')}\n`);
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).id, 'CARD0001');
});

test('a second BOM is ordinary text, so the frontmatter no longer opens the file', () => {
  const result = lintOne(`\ufeff\ufeff${CLEAN.join('\n')}\n`);
  // Not a card (no frontmatter) but it has a `<!-- back -->` line, so §5 says
  // this is id-missing rather than a silent skip.
  assert.deepEqual(ruleIds(result), ['id-missing']);
  assert.equal(result.cards.size, 0);
});

test('invalid UTF-8 never becomes U+FFFD', () => {
  const result = lint([{ path: 'a.md', bytes: Buffer.from([0x23, 0x20, 0x80, 0x0a]), size: 4 }]);
  assert.deepEqual(ruleIds(result), ['encoding-invalid']);
  assert.equal(result.cards.size, 0);
});

// ---- whitespace (§3) -------------------------------------------------------

test('NBSP is content: it is not trimmed and a NBSP-only line is not blank', () => {
  const result = lintOne(['---', 'id: CARD0001', '---', '', '# \u00a0Title\u00a0', '', '<!-- back -->', '\u00a0'].join('\n'));
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).title, '\u00a0Title\u00a0');
  assert.equal(cardOf(result).back, '\u00a0');
});

test('a line of only tabs and spaces is blank and is stripped from a region edge', () => {
  const result = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', ' \t ', 'A.', '', '\t'].join('\n'));
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).back, 'A.');
});

test('interior blank lines are kept exactly', () => {
  const result = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', 'a', '', '', 'b'].join('\n'));
  assert.equal(cardOf(result).back, 'a\n\n\nb');
});

// ---- frontmatter (§6) ------------------------------------------------------

test('`----` is not a delimiter and `...` is not a terminator', () => {
  assert.deepEqual(ruleIds(lintOne('---\nid: CARD0001\n----\n\n# T\n')), ['frontmatter-unterminated']);
  assert.deepEqual(ruleIds(lintOne('---\nid: CARD0001\n...\n\n# T\n')), ['frontmatter-unterminated']);
});

test('a delimiter with a trailing space is not a delimiter', () => {
  // `--- ` did not open frontmatter, so this file is not a card at all — and
  // because it has a `<!-- back -->` line, §5 reports it instead of skipping.
  const withBack = lintOne('--- \nid: CARD0001\n---\n\n# T\n\n<!-- back -->\nA.\n');
  assert.deepEqual(ruleIds(withBack), ['id-missing']);
  assert.equal(withBack.cards.size, 0);

  const withoutBack = lintOne('--- \nid: CARD0001\n---\n\n# T\n');
  assert.deepEqual(ruleIds(withoutBack), []);
  assert.equal(withoutBack.cards.size, 0);
});

test('a colon must be followed by a space or end of line', () => {
  const result = lintOne('---\nid:CARD0001\n---\n\n# T\n\n<!-- back -->\nA.\n');
  // No `id` key was parsed, so the file is not a card; the `<!-- back -->`
  // line is what makes it report instead of vanishing.
  assert.deepEqual(ruleIds(result).sort(), ['frontmatter-syntax', 'id-missing']);
});

test('values are always strings — no type inference', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', 'x-date: 2026-08-31', 'x-n: 011', 'x-b: no', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'),
  );
  const card = cardOf(result);
  assert.equal(card.extra['x-date'], '2026-08-31');
  assert.equal(card.extra['x-n'], '011');
  assert.equal(card.extra['x-b'], 'no');
});

test('one matching quote pair is stripped and no escape is processed', () => {
  const result = lintOne(['---', 'id: CARD0001', 'x-q: "a\\nb"', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.equal(cardOf(result).extra['x-q'], 'a\\nb');
  assert.equal([...cardOf(result).extra['x-q']].length, 4);
});

test('only the unquoted tokens true and false are booleans', () => {
  assert.ok(has(lintOne('---\nid: CARD0001\nask: "false"\n---\n\n# T\n\n<!-- back -->\nA.\n'), 'frontmatter-syntax'));
  assert.ok(has(lintOne('---\nid: CARD0001\nask: no\n---\n\n# T\n\n<!-- back -->\nA.\n'), 'frontmatter-syntax'));
  assert.deepEqual(ruleIds(lintOne('---\nid: CARD0001\nask: true\n---\n\n# T\n\n<!-- back -->\nA.\n')), []);
});

test('block lists need exactly two spaces, and other YAML shapes are errors', () => {
  const ok = lintOne(['---', 'id: CARD0001', 'tags:', '  - one', '  - two', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.deepEqual(ruleIds(ok), []);
  assert.deepEqual(cardOf(ok).tags, ['one', 'two']);

  const badIndent = lintOne(['---', 'id: CARD0001', 'tags:', '   - one', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.ok(has(badIndent, 'frontmatter-syntax'));

  const nested = lintOne(['---', 'id: CARD0001', 'meta:', '  author: k', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.ok(has(nested, 'frontmatter-syntax'));

  const upperKey = lintOne(['---', 'id: CARD0001', 'Deck: X', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.ok(has(upperKey, 'frontmatter-syntax'));

  const scalarTags = lintOne(['---', 'id: CARD0001', 'tags: foo', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.ok(has(scalarTags, 'frontmatter-syntax'));
});

test('a frontmatter comment and blank lines are ignored', () => {
  const result = lintOne(['---', '# a comment', '', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'));
  assert.deepEqual(ruleIds(result), []);
});

// ---- title (§8) ------------------------------------------------------------

test('the closing sequence of an ATX title is kept', () => {
  const result = lintOne(['---', 'id: CARD0001', '---', '', "# Bayes' rule #", '', '<!-- back -->', 'A.'].join('\n'));
  assert.equal(cardOf(result).title, "Bayes' rule #");
});

test('setext headings and H2 are not titles', () => {
  assert.ok(has(lintOne('---\nid: CARD0001\n---\n\nUbiquitous\n==========\n'), 'title-missing'));
  assert.ok(has(lintOne('---\nid: CARD0001\n---\n\n## Two hashes\n'), 'title-missing'));
  assert.ok(has(lintOne('---\nid: CARD0001\n---\n\n #  Indented\n'), 'title-missing'));
  assert.ok(has(lintOne('---\nid: CARD0001\n---\n\n#NoSpace\n'), 'title-missing'));
});

test('a later # line is body text, not a title', () => {
  const result = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '# Not a title'].join('\n'));
  assert.deepEqual(ruleIds(result), []);
  assert.equal(cardOf(result).back, '# Not a title');
});

// ---- markers and fences (§9, §10) -----------------------------------------

test('a marker inside a fence is content, not a marker', () => {
  const result = lintOne(
    [
      '---',
      'id: CARD0001',
      '---',
      '',
      '# How Anchor cards are written',
      '',
      '<!-- back -->',
      'The answer side starts after this line:',
      '',
      '```markdown',
      '<!-- back -->',
      '```',
      '',
      'The line inside the fence is content.',
    ].join('\n'),
  );
  assert.deepEqual(ruleIds(result), []);
  assert.ok(cardOf(result).back.includes('<!-- back -->'));
});

test('a fenced <!-- back --> does not turn a non-card into id-missing', () => {
  const result = lintOne('# Doc\n\n```\n<!-- back -->\n```\n', 'Notes/doc.md');
  assert.deepEqual(ruleIds(result), []);
  assert.equal(result.cards.size, 0);
  assert.equal(result.skipped.length, 1);
});

test('near-miss markers are errors, look-alike lines are plain text', () => {
  const indented = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '    <!-- back -->', 'A.'].join('\n'));
  assert.deepEqual(ruleIds(indented).sort(), ['back-missing', 'marker-malformed']);

  const quoted = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '> <!-- back -->', 'A.'].join('\n'));
  assert.deepEqual(ruleIds(quoted), ['back-missing']);

  const inCode = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '`<!-- back -->`', 'A.'].join('\n'));
  assert.deepEqual(ruleIds(inCode), ['back-missing']);

  const trailingSpace = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back --> ', 'A.'].join('\n'));
  assert.ok(has(trailingSpace, 'marker-malformed'));

  const upper = lintOne(['---', 'id: CARD0001', '---', '', '# T', '', '<!-- Back -->', 'A.'].join('\n'));
  assert.ok(has(upper, 'marker-malformed'));
});

test('fences close only on the same character and at least the same length', () => {
  const tilde = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '~~~', '```text', '~~~~', 'done'].join('\n'),
  );
  assert.deepEqual(ruleIds(tilde), []);

  const mismatched = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '~~~', 'text', '```'].join('\n'),
  );
  assert.deepEqual(ruleIds(mismatched), ['fence-unterminated']);

  const tooShort = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '````', 'text', '```', 'more', '````'].join('\n'),
  );
  assert.deepEqual(ruleIds(tooShort), []);
});

test('a four-space indented block is not a code block to Anchor', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '    <!-- hint -->', '', '<!-- back -->', 'A.'].join('\n'),
  );
  // The indented line is body text (markers need column 0) and a near miss.
  assert.ok(has(result, 'marker-malformed'));
  assert.ok(!has(result, 'empty-region'));
});

test('markers are recognised only outside fences when counting duplicates', () => {
  const result = lintOne(
    [
      '---',
      'id: CARD0001',
      '---',
      '',
      '# T',
      '',
      '<!-- hint -->',
      'H.',
      '',
      '<!-- back -->',
      '```',
      '<!-- hint -->',
      '<!-- note -->',
      '```',
    ].join('\n'),
  );
  assert.deepEqual(ruleIds(result), []);
});

// ---- references (§11) ------------------------------------------------------

test('a reference inside a fence stays literal and is never resolved', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '```', '![[NOSUCHCARD]]', '```'].join('\n'),
  );
  assert.deepEqual(ruleIds(result), []);
});

test('plain [[...]] never produces a diagnostic', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '[[CARD0002]]', 'x[[1]] in R', '[[a, b]]'].join('\n'),
  );
  assert.deepEqual(ruleIds(result), []);
});

test('an indented whole-line reference is still a reference', () => {
  const result = lint([
    f('Cards/CARD0001.md', ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '  ![[CARD0002]]  '].join('\n')),
    f('Cards/CARD0002.md', ['---', 'id: CARD0002', 'ask: false', '---', '', '# Shared', '', 'Text.'].join('\n')),
  ]);
  assert.deepEqual(ruleIds(result), []);
  assert.equal(result.items.get('CARD0001').back, 'T\n\n> Shared\n\nText.');
});

test('column is a 1-based UTF-8 byte offset', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '日本語 ![[CARD0002]] tail'].join('\n'),
  );
  const inline = result.diagnostics.find((d) => d.rule === 'ref-inline');
  assert.equal(inline.line, 8);
  assert.equal(inline.column, 11);
});

// ---- U+2028 / U+2029 are ordinary characters inside a line (§3) ------------
//
// The host regex engine excludes them from `.`, so a pattern written with `.`
// silently rejects a line that the format says is perfectly ordinary.

test('a title containing U+2028 is a title, not a missing one', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# Before\u2028After', '', '<!-- back -->', 'Answer.'].join('\n'),
  );
  assert.deepEqual(ruleIds(result), []);
  // The separator is content: it is neither a line break nor trimmed away.
  assert.equal(cardOf(result).title, 'Before\u2028After');
});

test('a frontmatter value containing U+2029 is an ordinary string', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', 'x-source: a\u2029b', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'),
  );
  assert.deepEqual(ruleIds(result), ['unknown-key']);
  assert.equal(cardOf(result).extra['x-source'], 'a\u2029b');
});

test('a whole-line reference look-alike containing U+2028 is still reported', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', 'A.', '', '![[a\u2028b]]'].join('\n'),
  );
  // "`![[` + anything + `]]`" (§11) means anything, so this is ref-not-an-id
  // and stays literal — not a line the scanner fails to see at all.
  assert.deepEqual(ruleIds(result), ['ref-not-an-id']);
  assert.ok(cardOf(result).back.endsWith('![[a\u2028b]]'));
});

// ---- YAML features the subset does not have (§6) ---------------------------

test('block scalars, anchors and aliases are errors, never silently ignored', () => {
  for (const value of ['|', '>', '|-', '>+', '|2', '|2-', '&base', '&base value', '*base']) {
    const result = lintOne(
      ['---', 'id: CARD0001', `x-note: ${value}`, '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'),
    );
    assert.deepEqual(ruleIds(result), ['frontmatter-syntax'], `${value} should be frontmatter-syntax`);
    // The key is rejected outright rather than kept as the string "|".
    assert.equal(cardOf(result).extra['x-note'], undefined);
  }
});

test('a block scalar in a tag list is an error, reported once', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', 'tags:', '  - real', '  - *alias', '  - also-real', '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'),
  );
  assert.deepEqual(ruleIds(result), ['frontmatter-syntax']);
  assert.equal(result.diagnostics[0].line, 5);
  // The whole key is dropped; the remaining items do not each raise their own.
  assert.deepEqual(cardOf(result).tags, []);
});

test('values that merely contain & > * are ordinary strings', () => {
  // A rule that fires on a correct card is a defect (§17): these are not YAML
  // constructs, and flagging them would break real cards.
  for (const value of ['Casella & Berger', '5 > 4', 'a * b', '*', '|pipe|', 'x |'] ) {
    const result = lintOne(
      ['---', 'id: CARD0001', `x-note: ${value}`, '---', '', '# T', '', '<!-- back -->', 'A.'].join('\n'),
    );
    assert.deepEqual(ruleIds(result), ['unknown-key'], `${value} should be an ordinary string`);
    assert.equal(cardOf(result).extra['x-note'], value);
  }
});

// ---- no suppression (§17) --------------------------------------------------

test('there is no suppression comment: a disable line is ordinary content', () => {
  const result = lintOne(
    [
      '---',
      'id: CARD0001',
      '---',
      '',
      '# T',
      '',
      '<!-- back -->',
      '<!-- anchor-disable: back-too-long -->',
      'x'.repeat(1300),
    ].join('\n'),
  );
  // The line is an unknown HTML comment, shown literally, and it suppresses
  // nothing: the warning it names still fires.
  assert.deepEqual(ruleIds(result).sort(), ['back-too-long', 'marker-unknown']);
  assert.ok(cardOf(result).back.startsWith('<!-- anchor-disable: back-too-long -->'));
});

// ---- ordering (§5, §16) ----------------------------------------------------

test('diagnostics are ordered by UTF-8 path bytes, then line, column, rule', () => {
  const broken = (id) => ['---', `id: ${id}`, '---', '', '# T'].join('\n');
  const result = lint([
    f('b.md', broken('CARD00B')),
    f('A.md', broken('CARD00A')),
    f('a.md', broken('CARD00C')),
  ]);
  // Uppercase sorts before lowercase in UTF-8 byte order, not in a locale order.
  assert.deepEqual([...new Set(result.diagnostics.map((d) => d.path))], ['A.md', 'a.md', 'b.md']);
  // All three sit on the same line and column, so the rule id breaks the tie.
  assert.deepEqual(ruleIds(result), [
    'back-missing', 'duplicate-content',
    'back-missing', 'duplicate-content',
    'back-missing', 'duplicate-content',
  ]);
});

test('two diagnostics on one line are ordered by column then rule', () => {
  const result = lintOne(
    ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', 'See ![[CARD0002]] and ![[CARD0003]].'].join('\n'),
  );
  const columns = result.diagnostics.map((d) => d.column);
  assert.deepEqual(columns, [...columns].sort((a, b) => a - b));
  assert.equal(result.diagnostics.length, 2);
});
