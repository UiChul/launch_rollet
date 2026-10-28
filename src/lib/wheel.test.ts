import { describe, expect, it } from 'vitest';
import { computeTargetRotation, randomJitter, segmentAtPointer } from './wheel';

describe('computeTargetRotation', () => {
  const cases: [number, number][] = [];
  for (const n of [1, 2, 3, 7, 10]) for (let i = 0; i < n; i++) cases.push([n, i]);

  it.each(cases)('lands segment %#: n=%i index=%i under the pointer', (n, index) => {
    for (const current of [0, 123.4, 1800, 3725.9]) {
      for (const jitter of [0, (360 / n) * 0.35, -(360 / n) * 0.35]) {
        const target = computeTargetRotation(current, index, n, jitter);
        expect(segmentAtPointer(target, n)).toBe(index);
      }
    }
  });

  it('always spins forward by at least five full turns', () => {
    for (const current of [0, 90, 359, 5000]) {
      const target = computeTargetRotation(current, 3, 10);
      expect(target - current).toBeGreaterThanOrEqual(5 * 360);
      expect(target - current).toBeLessThan(6 * 360);
    }
  });
});

describe('randomJitter', () => {
  it('stays within ±35% of a segment', () => {
    expect(randomJitter(10, () => 0)).toBeCloseTo(-12.6);
    expect(randomJitter(10, () => 0.999999)).toBeLessThan(12.6);
  });
});
