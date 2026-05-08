/**
 * Grid validator (no-build version) — reads tokens.json and validates
 * every numeric token against the 8px grid (4px sub-grid allowed).
 *
 * Usage:  node design-system/scripts/validate-grid.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(
  readFileSync(resolve(__dirname, '../tokens/tokens.json'), 'utf8')
);

const BASE = 8;
const HALF = 4;

const ALLOW_TRACKING = new Set([-0.5, 0, 0.5, 1]);
const ALLOW_LITERAL = new Set(['50%', '9999px']);

const results = [];

function pxToNum(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return NaN;
  const m = v.match(/^(-?\d*\.?\d+)px$/);
  return m ? Number(m[1]) : NaN;
}

function classify(num, { allowSubGrid }) {
  if (num === 0) return 'ok';
  if (Number.isInteger(num) && num % BASE === 0) return 'ok';
  if (allowSubGrid && Number.isInteger(num) && num % HALF === 0) return 'sub-grid';
  return 'violation';
}

function checkValue(path, raw, { allowSubGrid = false, allowFractional = false } = {}) {
  // Token references like "{radius.sm}"
  if (typeof raw === 'string' && raw.startsWith('{') && raw.endsWith('}')) {
    results.push({ path, value: raw, severity: 'ok', reason: 'reference' });
    return;
  }
  if (ALLOW_LITERAL.has(raw)) {
    results.push({ path, value: raw, severity: 'ok', reason: 'allowed-literal' });
    return;
  }
  const num = pxToNum(raw);
  if (Number.isNaN(num)) {
    results.push({ path, value: raw, severity: 'violation', reason: 'unparseable' });
    return;
  }
  if (allowFractional && ALLOW_TRACKING.has(num)) {
    results.push({ path, value: raw, severity: 'ok', reason: 'tracking-allowed' });
    return;
  }
  const sev = classify(num, { allowSubGrid });
  results.push({
    path,
    value: raw,
    severity: sev,
    reason:
      sev === 'ok' ? `×${BASE}`
      : sev === 'sub-grid' ? `×${HALF} (sub-grid)`
      : `not aligned to ${HALF}/${BASE}`,
  });
}

function walk(obj, prefix, opts = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && 'value' in v) {
      checkValue(path, v.value, opts);
    } else if (v && typeof v === 'object') {
      walk(v, path, opts);
    }
  }
}

// Scope-specific options
walk(tokens.spacing, 'spacing', { allowSubGrid: true });
walk(tokens.typography.fontSize, 'fontSize', { allowSubGrid: true });
walk(tokens.typography.lineHeight, 'lineHeight', { allowSubGrid: true });
walk(tokens.typography.letterSpacing, 'letterSpacing', { allowFractional: true });
walk(tokens.radius, 'radius', { allowSubGrid: true });
walk(tokens.components, 'components', { allowSubGrid: true });

// Report
const violations = results.filter((r) => r.severity === 'violation');
const subGrid = results.filter((r) => r.severity === 'sub-grid');
const ok = results.filter((r) => r.severity === 'ok');

const c = { red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', dim: '\x1b[2m', reset: '\x1b[0m' };

console.log('\n──── DESIGN TOKEN GRID VALIDATION ────\n');
for (const r of results) {
  const color = r.severity === 'violation' ? c.red : r.severity === 'sub-grid' ? c.yellow : c.green;
  const tag = r.severity === 'violation' ? '✗ FAIL' : r.severity === 'sub-grid' ? '◐ HALF' : '✓ OK  ';
  console.log(
    `${color}${tag}${c.reset}  ${r.path.padEnd(36)} ${String(r.value).padStart(8)}  ${c.dim}${r.reason}${c.reset}`
  );
}
console.log(
  `\n${c.green}${ok.length} on-grid${c.reset} · ${c.yellow}${subGrid.length} sub-grid${c.reset} · ${c.red}${violations.length} violations${c.reset}\n`
);

if (violations.length) {
  console.log(`${c.red}Token validation failed.${c.reset}\n`);
  process.exit(1);
}
console.log(`${c.green}All tokens align with the 8px grid (or accepted 4px sub-grid).${c.reset}\n`);
