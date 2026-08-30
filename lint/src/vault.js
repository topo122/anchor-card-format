// Vault-level linting: scan order, cross-card rules, sorting.
// SPEC.md §5, §11, §16, §17, §18.

import fs from 'node:fs';
import path from 'node:path';

import { renderItems } from './items.js';
import { parseCardFile } from './parse.js';
import { severityOf } from './rules.js';
import { compareBytes, nfc } from './text.js';

export const MAX_FILE_BYTES = 1024 * 1024; // 1 MiB (§20)

/**
 * Lint an in-memory vault.
 *
 * @param {Array<{path:string, bytes?:Buffer, size?:number, tooLarge?:boolean}>} files
 *        card candidates, vault-relative NFC paths with `/` separators
 * @param {{skipped?: Array<{path:string, reason:string}>}} [options]
 */
export function lintFiles(files, options = {}) {
  // Vault scan order is ascending UTF-8 byte order of the vault-relative path;
  // it fixes both the new-card queue order and the diagnostic order (§5).
  const ordered = [...files].sort((a, b) => compareBytes(a.path, b.path));
  const parsed = ordered.map((file) => parseCardFile(file));

  const skipped = [...(options.skipped ?? [])];
  for (const entry of parsed) {
    if (entry.skipReason !== null && entry.skipReason !== undefined) {
      skipped.push({ path: entry.path, reason: entry.skipReason });
    }
  }

  // ---- id-duplicate (§7): all of them are errors -------------------------
  const byId = new Map();
  for (const entry of parsed) {
    if (!entry.isCard || entry.id === null || entry.id === undefined) continue;
    if (!byId.has(entry.id)) byId.set(entry.id, []);
    byId.get(entry.id).push(entry);
  }
  for (const [, group] of byId) {
    if (group.length < 2) continue;
    for (const entry of group) {
      entry.diagnostics.push({
        rule: 'id-duplicate',
        severity: severityOf('id-duplicate'),
        path: entry.path,
        line: entry.idLine,
        column: entry.idColumn,
      });
    }
  }

  const hasError = (entry) => entry.diagnostics.some((d) => d.severity === 'error');

  // ---- reference resolution (§11) ----------------------------------------
  // A target must exist, be a card, and have no error diagnostic. All of the
  // rules that could make it an error have already run: `ref-unresolved` is a
  // warning, so this pass cannot change its own input.
  const resolvable = new Map();
  for (const [id, group] of byId) {
    if (group.length !== 1) continue;
    const entry = group[0];
    if (entry.card === null || hasError(entry)) continue;
    resolvable.set(id, entry);
  }
  const resolve = (id) => {
    const entry = resolvable.get(id);
    if (entry === undefined) return null;
    return { title: entry.card.title, back: entry.card.back ?? null };
  };

  for (const entry of parsed) {
    for (const ref of entry.refs) {
      if (ref.region !== 'back') continue; // expanded only in back
      if (resolvable.has(ref.id)) continue;
      entry.diagnostics.push({
        rule: 'ref-unresolved',
        severity: severityOf('ref-unresolved'),
        path: entry.path,
        line: ref.line,
        column: ref.column,
      });
    }
  }

  // ---- duplicate-content (§17) -------------------------------------------
  const byContent = new Map();
  for (const entry of parsed) {
    if (entry.card === null) continue;
    const key = `${nfc(entry.card.title)}\u0000${nfc(entry.card.front ?? '')}`;
    if (!byContent.has(key)) byContent.set(key, []);
    byContent.get(key).push(entry);
  }
  for (const [, group] of byContent) {
    if (group.length < 2) continue;
    for (const entry of group) {
      entry.diagnostics.push({
        rule: 'duplicate-content',
        severity: severityOf('duplicate-content'),
        path: entry.path,
        line: entry.titleLine ?? 1,
        column: 1,
      });
    }
  }

  // ---- items (§13) --------------------------------------------------------
  const items = new Map();
  const cards = new Map();
  for (const entry of parsed) {
    if (entry.card === null) continue;
    const rendered = renderItems(entry, resolve);
    entry.card.items = rendered.map((r) => r.id);
    cards.set(entry.path, entry.card);
    if (hasError(entry)) continue; // excluded from the study queue (§18)
    for (const r of rendered) items.set(r.id, r.item);
  }

  // ---- ordering (§16) -----------------------------------------------------
  // There is no suppression mechanism: every diagnostic raised is reported (§17).
  const diagnostics = [];
  for (const entry of parsed) diagnostics.push(...entry.diagnostics);
  diagnostics.sort(compareDiagnostics);

  const cardEntries = parsed.filter((entry) => entry.isCard);
  const counts = {
    files: parsed.length,
    cards: cardEntries.length,
    cardsInError: cardEntries.filter(hasError).length,
    unresolvedRefs: diagnostics.filter((d) => d.rule === 'ref-unresolved').length,
    skippedFiles: skipped.length,
    errors: diagnostics.filter((d) => d.severity === 'error').length,
    warnings: diagnostics.filter((d) => d.severity === 'warn').length,
    info: diagnostics.filter((d) => d.severity === 'info').length,
  };

  return { diagnostics, cards, items, skipped, parsed, counts };
}

