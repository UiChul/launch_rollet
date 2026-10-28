export type Menu = { id: string; name: string; emoji: string; isCustom: boolean };
export type Settings = { excludedIds: string[]; recentDays: number };
export type HistoryEntry = { menuId: string; decidedAt: string }; // ISO
