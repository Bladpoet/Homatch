// Swipe gesture numbers. Owner: Jazz. Source: docs/PRODUCT.md → Interaction spec.
export const DECK = {
  /** Commit if the card is dragged further than this (px)… */
  commitDistance: 120,
  /** …or released faster than this (px/s). */
  commitVelocity: 600,
  /** rotation (deg) = x / rotationDivisor, clamped to ±maxRotation */
  rotationDivisor: 20,
  maxRotation: 15,
  /** Stamp opacity = |x| / stampFullAt */
  stampFullAt: 100,
  /** Fly-out distance as a multiple of the viewport width, and its duration (s). */
  flyOutMultiplier: 1.5,
  flyOutDuration: 0.25,
  /** Button-triggered swipes tilt this much (deg). */
  buttonRotation: 10,
  /** Cards behind the top one. */
  backScale: 0.95,
  backOffsetY: 8,
  /** How many cards to render, and how many ahead to preload photos for. */
  renderCount: 3,
  preloadCount: 2,
} as const;
