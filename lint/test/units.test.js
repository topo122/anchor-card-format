// Unit tests for the primitives every other rule is built on. SPEC.md §3,
// §6, §7 (id pattern), §10, §11, §20 (boundaries).

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  byteColumn,
  classifyRefLine,
  compareBytes,
  dequote,
  extractFrontmatter,
  isBlank,
  isId,
  parseFrontmatter,
  scanFences,
  scanInlineRefs,
  splitLines,
  trim,
} from '../src/index.js';

// ---- §3 --------------------------------------------------------------------

test('splitLines splits on exactly CRLF, LF and CR', () => {
  assert.deepEqual(splitLines('a\r\nb\nc\rd'), ['a', 'b', 'c', 'd']);
  assert.deepEqual(splitLines('a\n'), ['a']);
  assert.deepEqual(splitLines('a\n\nb'), ['a', '', 'b']);
  assert.deepEqual(splitLines(''), []);
  assert.deepEqual(splitLines('\n'), ['']);
  assert.deepEqual(splitLines('a\r\n\r\nb'), ['a', '', 'b']);
});

test('splitLines does not split on the code points other splitters use', () => {
  for (const code of [0x0b, 0x0c, 0x85, 0x2028, 0x2029, 0x1c, 0x1e]) {
    assert.deepEqual(splitLines(`a${String.fromCodePoint(code)}b`), [`a${String.fromCodePoint(code)}b`]);
  }
});

test('trim removes only TAB and SPACE', () => {
  assert.equal(trim(' \ta\t '), 'a');
  assert.equal(trim('\u00a0a\u00a0'), '\u00a0a\u00a0');
  assert.equal(trim('\u3000'), '\u3000');
  assert.equal(trim('\ufeff'), '\ufeff');
});

test('a blank line is ASCII spaces only', () => {
  assert.equal(isBlank(''), true);
  assert.equal(isBlank(' \t '), true);
  assert.equal(isBlank('\u00a0'), false);
  assert.equal(isBlank('\u3000'), false);
});

test('column is a UTF-8 byte offset, not a character offset', () => {
  assert.equal(byteColumn('abc', 0), 1);
  assert.equal(byteColumn('日本語 x', 4), 11);
  assert.equal(byteColumn('éx', 1), 3);
});

test('strings order as UTF-8 byte sequences', () => {
  assert.ok(compareBytes('Z', 'a') < 0);
  assert.ok(compareBytes('é', 'z') > 0);
  assert.ok(compareBytes('a/b', 'a0b') < 0); // '/' is 0x2f, '0' is 0x30
});

// ---- §6 --------------------------------------------------------------------

test('dequote strips one matching pair only', () => {
  assert.equal(dequote('"a"'), 'a');
  assert.equal(dequote("'a'"), 'a');
  assert.equal(dequote('""'), '');
  assert.equal(dequote('"a'), '"a');
  assert.equal(dequote('"'), '"');
  assert.equal(dequote('\'a"'), '\'a"');
});

test('extractFrontmatter finds, misses and rejects', () => {
  assert.equal(extractFrontmatter(['# T']).kind, 'none');
  assert.equal(extractFrontmatter([]).kind, 'none');
  assert.equal(extractFrontmatter(['---', 'id: X']).kind, 'unterminated');
  const ok = extractFrontmatter(['---', 'id: X', '---', '# T']);
  assert.equal(ok.kind, 'ok');
  assert.deepEqual(ok.lines, ['id: X']);
  assert.equal(ok.bodyStart, 3);
});

test('the frontmatter subset parser', () => {
  const { entries, diagnostics } = parseFrontmatter(
    ['id: CARD0001', 'tags: [a, b]', 'deck: X/Y', '# comment', '', 'x-note: hello'],
    2,
  );
  assert.deepEqual(diagnostics, []);
  assert.equal(entries.get('id').value, 'CARD0001');
  assert.deepEqual(entries.get('tags').value, ['a', 'b']);
  assert.equal(entries.get('deck').line, 4);
  assert.equal(entries.get('x-note').value, 'hello');
});

test('flow elements may not contain brackets, and duplicate keys are errors', () => {
  assert.equal(parseFrontmatter(['tags: [a[1], b]'], 1).diagnostics.length, 1);
  assert.equal(parseFrontmatter(['id: a', 'id: b'], 1).diagnostics.length, 1);
  assert.deepEqual(parseFrontmatter(['tags: []'], 1).entries.get('tags').value, []);
});

test('`key:` with no items is the scalar form with an empty value', () => {
  const { entries } = parseFrontmatter(['deck:'], 1);
  assert.equal(entries.get('deck').kind, 'scalar');
  assert.equal(entries.get('deck').value, '');
});

// ---- §7 --------------------------------------------------------------------

test('the id pattern boundaries', () => {
  assert.equal(isId('abc'), true);
  assert.equal(isId('ab'), false);
  assert.equal(isId('a'.repeat(64)), true);
  assert.equal(isId('a'.repeat(65)), false);
  assert.equal(isId('a--b-'), true);
  assert.equal(isId('-abc'), false);
  assert.equal(isId('_abc'), false);
  assert.equal(isId('ab#c'), false);
  assert.equal(isId('01JD8N2K4P7QW3ZR5T9V6X0YAB'), true);
  assert.equal(isId('カード01'), false);
});

// ---- §10 -------------------------------------------------------------------

test('fence openers and closers', () => {
  const open = scanFences(['   ```js', 'code', '   ```']);
  assert.deepEqual(open.inFence, [true, true, true]);
  assert.equal(open.unterminatedAt, null);

  const tooIndented = scanFences(['    ```', 'text']);
  assert.deepEqual(tooIndented.inFence, [false, false]);

  const tabIndented = scanFences(['\t```', 'text']);
  assert.deepEqual(tabIndented.inFence, [false, false]);

  const twoChars = scanFences(['``', 'text']);
  assert.deepEqual(twoChars.inFence, [false, false]);

  const closerWithText = scanFences(['```', 'a', '``` js', 'b']);
  assert.deepEqual(closerWithText.inFence, [true, true, true, true]);
  assert.equal(closerWithText.unterminatedAt, 0);

  const closerWithSpaces = scanFences(['```', 'a', '``` \t', 'b']);
  assert.deepEqual(closerWithSpaces.inFence, [true, true, true, false]);
});

// ---- §11 -------------------------------------------------------------------

test('whole-line references and their look-alikes', () => {
  assert.equal(classifyRefLine('![[CARD0001]]').valid, true);
  assert.equal(classifyRefLine('  ![[CARD0001]] ').valid, true);
  assert.equal(classifyRefLine('![[ CARD0001 ]]').valid, false);
  assert.equal(classifyRefLine('![[CARD0001|label]]').valid, false);
  assert.equal(classifyRefLine('![[CARD0001#heading]]').valid, false);
  assert.equal(classifyRefLine('[[CARD0001]]'), null);
  assert.equal(classifyRefLine('See ![[CARD0001]] here'), null);
  assert.equal(classifyRefLine('![[CARD0001]] ![[CARD0002]]').valid, false);
});

test('inline references are only reported when the inner text is a valid id', () => {
  assert.equal(scanInlineRefs('see ![[CARD0001]] now').length, 1);
  assert.equal(scanInlineRefs('x[[1]] and [[a, b]]').length, 0);
  assert.equal(scanInlineRefs('![[ CARD0001 ]]').length, 0);
});
