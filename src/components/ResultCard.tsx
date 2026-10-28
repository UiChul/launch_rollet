import type { Menu } from '../types';
import { kakaoMapUrl, naverMapUrl } from '../lib/links';

type Props = {
  menu: Menu;
  decided: boolean;
  onDecide: () => void;
  onRespin: () => void;
  onRestart: () => void;
};

export default function ResultCard({ menu, decided, onDecide, onRespin, onRestart }: Props) {
  return (
    <section className="result" aria-live="polite">
      <div className="result-emoji">{menu.emoji}</div>
      <p className="result-caption">{decided ? '오늘은 이걸로! 맛있게 드세요' : '오늘의 메뉴는'}</p>
      <h2 className="result-name">{menu.name}</h2>

      {decided ? (
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          처음으로
        </button>
      ) : (
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={onDecide}>
            이걸로 결정
          </button>
          <button type="button" className="btn btn-secondary" onClick={onRespin}>
            다시 돌리기
          </button>
        </div>
      )}

      <div className="link-row">
        <a className="link-btn naver" href={naverMapUrl(menu.name)} target="_blank" rel="noreferrer">
          네이버지도에서 찾기
        </a>
        <a className="link-btn kakao" href={kakaoMapUrl(menu.name)} target="_blank" rel="noreferrer">
          카카오맵에서 찾기
        </a>
      </div>
    </section>
  );
}
