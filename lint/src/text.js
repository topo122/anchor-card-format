// Bytes, lines and text — SPEC.md §3.
//
// Every helper here exists because the four target languages disagree by
// default. Nothing in this file may be replaced by a standard-library
// convenience: `String.prototype.trim`, `split(/\r?\n/)` and `splitlines()`
// all cover more code points than the spec allows.

import { Buffer } from 'node:buffer';

export const TAB = 0x09;
export const SPACE = 0x20;

/** True for the only two characters the spec calls "ASCII space" (§3). */
export function isAsciiSpaceCode(code) {
  return code === TAB || code === SPACE;
}

/** Remove exactly one leading UTF-8 BOM (EF BB BF). A second BOM is content. */
export function stripBom(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return bytes.subarray(3);
  }
  return bytes;
}

/**
 * Strict UTF-8 decode. Invalid bytes MUST NOT become U+FFFD (§3), so a
 * fatal decoder is used and failure is reported to the caller.
 */
export function decodeUtf8(bytes) {
  try {
    // ignoreBOM: true means "do not strip a BOM"; stripBom() already removed
    // the single leading one, and any further U+FEFF is ordinary content.
    const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
    return { ok: true, text: decoder.decode(bytes) };
  } catch {
    return { ok: false, text: null };
  }
}

/**
 * Split on exactly CR LF, LF, CR (§3). U+000B, U+000C, U+0085, U+2028,
 * U+2029 and the ASCII separators stay inside their line. A final terminator
 * produces no extra empty line.
 */
export function splitLines(text) {
  const lines = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 0x0d) {
      lines.push(text.slice(start, i));
      if (i + 1 < text.length && text.charCodeAt(i + 1) === 0x0a) i++;
      start = i + 1;
    } else if (code === 0x0a) {
      lines.push(text.slice(start, i));
      start = i + 1;
    }
  }
  if (start < text.length) lines.push(text.slice(start));
  return lines;
}

/** Remove leading and trailing ASCII spaces only (§3). NBSP stays. */
export function trim(text) {
  let a = 0;
  let b = text.length;
  while (a < b && isAsciiSpaceCode(text.charCodeAt(a))) a++;
  while (b > a && isAsciiSpaceCode(text.charCodeAt(b - 1))) b--;
  return text.slice(a, b);
}

/** A line consisting only of ASCII spaces (possibly zero of them) (§3). */
export function isBlank(line) {
  for (let i = 0; i < line.length; i++) {
    if (!isAsciiSpaceCode(line.charCodeAt(i))) return false;
  }
  return true;
}

/** Drop every ASCII space — used only by the near-miss marker test (§9). */
export function removeAsciiSpaces(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (!isAsciiSpaceCode(text.charCodeAt(i))) out += text[i];
  }
  return out;
}

/** 1-based UTF-8 byte offset of a character index within a line (§16). */
export function byteColumn(line, charIndex) {
  const clamped = charIndex < 0 ? 0 : charIndex;
  return Buffer.byteLength(line.slice(0, clamped), 'utf8') + 1;
}

/** NFC — applied to paths, id, deck segments and tags only (§3). */
export function nfc(text) {
  return text.normalize('NFC');
}

/** Compare as UTF-8 byte sequences, never with the default string order (§3). */
export function compareBytes(a, b) {
  return Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

/** Number of Unicode code points (used by the back-too-long limit, §17). */
export function countCodePoints(text) {
  let n = 0;
  for (const _ of text) n++; // eslint-disable-line no-unused-vars
  return n;
}
