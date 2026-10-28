import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HistoryEntry, Menu, Settings } from './types';
import { DEFAULT_MENUS } from './data/defaultMenus';
import { getCandidates, sampleMenus } from './lib/candidates';
import { computeTargetRotation, randomJitter } from './lib/wheel';
import { usePersistentState } from './hooks/usePersistentState';
import Wheel from './components/Wheel';
import ResultCard from './components/ResultCard';
import MenuManager from './components/MenuManager';
import SettingsPanel from './components/SettingsPanel';
import HistoryList from './components/HistoryList';
import './App.css';

type Tab = 'roulette' | 'menus' | 'history';

const WHEEL_SIZE = 10;
const HISTORY_KEEP_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_SETTINGS: Settings = { excludedIds: [], recentDays: 3 };

export default function App() {
  const [tab, setTab] = useState<Tab>('roulette');
  const [customMenus, setCustomMenus] = usePersistentState<Menu[]>('customMenus', []);
  const [settings, setSettings] = usePersistentState<Settings>('settings', DEFAULT_SETTINGS);
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('history', () => []);

  // Session-only state
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pending, setPending] = useState<Menu | null>(null);
  const [result, setResult] = useState<Menu | null>(null);
  const [decided, setDecided] = useState(false);

  const allMenus = useMemo(() => [...customMenus, ...DEFAULT_MENUS], [customMenus]);
  const menusById = useMemo(() => new Map(allMenus.map((m) => [m.id, m])), [allMenus]);

  const candidatesFor = useCallback(
    (rejected: string[]) => getCandidates(allMenus, settings, history, new Date(), rejected),
    [allMenus, settings, history],
  );
  const candidates = useMemo(() => candidatesFor(rejectedIds), [candidatesFor, rejectedIds]);

  const [wheelMenus, setWheelMenus] = useState<Menu[]>(() => sampleMenus(candidates, WHEEL_SIZE));
  const idle = !spinning && result === null;

  // Drop history older than 30 days once on load.
  useEffect(() => {
    const cutoff = Date.now() - HISTORY_KEEP_MS;
    setHistory((h) => h.filter((e) => new Date(e.decidedAt).getTime() > cutoff));
  }, [setHistory]);

  // Re-sample the wheel when the candidate pool changes, but never mid-spin or while a result is shown.
  useEffect(() => {
    if (idle) setWheelMenus(sampleMenus(candidates, WHEEL_SIZE));
  }, [candidates, idle]);

  function spinOn(menus: Menu[]) {
    if (menus.length === 0) return;
    const index = Math.floor(Math.random() * menus.length);
    setRotation((r) => computeTargetRotation(r, index, menus.length, randomJitter(menus.length)));
    setPending(menus[index]);
    setSpinning(true);
  }

  function handleSpinEnd() {
    setSpinning(false);
    setResult(pending);
  }

  function handleDecide() {
    if (!result) return;
    setHistory((h) => [...h, { menuId: result.id, decidedAt: new Date().toISOString() }]);
    setRejectedIds([]);
    setDecided(true);
  }

  function handleRespin() {
    if (!result) return;
    let rejected = [...rejectedIds, result.id];
    let pool = candidatesFor(rejected);
    if (pool.length === 0) {
      // Everything has been turned down this session: start over.
      rejected = [];
      pool = candidatesFor(rejected);
    }
    const next = sampleMenus(pool, WHEEL_SIZE);
    setRejectedIds(rejected);
    setWheelMenus(next);
    setResult(null);
    spinOn(next);
  }

  function handleRestart() {
    setResult(null);
    setDecided(false);
  }

  function toggleExclude(id: string) {
    setSettings((s) => ({
      ...s,
      excludedIds: s.excludedIds.includes(id)
        ? s.excludedIds.filter((x) => x !== id)
        : [...s.excludedIds, id],
    }));
  }

  function addMenu(name: string, emoji: string) {
    const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    setCustomMenus((ms) => [...ms, { id, name, emoji, isCustom: true }]);
  }

  function deleteMenu(id: string) {
    setCustomMenus((ms) => ms.filter((m) => m.id !== id));
    setSettings((s) => ({ ...s, excludedIds: s.excludedIds.filter((x) => x !== id) }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>오늘 뭐 먹지? 🎡</h1>
      </header>

      <main className="app-main">
        {tab === 'roulette' && (
          <div className="roulette">
            {wheelMenus.length === 0 ? (
              <div className="empty">
                <p className="empty-emoji">🤔</p>
                <p>후보가 없어요.</p>
                <p className="hint">제외 기간을 줄이거나 메뉴 관리에서 제외를 해제해 보세요.</p>
              </div>
            ) : (
              <Wheel menus={wheelMenus} rotation={rotation} onSpinEnd={handleSpinEnd} />
            )}

            {result ? (
              <ResultCard
                menu={result}
                decided={decided}
                onDecide={handleDecide}
                onRespin={handleRespin}
                onRestart={handleRestart}
              />
            ) : (
              <div className="controls">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => spinOn(wheelMenus)}
                  disabled={spinning || wheelMenus.length === 0}
                >
                  {spinning ? '두근두근…' : '돌리기'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setWheelMenus(sampleMenus(candidates, WHEEL_SIZE))}
                  disabled={spinning || candidates.length <= WHEEL_SIZE}
                >
                  후보 섞기
                </button>
                <p className="hint">
                  후보 {candidates.length}개 중 {wheelMenus.length}개가 룰렛에 올라갔어요.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'menus' && (
          <MenuManager
            menus={allMenus}
            excludedIds={settings.excludedIds}
            onToggleExclude={toggleExclude}
            onAdd={addMenu}
            onDelete={deleteMenu}
          />
        )}

        {tab === 'history' && (
          <div className="panel">
            <SettingsPanel
              recentDays={settings.recentDays}
              onChangeRecentDays={(d) => setSettings((s) => ({ ...s, recentDays: d }))}
            />
            <HistoryList history={history} menusById={menusById} onClear={() => setHistory([])} />
          </div>
        )}
      </main>

      <nav className="tabbar" aria-label="화면 전환">
        {(
          [
            ['roulette', '🎡', '룰렛'],
            ['menus', '📋', '메뉴 관리'],
            ['history', '🕒', '기록·설정'],
          ] as const
        ).map(([key, icon, text]) => (
          <button
            type="button"
            key={key}
            className={tab === key ? 'is-active' : ''}
            onClick={() => setTab(key)}
            disabled={spinning}
            aria-current={tab === key ? 'page' : undefined}
          >
            <span aria-hidden>{icon}</span>
            {text}
          </button>
        ))}
      </nav>
    </div>
  );
}
