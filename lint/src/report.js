// Output formatting. Diagnostics themselves are §16; message text is not
// normative (§16) and is written to be actionable by an agent.

import { BANNER, RULES } from './rules.js';

const COLORS = {
  error: '\u001b[31m',
  warn: '\u001b[33m',
  info: '\u001b[36m',
  dim: '\u001b[2m',
  bold: '\u001b[1m',
  reset: '\u001b[0m',
};

function paint(text, code, color) {
  return color ? `${code}${text}${COLORS.reset}` : text;
}

/** One `{rule, severity, path, line, column}` plus its message text. */
export function withMessage(diagnostic) {
  const rule = RULES[diagnostic.rule];
  return {
    rule: diagnostic.rule,
    severity: diagnostic.severity,
    path: diagnostic.path,
    line: diagnostic.line,
    column: diagnostic.column,
    message: rule.what,
    fix: rule.fix,
    ...(rule.never ? { never: rule.never } : {}),
  };
}

export function formatJson(result, extra = {}) {
  return `${JSON.stringify(
    {
      version: 2,
      summary: { ...result.counts, ...extra },
      diagnostics: result.diagnostics.map(withMessage),
    },
    null,
    2,
  )}\n`;
}

export function formatHuman(result, options = {}) {
  const color = options.color === true;
  const out = [];

  if (result.diagnostics.length > 0) {
    out.push(paint(BANNER, COLORS.dim, color), '');
  }

  for (const d of result.diagnostics) {
    const rule = RULES[d.rule];
    const where = paint(`${d.path}:${d.line}:${d.column}`, COLORS.bold, color);
    const severity = paint(d.severity, COLORS[d.severity], color);
    out.push(`${where}  ${severity}  ${d.rule}`);
    out.push(`    ${rule.what}`);
    out.push(`    fix: ${rule.fix}`);
    if (rule.never) out.push(`    never: ${rule.never}`);
    out.push('');
  }

  if (options.verbose === true && result.skipped.length > 0) {
    out.push(paint('skipped .md files (not a problem — no `id` in frontmatter, or an ignored path):', COLORS.dim, color));
    for (const s of result.skipped) out.push(`    ${s.path}  (${s.reason})`);
    out.push('');
  }

  const c = result.counts;
  const parts = [
    `${c.errors} ${plural(c.errors, 'error')}`,
    `${c.warnings} ${plural(c.warnings, 'warning')}`,
    `${c.info} info`,
  ];
  out.push(parts.join(', '));
  const detail = [
    `${c.cards} ${plural(c.cards, 'card')}`,
    `${c.cardsInError} in error`,
    `${c.unresolvedRefs} unresolved ${plural(c.unresolvedRefs, 'reference')}`,
    `${c.skippedFiles} skipped .md ${plural(c.skippedFiles, 'file')}`,
  ];
  if (typeof options.orphanLogEntries === 'number') {
    detail.push(`${options.orphanLogEntries} orphan log ${plural(options.orphanLogEntries, 'entry', 'entries')}`);
  }
  out.push(paint(detail.join(', '), COLORS.dim, color));
  return `${out.join('\n')}\n`;
}

function plural(n, one, many) {
  if (n === 1) return one;
  return many ?? `${one}s`;
}
