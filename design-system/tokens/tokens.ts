/**
 * DIGITALI · DESIGN TOKENS
 * 8px grid · TypeScript source of truth
 *
 * All numeric values are in pixels. The 8px base grid governs spacing
 * and component sizing; typography uses 4px steps so it composes onto
 * the 8px baseline (every two text steps lands on the grid).
 */

// ── GRID ────────────────────────────────────────────────────────────
export const grid = {
  base: 8,
  half: 4,
} as const;

// ── SPACING ─────────────────────────────────────────────────────────
export const spacing = {
  '2xs': 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
} as const;

export type SpacingToken = keyof typeof spacing;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type LineHeightToken = keyof typeof lineHeight;
export type LetterSpacingToken = keyof typeof letterSpacing;
export type FontWeightToken = keyof typeof fontWeight;

// ── RADII ───────────────────────────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  pill: 9999,
  circle: '50%',
} as const;

export type RadiusToken = keyof typeof radius;

// ── COMPONENT TOKENS ────────────────────────────────────────────────
export const components = {
  button: {
    height: 40,
    paddingY: 12,
    paddingX: 16,
    radius: radius.sm,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  card: {
    padding: 24,
    radius: radius.sm,
    gap: spacing.sm,
  },
  input: {
    height: 40,
    paddingY: 8,
    paddingX: 12,
    radius: radius.sm,
    fontSize: fontSize.md,
  },
  badge: {
    height: 24,
    paddingY: 4,
    paddingX: 8,
    radius: radius.xs,
    fontSize: fontSize.xs,
  },
} as const;

// ── HELPERS ─────────────────────────────────────────────────────────
/** Convert a numeric pixel token to a CSS string. */
export const px = (n: number) => `${n}px`;

/** Build CSS variables object for inline style injection. */
export const cssVars = {
  spacing: Object.fromEntries(
    Object.entries(spacing).map(([k, v]) => [`--space-${k}`, px(v)])
  ),
  fontSize: Object.fromEntries(
    Object.entries(fontSize).map(([k, v]) => [`--fs-${k}`, px(v)])
  ),
  lineHeight: Object.fromEntries(
    Object.entries(lineHeight).map(([k, v]) => [`--lh-${k}`, px(v)])
  ),
};

// ── DEFAULT EXPORT ──────────────────────────────────────────────────
export const tokens = {
  grid,
  spacing,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  radius,
  components,
} as const;

export default tokens;
