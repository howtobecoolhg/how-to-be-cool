/**
 * How To Be Cool Club design tokens.
 *
 * Every value here was taken from the live guide (guide.html / site/index.html) so the system
 * describes the site as it ships today: pink newsprint paper, black ink, one loud green for
 * display headlines, Bowlby One for display and IBM Plex Mono for everything else, 1.5px ink
 * rules, pill buttons and hard offset shadows.
 *
 * This file is the single source of truth. `npm run sync` writes the CSS custom properties into
 * guide.html and site/index.html, and `npm run build` emits dist/tokens.css and dist/htbc.css.
 */

export const color = {
  /** Page background: pink newsprint. */
  paper: "#fbcfec",
  /** Hover and selected surfaces, one step deeper than paper. */
  paper2: "#f6b9e2",
  /** Text, rules, borders and filled buttons. */
  ink: "#111",
  /** Hover on an already-inked surface. */
  inkHover: "#222",
  /** Display headlines only (hero line, group headings, window titles). */
  headline: "#12b83c",
  /** Secondary text: meta lines, placeholders, footers. */
  muted: "#6b3f60",
  /** Inside of form fields, a touch lighter than paper. */
  field: "#fff5fb",
  /** Soft search field (the rounded, borderless-feeling one). */
  softField: "#fff6fb",
  softLine: "#d988c0",
  softPlaceholder: "#a26592",
  /** Empty rating stars. */
  rateOff: "#d98cc2",
  /** Small text on an ink surface (quote card byline). */
  onInkMuted: "#bdb4a4",
  /** Modal backdrop. */
  scrim: "rgba(17,17,17,.35)",
  /** Hairline divider inside dropdown lists. */
  hairline: "rgba(17,17,17,.18)",
} as const;

/** CSS variable names the page script still reads. Kept so nothing in guide.html breaks. */
export const legacyColor = {
  plaid: "#f0aad9",
  "plaid-dark": "#e892cc",
  pink: "#111",
  pink2: "#333",
  blush: "#f6b9e2",
  hot: "#111",
  lilac: "#111",
  mint: "#f0aad9",
  box: "#fbcfec",
  boxline: "#111",
  boxhead: "transparent",
  boxheadink: "#111",
  lime: "#111",
} as const;

export const font = {
  display: '"Bowlby One", "Arial Black", Impact, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
} as const;

/** Google Fonts stylesheet the page loads for the two families above. */
export const fontStylesheet =
  "https://fonts.googleapis.com/css2?family=Bowlby+One&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";

export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** Mono UI sizes, in px. The body copy is 14px on a 1.6 line height. */
export const fontSize = {
  micro: 10,
  label: 11,
  small: 12,
  meta: 13,
  body: 14,
} as const;

/** Display (Bowlby One, uppercase) sizes. */
export const displaySize = {
  sm: "22px",
  md: "26px",
  lg: "30px",
  xl: "34px",
  hero: "clamp(40px,10vw,112px)",
} as const;

export const lineHeight = { tight: 0.92, display: 1, snug: 1.2, body: 1.6 } as const;

/** Uppercase tracking used on labels, pills and box headings. */
export const tracking = { tight: ".04em", pill: ".06em", badge: ".08em", label: ".1em", heading: ".12em" } as const;

/** Spacing scale in px, from the gaps and paddings the guide uses most. */
export const space = {
  "0": 0,
  "1": 2,
  "2": 4,
  "3": 6,
  "4": 8,
  "5": 10,
  "6": 12,
  "7": 14,
  "8": 16,
  "9": 20,
  "10": 28,
  "11": 56,
} as const;

export const radius = { none: "0", pill: "999px", round: "50%" } as const;

export const border = {
  /** The standard ink rule on boxes, fields, pills and cards. */
  rule: "1.5px",
  /** List dividers. */
  hair: "1px",
  /** Heavy bottom edge on the primary (+ Add) button. */
  heavy: "4px",
} as const;

export const shadow = {
  /** Dropdown suggestion lists. */
  pop: "5px 5px 0 #111",
  /** Windows / modals. */
  window: "8px 8px 0 #111",
} as const;

export const layout = { maxWidth: "1100px", gutter: "16px", windowWidth: "580px" } as const;

export const breakpoint = { sm: 480, phone: 520, tablet: 700, home: 760 } as const;

export const motion = {
  fade: ".6s ease",
  ticker: "110s linear infinite",
} as const;

export const zIndex = { dropdown: 6, header: 9, safeArea: 10, scrim: 20, toast: 30 } as const;

export const tokens = {
  color,
  legacyColor,
  font,
  fontWeight,
  fontSize,
  displaySize,
  lineHeight,
  tracking,
  space,
  radius,
  border,
  shadow,
  layout,
  breakpoint,
  motion,
  zIndex,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof color;
export type SpaceToken = keyof typeof space;
