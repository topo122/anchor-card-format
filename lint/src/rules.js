// The lint rule table — SPEC.md §17. This is the complete set: no rule may
// be added, and there is no suppression mechanism.
//
// Rule ids and severities are normative and stable. `what` / `fix` / `never`
// are message text: NOT normative, localizable, and written for the reader who
// will act on them (usually an agent). Every message names one repair, and
// where a tempting wrong repair exists it names that too.

/** @type {Record<string, {severity: 'error'|'warn'|'info', what: string, fix: string, never?: string}>} */
export const RULES = {
  // ---- errors: the card is excluded from the study queue (§18) -------------
  'encoding-invalid': {
    severity: 'error',
    what: 'The file is not valid UTF-8, so its text cannot be read at all.',
    fix: 'Re-save the file as UTF-8 (no BOM needed; one leading BOM is tolerated).',
    never: 'Do not let an editor swap the bad bytes for U+FFFD — that silently rewrites study text.',
  },
  'file-too-large': {
    severity: 'error',
    what: 'The file is larger than 1 MiB, so it is skipped without being read.',
    fix: 'Keep prose in the card and put the bulk (images, data) in files beside it, referenced with a relative path.',
    never: 'Do not split the card in two to get under the limit — that mints a new id and abandons review history.',
  },
  'frontmatter-unterminated': {
    severity: 'error',
    what: 'Frontmatter opens with `---` but no closing `---` line follows.',
    fix: 'Add a line that is exactly `---` (no leading or trailing spaces) after the last key.',
    never: 'Do not close it with `...` or `----`; only an exact `---` line terminates frontmatter.',
  },
  'frontmatter-syntax': {
    severity: 'error',
    what: 'This frontmatter line is outside the supported subset (it is not YAML).',
    fix: 'Use only `key: value`, `key: [a, b]`, or `key:` followed by `  - item` lines indented with exactly two spaces; keys match [a-z][a-z0-9-]* at column 0 and the colon is followed by a space or end of line.',
    never: 'Do not reach for YAML features — block scalars (| >), anchors (& *), merge keys (<<), nested maps, tab indentation and duplicate keys are errors, never silently ignored.',
  },
  'format-unsupported': {
    severity: 'error',
    what: '`format` is present with a value other than `2`.',
    fix: 'Write `format: 2`, or delete the line — 2 is the default.',
    never: 'Do not invent a newer format number to silence this; a v2 reader would misread the card.',
  },
  'id-missing': {
    severity: 'error',
    what: 'The file has a `<!-- back -->` line but no `id` key, so it is not a card and is never studied.',
    fix: 'Add frontmatter at the very top: a `---` line, `id: <fresh 26-character ULID>`, then a `---` line.',
    never: 'Do not copy an id from another card — one id belongs to exactly one card.',
  },
  'id-invalid': {
    severity: 'error',
    what: '`id` does not match [A-Za-z0-9][A-Za-z0-9_-]{2,63} — 3 to 64 ASCII characters, and `#` is reserved for item ids.',
    fix: 'For a card that has never been studied, replace the id with a fresh ULID.',
    never: 'Do not "repair" the id of a card already in use — a changed id orphans its review history, and a deleted card\'s id must never be reused. If in doubt, ask a human.',
  },
  'id-duplicate': {
    severity: 'error',
    what: 'Two or more cards share this id, so none of them is scheduled and `![[id]]` does not resolve for any of them.',
    fix: 'Give a fresh ULID to the card that was copied most recently, and leave the id on the card that owns the history.',
    never: 'Do not renumber both cards, and do not merge the two files into one.',
  },
  'tag-invalid': {
    severity: 'error',
    what: 'A tag is empty, or contains a comma, after trimming.',
    fix: 'Remove the empty element, or rewrite the tag without a comma: `tags: [inference, exam-2026]`.',
    never: 'Do not quote a comma into a tag — the separator is not escapable.',
  },
  'title-missing': {
    severity: 'error',
    what: 'The first non-blank line after the frontmatter is not an ATX H1.',
    fix: 'Make it exactly one `#` at column 0, one or more spaces, then the title text.',
    never: 'Do not use a setext underline (`====`) or an indented heading — neither is a title.',
  },
  'marker-duplicate': {
    severity: 'error',
    what: 'A `<!-- hint -->`, `<!-- back -->` or `<!-- note -->` marker appears more than once.',
    fix: 'Keep one marker of each kind and merge the two regions into that one.',
    never: 'Do not move the surplus half into a second card — splitting mints a new id and abandons review history.',
  },
  'marker-order': {
    severity: 'error',
    what: 'Markers are out of order; the fixed order is hint, then back, then note.',
    fix: 'Reorder the blocks so `<!-- hint -->` comes before `<!-- back -->`, which comes before `<!-- note -->`.',
    never: 'Do not duplicate a marker to make the order work out.',
  },
  'marker-malformed': {
    severity: 'error',
    what: 'This line is a near miss for a marker; markers are byte-exact whole lines.',
    fix: 'Write it as exactly `<!-- back -->` (one space inside each end, lowercase, column 0, nothing before or after — including trailing spaces).',
    never: 'Do not leave it as is expecting the parser to be forgiving; it is deliberately not.',
  },
  'back-missing': {
    severity: 'error',
    what: 'The card has no `<!-- back -->` and is not `ask: false`, so it has no answer side.',
    fix: 'Add a line that is exactly `<!-- back -->` above the answer text.',
    never: 'Do not put the answer in the title of a card that is not `reverse: true` — the title is shown on the question side.',
  },
  'back-empty': {
    severity: 'error',
    what: '`<!-- back -->` is present but the region after it is empty.',
    fix: 'Write the answer under the marker, or delete the marker if the card is `ask: false`.',
    never: 'Do not leave a placeholder like "TODO" — an empty answer is better caught here than memorised.',
  },
  'ref-self': {
    severity: 'error',
    what: 'The card references its own id, which would expand into itself.',
    fix: 'Delete the reference line, or point it at the id of the shared `ask: false` card.',
    never: 'Do not change this card id to break the cycle — that orphans its review history.',
  },

  // ---- warnings: the card is still studied (§17) ---------------------------
  'ref-unresolved': {
    severity: 'warn',
    what: 'The reference target does not exist, is not a card, or has an error, so the line stays literal.',
    fix: 'Create the target as an `ask: false` card with that id, or correct the id in this line.',
    never: 'Do not paste the target text into this card instead — that is the duplication references exist to remove.',
  },
  'ref-in-front': {
    severity: 'warn',
    what: 'A reference appears in the front region, where it stays literal and can leak the answer.',
    fix: 'Move the reference line below `<!-- back -->`; references are expanded only there.',
    never: 'Do not expect it to expand on the question side — it never will.',
  },
  'ref-inline': {
    severity: 'warn',
    what: 'Reference syntax appears inside a sentence, so it is ordinary text and is never expanded.',
    fix: 'Put `![[id]]` alone on its own line (leading and trailing spaces are allowed, nothing else is).',
    never: 'Do not add a label like `![[id|text]]` — labels are not part of the format.',
  },
  'ref-not-an-id': {
    severity: 'warn',
    what: 'This whole line looks like a reference but the text between the brackets is not a valid id.',
    fix: 'Write `![[<id>]]` with no spaces, no `|label` and no `#heading` inside the brackets.',
    never: 'Do not assume it will resolve at study time; it stays literal.',
  },
  'ref-too-many': {
    severity: 'warn',
    what: 'The card has more than 16 distinct references; they all still expand, but the answer side is now assembled from many places.',
    fix: 'Collapse the shared text into fewer `ask: false` cards.',
    never: 'Do not split this card to spread the references around — that abandons its review history.',
  },
  'marker-unknown': {
    severity: 'warn',
    what: 'This HTML comment line is not a marker, so it is displayed literally to the learner.',
    fix: 'Use one of `<!-- hint -->`, `<!-- back -->`, `<!-- note -->`, or delete the line.',
    never: 'Do not invent a new marker word — there are exactly three, and unknown comments are frozen as literal content.',
  },
  'fence-unterminated': {
    severity: 'warn',
    what: 'A code fence is still open at end of file, so everything after it is code.',
    fix: 'Close the fence with a line of at least as many of the same fence character.',
    never: 'Do not close it with a different fence character; ``` does not close ~~~.',
  },
  'empty-region': {
    severity: 'warn',
    what: 'A `<!-- hint -->` or `<!-- note -->` marker is present with nothing under it.',
    fix: 'Write the hint or note, or delete the marker line.',
    never: 'Do not fill it with filler text; an absent region is normal and costs nothing.',
  },
  'back-too-long': {
    severity: 'warn',
    what: 'The answer side is over 1200 characters (fenced blocks, table rows and reference lines excluded), which is more than one recall.',
    fix: 'Shorten the answer, or move the shared part into an `ask: false` card and reference it with `![[id]]` on its own line.',
    never: 'Do not split this card into two cards — that mints a new id and abandons its review history. There is no way to suppress this warning; if the length is genuinely required, leave it.',
  },
  'tag-duplicate': {
    severity: 'warn',
    what: 'The same tag is listed twice; both are kept.',
    fix: 'Delete the repeated element.',
  },
  'odd-dollar': {
    severity: 'warn',
    what: 'A region has an odd number of unescaped `$`, so a math span is unclosed and the rest of the region may render as math.',
    fix: 'Close the span, or write a literal dollar sign as `\\$`.',
    never: 'Do not delete the `$` if it belongs to a formula — escape it instead.',
  },
  'duplicate-content': {
    severity: 'warn',
    what: 'Another card has the same title and front, so the two ask the same question and their schedules will drift apart.',
    fix: 'Rewrite one of the two to ask a different question, or report that the newer file should be deleted — deleting a card file is a human decision.',
    never: 'Do not merge them by changing an id — delete the duplicate file instead, which leaves the surviving card history intact.',
  },

  // ---- info ---------------------------------------------------------------
  'unknown-key': {
    severity: 'info',
    what: 'The key is not part of the format; it is preserved in `extra` and ignored.',
    fix: 'Nothing to do, unless it was a typo for one of id, tags, ask, reverse, format. `deck` is not a key — the directory path is the deck. Agent metadata belongs under an `x-` prefix.',
    never: 'Do not expect any behaviour from it — unknown keys are frozen as ignored forever.',
  },
};

export const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 };

export function severityOf(rule) {
  const entry = RULES[rule];
  if (!entry) throw new Error(`unknown rule id: ${rule}`);
  return entry.severity;
}

export function isKnownRule(rule) {
  return Object.prototype.hasOwnProperty.call(RULES, rule);
}

/** The banner §17 says linter output SHOULD open with. */
export const BANNER = [
  'Never change an existing `id`. Never split one card into two to silence a',
  'warning — both destroy review history. Shorten, or move shared text into an',
  '`ask: false` card and reference it.',
].join('\n');
