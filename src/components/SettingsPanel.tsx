const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

type Props = {
  recentDays: number;
  onChangeRecentDays: (days: number) => void;
};

export default function SettingsPanel({ recentDays, onChangeRecentDays }: Props) {
  return (
    <section className="settings">
      <h3 className="section-title">최근 먹은 메뉴 제외 기간</h3>
      <div className="segmented">
        {DAY_OPTIONS.map((d) => (
          <button
            type="button"
            key={d}
            aria-pressed={d === recentDays}
            className={d === recentDays ? 'is-active' : ''}
            onClick={() => onChangeRecentDays(d)}
          >
            {d}일
          </button>
        ))}
      </div>
      <p className="hint">최근 {recentDays}일 안에 결정한 메뉴는 룰렛에 나오지 않아요.</p>
    </section>
  );
}
