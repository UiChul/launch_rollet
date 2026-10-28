import type { Menu } from '../types';

const SIZE = 300;
const C = SIZE / 2;
const R = C - 4;
const COLORS = ['#ffb4a2', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#bdb2ff'];
const MAX_LABEL = 6;

type Props = {
  menus: Menu[];
  rotation: number;
  onSpinEnd: () => void;
};

// Point on the rim at `deg` clockwise from 12 o'clock.
const polar = (deg: number, r = R) => {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)] as const;
};

function segmentPath(start: number, end: number) {
  const [x1, y1] = polar(start);
  const [x2, y2] = polar(end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

function colorFor(i: number, n: number) {
  // Avoid the last segment sharing a color with the first one.
  if (i === n - 1 && n > 1 && i % COLORS.length === 0) return COLORS[2];
  return COLORS[i % COLORS.length];
}

const label = (name: string) =>
  name.length > MAX_LABEL ? `${name.slice(0, MAX_LABEL - 1)}…` : name;

export default function Wheel({ menus, rotation, onSpinEnd }: Props) {
  const n = menus.length;
  const step = 360 / Math.max(n, 1);

  return (
    <div className="wheel">
      <div className="wheel-pointer" aria-hidden />
      <svg
        className="wheel-disc"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={(e) => e.propertyName === 'transform' && onSpinEnd()}
        role="img"
        aria-label={`룰렛 후보: ${menus.map((m) => m.name).join(', ')}`}
      >
        {n === 1 ? (
          <circle cx={C} cy={C} r={R} fill={COLORS[0]} />
        ) : (
          menus.map((m, i) => (
            <path key={m.id} d={segmentPath(i * step, (i + 1) * step)} fill={colorFor(i, n)} />
          ))
        )}
        {menus.map((m, i) => {
          const center = (i + 0.5) * step;
          const nameY = C - R * 0.48;
          return (
            <g key={m.id} transform={`rotate(${center} ${C} ${C})`}>
              <text x={C} y={C - R * 0.84} className="wheel-emoji">
                {m.emoji}
              </text>
              <text x={C} y={nameY} className="wheel-label" transform={`rotate(-90 ${C} ${nameY})`}>
                {label(m.name)}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R} className="wheel-rim" />
        <circle cx={C} cy={C} r={18} className="wheel-hub" />
      </svg>
    </div>
  );
}
