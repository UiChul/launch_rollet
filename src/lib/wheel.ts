const MIN_TURNS = 5;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * Rotation (deg, clockwise) that brings segment `index` under a pointer at the top.
 * Segments are laid out clockwise from 12 o'clock, each `360/n` wide.
 * The result is always at least MIN_TURNS full turns beyond `current`.
 */
export function computeTargetRotation(current: number, index: number, n: number, jitter = 0): number {
  const center = (index + 0.5) * (360 / n);
  const desired = mod(360 - center + jitter, 360);
  const delta = mod(desired - mod(current, 360), 360);
  return current + MIN_TURNS * 360 + delta;
}

/** Random offset within ±35% of a segment so the pointer doesn't always land dead-center. */
export function randomJitter(n: number, rng: () => number = Math.random): number {
  return (rng() * 2 - 1) * (360 / n) * 0.35;
}

/** Which segment sits under the top pointer at a given rotation. */
export function segmentAtPointer(rotation: number, n: number): number {
  return Math.floor(mod(360 - rotation, 360) / (360 / n));
}
