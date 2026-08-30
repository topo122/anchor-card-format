// Bytes -> Card value + per-file diagnostics. SPEC.md §3-§12, §17.

import { scanFences } from './fences.js';
import { extractFrontmatter, parseFrontmatter } from './frontmatter.js';
import { classifyRefLine, scanInlineRefs } from './refs.js';
import { severityOf } from './rules.js';
import {
  byteColumn,
  countCodePoints,
  decodeUtf8,
  isBlank,
  nfc,
  removeAsciiSpaces,
  splitLines,
  stripBom,
  trim,
} from './text.js';

const HINT_MARKER = '<!-- hint -->';
const BACK_MARKER = '<!-- back -->';
const NOTE_MARKER = '<!-- note -->';
// `[^]` and not `.`: §3 makes U+2028 and U+2029 ordinary characters inside a
// line, but JS `.` refuses to match them, which would turn a title containing
// one into `title-missing` and cost the whole card.
const TITLE = /^#([ \t]+)([^]*)$/;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/;

// `deck` is NOT a key: a card's deck is its directory path and nothing
// overrides it (SPEC §7). A frontmatter `deck:` is an unknown key like any other.
const KNOWN_KEYS = new Set(['id', 'tags', 'ask', 'reverse', 'format']);
const MARKER_RANK = { hint: 1, back: 2, note: 3 };
const MAX_DISTINCT_REFS = 16;
const MAX_BACK_CHARS = 1200;

/**
 * @param {{path: string, bytes: Buffer|null, size: number, tooLarge?: boolean}} file
 *        `path` is the NFC-normalized vault-relative path with `/` separators.
 */
export function parseCardFile(file) {
  const diagnostics = [];
  const add = (rule, line, column) => {
    diagnostics.push({ rule, severity: severityOf(rule), path: file.path, line, column });
  };
  const skipped = (reason) => ({
    path: file.path,
    isCard: false,
    card: null,
    diagnostics,
    refs: [],
    regions: null,
    skipReason: reason,
  });

  if (file.tooLarge) {
    add('file-too-large', 1, 1);
    return skipped('too-large');
  }

  const decoded = decodeUtf8(stripBom(file.bytes));
  if (!decoded.ok) {
    add('encoding-invalid', 1, 1);
    return skipped('encoding');
  }

  const lines = splitLines(decoded.text);
  const fm = extractFrontmatter(lines);
  if (fm.kind === 'unterminated') {
    add('frontmatter-unterminated', 1, 1);
    return skipped('frontmatter');
  }

  const bodyStart = fm.kind === 'ok' ? fm.bodyStart : 0;
  const parsedFm = fm.kind === 'ok'
    ? parseFrontmatter(fm.lines, fm.firstLineNo)
    : { entries: new Map(), diagnostics: [] };

  const idEntry = parsedFm.entries.get('id');

  // §5: a candidate is a card if and only if its frontmatter has an `id` key.
  // A candidate without one is skipped silently — unless it has a `<!-- back -->`
  // line outside a fence, in which case the author clearly meant to write a card.
  if (!idEntry) {
    const body = lines.slice(bodyStart);
    const { inFence } = scanFences(body);
    let backLine = -1;
    for (let i = 0; i < body.length; i++) {
      if (!inFence[i] && body[i] === BACK_MARKER) { backLine = bodyStart + i + 1; break; }
    }
    if (backLine > 0) {
      for (const d of parsedFm.diagnostics) add(d.rule, d.line, d.column);
      add('id-missing', backLine, 1);
    }
    return skipped('no-id');
  }

  for (const d of parsedFm.diagnostics) add(d.rule, d.line, d.column);

  // ---- fields (§7) --------------------------------------------------------
  const entries = parsedFm.entries;

  const rawId = idEntry.kind === 'scalar' ? nfc(idEntry.value) : null;
  const idValid = rawId !== null && ID_PATTERN.test(rawId);
  if (!idValid) add('id-invalid', idEntry.line, idEntry.valueColumn);

  const deck = file.path.split('/').slice(0, -1).map((segment) => nfc(segment));
  const tags = readTags(entries.get('tags'), add);
  const ask = readBoolean(entries.get('ask'), true, add);
  const reverse = readBoolean(entries.get('reverse'), false, add);
  readFormat(entries.get('format'), add);

  const extra = {};
  for (const [key, entry] of entries) {
    if (KNOWN_KEYS.has(key)) continue;
    extra[key] = entry.kind === 'list' ? entry.value.slice() : entry.value;
    add('unknown-key', entry.line, 1);
  }

  // ---- body (§8-§11) ------------------------------------------------------
  const body = analyzeBody({
    lines,
    bodyStart,
    add,
    id: idValid ? rawId : null,
    ask,
  });

  if (body === null || !idValid) {
    return {
      path: file.path,
      isCard: true,
      card: null,
      diagnostics,
      refs: body ? body.refs : [],
      regions: body ? body.regions : null,
      id: idValid ? rawId : null,
      idLine: idEntry.line,
      idColumn: idEntry.valueColumn,
      titleLine: body ? body.titleLine : null,
      skipReason: null,
    };
  }

  const card = {
    id: rawId,
    deck,
    tags,
    ask,
    reverse,
    title: body.title,
    ...(body.front !== null ? { front: body.front } : {}),
    ...(body.hint !== null ? { hint: body.hint } : {}),
    ...(body.back !== null ? { back: body.back } : {}),
    ...(body.note !== null ? { note: body.note } : {}),
    extra,
    items: [],
  };

  return {
    path: file.path,
    isCard: true,
    card,
    diagnostics,
    refs: body.refs,
    regions: body.regions,
    id: rawId,
    idLine: idEntry.line,
    idColumn: idEntry.valueColumn,
    titleLine: body.titleLine,
    skipReason: null,
  };
}

