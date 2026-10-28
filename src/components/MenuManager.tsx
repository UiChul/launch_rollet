import { useState, type FormEvent } from 'react';
import type { Menu } from '../types';

type Props = {
  menus: Menu[];
  excludedIds: string[];
  onToggleExclude: (id: string) => void;
  onAdd: (name: string, emoji: string) => void;
  onDelete: (id: string) => void;
};

const MAX_NAME = 20;
const DEFAULT_EMOJI = '🍽️';

const firstGrapheme = (s: string) =>
  [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(s.trim())][0]?.segment ?? '';

export default function MenuManager({ menus, excludedIds, onToggleExclude, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');
  const excluded = new Set(excludedIds);
  const custom = menus.filter((m) => m.isCustom);
  const defaults = menus.filter((m) => !m.isCustom);
  const included = menus.filter((m) => !excluded.has(m.id)).length;

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('메뉴 이름을 입력해 주세요.');
    if (menus.some((m) => m.name.toLowerCase() === trimmed.toLowerCase()))
      return setError('이미 있는 메뉴예요.');
    onAdd(trimmed, firstGrapheme(emoji) || DEFAULT_EMOJI);
    setName('');
    setEmoji('');
    setError('');
  }

  const row = (m: Menu) => (
    <li key={m.id} className={`menu-row${excluded.has(m.id) ? ' is-excluded' : ''}`}>
      <label className="menu-toggle">
        <input type="checkbox" checked={!excluded.has(m.id)} onChange={() => onToggleExclude(m.id)} />
        <span className="menu-emoji">{m.emoji}</span>
        <span className="menu-name">{m.name}</span>
      </label>
      {m.isCustom && (
        <button type="button" className="icon-btn" onClick={() => onDelete(m.id)} aria-label={`${m.name} 삭제`}>
          ✕
        </button>
      )}
    </li>
  );

  return (
    <div className="panel">
      <form className="add-form" onSubmit={submit}>
        <input
          className="input emoji-input"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder={DEFAULT_EMOJI}
          aria-label="이모지 (선택)"
        />
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME}
          placeholder="메뉴 이름 (예: 부대찌개)"
          aria-label="메뉴 이름"
        />
        <button className="btn btn-primary" type="submit">
          추가
        </button>
      </form>
      {error && <p className="form-error">{error}</p>}

      <p className="hint">
        체크된 메뉴만 룰렛에 들어가요. ({included}/{menus.length}개 포함)
      </p>

      {custom.length > 0 && (
        <>
          <h3 className="section-title">직접 추가한 메뉴</h3>
          <ul className="menu-list">{custom.map(row)}</ul>
        </>
      )}
      <h3 className="section-title">기본 메뉴</h3>
      <ul className="menu-list">{defaults.map(row)}</ul>
    </div>
  );
}
