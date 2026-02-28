import { useState } from 'react';

const VIMSHOTTARI_SEQ = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const VIMSHOTTARI_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const MS_YEAR = 365.25 * 24 * 3600 * 1000;

const ICON_SVG: Record<string, string> = {
  Sun: '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.73-12.73l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Mars: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Mercury: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Jupiter: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Venus: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Saturn: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Rahu: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 12-4-4-4 4m4-4v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  Ketu: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12l4 4 4-4m-4 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

function PlanetIcon({ planet, size = 16 }: { planet: string; size?: number }) {
  const inner = ICON_SVG[planet] ?? '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <g dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}

function fmtDur(y: number): string {
  if (y >= 1) return `${y.toFixed(1)}y`;
  const m = y * 12;
  if (m >= 1) return `${Math.round(m)}m`;
  return `${Math.round(y * 365)}d`;
}

function fmtDate(ms: number): string {
  const dt = new Date(ms);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

export interface AntarEntry {
  planet: string;
  duration: string;
  startMs: number;
  endMs: number;
  start: string;
  end: string;
  isCurrent: boolean;
  mahaYears: number;
}

export interface MahaEntry {
  planet: string;
  years: number;
  start: string;
  end: string;
  isCurrent: boolean;
  antars: AntarEntry[];
}

interface PratyanEntry {
  planet: string;
  duration: string;
  start: string;
  end: string;
  isCurrent: boolean;
}

function computePratyantars(mahaYears: number, antarPlanet: string, antarStartMs: number, antarEndMs: number, nowMs: number): PratyanEntry[] {
  const antarIdx = VIMSHOTTARI_SEQ.indexOf(antarPlanet);
  const antarDurY = (antarEndMs - antarStartMs) / MS_YEAR;
  const results: PratyanEntry[] = [];
  let cursor = antarStartMs;

  for (let i = 0; i < 9; i++) {
    const idx = (antarIdx + i) % 9;
    const p = VIMSHOTTARI_SEQ[idx];
    const pY = VIMSHOTTARI_YEARS[p] ?? 0;
    const durY = (antarDurY * pY) / 120;
    const durMs = durY * MS_YEAR;
    const s = cursor;
    const e = cursor + durMs;
    results.push({
      planet: p,
      duration: fmtDur(durY),
      start: fmtDate(s),
      end: fmtDate(e),
      isCurrent: s <= nowMs && e > nowMs,
    });
    cursor = e;
  }
  return results;
}

interface Props {
  mahas: MahaEntry[];
  colors: Record<string, string>;
}

export default function DashaTimeline({ mahas, colors }: Props) {
  const currentIdx = mahas.findIndex(m => m.isCurrent);
  const [openMaha, setOpenMaha] = useState<number | null>(currentIdx >= 0 ? currentIdx : null);
  const [openAntar, setOpenAntar] = useState<string | null>(null);
  const nowMs = Date.now();

  return (
    <div className="relative pl-6 sm:pl-8">
      {/* Vertical timeline spine */}
      <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-px bg-slate-200" />

      {mahas.map((maha, i) => {
        const isOpen = openMaha === i;
        const col = colors[maha.planet] ?? '#334155';
        const isLast = i === mahas.length - 1;

        return (
          <div key={i} className={`relative ${!isLast ? 'pb-1' : ''}`}>
            {/* Timeline dot */}
            <div
              className={`absolute left-[-24px] sm:left-[-32px] top-3.5 rounded-full border-2 border-white z-10 ${maha.isCurrent ? 'w-5 h-5 -ml-[2px]' : 'w-3.5 h-3.5'}`}
              style={{ background: col, boxShadow: maha.isCurrent ? `0 0 0 3px ${col}30` : undefined }}
            />

            {/* Maha Dasha row */}
            <button
              onClick={() => { setOpenMaha(isOpen ? null : i); setOpenAntar(null); }}
              className={`w-full text-left cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-150 flex items-center gap-2 group ${
                maha.isCurrent
                  ? 'bg-blue-50/60 hover:bg-blue-50'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[15px] font-extrabold tracking-tight inline-flex items-center gap-1.5" style={{ color: col }}>
                    <PlanetIcon planet={maha.planet} size={16} />{maha.planet}
                  </span>
                  <span className="text-sm font-bold text-slate-500">{maha.years}y</span>
                  {maha.isCurrent && (
                    <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full tracking-wide leading-none">Active</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{maha.start} — {maha.end}</p>
              </div>
              <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded: Antardasha sub-periods */}
            {isOpen && (
              <div className="ml-3 mt-1 mb-2 pl-4 border-l-2 border-slate-200/80">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Antardasha</p>
                {maha.antars.map((a, j) => {
                  const ac = colors[a.planet] ?? '#334155';
                  const antarKey = `${i}-${j}`;
                  const isAntarOpen = openAntar === antarKey;
                  const pratyantars = isAntarOpen ? computePratyantars(maha.years, a.planet, a.startMs, a.endMs, nowMs) : [];

                  return (
                    <div key={j}>
                      <button
                        onClick={() => setOpenAntar(isAntarOpen ? null : antarKey)}
                        className={`w-full flex items-center gap-2.5 py-2 text-left cursor-pointer rounded-md px-1.5 transition-colors ${a.isCurrent ? 'bg-emerald-50 hover:bg-emerald-100/70' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ac }} />
                        <span className="text-sm font-bold inline-flex items-center gap-1" style={{ color: ac }}>
                          <PlanetIcon planet={a.planet} size={14} />{a.planet}
                        </span>
                        {a.isCurrent && (
                          <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-full tracking-wide leading-none">Now</span>
                        )}
                        <span className="text-xs font-bold text-slate-600 ml-auto shrink-0">{a.duration}</span>
                        <span className="hidden sm:inline text-xs text-slate-500 font-semibold shrink-0">{a.start} – {a.end}</span>
                        <svg className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${isAntarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Mobile date */}
                      {!isAntarOpen && (
                        <p className="sm:hidden text-[11px] font-medium text-slate-500 pl-6 -mt-1 mb-1">{a.start} – {a.end}</p>
                      )}

                      {isAntarOpen && (
                        <div className="ml-8 pl-3 border-l-2 border-slate-200/80 mb-2 mt-0.5">
                          <p className="sm:hidden text-xs font-semibold text-slate-500 mb-1.5">{a.start} – {a.end}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pratyantardasha</p>
                          {pratyantars.map((pr, k) => {
                            const pc = colors[pr.planet] ?? '#334155';
                            return (
                              <div key={k} className={`py-1.5 rounded-md ${pr.isCurrent ? 'bg-emerald-50 px-1.5' : ''} ${k < pratyantars.length - 1 ? 'border-b border-slate-100/80' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: pc }} />
                                  <span className="text-[12px] font-bold flex-1 inline-flex items-center gap-1" style={{ color: pc }}>
                                    <PlanetIcon planet={pr.planet} size={12} />{pr.planet}
                                    {pr.isCurrent && <span className="ml-1 text-[8px] font-bold uppercase bg-emerald-500 text-white px-1 py-px rounded-full">Now</span>}
                                  </span>
                                  <span className="text-[12px] font-bold text-slate-600 shrink-0">{pr.duration}</span>
                                  <span className="hidden sm:inline text-[11px] text-slate-500 font-semibold shrink-0">{pr.start} – {pr.end}</span>
                                </div>
                                <p className="sm:hidden text-[11px] text-slate-500 font-medium pl-4 mt-0.5">{pr.start} – {pr.end}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
