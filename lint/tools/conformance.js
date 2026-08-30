// The conformance corpus (SPEC.md §2) — shared by the generator and the runner.
//
// The corpus is NOT a second specification. SPEC.md is the only normative
// source; this corpus is the mechanical gate that keeps independent
// implementations from drifting apart, and it is generated from the same case
// list the rule tests use (lint/test/cases.js). If the corpus and SPEC.md
// disagree, SPEC.md is right and the corpus has a bug.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CASES, NOT_IN_CORPUS } from '../test/cases.js';

export const CORPUS_DIR = fileURLToPath(new URL('../../spec/conformance/', import.meta.url));

/**
 * The corpus cases, in a fixed order, derived from the rule case list.
 *
 * A case with exactly one file becomes a single-file case (`NNN-name.md` plus
 * `NNN-name.json`); a case with several becomes a vault case (directory
 * `NNN-name/` plus `NNN-name.json`). §2 defines both shapes.
 */
export function corpusCases() {
  const out = [];
  let n = 0;
  const add = (name, source) => {
    n += 1;
    const slug = `${String(n).padStart(3, '0')}-${name}`;
    const kind = source.length === 1 ? 'single' : 'vault';
    // A single-file case is linted as a one-file vault whose only path is the
    // case file itself, so its deck is empty; a vault case keeps its paths.
    const files = source.map((file) => ({
      path: kind === 'single' ? singleFilePath(slug) : file.path,
      bytes: file.bytes,
      size: file.size,
    }));
    out.push({ name: slug, files, kind });
  };
  for (const testCase of CASES) {
    if (NOT_IN_CORPUS.has(testCase.rule)) continue;
    add(`${testCase.rule}-fires`, testCase.bad);
    add(`${testCase.rule}-clean`, testCase.good);
  }
  return out;
}

/** Rewrite a single-file case's paths so they read as the case's own file name. */
export function singleFilePath(slug) {
  return `${slug}.md`;
}

/**
 * Canonical JSON, per §2: object keys sorted ascending by code point, two-space
 * indentation, non-ASCII characters unescaped, LF, exactly one trailing newline.
 */
export function canonicalJson(value) {
  return `${stringify(value, '')}\n`;
}

function stringify(value, indent) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  const inner = `${indent}  `;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((v) => inner + stringify(v, inner)).join(',\n')}\n${indent}]`;
  }
  const keys = Object.keys(value).sort(compareCodePoints);
  if (keys.length === 0) return '{}';
  const body = keys
    .map((k) => `${inner}${JSON.stringify(k)}: ${stringify(value[k], inner)}`)
    .join(',\n');
  return `{\n${body}\n${indent}}`;
}

function compareCodePoints(a, b) {
  const ax = [...a];
  const bx = [...b];
  for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
    const d = ax[i].codePointAt(0) - bx[i].codePointAt(0);
    if (d !== 0) return d;
  }
  return ax.length - bx.length;
}

/** Read a corpus case's input files back off disk, as a linter would see them. */
export function readCase(slug) {
  const single = path.join(CORPUS_DIR, singleFilePath(slug));
  if (fs.existsSync(single)) {
    const bytes = fs.readFileSync(single);
    return { kind: 'single', files: [{ path: singleFilePath(slug), bytes, size: bytes.length }] };
  }
  const dir = path.join(CORPUS_DIR, slug);
  const files = [];
  const walk = (absolute, relative) => {
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const next = relative === '' ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) walk(path.join(absolute, entry.name), next);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const bytes = fs.readFileSync(path.join(absolute, entry.name));
        files.push({ path: next, bytes, size: bytes.length });
      }
    }
  };
  walk(dir, '');
  return { kind: 'vault', files };
}

/** The expected value for a case, in the shape §2 defines. */
export function expectedValue(kind, result, files) {
  const diagnostics = result.diagnostics.map((d) => ({
    rule: d.rule,
    severity: d.severity,
    path: d.path,
    line: d.line,
    column: d.column,
  }));
  if (kind === 'single') {
    const card = result.cards.get(files[0].path) ?? null;
    return { card, diagnostics };
  }
  return {
    cards: Object.fromEntries([...result.cards.entries()].sort()),
    items: Object.fromEntries([...result.items.entries()].sort()),
    diagnostics,
  };
}
