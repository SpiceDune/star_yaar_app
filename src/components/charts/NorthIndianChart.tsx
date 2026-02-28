import type { ChartData, RashiId, GrahaId } from '@/lib/types';
import { PLANET_COLORS, GRAHA_ABBREV, RASHI_ENGLISH } from '@/lib/constants';
import { cn } from '@/lib/utils';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const P = 20;
const S = 460;
type Pt = { x: number; y: number };
const TL: Pt = { x: P, y: P };
const TR: Pt = { x: P + S, y: P };
const BL: Pt = { x: P, y: P + S };
const BR: Pt = { x: P + S, y: P + S };
const T: Pt  = { x: P + S / 2, y: P };
const L: Pt  = { x: P, y: P + S / 2 };
const B: Pt  = { x: P + S / 2, y: P + S };
const R: Pt  = { x: P + S, y: P + S / 2 };

interface HouseLayout { signPos: Pt; planetPos: Pt; isCorner: boolean }

const H: Record<number, HouseLayout> = {
  1:  { signPos: { x: 250, y: 100 },  planetPos: { x: 250, y: 150 }, isCorner: false },
  2:  { signPos: { x: 135, y: 52 },   planetPos: { x: 135, y: 88 },  isCorner: true },
  3:  { signPos: { x: 65, y: 120 },   planetPos: { x: 65, y: 152 },  isCorner: true },
  4:  { signPos: { x: 135, y: 225 },  planetPos: { x: 135, y: 268 }, isCorner: false },
  5:  { signPos: { x: 65, y: 355 },   planetPos: { x: 65, y: 385 },  isCorner: true },
  6:  { signPos: { x: 135, y: 422 },  planetPos: { x: 135, y: 452 }, isCorner: true },
  7:  { signPos: { x: 250, y: 345 },  planetPos: { x: 250, y: 385 }, isCorner: false },
  8:  { signPos: { x: 365, y: 422 },  planetPos: { x: 365, y: 452 }, isCorner: true },
  9:  { signPos: { x: 435, y: 355 },  planetPos: { x: 435, y: 385 }, isCorner: true },
  10: { signPos: { x: 365, y: 225 },  planetPos: { x: 365, y: 268 }, isCorner: false },
  11: { signPos: { x: 435, y: 120 },  planetPos: { x: 435, y: 152 }, isCorner: true },
  12: { signPos: { x: 365, y: 52 },   planetPos: { x: 365, y: 88 },  isCorner: true },
};

function pts(ps: Pt[]): string { return ps.map(p => `${p.x},${p.y}`).join(' '); }

interface Props {
  chartData: ChartData;
  compact?: boolean;
  large?: boolean;
  showEnglishSigns?: boolean;
  className?: string;
}

