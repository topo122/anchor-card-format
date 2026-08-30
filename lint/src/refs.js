// References — `![[id]]`. SPEC.md §7 (id pattern) and §11.

import { byteColumn, nfc, trim } from './text.js';

// Whole-string id pattern. Written out because \w and \d differ per language;
// JavaScript's `$` (without the m flag) matches only at end of string, which
// is the whole-string API this spec asks for.
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/;

// A whole line that is `![[` + anything + `]]` after trimming.
// `[^]` and not `.`, for the same reason as the title pattern in parse.js:
// §11 says "`![[` + anything + `]]`", and JS `.` excludes U+2028 / U+2029,
// which §3 makes ordinary characters inside a line.
const WHOLE_LINE_REF = /^!\[\[([^]*)\]\]$/;

// `![[<valid id>]]` anywhere inside a line.
const INLINE_REF = /!\[\[([A-Za-z0-9][A-Za-z0-9_-]{2,63})\]\]/g;

export function isId(value) {
  return typeof value === 'string' && ID.test(value);
}

/**
 * Classify a line as a reference candidate.
 * Returns null when the line is not `![[...]]` on its own.
 *
 * @returns {{inner: string, id: string|null, valid: boolean, column: number}|null}
 */
export function classifyRefLine(line) {
  const t = trim(line);
  const m = WHOLE_LINE_REF.exec(t);
  if (!m) return null;
  const inner = m[1];
  const normalized = nfc(inner);
  const valid = isId(normalized);
  return {
    inner,
    id: valid ? normalized : null,
    valid,
    column: byteColumn(line, line.indexOf('![[')),
  };
}

/**
 * Reference syntax inside a sentence. Only occurrences whose inner text is a
 * valid id are reported, so `x[[1]]` in R code and `[[a, b]]` in prose never
 * produce a diagnostic (§11).
 *
 * @returns {Array<{id: string, index: number}>}
 */
export function scanInlineRefs(line) {
  const out = [];
  INLINE_REF.lastIndex = 0;
  let m;
  while ((m = INLINE_REF.exec(line)) !== null) {
    out.push({ id: m[1], index: m.index });
  }
  return out;
}
