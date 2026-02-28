import { useState, useCallback } from 'react';
import type { ChartData, GrahaId, RashiId } from '@/lib/types';
import { PLANET_COLORS, RASHI_ENGLISH } from '@/lib/constants';
import NorthIndianChart from '@/components/charts/NorthIndianChart';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];
const PLANET_ORDER: GrahaId[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

interface TransitPlanet {
  graha: GrahaId;
  transitRashi: RashiId;
  transitDegree: number;
  retrograde: boolean;
  natalHouse: number;
  quality: 'good' | 'neutral' | 'challenging';
  brief: string;
}

interface TransitResult {
  date: string;
  planets: TransitPlanet[];
}

interface Props {
  initialTransit: TransitResult | null;
  natalLagna: RashiId;
}

function transitToChartData(result: TransitResult, lagna: RashiId): ChartData {
  const lagnaIdx = RASHI_ORDER.indexOf(lagna);
  const houses: ChartData['houses'] = {} as ChartData['houses'];
  for (let i = 1; i <= 12; i++) {
    const rashiIdx = (lagnaIdx + i - 1) % 12;
    houses[i] = { rashi: RASHI_ORDER[rashiIdx], planets: [] };
  }
  for (const tp of result.planets) {
    if (houses[tp.natalHouse]) {
      houses[tp.natalHouse].planets.push({
        graha: tp.graha,
        degree: tp.transitDegree,
        retrograde: tp.retrograde,
      });
    }
  }
  return { lagna, houses, chartName: 'Transit', chartType: 'Gochar' };
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function TransitSection({ initialTransit, natalLagna }: Props) {
  const [transit, setTransit] = useState<TransitResult | null>(initialTransit);
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [isToday, setIsToday] = useState(true);

  const fetchTransit = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transit?date=${date}&lagna=${natalLagna}`);
      if (res.ok) {
        const data: TransitResult = await res.json();
        setTransit(data);
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, [natalLagna]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    const today = toInputDate(new Date());
    setIsToday(val === today);
    fetchTransit(val);
  };

  const goToday = () => {
    const today = toInputDate(new Date());
    setSelectedDate(today);
    setIsToday(true);
    fetchTransit(today);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    const next = toInputDate(d);
    setSelectedDate(next);
    setIsToday(next === toInputDate(new Date()));
    fetchTransit(next);
  };

  const chartData = transit ? transitToChartData(transit, natalLagna) : null;
  const sorted = transit ? [...transit.planets].sort(
    (a, b) => PLANET_ORDER.indexOf(a.graha) - PLANET_ORDER.indexOf(b.graha)
  ) : [];

  return (
    <div>
      {/* Date picker row */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button
          onClick={() => shiftDate(-1)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm font-bold"
          aria-label="Previous day"
        >
          &larr;
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
        <button
          onClick={() => shiftDate(1)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors text-sm font-bold"
          aria-label="Next day"
        >
          &rarr;
        </button>
        {!isToday && (
          <button
            onClick={goToday}
            className="rounded-lg bg-slate-800 text-white px-3 py-2 text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Today
          </button>
        )}
        {loading && (
          <span className="text-xs text-slate-400 font-medium animate-pulse ml-1">Loading...</span>
        )}
        {transit && (
          <span className="text-sm text-slate-500 font-medium ml-auto">{transit.date}</span>
        )}
      </div>

      {transit ? (
        <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
          {/* Transit chart */}
          {chartData && (
            <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-5">
              <div className="mx-auto max-w-lg">
                <NorthIndianChart chartData={chartData} showEnglishSigns />
              </div>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-slate-200/80 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Planet</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Transiting Sign</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Degree</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Your House</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tp, i) => {
                  const col = PLANET_COLORS[tp.graha] ?? '#334155';
                  return (
                    <tr key={tp.graha} className={i < sorted.length - 1 ? 'border-b border-slate-100' : ''}>
                      <td className="px-5 py-3">
                        <span className="font-bold inline-flex items-center gap-1.5" style={{ color: col }}>
                          {tp.graha}
                          {tp.retrograde && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">R</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-700">{RASHI_ENGLISH[tp.transitRashi] ?? tp.transitRashi}</span>
                      </td>
                      <td className="px-5 py-3 text-center font-mono font-semibold text-slate-700">{String(tp.transitDegree).padStart(2, '0')}°</td>
                      <td className="px-5 py-3 text-center font-bold text-slate-600">H{tp.natalHouse}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {sorted.map(tp => {
              const col = PLANET_COLORS[tp.graha] ?? '#334155';
              return (
                <div key={tp.graha} className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm inline-flex items-center gap-1.5" style={{ color: col }}>
                        {tp.graha}
                        {tp.retrograde && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">R</span>}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{RASHI_ENGLISH[tp.transitRashi] ?? tp.transitRashi} {tp.transitDegree}° → House {tp.natalHouse}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
          <p className="text-sm font-bold text-slate-600">Transit data unavailable</p>
          <p className="text-xs text-slate-500 mt-1">Could not compute current planetary positions</p>
        </div>
      )}
    </div>
  );
}
