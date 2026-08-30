// The fenced-code state machine — SPEC.md §10.
//
// This is the only Markdown block structure the parser knows. Indented code
// blocks, inline code spans, HTML blocks, block quotes and lists are NOT
// tracked, on purpose (§4).

// Opener: 0-3 SPACE characters (TAB is not allowed), then 3+ identical
// backticks or tildes, then any text.
const OPENER = /^( {0,3})(`{3,}|~{3,})/;
const CLOSER_BACKTICK = /^( {0,3})(`+)([ \t]*)$/;
const CLOSER_TILDE = /^( {0,3})(~+)([ \t]*)$/;

export function matchFenceOpener(line) {
  const m = OPENER.exec(line);
  if (!m) return null;
  return { char: m[2][0], length: m[2].length };
}

export function isFenceCloser(line, open) {
  const re = open.char === '`' ? CLOSER_BACKTICK : CLOSER_TILDE;
  const m = re.exec(line);
  if (!m) return false;
  return m[2].length >= open.length;
}

/**
 * Mark every line that belongs to a fenced block, delimiters included.
 * While a fence is open the scanner interprets nothing: no markers, no
 * references, no near-miss detection, no `$` counting.
 *
 * @param {string[]} lines
 * @returns {{inFence: boolean[], unterminatedAt: number|null}}
 */
export function scanFences(lines) {
  const inFence = new Array(lines.length).fill(false);
  let open = null;
  let openedAt = null;
  for (let i = 0; i < lines.length; i++) {
    if (open === null) {
      const opener = matchFenceOpener(lines[i]);
      if (opener) {
        open = opener;
        openedAt = i;
        inFence[i] = true;
      }
    } else {
      inFence[i] = true;
      if (isFenceCloser(lines[i], open)) {
        open = null;
        openedAt = null;
      }
    }
  }
  return { inFence, unterminatedAt: open === null ? null : openedAt };
}
