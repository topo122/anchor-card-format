#!/usr/bin/env node
// anchor-lint — Anchor Card Format v2 linter. SPEC.md §18: exit 1 when any
// error exists, 0 otherwise, 1 on warnings under --strict, --format json.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { countOrphanLogEntries } from '../src/log.js';
import { formatHuman, formatJson } from '../src/report.js';
import { collectVault, lintFiles, MAX_FILE_BYTES } from '../src/vault.js';
import { nfc } from '../src/text.js';

const USAGE = `anchor-lint — lint an Anchor Card Format v2 vault.

usage: anchor-lint <vault-dir|card.md> [options]

options:
  --json                  machine-readable output (alias for --format json)
  --format <human|json>   output format (default: human)
  --strict                exit 1 on warnings as well as errors
  --verbose               also list the skipped .md files (never a problem)
  --no-color              never colorize human output
  -h, --help              show this message
  -v, --version           print the version

exit codes: 0 clean, 1 lint failure, 2 bad usage.
`;

function parseArgs(argv) {
  const options = { target: null, format: 'human', strict: false, verbose: false, color: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--json') { options.format = 'json'; continue; }
    if (arg === '--strict') { options.strict = true; continue; }
    if (arg === '--verbose') { options.verbose = true; continue; }
    if (arg === '--no-color') { options.color = false; continue; }
    if (arg === '--color') { options.color = true; continue; }
    if (arg === '--format') {
      const value = argv[++i];
      if (value !== 'human' && value !== 'json') return { error: `--format expects human or json, got ${value ?? '(nothing)'}` };
      options.format = value;
      continue;
    }
    if (arg.startsWith('--format=')) {
      const value = arg.slice('--format='.length);
      if (value !== 'human' && value !== 'json') return { error: `--format expects human or json, got ${value}` };
      options.format = value;
      continue;
    }
    if (arg.startsWith('-')) return { error: `unknown option: ${arg}` };
    if (options.target !== null) return { error: 'expected exactly one vault directory' };
    options.target = arg;
  }
  if (options.target === null) return { error: 'expected a vault directory' };
  return { options };
}

function main(argv) {
  const parsed = parseArgs(argv);
  if (parsed.help) { process.stdout.write(USAGE); return 0; }
  if (parsed.version) {
    const pkg = JSON.parse(
      fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    );
    process.stdout.write(`${pkg.version}\n`);
    return 0;
  }
  if (parsed.error) {
    process.stderr.write(`anchor-lint: ${parsed.error}\n\n${USAGE}`);
    return 2;
  }

  const { options } = parsed;
  let stat;
  try {
    stat = fs.statSync(options.target);
  } catch {
    process.stderr.write(`anchor-lint: cannot read ${options.target}\n`);
    return 2;
  }

  let result;
  let root;
  if (stat.isDirectory()) {
    root = options.target;
    const { files, skipped } = collectVault(root);
    result = lintFiles(files, { skipped });
  } else {
    // Convenience: a single card file is linted as a one-file vault.
    root = path.dirname(options.target);
    const relative = nfc(path.basename(options.target));
    if (!relative.endsWith('.md')) {
      process.stderr.write('anchor-lint: expected a directory or a .md file\n');
      return 2;
    }
    const tooLarge = stat.size > MAX_FILE_BYTES;
    result = lintFiles([
      {
        path: relative,
        bytes: tooLarge ? null : fs.readFileSync(options.target),
        size: stat.size,
        tooLarge,
      },
    ]);
  }

  const cardIds = new Set();
  for (const card of result.cards.values()) cardIds.add(card.id);
  const log = countOrphanLogEntries(root, cardIds);

  if (options.format === 'json') {
    process.stdout.write(formatJson(result, { orphanLogEntries: log.orphans, logEntries: log.entries }));
  } else {
    const color = options.color === null ? process.stdout.isTTY === true : options.color;
    process.stdout.write(
      formatHuman(result, { color, verbose: options.verbose, orphanLogEntries: log.orphans }),
    );
  }

  if (result.counts.errors > 0) return 1;
  if (options.strict && result.counts.warnings > 0) return 1;
  return 0;
}

process.exitCode = main(process.argv.slice(2));
