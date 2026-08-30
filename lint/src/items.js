// Study items and reference expansion — SPEC.md §11 (expansion) and §13.

import { classifyRefLine } from './refs.js';
import { isBlank } from './text.js';

/**
 * Expand `![[id]]` lines in a back region. One level deep: a reference inside
 * the included back is left exactly as written (§11).
 *
 * @param {Array<{text:string, inFence:boolean}>|null} entries
 * @param {(id:string) => ({title:string, back:string|null}|null)} resolve
 * @returns {string|null}
 */
export function expandBack(entries, resolve) {
  if (entries === null || entries.length === 0) return null;
  const out = [];
  for (const entry of entries) {
    const ref = entry.inFence ? null : classifyRefLine(entry.text);
    const target = ref !== null && ref.valid ? resolve(ref.id) : null;
    if (target === null) {
      out.push(entry.text);
      continue;
    }
    // Exactly: an empty line, `> ` + title, an empty line, the back, an empty line.
    out.push('', `> ${target.title}`, '');
    if (target.back !== null && target.back !== undefined) out.push(...target.back.split('\n'));
    out.push('');
  }
  let a = 0;
  let b = out.length;
  while (a < b && isBlank(out[a])) a++;
  while (b > a && isBlank(out[b - 1])) b--;
  if (a >= b) return null;
  return out.slice(a, b).join('\n');
}

function joinEntries(entries) {
  if (entries === null || entries.length === 0) return null;
  return entries.map((entry) => entry.text).join('\n');
}

function stack(...parts) {
  return parts.filter((part) => part !== null && part !== undefined && part !== '').join('\n\n');
}

/**
 * Derive the study items of one card and render both sides (§13).
 *
 * The title is shown with both sides, except on a reversed item where it is
 * hidden on the front. Side text is joined with a blank line; the join is a
 * presentation choice this implementation fixes, the item ids are not.
 *
 * @returns {Array<{id: string, item: {front: string, back: string, hint?: string, note?: string}}>}
 */
export function renderItems(parsed, resolve) {
  const card = parsed.card;
  if (card === null || parsed.regions === null) return [];
  if (card.ask === false) return [];

  const regions = parsed.regions;
  const hint = joinEntries(regions.hint);
  const note = joinEntries(regions.note);
  const back = expandBack(regions.back, resolve);
  const front = joinEntries(regions.front);
  const extras = {
    ...(hint !== null ? { hint } : {}),
    ...(note !== null ? { note } : {}),
  };

  const out = [];

  out.push({
    id: card.id,
    item: { front: stack(card.title, front), back: stack(card.title, back), ...extras },
  });
  if (card.reverse === true) {
    out.push({
      id: `${card.id}#r`,
      // The title is the answer for the reverse direction, so it is hidden.
      item: { front: back ?? '', back: stack(card.title, front), ...extras },
    });
  }
  return out;
}