export default function NorthIndianChart({
  chartData, compact = false, large = false, showEnglishSigns = false, className,
}: Props) {
  const { houses, lagna } = chartData;

  const signSize = compact ? 8 : large ? 15 : 14;
  const numSize  = compact ? 7 : large ? 12 : 11;
  const ps       = compact ? 10 : large ? 18 : 16;
  const ds       = compact ? 6 : large ? 12 : 10;
  const lagnaFs  = compact ? 7 : large ? 13 : 11;

  const engName = (r: RashiId) => RASHI_ENGLISH[r] ?? r;
  const rNum    = (r: RashiId) => RASHI_ORDER.indexOf(r) + 1;
  const lagnaTitle = `${lagna} Lagna (${engName(lagna as RashiId)})`;

  return (
    <div className={cn(
      'w-full mx-auto',
      compact && 'max-w-[220px]',
      !compact && !large && 'max-w-[340px] md:max-w-[400px]',
      !compact && large && 'max-w-full',
      className,
    )}>
      <p className="font-display italic text-base md:text-lg text-stone-600 mb-2 leading-tight">
        {lagnaTitle}
      </p>

      <svg viewBox="0 0 500 500" className="w-full h-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <rect x={P} y={P} width={S} height={S} fill="#f8fafc" stroke="#475569" strokeWidth="2" rx="3" />
        <polygon points={pts([T, R, B, L])} fill="none" stroke="#475569" strokeWidth="1.5" />
        <line x1={TL.x} y1={TL.y} x2={BR.x} y2={BR.y} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="8 5" />
        <line x1={TR.x} y1={TR.y} x2={BL.x} y2={BL.y} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="8 5" />

        {([1,2,3,4,5,6,7,8,9,10,11,12] as const).map((h) => {
          const def = H[h];
          const data = houses[h];
          if (!def || !data) return null;
          const { rashi, planets } = data;

          const pCount = planets.length;
          const signYShift = def.isCorner && pCount >= 3 ? -12 : def.isCorner && pCount === 2 ? -5 : 0;

          return (
            <g key={h}>
              {showEnglishSigns ? (
                <text x={def.signPos.x} y={def.signPos.y + signYShift} textAnchor="middle" dominantBaseline="middle">
                  <tspan fontSize={signSize} fontWeight="600" fill="#b45309">{engName(rashi)}</tspan>
                  <tspan fontSize={numSize} fontWeight="500" fill="#d4956b" dx="3">({rNum(rashi)})</tspan>
                </text>
              ) : (
                <text x={def.signPos.x} y={def.signPos.y + signYShift} textAnchor="middle" dominantBaseline="middle"
                  fontSize={signSize} fontWeight="600" fill="#b45309">
                  {String(rashi)}
                </text>
              )}

              {h === 1 && (
                <text x={250} y={55} textAnchor="middle" dominantBaseline="middle"
                  fontSize={lagnaFs} fontWeight="700" fill="#6b7280" letterSpacing="3">
                  LAGNA
                </text>
              )}

              {pCount > 0 && (
                <PlanetGroup
                  planets={planets}
                  cx={def.planetPos.x}
                  cy={def.planetPos.y}
                  ps={ps}
                  ds={ds}
                  isCorner={def.isCorner}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PlanetGroup({ planets, cx, cy, ps, ds, isCorner }: {
  planets: Array<{ graha: GrahaId; degree: number; retrograde?: boolean }>;
  cx: number; cy: number; ps: number; ds: number; isCorner: boolean;
}) {
  const count = planets.length;

  const scaledPs = isCorner ? ps
                 : count >= 5 ? ps * 0.62
                 : count >= 4 ? ps * 0.70
                 : count >= 3 ? ps * 0.80
                 : ps;
  const scaledDs = isCorner ? ds
                 : count >= 4 ? ds * 0.65
                 : count >= 3 ? ds * 0.75
                 : ds;

  const renderOne = (p: { graha: GrahaId; degree: number; retrograde?: boolean }, x: number, y: number, size: number, degSize: number) => {
    const color = PLANET_COLORS[p.graha];
    const deg = String(p.degree).padStart(2, '0');
    return (
      <g key={p.graha}>
        <title>{`${p.graha} ${p.degree}°${p.retrograde ? ' (Retrograde)' : ''}`}</title>
        <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={color}>
          {GRAHA_ABBREV[p.graha]}
          {p.retrograde && <tspan fontSize={size * 0.6} fontWeight="800" dx={1} dy={-size * 0.3}>*</tspan>}
          <tspan fontSize={degSize} dy={p.retrograde ? 0 : -size * 0.3} dx={1} fontWeight="600" fillOpacity={0.7}>
            {deg}
          </tspan>
        </text>
      </g>
    );
  };

  if (isCorner) {
    const vGap = ps + 2;
    const startY = cy - ((count - 1) * vGap) / 2;
    return (
      <g>
        {planets.slice(0, 6).map((p, i) =>
          renderOne(p, cx, startY + i * vGap, scaledPs, scaledDs)
        )}
      </g>
    );
  }

  if (count === 1) {
    return <g>{renderOne(planets[0], cx, cy, scaledPs, scaledDs)}</g>;
  }

  if (count === 2) {
    const gap = scaledPs > 14 ? 34 : 24;
    return (
      <g>
        {renderOne(planets[0], cx - gap, cy, scaledPs, scaledDs)}
        {renderOne(planets[1], cx + gap, cy, scaledPs, scaledDs)}
      </g>
    );
  }

  if (count === 3) {
    const gap = scaledPs > 10 ? 30 : 22;
    const vGap = scaledPs * 0.55;
    return (
      <g>
        {renderOne(planets[0], cx - gap, cy - vGap, scaledPs, scaledDs)}
        {renderOne(planets[1], cx + gap, cy - vGap, scaledPs, scaledDs)}
        {renderOne(planets[2], cx, cy + vGap, scaledPs, scaledDs)}
      </g>
    );
  }

  const cols = count >= 5 ? 3 : 2;
  const rowH = scaledPs + 3;
  const colW = count >= 5 ? scaledPs * 2.4 : scaledPs * 2.6;
  const rows = Math.ceil(Math.min(count, 9) / cols);
  const ox = cx - ((Math.min(count, cols) - 1) * colW) / 2;
  const oy = cy - ((rows - 1) * rowH) / 2;

  return (
    <g>
      {planets.slice(0, 9).map((p, i) =>
        renderOne(p, ox + (i % cols) * colW, oy + Math.floor(i / cols) * rowH, scaledPs, scaledDs)
      )}
    </g>
  );
}
