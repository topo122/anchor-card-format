// The shared rule-coverage case list: one failing input and one passing input
// for every rule in SPEC.md §17.
//
// This list is the single source for two things — the rule tests in
// rules.test.js and the conformance corpus under spec/conformance/ (§2), which
// is generated from it. Add a rule, add a case here, and both follow.

import { MAX_FILE_BYTES } from '../src/index.js';
import { CLEAN_CARD, f, raw, REFERENCE_CARD } from './helpers.js';

const card = (body, id = 'CARD0001') => ['---', `id: ${id}`, '---', '', ...body].join('\n');
const many = (n) => {
  const lines = ['---', 'id: CARD0001', '---', '', '# Refs', '', '<!-- back -->', 'Answer.', ''];
  for (let i = 1; i <= n; i++) lines.push(`![[REF${String(i).padStart(7, '0')}]]`, '');
  return lines.join('\n');
};

/** @type {Array<{rule: string, bad: object[], good: object[]}>} */
const CASES = [
  // ---- errors -------------------------------------------------------------
  {
    rule: 'encoding-invalid',
    bad: [raw('Cards/CARD0001.md', [0x2d, 0x2d, 0x2d, 0x0a, 0xff, 0xfe, 0x0a])],
    good: [f('Cards/CARD0001.md', CLEAN_CARD)],
  },
  {
    rule: 'file-too-large',
    bad: [{ path: 'Cards/CARD0001.md', bytes: null, size: MAX_FILE_BYTES + 1, tooLarge: true }],
    good: [{ ...f('Cards/CARD0001.md', CLEAN_CARD), size: MAX_FILE_BYTES, tooLarge: false }],
  },
  {
    rule: 'frontmatter-unterminated',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\n\n# Title\n')],
    good: [f('Cards/CARD0001.md', CLEAN_CARD)],
  },
  {
    rule: 'frontmatter-syntax',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a]\ntags: [b]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
    good: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a, b]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
  },
  {
    rule: 'format-unsupported',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\nformat: 3\n---\n\n# T\n\n<!-- back -->\nA.\n')],
    good: [f('Cards/CARD0001.md', '---\nid: CARD0001\nformat: 2\n---\n\n# T\n\n<!-- back -->\nA.\n')],
  },
  {
    rule: 'id-missing',
    bad: [f('Notes/note.md', '# Notes\n\n<!-- back -->\nSomething.\n')],
    good: [f('Notes/note.md', '# Notes\n\nJust a note, no id, silently skipped.\n')],
  },
  {
    rule: 'id-invalid',
    bad: [f('Cards/ab.md', card(['# T', '', '<!-- back -->', 'A.'], 'ab'))],
    good: [f('Cards/abc.md', card(['# T', '', '<!-- back -->', 'A.'], 'abc'))],
  },
  {
    rule: 'id-duplicate',
    bad: [
      f('Cards/a.md', card(['# One', '', '<!-- back -->', 'A.'], 'CARD0001')),
      f('Cards/b.md', card(['# Two', '', '<!-- back -->', 'B.'], 'CARD0001')),
    ],
    good: [
      f('Cards/a.md', card(['# One', '', '<!-- back -->', 'A.'], 'CARD0001')),
      f('Cards/b.md', card(['# Two', '', '<!-- back -->', 'B.'], 'CARD0002')),
    ],
  },
  {
    rule: 'tag-invalid',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a, ]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
    good: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a, b]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
  },
  {
    rule: 'title-missing',
    bad: [f('Cards/CARD0001.md', card(['Not a title.', '', '<!-- back -->', 'A.']))],
    good: [f('Cards/CARD0001.md', card(['# A title', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'marker-duplicate',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '<!-- back -->', 'B.']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'marker-order',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- note -->', 'N.', '', '<!-- back -->', 'A.']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '<!-- note -->', 'N.']))],
  },
  {
    rule: 'marker-malformed',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!--back-->', 'A.', '', '<!-- back -->', 'A.']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'back-missing',
    bad: [f('Cards/CARD0001.md', card(['# T', '', 'Question with no answer side.']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', 'Q.', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'back-empty',
    bad: [f('Cards/CARD0001.md', card(['# T', '', 'Q.', '', '<!-- back -->', '', '   ', '']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', 'Q.', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'ref-self',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[CARD0001]]']))],
    good: [
      f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[CARD0002]]'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
  },

  // ---- warnings -----------------------------------------------------------
  {
    rule: 'ref-unresolved',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[NOSUCHCARD]]']))],
    good: [
      f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[CARD0002]]'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
  },
  {
    rule: 'ref-in-front',
    bad: [
      f('Cards/CARD0001.md', card(['# T', '', '![[CARD0002]]', '', '<!-- back -->', 'A.'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
    good: [
      f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[CARD0002]]'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
  },
  {
    rule: 'ref-inline',
    bad: [
      f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'See ![[CARD0002]] for more.'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
    good: [
      f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'See below.', '', '![[CARD0002]]'])),
      f('Cards/CARD0002.md', REFERENCE_CARD),
    ],
  },
  {
    rule: 'ref-not-an-id',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '![[ CARD0002 ]]']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'In R, x[[1]] is an element.', '', '[[a, b]]']))],
  },
  {
    rule: 'ref-too-many',
    bad: [f('Cards/CARD0001.md', many(17))],
    good: [f('Cards/CARD0001.md', many(16))],
  },
  {
    rule: 'marker-unknown',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '<!-- todo -->']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'fence-unterminated',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '```js', 'let x = 1;']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '```js', 'let x = 1;', '```']))],
  },
  {
    rule: 'empty-region',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '<!-- note -->', '']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'A.', '', '<!-- note -->', 'N.']))],
  },
  {
    rule: 'back-too-long',
    bad: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'x'.repeat(1201)]))],
    good: [f('Cards/CARD0001.md', card(['# T', '', '<!-- back -->', 'x'.repeat(1200)]))],
  },
  {
    rule: 'tag-duplicate',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a, a]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
    good: [f('Cards/CARD0001.md', '---\nid: CARD0001\ntags: [a, b]\n---\n\n# T\n\n<!-- back -->\nA.\n')],
  },
  {
    rule: 'odd-dollar',
    bad: [f('Cards/CARD0001.md', card(['# T', '', 'It costs $5.', '', '<!-- back -->', 'A.']))],
    good: [f('Cards/CARD0001.md', card(['# T', '', 'It costs \\$5.', '', '<!-- back -->', 'A.']))],
  },
  {
    rule: 'duplicate-content',
    bad: [
      f('Cards/a.md', card(['# Same', '', 'Same front.', '', '<!-- back -->', 'A.'], 'CARD0001')),
      f('Cards/b.md', card(['# Same', '', 'Same front.', '', '<!-- back -->', 'B.'], 'CARD0002')),
    ],
    good: [
      f('Cards/a.md', card(['# Same', '', 'One front.', '', '<!-- back -->', 'A.'], 'CARD0001')),
      f('Cards/b.md', card(['# Same', '', 'Other front.', '', '<!-- back -->', 'B.'], 'CARD0002')),
    ],
  },

  // ---- info ---------------------------------------------------------------
  {
    rule: 'unknown-key',
    bad: [f('Cards/CARD0001.md', '---\nid: CARD0001\nx-source: Casella & Berger\n---\n\n# T\n\n<!-- back -->\nA.\n')],
    good: [f('Cards/CARD0001.md', CLEAN_CARD)],
  },
];

export { CASES };

/**
 * The corpus skips this rule: its fixture would be a megabyte of padding.
 * The 1 MiB boundary is checked on both sides in vault.test.js instead.
 */
export const NOT_IN_CORPUS = new Set(['file-too-large']);