function readTags(entry, add) {
  if (!entry) return [];
  if (entry.kind !== 'list') {
    // `tags: foo` is an error — write `tags: [foo]` (§7).
    add('frontmatter-syntax', entry.line, entry.valueColumn);
    return [];
  }
  const tags = [];
  const seen = new Set();
  entry.value.forEach((raw, index) => {
    const tag = nfc(trim(raw));
    const line = entry.itemLines[index] ?? entry.line;
    const column = entry.itemLines[index] ? 1 : entry.valueColumn;
    if (tag === '' || tag.includes(',')) {
      add('tag-invalid', line, column);
    } else if (seen.has(tag)) {
      add('tag-duplicate', line, column);
    } else {
      seen.add(tag);
    }
    tags.push(tag);
  });
  return tags;
}

function readBoolean(entry, fallback, add) {
  if (!entry) return fallback;
  if (entry.kind !== 'scalar' || (entry.raw !== 'true' && entry.raw !== 'false')) {
    // Only the exact unquoted tokens are accepted: "true" (quoted) is not one.
    add('frontmatter-syntax', entry.line, entry.valueColumn);
    return fallback;
  }
  return entry.raw === 'true';
}

function readFormat(entry, add) {
  if (!entry) return;
  if (entry.kind !== 'scalar' || entry.value !== '2') {
    add('format-unsupported', entry.line, entry.valueColumn);
  }
}

