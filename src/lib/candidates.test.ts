import { describe, expect, it } from 'vitest';
import { getCandidates, sampleMenus } from './candidates';
import type { HistoryEntry, Menu, Settings } from '../types';

const menu = (id: string): Menu => ({ id, name: id, emoji: '🍽️', isCustom: false });
const MENUS = ['a', 'b', 'c', 'd'].map(menu);
const NOW = new Date('2026-10-28T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const at = (msAgo: number) => new Date(NOW.getTime() - msAgo).toISOString();
const settings = (over: Partial<Settings> = {}): Settings => ({ excludedIds: [], recentDays: 3, ...over });
const ids = (ms: Menu[]) => ms.map((m) => m.id);

describe('getCandidates', () => {
  it('returns every menu when nothing is filtered', () => {
    expect(ids(getCandidates(MENUS, settings(), [], NOW))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('drops excluded menus', () => {
    expect(ids(getCandidates(MENUS, settings({ excludedIds: ['b', 'd'] }), [], NOW))).toEqual(['a', 'c']);
  });

  it('drops menus decided within the last N days and keeps older ones', () => {
    const history: HistoryEntry[] = [
      { menuId: 'a', decidedAt: at(3 * 24 * HOUR - HOUR) }, // just inside 3 days
      { menuId: 'b', decidedAt: at(3 * 24 * HOUR + HOUR) }, // just outside 3 days
    ];
    expect(ids(getCandidates(MENUS, settings(), history, NOW))).toEqual(['b', 'c', 'd']);
  });

  it('respects a custom recentDays value', () => {
    const history: HistoryEntry[] = [{ menuId: 'a', decidedAt: at(2 * 24 * HOUR) }];
    expect(ids(getCandidates(MENUS, settings({ recentDays: 1 }), history, NOW))).toContain('a');
    expect(ids(getCandidates(MENUS, settings({ recentDays: 7 }), history, NOW))).not.toContain('a');
  });

  it('drops menus rejected this session', () => {
    expect(ids(getCandidates(MENUS, settings(), [], NOW, ['c']))).toEqual(['a', 'b', 'd']);
  });

  it('returns an empty list when everything is filtered out', () => {
    const history: HistoryEntry[] = [{ menuId: 'c', decidedAt: at(HOUR) }];
    expect(getCandidates(MENUS, settings({ excludedIds: ['a', 'b'] }), history, NOW, ['d'])).toEqual([]);
  });
});

describe('sampleMenus', () => {
  const seeded = (seed: number) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const many = Array.from({ length: 35 }, (_, i) => i);

  it('caps the sample at count', () => {
    expect(sampleMenus(many, 10, seeded(1))).toHaveLength(10);
  });

  it('returns everything when there are fewer items than count', () => {
    expect(sampleMenus([1, 2, 3], 10, seeded(1)).sort()).toEqual([1, 2, 3]);
  });

  it('never repeats an item and only uses input items', () => {
    const sample = sampleMenus(many, 10, seeded(42));
    expect(new Set(sample).size).toBe(10);
    for (const x of sample) expect(many).toContain(x);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4];
    sampleMenus(input, 2, seeded(7));
    expect(input).toEqual([1, 2, 3, 4]);
  });
});
