// Frontmatter — a fixed line-oriented subset, NOT YAML. SPEC.md §6.
//
// No YAML library is used, and none may be: `ask: no` is false under YAML 1.1
// and the string "no" under YAML 1.2, and `id: 2026-08-31` is a date in one
// dialect and a string in another. Values here are always strings.

import { byteColumn, isAsciiSpaceCode, isBlank, trim } from './text.js';

// `[^]` and not `.`: U+2028 and U+2029 are ordinary characters inside a line
// (§3) but JS `.` will not match them, which would turn a value containing one
// into `frontmatter-syntax`.
const KEY_LINE = /^([a-z][a-z0-9-]*):([^]*)$/;
const LIST_ITEM = /^ {2}- /;

// YAML constructs the subset does not have. §6 requires them to be errors and
// forbids silently ignoring them — taking `note: |` as the one-character string
// "|" would drop the block that follows without a word.
//
// The patterns are deliberately narrow, because a rule that fires on a correct
// card is a defect (§17): only a bare block-scalar header (`|`, `>`, `|-`,
// `>2`, `|2-`), only an anchor whose `&name` is the first token, and only an
// alias that is the entire value. `x-source: Casella & Berger` and
// `x-note: 5 > 4` stay ordinary strings.
const BLOCK_SCALAR = /^[|>][0-9]*[+-]?$/;
const ANCHOR = /^&[^ \t]+([ \t][^]*)?$/;
const ALIAS = /^\*[^ \t]+$/;

/** Does this value reach for a YAML feature the subset does not have (§6)? */
function isUnsupportedYaml(value) {
  return BLOCK_SCALAR.test(value) || ANCHOR.test(value) || ALIAS.test(value);
}

/** Strip one matching pair of surrounding quotes. No escape processing (§6). */
export function dequote(value) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return value.slice(1, value.length - 1);
    }
  }
  return value;
}

/**
 * Locate the frontmatter block.
 *
 * @param {string[]} lines all lines of the file, BOM already removed
 * @returns {{kind:'none'}|{kind:'unterminated'}|{kind:'ok', lines:string[], firstLineNo:number, bodyStart:number}}
 */
export function extractFrontmatter(lines) {
  if (lines.length === 0 || lines[0] !== '---') return { kind: 'none' };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      return { kind: 'ok', lines: lines.slice(1, i), firstLineNo: 2, bodyStart: i + 1 };
    }
  }
  return { kind: 'unterminated' };
}

/**
 * Parse the supported subset.
 *
 * Deliberate reading of an ambiguity in §6: `key:` with no `  - item` lines
 * under it is the scalar form with an empty value (the colon is followed by
 * end of line, which §6 allows), not an empty list. `tags:` alone is therefore
 * a scalar and fails the §7 list requirement — loudly, which is the point.
 *
 * @param {string[]} fmLines
 * @param {number} firstLineNo 1-based line number of fmLines[0] in the file
 * @returns {{entries: Map<string, object>, diagnostics: Array<{rule:string, line:number, column:number}>}}
 */
export function parseFrontmatter(fmLines, firstLineNo) {
  const entries = new Map();
  const diagnostics = [];
  const syntax = (index, column = 1) => {
    diagnostics.push({ rule: 'frontmatter-syntax', line: firstLineNo + index, column });
  };

  let i = 0;
  while (i < fmLines.length) {
    const line = fmLines[i];

    if (isBlank(line)) { i++; continue; }
    if (line.charCodeAt(0) === 0x23 /* # */) { i++; continue; } // comment

    const m = KEY_LINE.exec(line);
    if (!m) { syntax(i); i++; continue; }

    const key = m[1];
    const after = m[2];

    // The colon MUST be followed by an ASCII space or end of line (§6).
    if (after.length > 0 && !isAsciiSpaceCode(after.charCodeAt(0))) {
      syntax(i, byteColumn(line, key.length + 1));
      i++;
      continue;
    }

    const rawValue = trim(after);
    // 1-based byte column where the value itself starts, for diagnostics.
    const valueColumn = byteColumn(line, key.length + 1 + leadingAsciiSpaces(after));

    let entry;
    let consumed = 1;

    if (isUnsupportedYaml(rawValue)) {
      // A block scalar, anchor or alias. Consuming the header as the string
      // "|" would silently drop the block under it, which §6 forbids.
      syntax(i, valueColumn);
      i++;
      continue;
    }

    if (rawValue.length >= 2 && rawValue[0] === '[' && rawValue[rawValue.length - 1] === ']') {
      // Flow list form.
      const inner = rawValue.slice(1, rawValue.length - 1);
      const items = [];
      let bad = false;
      if (trim(inner) !== '') {
        for (const part of inner.split(',')) {
          const t = trim(part);
          if (t.includes('[') || t.includes(']') || isUnsupportedYaml(t)) { bad = true; break; }
          items.push(dequote(t));
        }
      }
      if (bad) { syntax(i); i++; continue; }
      entry = { key, kind: 'list', value: items, raw: rawValue, line: firstLineNo + i, valueColumn, itemLines: [] };
    } else if (rawValue === '' && i + 1 < fmLines.length && LIST_ITEM.test(fmLines[i + 1])) {
      // Block list form: `key:` then `  - item` lines, exactly two spaces.
      const items = [];
      const itemLines = [];
      let j = i + 1;
      let badItem = -1;
      while (j < fmLines.length && LIST_ITEM.test(fmLines[j])) {
        const text = trim(fmLines[j].slice(4));
        if (badItem < 0 && isUnsupportedYaml(text)) badItem = j;
        items.push(dequote(text));
        itemLines.push(firstLineNo + j);
        j++;
      }
      consumed = j - i;
      if (badItem >= 0) {
        // Report once and drop the key: the item lines are still consumed, so
        // one alias does not turn every remaining item into its own error.
        syntax(badItem, byteColumn(fmLines[badItem], 4));
        i += consumed;
        continue;
      }
      entry = { key, kind: 'list', value: items, raw: rawValue, line: firstLineNo + i, valueColumn, itemLines };
    } else {
      entry = {
        key,
        kind: 'scalar',
        value: dequote(rawValue),
        raw: rawValue,
        line: firstLineNo + i,
        valueColumn,
        itemLines: [],
      };
    }

    if (entries.has(key)) {
      // Duplicate keys are an error; the first occurrence wins so that the
      // rest of the linting still has something to look at.
      syntax(i);
    } else {
      entries.set(key, entry);
    }
    i += consumed;
  }

  return { entries, diagnostics };
}

function leadingAsciiSpaces(text) {
  let a = 0;
  while (a < text.length && isAsciiSpaceCode(text.charCodeAt(a))) a++;
  return a;
}
