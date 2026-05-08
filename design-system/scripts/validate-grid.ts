/**
 * Grid validator — ensures every numeric token aligns with the 8px grid.
 * Acceptable: multiples of 8 (preferred) or 4 (sub-grid for typography & icon detail).
 *
 * Usage:
 *   npx tsx design-system/scripts/validate-grid.ts
 *
 * Exit code 0 → all tokens valid · 1 → violations found.
 */

import {
  spacing,
  fontSize,
  lineHeight,
  letterSpacing,
  radius,
  components,
  grid,
} from '../tokens/tokens';

type Severity = 'ok' | 'sub-grid' | 'violation';

interface Result {
  path: string;
  value: number | string;
  severity: Severity;
  reason: string;
}

const BASE = grid.base;       // 8
const HALF = grid.half;       // 4

function classify(value: number, allowSubGrid: boolean): Severity {
  if (value === 0) return 'ok';
  if (Number.isInteger(value) && value % BASE === 0) return 'ok';
  if (allowSubGrid && Number.isInteger(value) && value % HALF === 0) return 'sub-grid';
  return 'violation';
}

const results: Result[] = [];

function check(
  path: string,
  value: unknown,
  { allowSubGrid = false, allowSpecial = [] as Array<number | string> } = {}
) {
  if (typeof value === 'string') {
    if (allowSpecial.includes(value)) {
      results.push({ path, value, severity: 'ok', reason: 'allowed-special' });
      return;
    }
    results.push({ path, value, severity: 'violation', reason: 'non-numeric' });
    return;
  }
  if (typeof value !== 'number') return;
  if (allowSpecial.includes(value)) {
    results.push({ path, value, severity: 'ok', reason: 'allowed-special' });
    return;
  }
  // letterSpacing can be fractional ±0.5
  if (Math.abs(value) < 1 && Number.isFinite(value)) {
    const ok = [-0.5, 0, 0.5].includes(value);
    results.push({
      path,
      value,
      severity: ok ? 'ok' : 'violation',
      reason: ok ? 'tracking' : 'fractional-not-on-half-step',
    });
    return;
  }
  const sev = classify(value, allowSubGrid);
  results.push({
    path,
    value,
    severity: sev,
    reason:
      sev === 'ok'
        ? `multiple-of-${BASE}`
        : sev === 'sub-grid'
          ? `multiple-of-${HALF}-only`
          : `not-multiple-of-${HALF}-or-${BASE}`,
  });
}

// ── SPACING (must be 8× multiples, 2xs at 4 is the only sub-grid) ──
for (const [k, v] of Object.entries(spacing)) {
  check(`spacing.${k}`, v, { allowSubGrid: k === '2xs' });
}

// ── TYPOGRAPHY (font-size + line-height: 4px steps OK) ──
for (const [k, v] of Object.entries(fontSize)) {
  check(`fontSize.${k}`, v, { allowSubGrid: true });
}
for (const [k, v] of Object.entries(lineHeight)) {
  check(`lineHeight.${k}`, v, { allowSubGrid: true });
}
for (const [k, v] of Object.entries(letterSpacing)) {
  check(`letterSpacing.${k}`, v);
}

// ── RADII ──
for (const [k, v] of Object.entries(radius)) {
  check(`radius.${k}`, v, { allowSubGrid: true, allowSpecial: ['50%', 9999] });
}

// ── COMPONENTS ──
for (const [comp, props] of Object.entries(components)) {
  for (const [prop, value] of Object.entries(props as Record<string, unknown>)) {
    // padding-X 12 and padding-Y 12 on inputs/buttons are intentional sub-grid
    check(`components.${comp}.${prop}`, value, { allowSubGrid: true });
  }
}

// ── REPORT ──
const violations = results.filter((r) => r.severity === 'violation');
const subGrid = results.filter((r) => r.severity === 'sub-grid');
const ok = results.filter((r) => r.severity === 'ok');

const reset = '\x1b[0m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const dim = '\x1b[2m';

console.log('\n──── DESIGN TOKEN GRID VALIDATION ────\n');
for (const r of results) {
  const color = r.severity === 'violation' ? red : r.severity === 'sub-grid' ? yellow : green;
  const tag =
    r.severity === 'violation' ? '✗ FAIL' : r.severity === 'sub-grid' ? '◐ HALF' : '✓ OK  ';
  console.log(
    `${color}${tag}${reset}  ${r.path.padEnd(34)} ${String(r.value).padStart(6)}  ${dim}${r.reason}${reset}`
  );
}

console.log(
  `\n${green}${ok.length} on-grid${reset} · ${yellow}${subGrid.length} sub-grid${reset} · ${red}${violations.length} violations${reset}\n`
);

if (violations.length) {
  console.log(`${red}Token validation failed.${reset} Fix the values above.\n`);
  process.exit(1);
}
console.log(`${green}All tokens align with the 8px grid (or accepted 4px sub-grid).${reset}\n`);
process.exit(0);
