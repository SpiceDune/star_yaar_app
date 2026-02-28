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

interface HouseDef { signPos: Pt; planetPos: Pt }

// Sign always above planet (lower y), both sharing the same x center (house centroid).
const H: Record<number, HouseDef> = {
  1:  { signPos: { x: 250, y: 100 },  planetPos: { x: 250, y: 145 } },
  2:  { signPos: { x: 150, y: 48 },   planetPos: { x: 150, y: 82 } },
  3:  { signPos: { x: 68, y: 122 },   planetPos: { x: 68, y: 155 } },
  4:  { signPos: { x: 135, y: 228 },  planetPos: { x: 135, y: 265 } },
  5:  { signPos: { x: 68, y: 348 },   planetPos: { x: 68, y: 378 } },
  6:  { signPos: { x: 150, y: 420 },  planetPos: { x: 150, y: 452 } },
  7:  { signPos: { x: 250, y: 345 },  planetPos: { x: 250, y: 380 } },
  8:  { signPos: { x: 355, y: 420 },  planetPos: { x: 355, y: 452 } },
  9:  { signPos: { x: 435, y: 348 },  planetPos: { x: 435, y: 378 } },
  10: { signPos: { x: 365, y: 228 },  planetPos: { x: 365, y: 265 } },
  11: { signPos: { x: 435, y: 122 },  planetPos: { x: 435, y: 155 } },
  12: { signPos: { x: 355, y: 48 },   planetPos: { x: 355, y: 82 } },
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

  const signSize = compact ? 8 : large ? 12 : 10;
  const numSize  = compact ? 7 : large ? 10 : 8;
  const ps       = compact ? 10 : large ? 16 : 13;
  const ds       = compact ? 6 : large ? 9 : 7;
  const lagnaFs  = compact ? 7 : large ? 11 : 8;

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
        {/* Outer square */}
        <rect x={P} y={P} width={S} height={S} fill="#f8fafc" stroke="#475569" strokeWidth="2" rx="3" />

        {/* Inner diamond — solid */}
        <polygon points={pts([T, R, B, L])} fill="none" stroke="#475569" strokeWidth="1.5" />

        {/* Diagonals — dashed */}
        <line x1={TL.x} y1={TL.y} x2={BR.x} y2={BR.y} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="8 5" />
        <line x1={TR.x} y1={TR.y} x2={BL.x} y2={BL.y} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="8 5" />

        {([1,2,3,4,5,6,7,8,9,10,11,12] as const).map((h) => {
          const def = H[h];
          const data = houses[h];
          if (!def || !data) return null;
          const { rashi, planets } = data;

          return (
            <g key={h}>
              {showEnglishSigns ? (
                <text x={def.signPos.x} y={def.signPos.y} textAnchor="middle" dominantBaseline="middle">
                  <tspan fontSize={signSize} fontWeight="600" fill="#b45309">{engName(rashi)}</tspan>
                  <tspan fontSize={numSize} fontWeight="500" fill="#d4956b" dx="3">({rNum(rashi)})</tspan>
                </text>
              ) : (
                <text x={def.signPos.x} y={def.signPos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={signSize} fontWeight="600" fill="#b45309">
                  {String(rashi)}
                </text>
              )}

              {h === 1 && (
                <text x={250} y={58} textAnchor="middle" dominantBaseline="middle"
                  fontSize={lagnaFs} fontWeight="700" fill="#6b7280" letterSpacing="3">
                  LAGNA
                </text>
              )}

              {planets.length > 0 && (
                <PlanetGroup planets={planets} cx={def.planetPos.x} cy={def.planetPos.y} ps={ps} ds={ds} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PlanetGroup({ planets, cx, cy, ps, ds }: {
  planets: Array<{ graha: GrahaId; degree: number; retrograde?: boolean }>;
  cx: number; cy: number; ps: number; ds: number;
}) {
  const renderOne = (p: { graha: GrahaId; degree: number; retrograde?: boolean }, x: number, y: number, size: number) => {
    const color = PLANET_COLORS[p.graha];
    const deg = String(p.degree).padStart(2, '0');
    return (
      <g key={p.graha}>
        <title>{`${p.graha} ${p.degree}°${p.retrograde ? ' (Retrograde)' : ''}`}</title>
        <text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={color}>
          {GRAHA_ABBREV[p.graha]}
          {p.retrograde && <tspan fontSize={size * 0.6} fontWeight="800" dx={1} dy={-size * 0.3}>*</tspan>}
          <tspan fontSize={ds} dy={p.retrograde ? 0 : -size * 0.3} dx={1} fontWeight="600" fillOpacity={0.7}>
            {deg}
          </tspan>
        </text>
      </g>
    );
  };

  if (planets.length === 1) {
    return <g>{renderOne(planets[0], cx, cy, ps)}</g>;
  }

  if (planets.length === 2) {
    const gap = ps > 14 ? 30 : 22;
    return (
      <g>
        {renderOne(planets[0], cx - gap, cy, ps)}
        {renderOne(planets[1], cx + gap, cy, ps)}
      </g>
    );
  }

  const cols = 2;
  const rowH = ps + 4;
  const colW = ps > 14 ? 38 : 30;
  const ox = cx - ((Math.min(planets.length, cols) - 1) * colW) / 2;
  const oy = cy - ((Math.ceil(Math.min(planets.length, 6) / cols) - 1) * rowH) / 2;

  return (
    <g>
      {planets.slice(0, 6).map((p, i) =>
        renderOne(p, ox + (i % cols) * colW, oy + Math.floor(i / cols) * rowH, ps - 2)
      )}
    </g>
  );
}
