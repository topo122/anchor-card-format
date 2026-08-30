import { Buffer } from 'node:buffer';
import { lintFiles } from '../src/index.js';

/** A card candidate built from text. */
export function f(path, text) {
  const bytes = Buffer.from(text, 'utf8');
  return { path, bytes, size: bytes.length };
}

/** A card candidate built from raw bytes (for encoding tests). */
export function raw(path, bytes) {
  const buffer = Buffer.from(bytes);
  return { path, bytes: buffer, size: buffer.length };
}

export function lint(files) {
  return lintFiles(files);
}

export function lintOne(text, path = 'Cards/CARD0001.md') {
  return lintFiles([f(path, text)]);
}

export function ruleIds(result) {
  return result.diagnostics.map((d) => d.rule);
}

export function has(result, rule) {
  return result.diagnostics.some((d) => d.rule === rule);
}

export function only(result) {
  return result.diagnostics.map((d) => `${d.rule}@${d.line}:${d.column}`);
}

/** A minimal card that produces no diagnostics at all. */
export const CLEAN_CARD = [
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
  '',
].join('\n');

/** A clean `ask: false` reference card, id CARD0002. */
export const REFERENCE_CARD = [
  '---',
  'id: CARD0002',
  'ask: false',
  '---',
  '',
  '# Shared definition',
  '',
  'The shared text.',
  '',
].join('\n');
