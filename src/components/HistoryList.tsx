import type { HistoryEntry, Menu } from '../types';

type Props = {
  history: HistoryEntry[];
  menusById: Map<string, Menu>;
  onClear: () => void;
};

const fmt = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default function HistoryList({ history, menusById, onClear }: Props) {
  const sorted = [...history].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));

  return (
    <section>
      <div className="section-head">
        <h3 className="section-title">최근 결정한 메뉴</h3>
        {sorted.length > 0 && (
          <button
            type="button"
            className="text-btn"
            onClick={() => confirm('결정 기록을 모두 지울까요?') && onClear()}
          >
            기록 초기화
          </button>
        )}
      </div>
      {sorted.length === 0 ? (
        <p className="hint">아직 기록이 없어요. 룰렛을 돌리고 "이걸로 결정"을 눌러 보세요.</p>
      ) : (
        <ul className="history-list">
          {sorted.map((h) => {
            const m = menusById.get(h.menuId);
            return (
              <li key={h.decidedAt + h.menuId} className="history-row">
                <span className="menu-emoji">{m?.emoji ?? '❔'}</span>
                <span className="menu-name">{m?.name ?? '(삭제된 메뉴)'}</span>
                <time dateTime={h.decidedAt}>{fmt.format(new Date(h.decidedAt))}</time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