export function compareDiagnostics(a, b) {
  const byPath = compareBytes(a.path, b.path);
  if (byPath !== 0) return byPath;
  if (a.line !== b.line) return a.line - b.line;
  if (a.column !== b.column) return a.column - b.column;
  return compareBytes(a.rule, b.rule);
}

/**
 * Walk a vault root and read every card candidate (§5).
 *
 * @returns {{files: Array<{path:string, bytes:Buffer|null, size:number, tooLarge:boolean, fsPath:string}>, skipped: Array<{path:string, reason:string}>}}
 */
export function collectVault(root) {
  const files = [];
  const skipped = [];

  const walk = (absoluteDir, relativeDir) => {
    let entries;
    try {
      entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const dirent of entries) {
      const relative = nfc(relativeDir === '' ? dirent.name : `${relativeDir}/${dirent.name}`);
      const segment = nfc(dirent.name);
      const absolute = path.join(absoluteDir, dirent.name);

      if (dirent.isSymbolicLink()) {
        // Neither the file nor any traversed directory may be a symlink.
        skipped.push({ path: relative, reason: 'symlink' });
        continue;
      }
      if (segment.startsWith('_') || segment.startsWith('.')) {
        skipped.push({ path: relative, reason: 'name' });
        continue;
      }
      if (dirent.isDirectory()) {
        walk(absolute, relative);
        continue;
      }
      if (!dirent.isFile()) continue;
      if (!segment.endsWith('.md')) continue;

      // One unreadable file must not take the vault down with it (§18: a vault
      // is never rejected as a whole because of one card). There is no rule id
      // for an I/O failure — §17 is the complete set and no rule may be added —
      // so the file joins the skipped list, which §5 requires to be inspectable.
      let size = 0;
      try {
        size = fs.statSync(absolute).size;
      } catch {
        skipped.push({ path: relative, reason: 'unreadable' });
        continue;
      }
      if (size > MAX_FILE_BYTES) {
        files.push({ path: relative, bytes: null, size, tooLarge: true, fsPath: absolute });
        continue;
      }
      let bytes;
      try {
        bytes = fs.readFileSync(absolute);
      } catch {
        skipped.push({ path: relative, reason: 'unreadable' });
        continue;
      }
      files.push({
        path: relative,
        bytes,
        size,
        tooLarge: false,
        fsPath: absolute,
      });
    }
  };

  walk(root, '');
  files.sort((a, b) => compareBytes(a.path, b.path));
  skipped.sort((a, b) => compareBytes(a.path, b.path));
  return { files, skipped };
}

/** Lint a vault on disk. */
export function lintVault(root) {
  const { files, skipped } = collectVault(root);
  return lintFiles(files, { skipped });
}