function analyzeBody({ lines, bodyStart, add, id, ask }) {
  const body = lines.slice(bodyStart);
  const { inFence, unterminatedAt } = scanFences(body);
  const absolute = (index) => bodyStart + index + 1;

  let titleIndex = -1;
  for (let i = 0; i < body.length; i++) {
    if (!isBlank(body[i])) { titleIndex = i; break; }
  }
  if (titleIndex < 0) {
    add('title-missing', Math.max(1, lines.length), 1);
    return null;
  }

  const titleLineText = body[titleIndex];
  const titleMatch = TITLE.exec(titleLineText);
  if (!titleMatch || titleLineText.charCodeAt(1) === 0x23 || trim(titleMatch[2]) === '') {
    add('title-missing', absolute(titleIndex), 1);
    return null;
  }
  // Closing sequences are NOT removed: `# Bayes' rule #` -> `Bayes' rule #`.
  const title = trim(titleMatch[2]);
  const titleLine = absolute(titleIndex);

  const regions = { front: [], hint: [], back: [], note: [] };
  const markerCount = { hint: 0, back: 0, note: 0 };
  const markerLine = { hint: null, back: null, note: null };
  let current = 'front';
  let maxRank = 0;
  let orderReported = false;

  for (let i = titleIndex + 1; i < body.length; i++) {
    const text = body[i];
    const line = absolute(i);

    if (inFence[i]) {
      regions[current].push({ text, line, inFence: true });
      continue;
    }

    let kind = null;
    if (text === HINT_MARKER) kind = 'hint';
    else if (text === BACK_MARKER) kind = 'back';
    else if (text === NOTE_MARKER) kind = 'note';

    if (kind !== null) {
      markerCount[kind] += 1;
      if (markerCount[kind] === 1) markerLine[kind] = line;
      else add('marker-duplicate', line, 1);
      if (MARKER_RANK[kind] < maxRank && !orderReported) {
        add('marker-order', line, 1);
        orderReported = true;
      }
      if (MARKER_RANK[kind] > maxRank) maxRank = MARKER_RANK[kind];
      current = kind; // marker lines belong to no region
      continue;
    }

    const squashed = removeAsciiSpaces(text).toLowerCase();
    if (squashed === '<!--back-->' || squashed === '<!--hint-->' || squashed === '<!--note-->') {
      add('marker-malformed', line, 1);
    } else {
      const t = trim(text);
      if (t.length >= 7 && t.startsWith('<!--') && t.endsWith('-->')) {
        add('marker-unknown', line, byteColumn(text, text.indexOf('<!--')));
      }
    }
    regions[current].push({ text, line, inFence: false });
  }

  if (unterminatedAt !== null) add('fence-unterminated', absolute(unterminatedAt), 1);

  let front = stripBlankEdges(regions.front);
  let hint = markerCount.hint > 0 ? stripBlankEdges(regions.hint) : null;
  let back = markerCount.back > 0 ? stripBlankEdges(regions.back) : null;
  let note = markerCount.note > 0 ? stripBlankEdges(regions.note) : null;

  // §9: with `ask: false` and no `<!-- back -->`, the whole body after the
  // title is the back and the front is absent — the reference-card shape.
  if (ask === false && markerCount.back === 0) {
    back = front;
    front = [];
  }

  // ---- region presence and the back rules (§9) ----------------------------
  if (markerCount.hint > 0 && hint.length === 0) {
    add('empty-region', markerLine.hint, 1);
    hint = null;
  }
  if (markerCount.back > 0 && back.length === 0) {
    add('back-empty', markerLine.back, 1);
    back = null;
  }
  if (markerCount.note > 0 && note.length === 0) {
    add('empty-region', markerLine.note, 1);
    note = null;
  }
  if (markerCount.back === 0 && ask !== false) {
    add('back-missing', titleLine, 1);
  }

  // ---- references (§11) ---------------------------------------------------
  const refs = [];
  const distinct = new Set();
  let tooManyReported = false;
  const scanRefs = (name, entriesOfRegion) => {
    if (entriesOfRegion === null) return;
    for (const entry of entriesOfRegion) {
      if (entry.inFence) continue;
      const ref = classifyRefLine(entry.text);
      if (ref === null) {
        for (const inline of scanInlineRefs(entry.text)) {
          add('ref-inline', entry.line, byteColumn(entry.text, inline.index));
        }
        continue;
      }
      if (!ref.valid) {
        add('ref-not-an-id', entry.line, ref.column);
        continue;
      }
      if (id !== null && ref.id === id) {
        add('ref-self', entry.line, ref.column);
        continue;
      }
      refs.push({ id: ref.id, line: entry.line, column: ref.column, region: name });
      distinct.add(ref.id);
      if (distinct.size > MAX_DISTINCT_REFS && !tooManyReported) {
        add('ref-too-many', entry.line, ref.column);
        tooManyReported = true;
      }
      if (name === 'front') add('ref-in-front', entry.line, ref.column);
    }
  };
  scanRefs('front', front);
  scanRefs('hint', hint);
  scanRefs('back', back);
  scanRefs('note', note);

  // ---- math (§15) ---------------------------------------------------------
  checkDollars(front, add);
  checkDollars(hint, add);
  checkDollars(back, add);
  checkDollars(note, add);

  // ---- back length (§17) --------------------------------------------------
  if (back !== null && back.length > 0) {
    const counted = back
      .filter((entry) => !entry.inFence)
      .filter((entry) => !trim(entry.text).startsWith('|'))
      .filter((entry) => classifyRefLine(entry.text) === null)
      .map((entry) => entry.text)
      .join('\n');
    if (countCodePoints(counted) > MAX_BACK_CHARS) {
      add('back-too-long', markerLine.back ?? titleLine, 1);
    }
  }

  const text = (entriesOfRegion) => {
    if (entriesOfRegion === null || entriesOfRegion.length === 0) return null;
    return entriesOfRegion.map((entry) => entry.text).join('\n');
  };

  return {
    title,
    titleLine,
    front: text(front),
    hint: text(hint),
    back: text(back),
    note: text(note),
    regions: { front, hint, back, note },
    refs,
  };
}

function stripBlankEdges(entries) {
  let a = 0;
  let b = entries.length;
  while (a < b && isBlank(entries[a].text)) a++;
  while (b > a && isBlank(entries[b - 1].text)) b--;
  return entries.slice(a, b);
}

/**
 * An odd number of unescaped `$` in a region (outside fences) means a math
 * span is unclosed. `\$` is a literal dollar; `\\` is an escaped backslash.
 */
function checkDollars(entries, add) {
  if (entries === null) return;
  let count = 0;
  let first = null;
  for (const entry of entries) {
    if (entry.inFence) continue;
    const text = entry.text;
    let i = 0;
    while (i < text.length) {
      if (text[i] === '\\') { i += 2; continue; }
      if (text[i] === '$') {
        count++;
        if (first === null) first = { line: entry.line, column: byteColumn(text, i) };
      }
      i++;
    }
  }
  if (count % 2 === 1) add('odd-dollar', first.line, first.column);
}
