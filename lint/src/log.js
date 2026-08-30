// The review log — SPEC.md §19. Read-only: this tool never writes here.

import fs from 'node:fs';
import path from 'node:path';

import { decodeUtf8, splitLines, stripBom } from './text.js';

/**
 * Count log entries whose item id has no matching card (§18, §19).
 * Orphans MUST be kept; they are reported as a count and nothing more.
 *
 * @param {string} root vault root
 * @param {Set<string>} cardIds ids of every card in the vault
 * @returns {{orphans: number, entries: number, unreadable: number}}
 */
export function countOrphanLogEntries(root, cardIds) {
  const dir = path.join(root, 'data', 'reviews');
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch {
    return { orphans: 0, entries: 0, unreadable: 0 };
  }

  let orphans = 0;
  let entries = 0;
  let unreadable = 0;

  for (const name of names.sort()) {
    if (!name.endsWith('.jsonl')) continue;
    let text;
    try {
      const decoded = decodeUtf8(stripBom(fs.readFileSync(path.join(dir, name))));
      if (!decoded.ok) { unreadable++; continue; }
      text = decoded.text;
    } catch {
      unreadable++;
      continue;
    }
    for (const line of splitLines(text)) {
      if (line === '') continue;
      let record;
      try {
        record = JSON.parse(line);
      } catch {
        unreadable++;
        continue;
      }
      if (record === null || typeof record !== 'object' || typeof record.item !== 'string') {
        unreadable++;
        continue;
      }
      entries++;
      const hash = record.item.indexOf('#');
      const base = hash < 0 ? record.item : record.item.slice(0, hash);
      if (!cardIds.has(base)) orphans++;
    }
  }

  return { orphans, entries, unreadable };
}
