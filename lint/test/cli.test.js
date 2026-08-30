// The command line contract — SPEC.md §18.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(HERE, '..', 'bin', 'anchor-lint.js');
const TMP_ROOT = path.join(HERE, '.tmp-cli');
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

function run(args) {
  return spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });
}

test.after(() => {
  for (const dir of created) fs.rmSync(dir, { recursive: true, force: true });
});

const clean = ['---', 'id: CARD0001', '---', '', '# Title', '', '<!-- back -->', 'Answer.', ''].join('\n');
const withError = ['---', 'id: CARD0002', '---', '', '# No answer', '', 'Question only.', ''].join('\n');
const withWarning = ['---', 'id: CARD0003', '---', '', '# T', '', '<!-- back -->', 'A.', '', '<!-- todo -->', ''].join('\n');

test('a clean vault exits 0', () => {
  const dir = makeVault({ 'CARD0001.md': clean });
  const result = run([dir]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /0 errors, 0 warnings/);
});

test('an error exits 1 and the message names a repair', () => {
  const dir = makeVault({ 'CARD0002.md': withError });
  const result = run([dir]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /CARD0002\.md:5:1 {2}error {2}back-missing/);
  assert.match(result.stdout, /fix: Add a line that is exactly `<!-- back -->`/);
  assert.match(result.stdout, /never: /);
  assert.match(result.stdout, /Never change an existing `id`/);
});

test('warnings do not fail unless --strict is given', () => {
  const dir = makeVault({ 'CARD0003.md': withWarning });
  assert.equal(run([dir]).status, 0);
  assert.equal(run([dir, '--strict']).status, 1);
});

test('--json and --format json emit the §16 objects plus a summary', () => {
  const dir = makeVault({ 'CARD0002.md': withError, 'CARD0001.md': clean });
  const result = run([dir, '--json']);
  assert.equal(result.status, 1);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.diagnostics.length, 1);
  const d = payload.diagnostics[0];
  assert.equal(d.rule, 'back-missing');
  assert.equal(d.severity, 'error');
  assert.equal(d.path, 'CARD0002.md');
  assert.equal(d.line, 5);
  assert.equal(d.column, 1);
  assert.equal(typeof d.message, 'string');
  assert.equal(typeof d.fix, 'string');
  assert.equal(payload.summary.cards, 2);
  assert.equal(payload.summary.cardsInError, 1);
  assert.equal(payload.summary.errors, 1);
  assert.equal(payload.summary.orphanLogEntries, 0);

  const viaFormat = run([dir, '--format', 'json']);
  assert.equal(viaFormat.stdout, result.stdout);
});

test('a single card file can be linted directly', () => {
  const dir = makeVault({ 'CARD0002.md': withError });
  const result = run([path.join(dir, 'CARD0002.md'), '--json']);
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).diagnostics[0].path, 'CARD0002.md');
});

test('--verbose lists the skipped .md files without calling them a problem', () => {
  const dir = makeVault({ 'CARD0001.md': clean, 'README.md': '# Readme\n' });
  const result = run([dir, '--verbose']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /README\.md {2}\(no-id\)/);
  assert.match(result.stdout, /1 skipped \.md file/);
});

test('the counts §18 requires are surfaced', () => {
  const dir = makeVault({
    'CARD0001.md': ['---', 'id: CARD0001', '---', '', '# T', '', '<!-- back -->', '![[NOSUCHCARD]]', ''].join('\n'),
    'README.md': '# Readme\n',
    'data/reviews/2026-08-31.jsonl': '{"item":"GONE0001","at":"2026-08-31T00:00:00Z","event":"review"}\n',
  });
  const result = run([dir]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /1 card, 0 in error, 1 unresolved reference, 1 skipped \.md file, 1 orphan log entry/);
});

test('--help exits 0 and a bad path exits 2', () => {
  assert.equal(run(['--help']).status, 0);
  assert.equal(run([]).status, 2);
  assert.equal(run([path.join(TMP_ROOT, 'no-such-vault')]).status, 2);
  assert.equal(run(['--bogus', '.']).status, 2);
});
