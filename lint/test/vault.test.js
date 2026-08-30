// Walking a real vault: which files are cards, scan order, limits, the log.
// SPEC.md §5, §18, §19, §20.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { collectVault, countOrphanLogEntries, lintVault, MAX_FILE_BYTES } from '../src/index.js';

const TMP_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '.tmp');
const created = [];

function makeVault(files) {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'vault-'));
  created.push(dir);
  for (const [relative, content] of Object.entries(files)) {
    const full = path.join(dir, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

test.after(() => {
  for (const dir of created) fs.rmSync(dir, { recursive: true, force: true });
});

const card = (id, title) => ['---', `id: ${id}`, '---', '', `# ${title}`, '', '<!-- back -->', 'Answer.', ''].join('\n');

test('only .md files outside _ and . segments, and outside symlinks, are candidates', () => {
  const dir = makeVault({
    'CARD0001.md': card('CARD0001', 'Root'),
    'Stats/CARD0002.md': card('CARD0002', 'Nested'),
    '_drafts/CARD0003.md': card('CARD0003', 'Draft'),
    '.obsidian/CARD0004.md': card('CARD0004', 'App data'),
    'Stats/_wip/CARD0005.md': card('CARD0005', 'Work in progress'),
    'notes.MD': card('CARD0006', 'Uppercase extension'),
    'README.md': '# Readme\n\nNo id, so not a card.\n',
    'data/reviews/2026-08-31.jsonl': '{"item":"CARD0001","at":"2026-08-31T00:00:00Z","event":"review"}\n',
  });
  fs.symlinkSync(path.join(dir, 'CARD0001.md'), path.join(dir, 'link.md'));

  const result = lintVault(dir);
  assert.deepEqual([...result.cards.keys()], ['CARD0001.md', 'Stats/CARD0002.md']);
  assert.deepEqual(result.diagnostics, []);

  const skipped = Object.fromEntries(result.skipped.map((s) => [s.path, s.reason]));
  assert.equal(skipped['_drafts'], 'name');
  assert.equal(skipped['.obsidian'], 'name');
  assert.equal(skipped['Stats/_wip'], 'name');
  assert.equal(skipped['link.md'], 'symlink');
  assert.equal(skipped['README.md'], 'no-id');
  // `.MD` is not a candidate at all, so it is not even reported as skipped.
  assert.equal('notes.MD' in skipped, false);
});

test('vault scan order is ascending UTF-8 byte order of the path', () => {
  // Note: no two names differ only by case — the host filesystem may be
  // case-insensitive, which would collapse them into one file.
  const dir = makeVault({
    'b.md': card('CARDB', 'B'),
    'A.md': card('CARDA', 'A'),
    'aa.md': card('CARDC', 'C'),
    'Zed/z.md': card('CARDZ', 'Z'),
    'Zebra.md': card('CARDX', 'X'),
  });
  const { files } = collectVault(dir);
  // Uppercase sorts before lowercase: this is byte order, not a locale order.
  assert.deepEqual(files.map((f) => f.path), ['A.md', 'Zebra.md', 'Zed/z.md', 'aa.md', 'b.md']);
});

test('a symlinked directory is never traversed', () => {
  const dir = makeVault({
    'real/CARD0001.md': card('CARD0001', 'Real'),
  });
  fs.symlinkSync(path.join(dir, 'real'), path.join(dir, 'mirror'), 'dir');
  const result = lintVault(dir);
  assert.deepEqual([...result.cards.keys()], ['real/CARD0001.md']);
  assert.ok(result.skipped.some((s) => s.path === 'mirror' && s.reason === 'symlink'));
});

test('1 MiB is fine and 1 MiB plus one byte is file-too-large', () => {
  const head = [
    '---',
    'id: CARD0001',
    '---',
    '',
    '# Big',
    '',
    '<!-- back -->',
    '',
  ].join('\n');
  const pad = (size) => head + 'x'.repeat(size - Buffer.byteLength(head, 'utf8'));

  const atLimit = makeVault({ 'CARD0001.md': pad(MAX_FILE_BYTES) });
  const atLimitResult = lintVault(atLimit);
  // The padding trips back-too-long; there is no way to silence it (§17), and
  // the point of this case is the size boundary, not a clean card.
  assert.deepEqual(atLimitResult.diagnostics.map((d) => d.rule), ['back-too-long']);
  assert.equal(atLimitResult.cards.size, 1);

  const overLimit = makeVault({ 'CARD0001.md': pad(MAX_FILE_BYTES + 1) });
  const overLimitResult = lintVault(overLimit);
  assert.deepEqual(overLimitResult.diagnostics.map((d) => d.rule), ['file-too-large']);
  assert.equal(overLimitResult.cards.size, 0);
});

test('log entries whose card is gone are orphans and are only counted', () => {
  const dir = makeVault({
    'CARD0001.md': card('CARD0001', 'Kept'),
    'data/reviews/2026-08-30.jsonl': [
      '{"item":"CARD0001","at":"2026-08-30T09:00:00Z","event":"review"}',
      '{"item":"CARD0001#r","at":"2026-08-30T09:01:00Z","event":"review"}',
      '{"item":"DELETED0001","at":"2026-08-30T09:02:00Z","event":"review"}',
      '',
    ].join('\n'),
    'data/reviews/2026-08-31.jsonl': '{"item":"GONE0002","at":"2026-08-31T09:00:00Z","event":"suspend"}\nnot json\n',
  });
  const result = lintVault(dir);
  const ids = new Set([...result.cards.values()].map((c) => c.id));
  const log = countOrphanLogEntries(dir, ids);
  assert.equal(log.entries, 4);
  assert.equal(log.orphans, 2);
  assert.equal(log.unreadable, 1);
  // The vault itself is clean: an orphan is never a diagnostic.
  assert.deepEqual(result.diagnostics, []);
});

test('an unreadable .md file is skipped, and the rest of the vault still lints', () => {
  const dir = makeVault({
    'AAA0001.md': card('CARDAAA1', 'Before'),
    'BBB0002.md': card('CARDBBB2', 'Unreadable'),
    'CCC0003.md': card('CARDCCC3', 'After'),
  });
  const locked = path.join(dir, 'BBB0002.md');
  fs.chmodSync(locked, 0o000);
  try {
    // Reading it must not throw out of the walk: one file the process cannot
    // open used to take the whole run down with a stack trace.
    const result = lintVault(dir);
    assert.deepEqual([...result.cards.keys()], ['AAA0001.md', 'CCC0003.md']);
    assert.deepEqual(result.diagnostics, []);
    // There is no rule id for an I/O failure (§17 is closed), so it lands in
    // the skipped list, which §5 requires to be inspectable and not a problem.
    assert.ok(result.skipped.some((s) => s.path === 'BBB0002.md' && s.reason === 'unreadable'));
    assert.equal(result.counts.skippedFiles, 1);
  } finally {
    fs.chmodSync(locked, 0o644);
  }
});

test('a vault is never rejected as a whole because one card has an error', () => {
  const dir = makeVault({
    'good.md': card('CARD0001', 'Good'),
    'bad.md': ['---', 'id: CARD0002', '---', '', '# Bad', '', 'No answer side.'].join('\n'),
  });
  const result = lintVault(dir);
  assert.equal(result.counts.cards, 2);
  assert.equal(result.counts.cardsInError, 1);
  assert.equal(result.items.has('CARD0001'), true);
  assert.equal(result.items.has('CARD0002'), false);
});
