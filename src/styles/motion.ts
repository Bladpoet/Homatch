// JS motion tokens for the `motion` library. Owner: Kamsi.
// Values come from docs/PRODUCT.md → Interaction spec. Keep them in sync with
// the CSS durations in tokens.css.

export const spring = {
  /** Card snap-back, rewind, small UI. */
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  /** Sheets opening/closing. */
  sheet: { type: 'spring', stiffness: 300, damping: 30 },
  /** Match overlay circles. */
  pop: { type: 'spring', stiffness: 260, damping: 20 },
} as const;

export const duration = {
  fast: 0.15,
  base: 0.18,
  slow: 0.25,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Page/content enter: fade + 4px rise. */
export const enter = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.base, ease: ease.out },
} as const;
