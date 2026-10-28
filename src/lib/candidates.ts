import type { HistoryEntry, Menu, Settings } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Menus eligible for the wheel after exclusions, recent decisions and session rejections. */
export function getCandidates(
  menus: Menu[],
  settings: Settings,
  history: HistoryEntry[],
  now: Date,
  rejectedIds: string[] = [],
): Menu[] {
  const excluded = new Set(settings.excludedIds);
  const cutoff = now.getTime() - settings.recentDays * DAY_MS;
  const recent = new Set(
    history.filter((h) => new Date(h.decidedAt).getTime() > cutoff).map((h) => h.menuId),
  );
  const rejected = new Set(rejectedIds);
  return menus.filter((m) => !excluded.has(m.id) && !recent.has(m.id) && !rejected.has(m.id));
}

/** Fisher–Yates shuffle, then take the first `count`. */
export function sampleMenus<T>(items: T[], count = 10, rng: () => number = Math.random): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}
